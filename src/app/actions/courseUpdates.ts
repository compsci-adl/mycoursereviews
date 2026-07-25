'use server';

import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { auth } from '@/auth';
import { db } from '@/db';
import { courseUpdateVotes, users } from '@/db/schema';
import { DEFAULT_LAST_UPDATE, UpdateVoteData } from '@/lib/course-update-voting';

/**
 * Compute the aggregate vote data for a course's last major update.
 */
export async function getCourseUpdateVoteData(courseCode: string, userId?: string, defaultLastUpdate: string = DEFAULT_LAST_UPDATE): Promise<UpdateVoteData> {
    let allVotes: { suggestedTerm: string }[] = [];
    try {
        allVotes = await db
            .select({ suggestedTerm: courseUpdateVotes.suggestedTerm })
            .from(courseUpdateVotes)
            .where(eq(courseUpdateVotes.courseCode, courseCode));
    } catch {
        return {
            consensusTerm: defaultLastUpdate,
            confirmCount: 0,
            disputeCount: 0,
            currentUserVote: null,
            totalVotes: 0,
        };
    }

    const tally: Record<string, number> = {};
    for (const v of allVotes) {
        tally[v.suggestedTerm] = (tally[v.suggestedTerm] || 0) + 1;
    }

    let consensusTerm = defaultLastUpdate;
    let maxCount = 0;
    for (const [term, count] of Object.entries(tally)) {
        if (count > maxCount) {
            maxCount = count;
            consensusTerm = term;
        }
    }

    const confirmCount = tally[consensusTerm] || 0;
    const disputeCount = allVotes.length - confirmCount;

    let currentUserVote: string | null = null;
    if (userId) {
        try {
            const userVote = await db.query.courseUpdateVotes.findFirst({
                where: and(
                    eq(courseUpdateVotes.userId, userId),
                    eq(courseUpdateVotes.courseCode, courseCode)
                ),
            });
            currentUserVote = userVote?.suggestedTerm ?? null;
        } catch {
            // ignore
        }
    }

    return { consensusTerm, confirmCount, disputeCount, currentUserVote, totalVotes: allVotes.length };
}

/**
 * Vote on a course's last major update term.
 * Same term as existing vote = toggle off (delete). Otherwise upsert.
 */
export async function voteOnCourseUpdate(courseCode: string, suggestedTerm: string, defaultLastUpdate: string = DEFAULT_LAST_UPDATE) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized: Please log in via Keycloak to vote.' };
        }
        const userId = session.user.id;

        try {
            await db.insert(users).values({
                id: userId,
                name: session.user.name || 'Adelaide Student',
                role: session.user.role || 'user',
            }).onConflictDoUpdate({
                target: users.id,
                set: { name: session.user.name || 'Adelaide Student', role: session.user.role || 'user' },
            });

            const existing = await db.query.courseUpdateVotes.findFirst({
                where: and(eq(courseUpdateVotes.userId, userId), eq(courseUpdateVotes.courseCode, courseCode)),
            });

            if (existing && existing.suggestedTerm === suggestedTerm) {
                await db.delete(courseUpdateVotes).where(eq(courseUpdateVotes.id, existing.id));
            } else if (existing) {
                await db.update(courseUpdateVotes)
                    .set({ suggestedTerm, createdAt: new Date() })
                    .where(eq(courseUpdateVotes.id, existing.id));
            } else {
                await db.insert(courseUpdateVotes).values({ userId, courseCode, suggestedTerm });
            }
        } catch (dbErr: any) {
            console.error('Database error in voteOnCourseUpdate:', dbErr);
            return {
                success: false,
                error: 'Database connection or write error. Unable to record vote at this time.'
            };
        }

        const updatedVoteData = await getCourseUpdateVoteData(courseCode, userId, defaultLastUpdate);

        revalidatePath(`/courses/${encodeURIComponent(courseCode)}`);
        return { success: true, voteData: updatedVoteData };
    } catch (err: any) {
        console.error('Error voting on course update:', err);
        return { success: false, error: err?.message || 'Failed to submit course update vote.' };
    }
}
