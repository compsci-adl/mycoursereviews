'use client';

import { Button, Textarea } from '@heroui/react';
import { useState, useTransition } from 'react';
import { clsx } from 'clsx';
import { FaEdit, FaReply, FaTrashAlt } from 'react-icons/fa';
import { formatLocalDate } from '@/lib/date-utils';
import { ModerationWarningModal } from './ModerationWarningModal';

export interface Comment {
    id: string;
    userId: string;
    userName: string;
    content: string;
    parentId: string | null;
    createdAt: Date;
}

interface CommentThreadProps {
    reviewId: string;
    commentsList: Comment[];
    parentId?: string | null;
    depth?: number;
    session: any;
    onCommentSubmit: (reviewId: string, content: string, parentId?: string) => Promise<void>;
    onCommentEdit: (commentId: string, content: string) => Promise<void>;
    onCommentDelete: (commentId: string) => Promise<void>;
}

export const CommentThread = ({
    reviewId,
    commentsList,
    parentId = null,
    depth = 0,
    session,
    onCommentSubmit,
    onCommentEdit,
    onCommentDelete,
}: CommentThreadProps) => {
    const [actionTransition, startActionTransition] = useTransition();

    // Local reply/edit states
    const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editingContent, setEditingContent] = useState('');

    // im changing here!
    
    // Custom warning modal states
    const [isWarningOpen, setIsWarningOpen] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');

    const filtered = commentsList.filter((c) => c.parentId === parentId);
    if (filtered.length === 0) return null;

    const handleReplySubmit = (commentId: string) => {
        if (!replyContent.trim()) return;
        startActionTransition(async () => {
            try {
                await onCommentSubmit(reviewId, replyContent, commentId);
                setActiveReplyId(null);
                setReplyContent('');
            } catch (err: any) {
                setWarningMessage(err.message || 'Failed to submit reply');
                setIsWarningOpen(true);
            }
        });
    };

    const handleEditSubmit = (commentId: string) => {
        if (!editingContent.trim()) return;
        startActionTransition(async () => {
            try {
                await onCommentEdit(commentId, editingContent);
                setEditingCommentId(null);
                setEditingContent('');
            } catch (err: any) {
                setWarningMessage(err.message || 'Failed to edit comment');
                setIsWarningOpen(true);
            }
        });
    };

    const handleDeleteClick = (commentId: string) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;
        startActionTransition(async () => {
            try {
                await onCommentDelete(commentId);
            } catch (err: any) {
                setWarningMessage(err.message || 'Failed to delete comment');
                setIsWarningOpen(true);
            }
        });
    };

    return (
        <>
            <div className={clsx('flex flex-col gap-3 mt-3', depth > 0 && 'border-l-3 border-foreground pl-4 sm:pl-6')}>
                {filtered.map((comment) => (
                    <div key={comment.id} className="text-xs flex flex-col gap-1.5 bg-background p-3 rounded-none border-2 border-foreground shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]">
                        <div className="flex justify-between items-center text-foreground/60 font-mono text-[10px] uppercase font-black">
                            <span className="text-red font-extrabold">{comment.userName}</span>
                            <span>{formatLocalDate(comment.createdAt)}</span>
                        </div>
                        
                        {editingCommentId === comment.id ? (
                            <div className="flex flex-col gap-2 mt-2">
                                <Textarea
                                    size="sm"
                                    radius="none"
                                    value={editingContent}
                                    onValueChange={setEditingContent}
                                    isDisabled={actionTransition}
                                    className="font-mono"
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
                                        onPress={() => setEditingCommentId(null)}
                                        className="font-mono text-2xs uppercase border border-foreground cursor-pointer"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        size="sm"
                                        radius="none"
                                        isLoading={actionTransition}
                                        onPress={() => handleEditSubmit(comment.id)}
                                        className="font-mono text-2xs uppercase font-black bg-yellow text-black border border-foreground shadow-[2px_2px_0px_0px_#000] cursor-pointer"
                                    >
                                        Save
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <p className="font-mono leading-relaxed break-words text-foreground font-medium">{comment.content}</p>
                        )}

                        {/* Actions (Reply, Edit, Delete) */}
                        <div className="flex items-center gap-4 mt-1 border-t border-dashed border-foreground/20 pt-1.5 text-foreground/50">
                            {session && activeReplyId !== comment.id && editingCommentId !== comment.id && (
                                <button
                                    onClick={() => {
                                        setActiveReplyId(comment.id);
                                        setReplyContent('');
                                    }}
                                    className="flex items-center gap-1 hover:text-blue transition-colors font-mono uppercase text-[9px] font-black cursor-pointer"
                                >
                                    <FaReply className="w-2.5 h-2.5" />
                                    <span>Reply</span>
                                </button>
                            )}

                            {session && session.user?.id === comment.userId && editingCommentId !== comment.id && (
                                <>
                                    <button
                                        onClick={() => {
                                            setEditingCommentId(comment.id);
                                            setEditingContent(comment.content);
                                        }}
                                        className="flex items-center gap-1 hover:text-yellow transition-colors font-mono uppercase text-[9px] font-black cursor-pointer"
                                        title="Edit Comment"
                                        aria-label="Edit Comment"
                                    >
                                        <FaEdit className="w-2.5 h-2.5" />
                                        <span>Edit</span>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(comment.id)}
                                        className="flex items-center gap-1 hover:text-red transition-colors font-mono uppercase text-[9px] font-black cursor-pointer"
                                        title="Delete Comment"
                                        aria-label="Delete Comment"
                                    >
                                        <FaTrashAlt className="w-2.5 h-2.5" />
                                        <span>Delete</span>
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Reply Form Area */}
                        {activeReplyId === comment.id && (
                            <div className="flex flex-col gap-2 mt-2 bg-foreground/[0.02] p-3 border border-dashed border-foreground/35">
                                <Textarea
                                    size="sm"
                                    radius="none"
                                    placeholder={`Reply to ${comment.userName}...`}
                                    value={replyContent}
                                    onValueChange={setReplyContent}
                                    isDisabled={actionTransition}
                                    className="font-mono"
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
                                        onPress={() => setActiveReplyId(null)}
                                        className="font-mono text-2xs uppercase border border-foreground cursor-pointer"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        size="sm"
                                        radius="none"
                                        isLoading={actionTransition}
                                        onPress={() => handleReplySubmit(comment.id)}
                                        className="font-mono text-2xs uppercase font-black bg-blue text-black border border-foreground shadow-[2px_2px_0px_0px_#000] cursor-pointer"
                                    >
                                        Reply
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Render Nested Children */}
                        <CommentThread
                            reviewId={reviewId}
                            commentsList={commentsList}
                            parentId={comment.id}
                            depth={depth + 1}
                            session={session}
                            onCommentSubmit={onCommentSubmit}
                            onCommentEdit={onCommentEdit}
                            onCommentDelete={onCommentDelete}
                        />
                    </div>
                ))}
            </div>
            <ModerationWarningModal
                isOpen={isWarningOpen}
                onClose={() => setIsWarningOpen(false)}
                message={warningMessage}
            />
        </>
    );
};
