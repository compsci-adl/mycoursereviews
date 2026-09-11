'use client';

import { Button, Card, CardBody } from '@heroui/react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { FaEdit, FaExternalLinkAlt, FaTrashAlt } from 'react-icons/fa';
import { MdStar } from 'react-icons/md';
import { clsx } from 'clsx';
import { formatLocalDate } from '@/lib/date-utils';

export interface ReviewContribution {
    id: string;
    courseCode: string;
    title: string;
    description: string;
    overallRating: number;
    difficultyScore: number;
    usefulnessScore: number;
    enjoymentScore: number;
    termTaken: string;
    grade: string | null;
    isAnonymous: boolean;
    createdAt: Date;
}

interface MyReviewsFeedProps {
    reviews: ReviewContribution[];
    courseMap: Record<string, string>;
    onEditClick: (review: ReviewContribution) => void;
    onDeleteClick: (reviewId: string) => void;
}

export const MyReviewsFeed = ({ reviews, courseMap, onEditClick, onDeleteClick }: MyReviewsFeedProps) => {
    return (
        <div className="flex flex-col gap-6">
            {reviews.map((review, idx) => {
                const courseName = courseMap[review.courseCode.toLowerCase()] || review.courseCode;
                return (
                    <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 0.3) }}
                    >
                        <Card className="bg-background border-3 border-foreground rounded-none shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] hover:shadow-[6px_6px_0px_0px_#000] dark:hover:shadow-[6px_6px_0px_0px_#fff] transition-all duration-200">
                            <CardBody className="p-5 flex flex-col gap-4">
                                
                                {/* Header */}
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-3 border-b-2 border-foreground pb-3">
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-mono text-2xs uppercase font-extrabold text-black bg-yellow border border-foreground px-2 py-0.5 shadow-[1.5px_1.5px_0px_0px_#000] rotate-[-1.5deg] leading-none">
                                                {review.courseCode}
                                            </span>
                                            <Link
                                                href={`/courses/${encodeURIComponent(review.courseCode)}`}
                                                className="font-mixtape text-xs font-black uppercase text-foreground/50 hover:text-primary underline flex items-center gap-1"
                                            >
                                                {courseName} <FaExternalLinkAlt className="text-3xs" />
                                            </Link>
                                        </div>
                                        <h3 className="font-mixtape uppercase tracking-tight text-lg font-black text-foreground mt-1">{review.title}</h3>
                                    </div>
                                    
                                    <div className="flex items-center gap-1.5 bg-yellow text-black border-2 border-foreground px-2.5 py-1 rounded-none font-mono font-black text-xs shadow-[2px_2px_0px_0px_#000] rotate-[1.5deg] self-start sm:self-center">
                                        <MdStar
                                            className="w-4 h-4"
                                            fill="#FAA307"
                                            stroke="black"
                                            strokeWidth={1.2}
                                        />
                                        <span>{review.overallRating.toFixed(1)} / 5</span>
                                    </div>
                                </div>

                                {/* Meta Details */}
                                <div className="flex flex-wrap items-center gap-1.5 text-3xs font-mono uppercase font-black text-foreground/60 leading-none">
                                    <span>Term taken: {review.termTaken}</span>
                                    {review.grade && (
                                        <>
                                            <span className="text-foreground/30 font-light">|</span>
                                            <span className="text-yellow bg-black px-1 border border-foreground font-bold">Grade: {review.grade}</span>
                                        </>
                                    )}
                                    <span className="text-foreground/30 font-light">|</span>
                                    <span>{formatLocalDate(review.createdAt)}</span>
                                    <span className="text-foreground/30 font-light">|</span>
                                    <span className={clsx(review.isAnonymous ? "text-purple" : "text-red")}>
                                        {review.isAnonymous ? "Posted Anonymously" : "Publicly Visible"}
                                    </span>
                                </div>

                                {/* Sub ratings equalizers */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-foreground/[0.02] p-3.5 border-2 border-dashed border-foreground/20 font-mono text-2xs">
                                    
                                    {/* Difficulty */}
                                    <div className="flex flex-col gap-1">
                                        <div className="flex justify-between font-black text-2xs">
                                            <span>DIFFICULTY</span>
                                            <span>{review.difficultyScore.toFixed(1)} / 5</span>
                                        </div>
                                        <div className="flex gap-0.5 select-none">
                                            {Array.from({ length: 10 }).map((_, segIdx) => {
                                                const threshold = (segIdx + 1) / 2;
                                                const active = review.difficultyScore >= threshold;
                                                return (
                                                    <div
                                                        key={segIdx}
                                                        className={clsx(
                                                            "h-4 w-full border border-foreground/60 rounded-none",
                                                            active
                                                                ? review.difficultyScore > 3.5 
                                                                    ? "bg-red" 
                                                                    : review.difficultyScore > 2.5 
                                                                        ? "bg-orange"
                                                                        : "bg-yellow"
                                                                : "bg-foreground/5"
                                                        )}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Usefulness */}
                                    <div className="flex flex-col gap-1">
                                        <div className="flex justify-between font-black text-2xs">
                                            <span>USEFULNESS</span>
                                            <span>{review.usefulnessScore.toFixed(1)} / 5</span>
                                        </div>
                                        <div className="flex gap-0.5 select-none">
                                            {Array.from({ length: 10 }).map((_, segIdx) => {
                                                const threshold = (segIdx + 1) / 2;
                                                const active = review.usefulnessScore >= threshold;
                                                return (
                                                    <div
                                                        key={segIdx}
                                                        className={clsx(
                                                            "h-4 w-full border border-foreground/60 rounded-none",
                                                            active ? "bg-blue" : "bg-foreground/5"
                                                        )}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Enjoyment */}
                                    <div className="flex flex-col gap-1">
                                        <div className="flex justify-between font-black text-2xs">
                                            <span>ENJOYMENT</span>
                                            <span>{review.enjoymentScore.toFixed(1)} / 5</span>
                                        </div>
                                        <div className="flex gap-0.5 select-none">
                                            {Array.from({ length: 10 }).map((_, segIdx) => {
                                                const threshold = (segIdx + 1) / 2;
                                                const active = review.enjoymentScore >= threshold;
                                                return (
                                                    <div
                                                        key={segIdx}
                                                        className={clsx(
                                                            "h-4 w-full border border-foreground/60 rounded-none",
                                                            active ? "bg-yellow" : "bg-foreground/5"
                                                        )}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>

                                </div>

                                {/* Description */}
                                <p className="font-mono text-xs text-foreground/80 leading-relaxed whitespace-pre-line bg-background border border-foreground/20 p-3 rounded-none">
                                    {review.description}
                                </p>

                                {/* Actions */}
                                <div className="flex gap-3 justify-end border-t border-foreground/10 pt-3">
                                    <Button
                                        size="sm"
                                        variant="flat"
                                        radius="none"
                                        startContent={<FaEdit />}
                                        onPress={() => onEditClick(review)}
                                        className="font-mono text-xs uppercase font-black bg-background border-2 border-foreground shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] cursor-pointer"
                                    >
                                        Edit Review
                                    </Button>
                                    
                                    <Button
                                        size="sm"
                                        color="danger"
                                        variant="flat"
                                        radius="none"
                                        startContent={<FaTrashAlt />}
                                        onPress={() => onDeleteClick(review.id)}
                                        className="font-mono text-xs uppercase font-black bg-background text-red border-2 border-red hover:bg-red hover:text-white shadow-[2px_2px_0px_0px_#000] cursor-pointer"
                                    >
                                        Delete
                                    </Button>
                                </div>

							</CardBody>
                        </Card>
                    </motion.div>
                );
            })}
        </div>
    );
};
