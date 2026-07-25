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
        code: 'ACCT1004',
        name: 'OL Introductory Accounting',
        description: 'An introductory course covering fundamental principles of financial accounting, double-entry bookkeeping, financial statements, and manager decision making.',
        terms: ['UAO Teaching Period 1', 'UAO Teaching Period 5', 'UAO Teaching Period 3'],
        officialLink: '#',
        subjectName: 'Accounting',
    },
    {
        code: 'ACCT1001',
        name: 'Financial Accounting 1',
        description: 'Covers core principles of financial reporting, transaction recording, asset and liability valuation, and preparation of basic financial statements.',
        terms: ['Semester 1', 'Semester 2'],
        officialLink: '#',
        subjectName: 'Accounting',
    },
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

