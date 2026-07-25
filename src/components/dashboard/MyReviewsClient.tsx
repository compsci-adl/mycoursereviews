'use client';

import { Button, useDisclosure } from '@heroui/react';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { clsx } from 'clsx';
import { FaComments, FaGraduationCap } from 'react-icons/fa';

import { deleteComment, deleteReview, updateComment, updateReview } from '@/app/actions/reviews';
import { MyReviewsFeed, ReviewContribution } from './MyReviewsFeed';
import { MyCommentsFeed, CommentContribution } from './MyCommentsFeed';
import { EditReviewModal, ReviewToEdit } from './EditReviewModal';

interface MyReviewsClientProps {
    reviews: ReviewContribution[];
    comments: CommentContribution[];
    courseMap: Record<string, string>;
}

export const MyReviewsClient = ({ reviews, comments, courseMap }: MyReviewsClientProps) => {
    const [activeTab, setActiveTab] = useState<'reviews' | 'comments'>('reviews');
    const [, startActionTransition] = useTransition();

    // Review Edit Modal States
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [selectedReview, setSelectedReview] = useState<ReviewContribution | null>(null);

    // Comment CRUD triggers
    const handleCommentEditSave = async (commentId: string, content: string) => {
        await updateComment(commentId, content);
    };

    const [actionError, setActionError] = useState<string | null>(null);

    const handleCommentDeleteClick = (commentId: string) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;
        setActionError(null);
        startActionTransition(async () => {
            const res = await deleteComment(commentId);
            if (res && !res.success) {
                setActionError(res.error || 'Unable to delete comment right now.');
            }
        });
    };

    // Review CRUD triggers
    const handleReviewDeleteClick = (reviewId: string) => {
        if (!confirm('Are you sure you want to delete this review? This will permanently remove all sub-scores, likes, and nested comments.')) return;
        setActionError(null);
        startActionTransition(async () => {
            const res = await deleteReview(reviewId);
            if (res && !res.success) {
                setActionError(res.error || 'Unable to delete review right now.');
            }
        });
    };

    const handleReviewEditClick = (review: ReviewContribution) => {
        setSelectedReview(review);
        onOpen();
    };

    const handleReviewSave = async (formData: any) => {
        if (!selectedReview) return;
        await updateReview(selectedReview.id, formData);
    };

    // Convert ReviewContribution to ReviewToEdit for the shared modal
    const reviewToEdit: ReviewToEdit | null = selectedReview ? {
        id: selectedReview.id,
        courseCode: selectedReview.courseCode,
        title: selectedReview.title,
        description: selectedReview.description,
        overallRating: selectedReview.overallRating,
        difficultyScore: selectedReview.difficultyScore,
        usefulnessScore: selectedReview.usefulnessScore,
        enjoymentScore: selectedReview.enjoymentScore,
        termTaken: selectedReview.termTaken,
        grade: selectedReview.grade,
        isAnonymous: selectedReview.isAnonymous,
    } : null;

    return (
        <div className="flex flex-col gap-8 md:gap-12 bg-grid-sheet mx-[-1.5rem] sm:mx-[-2rem] mt-[-2rem] px-6 sm:px-8 py-8 w-[calc(100%+3rem)] sm:w-[calc(100%+4rem)] min-h-screen items-center">
            <div className="max-w-screen-xl w-full flex flex-col gap-8 md:gap-12">
                {actionError && (
                    <div className="bg-red-500/10 border-2 border-red-500 text-red-600 dark:text-red-400 p-3 text-xs font-mono font-bold flex justify-between items-center rounded-none">
                        <span>{actionError}</span>
                        <button onClick={() => setActionError(null)} className="text-xs font-black px-2 hover:opacity-75 cursor-pointer">&times;</button>
                    </div>
                )}
                
                {/* Dashboard Title Banner */}
                <div className="flex flex-col gap-2 bg-background border-4 border-foreground p-6 sm:p-8 rounded-none shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff]">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <span className="font-mono text-2xs uppercase font-extrabold text-white bg-purple border-2 border-foreground px-3 py-1 shadow-[2px_2px_0px_0px_#000] rotate-[-1.5deg] inline-block mb-2 select-none">
                                Contributor Station
                            </span>
                            <h1 className="font-mixtape uppercase tracking-tighter text-3xl sm:text-5xl font-black leading-none mt-1">
                                My Reviews & Comments
                            </h1>
                            <p className="font-mono text-xs text-foreground/80 font-bold rotate-[0.5deg] mt-3">
                                Review, edit, and moderate your course guide contributions in one place.
                            </p>
                        </div>
                        
                        <Button
                            as={Link}
                            href="/courses"
                            size="sm"
                            className="font-mono uppercase font-black text-xs border-2 border-foreground bg-yellow text-black rounded-none shadow-[3px_3px_0px_0px_#000] rotate-[1.5deg] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                        >
                            Browse Courses &rarr;
                        </Button>
                    </div>
                </div>

                {/* Main Dashboard Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                    
                    {/* Tab Navigation Column (Left/Sidebar on desktop) */}
                    <div className="lg:col-span-1 flex flex-row lg:flex-col gap-3 w-full">
                        <button
                            onClick={() => setActiveTab('reviews')}
                            className={clsx(
                                "w-full font-mono text-xs uppercase font-black px-4 py-3.5 border-3 transition-all duration-200 rounded-none text-left flex items-center justify-between shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] cursor-pointer",
                                activeTab === 'reviews'
                                    ? "bg-red text-white border-foreground translate-x-[2px] translate-y-[2px] shadow-none"
                                    : "bg-background text-foreground border-foreground hover:bg-secondary hover:text-white"
                            )}
                        >
                            <span>My Reviews</span>
                            <span className="bg-red text-white text-[10px] px-1.5 py-0.5 border border-foreground font-black font-mono leading-none">
                                {reviews.length}
                            </span>
                        </button>
                        
                        <button
                            onClick={() => setActiveTab('comments')}
                            className={clsx(
                                "w-full font-mono text-xs uppercase font-black px-4 py-3.5 border-3 transition-all duration-200 rounded-none text-left flex items-center justify-between shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] cursor-pointer",
                                activeTab === 'comments'
                                    ? "bg-blue text-white border-foreground translate-x-[2px] translate-y-[2px] shadow-none"
                                    : "bg-background text-foreground border-foreground hover:bg-secondary hover:text-white"
                            )}
                        >
                            <span>My Comments</span>
                            <span className="bg-blue text-white text-[10px] px-1.5 py-0.5 border border-foreground font-black font-mono leading-none">
                                {comments.length}
                            </span>
                        </button>
                    </div>

                    {/* Contributions Feed Column (Right/Content) */}
                    <div className="lg:col-span-3 flex flex-col gap-6 w-full">
                        
                        {activeTab === 'reviews' && (
                            <div className="flex flex-col gap-6">
                                {reviews.length === 0 ? (
                                    <div className="text-center py-16 bg-background border-4 border-dashed border-foreground rounded-none shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] flex flex-col items-center justify-center p-6">
                                        <FaGraduationCap className="text-foreground text-5xl mb-4" />
                                        <h3 className="font-mixtape font-extrabold uppercase text-lg">No reviews written yet</h3>
                                        <p className="font-mono text-xs mt-2 text-foreground/60 max-w-sm leading-relaxed">
                                            You haven't posted any course ratings yet. Find a course you took and submit a review!
                                        </p>
                                        <Button
                                            as={Link}
                                            href="/courses"
                                            size="sm"
                                            className="mt-6 font-mono uppercase font-black text-xs border-2 border-foreground bg-yellow text-black rounded-none shadow-[3px_3px_0px_0px_#000]"
                                        >
                                            Find Courses
                                        </Button>
                                    </div>
                                ) : (
                                    <MyReviewsFeed
                                        reviews={reviews}
                                        courseMap={courseMap}
                                        onEditClick={handleReviewEditClick}
                                        onDeleteClick={handleReviewDeleteClick}
                                    />
                                )}
                            </div>
                        )}

                        {activeTab === 'comments' && (
                            <div className="flex flex-col gap-6">
                                {comments.length === 0 ? (
                                    <div className="text-center py-16 bg-background border-4 border-dashed border-foreground rounded-none shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] flex flex-col items-center justify-center p-6">
                                        <FaComments className="text-foreground text-5xl mb-4" />
                                        <h3 className="font-mixtape font-extrabold uppercase text-lg">No comments written yet</h3>
                                        <p className="font-mono text-xs mt-2 text-foreground/60 max-w-sm leading-relaxed">
                                            You haven't commented on any student reviews yet. Share your insights in threaded discussions!
                                        </p>
                                        <Button
                                            as={Link}
                                            href="/courses"
                                            size="sm"
                                            className="mt-6 font-mono uppercase font-black text-xs border-2 border-foreground bg-yellow text-black rounded-none shadow-[3px_3px_0px_0px_#000]"
                                        >
                                            Find Reviews to Reply
                                        </Button>
                                    </div>
                                ) : (
                                    <MyCommentsFeed
                                        comments={comments}
                                        courseMap={courseMap}
                                        onEditSave={handleCommentEditSave}
                                        onDeleteClick={handleCommentDeleteClick}
                                    />
                                )}
                            </div>
                        )}

                    </div>

                </div>

            </div>

            {/* Custom Shared Edit Review Modal */}
            <EditReviewModal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                review={reviewToEdit}
                onSave={handleReviewSave}
            />

        </div>
    );
};
