'use client';

import { Button, Checkbox, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, Textarea } from '@heroui/react';
import { useEffect, useState, useTransition } from 'react';
import { clsx } from 'clsx';
import { MdStar } from 'react-icons/md';
import { TERMS_OPTIONS, GRADE_OPTIONS } from '@/config/site';
import { z } from 'zod';
import { checkTextForProfanity } from '@/lib/profanity';
import { checkTextForSpam } from '@/lib/spam';
import { RatingSliders } from '../course/RatingSliders';

const ReviewEditSchema = z.object({
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
});

export interface ReviewToEdit {
    id: string;
    courseCode?: string;
    title: string;
    description: string;
    overallRating: number;
    difficultyScore: number;
    usefulnessScore: number;
    enjoymentScore: number;
    termTaken: string;
    grade: string | null;
    isAnonymous: boolean;
}

interface EditReviewModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    review: ReviewToEdit | null;
    onSave: (data: z.infer<typeof ReviewEditSchema>) => Promise<void>;
}

export const EditReviewModal = ({ isOpen, onOpenChange, review, onSave }: EditReviewModalProps) => {
    const [isSaving, startSaveTransition] = useTransition();

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

    // Validation Errors
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [hoveredStar, setHoveredStar] = useState<number | null>(null);

    // Sync form state when review changes
    useEffect(() => {
        if (review) {
            setTitle(review.title);
            setDescription(review.description);
            setOverallRating(review.overallRating);
            setDifficultyScore(review.difficultyScore);
            setUsefulnessScore(review.usefulnessScore);
            setEnjoymentScore(review.enjoymentScore);
            setTermTaken(review.termTaken);
            setGrade(review.grade || '');
            setIsAnonymous(review.isAnonymous);
            setErrors({});
        }
    }, [review, isOpen]);

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
        };

        const result = ReviewEditSchema.safeParse(formData);

        if (!result.success) {
            const newErrors: Record<string, string> = {};
            result.error.issues.forEach((issue) => {
                const path = issue.path[0] as string;
                newErrors[path] = issue.message;
            });
            setErrors(newErrors);
            return;
        }

        startSaveTransition(async () => {
            try {
                await onSave(result.data);
                onClose();
            } catch (err: any) {
                setErrors({ submit: err.message || 'Failed to update review' });
            }
        });
    };



    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            size="2xl"
            scrollBehavior="inside"
            className="bg-background border-4 border-foreground text-foreground rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] font-mono"
        >
            <ModalContent className="rounded-none">
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1 border-b-3 border-foreground px-6 py-4">
                            {review?.courseCode && (
                                <span className="font-mixtape text-xs uppercase font-extrabold text-black bg-yellow border-2 border-foreground px-2 py-0.5 w-fit shadow-[2px_2px_0px_0px_#000] -rotate-2 inline-block mb-1">
                                    {review.courseCode}
                                </span>
                            )}
                            <h2 className="font-mixtape uppercase text-xl font-extrabold tracking-tight">Edit Your Review</h2>
                            <p className="font-mono text-xs text-foreground/80 font-bold rotate-[0.5deg]">
                                Modify your rating, score weights, or text comments.
                            </p>
                        </ModalHeader>

                        <ModalBody className="gap-6 py-4">

                            {/* Star Selector */}
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
                                {errors.overallRating && <p className="text-3xs text-red font-bold">{errors.overallRating}</p>}
                            </div>

                            {/* EQ Sliders Grid */}
                            <RatingSliders
                                difficultyScore={difficultyScore}
                                setDifficultyScore={setDifficultyScore}
                                usefulnessScore={usefulnessScore}
                                setUsefulnessScore={setUsefulnessScore}
                                enjoymentScore={enjoymentScore}
                                setEnjoymentScore={setEnjoymentScore}
                            />

                            {/* Terms & Grades selectors */}
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
                                        label="Grade Received (Optional)"
                                        radius="none"
                                        placeholder="Select Grade"
                                        selectedKeys={grade ? [grade] : []}
                                        onSelectionChange={(keys) => setGrade(Array.from(keys)[0] as string)}
                                        errorMessage={errors.grade}
                                        isInvalid={!!errors.grade}
                                        aria-label="Select grade received"
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

                            {/* Review Title Input */}
                            <div className="flex flex-col gap-2 font-mono">
                                <label htmlFor="edit-review-title" className="text-xs font-black uppercase text-foreground">Review Headline</label>
                                <Input
                                    id="edit-review-title"
                                    placeholder="e.g. Great lectures, tough exam!"
                                    radius="none"
                                    value={title}
                                    onValueChange={setTitle}
                                    errorMessage={errors.title}
                                    isInvalid={!!errors.title}
                                    classNames={{
                                        inputWrapper: "border-2 border-foreground bg-background rounded-none shadow-none group-data-[focus=true]:border-foreground",
                                        input: "placeholder:text-grey text-foreground",
                                    }}
                                />
                            </div>

                            {/* Review Description Textarea */}
                            <div className="flex flex-col gap-2 font-mono">
                                <label htmlFor="edit-review-description" className="text-xs font-black uppercase text-foreground">Detailed Review Comments</label>
                                <Textarea
                                    id="edit-review-description"
                                    placeholder="Write your review here... Be as specific as possible to help future students!"
                                    radius="none"
                                    minRows={4}
                                    value={description}
                                    onValueChange={setDescription}
                                    errorMessage={errors.description}
                                    isInvalid={!!errors.description}
                                    classNames={{
                                        inputWrapper: "border-2 border-foreground bg-background rounded-none shadow-none group-data-[focus=true]:border-foreground",
                                        input: "placeholder:text-grey text-foreground",
                                    }}
                                />
                            </div>

                            {/* Anonymous Checkbox */}
                            <div className="flex items-center gap-2 font-mono bg-foreground/[0.03] p-4 border-2 border-dashed border-foreground/30 text-xs">
                                <Checkbox
                                    isSelected={isAnonymous}
                                    onValueChange={setIsAnonymous}
                                    size="sm"
                                    radius="none"
                                    className="rounded-none"
                                >
                                    <div className="flex flex-col gap-0.5 ml-1 font-mono">
                                        <span className="font-black uppercase text-2xs">Post anonymously (Hide my real name)</span>
                                        <span className="text-3xs text-foreground/60 leading-none">
                                            Your name will be hidden from public view, but retained in the admin logs for safety checks.
                                        </span>
                                    </div>
                                </Checkbox>
                            </div>
                            {errors.submit && (
                                <div className="text-xs text-red bg-red/10 border-2 border-red p-3 rounded-none font-mono font-black">
                                    {errors.submit}
                                </div>
                            )}
                        </ModalBody>

                        <ModalFooter className="flex justify-end gap-3 pt-4 px-6 pb-4 border-t-2 border-dashed border-foreground/30">
                            <Button
                                variant="flat"
                                onPress={onClose}
                                isDisabled={isSaving}
                                className="font-mono text-xs uppercase font-black bg-grey dark:bg-grey/25 text-foreground hover:bg-grey/80 border-2 border-foreground rounded-none h-10 px-6 cursor-pointer"
                            >
                                Cancel
                            </Button>
                            <Button
                                isLoading={isSaving}
                                onPress={() => handleSubmit(onClose)}
                                className="font-mono text-xs uppercase font-black bg-yellow text-black border-2 border-foreground rounded-none shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0px_0px_#000] dark:hover:shadow-[4px_4px_0px_0px_#fff] active:translate-x-px active:translate-y-px transition-all h-10 px-6"
                            >
                                Save Changes
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};
