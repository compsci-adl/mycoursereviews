'use client';

import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
} from '@heroui/react';
import { signIn } from 'next-auth/react';
import { FaExclamationTriangle, FaLock, FaUserShield } from 'react-icons/fa';

interface ModerationWarningModalProps {
    isOpen: boolean;
    onClose: () => void;
    message: string;
    title?: string;
    badge?: string;
}

export const ModerationWarningModal = ({
    isOpen,
    onClose,
    message,
    title,
    badge,
}: ModerationWarningModalProps) => {
    // Determine whether this is an authentication requirement rather than a moderation block
    const isAuth = /logged in|login|log in|authenticate|session/i.test(message);

    const getActionDescription = () => {
        const lower = message.toLowerCase();
        if (lower.includes('like')) return 'like reviews';
        if (lower.includes('comment')) return 'write comments';
        if (lower.includes('review')) return 'write reviews';
        return 'perform this action';
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            backdrop="blur"
            className="bg-background border-4 border-foreground text-foreground rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] z-[100] font-mono"
            classNames={{
                closeButton: "rounded-none border border-foreground/30 hover:bg-foreground/10"
            }}
        >
            <ModalContent className="rounded-none">
                {isAuth ? (
                    <>
                        <ModalHeader className="flex flex-col gap-1 items-center pt-8 border-b-0 px-6">
                            <div className="w-12 h-12 bg-grey text-black border-2 border-foreground rounded-full flex items-center justify-center mb-2 shadow-[2px_2px_0px_0px_#000] select-none">
                                <FaLock className="text-lg" />
                            </div>
                            <span className="text-xl font-extrabold text-foreground tracking-tight">
                                {title || 'Authentication Required'}
                            </span>
                        </ModalHeader>
                        <ModalBody className="text-center px-6 py-4 flex flex-col gap-3">
                            <p className="text-xs text-foreground/80 font-black uppercase tracking-wider">
                                By students, for students — Adelaide University's course guide.
                            </p>
                            <p className="text-xs text-foreground/80 leading-relaxed bg-background p-4 rounded-none border-2 border-foreground shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] text-left">
                                You need to be logged into your <span className="font-extrabold text-red">CS Club account</span> to {getActionDescription()}. This helps us ensure reviews and community interactions are by genuine students and follow our standards.
                            </p>
                            <div className="flex items-center justify-center gap-2 text-2xs text-foreground/75 font-black uppercase bg-yellow/10 p-2.5 rounded-none border-2 border-dashed border-foreground/30">
                                <FaUserShield className="text-yellow text-xs shrink-0" />
                                <span>Community interactions require an account.</span>
                            </div>
                        </ModalBody>
                        <ModalFooter className="flex justify-end gap-3 pt-4 px-6 pb-6">
                            <Button
                                variant="flat"
                                radius="none"
                                onPress={onClose}
                                className="font-mono text-xs uppercase font-black bg-grey dark:bg-grey/25 text-foreground hover:bg-grey/80 border-2 border-foreground rounded-none h-9 px-4 cursor-pointer"
                            >
                                Cancel
                            </Button>
                            <Button
                                radius="none"
                                onPress={() => {
                                    onClose();
                                    signIn('keycloak');
                                }}
                                className="font-mono text-xs uppercase font-black bg-yellow text-black border-2 border-foreground rounded-none shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0px_0px_#000] dark:hover:shadow-[4px_4px_0px_0px_#fff] active:translate-x-px active:translate-y-px transition-all h-9 px-4 cursor-pointer"
                            >
                                Log In with CS Club account
                            </Button>
                        </ModalFooter>
                    </>
                ) : (
                    <>
                        <ModalHeader className="flex flex-col gap-1 border-b-3 border-foreground px-6 py-4">
                            <span className="font-mixtape text-2xs uppercase font-extrabold text-white bg-red border-2 border-foreground px-2 py-0.5 w-fit shadow-[2px_2px_0px_0px_#000] -rotate-2 inline-block mb-1">
                                {badge || 'Moderation Alert'}
                            </span>
                            <h2 className="font-mixtape uppercase text-xl font-extrabold tracking-tight">
                                {title || 'Submission Blocked'}
                            </h2>
                        </ModalHeader>
                        <ModalBody className="p-6 flex flex-col items-center gap-4 text-center">
                            <div className="rounded-none border-3 border-foreground bg-yellow shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] p-4 text-red text-4xl animate-warning-scale flex justify-center items-center h-16 w-16">
                                <FaExclamationTriangle stroke="black" strokeWidth={15} />
                            </div>
                            <p className="font-mono text-sm leading-relaxed font-bold text-foreground mt-2">
                                {message}
                            </p>
                        </ModalBody>
                        <ModalFooter className="border-t-2 border-dashed border-foreground/30 px-6 py-4 flex justify-center">
                            <Button
                                radius="none"
                                onPress={onClose}
                                className="font-mono text-xs uppercase font-black bg-yellow text-black border-2 border-foreground rounded-none shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0px_0px_#000] dark:hover:shadow-[4px_4px_0px_0px_#fff] active:translate-x-px active:translate-y-px transition-all h-10 px-8 cursor-pointer"
                            >
                                I Understand, Let Me Update It
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};
