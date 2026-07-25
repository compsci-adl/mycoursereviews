'use client';

import { HeroUIProvider } from '@heroui/system';
import { useRouter } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import type { ThemeProviderProps } from 'next-themes';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import * as React from 'react';

// Suppress React 19 next-themes false-positive inline script tag console warning in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const origError = console.error;
    console.error = (...args: any[]) => {
        if (typeof args[0] === 'string' && args[0].includes('Encountered a script tag')) {
            return;
        }
        origError.apply(console, args);
    };
}

export interface ProvidersProps {
    children: React.ReactNode;
    themeProps?: ThemeProviderProps;
}

declare module '@react-types/shared' {
    interface RouterConfig {
        routerOptions: NonNullable<Parameters<ReturnType<typeof useRouter>['push']>[1]>;
    }
}

export function Providers({ children, themeProps }: ProvidersProps) {
    const router = useRouter();

    return (
        <SessionProvider>
            <HeroUIProvider navigate={router.push}>
                <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
            </HeroUIProvider>
        </SessionProvider>
    );
}

