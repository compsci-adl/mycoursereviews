import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
    server: {
        NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
        AUTH_SECRET: z.string().min(1),
        NEXTAUTH_URL: z.string().optional(),
        KEYCLOAK_CLIENT_ID: z.string().min(1),
        KEYCLOAK_CLIENT_SECRET: z.string().min(1),
        KEYCLOAK_ISSUER: z.string().min(1),
        DATABASE_URL: z.string().min(1),
        COURSES_DB_PATH: z.string().optional(),
    },
    client: {
        NEXT_PUBLIC_UMAMI_WEBSITE_ID: z.string().min(1).optional(),
        NEXT_PUBLIC_CONTAINER_KEYCLOAK_ENDPOINT: z.url().min(1).optional(),
        NEXT_PUBLIC_LOCAL_KEYCLOAK_URL: z.url().min(1).optional(),
        NEXT_PUBLIC_FEEDBACK_FORM_URL: z.string().min(1).optional(),
    },
    experimental__runtimeEnv: {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NEXT_PUBLIC_UMAMI_WEBSITE_ID: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
        NEXT_PUBLIC_CONTAINER_KEYCLOAK_ENDPOINT: process.env.NEXT_PUBLIC_CONTAINER_KEYCLOAK_ENDPOINT,
        NEXT_PUBLIC_LOCAL_KEYCLOAK_URL: process.env.NEXT_PUBLIC_LOCAL_KEYCLOAK_URL,
        NEXT_PUBLIC_FEEDBACK_FORM_URL: process.env.NEXT_PUBLIC_FEEDBACK_FORM_URL,
    },
    skipValidation: !!process.env.SKIP_ENV_VALIDATION || process.env.npm_lifecycle_event === 'build',
});
