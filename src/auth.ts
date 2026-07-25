import NextAuth from 'next-auth';
import Keycloak from 'next-auth/providers/keycloak';
import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { users } from '@/db/schema';

if (!process.env.AUTH_URL && !process.env.NEXTAUTH_URL) {
    const defaultUrl = process.env.NODE_ENV === 'production'
        ? 'https://mycoursereviews.csclub.org.au'
        : 'http://localhost:3200';
    process.env.AUTH_URL = defaultUrl;
    process.env.NEXTAUTH_URL = defaultUrl;
}

declare module 'next-auth' {
    interface Session {
        accessToken?: string;
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            role: 'admin' | 'user';
        };
    }
}

export function resolveKeycloakUrl(url?: string, issuer?: string) {
    if (url) return url;
    if (issuer) {
        try {
            return new URL(issuer).origin;
        } catch {}
    }
    return 'https://auth.csclub.org.au';
}

export function resolveAuthRealm(realm?: string, issuer?: string) {
    if (realm) return realm;
    if (issuer) {
        const parts = issuer.split('/realms/');
        if (parts.length > 1) return parts[1].replace(/\/$/, '');
    }
    return 'cs-club';
}

export function resolveChecks(nodeEnv?: string, skipEnv?: string): ('state' | 'pkce')[] {
    return nodeEnv === 'test' || skipEnv === 'true' ? [] : ['state'];
}

function extractRoles(account: any, profile?: any): string[] {
    const rolesSet = new Set<string>();
    
    // 1. Extract from decoded access token if present
    if (account?.access_token) {
        try {
            const decoded = JSON.parse(Buffer.from(account.access_token.split('.')[1], 'base64').toString());
            const realmAccessRoles = decoded?.realm_access?.roles || [];
            const tokenRoles = decoded?.roles || [];
            realmAccessRoles.forEach((r: string) => rolesSet.add(r));
            tokenRoles.forEach((r: string) => rolesSet.add(r));
        } catch (e) {
            console.error('Error decoding access token for roles:', e);
        }
    }
    
    // 2. Fallback to profile realm_access and roles
    if (profile) {
        const realmAccessRoles = (profile as any)?.realm_access?.roles || [];
        const profileRoles = (profile as any)?.roles || [];
        realmAccessRoles.forEach((r: string) => rolesSet.add(r));
        profileRoles.forEach((r: string) => rolesSet.add(r));
    }
    
    return Array.from(rolesSet);
}

const containerKeycloakEndpoint = resolveKeycloakUrl(
    process.env.NEXT_PUBLIC_CONTAINER_KEYCLOAK_ENDPOINT || process.env.NEXT_PUBLIC_LOCAL_KEYCLOAK_URL,
    process.env.KEYCLOAK_ISSUER
);
const localKeycloakUrl = resolveKeycloakUrl(
    process.env.NEXT_PUBLIC_LOCAL_KEYCLOAK_URL,
    process.env.KEYCLOAK_ISSUER
);
const authRealm = resolveAuthRealm(process.env.NEXT_PUBLIC_AUTH_REALM, process.env.KEYCLOAK_ISSUER);

export const { handlers, signIn, signOut, auth } = NextAuth({
    secret: process.env.AUTH_SECRET,
    providers: [
        Keycloak({
            checks: resolveChecks(process.env.NODE_ENV, process.env.SKIP_ENV_VALIDATION),
            clientId: process.env.KEYCLOAK_CLIENT_ID || process.env.AUTH_KEYCLOAK_ID!,
            clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || process.env.AUTH_KEYCLOAK_SECRET!,
            issuer: `${localKeycloakUrl}/realms/${authRealm}`,
            jwks_endpoint: `${containerKeycloakEndpoint}/realms/${authRealm}/protocol/openid-connect/certs`,
            wellKnown: undefined,
            authorization: {
                params: {
                    scope: 'openid email profile',
                },
                url: `${localKeycloakUrl}/realms/${authRealm}/protocol/openid-connect/auth`,
            },
            token: `${containerKeycloakEndpoint}/realms/${authRealm}/protocol/openid-connect/token`,
            userinfo: `${containerKeycloakEndpoint}/realms/${authRealm}/protocol/openid-connect/userinfo`,
        }),
    ],
    trustHost: true,
    callbacks: {
        async signIn({ user, account, profile }) {
            const userId = user?.id || (profile as any)?.sub || account?.providerAccountId;
            if (!userId) return false;

            const userName = user?.name || (profile as any)?.name || (profile as any)?.preferred_username || 'Adelaide Student';

            // Resolve and map standard CS Club roles to local DB roles
            const roles = extractRoles(account, profile);
            const role = roles.includes('committee') ? 'admin' : 'user';

            // Upsert Keycloak identity info into local PostgreSQL database
            try {
                await db.insert(users)
                    .values({
                        id: userId,
                        name: userName,
                        role: role,
                    })
                    .onConflictDoUpdate({
                        target: users.id,
                        set: {
                            name: userName,
                            role: role,
                        },
                    });
            } catch (error) {
                console.error('Error syncing user on signIn:', error);
            }
            return true;
        },
        async jwt({ token, account, profile }) {
            if (account) {
                token.accessToken = account.access_token;
                token.sub = profile?.sub ?? (token.sub || account.providerAccountId);
                token.roles = extractRoles(account, profile);
            } else if (token.accessToken && (!token.roles || !(token.roles as string[])?.includes('committee'))) {
                token.roles = Array.from(new Set([
                    ...((token.roles as string[]) || []),
                    ...extractRoles({ access_token: token.accessToken }),
                ]));
            }
            return token;
        },
        async session({ session, token }) {
            if (token.accessToken) {
                session.accessToken = token.accessToken as string;
            }
            if (token.sub) {
                session.user.id = token.sub as string;
            }
            // Map committee members to admin role for moderation page access
            let role: 'admin' | 'user' = (token.roles as string[])?.includes('committee') ? 'admin' : 'user';
            
            // Database role fallback check to ensure correct roles synchronization
            if (role === 'user' && token.sub) {
                try {
                    const dbUsers = await db.select().from(users).where(eq(users.id, token.sub as string)).limit(1);
                    if (dbUsers[0]?.role === 'admin') {
                        role = 'admin';
                    }
                } catch (e) {
                    console.error('Error fetching user role from DB in session callback:', e);
                }
            }
            
            session.user.role = role;
            return session;
        },
    },
});
