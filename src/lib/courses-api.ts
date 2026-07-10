import Redis, { RedisOptions } from 'ioredis';
import { env } from '@/env.mjs';
import {
    CourseData,
    FALLBACK_COURSES,
    getSubjectAbbreviation,
    getSubjectNameFromCodePrefix,
} from './courses-types';

export type { CourseData };

// Avoid multiple connections in development hot-reloads
const globalForRedis = globalThis as unknown as {
    redis: Redis | undefined;
};

const redisOptions: RedisOptions = {
    maxRetriesPerRequest: 0,
    connectTimeout: 500, // fail-fast connection attempts
    retryStrategy(times) {
        if (process.env.CI || times > 3) {
            return null; // Stop retrying in CI/tests or after 3 failures
        }
        return Math.min(times * 200, 2000); // Exponential backoff up to 2s
    },
};

export const redis = globalForRedis.redis ?? new Redis(env.REDIS_URL, redisOptions);
if (env.NODE_ENV !== 'production') globalForRedis.redis = redis;

// Suppress unhandled error events to avoid crashing the server/process
redis.on('error', (err) => {
    console.warn('Redis client error:', err.message);
});

export const CoursesApiClient = {
    /**
     * Internal helper to fetch all courses from Adelaide University API in the background.
     * Prevents client blockages and populates Redis cache asynchronously.
     */
    async prefetchAllCoursesInBackground(): Promise<void> {
        const cacheKey = 'courses:all';
        const headers = {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        };

        const year = 2026;
        const defaultTargetSubjects = [
            'Computer Science',
            'Mathematical Sciences',
            'Statistics',
            'Electric/Electronic Eng & Tech',
            'Information Systems',
            'Artificial Intelligence',
            'Computer Graphics',
            'Project Management',
        ];

        let subjects = [...defaultTargetSubjects];

        const termQueries = [
            { alias: 'sem1', displayName: 'Semester 1' },
            { alias: 'sem2', displayName: 'Semester 2' },
            { alias: 'summer', displayName: 'Summer' },
            { alias: 'winter', displayName: 'Winter' },
        ];

        const coursesMap = new Map<string, CourseData>();

        console.log('Background Courses API Fetch: query starting...');

        try {
            // Query subjects endpoint first to match and normalize dynamic outlines
            try {
                const subjectsUrl = `${env.COURSES_API_URL}/subjects?year=${year}&term=sem1`;
                const subjectsResponse = await fetch(subjectsUrl, { headers, next: { revalidate: 86400 } });
                if (subjectsResponse.ok) {
                    const rawSubjects = await subjectsResponse.json() as Array<string | { code: string; name: string }>;
                    const fetchedList = rawSubjects.map(s => {
                        if (typeof s === 'string') return s;
                        return s.name || s.code || '';
                    }).filter(Boolean);

                    if (fetchedList.length > 0) {
                        subjects = fetchedList;
                    }
                }
            } catch (subjectsError) {
                console.warn('Background Courses API Fetch: subjects outline failed, using default list:', subjectsError);
            }

            // Create flat list of query tasks to fetch
            const tasks: Array<{ subject: string; termQuery: typeof termQueries[0] }> = [];
            for (const subject of subjects) {
                for (const termQuery of termQueries) {
                    tasks.push({ subject, termQuery });
                }
            }

            // Execute fetches in parallel batches of 25 to protect backend & prevent client bottlenecks
            const batchSize = 25;
            for (let i = 0; i < tasks.length; i += batchSize) {
                const chunk = tasks.slice(i, i + batchSize);
                await Promise.all(
                    chunk.map(async (task) => {
                        try {
                            const searchParams = new URLSearchParams({
                                year: String(year),
                                term: task.termQuery.alias,
                                subject: task.subject,
                            });

                            const url = `${env.COURSES_API_URL}/courses?${searchParams.toString()}`;
                            const response = await fetch(url, { headers, next: { revalidate: 86400 } });

                            if (response.ok) {
                                const resJson = await response.json();
                                const rawCourses = resJson?.courses || [];

                                for (const raw of rawCourses) {
                                    if (!raw.name) continue;
                                    const sub = raw.name.subject || task.subject;
                                    const catalogCode = raw.name.code || '';
                                    const title = raw.name.title || '';

                                    // Map full subject names dynamically to standard Adelaide Uni abbreviations
                                    const mappedSub = getSubjectAbbreviation(sub);

                                    let code = '';
                                    if (/[A-Za-z]/.test(catalogCode)) {
                                        code = catalogCode.replace(/_/g, ' ').trim();
                                    } else {
                                        code = `${mappedSub} ${catalogCode}`.trim();
                                    }

                                    if (!code) continue;
                                    const normalizedCode = code.toUpperCase();
                                    const displayTerm = task.termQuery.displayName;

                                    if (coursesMap.has(normalizedCode)) {
                                        const existing = coursesMap.get(normalizedCode)!;
                                        if (!existing.terms.includes(displayTerm)) {
                                            existing.terms.push(displayTerm);
                                        }
                                    } else {
                                        coursesMap.set(normalizedCode, {
                                            code: code,
                                            name: title || code,
                                            description: `Official Adelaide University outline for ${code} (${title || 'Course Outline'}).`,
                                            terms: [displayTerm],
                                            officialLink: `https://www.adelaide.edu.au/course-outlines/${raw.id || encodeURIComponent(normalizedCode)}`,
                                            subjectName: sub || null,
                                            apiId: raw.id || null,
                                        });
                                    }
                                }
                            }
                        } catch (innerError) {
                            console.warn(`Background Courses API Fetch: failed for subject: ${task.subject}, term: ${task.termQuery.alias}:`, innerError);
                        }
                    })
                );
            }

            if (coursesMap.size > 0) {
                const data = Array.from(coursesMap.values());
                // Write into Redis (24-hour TTL)
                await redis.set(cacheKey, JSON.stringify(data), 'EX', 86400);
                console.log(`Background Courses API Fetch: completed. Cached ${data.length} courses.`);
            } else {
                console.warn('Background Courses API Fetch: courses endpoint returned 0 outlines.');
            }
        } catch (error) {
            console.error('Background Courses API Fetch: top-level process failed:', error);
        }
    },

    /**
     * Retrieves the entire list of Adelaide University courses.
     * Checks Redis cache for instant low-latency delivery.
     * If a cache miss occurs, triggers a background fetch thread and returns the fast fallback outline list immediately to avoid page load stalls.
     */
    async getAllCourses(): Promise<CourseData[]> {
        const cacheKey = 'courses:all';

        try {
            // Check Redis Cache
            const cachedData = await redis.get(cacheKey);
            if (cachedData) {
                return JSON.parse(cachedData) as CourseData[];
            }
        } catch (error) {
            console.error('Redis cache lookup error:', error);
        }

        // Cache miss: Trigger asynchronous background prefetch if lock is not present
        const lockKey = 'courses:prefetch_lock';
        
        // Execute background fetch asynchronously
        (async () => {
            try {
                const isLocked = await redis.get(lockKey);
                if (!isLocked) {
                    // Set lock for 5 minutes
                    await redis.set(lockKey, 'true', 'EX', 300);
                    console.log('Cache miss for courses. Triggering background prefetch task...');
                    
                    this.prefetchAllCoursesInBackground()
                        .catch((err) => console.error('Error during background prefetch:', err))
                        .finally(async () => {
                            await redis.del(lockKey);
                        });
                }
            } catch (err) {
                console.error('Error acquiring background prefetch lock:', err);
            }
        })();

        // Return fallbacks instantly to prevent page stall!
        return FALLBACK_COURSES;
    },

    /**
     * Retrieves detailed information on a single course dynamically.
     */
    async getCourseByCode(code: string): Promise<CourseData | null> {
        const cacheKey = `course:${code}`;

        try {
            // Check Redis Cache
            const cachedData = await redis.get(cacheKey);
            if (cachedData) {
                return JSON.parse(cachedData) as CourseData;
            }
        } catch (error) {
            console.error('Redis cache single lookup error:', error);
        }

        const headers = {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        };

        const year = 2026;
        const termQueries = ['sem1', 'sem2', 'summer', 'winter'];

        // Step 1: Determine subject name from code prefix.
        const codeUpper = code.trim().toUpperCase();
        // Match everything before the trailing numeric part
        const prefixMatch = codeUpper.match(/^([A-Z][A-Z\s]*?)\s*\d/);
        const codePrefix = prefixMatch ? prefixMatch[1].trim() : codeUpper;

        // Also extract just the numeric+letter catalog code (e.g. "INFO3003" -> "INFO3003", "COMP SCI 1102" -> "1102")
        const catalogCodeMatch = codeUpper.match(/([A-Z]+\d+\w*)$/);
        const catalogCode = catalogCodeMatch ? catalogCodeMatch[1] : codeUpper;

        let subjectName = getSubjectNameFromCodePrefix(codePrefix);
        let apiId: string | null = null;

        // Dynamic fallback: look up the course in all courses list to resolve its subjectName and apiId
        try {
            const allCourses = await this.getAllCourses();
            const matchedCourse = allCourses.find((c) => c.code.toLowerCase() === code.toLowerCase());
            if (matchedCourse) {
                if (matchedCourse.subjectName) {
                    subjectName = matchedCourse.subjectName;
                }
                if (matchedCourse.apiId) {
                    apiId = matchedCourse.apiId;
                }
            }
        } catch (err) {
            console.warn('Failed to dynamically resolve course details from allCourses list:', err);
        }

        // Common mapping function for course detail
        const buildCourseFromDetail = (detail: any, fallbackId: string, matchedTitle: string, matchedSubject: string, matchedCode: string): CourseData => {
            // Build normalized code: if the catalog code already contains letters use it as-is
            let normalizedCode: string;
            if (/[A-Za-z]/.test(matchedCode) && /\d/.test(matchedCode)) {
                normalizedCode = matchedCode;
            } else {
                normalizedCode = `${getSubjectAbbreviation(matchedSubject)} ${matchedCode}`.trim();
            }

            const description =
                detail?.course_overview ||
                detail?.description ||
                detail?.outline ||
                `Official Adelaide University outline for ${normalizedCode} (${matchedTitle}).`;

            const rawTerms = Array.isArray(detail?.terms) ? detail.terms : [];
            const termNames = rawTerms.length > 0
                ? rawTerms.map((t: string) => t.replace(' School', ''))
                : ['Semester 1', 'Semester 2'];

            const officialLink =
                detail?.course_outline_url ||
                detail?.course_url ||
                detail?.officialLink ||
                detail?.link ||
                `https://www.adelaide.edu.au/course-outlines/${fallbackId}`;

            // Map assessments (title, weighting, hurdle)
            const rawAssessments = Array.isArray(detail?.assessments) ? detail.assessments : [];
            const assessments = rawAssessments.map((a: any) => ({
                title: a.title ?? '',
                weighting: a.weighting ?? '',
                hurdle: a.hurdle ?? '',
            }));

            // Map learning outcomes (description, outcome_index -> outcomeIndex)
            const rawOutcomes = Array.isArray(detail?.learning_outcomes) ? detail.learning_outcomes : [];
            const learningOutcomes = rawOutcomes.map((o: any) => ({
                description: o.description ?? '',
                outcomeIndex: o.outcome_index ?? 0,
            }));

            // Extract requirements sub-fields
            const reqs = detail?.requirements;

            return {
                code: normalizedCode,
                name: matchedTitle,
                description,
                terms: termNames,
                officialLink,
                coordinator: detail?.course_coordinator ?? null,
                campus: detail?.campus ?? null,
                units: detail?.units ?? null,
                levelOfStudy: detail?.level_of_study ?? null,
                prerequisites: reqs?.prerequisites ?? null,
                corequisites: reqs?.corequisites ?? null,
                antirequisites: reqs?.antirequisites ?? null,
                assessments: assessments.length > 0 ? assessments : undefined,
                learningOutcomes: learningOutcomes.length > 0 ? learningOutcomes : undefined,
                textbooks: detail?.textbooks ?? null,
                subjectName: detail?.name?.subject || matchedSubject || null,
                apiId: fallbackId,
                universityWideElective: detail?.university_wide_elective ?? null,
            };
        };

        // If apiId is dynamically resolved, perform high-performance direct detail lookup!
        if (apiId) {
            try {
                const detailResponse = await fetch(`${env.COURSES_API_URL}/courses/${apiId}`, {
                    headers,
                    next: { revalidate: 86400 },
                });
                if (detailResponse.ok) {
                    const detail = await detailResponse.json();
                    const matchTitle = detail?.name?.title || code;
                    const matchSubject = detail?.name?.subject || subjectName || '';
                    const matchCode = detail?.name?.code || catalogCode;

                    const data = buildCourseFromDetail(detail, apiId, matchTitle, matchSubject, matchCode);

                    // Cache for 24 hours
                    try {
                        await redis.set(cacheKey, JSON.stringify(data), 'EX', 86400);
                    } catch (_) {}
                    return data;
                }
            } catch (detailErr) {
                console.warn(`Direct course detail fetch failed for id ${apiId}:`, detailErr);
            }
        }

        // Fallback: Search the /courses endpoint to find the API id for this course code
        if (subjectName) {
            for (const term of termQueries) {
                try {
                    const searchParams = new URLSearchParams({
                        year: String(year),
                        term,
                        subject: subjectName,
                    });
                    const searchUrl = `${env.COURSES_API_URL}/courses?${searchParams.toString()}`;
                    const searchResponse = await fetch(searchUrl, { headers, next: { revalidate: 86400 } });

                    if (searchResponse.ok) {
                        const resJson = await searchResponse.json();
                        const rawCourses = resJson?.courses || [];

                        // Find matching course by catalog code
                        const match = rawCourses.find((c: any) => {
                            const apiCode = (c?.name?.code || '').toUpperCase().replace(/\s+/g, '');
                            const searchCode = catalogCode.replace(/\s+/g, '');
                            return apiCode === searchCode;
                        });

                        if (match) {
                            const foundId = match.id;
                            const matchSubject = match.name?.subject || subjectName;
                            const matchCode = match.name?.code || catalogCode;
                            const matchTitle = match.name?.title || code;

                            // Fetch full course detail by API id
                            let detail: Record<string, unknown> = {};
                            try {
                                const detailResponse = await fetch(`${env.COURSES_API_URL}/courses/${foundId}`, {
                                    headers,
                                    next: { revalidate: 86400 },
                                });
                                if (detailResponse.ok) {
                                    detail = await detailResponse.json();
                                }
                            } catch (detailErr) {
                                console.warn(`Course detail fetch failed for id ${foundId}:`, detailErr);
                            }

                            const data = buildCourseFromDetail(detail, foundId, matchTitle, matchSubject, matchCode);

                            // Cache for 24 hours
                            try {
                                await redis.set(cacheKey, JSON.stringify(data), 'EX', 86400);
                            } catch (_) {}
                            return data;
                        }
                    }
                } catch (searchErr) {
                    console.warn(`Search failed for ${code} in subject ${subjectName} term ${term}:`, searchErr);
                }
            }
        }

        // Fallback: check local hardcoded course list
        const fallback = FALLBACK_COURSES.find((c) => c.code.toLowerCase() === code.toLowerCase());
        if (fallback) return fallback;

        return null;
    },
};
