'use client';
import { Button, Select, SelectItem, useDisclosure, Chip } from '@heroui/react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import Link from 'next/link';
import { FaGraduationCap, FaBuilding, FaChalkboardTeacher, FaInfoCircle, FaCheckSquare } from 'react-icons/fa';
import { addComment, toggleLike, deleteReview, deleteComment, updateComment, updateReview } from '@/app/actions/reviews';
import { voteOnCourseUpdate } from '@/app/actions/courseUpdates';
import { UpdateVoteData } from '@/lib/course-update-voting';
import { CourseData } from '@/lib/courses-db';
import { ReviewModal } from './ReviewModal';
import { EditReviewModal, ReviewToEdit } from '../dashboard/EditReviewModal';
import { CourseScorecard } from './CourseScorecard';
import { LastMajorUpdateSection } from './LastMajorUpdateSection';
import { Review, ReviewFeedCard } from './ReviewFeedCard';
import { CourseOverviewSection } from './CourseOverviewSection';
import { AuthRequiredModal } from './AuthRequiredModal';

interface CourseDetailClientProps {
    course: CourseData;
    reviews: Review[];
    stats: {
        avgOverall: number;
        avgDifficulty: number;
        avgUsefulness: number;
        avgEnjoyment: number;
        totalReviews: number;
    };
    updateVoteData: UpdateVoteData;
    defaultLastUpdate?: string;
}

export const CourseDetailClient = ({ course, reviews, stats, updateVoteData, defaultLastUpdate = 'Semester 1, 2026' }: CourseDetailClientProps) => {
    const { data: session } = useSession();
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const { isOpen: isAuthOpen, onOpen: onAuthOpen, onOpenChange: onAuthOpenChange } = useDisclosure();
    const [sortBy, setSortBy] = useState('recent');
    const [mounted, setMounted] = useState(false);

    // Last Major Update voting state
    const [voteData, setVoteData] = useState(updateVoteData);
    const [voteLoading, setVoteLoading] = useState(false);

    // Review Edit Modal States
    const { isOpen: isReviewEditOpen, onOpen: onReviewEditOpen, onOpenChange: onReviewEditOpenChange } = useDisclosure();
    const [selectedReviewForEdit, setSelectedReviewForEdit] = useState<Review | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Last Major Update vote handler
    const handleVote = async (suggestedTerm: string) => {
        if (!session) { onAuthOpen(); return; }
        setVoteLoading(true);
        const prev = voteData;
        const isToggleOff = voteData.currentUserVote === suggestedTerm;
        const isConfirm = suggestedTerm === voteData.consensusTerm;
        
        // Optimistically update local state
        if (isToggleOff) {
            setVoteData(d => {
                const nextConfirmCount = isConfirm ? d.confirmCount - 1 : d.confirmCount;
                const nextDisputeCount = !isConfirm ? d.disputeCount - 1 : d.disputeCount;
                return {
                    ...d,
                    currentUserVote: null,
                    totalVotes: d.totalVotes - 1,
                    confirmCount: nextConfirmCount,
                    disputeCount: nextDisputeCount,
                };
            });
        } else {
            setVoteData(d => {
                const addConfirm = isConfirm ? 1 : 0;
                const addDispute = !isConfirm ? 1 : 0;
                const rmConfirm = d.currentUserVote === d.consensusTerm ? 1 : 0;
                const rmDispute = d.currentUserVote && d.currentUserVote !== d.consensusTerm ? 1 : 0;

                const nextConfirmCount = d.confirmCount + addConfirm - rmConfirm;
                const nextDisputeCount = d.disputeCount + addDispute - rmDispute;

                let nextConsensus = d.consensusTerm;
                let nextConfirm = nextConfirmCount;
                let nextDispute = nextDisputeCount;

                if (!isConfirm && nextConfirmCount === 0) {
                    nextConsensus = suggestedTerm;
                    nextConfirm = 1;
                    nextDispute = 0;
                }

                return {
                    ...d,
                    consensusTerm: nextConsensus,
                    currentUserVote: suggestedTerm,
                    totalVotes: d.currentUserVote ? d.totalVotes : d.totalVotes + 1,
                    confirmCount: nextConfirm,
                    disputeCount: nextDispute,
                };
            });
        }
        
        try {
            const res = await voteOnCourseUpdate(course.code, suggestedTerm, defaultLastUpdate);
            if (res && res.success && res.voteData) {
                setVoteData(res.voteData);
            } else if (res && !res.success) {
                setVoteData(prev); // rollback on error
                alert(res.error || 'Failed to submit course update vote');
            }
        } catch {
            setVoteData(prev); // rollback on error
        } finally {
            setVoteLoading(false);
        }
    };

    // Review Actions
    const handleLike = async (reviewId: string) => { await toggleLike(reviewId); };
    const handleReviewDelete = async (reviewId: string) => { await deleteReview(reviewId); };
    const handleReviewEditClick = (review: Review) => { setSelectedReviewForEdit(review); onReviewEditOpen(); };
    const handleReviewEditSave = async (formData: any) => { if (selectedReviewForEdit) await updateReview(selectedReviewForEdit.id, formData); };

    // Comment Actions
    const handleCommentSubmit = async (reviewId: string, content: string, parentId?: string) => { await addComment(reviewId, content, parentId); };
    const handleCommentEdit = async (commentId: string, content: string) => { await updateComment(commentId, content); };
    const handleCommentDelete = async (commentId: string) => { await deleteComment(commentId); };

    // Sort Reviews Feed
    const sortedReviews = [...reviews].sort((a, b) => {
        if (sortBy === 'recent') {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'rating-desc') {
            return b.overallRating - a.overallRating;
        }
        if (sortBy === 'rating-asc') {
            return a.overallRating - b.overallRating;
        }
        return 0;
    });

    const reviewToEdit: ReviewToEdit | null = selectedReviewForEdit ? {
        id: selectedReviewForEdit.id,
        title: selectedReviewForEdit.title,
        description: selectedReviewForEdit.description,
        overallRating: selectedReviewForEdit.overallRating,
        difficultyScore: selectedReviewForEdit.difficultyScore,
        usefulnessScore: selectedReviewForEdit.usefulnessScore,
        enjoymentScore: selectedReviewForEdit.enjoymentScore,
        termTaken: selectedReviewForEdit.termTaken,
        grade: selectedReviewForEdit.grade,
        isAnonymous: selectedReviewForEdit.isAnonymous,
    } : null;

    return (
        <div className="flex flex-col gap-8 md:gap-12 bg-grid-sheet mx-[-1.5rem] sm:mx-[-2rem] mt-[-2rem] px-6 sm:px-8 py-8 w-[calc(100%+3rem)] sm:w-[calc(100%+4rem)] min-h-screen items-center">
            <div className="max-w-screen-xl w-full flex flex-col gap-6">

            {/* Top Navigation Row */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full pb-4">
                <Button
                    as={Link}
                    href="/courses"
                    size="sm"
                    variant="flat"
                    className="font-mono uppercase font-black text-xs border-2 border-foreground bg-yellow text-black rounded-none shadow-[3px_3px_0px_0px_#000] rotate-[-2deg] hover:rotate-0 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                >
                    &larr; Back to Courses
                </Button>
                {!course.isNoLongerOffered && (
                    <Button
                        as="a"
                        href={course.officialLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="sm"
                        className="font-mono uppercase font-black text-xs border-2 border-foreground bg-blue text-black rounded-none shadow-[3px_3px_0px_0px_#000] rotate-[2deg] hover:rotate-0 hover:scale-105 active:scale-95 transition-all duration-200 px-4 py-2 w-fit flex items-center gap-2 cursor-pointer"
                    >
                        View Official Course Outline &rarr;
                    </Button>
                )}
            </div>

            {/* Split Page Layout*/}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start w-full">
                
                {/* Left Column (2/3 Width - lg:col-span-2) */}
                <div className="lg:col-span-2 flex flex-col w-full">

                    {/* Unified Course Details Card */}
                    <div className="flex flex-col gap-6 bg-background border-4 border-foreground p-6 sm:p-8 rounded-none shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] w-full h-full">
                        
                        {/* Title, Terms & Tag Info */}
                        <div className="flex flex-col gap-4">
                            <div>
                                <span className="font-mixtape text-xs uppercase font-extrabold text-black bg-yellow border-2 border-foreground px-3 py-1 w-fit shadow-[2px_2px_0px_0px_#000] rotate-[-2deg] inline-block">
                                    {course.code}
                                </span>
                                <h1 className="font-mixtape uppercase tracking-tighter text-3xl sm:text-5xl font-black mt-3 leading-none text-foreground">
                                    {course.name}
                                </h1>
                                <div className="flex flex-wrap gap-1.5 mt-4">
                                    {course.terms.map((term) => (
                                        <Chip
                                            key={term}
                                            size="sm"
                                            radius="none"
                                            className={clsx(
                                                "border-2 border-foreground font-mono text-3xs font-extrabold",
                                                term === 'No Longer Offered'
                                                    ? "bg-red text-white animate-pulse-custom"
                                                    : "bg-blue text-black"
                                            )}
                                        >
                                            {term}
                                        </Chip>
                                    ))}
                                </div>
                            </div>

                            {/* Warning Banner */}
                            {course.isNoLongerOffered && (
                                <div className="flex items-start gap-3 bg-red/10 border-3 border-red p-4 rounded-none shadow-[3px_3px_0px_0px_#d11149] font-mono mt-2">
                                    <span className="text-red text-xl mt-0.5 shrink-0">⚠</span>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-red text-xs font-black uppercase tracking-wider">Course No Longer Offered</span>
                                        <p className="text-foreground/80 text-xs leading-relaxed">
                                            This course is no longer offered by Adelaide University. Historical student reviews are preserved below for reference only.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Quick info tags */}
                            {(course.coordinator || course.campus || course.units || course.levelOfStudy || course.universityWideElective) && (
                                <div className="flex flex-wrap gap-2.5 bg-foreground/5 border-2 border-dashed border-foreground/30 p-4 rounded-none font-mono text-xs mt-2">
                                    {course.coordinator && (
                                        <div className="flex items-center gap-1.5 text-xs font-black bg-red text-white px-2.5 py-1 border-2 border-foreground shadow-[1.5px_1.5px_0px_0px_#000] rotate-[-0.5deg]">
                                            <FaChalkboardTeacher />
                                            COORDINATOR: {course.coordinator}
                                        </div>
                                    )}
                                    {course.campus && (
                                        <div className="flex items-center gap-1.5 text-xs font-black bg-blue text-white px-2.5 py-1 border-2 border-foreground shadow-[1.5px_1.5px_0px_0px_#000] rotate-[0.5deg]">
                                            <FaBuilding />
                                            CAMPUS: {course.campus}
                                        </div>
                                    )}
                                    {course.units && (
                                        <div className="flex items-center gap-1.5 text-xs font-black bg-purple text-white px-2.5 py-1 border-2 border-foreground shadow-[1.5px_1.5px_0px_0px_#000] rotate-[-0.5deg]">
                                            <FaInfoCircle />
                                            UNITS: {course.units}
                                        </div>
                                    )}
                                    {course.levelOfStudy && (
                                        <div className="flex items-center gap-1.5 text-xs font-black bg-orange text-white px-2.5 py-1 border-2 border-foreground shadow-[1.5px_1.5px_0px_0px_#000] rotate-[0.5deg]">
                                            <FaChalkboardTeacher />
                                            LEVEL: {course.levelOfStudy}
                                        </div>
                                    )}
                                    {course.universityWideElective && (
                                        <div className="flex items-center gap-1.5 text-xs font-black bg-yellow text-black px-2.5 py-1 border-2 border-foreground shadow-[1.5px_1.5px_0px_0px_#000] rotate-[-0.5deg]">
                                            <FaCheckSquare className="w-3.5 h-3.5 shrink-0" />
                                            ELECTIVE: YES
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        <CourseScorecard stats={stats} />

                        <LastMajorUpdateSection
                            courseCode={course.code}
                            voteData={voteData}
                            onVote={handleVote}
                            voteLoading={voteLoading}
                            onAuthOpen={onAuthOpen}
                            session={session}
                        />
                        {/* Description / Requirements / Assessments / Outcomes / Resources */}
                        <CourseOverviewSection course={course} />

                    </div>
                </div>

                {/* Right Column (1/3 Width - lg:col-span-1) */}
                <div className="lg:col-span-1 flex flex-col gap-5 w-full">

                    {/* Student Reviews Box */}
                    <div className="flex flex-col gap-5 bg-background border-4 border-foreground p-5 rounded-none shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] w-full">
                    {/* Reviews Grid Header */}
                    <div className="flex flex-col gap-4 border-b-4 border-foreground pb-4">
                        <div>
                            <h1 className="font-mixtape uppercase tracking-tighter text-2xl sm:text-3xl font-extrabold bg-red text-white w-fit px-3 py-1 border-3 border-foreground shadow-[3px_3px_0px_0px_#000] rotate-[-1.5deg] select-none hover:rotate-[1deg] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer">Student Reviews</h1>
                            <p className="font-mono text-xs text-foreground/80 mt-3 font-bold leading-relaxed">Read about actual class experiences and sub-scores.</p>
                        </div>

                        <div className="flex items-center gap-3 w-full justify-between">
                            {mounted ? (
                                <Select
                                    size="sm"
                                    radius="none"
                                    label="Sort Feed"
                                    selectedKeys={[sortBy]}
                                    onSelectionChange={(keys) => setSortBy(Array.from(keys)[0] as string)}
                                    className="w-28 sm:w-32 font-mono h-10"
                                    classNames={{
                                        trigger: "border-2 border-foreground bg-background rounded-none shadow-none h-10 min-h-10 text-foreground",
                                        value: "text-foreground font-mono text-[10px] data-[placeholder=true]:text-grey dark:data-[placeholder=true]:text-grey",
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
                                    aria-label="Sort reviews"
                                >
                                    <SelectItem key="recent" textValue="Most Recent" className="font-mono text-[10px] rounded-none">Most Recent</SelectItem>
                                    <SelectItem key="rating-desc" textValue="Highest Rated" className="font-mono text-[10px] rounded-none">Highest Rated</SelectItem>
                                    <SelectItem key="rating-asc" textValue="Lowest Rated" className="font-mono text-[10px] rounded-none">Lowest Rated</SelectItem>
                                </Select>
                            ) : (
                                <div className="h-10 w-32 bg-background border-2 border-foreground animate-pulse" />
                            )}

                            <Button
                                color="primary"
                                size="sm"
                                radius="none"
                                className="h-10 min-h-10 font-mono text-xs uppercase font-black bg-yellow text-black border-2 border-foreground shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] hover:scale-105 active:scale-95 transition-all duration-200 animate-pulse-custom cursor-pointer"
                                onPress={session ? onOpen : onAuthOpen}
                            >
                                Write Review
                            </Button>
                        </div>
                    </div>

                    {/* Scrollable Reviews Feed Container */}
                    <div className="flex flex-col gap-6 max-h-[850px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                        {sortedReviews.length === 0 ? (
                            <div className="text-center py-12 bg-background border-4 border-dashed border-foreground rounded-none">
                                <FaGraduationCap className="text-foreground text-4xl mx-auto mb-3" />
                                <p className="font-mixtape font-extrabold uppercase text-base">No reviews yet</p>
                                <p className="font-mono text-xs mt-2 text-foreground/60">Be the first student to review this course!</p>
                            </div>
                        ) : (
                            sortedReviews.map((review, idx) => (
                                <ReviewFeedCard
                                    key={review.id}
                                    review={review}
                                    idx={idx}
                                    session={session}
                                    onLike={handleLike}
                                    onReviewEdit={handleReviewEditClick}
                                    onReviewDelete={handleReviewDelete}
                                    onCommentSubmit={handleCommentSubmit}
                                    onCommentEdit={handleCommentEdit}
                                    onCommentDelete={handleCommentDelete}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>
            </div>
        </div>

            {/* Submission review Modal */}
            <ReviewModal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                courseCode={course.code}
                courseName={course.name}
            />

            {/* Authentication Required Modal */}
            <AuthRequiredModal
                isOpen={isAuthOpen}
                onOpenChange={onAuthOpenChange}
            />

            {/* Custom Shared Edit Review Modal */}
            <EditReviewModal
                isOpen={isReviewEditOpen}
                onOpenChange={onReviewEditOpenChange}
                review={reviewToEdit}
                onSave={handleReviewEditSave}
            />
        </div>
    );
};
