import { eq, sql } from 'drizzle-orm';
import Link from 'next/link';
import { FaLock, FaUserShield } from 'react-icons/fa';

import { auth } from '@/auth';
import { db } from '@/db';
import { comments, reviews } from '@/db/schema';
import { getAllCourses } from '@/lib/courses-db';
import { MyReviewsClient } from '@/components/dashboard/MyReviewsClient';

export const dynamic = 'force-dynamic';

export default async function MyReviewsPage() {
    const session = await auth();

    // 1. Secure Access Check - Prompt login if session is absent
    if (!session?.user?.id) {
        return (
            <div className="flex flex-col gap-8 md:gap-12 bg-grid-sheet mx-[-1.5rem] sm:mx-[-2rem] mt-[-2rem] px-6 sm:px-8 py-16 w-[calc(100%+3rem)] sm:w-[calc(100%+4rem)] min-h-screen items-center">
                <div className="max-w-md w-full border-4 border-foreground rounded-none bg-background shadow-[8px_8px_0px_0px_#000] dark:shadow-[8px_8px_0px_0px_#fff] p-6 sm:p-8 font-mono flex flex-col gap-6 text-center">
                    <div className="flex flex-col gap-2 items-center">
                        <div className="w-12 h-12 bg-grey text-black border-2 border-foreground rounded-full flex items-center justify-center mb-2 shadow-[2px_2px_0px_0px_#000] select-none">
                            <FaLock className="text-lg" />
                        </div>
                        <h2 className="text-xl font-extrabold text-foreground tracking-tight">Authentication Required</h2>
                    </div>

                    <div className="text-xs text-foreground/80 leading-relaxed bg-background p-4 rounded-none border-2 border-foreground shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] text-left flex flex-col gap-3">
                        <p className="font-black uppercase text-red">Contributor dashboard restricted.</p>
                        <p>
                            You must be logged into your <span className="font-extrabold text-red">CS Club account</span> to view, update, or moderate your course guide ratings and discussion comments.
                        </p>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-2xs text-foreground/75 font-black uppercase bg-yellow/10 p-2.5 rounded-none border-2 border-dashed border-foreground/30">
                        <FaUserShield className="text-yellow text-xs shrink-0" />
                        <span>Posted reviews can be fully anonymous to peer audiences.</span>
                    </div>

                    <div className="flex justify-center gap-3 pt-2">
                        <Link
                            href="/"
                            className="font-mono text-xs uppercase font-black bg-grey dark:bg-grey/25 text-foreground hover:bg-grey/80 border-2 border-foreground rounded-none h-9 px-4 flex items-center justify-center"
                        >
                            Return Home
                        </Link>
                        
                        <Link
                            href={`/api/auth/signin?callbackUrl=${encodeURIComponent('/my-reviews')}`}
                            className="font-mono text-xs uppercase font-black bg-yellow text-black border-2 border-foreground rounded-none shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_#000] dark:hover:shadow-[4px_4px_0px_0px_#fff] active:translate-x-[1px] active:translate-y-[1px] transition-all h-9 px-4 flex items-center justify-center"
                        >
                            Log In with Keycloak
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const userId = session.user.id;

    // 2. Fetch User Reviews from PostgreSQL
    let userReviews: any[] = [];
    try {
        userReviews = await db
            .select()
            .from(reviews)
            .where(eq(reviews.userId, userId))
            .orderBy(sql`${reviews.createdAt} desc`);
    } catch (error) {
        console.error('Error fetching contributor reviews:', error);
    }

    // 3. Fetch User Comments from PostgreSQL (joined to reviews for course code context)
    let userComments: any[] = [];
    try {
        userComments = await db
            .select({
                id: comments.id,
                content: comments.content,
                createdAt: comments.createdAt,
                reviewId: comments.reviewId,
                courseCode: reviews.courseCode,
                reviewTitle: reviews.title,
            })
            .from(comments)
            .leftJoin(reviews, eq(comments.reviewId, reviews.id))
            .where(eq(comments.userId, userId))
            .orderBy(sql`${comments.createdAt} desc`);
    } catch (error) {
        console.error('Error fetching contributor comments:', error);
    }

    // 4. Fetch Course List from Cache/Client to resolve code -> name mappings
    const apiCourses = getAllCourses();
    const courseMap: Record<string, string> = {};
    apiCourses.forEach((c) => {
        courseMap[c.code.toLowerCase()] = c.name;
    });

    return (
        <MyReviewsClient
            reviews={userReviews}
            comments={userComments}
            courseMap={courseMap}
        />
    );
}
