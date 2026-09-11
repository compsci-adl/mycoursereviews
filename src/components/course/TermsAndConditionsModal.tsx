'use client';

import {
    Modal,
    ModalBody,
    ModalContent,
    ModalHeader,
} from '@heroui/react';

interface TermsAndConditionsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const TermsAndConditionsModal = ({ isOpen, onClose }: TermsAndConditionsModalProps) => {
    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            className="bg-background border-4 border-foreground text-foreground rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] z-[100] font-mono"
        >
            <ModalContent className="rounded-none">
                <ModalHeader className="font-mixtape uppercase tracking-tighter text-xl border-b-3 border-foreground px-6 py-4">
                    Terms & Conditions
                </ModalHeader>
                <ModalBody className="p-6 font-mono text-sm leading-relaxed max-h-100 overflow-y-auto">
                    <p className="font-bold border-l-3 border-primary pl-3 text-foreground py-0.5 mb-3">
                        By using our services, submitting ratings, or registering, you agree to the following terms of use:
                    </p>
                    <div className="flex flex-col gap-4">
                        <div>
                            <h4 className="font-bold text-foreground">1. Code of Conduct Compliance</h4>
                            <p className="text-xs text-foreground/75 mt-1">Reviews must comply with the Adelaide University Student Charter. Be respectful, fair, and constructive.</p>
                        </div>
                        <div>
                            <h4 className="font-bold text-foreground">2. Spam and Fake Content</h4>
                            <p className="text-xs text-foreground/75 mt-1">Reviews must reflect genuine student enrollment experiences. Duplicate or rating-manipulation reviews will be removed.</p>
                        </div>
                        <div>
                            <h4 className="font-bold text-foreground">3. Offensive & Malicious Content</h4>
                            <p className="text-xs text-foreground/75 mt-1">Profanity, obscene language, personal harassment, and dangerous or malicious code are strictly prohibited.</p>
                        </div>
                        <div>
                            <h4 className="font-bold text-foreground">4. Conflict of Interest</h4>
                            <p className="text-xs text-foreground/75 mt-1">Tutors and course coordinators must not write reviews for semesters in which they were teaching or managing the course.</p>
                        </div>
                    </div>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};
