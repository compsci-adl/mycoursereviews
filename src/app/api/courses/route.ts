import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '@/db';
import { reviews } from '@/db/schema';
import { CoursesApiClient, redis } from '@/lib/courses-api';

export const dynamic = 'force-dynamic';

function extractSubject(code: string): string {
    const upper = code.trim().toUpperCase();
    const match = upper.match(/^([A-Z][A-Z\s]*?)\s*\d/);
    return match ? match[1].trim() : upper;
}

export async function GET() {
    try {
        const apiCourses = await CoursesApiClient.getAllCourses();
        
        let dbStats: {
            courseCode: string;
            avgRating: number;
            avgDifficulty: number;
            avgUsefulness: number;
            avgEnjoyment: number;
            reviewCount: number;
            mostRecentReview: string | null;
        }[] = [];

        try {
            const stats = await db
                .select({
                    courseCode: reviews.courseCode,
                    avgRating: sql<number>`avg(${reviews.overallRating})`,
                    avgDifficulty: sql<number>`avg(${reviews.difficultyScore})`,
                    avgUsefulness: sql<number>`avg(${reviews.usefulnessScore})`,
                    avgEnjoyment: sql<number>`avg(${reviews.enjoymentScore})`,
                    reviewCount: sql<number>`count(${reviews.id})`,
                    mostRecentReview: sql<string>`max(${reviews.createdAt})`,
                })
                .from(reviews)
                .groupBy(reviews.courseCode);

            dbStats = stats.map((row) => ({
                courseCode: row.courseCode,
                avgRating: Number(row.avgRating) || 0,
                avgDifficulty: Number(row.avgDifficulty) || 0,
                avgUsefulness: Number(row.avgUsefulness) || 0,
                avgEnjoyment: Number(row.avgEnjoyment) || 0,
                reviewCount: Number(row.reviewCount) || 0,
                mostRecentReview: row.mostRecentReview ?? null,
            }));
        } catch (dbErr) {
            console.error('API courses endpoint: DB stats query failed:', dbErr);
        }

        const apiCourseCodes = new Set(apiCourses.map((c) => c.code.toLowerCase()));
        const noLongerOfferedStats = dbStats.filter((s) => !apiCourseCodes.has(s.courseCode.toLowerCase()));

        const noLongerOfferedCourses = noLongerOfferedStats.map((stat) => ({
            code: stat.courseCode,
            name: stat.courseCode,
            description: 'This course is no longer offered by Adelaide University, but its historical reviews have been preserved below.',
            terms: ['No Longer Offered'],
            officialLink: '#',
            isNoLongerOffered: true,
            subject: extractSubject(stat.courseCode),
            avgRating: stat.avgRating,
            avgDifficulty: stat.avgDifficulty,
            avgUsefulness: stat.avgUsefulness,
            avgEnjoyment: stat.avgEnjoyment,
            reviewCount: stat.reviewCount,
            mostRecentReview: stat.mostRecentReview,
        }));

        const coursesWithStats = [
            ...apiCourses.map((course) => {
                const stat = dbStats.find((s) => s.courseCode.toLowerCase() === course.code.toLowerCase());
                return {
                    ...course,
                    isNoLongerOffered: false,
                    subject: extractSubject(course.code),
                    avgRating: stat?.avgRating ?? 0,
                    avgDifficulty: stat?.avgDifficulty ?? 0,
                    avgUsefulness: stat?.avgUsefulness ?? 0,
                    avgEnjoyment: stat?.avgEnjoyment ?? 0,
                    reviewCount: stat?.reviewCount ?? 0,
                    mostRecentReview: stat?.mostRecentReview ?? null,
                };
            }),
            ...noLongerOfferedCourses,
        ];

        const isLocked = await redis.get('courses:prefetch_lock');

        return NextResponse.json({
            courses: coursesWithStats,
            isComplete: !isLocked,
        });
    } catch (error: any) {
        console.error('API courses GET error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
