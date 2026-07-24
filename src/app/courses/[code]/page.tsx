import { and, eq, sql } from 'drizzle-orm';
import { notFound } from 'next/navigation';

import { auth } from '@/auth';
import { db } from '@/db';
import { comments, likes, reviews, users } from '@/db/schema';
import { getCourseByCode } from '@/lib/courses-db';
import { CourseDetailClient } from '@/components/course/CourseDetailClient';
import { getCourseUpdateVoteData } from '@/app/actions/courseUpdates';

export const dynamic = 'force-dynamic';


interface PageProps {
    params: Promise<{
        code: string;
    }>;
}

export default async function CourseDetailPage({ params }: PageProps) {
    const session = await auth();
    const resolvedParams = await params;
    const decodedCode = decodeURIComponent(resolvedParams.code);

    // 1. Fetch course description outline from direct SQLite database
    let courseData = getCourseByCode(decodedCode);

    // 2. Determine target course code for reviews and voting lookup
    // If the API outline exists, we use its normalized code (e.g. "COMP SCI 1102").
    // Otherwise, we fallback to the uppercase trimmed URL parameter.
    const targetCode = courseData ? courseData.code : decodedCode.toUpperCase().trim();

    // 3. Fetch all local reviews from PostgreSQL database
    let reviewsList: any[] = [];
    try {
        reviewsList = await db
            .select({
                id: reviews.id,
                userId: reviews.userId,
                title: reviews.title,
                description: reviews.description,
                overallRating: reviews.overallRating,
                difficultyScore: reviews.difficultyScore,
                usefulnessScore: reviews.usefulnessScore,
                enjoymentScore: reviews.enjoymentScore,
                termTaken: reviews.termTaken,
                grade: reviews.grade,
                isAnonymous: reviews.isAnonymous,
                createdAt: reviews.createdAt,
                reviewerName: users.name,
            })
            .from(reviews)
            .leftJoin(users, eq(reviews.userId, users.id))
            .where(eq(reviews.courseCode, targetCode));
    } catch (error) {
        console.error('Error fetching course reviews:', error);
    }

    if (!courseData) {
        // If the course does not exist in the official API and has 0 student reviews, it has never existed!
        if (reviewsList.length === 0) {
            notFound();
        }

        // Course is no longer in the API, but has historical reviews, build a no-longer-offered fallback
        courseData = {
            code: targetCode,
            name: targetCode,
            description: 'This course is no longer offered by Adelaide University. Historical reviews have been preserved below for reference.',
            terms: ['No Longer Offered'],
            officialLink: '#',
            isNoLongerOffered: true,
        };
    }

    // 3. Fetch Likes and Comments for each review in our dataset
    const reviewsWithDetails = await Promise.all(
        reviewsList.map(async (review) => {
            // Count total likes
            let likesCount = 0;
            let likedByCurrentUser = false;
            try {
                const totalLikes = await db
                    .select({ count: sql<number>`count(*)` })
                    .from(likes)
                    .where(eq(likes.reviewId, review.id));
                likesCount = Number(totalLikes[0]?.count) || 0;

                if (session?.user?.id) {
                    const userLike = await db
                        .select()
                        .from(likes)
                        .where(and(eq(likes.userId, session.user.id), eq(likes.reviewId, review.id)));
                    likedByCurrentUser = userLike.length > 0;
                }
            } catch (error) {
                console.error('Error fetching likes details:', error);
            }

            // Fetch review comments
            let commentsList: any[] = [];
            try {
                commentsList = await db
                    .select({
                        id: comments.id,
                        userId: comments.userId,
                        userName: users.name,
                        content: comments.content,
                        parentId: comments.parentId,
                        createdAt: comments.createdAt,
                    })
                    .from(comments)
                    .leftJoin(users, eq(comments.userId, users.id))
                    .where(eq(comments.reviewId, review.id))
                    .orderBy(comments.createdAt);
            } catch (error) {
                console.error('Error fetching review comments:', error);
            }

            return {
                ...review,
                likesCount,
                likedByCurrentUser,
                comments: commentsList.map((c) => ({
                    ...c,
                    userName: c.userName || 'Anonymous User',
                })),
            };
        })
    );

    // 4. Calculate Scorecard Rating Metrics
    const totalReviews = reviewsWithDetails.length;
    let avgOverall = 0;
    let avgDifficulty = 0;
    let avgUsefulness = 0;
    let avgEnjoyment = 0;

    if (totalReviews > 0) {
        avgOverall = reviewsWithDetails.reduce((sum, r) => sum + r.overallRating, 0) / totalReviews;
        avgDifficulty = reviewsWithDetails.reduce((sum, r) => sum + r.difficultyScore, 0) / totalReviews;
        avgUsefulness = reviewsWithDetails.reduce((sum, r) => sum + r.usefulnessScore, 0) / totalReviews;
        avgEnjoyment = reviewsWithDetails.reduce((sum, r) => sum + r.enjoymentScore, 0) / totalReviews;
    }

    const stats = {
        avgOverall,
        avgDifficulty,
        avgUsefulness,
        avgEnjoyment,
        totalReviews,
    };

    // 5. Fetch community votes on last major update
    let defaultLastUpdate = 'Semester 1, 2026';
    if (courseData.terms && courseData.terms.length > 0) {
        const firstTerm = courseData.terms.filter(t => t !== 'No Longer Offered')[0];
        if (firstTerm === 'Semester 2') {
            defaultLastUpdate = 'Semester 2, 2026';
        } else if (firstTerm === 'Summer') {
            defaultLastUpdate = 'Summer School, 2026';
        } else if (firstTerm === 'Winter') {
            defaultLastUpdate = 'Winter School, 2026';
        } else {
            defaultLastUpdate = 'Semester 1, 2026';
        }
    }

    const updateVoteData = await getCourseUpdateVoteData(targetCode, session?.user?.id ?? undefined, defaultLastUpdate);

    return (
        <CourseDetailClient
            course={courseData}
            reviews={reviewsWithDetails}
            stats={stats}
            updateVoteData={updateVoteData}
            defaultLastUpdate={defaultLastUpdate}
        />
    );
}
