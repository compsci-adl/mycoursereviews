import '@/styles/globals.css';

import { clsx } from 'clsx';
import { Metadata, Viewport } from 'next';
import Script from 'next/script';

import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { fontSans } from '@/config/fonts';
import { siteConfig } from '@/config/site';
import { env } from '@/env.mjs';

import { Providers } from './providers'; 

export const metadata: Metadata = {
    title: {
        default: siteConfig.name,
        template: `%s - ${siteConfig.name}`,
    },
    description: siteConfig.description,
    icons: {
        icon: [
            { url: '/favicon.ico', sizes: 'any' },
            { url: '/favicon.svg', type: 'image/svg+xml' }
        ],
    },
};

export const viewport: Viewport = {
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: 'white' },
        { media: '(prefers-color-scheme: dark)', color: 'black' },
    ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html suppressHydrationWarning lang="en">
            <head>
                <link rel="preload" href="/favicon.png" as="image" type="image/png" fetchPriority="high" />
            </head>
            {env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
                <Script
                    defer
                    src="https://umami.csclub.org.au/script.js"
                    data-website-id={env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
                />
            )}
            <body
                className={clsx(
                    'text-foreground bg-background min-h-screen font-sans antialiased',
                    fontSans.variable
                )}
            >
                <Providers themeProps={{ attribute: 'class', defaultTheme: 'dark' }}>
                    <div className="relative flex flex-col min-h-screen">
                        <Header />
                        <main className="flex-grow mx-auto w-full px-6 sm:px-8 py-8">
                            {children}
                        </main>
                        <Footer />
                    </div>
                </Providers>
            </body>
        </html>
    );
}
