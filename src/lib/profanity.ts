import { checkProfanity, normalizeUnicode, type Language } from 'glin-profanity';

/**
 * Normalises words by stripping common inflection suffixes (e.g., -ed, -ing, -er)
 * so base swear words in dictionaries match inflected variations (e.g., "fucked" -> "fuck")
 * without needing hardcoded lists of words.
 */
function stripInflections(text: string): string {
    return text
        .split(/\s+/)
        .map(word => {
            // Collapse repeated double-consonants before suffixes (e.g. shitted -> shit)
            let stem = word.replace(/(.+?)(.)\2(ed|ing)$/i, (_match, p1, p2) => p1 + p2);
            // Strip suffixes like -ed, -ing, -er, -ers
            stem = stem.replace(/(.+?)(ed|ing|er|ers)$/i, (_match, p1) => p1);
            return stem;
        })
        .join(' ');
}

export function checkTextForProfanity(text: string): { containsProfanity: boolean; errorMsg?: string } {
    if (!text?.trim()) return { containsProfanity: false };

    try {
        const options = {
            detectLeetspeak: true,
            leetspeakLevel: 'moderate' as const,
            normalizeUnicode: true,
            languages: ['english' as Language],
            // Ignore mild colloquial words so slightly negative reviews are permitted
            ignoreWords: ['suck', 'sucks'],
        };

        // Check original text with Unicode normalisation & leetspeak detection
        let result = checkProfanity(text, options);

        // If not flagged, check uninflected stems for inflected curse variations
        if (!result.containsProfanity) {
            const normalized = normalizeUnicode(text);
            const stemmed = stripInflections(normalized);
            result = checkProfanity(stemmed, options);
        }

        if (result.containsProfanity) {
            return {
                containsProfanity: true,
                errorMsg: "Profanity or bad sentiment detected. Please write a meaningful, constructive response."
            };
        }
    } catch (err) {
        console.error("Profanity detection failed:", err);
    }

    return { containsProfanity: false };
}
