import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
    SEED_USERS,
    SEED_REVIEWS,
    SEED_COMMENTS,
    SEED_LIKES,
    SEED_COURSE_UPDATE_VOTES,
} from '../seed';
import { checkTextForProfanity } from '@/lib/profanity';
import { validateReviewDescription, validateCommentContent } from '@/lib/spam';
import { DEFAULT_LAST_UPDATE } from '@/lib/course-update-voting';

describe('Database Seed Data Integrity', () => {
    it('contains valid mock users with required fields and valid roles', () => {
        assert.ok(SEED_USERS.length >= 5, 'Should seed at least 5 users');
        const userIds = new Set<string>();

        for (const user of SEED_USERS) {
            assert.ok(user.id && typeof user.id === 'string', 'User ID must be a non-empty string');
            assert.ok(user.name && typeof user.name === 'string', 'User name must be a non-empty string');
            assert.ok(user.role === 'user' || user.role === 'admin', 'User role must be user or admin');
            assert.ok(!userIds.has(user.id), `Duplicate user id detected: ${user.id}`);
            userIds.add(user.id);
        }
    });

    it('contains reviews for at least 10 courses with 3 to 5 reviews per course', () => {
        const courseCodeToReviews = new Map<string, typeof SEED_REVIEWS>();

        for (const review of SEED_REVIEWS) {
            const list = courseCodeToReviews.get(review.courseCode) || [];
            list.push(review);
            courseCodeToReviews.set(review.courseCode, list);
        }

        assert.ok(
            courseCodeToReviews.size >= 10,
            `Expected at least 10 unique courses with reviews, found ${courseCodeToReviews.size}`
        );

        for (const [courseCode, reviews] of courseCodeToReviews.entries()) {
            assert.ok(
                reviews.length >= 3 && reviews.length <= 5,
                `Course ${courseCode} should have between 3 and 5 reviews, found ${reviews.length}`
            );
        }
    });

    it('contains valid reviews conforming to ratings, word count, and profanity constraints', () => {
        const userIds = new Set(SEED_USERS.map((u) => u.id));
        const reviewIds = new Set<string>();

        for (const review of SEED_REVIEWS) {
            assert.ok(!reviewIds.has(review.id), `Duplicate review id: ${review.id}`);
            reviewIds.add(review.id);

            assert.ok(userIds.has(review.userId), `Review references non-existent userId: ${review.userId}`);
            assert.ok(review.courseCode && review.courseCode.trim().length > 0, 'Course code is required');
            assert.ok(review.title && review.title.length >= 3, 'Title must be at least 3 characters');
            assert.ok(review.overallRating >= 1 && review.overallRating <= 5, 'Rating must be 1 to 5');
            assert.ok(review.difficultyScore >= 0.5 && review.difficultyScore <= 5, 'Difficulty score must be 0.5 to 5.0');
            assert.ok(review.usefulnessScore >= 0.5 && review.usefulnessScore <= 5, 'Usefulness score must be 0.5 to 5.0');
            assert.ok(review.enjoymentScore >= 0.5 && review.enjoymentScore <= 5, 'Enjoyment score must be 0.5 to 5.0');
            assert.ok(typeof review.isAnonymous === 'boolean', 'isAnonymous must be a boolean');

            // Moderation: Profanity check
            const titleProfanity = checkTextForProfanity(review.title);
            assert.strictEqual(titleProfanity.containsProfanity, false, `Seed review title contains profanity: ${review.title}`);

            const descProfanity = checkTextForProfanity(review.description);
            assert.strictEqual(descProfanity.containsProfanity, false, `Seed review description contains profanity`);

            // Moderation: Word count & spam check
            const descValidation = validateReviewDescription(review.description);
            assert.strictEqual(descValidation.isValid, true, `Seed review description failed validation: ${descValidation.errorMsg}`);
        }
    });

    it('contains valid discussion comments with parent-child threading and profanity validation', () => {
        assert.ok(SEED_COMMENTS.length >= 10, 'Should seed at least 10 discussion comments');
        const userIds = new Set(SEED_USERS.map((u) => u.id));
        const reviewIds = new Set(SEED_REVIEWS.map((r) => r.id));
        const commentIds = new Set<string>();

        for (const comment of SEED_COMMENTS) {
            assert.ok(!commentIds.has(comment.id), `Duplicate comment id: ${comment.id}`);
            commentIds.add(comment.id);

            assert.ok(userIds.has(comment.userId), `Comment references unknown user: ${comment.userId}`);
            assert.ok(reviewIds.has(comment.reviewId), `Comment references unknown review: ${comment.reviewId}`);

            if (comment.parentId) {
                assert.ok(commentIds.has(comment.parentId), `Reply references unknown parent comment: ${comment.parentId}`);
            }

            const profanity = checkTextForProfanity(comment.content);
            assert.strictEqual(profanity.containsProfanity, false, 'Comment contains profanity');

            const contentValidation = validateCommentContent(comment.content);
            assert.strictEqual(contentValidation.isValid, true, `Comment failed word count: ${contentValidation.errorMsg}`);
        }
    });

    it('contains rich likes across reviews', () => {
        assert.ok(SEED_LIKES.length >= 20, 'Should seed at least 20 likes');
        const userIds = new Set(SEED_USERS.map((u) => u.id));
        const reviewIds = new Set(SEED_REVIEWS.map((r) => r.id));
        const likePairs = new Set<string>();

        for (const like of SEED_LIKES) {
            assert.ok(userIds.has(like.userId), `Like references unknown user: ${like.userId}`);
            assert.ok(reviewIds.has(like.reviewId), `Like references unknown review: ${like.reviewId}`);
            const pairKey = `${like.userId}:${like.reviewId}`;
            assert.ok(!likePairs.has(pairKey), `Duplicate like pair: ${pairKey}`);
            likePairs.add(pairKey);
        }
    });

    it('seeds course update consensus votes across 10 courses that update last major update term', () => {
        const userIds = new Set(SEED_USERS.map((u) => u.id));
        const coursesWithVotes = new Set<string>();
        const courseTally = new Map<string, Map<string, number>>();

        for (const vote of SEED_COURSE_UPDATE_VOTES) {
            assert.ok(userIds.has(vote.userId), `Vote references unknown user: ${vote.userId}`);
            assert.ok(vote.courseCode && vote.suggestedTerm, 'Vote must specify courseCode and suggestedTerm');
            coursesWithVotes.add(vote.courseCode);

            if (!courseTally.has(vote.courseCode)) {
                courseTally.set(vote.courseCode, new Map());
            }
            const map = courseTally.get(vote.courseCode)!;
            map.set(vote.suggestedTerm, (map.get(vote.suggestedTerm) || 0) + 1);
        }

        assert.ok(coursesWithVotes.size >= 10, 'Should seed votes across at least 10 courses');

        // Check that for courses with votes, the winning consensus term differs from DEFAULT_LAST_UPDATE (Semester 1, 2026)
        for (const [courseCode, termMap] of courseTally.entries()) {
            let winningTerm = '';
            let maxVotes = 0;
            for (const [term, count] of termMap.entries()) {
                if (count > maxVotes) {
                    maxVotes = count;
                    winningTerm = term;
                }
            }
            assert.notStrictEqual(
                winningTerm,
                DEFAULT_LAST_UPDATE,
                `Course ${courseCode} should have consensus updated away from default "${DEFAULT_LAST_UPDATE}"`
            );
        }
    });
});
