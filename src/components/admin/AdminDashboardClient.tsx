'use client';

import {
    Button,
    Card,
    CardBody,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    useDisclosure,
} from '@heroui/react';
import { useState, useTransition } from 'react';
import { clsx } from 'clsx';
import {
    FaChartBar,
    FaComments,
    FaGraduationCap,
    FaHeart,
    FaTrashAlt,
} from 'react-icons/fa';

import { deleteReview, deleteComment } from '@/app/actions/reviews';
import { AdminReviewsTable, ReviewItem } from './AdminReviewsTable';
import { AdminCommentsTable, CommentItem } from './AdminCommentsTable';

interface AdminDashboardClientProps {
    reviews: ReviewItem[];
    comments: CommentItem[];
    stats: {
        totalReviews: number;
        totalComments: number;
        totalLikes: number;
        totalCourses: number;
    };
}

export const AdminDashboardClient = ({ reviews, comments, stats }: AdminDashboardClientProps) => {
    const [activeTab, setActiveTab] = useState<'reviews' | 'comments'>('reviews');
    
    // Review Deletion Modal State
    const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(null);
    const { isOpen: isReviewOpen, onOpen: onReviewOpen, onOpenChange: onReviewOpenChange } = useDisclosure();

    // Comment Deletion Modal State
    const [selectedComment, setSelectedComment] = useState<CommentItem | null>(null);
    const { isOpen: isCommentOpen, onOpen: onCommentOpen, onOpenChange: onCommentOpenChange } = useDisclosure();

    const [isPending, startTransition] = useTransition();

    const triggerReviewDeleteConfirm = (review: ReviewItem) => {
        setSelectedReview(review);
        onReviewOpen();
    };

    const triggerCommentDeleteConfirm = (comment: CommentItem) => {
        setSelectedComment(comment);
        onCommentOpen();
    };

    const [actionError, setActionError] = useState<string | null>(null);

    const handleReviewDelete = (onClose: () => void) => {
        if (!selectedReview) return;
        setActionError(null);
        startTransition(async () => {
            const res = await deleteReview(selectedReview.id);
            if (res && !res.success) {
                setActionError(res.error || 'Unable to remove review right now.');
                return;
            }
            setSelectedReview(null);
            onClose();
        });
    };

    const handleCommentDelete = (onClose: () => void) => {
        if (!selectedComment) return;
        setActionError(null);
        startTransition(async () => {
            const res = await deleteComment(selectedComment.id);
            if (res && !res.success) {
                setActionError(res.error || 'Unable to remove comment right now.');
                return;
            }
            setSelectedComment(null);
            onClose();
        });
    };

    return (
        <div className="flex flex-col gap-8">
            {actionError && (
                <div className="bg-red-500/10 border-2 border-red-500 text-red-600 dark:text-red-400 p-3 text-xs font-mono font-bold flex justify-between items-center rounded-none">
                    <span>{actionError}</span>
                    <button onClick={() => setActionError(null)} className="text-xs font-black px-2 hover:opacity-75 cursor-pointer">&times;</button>
                </div>
            )}
            
            {/* Page Header */}
            <div className="font-mono">
                <span className="font-mixtape text-[10px] uppercase font-extrabold text-black bg-yellow border-2 border-foreground px-3 py-1 w-fit shadow-[2px_2px_0px_0px_#000] rotate-[-1.5deg] inline-block mb-3 select-none">
                    CS Club Admin
                </span>
                <h1 className="font-mixtape uppercase tracking-tighter text-3xl sm:text-5xl font-black mt-2 leading-none text-foreground">
                    Moderation Dashboard
                </h1>
                <p className="text-sm text-foreground/60 mt-3 font-bold uppercase">
                    Manage Adelaide University course reviews, analyse platform statistics, and moderate reports.
                </p>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-mono">
                
                {/* Total Reviews Card */}
                <Card className="bg-yellow border-3 border-foreground rounded-none shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] rotate-[-1deg] hover:rotate-0 transition-transform duration-200">
                    <CardBody className="p-5 flex items-center justify-between flex-row gap-4">
                        <div className="flex flex-col gap-0.5 text-black">
                            <span className="text-[10px] font-black uppercase tracking-wider opacity-75">Total Reviews</span>
                            <span className="text-3xl font-mixtape font-black uppercase mt-1">{stats.totalReviews}</span>
                        </div>
                        <div className="p-3 bg-black/10 text-black border border-foreground/20 rounded-none">
                            <FaGraduationCap className="text-xl" />
                        </div>
                    </CardBody>
                </Card>

                {/* Total Comments Card */}
                <Card className="bg-blue border-3 border-foreground rounded-none shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] rotate-[1deg] hover:rotate-0 transition-transform duration-200">
                    <CardBody className="p-5 flex items-center justify-between flex-row gap-4">
                        <div className="flex flex-col gap-0.5 text-white">
                            <span className="text-[10px] font-black uppercase tracking-wider opacity-75">Comments Feed</span>
                            <span className="text-3xl font-mixtape font-black uppercase mt-1">{stats.totalComments}</span>
                        </div>
                        <div className="p-3 bg-black/15 text-white border border-foreground/20 rounded-none">
                            <FaComments className="text-xl" />
                        </div>
                    </CardBody>
                </Card>

                {/* Total Likes Card */}
                <Card className="bg-red border-3 border-foreground rounded-none shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] rotate-[-0.5deg] hover:rotate-0 transition-transform duration-200">
                    <CardBody className="p-5 flex items-center justify-between flex-row gap-4">
                        <div className="flex flex-col gap-0.5 text-white">
                            <span className="text-[10px] font-black uppercase tracking-wider opacity-75">Review Likes</span>
                            <span className="text-3xl font-mixtape font-black uppercase mt-1">{stats.totalLikes}</span>
                        </div>
                        <div className="p-3 bg-black/15 text-white border border-foreground/20 rounded-none">
                            <FaHeart className="text-xl" />
                        </div>
                    </CardBody>
                </Card>

                {/* Total Active Courses Reviewed Card */}
                <Card className="bg-purple border-3 border-foreground rounded-none shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] rotate-[0.5deg] hover:rotate-0 transition-transform duration-200">
                    <CardBody className="p-5 flex items-center justify-between flex-row gap-4">
                        <div className="flex flex-col gap-0.5 text-white">
                            <span className="text-[10px] font-black uppercase tracking-wider opacity-75">Active Courses</span>
                            <span className="text-3xl font-mixtape font-black uppercase mt-1">{stats.totalCourses}</span>
                        </div>
                        <div className="p-3 bg-black/15 text-white border border-foreground/20 rounded-none">
                            <FaChartBar className="text-xl" />
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Active Zine Tabs */}
            <div className="flex gap-4 font-mono select-none">
                <button
                    onClick={() => setActiveTab('reviews')}
                    className={clsx(
                        "font-mono font-black text-xs uppercase px-4 py-2.5 border-3 border-foreground rounded-none transition-all duration-150 cursor-pointer shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff]",
                        "hover:scale-105 active:scale-95",
                        activeTab === 'reviews'
                            ? "bg-yellow text-black border-3 border-foreground"
                            : "bg-background text-foreground hover:bg-foreground/10"
                    )}
                >
                    Reviews Feed ({reviews.length})
                </button>
                <button
                    onClick={() => setActiveTab('comments')}
                    className={clsx(
                        "font-mono font-black text-xs uppercase px-4 py-2.5 border-3 border-foreground rounded-none transition-all duration-150 cursor-pointer shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff]",
                        "hover:scale-105 active:scale-95",
                        activeTab === 'comments'
                            ? "bg-blue text-white border-blue border-3"
                            : "bg-background text-foreground hover:bg-foreground/10"
                    )}
                >
                    Comments Feed ({comments.length})
                </button>
            </div>

            {/* Render Active Table */}
            {activeTab === 'reviews' ? (
                <AdminReviewsTable reviews={reviews} onDeleteTrigger={triggerReviewDeleteConfirm} />
            ) : (
                <AdminCommentsTable comments={comments} onDeleteTrigger={triggerCommentDeleteConfirm} />
            )}

            {/* Confirm Moderation Delete dialog */}
            <Modal 
                isOpen={isReviewOpen} 
                onOpenChange={onReviewOpenChange}
                backdrop="blur"
                classNames={{
                    base: "border-4 border-foreground rounded-none bg-background shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] p-4 font-mono",
                    closeButton: "rounded-none border border-foreground/30 hover:bg-foreground/10 text-foreground"
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex items-center gap-2 border-b-2 border-foreground pb-2">
                                <div className="w-8 h-8 bg-red text-white border-2 border-foreground rounded-full flex items-center justify-center shadow-[1.5px_1.5px_0px_0px_#000]">
                                    <FaTrashAlt className="text-xs text-white" />
                                </div>
                                <h3 className="text-base font-extrabold uppercase text-foreground">Confirm Deletion</h3>
                            </ModalHeader>
                            <ModalBody className="py-4 flex flex-col gap-3">
                                <p className="text-xs text-foreground/80 leading-relaxed bg-foreground/5 p-4 rounded-none border-2 border-foreground shadow-[2px_2px_0px_0px_#000] text-left">
                                    Are you sure you want to permanently delete the review{' '}
                                    <strong className="text-red">&ldquo;{selectedReview?.title}&rdquo;</strong> for{' '}
                                    <strong className="text-black bg-yellow border border-foreground px-1 py-0.5 text-3xs font-extrabold inline-block shadow-[1px_1px_0px_0px_#000] rotate-[-1.5deg]">{selectedReview?.courseCode}</strong>?
                                </p>
                                <div className="flex items-center gap-2 text-3xs text-red font-black uppercase bg-red/10 p-2.5 rounded-none border-2 border-dashed border-red/40 leading-relaxed">
                                    <span>Warning: Deleting this review is permanent. It will automatically cascade-delete all of its child comment threads and likes as well.</span>
                                </div>
                            </ModalBody>
                            <ModalFooter className="flex justify-end gap-3 pt-3">
                                <Button 
                                    variant="flat" 
                                    radius="none" 
                                    onPress={onClose} 
                                    isDisabled={isPending}
                                    className="font-mono text-xs uppercase font-black bg-grey dark:bg-grey/25 text-foreground hover:bg-grey/80 border-2 border-foreground rounded-none h-9 px-4 cursor-pointer"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    radius="none"
                                    isLoading={isPending}
                                    onPress={() => handleReviewDelete(onClose)}
                                    className="font-mono text-xs uppercase font-black bg-red text-white border-2 border-foreground shadow-[2px_2px_0px_0px_#000] h-9 px-4 cursor-pointer hover:scale-105 active:scale-95 transition-all"
                                >
                                    Delete Review
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* Confirm Comment Delete dialog */}
            <Modal 
                isOpen={isCommentOpen} 
                onOpenChange={onCommentOpenChange}
                backdrop="blur"
                classNames={{
                    base: "border-4 border-foreground rounded-none bg-background shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] p-4 font-mono",
                    closeButton: "rounded-none border border-foreground/30 hover:bg-foreground/10 text-foreground"
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex items-center gap-2 border-b-2 border-foreground pb-2">
                                <div className="w-8 h-8 bg-red text-white border-2 border-foreground rounded-full flex items-center justify-center shadow-[1.5px_1.5px_0px_0px_#000]">
                                    <FaTrashAlt className="text-xs text-white" />
                                </div>
                                <h3 className="text-base font-extrabold uppercase text-foreground">Confirm Comment Deletion</h3>
                            </ModalHeader>
                            <ModalBody className="py-4 flex flex-col gap-3">
                                <p className="text-xs text-foreground/80 leading-relaxed bg-foreground/5 p-4 rounded-none border-2 border-foreground shadow-[2px_2px_0px_0px_#000] text-left">
                                    Are you sure you want to permanently delete the comment:
                                    <strong className="text-red block mt-2 break-all">&ldquo;{selectedComment?.content}&rdquo;</strong>
                                    by <strong className="text-black">{selectedComment?.authorName}</strong> for{' '}
                                    <strong className="text-black bg-yellow border border-foreground px-1 py-0.5 text-3xs font-extrabold inline-block shadow-[1px_1px_0px_0px_#000] rotate-[-1.5deg]">{selectedComment?.courseCode}</strong>?
                                </p>
                                <div className="flex items-center gap-2 text-3xs text-red font-black uppercase bg-red/10 p-2.5 rounded-none border-2 border-dashed border-red/40 leading-relaxed">
                                    <span>Warning: Deleting this comment is permanent and cannot be undone.</span>
                                </div>
                            </ModalBody>
                            <ModalFooter className="flex justify-end gap-3 pt-3">
                                <Button 
                                    variant="flat" 
                                    radius="none" 
                                    onPress={onClose} 
                                    isDisabled={isPending}
                                    className="font-mono text-xs uppercase font-black bg-grey dark:bg-grey/25 text-foreground hover:bg-grey/80 border-2 border-foreground rounded-none h-9 px-4 cursor-pointer"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    radius="none"
                                    isLoading={isPending}
                                    onPress={() => handleCommentDelete(onClose)}
                                    className="font-mono text-xs uppercase font-black bg-red text-white border-2 border-foreground shadow-[2px_2px_0px_0px_#000] h-9 px-4 cursor-pointer hover:scale-105 active:scale-95 transition-all"
                                >
                                    Delete Comment
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
};
