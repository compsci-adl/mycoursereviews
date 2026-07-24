'use client';

import { Card, CardBody, Chip } from '@heroui/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { clsx } from 'clsx';
import { MdStar } from 'react-icons/md';
import { CourseData } from '@/lib/courses-db';

interface CourseWithStats extends CourseData {
    subject: string;
    avgRating: number;
    avgDifficulty: number;
    avgUsefulness: number;
    avgEnjoyment: number;
    reviewCount: number;
    mostRecentReview: string | null;
    isNoLongerOffered?: boolean;
}

interface CourseCardProps {
    course: CourseWithStats;
    idx: number;
    pageSize: number;
}

export const CourseCard = ({ course }: CourseCardProps) => {
    return (
        <div className="w-full" data-testid="course-card">
            <Card
                as={Link}
                href={`/courses/${encodeURIComponent(course.code)}`}
                isPressable
                isHoverable
                className="bg-background border-4 border-foreground rounded-none shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] hover:-translate-y-1.5 hover:rotate-[1deg] hover:scale-[1.02] hover:shadow-[10px_10px_0px_0px_#000] dark:hover:shadow-[10px_10px_0px_0px_#fff] transition-all duration-300 w-full min-h-[175px] h-full text-left overflow-hidden"
            >
                <CardBody className="p-4 flex flex-col justify-between h-full gap-2.5 overflow-hidden">
                    <div className="flex justify-between items-start gap-2">
                        <span className="font-mixtape text-xs uppercase font-extrabold text-black bg-yellow border-2 border-foreground px-2 py-0.5 shadow-[2px_2px_0px_0px_#000] rotate-[-2deg] shrink-0">
                            {course.code}
                        </span>
                        {course.reviewCount > 0 ? (
                            <div className="flex items-center gap-1 font-mono text-xs font-black text-black bg-yellow px-2.5 py-0.5 border-2 border-foreground shadow-[2px_2px_0px_0px_#000] rotate-[2deg] shrink-0">
                                 <MdStar
                                     className="w-3.5 h-3.5"
                                     fill="#FAA307"
                                     stroke="black"
                                     strokeWidth={1.2}
                                 />
                                <span>{course.avgRating.toFixed(1)}</span>
                                <span className="text-foreground/60 font-normal text-[10px] ml-1">
                                    ({course.reviewCount})
                                </span>
                            </div>
                        ) : (
                            <span className="font-mono text-[10px] uppercase font-black text-foreground/45 bg-foreground/5 px-2 py-0.5 border border-foreground/30 shrink-0">
                                No reviews
                            </span>
                        )}
                    </div>

                    <div>
                        <h3 className="font-mixtape uppercase tracking-tight text-sm sm:text-base font-extrabold line-clamp-2 leading-snug">
                            {course.name}
                        </h3>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
                        {course.terms.slice(0, 3).map((term) => (
                            <Chip
                                key={term}
                                size="sm"
                                radius="none"
                                className={clsx(
                                    "border-2 border-foreground font-mono text-3xs font-extrabold px-2 py-0.5 h-fit leading-none",
                                    term === 'No Longer Offered'
                                        ? "bg-red text-white animate-pulse-custom"
                                        : "bg-blue text-black"
                                )}
                            >
                                {term}
                            </Chip>
                        ))}
                        {course.terms.length > 3 && (
                            <Chip
                                size="sm"
                                radius="none"
                                className="border-2 border-foreground font-mono text-3xs font-extrabold px-1.5 py-0.5 h-fit bg-foreground/10 text-foreground"
                            >
                                +{course.terms.length - 3} more
                            </Chip>
                        )}
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};
