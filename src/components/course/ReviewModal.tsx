'use client';

import { Button, Checkbox, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, Textarea } from '@heroui/react';
import { useState, useTransition } from 'react';
import { clsx } from 'clsx';
import { MdStar } from 'react-icons/md';
import { z } from 'zod';

import { submitReview } from '@/app/actions/reviews';
import { TermsAndConditionsModal } from './TermsAndConditionsModal';
import { RatingSliders } from './RatingSliders';
import { TERMS_OPTIONS, GRADE_OPTIONS } from '@/config/site';
import { checkTextForProfanity } from '@/lib/profanity';
import { checkTextForSpam } from '@/lib/spam';

// Schema matching Server Action validation
const ReviewFormSchema = z.object({
    title: z.string()
        .min(3, 'Title must be at least 3 characters')
        .max(100)
        .superRefine((val, ctx) => {
            if (checkTextForProfanity(val).containsProfanity) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Profanity or bad sentiment detected. Please write a meaningful, constructive response.',
                });
            }
        }),
    description: z.string()
        .min(10, 'Description must be at least 10 characters')
        .max(2000)
        .superRefine((val, ctx) => {
            const wordCount = val.trim().split(/\s+/).filter(Boolean).length;
            if (wordCount < 20) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Review description must be at least 20 words',
                });
                return;
            }
            if (checkTextForProfanity(val).containsProfanity) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Profanity or bad sentiment detected. Please write a meaningful, constructive response.',
                });
                return;
            }
            const spamCheck = checkTextForSpam(val);
            if (spamCheck.isSpam) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: spamCheck.errorMsg || 'Spam detected. Please write a meaningful, constructive response.',
                });
            }
        }),
    overallRating: z.number().int().min(1).max(5),
    difficultyScore: z.number().min(0.5).max(5),
    usefulnessScore: z.number().min(0.5).max(5),
    enjoymentScore: z.number().min(0.5).max(5),
    termTaken: z.string().min(1, 'Term Taken is required'),
    grade: z.string().optional(),
    isAnonymous: z.boolean().default(false),
    agreeToTerms: z.literal(true, {
        message: 'You must agree to the Terms & Conditions',
    }),
});

interface ReviewModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    courseCode: string;
    courseName: string;
}

export const ReviewModal = ({ isOpen, onOpenChange, courseCode }: ReviewModalProps) => {
    const [isPending, startTransition] = useTransition();

    // Form States
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [overallRating, setOverallRating] = useState(5);
    const [difficultyScore, setDifficultyScore] = useState(3);
    const [usefulnessScore, setUsefulnessScore] = useState(3);
    const [enjoymentScore, setEnjoymentScore] = useState(3);
    const [termTaken, setTermTaken] = useState('');
    const [grade, setGrade] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [isTermsOpen, setIsTermsOpen] = useState(false);

    // Validation Errors State
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Star rating hover/click help state
    const [hoveredStar, setHoveredStar] = useState<number | null>(null);

    const handleSubmit = (onClose: () => void) => {
        setErrors({});

        const formData = {
            title,
            description,
            overallRating,
            difficultyScore,
            usefulnessScore,
            enjoymentScore,
            termTaken,
            grade: grade || undefined,
            isAnonymous,
            agreeToTerms,
        };

        const result = ReviewFormSchema.safeParse(formData);

        if (!result.success) {
            const newErrors: Record<string, string> = {};
            result.error.issues.forEach((issue) => {
                const path = issue.path[0] as string;
                newErrors[path] = issue.message;
            });
            setErrors(newErrors);
            return;
        }

        startTransition(async () => {
            try {
                const res = await submitReview({
                    ...result.data,
                    courseCode,
                });
                
                if (res && !res.success) {
                    setErrors({ submit: res.error || 'Failed to submit review' });
                    return;
                }

                // Clear state on success
                setTitle('');
                setDescription('');
                setOverallRating(5);
                setDifficultyScore(3);
                setUsefulnessScore(3);
                setEnjoymentScore(3);
                setTermTaken('');
                setGrade('');
                setIsAnonymous(false);
                setAgreeToTerms(false);
                
                onClose();
            } catch (err: any) {
                setErrors({ submit: err.message || 'Failed to submit review' });
            }
        });
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" scrollBehavior="inside" className="bg-background border-4 border-foreground text-foreground rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
            <ModalContent className="rounded-none">
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1 border-b-3 border-foreground px-6 py-4">
                            <span className="font-mixtape text-xs uppercase font-extrabold text-black bg-yellow border-2 border-foreground px-2 py-0.5 w-fit shadow-[2px_2px_0px_0px_#000] rotate-[-2deg] inline-block mb-1">{courseCode}</span>
                            <h2 className="font-mixtape uppercase text-xl font-extrabold tracking-tight">Review this Course</h2>
                            <p className="font-mono text-xs text-foreground/80 font-bold rotate-[0.5deg]">
                                Help other Adelaide University students make informed choices by sharing your feedback.
                            </p>
                        </ModalHeader>

                        <ModalBody className="gap-6 py-4">

                            {/* Overall 5-star Selector */}
                            <div className="flex flex-col gap-2 font-mono">
                                <label className="text-xs font-black uppercase text-foreground">Overall Star Rating</label>
                                <div className="flex items-center gap-1.5 text-2xl">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <MdStar
                                            key={star}
                                            className={clsx(
                                                'w-6 h-6 cursor-pointer transition-colors duration-200',
                                                star <= (hoveredStar ?? overallRating) ? '' : 'opacity-25 text-foreground'
                                            )}
                                            fill={star <= (hoveredStar ?? overallRating) ? '#FAA307' : 'currentColor'}
                                            stroke="black"
                                            strokeWidth={1.2}
                                            onClick={() => setOverallRating(star)}
                                            onMouseEnter={() => setHoveredStar(star)}
                                            onMouseLeave={() => setHoveredStar(null)}
                                        />
                                    ))}
                                    <span className="text-xs font-black text-foreground/60 ml-2">
                                        ({overallRating} of 5)
                                    </span>
                                </div>
                                {errors.overallRating && <p className="text-3xs text-red-500 font-bold">{errors.overallRating}</p>}
                            </div>

                            {/* Range Rating Sliders Grid */}
                            <RatingSliders
                                difficultyScore={difficultyScore}
                                setDifficultyScore={setDifficultyScore}
                                usefulnessScore={usefulnessScore}
                                setUsefulnessScore={setUsefulnessScore}
                                enjoymentScore={enjoymentScore}
                                setEnjoymentScore={setEnjoymentScore}
                            />

                            {/* Dropdown selectors: Terms and Grades */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Select
                                        label="Term Taken"
                                        radius="none"
                                        placeholder="Select Semester"
                                        selectedKeys={termTaken ? [termTaken] : []}
                                        onSelectionChange={(keys) => setTermTaken(Array.from(keys)[0] as string)}
                                        errorMessage={errors.termTaken}
                                        isInvalid={!!errors.termTaken}
                                        aria-label="Select term taken"
                                        className="font-mono"
                                        classNames={{
                                            trigger: "border-2 border-foreground bg-background rounded-none shadow-none text-foreground",
                                            value: "text-foreground font-mono data-[placeholder=true]:text-grey dark:data-[placeholder=true]:text-grey",
                                        }}
                                        popoverProps={{
                                            classNames: {
                                                base: "rounded-none",
                                                content: "rounded-none border-3 border-foreground bg-background text-foreground shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] p-1"
                                            }
                                        }}
                                        listboxProps={{
                                            itemClasses: {
                                                base: "rounded-none data-[hover=true]:bg-secondary data-[hover=true]:text-white font-mono text-xs",
                                            }
                                        }}
                                    >
                                        {TERMS_OPTIONS.map((term) => (
                                            <SelectItem key={term} textValue={term} className="font-mono text-xs rounded-none">{term}</SelectItem>
                                        ))}
                                    </Select>
                                </div>

                                <div>
                                    <Select
                                        label="Grade Achieved (Optional)"
                                        radius="none"
                                        placeholder="Select Grade"
                                        selectedKeys={grade ? [grade] : []}
                                        onSelectionChange={(keys) => setGrade(Array.from(keys)[0] as string)}
                                        aria-label="Select grade achieved"
                                        className="font-mono"
                                        classNames={{
                                            trigger: "border-2 border-foreground bg-background rounded-none shadow-none text-foreground",
                                            value: "text-foreground font-mono data-[placeholder=true]:text-grey dark:data-[placeholder=true]:text-grey",
                                        }}
                                        popoverProps={{
                                            classNames: {
                                                base: "rounded-none",
                                                content: "rounded-none border-3 border-foreground bg-background text-foreground shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] p-1"
                                            }
                                        }}
                                        listboxProps={{
                                            itemClasses: {
                                                base: "rounded-none data-[hover=true]:bg-secondary data-[hover=true]:text-white font-mono text-xs",
                                            }
                                        }}
                                    >
                                        {GRADE_OPTIONS.map((g) => (
                                            <SelectItem key={g.value} textValue={g.label} className="font-mono text-xs rounded-none">{g.label}</SelectItem>
                                        ))}
                                    </Select>
                                </div>
                            </div>

                            {/* Title text input */}
                            <div>
                                <Input
                                    label="Review Title"
                                    radius="none"
                                    placeholder="Summarize your experience (e.g., 'Fantastic course with high practical values')"
                                    value={title}
                                    onValueChange={setTitle}
                                    isInvalid={!!errors.title}
                                    errorMessage={errors.title}
                                    className="font-mono"
                                    classNames={{
                                        inputWrapper: "border-2 border-foreground bg-background rounded-none shadow-none group-data-[focus=true]:border-foreground",
                                        input: "placeholder:text-grey dark:placeholder:text-grey text-foreground",
                                    }}
                                />
                            </div>

                            {/* Description text area */}
                            <div>
                                <Textarea
                                    label="Review Description"
                                    radius="none"
                                    placeholder="Detail the course contents, lecturer styles, assignments difficulty, and study tips..."
                                    value={description}
                                    onValueChange={setDescription}
                                    isInvalid={!!errors.description}
                                    errorMessage={errors.description}
                                    minRows={4}
                                    className="font-mono"
                                    classNames={{
                                        inputWrapper: "border-2 border-foreground bg-background rounded-none shadow-none group-data-[focus=true]:border-foreground",
                                        input: "placeholder:text-grey dark:placeholder:text-grey text-foreground",
                                    }}
                                />
                            </div>

                            {/* Anonymity and Agreement Options Checkboxes */}
                            <div className="flex flex-col gap-3 mt-2 bg-foreground/[0.03] p-4 border-2 border-dashed border-foreground/30 text-xs font-mono">
                                <Checkbox
                                    isSelected={isAnonymous}
                                    onValueChange={setIsAnonymous}
                                    size="sm"
                                    radius="none"
                                    className="rounded-none"
                                >
                                    <div className="flex flex-col gap-0.5 ml-1">
                                        <span className="font-black uppercase text-2xs">Post Anonymously</span>
                                        <span className="text-[9px] text-foreground/60 leading-none">
                                            Your name will be hidden from public view, but retained in the admin logs for safety checks.
                                        </span>
                                    </div>
                                </Checkbox>

                                <Checkbox
                                    isSelected={agreeToTerms}
                                    onValueChange={setAgreeToTerms}
                                    isInvalid={!!errors.agreeToTerms}
                                    size="sm"
                                    radius="none"
                                    className="rounded-none font-bold text-2xs uppercase"
                                >
                                    <div className="flex items-center gap-1 ml-1 text-foreground/75 font-mono text-2xs uppercase font-extrabold">
                                        I agree to the{' '}
                                        <span 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setIsTermsOpen(true);
                                            }} 
                                            className="text-red font-extrabold hover:underline cursor-pointer select-none"
                                        >
                                            Terms & Conditions
                                        </span>
                                    </div>
                                </Checkbox>
                                {errors.agreeToTerms && (
                                    <p className="text-3xs text-red-500 font-bold ml-6">{errors.agreeToTerms}</p>
                                )}
                            </div>

                            {errors.submit && (
                                <div className="text-xs text-red-500 bg-red-500/10 border-2 border-red-500/20 p-3 rounded-none font-mono font-black">
                                    {errors.submit}
                                </div>
                            )}
                        </ModalBody>

                        <ModalFooter className="border-t-3 border-foreground px-6 py-4">
                            <Button radius="none" variant="flat" color="default" onPress={onClose} isDisabled={isPending} className="font-mono text-xs border border-foreground">
                                Cancel
                            </Button>
                            <Button
                                radius="none"
                                isLoading={isPending}
                                isDisabled={!agreeToTerms}
                                onPress={() => handleSubmit(onClose)}
                                className={clsx(
                                    "font-mono text-xs uppercase font-black border-2 border-foreground transition-all",
                                    agreeToTerms 
                                        ? "bg-yellow text-black shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_#000] dark:hover:shadow-[4px_4px_0px_0px_#fff] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_#000] dark:active:shadow-[2px_2px_0px_0px_#fff]" 
                                        : "bg-grey/30 text-foreground/40 cursor-not-allowed opacity-50 shadow-none border-dashed"
                                )}
                            >
                                Submit Review
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
            {/* Terms sub-modal inside ReviewModal */}
            <TermsAndConditionsModal
                isOpen={isTermsOpen}
                onClose={() => setIsTermsOpen(false)}
            />
        </Modal>
    );
};
