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

interface HowToUseModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const HowToUseModal = ({ isOpen, onClose }: HowToUseModalProps) => {
    const [guideStep, setGuideStep] = useState(0);

    // Reset step to 0 when modal opens
    useEffect(() => {
        if (isOpen) {
            setGuideStep(0);
        }
    }, [isOpen]);

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose}
            size="md"
            hideCloseButton
            className="bg-background border-4 border-foreground text-foreground rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] z-[100] font-mono"
        >
            <ModalContent className="rounded-none">
                {() => (
                    <>
                        <ModalHeader className="font-mixtape uppercase tracking-tighter border-b-3 border-foreground px-4 sm:px-6 py-3 flex justify-between items-center bg-purple text-white rounded-none gap-4">
                            <div className="flex flex-col gap-0.5 select-none">
                                <span className="text-sm sm:text-base font-extrabold leading-none">HOW TO USE GUIDE</span>
                                <span className="text-3xs font-mono font-normal tracking-wide opacity-80">STEP {guideStep + 1} OF 3</span>
                            </div>
                            <button
                                onClick={onClose}
                                aria-label="Close Guide"
                                className="cursor-pointer h-7 w-7 border-2 border-foreground bg-background text-foreground hover:bg-secondary hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] flex items-center justify-center font-mono font-black text-sm rounded-none transition-all duration-200"
                            >
                                ✕
                            </button>
                        </ModalHeader>
                        <ModalBody className="p-6 flex flex-col gap-4 font-mono">
                            {/* Step illustration/image placeholder */}
                            <div className="h-44 w-full bg-lightgrey dark:bg-grey border-2 border-foreground rounded-none flex flex-col items-center justify-center p-4 text-center select-none shadow-[inset_3px_3px_0px_0px_rgba(0,0,0,0.15)] relative overflow-hidden">
                                <div className="absolute top-2 left-2 text-3xs opacity-40 font-bold">PREVIEW_DECK</div>
                                {guideStep === 0 && (
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="bg-yellow text-black border-2 border-foreground font-black px-3 py-1 text-sm shadow-[2px_2px_0px_0px_#000] -rotate-2">
                                            MYCOURSEREVIEWS
                                        </div>
                                        <p className="text-2xs uppercase font-bold text-foreground/60 max-w-50 mt-1 leading-tight">
                                            BY STUDENTS, FOR STUDENTS AT ADELAIDE UNI
                                        </p>
                                    </div>
                                )}
                                {guideStep === 1 && (
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="bg-red text-white border-2 border-foreground font-black px-3 py-1 text-sm shadow-[2px_2px_0px_0px_#000] rotate-3">
                                            RATE COURSE
                                        </div>
                                        <p className="text-2xs uppercase font-bold text-foreground/60 max-w-50 mt-1 leading-tight">
                                            DIFFICULTY, USEFULNESS, & ENJOYMENT EQ BARS
                                        </p>
                                    </div>
                                )}
                                {guideStep === 2 && (
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="bg-blue text-white border-2 border-foreground font-black px-3 py-1 text-sm shadow-[2px_2px_0px_0px_#000] -rotate-3">
                                            DISCUSS
                                        </div>
                                        <p className="text-2xs uppercase font-bold text-foreground/60 max-w-50 mt-1 leading-tight">
                                            LEAVE REVIEWS & THREADED DEBATES IN-PLACE
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Step text content */}
                            <div className="text-center mt-2 min-h-16">
                                {guideStep === 0 && (
                                    <>
                                        <h3 className="font-extrabold text-sm uppercase mb-1">1. Explore Outline Ratings</h3>
                                        <p className="text-2xs text-foreground/75 leading-relaxed">
                                            Explore course ratings on overall scoring, difficulty, usefulness, and enjoyment metrics submitted by fellow university peers.
                                        </p>
                                    </>
                                )}
                                {guideStep === 1 && (
                                    <>
                                        <h3 className="font-extrabold text-sm uppercase mb-1">2. Cast Your Rating</h3>
                                        <p className="text-2xs text-foreground/75 leading-relaxed">
                                            Log in securely via your CS Club account, choose a course, and rate difficulty, usefulness, and enjoyment.
                                        </p>
                                    </>
                                )}
                                {guideStep === 2 && (
                                    <>
                                        <h3 className="font-extrabold text-sm uppercase mb-1">3. Threaded Discussions</h3>
                                        <p className="text-2xs text-foreground/75 leading-relaxed">
                                            Share anonymous insights, reply to student queries, or start in-place threaded debates on course ratings.
                                        </p>
                                    </>
                                )}
                            </div>

                            {/* Carousel navigation indicators */}
                            <div className="flex justify-center gap-2 my-2">
                                {[0, 1, 2].map((stepIdx) => (
                                    <div 
                                        key={stepIdx} 
                                        className={clsx(
                                            "h-2.5 w-2.5 border border-foreground transition-all duration-200 rounded-none",
                                            guideStep === stepIdx ? "bg-foreground scale-110 shadow-[1px_1px_0px_0px_rgba(0,0,0,0.15)]" : "bg-foreground/15"
                                        )}
                                    />
                                ))}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-between items-center gap-4 mt-2">
                                <Button
                                    size="sm"
                                    radius="none"
                                    variant="flat"
                                    isDisabled={guideStep === 0}
                                    onPress={() => setGuideStep(prev => prev - 1)}
                                    className="font-mono text-2xs uppercase border-2 border-foreground cursor-pointer"
                                >
                                    Back
                                </Button>
                                {guideStep < 2 ? (
                                    <Button
                                        size="sm"
                                        radius="none"
                                        onPress={() => setGuideStep(prev => prev + 1)}
                                        className="font-mono text-2xs uppercase font-black bg-blue text-white border-2 border-foreground shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] cursor-pointer"
                                    >
                                        Next
                                    </Button>
                                ) : (
                                    <Button
                                        size="sm"
                                        radius="none"
                                        onPress={onClose}
                                        className="font-mono text-2xs uppercase font-black bg-yellow text-black border-2 border-foreground shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] cursor-pointer"
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
