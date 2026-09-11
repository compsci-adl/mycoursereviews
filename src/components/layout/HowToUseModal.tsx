'use client';

import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalHeader,
} from '@heroui/react';
import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import Image from 'next/image';

interface HowToUseModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface GuideStep {
    title: string;
    description: string;
    image: string;
    alt: string;
}

const GUIDE_STEPS: GuideStep[] = [
    {
        title: '1. Search for Courses',
        description:
            'Search Adelaide University courses by course code, title, or keywords. Filter by faculty, study term, or sort by rating and difficulty.',
        image: '/help/search-courses.webp',
        alt: 'Step 1: Searching and filtering courses in the catalog',
    },
    {
        title: '2. View Course Information',
        description:
            'Check comprehensive course outlines, prerequisite requirements, syllabus details, and peer-evaluated difficulty, usefulness, and enjoyment metrics.',
        image: '/help/course-info.webp',
        alt: 'Step 2: Viewing course scorecards, EQ ratings, and syllabus info',
    },
    {
        title: '3. Write a Review',
        description:
            'Log in with your CS Club account to share your course experience. Rate difficulty, usefulness, and enjoyment with anonymous posting options.',
        image: '/help/write-reviews.webp',
        alt: 'Step 3: Rating course metrics and submitting a student review',
    },
    {
        title: '4. See Other Reviews & Comments',
        description:
            'Browse detailed feedback from fellow classmates, upvote the most helpful insights, and take part in threaded discussions.',
        image: '/help/view-reviews.webp',
        alt: 'Step 4: Reading peer reviews and threaded comments',
    },
    {
        title: '5. Manage Your Reviews & Comments',
        description:
            'Access your contributor dashboard to review your submissions, edit your comments or ratings, and manage your account activity anytime.',
        image: '/help/manage-reviews.webp',
        alt: 'Step 5: Managing your own reviews and comments',
    },
];

export const HowToUseModal = ({ isOpen, onClose }: HowToUseModalProps) => {
    const [guideStep, setGuideStep] = useState(0);

    // Reset step to 0 when modal opens
    useEffect(() => {
        if (isOpen) {
            setGuideStep(0);
        }
    }, [isOpen]);

    const totalSteps = GUIDE_STEPS.length;
    const currentStep = GUIDE_STEPS[guideStep] ?? GUIDE_STEPS[0];

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose}
            size="lg"
            hideCloseButton
            className="bg-background border-4 border-foreground text-foreground rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] z-[100] font-mono max-w-xl sm:max-w-2xl mx-4"
        >
            <ModalContent className="rounded-none">
                {() => (
                    <>
                        <ModalHeader className="font-mixtape uppercase tracking-tighter border-b-3 border-foreground px-4 sm:px-6 py-3 flex justify-between items-center bg-purple text-white rounded-none gap-4">
                            <div className="flex flex-col gap-0.5 select-none">
                                <span className="text-sm sm:text-base font-extrabold leading-none">HOW TO USE GUIDE</span>
                                <span className="text-3xs font-mono font-normal tracking-wide opacity-80">
                                    STEP {guideStep + 1} OF {totalSteps}
                                </span>
                            </div>
                            <button
                                onClick={onClose}
                                aria-label="Close Guide"
                                className="cursor-pointer h-7 w-7 border-2 border-foreground bg-background text-foreground hover:bg-secondary hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] flex items-center justify-center font-mono font-black text-sm rounded-none transition-all duration-200"
                            >
                                ✕
                            </button>
                        </ModalHeader>
                        <ModalBody className="p-4 sm:p-6 flex flex-col gap-4 font-mono">
                            {/* Step illustration with optimized WebP screenshot */}
                            <div className="relative w-full h-64 sm:h-72 bg-lightgrey/40 dark:bg-grey/20 border-3 border-foreground rounded-none overflow-hidden select-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] flex items-center justify-center p-3">
                                <Image
                                    src={currentStep.image}
                                    alt={currentStep.alt}
                                    width={1200}
                                    height={800}
                                    className="max-h-full max-w-full w-auto h-auto object-contain select-none block"
                                    unoptimized
                                    priority
                                />
                            </div>

                            {/* Step text content */}
                            <div className="text-center px-2 min-h-16 flex flex-col items-center justify-center">
                                <h3 className="font-extrabold text-sm sm:text-base uppercase mb-1">
                                    {currentStep.title}
                                </h3>
                                <p className="text-2xs sm:text-xs text-foreground/80 leading-relaxed max-w-lg">
                                    {currentStep.description}
                                </p>
                            </div>

                            {/* Carousel navigation indicators */}
                            <div className="flex justify-center items-center gap-2 my-1">
                                {GUIDE_STEPS.map((step, stepIdx) => (
                                    <button
                                        key={step.title}
                                        type="button"
                                        onClick={() => setGuideStep(stepIdx)}
                                        aria-label={`Go to step ${stepIdx + 1}: ${step.title}`}
                                        className={clsx(
                                            "h-2.5 w-6 border-2 border-foreground transition-all duration-200 rounded-none cursor-pointer",
                                            guideStep === stepIdx
                                                ? "bg-foreground scale-105 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)]"
                                                : "bg-foreground/20 hover:bg-foreground/40"
                                        )}
                                    />
                                ))}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-between items-center gap-4 mt-1">
                                <Button
                                    size="sm"
                                    radius="none"
                                    variant="flat"
                                    isDisabled={guideStep === 0}
                                    onPress={() => setGuideStep(prev => Math.max(0, prev - 1))}
                                    className="font-mono text-2xs uppercase border-2 border-foreground cursor-pointer font-bold"
                                >
                                    Back
                                </Button>
                                {guideStep < totalSteps - 1 ? (
                                    <Button
                                        size="sm"
                                        radius="none"
                                        onPress={() => setGuideStep(prev => Math.min(totalSteps - 1, prev + 1))}
                                        className="font-mono text-2xs uppercase font-black bg-blue text-white border-2 border-foreground shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] cursor-pointer hover:-translate-x-px hover:-translate-y-px transition-all"
                                    >
                                        Next
                                    </Button>
                                ) : (
                                    <Button
                                        size="sm"
                                        radius="none"
                                        onPress={onClose}
                                        className="font-mono text-2xs uppercase font-black bg-yellow text-black border-2 border-foreground shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] cursor-pointer hover:-translate-x-px hover:-translate-y-px transition-all"
                                    >
                                        Let's Go!
                                    </Button>
                                )}
                            </div>
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};
