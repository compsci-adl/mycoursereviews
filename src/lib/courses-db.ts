import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { CourseData, FALLBACK_COURSES, getSubjectAbbreviation } from '@/lib/courses-types';

export type { CourseData };

let sqliteDbInstance: DatabaseSync | null = null;
let resolvedDbPath: string | null = null;

export function getSqliteDbPath(): string | null {
    if (resolvedDbPath && fs.existsSync(resolvedDbPath)) {
        return resolvedDbPath;
    }

    try {
        const localPath = path.join(/*turbopackIgnore: true*/ process.cwd(), 'src/lib/courses.sqlite3');
        if (fs.existsSync(localPath)) {
            resolvedDbPath = localPath;
            return localPath;
        }
    } catch {}

    const candidates = [
        process.env.COURSES_DB_PATH,
        '../courses-api/local.sqlite3',
        '../courses-api/src/local.sqlite3',
        '/data/courses-api/local.sqlite3',
        '/data/courses-api/dev.sqlite3',
        '/app/courses-api/local.sqlite3',
        '/app/courses-api/src/local.sqlite3',
        '/app/courses-api/src/dev.sqlite3',
    ].filter(Boolean) as string[];

    for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
            resolvedDbPath = candidate;
            return candidate;
        }
    }

    return null;
}

export function getSqliteDb(): DatabaseSync | null {
    if (sqliteDbInstance) return sqliteDbInstance;

    const dbPath = getSqliteDbPath();
    if (!dbPath) return null;

    try {
        sqliteDbInstance = new DatabaseSync(dbPath, { readOnly: true });
        return sqliteDbInstance;
    } catch (err) {
        console.error('Failed to open SQLite database at', dbPath, err);
        return null;
    }
}

export function getSqliteCourses(): CourseData[] | null {
    const db = getSqliteDb();
    if (!db) return null;

    try {
        const stmt = db.prepare(`
            SELECT
                id,
                terms,
                subject,
                course_code,
                title
            FROM courses
            ORDER BY course_code ASC
        `);

        const rows = stmt.all() as any[];
        if (!rows || rows.length === 0) return null;

        return rows.map((row) => {
            const rawSubject = (row.subject || '').trim();
            const rawCode = (row.course_code || '').trim();

            let code = rawCode;
            if (/^\d/.test(rawCode) && rawSubject) {
                const subAbbr = getSubjectAbbreviation(rawSubject);
                code = `${subAbbr} ${rawCode}`;
            }

            const title = (row.title || '').trim() || code;

            let terms: string[] = [];
            if (row.terms && typeof row.terms === 'string') {
                if (row.terms.startsWith('[')) {
                    try { terms = JSON.parse(row.terms); } catch (_) {}
                } else if (row.terms.includes(',')) {
                    terms = row.terms.split(',').map((t: string) => t.trim()).filter(Boolean);
                } else if (row.terms.trim()) {
                    terms = [row.terms.trim()];
                }
            }
            if (terms.length === 0) {
                terms = ['Semester 1', 'Semester 2'];
            }

            return {
                code,
                name: title,
                description: '',
                terms,
                officialLink: '#',
                subjectName: rawSubject || null,
                apiId: row.id || null,
            };
        });
    } catch (err) {
        console.error('Error fetching SQLite courses:', err);
        return null;
    }
}

export function getSqliteCoursesBatch(limit: number = 36): CourseData[] | null {
    const db = getSqliteDb();
    if (!db) return null;

    try {
        const stmt = db.prepare(`
            SELECT
                id,
                terms,
                subject,
                course_code,
                title
            FROM courses
            ORDER BY course_code ASC
            LIMIT ?
        `);

        const rows = stmt.all(limit) as any[];
        if (!rows || rows.length === 0) return null;

        return rows.map((row) => {
            const rawSubject = (row.subject || '').trim();
            const rawCode = (row.course_code || '').trim();

            let code = rawCode;
            if (/^\d/.test(rawCode) && rawSubject) {
                const subAbbr = getSubjectAbbreviation(rawSubject);
                code = `${subAbbr} ${rawCode}`;
            }

            const title = (row.title || '').trim() || code;

            let terms: string[] = [];
            if (row.terms && typeof row.terms === 'string') {
                if (row.terms.startsWith('[')) {
                    try { terms = JSON.parse(row.terms); } catch (_) {}
                } else if (row.terms.includes(',')) {
                    terms = row.terms.split(',').map((t: string) => t.trim()).filter(Boolean);
                } else if (row.terms.trim()) {
                    terms = [row.terms.trim()];
                }
            }
            if (terms.length === 0) {
                terms = ['Semester 1', 'Semester 2'];
            }

            return {
                code,
                name: title,
                description: '',
                terms,
                officialLink: '#',
                subjectName: rawSubject || null,
                apiId: row.id || null,
            };
        });
    } catch (err) {
        console.error('Error fetching SQLite courses batch:', err);
        return null;
    }
}

export function getSqliteCourseByCode(code: string): CourseData | null {
    const db = getSqliteDb();
    if (!db) return null;

    try {
        const cleanCode = code.trim().toUpperCase().replace(/\s+/g, '');
        const stmt = db.prepare(`
            SELECT * FROM courses
            WHERE UPPER(REPLACE(course_code, ' ', '')) = ?
               OR UPPER(REPLACE(id, ' ', '')) = ?
            LIMIT 1
        `);

        const row = stmt.get(cleanCode, cleanCode) as any;
        if (!row) return null;

        const rawSubject = (row.subject || '').trim();
        const rawCode = (row.course_code || '').trim();

        let formattedCode = rawCode;
        if (/^\d/.test(rawCode) && rawSubject) {
            const subAbbr = getSubjectAbbreviation(rawSubject);
            formattedCode = `${subAbbr} ${rawCode}`;
        }

        const title = (row.title || '').trim() || formattedCode;

        let terms: string[] = [];
        if (row.terms && typeof row.terms === 'string') {
            if (row.terms.startsWith('[')) {
                try { terms = JSON.parse(row.terms); } catch (_) {}
            } else if (row.terms.includes(',')) {
                terms = row.terms.split(',').map((t: string) => t.trim()).filter(Boolean);
            } else if (row.terms.trim()) {
                terms = [row.terms.trim()];
            }
        }
        if (terms.length === 0) {
            terms = ['Semester 1', 'Semester 2'];
        }

        const officialLink =
            row.course_outline_url ||
            row.url ||
            `https://www.adelaide.edu.au/course-outlines/${row.id || encodeURIComponent(formattedCode)}`;

        let learningOutcomes: Array<{ description: string; outcomeIndex: number }> = [];
        try {
            const loStmt = db.prepare(`SELECT description, outcome_index FROM learning_outcomes WHERE course_id = ? ORDER BY outcome_index ASC`);
            const loRows = loStmt.all(row.id) as any[];
            learningOutcomes = loRows.map((o: any) => ({
                description: o.description ?? '',
                outcomeIndex: o.outcome_index ?? 0,
            }));
        } catch (_) {}

        let assessments: Array<{ title: string; weighting: string; hurdle: string; learningOutcomes?: string }> = [];
        try {
            const assStmt = db.prepare(`SELECT title, weighting, hurdle, learning_outcomes FROM assessments WHERE course_id = ?`);
            const assRows = assStmt.all(row.id) as any[];
            assessments = assRows.map((a: any) => ({
                title: a.title ?? '',
                weighting: a.weighting ?? '',
                hurdle: a.hurdle ?? '',
                learningOutcomes: a.learning_outcomes ?? undefined,
            }));
        } catch (_) {}

        return {
            code: formattedCode,
            name: title,
            description: row.course_overview || `Official Adelaide University outline for ${formattedCode} (${title}).`,
            terms,
            officialLink,
            coordinator: row.course_coordinator ?? null,
            campus: row.campus ?? null,
            units: row.units ? Number(row.units) : null,
            levelOfStudy: row.level_of_study ?? null,
            prerequisites: row.prerequisites ?? null,
            corequisites: row.corequisites ?? null,
            antirequisites: row.antirequisites ?? null,
            assessments: assessments.length > 0 ? assessments : undefined,
            learningOutcomes: learningOutcomes.length > 0 ? learningOutcomes : undefined,
            textbooks: row.textbooks ?? null,
            subjectName: rawSubject || null,
            apiId: row.id || null,
            universityWideElective: row.university_wide_elective ? Boolean(row.university_wide_elective) : null,
        };
    } catch (err) {
        console.error(`Error fetching SQLite course for ${code}:`, err);
        return null;
    }
}

export function getAllCourses(): CourseData[] {
    return getSqliteCourses() ?? FALLBACK_COURSES;
}

export function getCoursesBatch(limit: number = 36): CourseData[] {
    return getSqliteCoursesBatch(limit) ?? getAllCourses().slice(0, limit);
}

export function getCourseByCode(code: string): CourseData | null {
    const sqliteCourse = getSqliteCourseByCode(code);
    const fallbackCourse = FALLBACK_COURSES.find((c) => c.code.toLowerCase() === code.toLowerCase());

    if (sqliteCourse && fallbackCourse) {
        return {
            ...fallbackCourse,
            ...sqliteCourse,
            assessments: sqliteCourse.assessments?.length ? sqliteCourse.assessments : fallbackCourse.assessments,
            learningOutcomes: sqliteCourse.learningOutcomes?.length ? sqliteCourse.learningOutcomes : fallbackCourse.learningOutcomes,
            textbooks: sqliteCourse.textbooks || fallbackCourse.textbooks,
            prerequisites: sqliteCourse.prerequisites && sqliteCourse.prerequisites !== 'N/A' ? sqliteCourse.prerequisites : fallbackCourse.prerequisites,
            corequisites: sqliteCourse.corequisites && sqliteCourse.corequisites !== 'N/A' ? sqliteCourse.corequisites : fallbackCourse.corequisites,
            antirequisites: sqliteCourse.antirequisites && sqliteCourse.antirequisites !== 'N/A' ? sqliteCourse.antirequisites : fallbackCourse.antirequisites,
        };
    }

    return sqliteCourse ?? fallbackCourse ?? null;
}

export async function enrichCourseFromApi(course: CourseData): Promise<CourseData> {
    if (!course.apiId) return course;
    if (course.learningOutcomes?.length && course.assessments?.length) return course;

    try {
        const res = await fetch(`https://courses-api.csclub.org.au/courses/${encodeURIComponent(course.apiId)}`, {
            signal: AbortSignal.timeout(3000),
            next: { revalidate: 86400 },
        });
        if (!res.ok) return course;
        const data = await res.json();
        if (!data || typeof data !== 'object') return course;

        const enriched: CourseData = { ...course };
        if (data.learning_outcomes && Array.isArray(data.learning_outcomes) && data.learning_outcomes.length > 0) {
            enriched.learningOutcomes = data.learning_outcomes.map((lo: any) => ({
                description: lo.description ?? '',
                outcomeIndex: lo.outcome_index ?? 0,
            }));
        }
        if (data.assessments && Array.isArray(data.assessments) && data.assessments.length > 0) {
            enriched.assessments = data.assessments.map((a: any) => ({
                title: a.title ?? '',
                weighting: a.weighting ?? '',
                hurdle: a.hurdle ?? '',
                learningOutcomes: a.learning_outcomes ?? undefined,
            }));
        }
        if (data.textbooks && !enriched.textbooks) {
            enriched.textbooks = data.textbooks;
        }
        if (data.requirements) {
            if (data.requirements.prerequisites && (!enriched.prerequisites || enriched.prerequisites === 'N/A')) {
                enriched.prerequisites = typeof data.requirements.prerequisites === 'string'
                    ? data.requirements.prerequisites
                    : JSON.stringify(data.requirements.prerequisites);
            }
            if (data.requirements.corequisites && (!enriched.corequisites || enriched.corequisites === 'N/A')) {
                enriched.corequisites = typeof data.requirements.corequisites === 'string'
                    ? data.requirements.corequisites
                    : JSON.stringify(data.requirements.corequisites);
            }
            if (data.requirements.antirequisites && (!enriched.antirequisites || enriched.antirequisites === 'N/A')) {
                enriched.antirequisites = typeof data.requirements.antirequisites === 'string'
                    ? data.requirements.antirequisites
                    : JSON.stringify(data.requirements.antirequisites);
            }
        }
        return enriched;
    } catch {
        return course;
    }
}

export const CoursesApiClient = {
    getAllCourses,
    getCoursesBatch,
    getCourseByCode,
    enrichCourseFromApi,
};
