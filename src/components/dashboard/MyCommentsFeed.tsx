'use client';

import { Button, Card, CardBody, Textarea } from '@heroui/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaEdit, FaExternalLinkAlt, FaTrashAlt } from 'react-icons/fa';
import { useState, useTransition } from 'react';
import { formatLocalDate } from '@/lib/date-utils';

export interface CommentContribution {
    id: string;
    content: string;
    createdAt: Date;
    reviewId: string;
    courseCode: string;
    reviewTitle: string;
}

interface MyCommentsFeedProps {
    comments: CommentContribution[];
    courseMap: Record<string, string>;
    onEditSave: (commentId: string, content: string) => Promise<void>;
    onDeleteClick: (commentId: string) => void;
}

export const MyCommentsFeed = ({ comments, courseMap, onEditSave, onDeleteClick }: MyCommentsFeedProps) => {
    const [actionTransition, startActionTransition] = useTransition();

    // Local state for comment editing
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editingCommentContent, setEditingCommentContent] = useState('');

    const handleEditClick = (comment: CommentContribution) => {
        setEditingCommentId(comment.id);
        setEditingCommentContent(comment.content);
    };

    const handleCancel = () => {
        setEditingCommentId(null);
        setEditingCommentContent('');
    };

    const [commentError, setCommentError] = useState<string | null>(null);

    const handleSubmit = (commentId: string) => {
        if (!editingCommentContent.trim()) return;
        setCommentError(null);
        startActionTransition(async () => {
            try {
                await onEditSave(commentId, editingCommentContent);
                setEditingCommentId(null);
                setEditingCommentContent('');
            } catch (err: any) {
                setCommentError(err.message || 'Unable to update comment right now.');
            }
        });
    };

    return (
        <div className="flex flex-col gap-6">
            {commentError && (
                <div className="bg-red-500/10 border-2 border-red-500 text-red-600 dark:text-red-400 p-3 text-xs font-mono font-bold flex justify-between items-center rounded-none">
                    <span>{commentError}</span>
                    <button onClick={() => setCommentError(null)} className="text-xs font-black px-2 hover:opacity-75 cursor-pointer">&times;</button>
                </div>
            )}
            {comments.map((comment, idx) => {
                const courseName = courseMap[comment.courseCode.toLowerCase()] || comment.courseCode;
                const isEditing = editingCommentId === comment.id;

                return (
                    <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 0.3) }}
                    >
                        <Card className="bg-background border-3 border-foreground rounded-none shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] hover:shadow-[6px_6px_0px_0px_#000] dark:hover:shadow-[6px_6px_0px_0px_#fff] transition-all duration-200">
                            <CardBody className="p-5 flex flex-col gap-3">
                                
                                {/* Header Context */}
                                <div className="flex flex-wrap items-center gap-2 border-b-2 border-foreground pb-2 text-xs font-mono uppercase font-black">
                                    <span className="text-[10px] text-black bg-blue border border-foreground px-2 py-0.5 shadow-[1.5px_1.5px_0px_0px_#000] rotate-[-1.5deg] leading-none">
                                        {comment.courseCode}
                                    </span>
                                    <Link
                                        href={`/courses/${encodeURIComponent(comment.courseCode)}`}
                                        className="text-foreground/50 hover:text-primary underline flex items-center gap-1 text-[11px]"
                                    >
                                        {courseName} <FaExternalLinkAlt className="text-[8px]" />
                                    </Link>
                                    <span className="text-foreground/30 font-light">|</span>
                                    <span className="text-red normal-case font-extrabold tracking-tight truncate max-w-[180px] sm:max-w-[300px]">
                                        On review: "{comment.reviewTitle}"
                                    </span>
                                </div>

                                {/* Date */}
                                <div className="text-[9px] font-mono text-foreground/50 font-black uppercase">
                                    Posted on: {formatLocalDate(comment.createdAt)}
                                </div>

                                {/* Content Editor Swap */}
                                {isEditing ? (
                                    <div className="flex flex-col gap-3.5 mt-1">
                                        <Textarea
                                            size="sm"
                                            radius="none"
                                            value={editingCommentContent}
                                            onValueChange={setEditingCommentContent}
                                            minRows={2}
                                            className="font-mono w-full"
                                            classNames={{
                                                inputWrapper: "border-2 border-foreground bg-background rounded-none shadow-none group-data-[focus=true]:border-foreground",
                                                input: "placeholder:text-grey text-foreground",
                                            }}
                                        />
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="sm"
                                                radius="none"
                                                variant="flat"
                                                onPress={handleCancel}
                                                className="font-mono text-2xs uppercase border border-foreground cursor-pointer"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                size="sm"
                                                radius="none"
                                                isLoading={actionTransition}
                                                onPress={() => handleSubmit(comment.id)}
                                                className="font-mono text-2xs uppercase font-black bg-yellow text-black border-foreground shadow-[2px_2px_0px_0px_#000] border-2 cursor-pointer"
                                            >
                                                Save Changes
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="font-mono text-sm font-bold text-foreground leading-relaxed whitespace-pre-line bg-background border border-foreground/20 p-3 rounded-none">
                                        {comment.content}
                                    </p>
                                )}

                                {/* Actions */}
                                {!isEditing && (
                                    <div className="flex gap-3 justify-end border-t border-foreground/10 pt-2">
                                        <Button
                                            size="sm"
                                            variant="flat"
                                            radius="none"
                                            startContent={<FaEdit />}
                                            onPress={() => handleEditClick(comment)}
                                            className="font-mono text-xs uppercase font-black bg-background border-2 border-foreground shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] cursor-pointer"
                                        >
                                            Edit Comment
                                        </Button>
                                        
                                        <Button
                                            size="sm"
                                            color="danger"
                                            variant="flat"
                                            radius="none"
                                            startContent={<FaTrashAlt />}
                                            onPress={() => onDeleteClick(comment.id)}
                                            className="font-mono text-xs uppercase font-black bg-background text-red border-2 border-red hover:bg-red hover:text-white shadow-[2px_2px_0px_0px_#000] cursor-pointer"
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                )}

                            </CardBody>
                        </Card>
                    </motion.div>
                );
            })}
        </div>
    );
};
