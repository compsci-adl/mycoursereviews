import { describe, it } from 'node:test';
import assert from 'node:assert';
import { checkTextForProfanity } from '../profanity';

describe('Profanity Moderation Checker', () => {
    it('returns containsProfanity: false for clean text', () => {
        const cleanText = "This is an absolutely fantastic and highly useful course. The lecturers were amazing.";
        const result = checkTextForProfanity(cleanText);
        assert.strictEqual(result.containsProfanity, false);
    });

    it('returns containsProfanity: false for empty or undefined text', () => {
        assert.strictEqual(checkTextForProfanity('').containsProfanity, false);
        assert.strictEqual(checkTextForProfanity(undefined as any).containsProfanity, false);
    });

    it('returns containsProfanity: true and the custom error message for direct profanity', () => {
        const badText = "This course was absolute shit and the assignment was rubbish.";
        const result = checkTextForProfanity(badText);
        assert.strictEqual(result.containsProfanity, true);
        assert.strictEqual(result.errorMsg, "Profanity or bad sentiment detected. Please write a meaningful, constructive response.");
    });

    describe('Unicode Normalization & Homoglyph Evasions', () => {
        it('flags unicode lookalike variations of bad words', () => {
            const diacritics = "Don't take this course, it's a piece of füçk.";
            assert.strictEqual(checkTextForProfanity(diacritics).containsProfanity, true);

            const cyrillicLookalikes = "The assignments in this class are absolute ѕhіt."; // Uses Cyrillic 'ѕ' and 'і'
            assert.strictEqual(checkTextForProfanity(cyrillicLookalikes).containsProfanity, true);

            const greekUpsilon = "This exam is fυcked up."; // Uses Greek 'υ'
            assert.strictEqual(checkTextForProfanity(greekUpsilon).containsProfanity, true);
        });
    });

    describe('Leetspeak Detection & Obfuscation Evasions', () => {
        it('flags classic leetspeak character substitutions', () => {
            const badLeetspeak = "Don't take this class, the exams are f4cked up.";
            assert.strictEqual(checkTextForProfanity(badLeetspeak).containsProfanity, true);

            const sh1tEvasion = "This course is total sh1t.";
            assert.strictEqual(checkTextForProfanity(sh1tEvasion).containsProfanity, true);

            const assEvasion = "The coordinator is an @ss.";
            assert.strictEqual(checkTextForProfanity(assEvasion).containsProfanity, true);

            const bitchEvasion = "This assignment is a b1tch.";
            assert.strictEqual(checkTextForProfanity(bitchEvasion).containsProfanity, true);
        });

        it('flags spacing and repetition obfuscations', () => {
            const spacesText = "This class is absolute f u c k.";
            assert.strictEqual(checkTextForProfanity(spacesText).containsProfanity, true);

            const repetitionText = "This exam was fuuuuuck.";
            assert.strictEqual(checkTextForProfanity(repetitionText).containsProfanity, true);
        });
    });

    describe('Hard Swear Words, Obfuscation & Negative Sentiment', () => {
        it('allows slightly negative or critical sentiment reviews', () => {
            const slightlyNegative1 = "The course was difficult and the workload was quite heavy.";
            assert.strictEqual(checkTextForProfanity(slightlyNegative1).containsProfanity, false);

            const slightlyNegative2 = "I really disliked the pacing and the assignments were tough.";
            assert.strictEqual(checkTextForProfanity(slightlyNegative2).containsProfanity, false);

            const slightlyNegative3 = "This course sucks and the lectures were boring.";
            assert.strictEqual(checkTextForProfanity(slightlyNegative3).containsProfanity, false);

            const slightlyNegative4 = "The grading was harsh and slow, very disappointing.";
            assert.strictEqual(checkTextForProfanity(slightlyNegative4).containsProfanity, false);

            const slightlyNegative5 = "The exam was total rubbish and a waste of time.";
            assert.strictEqual(checkTextForProfanity(slightlyNegative5).containsProfanity, false);
        });

        it('flags hard swear words and inflections', () => {
            const hardSwear1 = "This course is fucking terrible.";
            assert.strictEqual(checkTextForProfanity(hardSwear1).containsProfanity, true);

            const hardSwear2 = "The coordinator was an asshole.";
            assert.strictEqual(checkTextForProfanity(hardSwear2).containsProfanity, true);
        });
    });
});
