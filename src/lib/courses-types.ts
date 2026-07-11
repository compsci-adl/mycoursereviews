export interface CourseData {
    code: string;
    name: string;
    description: string;
    terms: string[];
    officialLink: string;
    coordinator?: string | null;
    campus?: string | null;
    units?: number | null;
    levelOfStudy?: string | null;
    prerequisites?: string | null;
    corequisites?: string | null;
    antirequisites?: string | null;
    assessments?: Array<{ title: string; weighting: string; hurdle: string }>;
    learningOutcomes?: Array<{ description: string; outcomeIndex: number }>;
    textbooks?: string | null;
    subjectName?: string | null;
    apiId?: string | null;
    universityWideElective?: boolean | null;
    isNoLongerOffered?: boolean | null;
}

// Robust fallback course mocks for developer ease & server safety
export const FALLBACK_COURSES: CourseData[] = [
    {
        code: 'COMP SCI 1102',
        name: 'Object Oriented Programming',
        description: 'An introduction to programming in the object-oriented paradigm. Topics include classes, objects, inheritance, polymorphism, design patterns, and debugging structures.',
        terms: ['Semester 1', 'Semester 2', 'Summer'],
        officialLink: 'https://www.adelaide.edu.au/course-outlines/105703/1/sem-1/',
    },
    {
        code: 'COMP SCI 2000',
        name: 'Computer Systems',
        description: 'Covers execution of programs on computer systems, detailing binary compilation, assembly language, memory architectures, caching protocols, and process management.',
        terms: ['Semester 1', 'Semester 2'],
        officialLink: 'https://www.adelaide.edu.au/course-outlines/106342/1/sem-2/',
    },
    {
        code: 'COMP SCI 2207',
        name: 'Web and Database Systems',
        description: 'Full stack development methodologies. Students study HTTP protocols, relational database management systems (SQL), CSS, HTML, client-side JS, and security models.',
        terms: ['Semester 1', 'Semester 2'],
        officialLink: 'https://www.adelaide.edu.au/course-outlines/106093/1/sem-1/',
    },
    {
        code: 'COMP SCI 3006',
        name: 'Software Engineering & Project',
        description: 'A capstone team project developing modern software solutions for clients. Emphasizes Agile sprint planning, DevOps, unit testing, and design systems.',
        terms: ['Semester 1', 'Semester 2'],
        officialLink: 'https://www.adelaide.edu.au/course-outlines/105742/1/sem-1/',
    },
    {
        code: 'COMP SCI 3310',
        name: 'Artificial Intelligence',
        description: 'Fundamental methodologies under AI including heuristic searches, neural networks, Bayesian decision making, natural language processing, and deep learning algorithms.',
        terms: ['Semester 1'],
        officialLink: 'https://www.adelaide.edu.au/course-outlines/105710/1/sem-1/',
    },
];

export function getSubjectAbbreviation(subjectName: string): string {
    const name = subjectName.trim().toLowerCase();
    
    if (name === 'computer science') return 'COMP SCI';
    if (name === 'mathematical sciences') return 'MATHS';
    if (name === 'statistics') return 'STATS';
    if (name === 'electric/electronic eng & tech') return 'ELEC ENG';
    if (name === 'information systems') return 'INFOSYS';
    if (name === 'artificial intelligence') return 'AI';
    if (name === 'computer graphics') return 'COMP GRAP';
    
    if (subjectName.length <= 8) return subjectName.toUpperCase();
    return subjectName;
}

/**
 * Maps a course code prefix (abbreviation) back to the full subject name used by the Courses API.
 * e.g. "INFO" -> "Information Systems", "COMP SCI" -> "Computer Science"
 */
export function getSubjectNameFromCodePrefix(codePrefix: string): string | null {
    const prefix = codePrefix.trim().toUpperCase();
    const mapping: Record<string, string> = {
        'COMP SCI': 'Computer Science',
        'MATHS': 'Mathematical Sciences',
        'STATS': 'Statistics',
        'ELEC ENG': 'Electric/Electronic Eng & Tech',
        'INFOSYS': 'Information Systems',
        'INFO': 'Information Systems',
        'AI': 'Artificial Intelligence',
        'COMP GRAP': 'Computer Graphics',
        'PROJ MGT': 'Project Management',
        // Codes that are purely numeric prefixes not needing a space (e.g., ARTI)
        'ARTI': 'Artificial Intelligence',
    };
    return mapping[prefix] ?? null;
}

/**
 * Maps course details from the Adelaide University Courses API to the app's CourseData schema.
 */
export function buildCourseFromDetail(
    detail: any,
    fallbackId: string,
    matchedTitle: string,
    matchedSubject: string,
    matchedCode: string
): CourseData {
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
}

