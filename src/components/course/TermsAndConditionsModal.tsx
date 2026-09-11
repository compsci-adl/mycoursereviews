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
            className="bg-background border-4 border-foreground text-foreground rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] z-[100] font-mono max-w-2xl"
        >
            <ModalContent className="rounded-none">
                <ModalHeader className="font-mixtape uppercase tracking-tighter text-xl border-b-3 border-foreground px-6 py-4">
                    Terms & Conditions
                </ModalHeader>
                <ModalBody className="p-6 font-mono text-sm leading-relaxed max-h-125 overflow-y-auto flex flex-col gap-4">
                    <div className="bg-yellow/10 border-2 border-foreground p-3.5 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]">
                        <p className="font-black text-xs uppercase tracking-wide text-foreground">
                            By using this service, you agree to these terms and conditions.
                        </p>
                        <p className="text-2xs text-foreground/75 mt-1">
                            Please read these terms carefully before accessing, browsing, rating, or submitting content to MyCourseReviews.
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 text-xs">
                        <div>
                            <h4 className="font-black text-foreground uppercase tracking-wide text-xs mb-1.5">1. Acceptance of Terms</h4>
                            <ul className="list-disc list-inside space-y-1 text-foreground/80 pl-1">
                                <li>By accessing, browsing, or using this service, you agree to these terms and conditions in full.</li>
                                <li>If you do not agree to these terms and conditions, you must immediately discontinue using this service.</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-black text-foreground uppercase tracking-wide text-xs mb-1.5">2. Student Charter & Code of Conduct</h4>
                            <ul className="list-disc list-inside space-y-1 text-foreground/80 pl-1">
                                <li>All reviews, ratings, and comments must comply with the Adelaide University Student Charter.</li>
                                <li>Reviews must reflect genuine student enrollment experiences and be fair, honest, and constructive.</li>
                                <li>Duplicate reviews, automated bot submissions, or coordinated rating manipulation are strictly prohibited.</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-black text-foreground uppercase tracking-wide text-xs mb-1.5">3. Prohibited Content & Conflicts of Interest</h4>
                            <ul className="list-disc list-inside space-y-1 text-foreground/80 pl-1">
                                <li>Profanity, harassment, hate speech, defamation, and discriminatory comments are strictly prohibited.</li>
                                <li>Personal attacks, naming of non-public figures, or posting private personal information (doxxing) is not permitted.</li>
                                <li>Course coordinators, lecturers, and tutors are strictly prohibited from submitting reviews for semesters in which they taught or managed the course.</li>
                            </ul>
                        </div>

                        <div className="bg-red/10 border-2 border-red p-3 rounded-none">
                            <h4 className="font-black text-red uppercase tracking-wide text-xs mb-1.5">4. Removal of Reviews & Moderation Policy</h4>
                            <ul className="list-disc list-inside space-y-1 text-foreground/90 pl-1 font-medium">
                                <li><strong>We will remove reviews that do not meet the Terms & Conditions.</strong></li>
                                <li>We reserve the right to review, edit, unpublish, or permanently delete any content at our sole discretion, without prior notice.</li>
                                <li>Users who repeatedly submit non-compliant, fraudulent, or abusive content may have their access or submission privileges permanently revoked.</li>
                            </ul>
                        </div>
                    </div>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};
