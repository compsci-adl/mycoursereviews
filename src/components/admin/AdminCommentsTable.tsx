'use client';

import { Button, Input, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/react';
import Link from 'next/link';
import { useState } from 'react';
import { FaExternalLinkAlt, FaSearch, FaTrashAlt } from 'react-icons/fa';
import { formatLocalDate } from '@/lib/date-utils';

export interface CommentItem {
    id: string;
    reviewId: string;
    content: string;
    createdAt: Date;
    authorName: string;
    courseCode: string;
}

interface AdminCommentsTableProps {
    comments: CommentItem[];
    onDeleteTrigger: (comment: CommentItem) => void;
}

export const AdminCommentsTable = ({ comments, onDeleteTrigger }: AdminCommentsTableProps) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredComments = comments.filter((c) => {
        const query = searchQuery.toLowerCase().trim();
        return (
            c.courseCode.toLowerCase().includes(query) ||
            c.content.toLowerCase().includes(query) ||
            c.authorName.toLowerCase().includes(query)
        );
    });

    return (
        <div className="flex flex-col gap-6 bg-background border-3 border-foreground p-6 rounded-none shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] font-mono">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-foreground pb-4">
                <h2 className="font-mixtape text-lg sm:text-xl uppercase font-black tracking-tight text-foreground">Submitted Comments Feed</h2>
                
                <Input
                    isClearable
                    placeholder="Search comments..."
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

            {filteredComments.length === 0 ? (
                <p className="text-sm text-foreground/50 font-semibold py-8 text-center uppercase tracking-wide">
                    No comments found matching the filter query.
                </p>
            ) : (
                <Table aria-label="Comments table for moderation" className="text-left font-mono" radius="none">
                    <TableHeader>
                        <TableColumn className="font-black text-xs border-b border-foreground bg-foreground/5">COURSE</TableColumn>
                        <TableColumn className="font-black text-xs border-b border-foreground bg-foreground/5">DATE</TableColumn>
                        <TableColumn className="font-black text-xs border-b border-foreground bg-foreground/5">AUTHOR</TableColumn>
                        <TableColumn className="font-black text-xs border-b border-foreground bg-foreground/5">COMMENT CONTENT</TableColumn>
                        <TableColumn className="font-black text-xs border-b border-foreground bg-foreground/5 text-center">ACTIONS</TableColumn>
                    </TableHeader>
                    <TableBody>
                        {filteredComments.map((comment) => (
                            <TableRow key={comment.id} className="border-b border-dashed border-foreground/35 hover:bg-foreground/5 transition-colors">
                                <TableCell className="font-extrabold text-foreground text-xs">
                                    <span className="font-mixtape text-black bg-yellow border border-foreground px-1.5 py-0.5 w-fit shadow-[1px_1px_0px_0px_#000] -rotate-1 text-2xs font-bold block select-none">
                                        {comment.courseCode}
                                    </span>
                                </TableCell>
                                <TableCell className="text-3xs text-foreground/60 font-black">
                                    {formatLocalDate(comment.createdAt)}
                                </TableCell>
                                <TableCell className="text-2xs font-extrabold">
                                    {comment.authorName}
                                </TableCell>
                                <TableCell className="text-2xs max-w-lg font-semibold">
                                    <div className="max-h-24 overflow-y-auto whitespace-pre-wrap leading-relaxed break-words" style={{ scrollbarWidth: 'thin' }}>
                                        {comment.content}
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Button
                                            as={Link}
                                            href={`/courses/${comment.courseCode}#rev-${comment.reviewId}`}
                                            isIconOnly
                                            size="sm"
                                            radius="none"
                                            variant="flat"
                                            className="h-7 w-7 min-w-7 bg-background text-black border-2 border-foreground hover:bg-yellow shadow-[1px_1px_0px_0px_#000] p-0 cursor-pointer flex items-center justify-center transition-all"
                                            title="Go to parent review"
                                            aria-label="Go to parent review"
                                        >
                                            <FaExternalLinkAlt className="w-2.5 h-2.5" />
                                        </Button>
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            radius="none"
                                            variant="flat"
                                            onPress={() => onDeleteTrigger(comment)}
                                            className="h-7 w-7 min-w-7 bg-background text-red border-2 border-red hover:bg-red hover:text-white shadow-[1px_1px_0px_0px_#000] p-0 cursor-pointer flex items-center justify-center transition-all"
                                            title="Delete comment"
                                            aria-label="Delete comment"
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
