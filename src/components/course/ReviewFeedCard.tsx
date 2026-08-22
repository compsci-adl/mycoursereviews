'use client';

import { Button, Card, CardBody, Textarea } from '@heroui/react';
import { motion } from 'motion/react';
import { useState, useTransition } from 'react';
import { clsx } from 'clsx';
import {
    FaComments,
    FaEdit,
    FaHeart,
    FaRegHeart,
    FaTrashAlt,
} from 'react-icons/fa';
import { MdStar } from 'react-icons/md';
import { formatLocalDate } from '@/lib/date-utils';
import { Comment, CommentThread } from './CommentThread';
import { ModerationWarningModal } from './ModerationWarningModal';

export interface Review {
    id: string;
    userId: string;
    title: string;
    description: string;
    overallRating: number;
    difficultyScore: number;
    usefulnessScore: number;
    enjoymentScore: number;
    termTaken: string;
    grade: string | null;
    isAnonymous: boolean;
    reviewerName: string;
    createdAt: Date;
    likesCount: number;
    likedByCurrentUser: boolean;
    comments: Comment[];
}

interface ReviewFeedCardProps {
    review: Review;
    idx: number;
    session: any;
    onLike: (reviewId: string) => Promise<void>;
    onReviewEdit: (review: Review) => void;
    onReviewDelete: (reviewId: string) => Promise<void>;
    onCommentSubmit: (reviewId: string, content: string, parentId?: string) => Promise<void>;
    onCommentEdit: (commentId: string, content: string) => Promise<void>;
    onCommentDelete: (commentId: string) => Promise<void>;
}

export const ReviewFeedCard = ({
    review,
    idx,
    session,
    onLike,
    onReviewEdit,
    onReviewDelete,
    onCommentSubmit,
    onCommentEdit,
    onCommentDelete,
}: ReviewFeedCardProps) => {
    const [likeTransition, startLikeTransition] = useTransition();
    const [commentTransition, startCommentTransition] = useTransition();

    // Local see more / comments tray states
    const [isExpanded, setIsExpanded] = useState(false);
    const [showCommentsRoot, setShowCommentsRoot] = useState(false);
    const [rootCommentContent, setRootCommentContent] = useState('');
    
    // Custom warning modal states
    const [isWarningOpen, setIsWarningOpen] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');

    const shouldTruncate = review.description.length > 180;

    const handleLikeClick = () => {
        if (!session) {
            setWarningMessage('You must be logged in to like reviews.');
            setIsWarningOpen(true);
            return;
        }
        startLikeTransition(async () => {
            try {
                await onLike(review.id);
            } catch (err: any) {
                setWarningMessage(err.message || 'Unable to update like status right now.');
                setIsWarningOpen(true);
            }
        });
    };

    const handleReviewDeleteClick = () => {
        if (!confirm('Are you sure you want to delete this review? All associated comments and likes will be permanently removed.')) return;
        startLikeTransition(async () => {
            try {
                await onReviewDelete(review.id);
            } catch (err: any) {
                setWarningMessage(err.message || 'Unable to delete review right now.');
                setIsWarningOpen(true);
            }
        });
    };

    const handleRootCommentSubmit = () => {
        if (!session) {
            setWarningMessage('Please login to write comments.');
            setIsWarningOpen(true);
            return;
        }
        if (!rootCommentContent.trim()) {
            setWarningMessage('Comment cannot be empty.');
            setIsWarningOpen(true);
            return;
        }
        startCommentTransition(async () => {
            try {
                await onCommentSubmit(review.id, rootCommentContent);
                setRootCommentContent('');
            } catch (err: any) {
                setWarningMessage(err.message || 'Failed to add comment');
                setIsWarningOpen(true);
            }
        });
    };
    return (
        <>
            <motion.div
                id={review.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 0.4) }}
            >
                <Card className="bg-background border-3 border-foreground rounded-none shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] hover:shadow-[6px_6px_0px_0px_#000] dark:hover:shadow-[6px_6px_0px_0px_#fff] hover:-translate-y-0.5 transition-all duration-200">
                    <CardBody className="p-4 flex flex-col gap-3">
                        
                        {/* Review Header */}
                        <div className="flex flex-col gap-1.5 border-b-2 border-foreground pb-2">
                            <div className="flex justify-between items-start gap-2">
                                <h3 className="font-mixtape uppercase tracking-tight text-base font-extrabold text-foreground leading-tight">{review.title}</h3>
                                <div className="flex items-center gap-1 bg-yellow text-black border border-foreground px-1.5 py-0.5 rounded-none font-mono font-black text-[10px] shrink-0">
                                    <MdStar
                                        className="w-3 h-3"
                                        fill="#FAA307"
                                        stroke="black"
                                        strokeWidth={1.2}
                                    />
                                    <span>{review.overallRating.toFixed(1)}</span>
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-mono uppercase font-black text-foreground/60 leading-none">
                                <span className="text-red">{review.isAnonymous ? 'Anonymous' : review.reviewerName}</span>
                                <span className="px-0.5 text-foreground/30">|</span>
                                <span>{formatLocalDate(review.createdAt)}</span>
                                {review.grade && (
                                    <>
                                        <span className="px-0.5 text-foreground/30">|</span>
                                        <span className="text-yellow bg-black px-1 border border-foreground font-bold">Grade: {review.grade}</span>
                                    </>
                                )}
                                <span className="px-0.5 text-foreground/30">|</span>
                                <span className="text-foreground/75 font-semibold">Term taken: {review.termTaken}</span>
                                
                                {(session?.user?.id === review.userId || session?.user?.role === 'admin') && (
                                    <>
                                        <span className="px-0.5 text-foreground/30">|</span>
                                        <button
                                            onClick={() => onReviewEdit(review)}
                                            className="text-yellow hover:scale-105 font-extrabold cursor-pointer uppercase text-[9px] flex items-center gap-1 transition-all"
                                            title="Edit Review"
                                            aria-label="Edit Review"
                                        >
                                            <FaEdit className="w-3 h-3 text-black dark:text-yellow" />
                                            <span>Edit</span>
                                        </button>
                                        <span className="px-0.5 text-foreground/30">|</span>
                                        <button
                                            onClick={handleReviewDeleteClick}
                                            className="text-red hover:scale-105 font-extrabold cursor-pointer uppercase text-[9px] flex items-center gap-1 transition-all"
                                            title="Delete Review"
                                            aria-label="Delete Review"
                                        >
                                            <FaTrashAlt className="w-3 h-3 text-red-500" />
                                            <span>Delete</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Review Content */}
                        <div>
                            <p className={clsx(
                                'text-xs font-mono text-foreground/80 leading-relaxed whitespace-pre-line',
                                !isExpanded && shouldTruncate && 'line-clamp-3'
                            )}>
                                {review.description}
                            </p>
                            
                            {shouldTruncate && (
                                <Button
                                    size="sm"
                                    variant="light"
                                    color="primary"
                                    onPress={() => setIsExpanded(!isExpanded)}
                                    className="font-mono text-[9px] text-white uppercase font-extrabold underline h-5 mt-1 p-0 hover:underline min-w-0"
                                >
                                    {isExpanded ? 'See Less' : 'See More'}
                                </Button>
                            )}
                        </div>

                        {/* Sub-scores Metrics */}
                        <div className="flex flex-wrap gap-2.5 bg-background border border-foreground p-2 rounded-none text-[9px] font-mono font-black text-foreground/75 w-fit">
                            <span>DIFFICULTY: <span className={review.difficultyScore > 3.5 ? 'text-red' : 'text-yellow'}>{review.difficultyScore}/5</span></span>
                            <span>USEFULNESS: <span className="text-blue">{review.usefulnessScore}/5</span></span>
                            <span>ENJOYMENT: <span className="text-yellow">{review.enjoymentScore}/5</span></span>
                        </div>

                        {/* Review Actions Panel: Like & Comments */}
                        <div className="border-t border-dashed border-foreground/30 pt-2 flex flex-col gap-2.5">
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    radius="none"
                                    variant="flat"
                                    isLoading={likeTransition}
                                    onPress={handleLikeClick}
                                    startContent={review.likedByCurrentUser ? <FaHeart className="text-black" /> : <FaRegHeart />}
                                    className={clsx(
                                        "font-mono text-[9px] h-6 px-2 uppercase font-black border border-foreground shadow-[1px_1px_0px_0px_#000] transition-all cursor-pointer",
                                        review.likedByCurrentUser ? "bg-red text-white" : "bg-background text-foreground"
                                    )}
                                >
                                    Like{review.likesCount > 0 && ` (${review.likesCount})`}
                                </Button>

                                <Button
                                    size="sm"
                                    radius="none"
                                    variant="flat"
                                    startContent={<FaComments />}
                                    onPress={() => setShowCommentsRoot(!showCommentsRoot)}
                                    className="font-mono text-[9px] h-6 px-2 uppercase font-black bg-background border border-foreground shadow-[1px_1px_0px_0px_#000] text-foreground cursor-pointer"
                                >
                                    Comments ({review.comments.length})
                                </Button>
                            </div>

                            {/* Comments Feed Panel */}
                            <div className="bg-foreground/[0.03] p-3 rounded-none border border-dashed border-foreground/35 flex flex-col gap-2.5">
                                <h4 className="font-mixtape text-[9px] uppercase font-extrabold text-foreground/50 tracking-wider">Comments Feed</h4>

                                {/* Thread Root Input */}
                                {session && showCommentsRoot && (
                                    <div className="flex flex-col gap-1.5 mt-1">
                                        <Textarea
                                            size="sm"
                                            radius="none"
                                            placeholder="Write a comment..."
                                            value={rootCommentContent}
                                            onValueChange={setRootCommentContent}
                                            minRows={2}
                                            className="font-mono w-full text-xs"
                                            classNames={{
                                                inputWrapper: "border border-foreground bg-background rounded-none shadow-none group-data-[focus=true]:border-foreground",
                                                input: "placeholder:text-grey text-foreground",
                                            }}
                                        />
                                        <div className="flex justify-end gap-1.5">
                                            <Button
                                                size="sm"
                                                radius="none"
                                                variant="flat"
                                                onPress={() => setShowCommentsRoot(false)}
                                                className="font-mono text-[9px] h-5 border border-foreground py-0.5 px-1.5 cursor-pointer"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                size="sm"
                                                radius="none"
                                                isLoading={commentTransition}
                                                onPress={handleRootCommentSubmit}
                                                className="font-mono text-[9px] h-5 uppercase font-black bg-yellow text-black border border-foreground shadow-[1px_1px_0px_0px_#000] py-0.5 px-1.5 cursor-pointer"
                                            >
                                                Add a Comment
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {review.comments.length === 0 ? (
                                    <p className="font-mono text-[9px] text-foreground/50 font-semibold italic py-1">No comments yet.</p>
                                ) : (
                                    <CommentThread
                                        reviewId={review.id}
                                        commentsList={review.comments}
                                        session={session}
                                        onCommentSubmit={onCommentSubmit}
                                        onCommentEdit={onCommentEdit}
                                        onCommentDelete={onCommentDelete}
                                    />
                                )}
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </motion.div>
            <ModerationWarningModal
                isOpen={isWarningOpen}
                onClose={() => setIsWarningOpen(false)}
                message={warningMessage}
            />
        </>
    );
};
