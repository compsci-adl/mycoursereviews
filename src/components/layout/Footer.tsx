'use client';

import { Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/react';
import Image from 'next/image';
import { useState } from 'react';
import {
    FaDiscord,
    FaEnvelope,
    FaFacebook,
    FaGithub,
    FaInstagram,
    FaLinkedin,
    FaTiktok,
    FaYoutube,
} from 'react-icons/fa';

const SOCIAL_LINKS = [
    { icon: FaEnvelope, link: 'mailto:dev@csclub.org.au', name: 'Email Support' },
    { icon: FaGithub, link: 'https://github.com/compsci-adl', name: 'GitHub' },
    { icon: FaInstagram, link: 'https://www.instagram.com/csclub.adl/', name: 'Instagram' },
    { icon: FaTiktok, link: 'https://www.tiktok.com/@csclub.adl/', name: 'TikTok' },
    { icon: FaFacebook, link: 'https://www.facebook.com/compsci.adl/', name: 'Facebook' },
    { icon: FaDiscord, link: 'https://discord.gg/UjvVxHA', name: 'Discord' },
    { icon: FaLinkedin, link: 'https://www.linkedin.com/company/compsci-adl/', name: 'LinkedIn' },
    { icon: FaYoutube, link: 'https://www.youtube.com/@csclub-adl/', name: 'YouTube' },
];

const FOOTER_SECTIONS = [
    {
        title: 'About',
        bgClass: 'bg-yellow text-black',
        content:
            "MyCourseReviews is the Adelaide University Computer Science Club's course reviews platform. Built by students, for students, it provides a transparent platform that allows university students to cast ratings easily on difficulty, usefulness, and enjoyment metrics, helping students explore the courses available.",
    },
    {
        title: 'Disclaimer',
        bgClass: 'bg-yellow text-black',
        content:
            "MyCourseReviews is a student-run repository developed by the Computer Science Club. The club is an independent student organisation and does not officially represent the Adelaide University, Faculty, or School. Ratings and reviews express the subjective experiences of individual authors, and course information is subject to change.",
    },
    {
        title: 'Privacy',
        bgClass: 'bg-red text-white',
        content:
            "MyCourseReviews secures all user logins through the CS Club authentication system. Although reviews can be published anonymously, user ids are safely stored in our database for moderation, accountability, and anti-spam protection. We do not share or trade student identity details.",
    },
    {
        title: 'Terms & Conditions',
        bgClass: 'bg-blue text-white',
        content: (
            <div className="flex flex-col gap-4 font-mono text-xs">
                <div className="bg-yellow/10 border-2 border-foreground p-3 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]">
                    <p className="font-black text-xs uppercase tracking-wide text-foreground">
                        By using this service, you agree to these terms and conditions.
                    </p>
                    <p className="text-2xs text-foreground/75 mt-1">
                        Please read these terms carefully before accessing, browsing, rating, or submitting content.
                    </p>
                </div>
                <div>
                    <h4 className="font-black text-foreground uppercase tracking-wide mb-1">1. Acceptance of Terms</h4>
                    <ul className="list-disc list-inside space-y-1 text-foreground/80 pl-1">
                        <li>By accessing, browsing, or using this service, you agree to these terms and conditions in full.</li>
                        <li>If you do not agree to these terms, you must discontinue using this service.</li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-black text-foreground uppercase tracking-wide mb-1">2. Student Charter & Code of Conduct</h4>
                    <ul className="list-disc list-inside space-y-1 text-foreground/80 pl-1">
                        <li>All reviews, ratings, and comments must comply with the Adelaide University Student Charter.</li>
                        <li>Reviews must be truthful, constructive, and reflect genuine personal enrollment experiences.</li>
                        <li>Automated submissions, duplicate reviews, and rating manipulation are strictly prohibited.</li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-black text-foreground uppercase tracking-wide mb-1">3. Prohibited Content & Conflicts of Interest</h4>
                    <ul className="list-disc list-inside space-y-1 text-foreground/80 pl-1">
                        <li>Profanity, obscene language, harassment, hate speech, and defamation are strictly prohibited.</li>
                        <li>Personal attacks or posting private identifying information is not permitted.</li>
                        <li>Coordinators, lecturers, and tutors may not review courses for semesters they taught or managed.</li>
                    </ul>
                </div>
                <div className="bg-red/10 border-2 border-red p-3 rounded-none">
                    <h4 className="font-black text-red uppercase tracking-wide mb-1">4. Removal of Reviews & Moderation</h4>
                    <ul className="list-disc list-inside space-y-1 text-foreground/90 pl-1 font-medium">
                        <li><strong>We reserve the right to remove reviews that do not meet the Terms & Conditions.</strong></li>
                        <li>Users engaging in repeated violations or abusive behaviour will be blocked from future submissions.</li>
                    </ul>
                </div>
            </div>
        ),
    },
];

interface FooterModalProps {
    title: string;
    content: React.ReactNode;
    isOpen: boolean;
    onClose: () => void;
}

const FooterModal = ({ title, content, isOpen, onClose }: FooterModalProps) => (
    <Modal isOpen={isOpen} onClose={onClose} className="bg-background border-4 border-foreground text-foreground rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] max-w-2xl font-mono">
        <ModalContent className="rounded-none">
            <ModalHeader className="font-mixtape uppercase tracking-tighter text-xl border-b-3 border-foreground px-6 py-4">{title}</ModalHeader>
            <ModalBody className="p-6 max-h-125 overflow-y-auto">
                {typeof content === 'string' ? (
                    <p className="text-sm font-mono leading-relaxed">{content}</p>
                ) : (
                    content
                )}
            </ModalBody>
        </ModalContent>
    </Modal>
);

export const Footer = () => {
    const [openModal, setOpenModal] = useState<string | null>(null);

    return (
        <footer className="w-full mt-12 bg-background border-t-4 border-foreground py-8">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 grid grid-cols-2 items-center gap-6 mobile:grid-cols-1 mobile:justify-items-center mobile:gap-8">
                
                {/* Logo and Brand Title */}
                <div className="flex items-center gap-3">
                    <Image src="/favicon.png" alt="CS Club Logo" width={40} height={40} priority unoptimized className="hover:rotate-12 transition-transform duration-300 select-none" />
                    <h1 className="text-lg sm:text-xl font-mixtape font-black tracking-tighter text-foreground select-none">
                        MyCourseReviews
                    </h1>
                </div>

                {/* Course information tab sections */}
                <div className="mt-0 flex flex-wrap gap-4 justify-self-end mobile:justify-self-auto">
                    {FOOTER_SECTIONS.map((section, i) => (
                        <button
                            key={i}
                            className={`cursor-pointer font-mono text-xs uppercase tracking-wide font-black border-2 border-foreground px-2 py-1 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:scale-105 active:scale-95 transition-all rounded-none ${section.bgClass}`}
                            onClick={() => setOpenModal(section.title)}
                            aria-label={`Open ${section.title} modal`}
                        >
                            {section.title}
                        </button>
                    ))}
                </div>

                <div className="font-mono text-xs text-foreground/60 font-semibold">
                    <span className="mr-1">&copy; {new Date().getFullYear()}</span>
                    <a href="https://csclub.org.au/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary transition-colors">
                        Adelaide University Computer Science Club
                    </a>
                </div>

                {/* Sticker-style social badges */}
                <div className="flex flex-wrap gap-3 justify-self-end text-sm mobile:justify-self-auto">
                    {SOCIAL_LINKS.map(({ icon: Icon, link, name }, i) => (
                        <a
                            href={link}
                            key={i}
                            className="p-1.5 border-2 border-foreground rounded-none bg-background text-foreground shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:bg-yellow hover:text-black hover:rotate-6 hover:-translate-y-0.5 transition-all duration-150"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Visit our ${name}`}
                        >
                            <Icon />
                        </a>
                    ))}
                </div>
            </div>

            {FOOTER_SECTIONS.map((section) => (
                <FooterModal
                    key={section.title}
                    title={section.title}
                    content={section.content}
                    isOpen={openModal === section.title}
                    onClose={() => setOpenModal(null)}
                />
            ))}
        </footer>
    );
};
