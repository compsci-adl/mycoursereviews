'use client';

import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
} from '@heroui/react';
import { FaExclamationTriangle } from 'react-icons/fa';

interface ModerationWarningModalProps {
    isOpen: boolean;
    onClose: () => void;
    message: string;
}

export const ModerationWarningModal = ({ isOpen, onClose, message }: ModerationWarningModalProps) => {
    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            className="bg-background border-4 border-foreground text-foreground rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] z-[100] font-mono"
        >
            <ModalContent className="rounded-none">
                <ModalHeader className="flex flex-col gap-1 border-b-3 border-foreground px-6 py-4">
                    <span className="font-mixtape text-2xs uppercase font-extrabold text-white bg-red border-2 border-foreground px-2 py-0.5 w-fit shadow-[2px_2px_0px_0px_#000] -rotate-2 inline-block mb-1">
                        Moderation Alert
                    </span>
                    <h2 className="font-mixtape uppercase text-xl font-extrabold tracking-tight">Submission Blocked</h2>
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
                        className="font-mono text-xs uppercase font-black bg-yellow text-black border-2 border-foreground rounded-none shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0px_0px_#000] dark:hover:shadow-[4px_4px_0px_0px_#fff] active:translate-x-px active:translate-y-px transition-all h-10 px-8"
                    >
                        I Understand, Let Me Update It
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
