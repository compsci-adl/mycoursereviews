'use client';

import {
    Button,
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    NavbarMenu,
    NavbarMenuItem,
    NavbarMenuToggle,
    Tooltip,
} from '@heroui/react';
import { env } from '@/env.mjs';
import { clsx } from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { FaMoon, FaSignInAlt, FaSignOutAlt, FaSun, FaQuestion, FaCommentAlt, FaBookOpen, FaClipboardList } from 'react-icons/fa';

import { siteConfig } from '@/config/site';
import { HowToUseModal } from './HowToUseModal';

export const Header = () => {
    const { theme, setTheme } = useTheme();
    const { data: session, status } = useSession();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isGuideOpen, setIsGuideOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setMounted(true);
        // Auto-show guide on first visit
        const hasSeen = localStorage.getItem('hasSeenGuide');
        if (!hasSeen) {
            setIsGuideOpen(true);
        }
    }, []);

    const closeGuide = () => {
        setIsGuideOpen(false);
        localStorage.setItem('hasSeenGuide', 'true');
    };

    const feedbackUrl = env.NEXT_PUBLIC_FEEDBACK_FORM_URL || 'https://forms.gle/4k5Y413Z';

    const isActive = (path: string) => pathname === path;

    // Decodes Keycloak JWT accessToken client-side to verify committee role (exact CS Club standard)
    const isAdmin = () => {
        if (!session?.accessToken) return false;
        try {
            const decodedToken = JSON.parse(atob(session.accessToken.split('.')[1]));
            // Check roles mapped either in realm_access or the global roles claim
            const realmAccessRoles = decodedToken?.realm_access?.roles || [];
            const tokenRoles = decodedToken?.roles || [];
            return realmAccessRoles.includes('committee') || tokenRoles.includes('committee');
        } catch {
            return false;
        }
    };

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <Navbar
            isBordered
            maxWidth="xl"
            className="bg-background border-b-4 border-foreground sticky top-0 z-50 py-1"
            isMenuOpen={isMenuOpen}
            onMenuOpenChange={setIsMenuOpen}
        >
            {/* Logo and Brand */}
            <NavbarContent justify="start">
                <NavbarBrand as={Link} href="/" className="flex items-center gap-2.5 cursor-pointer select-none">
                    <Image src="/favicon.png" alt="MyCourseReviews Logo" width={32} height={32} priority unoptimized className="hover:rotate-12 transition-transform duration-300 select-none" />
                    <h1 className="font-mixtape tracking-tighter text-base sm:text-xl font-black text-foreground select-none">
                        MyCourseReviews
                    </h1>
                </NavbarBrand>
            </NavbarContent>

            {/* Desktop Navigation Links */}
            <NavbarContent className="hidden sm:flex gap-4" justify="center">
                {siteConfig.navItems.map((item) => {
                    if (item.href === '/admin' && !isAdmin()) return null;

                    const active = isActive(item.href);
                    return (
                        <NavbarItem key={item.href}>
                            <Link
                                href={item.href}
                                className={clsx(
                                    'font-mono tracking-wide text-xs uppercase font-extrabold px-3 py-1.5 border-2 border-foreground transition-all duration-200 rounded-none flex items-center gap-2',
                                    active 
                                        ? item.href === '/courses'
                                            ? 'bg-yellow text-black shadow-[3px_3px_0px_0px_#000]'
                                            : item.href === '/'
                                                ? 'bg-blue text-white shadow-[3px_3px_0px_0px_#000]'
                                                : 'bg-foreground text-background shadow-[3px_3px_0px_0px_#000]'
                                        : 'bg-background text-foreground shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] hover:bg-yellow hover:text-black hover:shadow-[4px_4px_0px_0px_#000] dark:hover:shadow-[4px_4px_0px_0px_#fff] hover:translate-x-[-1px] hover:translate-y-[-1px]'
                                )}
                            >
                                {item.href === '/courses' && <FaBookOpen className="text-sm shrink-0" />}
                                <span>{item.label}</span>
                            </Link>
                        </NavbarItem>
                    );
                })}
                {mounted && session && (
                    <NavbarItem key="/my-reviews">
                        <Link
                            href="/my-reviews"
                            className={clsx(
                                'font-mono tracking-wide text-xs uppercase font-extrabold px-3 py-1.5 border-2 border-foreground transition-all duration-200 rounded-none flex items-center gap-2',
                                isActive('/my-reviews')
                                    ? 'bg-red text-white shadow-[3px_3px_0px_0px_#000]' 
                                    : 'bg-background text-foreground shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] hover:bg-yellow hover:text-black hover:shadow-[4px_4px_0px_0px_#000] dark:hover:shadow-[4px_4px_0px_0px_#fff] hover:translate-x-[-1px] hover:translate-y-[-1px]'
                            )}
                        >
                            <FaClipboardList className="text-sm shrink-0" />
                            <span>My Reviews</span>
                        </Link>
                    </NavbarItem>
                )}
            </NavbarContent>

            {/* Action Toolbar (Toggles, Guides, Auth) */}
            <NavbarContent justify="end" className="flex items-center gap-2.5 sm:gap-3">
                {/* How to Use Icon Button (Desktop-only) */}
                <NavbarItem className="hidden sm:block">
                    <Tooltip 
                        content="How to Use Guide" 
                        size="sm"
                        radius="none"
                        classNames={{
                            content: "rounded-none border-2 border-foreground bg-background text-foreground font-mono text-2xs font-extrabold uppercase shadow-[2px_2px_0px_0px_#000] px-2 py-1"
                        }}
                    >
                        <Button
                            isIconOnly
                            variant="flat"
                            color="default"
                            aria-label="How to Use Guide"
                            onPress={() => {
                                setIsGuideOpen(true);
                            }}
                            className="bg-background border-2 border-foreground shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] text-sm rounded-none transition-all duration-200 h-9 w-9 min-w-9 p-0 flex items-center justify-center cursor-pointer text-foreground shrink-0"
                        >
                            <FaQuestion />
                        </Button>
                    </Tooltip>
                </NavbarItem>

                {/* Feedback Icon Button (Desktop-only) */}
                <NavbarItem className="hidden sm:block">
                    <Tooltip 
                        content="Give Feedback" 
                        size="sm"
                        radius="none"
                        classNames={{
                            content: "rounded-none border-2 border-foreground bg-background text-foreground font-mono text-2xs font-extrabold uppercase shadow-[2px_2px_0px_0px_#000] px-2 py-1"
                        }}
                    >
                        <a
                            href={feedbackUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Give Feedback"
                            className="bg-background border-2 border-foreground shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] text-sm rounded-none transition-all duration-200 h-9 w-9 min-w-9 p-0 flex items-center justify-center text-foreground hover:bg-secondary cursor-pointer shrink-0"
                        >
                            <FaCommentAlt />
                        </a>
                    </Tooltip>
                </NavbarItem>

                {/* Theme Toggle Button (Desktop-only) */}
                <NavbarItem className="hidden sm:block">
                    <Tooltip 
                        content={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'} 
                        size="sm"
                        radius="none"
                        classNames={{
                            content: "rounded-none border-2 border-foreground bg-background text-foreground font-mono text-2xs font-extrabold uppercase shadow-[2px_2px_0px_0px_#000] px-2 py-1"
                        }}
                    >
                        <Button
                            isIconOnly
                            variant="flat"
                            color="default"
                            aria-label="Toggle Theme"
                            onPress={toggleTheme}
                            className="bg-background border-2 border-foreground shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] text-lg rounded-none transition-all duration-200 h-9 w-9 min-w-9 p-0 flex items-center justify-center shrink-0"
                        >
                            <span>
                                {mounted && theme === 'dark' ? <FaSun className="text-white" /> : <FaMoon className="text-foreground" />}
                            </span>
                        </Button>
                    </Tooltip>
                </NavbarItem>

                {/* NextAuth Login/Logout Buttons (Desktop-only) */}
                <NavbarItem className="hidden sm:block">
                    {session ? (
                        <Tooltip 
                            content={`Logged in as ${session.user?.name || 'User'}`} 
                            size="sm"
                            radius="none"
                            classNames={{
                                content: "rounded-none border-2 border-foreground bg-background text-foreground font-mono text-2xs font-extrabold uppercase shadow-[2px_2px_0px_0px_#000] px-2 py-1"
                            }}
                        >
                            <Button
                                size="sm"
                                color="primary"
                                variant="flat"
                                onPress={() => signOut({ callbackUrl: '/' })}
                                startContent={<FaSignOutAlt />}
                                className="font-mono text-xs uppercase font-black bg-red text-white rounded-none border-2 border-foreground shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] hover:scale-105 active:scale-95 transition-all duration-200 h-9"
                            >
                                Logout
                            </Button>
                        </Tooltip>
                    ) : (
                        <Button
                            size="sm"
                            color="primary"
                            onPress={() => signIn('keycloak')}
                            startContent={<FaSignInAlt />}
                            className="font-mono text-xs uppercase font-black bg-yellow text-black rounded-none border-2 border-foreground shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] hover:scale-105 active:scale-95 transition-all duration-200 h-9"
                        >
                            Login
                        </Button>
                    )}
                </NavbarItem>

                {/* Mobile Hamburger Toggle (Mobile-only) */}
                <NavbarItem className="sm:hidden flex items-center">
                    <NavbarMenuToggle 
                        aria-label={isMenuOpen ? "Close menu" : "Open menu"} 
                        className="text-foreground border-2 border-foreground rounded-none hover:bg-secondary shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] transition-all h-10 w-10 min-w-10 p-2.5 flex items-center justify-center cursor-pointer bg-background shrink-0"
                    />
                </NavbarItem>
            </NavbarContent>

            {/* Mobile Drawer (Menu) */}
            <NavbarMenu className="bg-background border-t-4 border-foreground p-6 flex flex-col gap-6 rounded-none z-50">
                {/* Regular Mobile Nav Links */}
                <div className="flex flex-col gap-3">
                    {/* How to Use (Mobile) */}
                    <NavbarMenuItem>
                        <button
                            onClick={() => {
                                setIsMenuOpen(false);
                                setIsGuideOpen(true);
                            }}
                            className="w-full font-mono tracking-wide text-xs uppercase font-black px-4 py-3 border-2 border-foreground bg-background text-foreground shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] hover:bg-yellow hover:text-black hover:shadow-[4px_4px_0px_0px_#000] dark:hover:shadow-[4px_4px_0px_0px_#fff] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-200 rounded-none flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <FaQuestion className="text-sm shrink-0" />
                            <span>How to Use</span>
                        </button>
                    </NavbarMenuItem>

                    {/* Feedback (Mobile) */}
                    <NavbarMenuItem>
                        <a
                            href={feedbackUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setIsMenuOpen(false)}
                            className="w-full font-mono tracking-wide text-xs uppercase font-black px-4 py-3 border-2 border-foreground bg-background text-foreground shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] hover:bg-yellow hover:text-black hover:shadow-[4px_4px_0px_0px_#000] dark:hover:shadow-[4px_4px_0px_0px_#fff] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-200 rounded-none flex items-center justify-center gap-2"
                        >
                            <FaCommentAlt className="text-sm shrink-0" />
                            <span>Feedback</span>
                        </a>
                    </NavbarMenuItem>

                    {siteConfig.navItems.map((item) => {
                        if (item.href === '/admin' && !isAdmin()) return null;
                        const active = isActive(item.href);
                        return (
                            <NavbarMenuItem key={item.href}>
                                <Link
                                    href={item.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={clsx(
                                        'font-mono tracking-wide text-xs uppercase font-black px-4 py-3 border-2 border-foreground transition-all duration-200 rounded-none block text-center',
                                        active
                                            ? 'bg-foreground text-background shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff]'
                                            : 'bg-background text-foreground shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] hover:bg-yellow hover:text-black hover:shadow-[4px_4px_0px_0px_#000] dark:hover:shadow-[4px_4px_0px_0px_#fff] hover:translate-x-[-1px] hover:translate-y-[-1px]'
                                    )}
                                >
                                    {item.label}
                                </Link>
                            </NavbarMenuItem>
                        );
                    })}
                    {mounted && session && (
                        <NavbarMenuItem key="/my-reviews">
                            <Link
                                href="/my-reviews"
                                onClick={() => setIsMenuOpen(false)}
                                className={clsx(
                                    'font-mono tracking-wide text-xs uppercase font-black px-4 py-3 border-2 border-foreground transition-all duration-200 rounded-none block text-center',
                                    isActive('/my-reviews')
                                        ? 'bg-foreground text-background shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff]'
                                        : 'bg-background text-foreground shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] hover:bg-yellow hover:text-black hover:shadow-[4px_4px_0px_0px_#000] dark:hover:shadow-[4px_4px_0px_0px_#fff] hover:translate-x-[-1px] hover:translate-y-[-1px]'
                                )}
                            >
                                My Reviews
                            </Link>
                        </NavbarMenuItem>
                    )}
                </div>

                <div className="border-t-2 border-dashed border-foreground/30 my-1" />

                {/* Mobile Drawer Theme & Auth Actions */}
                <div className="flex flex-col gap-3">
                    {/* Theme Toggle Button (Mobile) */}
                    <NavbarMenuItem>
                        <Button
                            onPress={() => {
                                toggleTheme();
                            }}
                            className="w-full font-mono text-xs uppercase font-extrabold bg-background text-foreground border-2 border-foreground rounded-none shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] hover:bg-warning transition-all duration-200 h-10 flex items-center justify-center gap-2"
                        >
                            {mounted && theme === 'dark' ? (
                                <>
                                    <FaSun className="text-white" />
                                    <span>Switch to Light Mode</span>
                                </>
                            ) : (
                                <>
                                    <FaMoon className="text-foreground" />
                                    <span>Switch to Dark Mode</span>
                                </>
                            )}
                        </Button>
                    </NavbarMenuItem>

                    {/* Auth Button (Mobile) */}
                    <NavbarMenuItem>
                        {session ? (
                            <Button
                                onPress={() => {
                                    setIsMenuOpen(false);
                                    signOut({ callbackUrl: '/' });
                                }}
                                startContent={<FaSignOutAlt />}
                                className="w-full font-mono text-xs uppercase font-black bg-red text-white rounded-none border-2 border-foreground shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] hover:scale-102 transition-all duration-200 h-10"
                            >
                                Logout
                            </Button>
                        ) : (
                            <Button
                                onPress={() => {
                                    setIsMenuOpen(false);
                                    signIn('keycloak');
                                }}
                                startContent={<FaSignInAlt />}
                                className="w-full font-mono text-xs uppercase font-black bg-yellow text-black rounded-none border-2 border-foreground shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] hover:scale-102 transition-all duration-200 h-10"
                            >
                                Login
                            </Button>
                        )}
                    </NavbarMenuItem>
                </div>
            </NavbarMenu>

            {/* "How to Use" Carousel Modal */}
            <HowToUseModal
                isOpen={isGuideOpen}
                onClose={closeGuide}
            />
        </Navbar>
    );
};
