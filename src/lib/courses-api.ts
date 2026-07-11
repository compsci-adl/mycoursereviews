import Redis from 'ioredis';
import { env } from '@/env.mjs';
import {
    CourseData,
    FALLBACK_COURSES,
    getSubjectAbbreviation,
    getSubjectNameFromCodePrefix,
    buildCourseFromDetail,
} from './courses-types';

export type { CourseData };

// Avoid multiple connections in development hot-reloads
const globalForRedis = globalThis as unknown as {
    redis: Redis | undefined;
};

export const redis = globalForRedis.redis ?? new Redis(env.REDIS_URL);
if (env.NODE_ENV !== 'production') globalForRedis.redis = redis;

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
            // Dynamically query subject list for each term first to skip invalid or empty term queries
            const tasks: Array<{ subject: string; termQuery: typeof termQueries[0] }> = [];
            
            await Promise.all(
                termQueries.map(async (termQuery) => {
                    try {
                        const subjectsUrl = `${env.COURSES_API_URL}/subjects?year=${year}&term=${termQuery.alias}`;
                        const subjectsResponse = await fetch(subjectsUrl, { headers, next: { revalidate: 86400 } });
                        if (subjectsResponse.ok) {
                            const rawSubjects = await subjectsResponse.json() as Array<string | { code: string; name: string }>;
                            const fetchedList = rawSubjects.map(s => {
                                if (typeof s === 'string') return s;
                                return s.name || s.code || '';
                            }).filter(Boolean);

                            for (const subject of fetchedList) {
                                tasks.push({ subject, termQuery });
                            }
                            console.log(`Background Courses API Fetch: resolved ${fetchedList.length} subjects for term ${termQuery.alias}`);
                        }
                    } catch (subjectsError) {
                        console.warn(`Background Courses API Fetch: subjects fetch failed for term ${termQuery.alias}:`, subjectsError);
                        // Fallback to default list if sem1/sem2 fails
                        if (termQuery.alias === 'sem1' || termQuery.alias === 'sem2') {
                            for (const subject of subjects) {
                                tasks.push({ subject, termQuery });
                            }
                        }
                    }
                })
            );

            console.log(`Background Courses API Fetch: resolved ${tasks.length} total tasks. Launching concurrent worker pool...`);

            // Execute fetches using a concurrent worker queue (limit 35 active requests) to maximize throughput
            const limit = 35;
            let taskIndex = 0;

            const executeNext = async (): Promise<void> => {
                if (taskIndex >= tasks.length) return;
                const task = tasks[taskIndex++];

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

                // Incrementally update Redis cache in batches of 15 completed tasks to optimize writes
                if (taskIndex % 15 === 0 || taskIndex === tasks.length) {
                    if (coursesMap.size > 0) {
                        try {
                            const currentCached = await redis.get(cacheKey);
                            const currentList = currentCached ? (JSON.parse(currentCached) as CourseData[]) : [];
                            const mergedMap = new Map<string, CourseData>();
                            for (const c of currentList) {
                                mergedMap.set(c.code.toUpperCase(), c);
                            }
                            for (const [code, c] of coursesMap.entries()) {
                                mergedMap.set(code, c);
                            }
                            const mergedData = Array.from(mergedMap.values());
                            await redis.set(cacheKey, JSON.stringify(mergedData), 'EX', 172800);
                        } catch (cacheErr) {
                            console.error('Background prefetch: incremental update failed:', cacheErr);
                        }
                    }
                }

                // Keep working
                await executeNext();
            };

            const workers = Array.from({ length: limit }, () => executeNext());
            await Promise.all(workers);

            console.log(`Background Courses API Fetch: completed. Total courses: ${coursesMap.size}`);
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
