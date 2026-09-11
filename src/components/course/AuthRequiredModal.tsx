'use client';

import React from 'react';
import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
} from '@heroui/react';
import { signIn } from 'next-auth/react';
import { FaLock, FaUserShield } from 'react-icons/fa';

interface AuthRequiredModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    action?: 'review' | 'community' | string;
    message?: React.ReactNode;
    subNote?: React.ReactNode;
}

export const AuthRequiredModal = ({
    isOpen,
    onOpenChange,
    action = 'review',
    message,
    subNote,
}: AuthRequiredModalProps) => {
    const isCommunity = action === 'community';

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            backdrop="blur"
            classNames={{
                base: "border-4 border-foreground rounded-none bg-background shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] p-4 font-mono",
                closeButton: "rounded-none border border-foreground/30 hover:bg-foreground/10"
            }}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1 items-center pt-8">
                            <div className="w-12 h-12 bg-grey text-black border-2 border-foreground rounded-full flex items-center justify-center mb-2 shadow-[2px_2px_0px_0px_#000] select-none">
                                <FaLock className="text-lg" />
                            </div>
                            <span className="text-xl font-extrabold text-foreground tracking-tight">Authentication Required</span>
                        </ModalHeader>
                        <ModalBody className="text-center px-6 py-4 flex flex-col gap-3">
                            <p className="text-xs text-foreground/80 font-black uppercase tracking-wider">
                                By students, for students — Adelaide University's course guide.
                            </p>
                            <p className="text-xs text-foreground/80 leading-relaxed bg-background p-4 rounded-none border-2 border-foreground shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] text-left">
                                {message || (isCommunity ? (
                                    <>
                                        You need to be logged into your <span className="font-extrabold text-red">CS Club account</span> to participate in community interactions. This helps us ensure course update consensus and community feedback are by genuine students and follow our standards.
                                    </>
                                ) : (
                                    <>
                                        You need to be logged into your <span className="font-extrabold text-red">CS Club account</span> to write a review. This helps us ensure reviews are written by genuine students and follow our standards.
                                    </>
                                ))}
                            </p>
                            <div className="flex items-center justify-center gap-2 text-2xs text-foreground/75 font-black uppercase bg-yellow/10 p-2.5 rounded-none border-2 border-dashed border-foreground/30">
                                <FaUserShield className="text-yellow text-xs shrink-0" />
                                {subNote || (isCommunity ? (
                                    <span>Community interactions require you to be logged in.</span>
                                ) : (
                                    <span>Posting anonymously is fully supported if checked on submission.</span>
                                ))}
                            </div>
                        </ModalBody>
                        <ModalFooter className="flex justify-end gap-3 pt-4 px-6 pb-2">
                            <Button
                                variant="flat"
                                onPress={onClose}
                                className="font-mono text-xs uppercase font-black bg-grey dark:bg-grey/25 text-foreground hover:bg-grey/80 border-2 border-foreground rounded-none h-9 px-4 cursor-pointer"
                            >
                                Cancel
                            </Button>
                            <Button
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
                )}
            </ModalContent>
        </Modal>
    );
};
