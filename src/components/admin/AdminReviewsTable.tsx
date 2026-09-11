'use client';

import { Button, Input, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/react';
import Link from 'next/link';
import { useState } from 'react';
import { FaExternalLinkAlt, FaSearch, FaTrashAlt } from 'react-icons/fa';
import { formatLocalDate } from '@/lib/date-utils';

export interface ReviewItem {
    id: string;
    courseCode: string;
    title: string;
    description: string;
    overallRating: number;
    isAnonymous: boolean;
    reviewerName: string;
    createdAt: Date;
}

interface AdminReviewsTableProps {
    reviews: ReviewItem[];
    onDeleteTrigger: (review: ReviewItem) => void;
}

export const AdminReviewsTable = ({ reviews, onDeleteTrigger }: AdminReviewsTableProps) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredReviews = reviews.filter((r) => {
        const query = searchQuery.toLowerCase().trim();
        return (
            r.courseCode.toLowerCase().includes(query) ||
            r.title.toLowerCase().includes(query) ||
            r.reviewerName.toLowerCase().includes(query)
        );
    });

    return (
        <div className="flex flex-col gap-6 bg-background border-3 border-foreground p-6 rounded-none shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] font-mono">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-foreground pb-4">
                <h2 className="font-mixtape text-lg sm:text-xl uppercase font-black tracking-tight text-foreground">Submitted Reviews Feed</h2>
                
                <Input
                    isClearable
                    placeholder="Search reviews..."
                    startContent={<FaSearch className="text-foreground/60 text-xs shrink-0" />}
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                    className="w-full sm:w-72 font-mono text-xs"
                    classNames={{
                        inputWrapper: "border-2 border-foreground bg-background rounded-none shadow-none group-data-[focus=true]:border-foreground h-9 min-h-9",
                        input: "placeholder:text-grey text-foreground text-xs",
                        clearButton: "text-foreground/50 hover:text-foreground"
                    }}
                />
            </div>

            {filteredReviews.length === 0 ? (
                <p className="text-sm text-foreground/50 font-semibold py-8 text-center uppercase tracking-wide">
                    No reviews found matching the filter query.
                </p>
            ) : (
                <Table aria-label="Course reviews table for moderation" className="text-left font-mono" radius="none">
                    <TableHeader>
                        <TableColumn className="font-black text-xs border-b border-foreground bg-foreground/5">COURSE</TableColumn>
                        <TableColumn className="font-black text-xs border-b border-foreground bg-foreground/5">DATE</TableColumn>
                        <TableColumn className="font-black text-xs border-b border-foreground bg-foreground/5">AUTHOR</TableColumn>
                        <TableColumn className="font-black text-xs border-b border-foreground bg-foreground/5">TITLE</TableColumn>
                        <TableColumn className="font-black text-xs border-b border-foreground bg-foreground/5">DESCRIPTION</TableColumn>
                        <TableColumn className="font-black text-xs border-b border-foreground bg-foreground/5">AUTHOR VISIBILITY</TableColumn>
                        <TableColumn className="font-black text-xs border-b border-foreground bg-foreground/5 text-center">ACTIONS</TableColumn>
                    </TableHeader>
                    <TableBody>
                        {filteredReviews.map((review) => (
                            <TableRow key={review.id} className="border-b border-dashed border-foreground/35 hover:bg-foreground/5 transition-colors">
                                <TableCell className="font-extrabold text-foreground text-xs">
                                    <span className="font-mixtape text-black bg-yellow border border-foreground px-1.5 py-0.5 w-fit shadow-[1px_1px_0px_0px_#000] -rotate-1 text-2xs font-bold block select-none">
                                        {review.courseCode}
                                    </span>
                                </TableCell>
                                <TableCell className="text-3xs text-foreground/60 font-black">
                                    {formatLocalDate(review.createdAt)}
                                </TableCell>
                                <TableCell className="text-2xs font-extrabold">
                                    {review.reviewerName}
                                </TableCell>
                                <TableCell className="text-2xs font-black max-w-37.5 truncate">
                                    {review.title}
                                </TableCell>
                                <TableCell className="text-2xs max-w-sm font-semibold">
                                    <div className="max-h-24 overflow-y-auto whitespace-pre-wrap leading-relaxed break-words" style={{ scrollbarWidth: 'thin' }}>
                                        {review.description}
                                    </div>
                                </TableCell>
                                <TableCell className="text-3xs font-extrabold">
                                    {review.isAnonymous ? (
                                        <span className="text-yellow bg-black border border-foreground px-1.5 py-0.5 font-extrabold text-3xs uppercase select-none">
                                            ANONYMOUS
                                        </span>
                                    ) : (
                                        <span className="text-blue bg-background border-2 border-foreground px-1.5 py-0.5 font-extrabold text-3xs uppercase shadow-[1px_1px_0px_0px_#000] select-none">
                                            PUBLIC
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Button
                                            as={Link}
                                            href={`/courses/${review.courseCode}#${review.id}`}
                                            isIconOnly
                                            size="sm"
                                            radius="none"
                                            variant="flat"
                                            className="h-7 w-7 min-w-7 bg-background text-black border-2 border-foreground hover:bg-yellow shadow-[1px_1px_0px_0px_#000] p-0 cursor-pointer flex items-center justify-center transition-all"
                                            title="Go to review"
                                            aria-label="Go to review"
                                        >
                                            <FaExternalLinkAlt className="w-2.5 h-2.5" />
                                        </Button>
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            radius="none"
                                            variant="flat"
                                            onPress={() => onDeleteTrigger(review)}
                                            className="h-7 w-7 min-w-7 bg-background text-red border-2 border-red hover:bg-red hover:text-white shadow-[1px_1px_0px_0px_#000] p-0 cursor-pointer flex items-center justify-center transition-all"
                                            title="Delete review"
                                            aria-label="Delete review"
                                        >
                                            <FaTrashAlt className="w-3 h-3 text-red-500 hover:text-white" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
};
