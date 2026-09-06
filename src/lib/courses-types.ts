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
    assessments?: Array<{ title: string; weighting: string; hurdle: string; learningOutcomes?: string }>;
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
        code: 'ACCT1000',
        name: 'Accounting for Decision Makers',
        description: 'The objective of the course is to provide an introductory knowledge of accounting to students of all disciplines. A general overview of accounting principles relating to the use of financial and managerial reports will be presented. The primary focus is to illuminate how accounting information is utilised by a variety of stakeholders in planning, controlling and investing decisions.',
        terms: ['Semester 1', 'Semester 2'],
        officialLink: 'https://adelaideuni.edu.au/study/courses/acct-1000',
        coordinator: 'Lisa Powell',
        subjectName: 'Accounting',
        units: 6,
        levelOfStudy: 'Undergraduate',
        prerequisites: 'N/A',
        corequisites: 'N/A',
        antirequisites: 'N/A',
        apiId: 'd3ff2bbd6fcd',
        textbooks: 'No learning resources are required.',
        learningOutcomes: [
            { description: 'Apply accounting principles and concepts in order to interpret accounting information', outcomeIndex: 1 },
            { description: 'Analyse accounting information from a management and user perspective', outcomeIndex: 2 },
            { description: 'Communicate financial and non-financial information to management to assist in business decision making', outcomeIndex: 3 },
            { description: 'Apply management accounting techniques to assess performance, prepare budgets and assist in decision making', outcomeIndex: 4 },
        ],
        assessments: [
            { title: 'Financial Statement Preparation and Analysis', weighting: '20%', hurdle: '', learningOutcomes: '1,2,3' },
            { title: 'In- Class Tests', weighting: '40%', hurdle: '', learningOutcomes: '1,2,4' },
            { title: 'Final Exam', weighting: '40%', hurdle: '', learningOutcomes: '1,2,4' },
        ],
    },
    {
        code: 'ACCT1004',
        name: 'OL Introductory Accounting',
        description: 'An introductory course covering fundamental principles of financial accounting, double-entry bookkeeping, financial statements, and manager decision making.',
        terms: ['UAO Teaching Period 1', 'UAO Teaching Period 5', 'UAO Teaching Period 3'],
        officialLink: '#',
        subjectName: 'Accounting',
        prerequisites: 'N/A',
        corequisites: 'N/A',
        antirequisites: 'N/A',
        apiId: 'a4d81b2e4caf',
    },
    {
        code: 'ACCT1001',
        name: 'Financial Accounting 1',
        description: 'Covers core principles of financial reporting, transaction recording, asset and liability valuation, and preparation of basic financial statements.',
        terms: ['Semester 1', 'Semester 2'],
        officialLink: '#',
        subjectName: 'Accounting',
        prerequisites: 'Must have completed ACCT1000 Accounting for Decision Makers',
        corequisites: 'N/A',
        antirequisites: 'N/A',
        apiId: '979e2fb76596',
        learningOutcomes: [
            { description: 'Prepare journal entries, balance sheets and financial performance statements', outcomeIndex: 1 },
            { description: 'Apply fundamental GAAP principles and reporting framework requirements', outcomeIndex: 2 },
            { description: 'Analyse corporate annual reports and cash flows for investment decisions', outcomeIndex: 3 },
        ],
        assessments: [
            { title: 'Mid-Semester Test', weighting: '25%', hurdle: '', learningOutcomes: '1,2' },
            { title: 'Financial Case Study Assignment', weighting: '25%', hurdle: '', learningOutcomes: '1,3' },
            { title: 'Final Examination', weighting: '50%', hurdle: '40%', learningOutcomes: '1,2,3' },
        ],
    },
    {
        code: 'COMP SCI 1102',
        name: 'Object Oriented Programming',
        description: 'An introduction to programming in the object-oriented paradigm. Topics include classes, objects, inheritance, polymorphism, design patterns, and debugging structures.',
        terms: ['Semester 1', 'Semester 2', 'Summer'],
        officialLink: 'https://www.adelaide.edu.au/course-outlines/105703/1/sem-1/',
        prerequisites: 'Must have completed COMP SCI 1101 or equivalent introductory programming course',
        corequisites: 'N/A',
        antirequisites: 'N/A',
        learningOutcomes: [
            { description: 'Design modular software systems using object-oriented principles', outcomeIndex: 1 },
            { description: 'Implement inheritance hierarchies, polymorphism and design patterns in Java', outcomeIndex: 2 },
            { description: 'Construct comprehensive automated unit tests for software reliability', outcomeIndex: 3 },
        ],
        assessments: [
            { title: 'Weekly Practical Workshops', weighting: '15%', hurdle: '', learningOutcomes: '1,2' },
            { title: 'Object-Oriented Software Project', weighting: '35%', hurdle: '', learningOutcomes: '1,2,3' },
            { title: 'Final Examination', weighting: '50%', hurdle: '45%', learningOutcomes: '1,2,3' },
        ],
    },
    {
        code: 'COMP SCI 2000',
        name: 'Computer Systems',
        description: 'Covers execution of programs on computer systems, detailing binary compilation, assembly language, memory architectures, caching protocols, and process management.',
        terms: ['Semester 1', 'Semester 2'],
        officialLink: 'https://www.adelaide.edu.au/course-outlines/106342/1/sem-2/',
        prerequisites: 'Must have completed COMP SCI 1102 Object Oriented Programming',
        corequisites: 'N/A',
        antirequisites: 'N/A',
        learningOutcomes: [
            { description: 'Understand program execution models and hardware instruction sets', outcomeIndex: 1 },
            { description: 'Write, trace and debug assembly language programs and memory models', outcomeIndex: 2 },
            { description: 'Analyse cache performance, virtual memory and processor pipelines', outcomeIndex: 3 },
        ],
        assessments: [
            { title: 'Laboratory Practicals', weighting: '20%', hurdle: '', learningOutcomes: '1,2' },
            { title: 'Assembly Systems Programming Project', weighting: '30%', hurdle: '', learningOutcomes: '2,3' },
            { title: 'Final Examination', weighting: '50%', hurdle: '40%', learningOutcomes: '1,2,3' },
        ],
    },
    {
        code: 'COMP SCI 2207',
        name: 'Web and Database Systems',
        description: 'Full stack development methodologies. Students study HTTP protocols, relational database management systems (SQL), CSS, HTML, client-side JS, and security models.',
        terms: ['Semester 1', 'Semester 2'],
        officialLink: 'https://www.adelaide.edu.au/course-outlines/106093/1/sem-1/',
        prerequisites: 'Must have completed COMP SCI 1102 Object Oriented Programming',
        corequisites: 'N/A',
        antirequisites: 'N/A',
        learningOutcomes: [
            { description: 'Design and normalise relational database schemas using SQL', outcomeIndex: 1 },
            { description: 'Develop full-stack web applications with persistent backend services', outcomeIndex: 2 },
            { description: 'Implement authentication, web security principles and modern APIs', outcomeIndex: 3 },
        ],
        assessments: [
            { title: 'Database Design and Query Practical', weighting: '20%', hurdle: '', learningOutcomes: '1' },
            { title: 'Group Web Application Project', weighting: '40%', hurdle: '', learningOutcomes: '1,2,3' },
            { title: 'Final Examination', weighting: '40%', hurdle: '40%', learningOutcomes: '1,2,3' },
        ],
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
    {
        code: 'COMP1003',
        name: 'Structured Data',
        description: 'The course will equip students with the knowledge and skills required to implement and work with structured data in relational database systems. Through theoretical exploration and practical application, students will learn to capture data accurately, write queries to extract information, and the basics of managing data security. The topics covered will provide students with a solid foundation for real-world data management in business.',
        terms: ['Semester 1', 'Semester 2'],
        officialLink: 'https://apps.adelaide.edu.au/public/courseoutline?courseInstanceId=2620_COMP_1003_1',
        subjectName: 'Computer Science',
        coordinator: 'David Cowdrey',
        units: 6,
        levelOfStudy: 'Undergraduate',
        prerequisites: 'N/A',
        corequisites: 'N/A',
        antirequisites: 'N/A',
        apiId: 'da96a257ded4',
        textbooks: 'No learning resources are required.',
        learningOutcomes: [
            { description: 'Explain how data is stored and retrieved from a relational database and the advantages of using the relational model', outcomeIndex: 1 },
            { description: 'Design a relational database given a set of data and usage requirements', outcomeIndex: 2 },
            { description: 'Design and implement database queries to retrieve specified data from a relational database', outcomeIndex: 3 },
            { description: 'Explain how a query interacts with data within a relational database system and the impact design can have on management, retrieval and efficiency', outcomeIndex: 4 },
            { description: 'Demonstrate approaches to securing data access within a database', outcomeIndex: 5 },
            { description: 'Select for efficiency between alternative query options', outcomeIndex: 6 },
        ],
        assessments: [
            { title: 'Concept Design', weighting: '30%', hurdle: '', learningOutcomes: '2,3,4' },
            { title: 'In Class Work', weighting: '20%', hurdle: '', learningOutcomes: '1,2,3,4,5,6' },
            { title: 'Practical Exam', weighting: '50%', hurdle: 'Threshold (50% Required)', learningOutcomes: '3,4,5,6' },
        ],
    },
    {
        code: 'COMP1040',
        name: 'System Architecture',
        description: 'In this course, students will understand the concepts behind various software systems architectures and how to access services provided by the architectures.',
        terms: ['Semester 1'],
        officialLink: '#',
        subjectName: 'Computer Science',
        prerequisites: 'N/A',
        corequisites: 'N/A',
        antirequisites: 'N/A',
        apiId: '7db384fbf486',
    },
    {
        code: 'COMP2001',
        name: 'Language Models, Translation and Execution',
        description: 'Prepares learners with the theoretical knowledge and concepts underpinning programming languages, including formal grammars, automata, parsing, and execution.',
        terms: ['Semester 2'],
        officialLink: '#',
        subjectName: 'Computer Science',
        prerequisites: 'N/A',
        corequisites: 'N/A',
        antirequisites: 'N/A',
        apiId: 'ae46e29d7035',
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

