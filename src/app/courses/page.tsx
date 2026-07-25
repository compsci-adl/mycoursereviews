import { sql } from 'drizzle-orm';

import { db } from '@/db';
import { reviews } from '@/db/schema';
import { getCoursesBatch } from '@/lib/courses-db';
import { BrowseCoursesClient } from '@/components/browse/BrowseCoursesClient';

// Ensure this page loads dynamic updates instantly
export const dynamic = 'force-dynamic';

/** Extract the subject prefix from a course code, e.g. "COMP SCI 1102" → "COMP SCI", "INFO3003" → "INFO" */
function extractSubject(code: string): string {
    const upper = code.trim().toUpperCase();
    // Match leading letters (with optional spaces between word groups) before the first digit
    const match = upper.match(/^([A-Z][A-Z\s]*?)\s*\d/);
    return match ? match[1].trim() : upper;
}

export default async function CoursesPage() {
    // 1. Fetch initial 36 courses fast batch from db
    const apiCourses = getCoursesBatch(36);

    // 2. Fetch course aggregate review stats from PostgreSQL
    const dbStatsMap = new Map<string, {
        courseCode: string;
        avgRating: number;
        avgDifficulty: number;
        avgUsefulness: number;
        avgEnjoyment: number;
        reviewCount: number;
        mostRecentReview: string | null;
    }>();

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

        for (const row of stats) {
            dbStatsMap.set(row.courseCode.toLowerCase(), {
                courseCode: row.courseCode,
                avgRating: Number(row.avgRating) || 0,
                avgDifficulty: Number(row.avgDifficulty) || 0,
                avgUsefulness: Number(row.avgUsefulness) || 0,
                avgEnjoyment: Number(row.avgEnjoyment) || 0,
                reviewCount: Number(row.reviewCount) || 0,
                mostRecentReview: row.mostRecentReview ?? null,
            });
        }
    } catch (error: any) {
        console.warn('PostgreSQL unavailable (running in offline mode):', error?.message || error);
    }

    // 3. Map aggregates onto initial 36 courses
    const initialCoursesBatch = apiCourses.map((course) => {
        const stat = dbStatsMap.get(course.code.toLowerCase());
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
    });

    return <BrowseCoursesClient courses={initialCoursesBatch} />;
}
