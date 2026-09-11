'use client';

import { Button, Card, CardBody } from '@heroui/react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
    FaArrowRight,
    FaComments,
    FaSearch,
} from 'react-icons/fa';
import { MdStar } from 'react-icons/md';

export default function WelcomePage() {
    const [mounted, setMounted] = useState(false);
    const [bubbles, setBubbles] = useState<any[]>([]);

    useEffect(() => {
        setMounted(true);
        const comments = [
            "Loved ACCT1000! Great lectures.",
            "COMP SCI 1102 is highly recommended!",
            "ARTI2001 (Machine Learning) is awesome ⭐",
            "Awesome coordinators!",
            "Difficulty: 2/5, Enjoyment: 5/5!",
            "Super useful for internship prep!",
            "Tough exams but very rewarding.",
            "Great intro to databases!",
            "Enjoyment: 5/5, Usefulness: 5/5",
            "The final project was so fun!",
            "The tutor support was incredible!",
            "Fascinating lecture content!",
            "Best course I've taken at Uni!",
            "Highly interactive workshops!",
            "Tough but rewarding!",
            "Literally my favourite class",
            "Excellent practical assignments!",
            "Loved ACCT1001! Great intro.",
            "Enjoyment: 5/5 ⭐",
        ];

        const generated = Array.from({ length: 28 }).map((_, i) => {
            const comment = comments[i % comments.length];
            
            const angle = (i * (360 / 28) * Math.PI) / 180;
            
            const tx = `${Math.cos(angle) * (15 + Math.random() * 28)}vw`;
            const ty = `${Math.sin(angle) * (80 + Math.random() * 180)}px`;
            
            const scale = 0.55 + Math.random() * 0.4;
            const rotation = -12 + Math.random() * 24;
            const maxOp = 1.0;
            const blur = "blur-none";

            return {
                id: i,
                text: comment,
                tx,
                ty,
                scale,
                rotation,
                maxOp,
                blur,
                delay: `${i * 0.07}s`,
            };
        });

        setBubbles(generated);
    }, [])

    return (
        <div className="flex flex-col gap-16">
            
            {/* Hero Section */}
            <section className="relative flex flex-col items-center justify-center text-center -mx-6 sm:-mx-8 -mt-8 px-4 pb-20 pt-24 min-h-145 isolate w-[calc(100%+3rem)] sm:w-[calc(100%+4rem)] bg-grid-sheet border-b-4 border-foreground overflow-hidden">
                
                {/* DIY visual sheet accents */}
                <div className="relative sm:absolute w-72.5 sm:w-70 mb-6 sm:mb-0 sm:top-10 sm:left-6 -rotate-3 sm:-rotate-12 bg-purple text-white font-mono text-2xs sm:text-xs uppercase font-extrabold p-3 border-2 border-foreground shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] select-none z-20 flex items-center gap-3">
                    <div className="shrink-0 bg-white p-1 border border-foreground shadow-[1px_1px_0px_0px_#000] rounded-none rotate-3">
                        <Image 
                            src="/cs-club-logo.png" 
                            alt="CS Club Logo" 
                            width={32} 
                            height={32} 
                            priority 
                            unoptimized 
                            className="select-none" 
                        />
                    </div>
                    <div className="leading-tight text-left">
                        Created by the {' '}
                        <a 
                            href="https://csclub.org.au/" 
                            target="_blank" 
                            className="text-yellow font-extrabold underline hover:text-white transition-colors"
                        >
                            Adelaide University Computer Science Club
                        </a>
                    </div>
                </div>

                {/* Floating Review Stickers */}
                {mounted && (
                    <div className="absolute inset-0 -z-20 pointer-events-none flex items-center justify-center overflow-hidden">
                        <style dangerouslySetInnerHTML={{ __html: `
                            @keyframes echoExpand {
                                0% {
                                    transform: translate(-50%, -50%) scale(0.05) rotate(0deg);
                                    opacity: 0;
                                }
                                20% {
                                    opacity: var(--max-op);
                                }
                                100% {
                                    transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(var(--sc)) rotate(var(--rot));
                                    opacity: var(--max-op);
                                }
                            }
                            @keyframes bubbleDrift {
                                0%, 100% {
                                    transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(var(--sc)) rotate(var(--rot));
                                }
                                50% {
                                    transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty) - 8px)) scale(var(--sc)) rotate(calc(var(--rot) + 1deg));
                                }
                            }
                            .echo-bubble {
                                position: absolute;
                                left: 50%;
                                top: 50%;
                                transform: translate(-50%, -50%) scale(0.05);
                                opacity: 0;
                                animation: echoExpand 1.4s cubic-bezier(0.19, 1, 0.22, 1) forwards,
                                           bubbleDrift 6s ease-in-out infinite 1.4s;
                            }
                        ` }} />

                        {bubbles.map((b, idx) => {
                            const paletteColors = [
                                { bgClass: "bg-yellow text-black", hex: "#e6c229" },
                                { bgClass: "bg-orange text-white", hex: "#f17105" },
                                { bgClass: "bg-red text-white", hex: "#d11149" },
                                { bgClass: "bg-purple text-white", hex: "#6610f2" },
                                { bgClass: "bg-blue text-white", hex: "#1a8fe3" },
                            ];
                            const colorOption = paletteColors[idx % paletteColors.length];
                            // To make mobile screens less congested, hide 2/3 of the bubbles on smaller screens
                            const mobileHideClass = idx % 3 !== 0 ? "hidden sm:block" : "";

                            return (
                                <div
                                    key={b.id}
                                    className={`echo-bubble px-3 py-1.5 sm:px-4 sm:py-2 text-3xs min-[360px]:text-2xs sm:text-xs font-mono font-black uppercase tracking-tight max-w-37.5 sm:max-w-70 break-words text-left rounded-none border-3 border-foreground shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] ${colorOption.bgClass} ${b.blur} ${mobileHideClass}`}
                                    style={{
                                        '--tx': b.tx,
                                        '--ty': b.ty,
                                        '--sc': b.scale,
                                        '--rot': `${b.rotation}deg`,
                                        '--max-op': b.maxOp,
                                        animationDelay: `${b.delay}, calc(${b.delay} + 1.4s)`,
                                    } as React.CSSProperties}
                                >
                                    <span className="relative z-10">{b.text}</span>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Overlapping Brand Logo with box wrapper */}
                <div className="relative z-10 mb-6 hover:scale-105 active:scale-95 transition-all duration-300 select-none -rotate-3">
                    <div className="bg-background border-4 border-foreground p-4 shadow-[6px_6px_0px_0px_#6610f2] dark:shadow-[6px_6px_0px_0px_#e6c229] rounded-none">
                        <Image src="/favicon.png" alt="MyCourseReviews Logo" width={80} height={80} priority unoptimized className="select-none" />
                    </div>
                </div>

                {/* Heading Bar */}
                <div className="relative z-10 my-8 rotate-[-2.5deg] hover:rotate-1 hover:scale-105 active:scale-95 transition-all duration-300 select-none max-w-full px-2">
                    <div className="bg-foreground text-background border-4 border-foreground px-4 py-3 sm:px-10 sm:py-6 shadow-[6px_6px_0px_0px_#6610f2] dark:shadow-[6px_6px_0px_0px_#e6c229] max-w-full">
                        <h1 className="text-xl min-[360px]:text-2xl min-[480px]:text-4xl sm:text-7xl font-mixtape font-black tracking-tighter leading-none m-0 break-words">
                            MyCourseReviews
                        </h1>
                    </div>
                </div>

                <p className="mt-4 text-sm sm:text-base font-mono uppercase tracking-wide text-foreground/80 max-w-xl font-bold leading-relaxed relative z-10 bg-background border-2 border-foreground px-4 py-2 shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] rotate-1">
                    By students, for students — a platform to share course reviews, ratings, and insights for all Adelaide University courses!
                </p>

                {/* Main CTAs styled as physical sticker buttons */}
                <div className="mt-10 flex flex-wrap gap-5 justify-center items-center relative z-10">
                    <Button
                        as={Link}
                        href="/courses"
                        color="secondary"
                        size="lg"
                        className="font-mixtape uppercase tracking-wider font-extrabold text-black bg-yellow px-6 py-5 sm:px-10 sm:py-7 text-sm sm:text-lg rounded-none border-3 sm:border-4 border-foreground shadow-[4px_4px_0px_0px_#000] sm:shadow-[5px_5px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] dark:sm:shadow-[5px_5px_0px_0px_#fff] hover:scale-105 active:scale-95 transition-all duration-200 transform hover:!opacity-100 data-[hover=true]:!opacity-100 animate-pulse-custom"
                        endContent={<FaArrowRight className="text-sm sm:text-xl" />}
                    >
                        Browse Course Reviews
                    </Button>
                </div>
            </section>

            <div className="max-w-7xl mx-auto w-full flex flex-col gap-16 pb-8 relative z-10">
                {/* Feature Overview Section */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <Card className="bg-background border-4 border-foreground rounded-none shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#000] dark:hover:shadow-[8px_8px_0px_0px_#fff] transition-all duration-200">
                    <CardBody className="p-6 flex flex-col gap-4">
                        <div className="p-3 bg-yellow text-black w-fit rounded-none border-2 border-foreground shadow-[2px_2px_0px_0px_#000] -rotate-3">
                            <FaSearch className="text-xl" />
                        </div>
                        <h2 className="text-xl font-mixtape uppercase font-extrabold tracking-tight">Smart Search</h2>
                        <p className="text-xs font-mono text-foreground/80 leading-relaxed">
                            Search to filter Adelaide University subjects by subject areas, terms offered, and ratings.
                        </p>
                    </CardBody>
                </Card>

                <Card className="bg-background border-4 border-foreground rounded-none shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#000] dark:hover:shadow-[8px_8px_0px_0px_#fff] transition-all duration-200">
                    <CardBody className="p-6 flex flex-col gap-4">
                        <div className="p-3 bg-red text-white w-fit rounded-none border-2 border-foreground shadow-[2px_2px_0px_0px_#000] rotate-3">
                            <MdStar
                                className="w-5 h-5 text-yellow"
                                fill="#FAA307"
                                stroke="black"
                                strokeWidth={1.2}
                            />
                        </div>
                        <h2 className="text-xl font-mixtape uppercase font-extrabold tracking-tight">Sub-score Ratings</h2>
                        <p className="text-xs font-mono text-foreground/80 leading-relaxed">
                            Rate and compare courses based on dynamic metrics: Difficulty, Usefulness, and Enjoyment with graphical scorecards.
                        </p>
                    </CardBody>
                </Card>

                <Card className="bg-background border-4 border-foreground rounded-none shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#000] dark:hover:shadow-[8px_8px_0px_0px_#fff] transition-all duration-200">
                    <CardBody className="p-6 flex flex-col gap-4">
                        <div className="p-3 bg-blue text-white w-fit rounded-none border-2 border-foreground shadow-[2px_2px_0px_0px_#000] -rotate-2">
                            <FaComments className="text-xl" />
                        </div>
                        <h2 className="text-xl font-mixtape uppercase font-extrabold tracking-tight">Threaded Discussions</h2>
                        <p className="text-xs font-mono text-foreground/80 leading-relaxed">
                            Logged in students can leave threaded comments and reply to reviews to ask questions or discuss assignments.
                        </p>
                    </CardBody>
                </Card>
            </section>

            {/* Guide */}
            <section className="bg-background border-4 border-foreground rounded-none p-8 md:p-12 shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] bg-grid-sheet">
                <div className="text-center mb-12">
                    <h2 className="font-mixtape font-black uppercase text-2xl sm:text-4xl bg-red text-white w-fit mx-auto px-4 py-1.5 border-3 border-foreground shadow-[3px_3px_0px_0px_#000] rotate-[1.5deg]">How it Works</h2>
                    <p className="font-mono text-base text-foreground/75 mt-4 -rotate-1 font-bold">
                        Get from choosing courses to submitting ratings in 4 simple steps
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
                    
                    {/* Step 1 */}
                    <div className="flex flex-col items-center text-center gap-3 bg-background border-3 border-foreground p-5 rounded-none rotate-[-1.5deg] shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] hover:rotate-0 transition-transform">
                        <div className="w-10 h-10 bg-yellow border-2 border-foreground rounded-none flex items-center justify-center font-mono font-black text-black shadow-[2px_2px_0px_0px_#000] text-lg select-none">
                            1
                        </div>
                        <h3 className="font-mixtape font-extrabold uppercase text-base tracking-tight">Browse</h3>
                        <p className="font-mono text-2xs text-foreground/80 px-2 leading-relaxed">
                            Filter through levels and semesters to discover course details and star ratings.
                        </p>
                    </div>

                    {/* Step 2 */}
                    <div className="flex flex-col items-center text-center gap-3 bg-background border-3 border-foreground p-5 rounded-none rotate-1 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] hover:rotate-0 transition-transform">
                        <div className="w-10 h-10 bg-orange border-2 border-foreground rounded-none flex items-center justify-center font-mono font-black text-white shadow-[2px_2px_0px_0px_#000] text-lg select-none">
                            2
                        </div>
                        <h3 className="font-mixtape font-extrabold uppercase text-base tracking-tight">Login</h3>
                        <p className="font-mono text-2xs text-foreground/80 px-2 leading-relaxed">
                            Sign in securely via your CS Club account to authenticate your reviews.
                        </p>
                    </div>

                    {/* Stepper Card 3 */}
                    <div className="flex flex-col items-center text-center gap-3 bg-background border-3 border-foreground p-5 rounded-none -rotate-2 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] hover:rotate-0 transition-transform">
                        <div className="w-10 h-10 bg-red border-2 border-foreground rounded-none flex items-center justify-center font-mono font-black text-white shadow-[2px_2px_0px_0px_#000] text-lg select-none">
                            3
                        </div>
                        <h3 className="font-mixtape font-extrabold uppercase text-base tracking-tight">Review</h3>
                        <p className="font-mono text-2xs text-foreground/80 px-2 leading-relaxed">
                            Submit rating sliders on difficulty, usefulness, and enjoyment based on your experience.
                        </p>
                    </div>

                    {/* Step 4 */}
                    <div className="flex flex-col items-center text-center gap-3 bg-background border-3 border-foreground p-5 rounded-none rotate-2 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] hover:rotate-0 transition-transform">
                        <div className="w-10 h-10 bg-blue border-2 border-foreground rounded-none flex items-center justify-center font-mono font-black text-white shadow-[2px_2px_0px_0px_#000] text-lg select-none">
                            4
                        </div>
                        <h3 className="font-mixtape font-extrabold uppercase text-base tracking-tight">Discuss</h3>
                        <p className="font-mono text-2xs text-foreground/80 px-2 leading-relaxed">
                            Join threaded comments to reply, verify, and like reviews submitted by other peers.
                        </p>
                    </div>

                </div>
            </section>

            </div>
       </div>
    );
}
