import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });
process.env.SKIP_ENV_VALIDATION = 'true';

import { inArray } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema';
import {
    comments,
    courseUpdateVotes,
    likes,
    reviews,
    users,
} from './schema';

export const SEED_USERS = [
    { id: 'dev-user-alice', name: 'Alice Smith', role: 'user' },
    { id: 'dev-user-bob', name: 'Bob Chen', role: 'user' },
    { id: 'dev-user-charlie', name: 'Charlie Davies', role: 'user' },
    { id: 'dev-user-diana', name: 'Diana Taylor', role: 'user' },
    { id: 'dev-user-ethan', name: 'Ethan Wright', role: 'user' },
    { id: 'dev-user-fiona', name: 'Fiona Gallagher', role: 'user' },
    { id: 'dev-user-george', name: 'George Miller', role: 'user' },
    { id: 'dev-user-admin', name: 'Alex Rivera (Admin)', role: 'admin' },
];

export const SEED_REVIEWS = [
    // --- 1. COMP1003 (Structured Data - 4 reviews) ---
    {
        id: '10000000-0000-4000-8000-000000000001',
        courseCode: 'COMP1003',
        userId: 'dev-user-alice',
        title: 'Outstanding introduction to relational databases and structured data querying',
        description:
            'COMP1003 is one of the most well-structured introductory courses at Adelaide. Learning entity-relationship modeling, relational schema normalization, and writing expressive SQL queries was intuitive and practical. Weekly practicals reinforced the lecture content well, and the teaching assistants were super helpful during lab sessions.',
        overallRating: 5,
        difficultyScore: 2.5,
        usefulnessScore: 5.0,
        enjoymentScore: 4.5,
        termTaken: 'Semester 1, 2025',
        grade: 'HD',
        isAnonymous: false,
    },
    {
        id: '10000000-0000-4000-8000-000000000002',
        courseCode: 'COMP1003',
        userId: 'dev-user-bob',
        title: 'Solid fundamentals, but start concept design milestones early',
        description:
            'The coursework provides a solid foundation for any software engineering major. While basic SELECT queries feel straightforward if you have prior SQL exposure, the concept design assignment and complex joins can be tricky if left to the last minute. Make sure you attend workshops and test edge cases thoroughly.',
        overallRating: 4,
        difficultyScore: 3.0,
        usefulnessScore: 4.5,
        enjoymentScore: 4.0,
        termTaken: 'Semester 2, 2025',
        grade: 'D',
        isAnonymous: true,
    },
    {
        id: '10000000-0000-4000-8000-000000000003',
        courseCode: 'COMP1003',
        userId: 'dev-user-charlie',
        title: 'Great course structure with engaging practical query workshops',
        description:
            'I really enjoyed the workshop activities and data modeling exercises. Translating real-world business requirements into normalized schemas and efficient queries felt very rewarding. The practical exam threshold was manageable with the revision material provided.',
        overallRating: 5,
        difficultyScore: 2.5,
        usefulnessScore: 5.0,
        enjoymentScore: 5.0,
        termTaken: 'Semester 1, 2025',
        grade: 'HD',
        isAnonymous: false,
    },
    {
        id: '10000000-0000-4000-8000-000000000004',
        courseCode: 'COMP1003',
        userId: 'dev-user-diana',
        title: 'Essential data management stepping stone for modern software degrees',
        description:
            'Understanding indexing, query performance, and basic role-based database security gave me so much confidence when working with real applications. The weekly automated query feedback tests were invaluable for learning to write clean and correct relational operations.',
        overallRating: 4,
        difficultyScore: 3.0,
        usefulnessScore: 4.5,
        enjoymentScore: 4.0,
        termTaken: 'Semester 2, 2025',
        grade: 'C',
        isAnonymous: false,
    },

    // --- 2. COMP1040 (System Architecture - 4 reviews) ---
    {
        id: '10000000-0000-4000-8000-000000000005',
        courseCode: 'COMP1040',
        userId: 'dev-user-bob',
        title: 'Challenging deep-dive into software systems and modern architecture patterns',
        description:
            'A very eye-opening course that demystifies how large software systems are architected to scale reliably. Analyzing architectural concerns, component boundaries, and trade-offs between microservices and monoliths was demanding but deeply rewarding. Highly recommended for students wanting to understand system design.',
        overallRating: 4,
        difficultyScore: 4.0,
        usefulnessScore: 4.5,
        enjoymentScore: 4.0,
        termTaken: 'Semester 1, 2025',
        grade: 'C',
        isAnonymous: false,
    },
    {
        id: '10000000-0000-4000-8000-000000000006',
        courseCode: 'COMP1040',
        userId: 'dev-user-charlie',
        title: 'Demanding project deliverables with rigorous design documentation',
        description:
            'Be prepared to spend a significant amount of hours each week documenting architecture patterns and designing system interfaces. The lectures cover architectural tactics and service access in depth. Helpful tutors, but make sure your team coordinates consistently on system modeling.',
        overallRating: 3,
        difficultyScore: 4.5,
        usefulnessScore: 4.0,
        enjoymentScore: 3.0,
        termTaken: 'Semester 1, 2025',
        grade: 'P',
        isAnonymous: true,
    },
    {
        id: '10000000-0000-4000-8000-000000000007',
        courseCode: 'COMP1040',
        userId: 'dev-user-ethan',
        title: 'Brilliant insights into capturing architectural quality attributes',
        description:
            'If you want to truly understand how to design scalable, fault-tolerant, and maintainable enterprise software, this course is unmatched. Understanding latency budgets, decoupling mechanisms, and service layers will change how you write code forever. Tough assignments, but worth every minute.',
        overallRating: 5,
        difficultyScore: 3.5,
        usefulnessScore: 5.0,
        enjoymentScore: 4.5,
        termTaken: 'Semester 1, 2025',
        grade: 'HD',
        isAnonymous: false,
    },
    {
        id: '10000000-0000-4000-8000-000000000008',
        courseCode: 'COMP1040',
        userId: 'dev-user-fiona',
        title: 'Steep conceptual curve but tutors make the difference',
        description:
            'The transition from small individual coding tasks to evaluating enterprise architecture diagrams is a big leap. Quality attribute scenarios and architectural evaluation take some time to get used to. Don\'t skip any practical sessions, and take advantage of tutor consultation hours.',
        overallRating: 4,
        difficultyScore: 4.0,
        usefulnessScore: 4.5,
        enjoymentScore: 3.5,
        termTaken: 'Semester 1, 2025',
        grade: 'D',
        isAnonymous: false,
    },

    // --- 3. COMP2001 (Language Models, Translation and Execution - 4 reviews) ---
    {
        id: '10000000-0000-4000-8000-000000000009',
        courseCode: 'COMP2001',
        userId: 'dev-user-diana',
        title: 'Fascinating journey from formal grammars to compiler execution',
        description:
            'This course gives you real-world compiler and language execution experience from day one. You learn formal automata, lexical analysis, recursive descent parsing, and abstract syntax tree evaluation. The project allows plenty of creative freedom and gave me great talking points for technical internship interviews.',
        overallRating: 5,
        difficultyScore: 3.5,
        usefulnessScore: 5.0,
        enjoymentScore: 5.0,
        termTaken: 'Semester 2, 2025',
        grade: 'HD',
        isAnonymous: false,
    },
    {
        id: '10000000-0000-4000-8000-000000000010',
        courseCode: 'COMP2001',
        userId: 'dev-user-charlie',
        title: 'Enjoyable interpreter project with great theoretical relevance',
        description:
            'Building a complete end-to-end tokenizer and interpreter for a domain-specific language was a highlight of my degree so far. Finding reliable team members is crucial since translation milestones are heavily weighted. The grammar and parser generator sections were taught especially well.',
        overallRating: 4,
        difficultyScore: 3.5,
        usefulnessScore: 4.5,
        enjoymentScore: 4.0,
        termTaken: 'Semester 2, 2025',
        grade: 'D',
        isAnonymous: false,
    },
    {
        id: '10000000-0000-4000-8000-000000000011',
        courseCode: 'COMP2001',
        userId: 'dev-user-george',
        title: 'Great balance of language theory and pragmatic interpreter implementation',
        description:
            'The syllabus does a fantastic job teaching both theoretical foundations (context-free grammars, pushdown automata) and pragmatic runtime execution techniques. Writing software to translate and execute code helped solidify concepts that other courses only talk about in theory.',
        overallRating: 5,
        difficultyScore: 3.0,
        usefulnessScore: 5.0,
        enjoymentScore: 4.5,
        termTaken: 'Semester 2, 2025',
        grade: 'HD',
        isAnonymous: false,
    },
    {
        id: '10000000-0000-4000-8000-000000000012',
        courseCode: 'COMP2001',
        userId: 'dev-user-alice',
        title: 'Highly rewarding practical assignment for language processing enthusiasts',
        description:
            'The practical translation assignment is substantial and requires consistent collaboration on Git. As long as your team communicates and sets clear milestones early for AST traversal and bytecode interpretation, you will have an enjoyable time shipping a working language runtime.',
        overallRating: 4,
        difficultyScore: 3.5,
        usefulnessScore: 4.5,
        enjoymentScore: 4.0,
        termTaken: 'Semester 2, 2025',
        grade: 'HD',
        isAnonymous: true,
    },

    // --- 4. ACCT1001 (4 reviews) ---
    {
        id: '10000000-0000-4000-8000-000000000013',
        courseCode: 'ACCT1001',
        userId: 'dev-user-alice',
        title: 'Clear structure and essential financial accounting principles',
        description:
            'A very well-organized foundational accounting course. The workshops provide step-by-step guidance on constructing balance sheets, income statements, and cash flow reports. While the concepts can be dry at times, the weekly formative quizzes keep you on track for the final exam.',
        overallRating: 4,
        difficultyScore: 3.5,
        usefulnessScore: 4.0,
        enjoymentScore: 3.5,
        termTaken: 'Semester 1, 2025',
        grade: 'D',
        isAnonymous: false,
    },
    {
        id: '10000000-0000-4000-8000-000000000014',
        courseCode: 'ACCT1001',
        userId: 'dev-user-bob',
        title: 'Great introductory elective for non-commerce students',
        description:
            'Took this as an elective outside of computing and found it genuinely practical for personal finance and corporate literacy. The course coordinator explains ledger balancing clearly without assuming prior business knowledge. Regular practice with workshop questions is all you need for an HD.',
        overallRating: 5,
        difficultyScore: 2.5,
        usefulnessScore: 4.5,
        enjoymentScore: 4.5,
        termTaken: 'Semester 2, 2024',
        grade: 'HD',
        isAnonymous: true,
    },
    {
        id: '10000000-0000-4000-8000-000000000015',
        courseCode: 'ACCT1001',
        userId: 'dev-user-ethan',
        title: 'Rigorous debits and credits practice pays off',
        description:
            'You must stay on top of the double-entry bookkeeping rules from the very first week. If you practice the tutorial problems diligently, the mid-semester test and the exam will feel very predictable and straightforward.',
        overallRating: 4,
        difficultyScore: 3.0,
        usefulnessScore: 4.0,
        enjoymentScore: 3.5,
        termTaken: 'Semester 1, 2025',
        grade: 'D',
        isAnonymous: false,
    },
    {
        id: '10000000-0000-4000-8000-000000000016',
        courseCode: 'ACCT1001',
        userId: 'dev-user-fiona',
        title: 'Good foundation for corporate reporting analysis',
        description:
            'The case study project analyzing ASX listed company annual reports was the best component. It demonstrated how accounting standards apply in practice beyond standard textbook drills. Recommended for any business or finance student.',
        overallRating: 4,
        difficultyScore: 3.0,
        usefulnessScore: 4.5,
        enjoymentScore: 4.0,
        termTaken: 'Semester 2, 2024',
        grade: 'HD',
        isAnonymous: false,
    },

    // --- 5. ACCT1000 (4 reviews) ---
    {
        id: '10000000-0000-4000-8000-000000000017',
        courseCode: 'ACCT1000',
        userId: 'dev-user-bob',
        title: 'Accessible accounting fundamentals with friendly tutors',
        description:
            'Very approachable course for decision making. Case studies covered real company financial scenarios, which kept the tutorials engaging. The assessments were fair and directly aligned with the learning outcomes shown in lectures.',
        overallRating: 5,
        difficultyScore: 2.0,
        usefulnessScore: 4.5,
        enjoymentScore: 4.5,
        termTaken: 'Semester 1, 2025',
        grade: 'HD',
        isAnonymous: false,
    },
    {
        id: '10000000-0000-4000-8000-000000000018',
        courseCode: 'ACCT1000',
        userId: 'dev-user-george',
        title: 'Practical business numbers without complex calculations',
        description:
            'Designed specifically for managers and decision makers who need to read financial reports rather than prepare journal entries all day. The lecturer gave real-world insights from industry consulting that made every class interesting.',
        overallRating: 4,
        difficultyScore: 2.0,
        usefulnessScore: 4.0,
        enjoymentScore: 4.0,
        termTaken: 'Semester 2, 2024',
        grade: 'D',
        isAnonymous: false,
    },
    {
        id: '10000000-0000-4000-8000-000000000019',
        courseCode: 'ACCT1000',
        userId: 'dev-user-alice',
        title: 'Great breadth of financial literacy concepts',
        description:
            'Covers budgeting, cost behavior, break-even analysis, and ratio evaluation. The group presentation in tutorials helped everyone synthesize financial indicators in a collaborative environment. Highly recommended introductory elective.',
        overallRating: 5,
        difficultyScore: 2.5,
        usefulnessScore: 4.5,
        enjoymentScore: 4.5,
        termTaken: 'Semester 1, 2025',
        grade: 'HD',
        isAnonymous: false,
    },
    {
        id: '10000000-0000-4000-8000-000000000020',
        courseCode: 'ACCT1000',
        userId: 'dev-user-diana',
        title: 'Manageable workload and clear online lecture modules',
        description:
            'The weekly modules were concise and structured with short self-check quizzes. I liked how the exam focused on strategic business implications rather than memorizing accounting rules verbatim.',
        overallRating: 4,
        difficultyScore: 2.0,
        usefulnessScore: 4.0,
        enjoymentScore: 4.0,
        termTaken: 'Semester 2, 2024',
        grade: 'D',
        isAnonymous: true,
    },

    // --- 6. ACCT1004 (3 reviews) ---
    {
        id: '10000000-0000-4000-8000-000000000021',
        courseCode: 'ACCT1004',
        userId: 'dev-user-ethan',
        title: 'Flexible online delivery format with self-paced content',
        description:
            'The online mode worked conveniently alongside part-time work commitments. Discussion forums were active and teaching staff answered query threads within a day. Practical examples focused on small enterprise bookkeeping.',
        overallRating: 4,
        difficultyScore: 2.5,
        usefulnessScore: 4.0,
        enjoymentScore: 4.0,
        termTaken: 'Semester 1, 2025',
        grade: 'D',
        isAnonymous: false,
    },
    {
        id: '10000000-0000-4000-8000-000000000022',
        courseCode: 'ACCT1004',
        userId: 'dev-user-fiona',
        title: 'Good introductory curriculum for distance learners',
        description:
            'Well paced introduction to accounting theory. The digital workbook exercises were intuitive and guided me step-by-step through closing entries and trial balance reconciliations.',
        overallRating: 4,
        difficultyScore: 3.0,
        usefulnessScore: 4.0,
        enjoymentScore: 3.5,
        termTaken: 'Semester 2, 2024',
        grade: 'C',
        isAnonymous: true,
    },
    {
        id: '10000000-0000-4000-8000-000000000023',
        courseCode: 'ACCT1004',
        userId: 'dev-user-george',
        title: 'Smooth online experience with clear assessment criteria',
        description:
            'Video lectures were crisp and divided into manageable topic chunks. The online invigilated test had no technical hiccups, and assessment rubrics were transparently communicated before each due date.',
        overallRating: 5,
        difficultyScore: 2.0,
        usefulnessScore: 4.5,
        enjoymentScore: 4.5,
        termTaken: 'Semester 1, 2025',
        grade: 'HD',
        isAnonymous: false,
    },

    // --- 7. COMP1023 (4 reviews) ---
    {
        id: '10000000-0000-4000-8000-000000000024',
        courseCode: 'COMP1023',
        userId: 'dev-user-charlie',
        title: 'Clear progression into object-oriented design and programming',
        description:
            'Great curriculum pacing that takes you from fundamental algorithmic building blocks to class diagrams and modular architecture. The weekly automated grading feedback helped catch bugs early and motivated me to write clean, testable code.',
        overallRating: 4,
        difficultyScore: 3.0,
        usefulnessScore: 4.5,
        enjoymentScore: 4.0,
        termTaken: 'Semester 1, 2025',
        grade: 'D',
        isAnonymous: false,
    },
    {
        id: '10000000-0000-4000-8000-000000000025',
        courseCode: 'COMP1023',
        userId: 'dev-user-bob',
        title: 'Solid programming foundation with good hands-on labs',
        description:
            'The laboratory assignments give you immediate practical reinforcement on inheritance, abstract classes, and interfaces. The teaching staff is approachable and the workshop exercises are very helpful for exam revision.',
        overallRating: 5,
        difficultyScore: 3.0,
        usefulnessScore: 5.0,
        enjoymentScore: 4.5,
        termTaken: 'Semester 2, 2024',
        grade: 'HD',
        isAnonymous: true,
    },
    {
        id: '10000000-0000-4000-8000-000000000026',
        courseCode: 'COMP1023',
        userId: 'dev-user-ethan',
        title: 'Engaging coding assignments and supportive tutors',
        description:
            'The mini-project in the second half of semester was both fun and challenging. We created an interactive application with GUI components, which tied all the object-oriented concepts together very neatly.',
        overallRating: 4,
        difficultyScore: 2.5,
        usefulnessScore: 4.5,
        enjoymentScore: 4.5,
        termTaken: 'Semester 1, 2025',
        grade: 'HD',
        isAnonymous: false,
    },
    {
        id: '10000000-0000-4000-8000-000000000027',
        courseCode: 'COMP1023',
        userId: 'dev-user-diana',
        title: 'Crucial course for advancing in computer science',
        description:
            'You cannot afford to gloss over OOP if you plan on taking algorithms or software engineering. The assignments force you to plan your architecture with UML before writing code, which is a great habit.',
        overallRating: 4,
        difficultyScore: 3.0,
        usefulnessScore: 4.5,
        enjoymentScore: 4.0,
        termTaken: 'Semester 2, 2024',
        grade: 'D',
        isAnonymous: false,
    },

    // --- 8. COMP3001 (4 reviews) ---
    {
        id: '10000000-0000-4000-8000-000000000028',
        courseCode: 'COMP3001',
        userId: 'dev-user-diana',
        title: 'Superb software engineering topics and capstone preparation',
        description:
            'Covers the modern software engineering lifecycle, agile sprint planning, continuous integration pipelines, and architecture styles. Having industry-style project reviews prepared me significantly for professional engineering roles. A must-take elective.',
        overallRating: 5,
        difficultyScore: 3.5,
        usefulnessScore: 5.0,
        enjoymentScore: 4.5,
        termTaken: 'Semester 2, 2024',
        grade: 'HD',
        isAnonymous: false,
    },
    {
        id: '10000000-0000-4000-8000-000000000029',
        courseCode: 'COMP3001',
        userId: 'dev-user-alice',
        title: 'Modern devops, testing practices, and clean architecture',
        description:
            'The curriculum focuses on automated testing, dependency injection, and microservices versus monolithic systems. Working on a shared repository with pull request code reviews mirrored what I did during my software internship.',
        overallRating: 5,
        difficultyScore: 3.0,
        usefulnessScore: 5.0,
        enjoymentScore: 5.0,
        termTaken: 'Semester 1, 2025',
        grade: 'HD',
        isAnonymous: false,
    },
    {
        id: '10000000-0000-4000-8000-000000000030',
        courseCode: 'COMP3001',
        userId: 'dev-user-george',
        title: 'Realistic team dynamics and agile sprint retrospectives',
        description:
            'Our group learned how to manage technical debt, run bi-weekly sprint standups, and resolve merge conflicts smoothly. The course coordinator has extensive industry experience and gives concrete feedback on system design diagrams.',
        overallRating: 4,
        difficultyScore: 3.5,
        usefulnessScore: 4.5,
        enjoymentScore: 4.0,
        termTaken: 'Semester 2, 2024',
        grade: 'D',
        isAnonymous: true,
    },
    {
        id: '10000000-0000-4000-8000-000000000031',
        courseCode: 'COMP3001',
        userId: 'dev-user-bob',
        title: 'Practical software quality assurance and code smells',
        description:
            'Learning refactoring patterns, static analysis tooling, and security vulnerability scanning made me write noticeably better code. The workload is manageable if your team communicates regularly on Discord or Slack.',
        overallRating: 4,
        difficultyScore: 3.0,
        usefulnessScore: 4.5,
        enjoymentScore: 4.0,
        termTaken: 'Semester 1, 2025',
        grade: 'D',
        isAnonymous: false,
    },

    // --- 9. COMP4001 (4 reviews) ---
    {
        id: '10000000-0000-4000-8000-000000000032',
        courseCode: 'COMP4001',
        userId: 'dev-user-alice',
        title: 'Cutting-edge content on LLMs and modern neural architectures',
        description:
            'One of the newest and most exciting computer science courses at Adelaide. We covered self-attention, prompting strategies, parameter-efficient fine-tuning, and semantic graphs. The coursework is rigorous but the insights into modern AI research are second to none.',
        overallRating: 5,
        difficultyScore: 4.0,
        usefulnessScore: 5.0,
        enjoymentScore: 5.0,
        termTaken: 'Semester 1, 2025',
        grade: 'HD',
        isAnonymous: false,
    },
    {
        id: '10000000-0000-4000-8000-000000000033',
        courseCode: 'COMP4001',
        userId: 'dev-user-ethan',
        title: 'Fascinating AI papers, but requires strong linear algebra',
        description:
            'You will read top-tier AI conference papers and implement transformer attention mechanisms from scratch. Ensure your Python and PyTorch skills are sharp before taking this course, as assignments involve training models on GPU clusters.',
        overallRating: 4,
        difficultyScore: 4.5,
        usefulnessScore: 4.5,
        enjoymentScore: 4.5,
        termTaken: 'Semester 1, 2025',
        grade: 'D',
        isAnonymous: false,
    },
    {
        id: '10000000-0000-4000-8000-000000000034',
        courseCode: 'COMP4001',
        userId: 'dev-user-diana',
        title: 'Fantastic exploration of retrieval-augmented generation',
        description:
            'The project on building a vector database indexing pipeline with retrieval-augmented generation (RAG) was easily the most useful project I completed in honours. The lecturers are active researchers in NLP who know the latest developments.',
        overallRating: 5,
        difficultyScore: 4.0,
        usefulnessScore: 5.0,
        enjoymentScore: 5.0,
        termTaken: 'Semester 1, 2025',
        grade: 'HD',
        isAnonymous: true,
    },
    {
        id: '10000000-0000-4000-8000-000000000035',
        courseCode: 'COMP4001',
        userId: 'dev-user-charlie',
        title: 'Deep technical theory paired with hands-on PyTorch notebooks',
        description:
            'A very demanding postgraduate/honours course that rewards curiosity. The seminars dissecting tokenization algorithms, LoRA fine-tuning, and prompt hallucination mitigation gave me great confidence when interviewing for machine learning roles.',
        overallRating: 5,
        difficultyScore: 4.0,
        usefulnessScore: 5.0,
        enjoymentScore: 4.5,
        termTaken: 'Semester 2, 2024',
        grade: 'HD',
        isAnonymous: false,
    },

    // --- 10. COMP4003 (3 reviews) ---
    {
        id: '10000000-0000-4000-8000-000000000036',
        courseCode: 'COMP4003',
        userId: 'dev-user-bob',
        title: 'Deep dive into database storage engines and query optimization',
        description:
            'Goes far beyond basic SQL into B-tree indexing internals, write-ahead logging, lock management, and distributed query planning. If you want to understand how PostgreSQL or distributed databases manage ACID transactions under concurrency, take this course.',
        overallRating: 5,
        difficultyScore: 4.0,
        usefulnessScore: 5.0,
        enjoymentScore: 4.5,
        termTaken: 'Semester 2, 2024',
        grade: 'HD',
        isAnonymous: false,
    },
    {
        id: '10000000-0000-4000-8000-000000000037',
        courseCode: 'COMP4003',
        userId: 'dev-user-fiona',
        title: 'Rigorous database theory with complex indexing benchmarks',
        description:
            'We implemented custom buffer pool managers and analyzed disk I/O bottlenecks. The mathematical models behind relational query optimizers were challenging, but the course coordinator explained Cost-Based Optimization clearly.',
        overallRating: 4,
        difficultyScore: 4.5,
        usefulnessScore: 4.5,
        enjoymentScore: 4.0,
        termTaken: 'Semester 1, 2025',
        grade: 'D',
        isAnonymous: true,
    },
    {
        id: '10000000-0000-4000-8000-000000000038',
        courseCode: 'COMP4003',
        userId: 'dev-user-george',
        title: 'Indispensable course for aspiring backend and data platform engineers',
        description:
            'Understanding isolation levels, two-phase locking, and distributed consensus (Raft/Paxos) will separate you from ordinary developers. The hands-on C++ labs gave deep practical insight into database storage engines.',
        overallRating: 5,
        difficultyScore: 4.0,
        usefulnessScore: 5.0,
        enjoymentScore: 4.5,
        termTaken: 'Semester 2, 2024',
        grade: 'HD',
        isAnonymous: false,
    },
];

export const SEED_COMMENTS = [
    // --- Comments on COMP1003 (Review 1) ---
    {
        id: '20000000-0000-4000-8000-000000000001',
        reviewId: '10000000-0000-4000-8000-000000000001',
        userId: 'dev-user-bob',
        parentId: null,
        content: 'Did you find the textbook necessary or were lecture slides and lab sheets enough for SQL revision?',
    },
    {
        id: '20000000-0000-4000-8000-000000000002',
        reviewId: '10000000-0000-4000-8000-000000000001',
        userId: 'dev-user-alice',
        parentId: '20000000-0000-4000-8000-000000000001',
        content: "Lecture slides and lab sheets were more than enough! Don't worry about buying the textbook.",
    },
    {
        id: '20000000-0000-4000-8000-000000000003',
        reviewId: '10000000-0000-4000-8000-000000000001',
        userId: 'dev-user-ethan',
        parentId: null,
        content: 'How many hours per week did you dedicate to the concept design and normalization assignment?',
    },
    {
        id: '20000000-0000-4000-8000-000000000004',
        reviewId: '10000000-0000-4000-8000-000000000001',
        userId: 'dev-user-alice',
        parentId: '20000000-0000-4000-8000-000000000003',
        content: 'Around 8 to 10 hours during the last two weeks, mostly refining relational integrity constraints.',
    },

    // --- Comments on COMP1040 (Review 5 & 6) ---
    {
        id: '20000000-0000-4000-8000-000000000005',
        reviewId: '10000000-0000-4000-8000-000000000005',
        userId: 'dev-user-charlie',
        parentId: null,
        content: 'How was the final exam format? Was it mostly architecture scenarios or system modeling questions?',
    },
    {
        id: '20000000-0000-4000-8000-000000000006',
        reviewId: '10000000-0000-4000-8000-000000000005',
        userId: 'dev-user-bob',
        parentId: '20000000-0000-4000-8000-000000000005',
        content: 'Around 60% evaluating architecture diagrams and quality attribute tactics, and 40% design patterns theory.',
    },
    {
        id: '20000000-0000-4000-8000-000000000007',
        reviewId: '10000000-0000-4000-8000-000000000006',
        userId: 'dev-user-admin',
        parentId: null,
        content: 'Please remember to use the CS Club peer study sessions in Ingkarni Wardli if you need help with system architecture!',
    },

    // --- Comments on COMP2001 (Review 9) ---
    {
        id: '20000000-0000-4000-8000-000000000008',
        reviewId: '10000000-0000-4000-8000-000000000009',
        userId: 'dev-user-alice',
        parentId: null,
        content: 'Can confirm, the interpreter translation project was one of the most rewarding practicals at uni!',
    },
    {
        id: '20000000-0000-4000-8000-000000000009',
        reviewId: '10000000-0000-4000-8000-000000000009',
        userId: 'dev-user-fiona',
        parentId: '20000000-0000-4000-8000-000000000008',
        content: 'Did your team use Rust or Python/Java for the AST parser and runtime execution?',
    },
    {
        id: '20000000-0000-4000-8000-000000000010',
        reviewId: '10000000-0000-4000-8000-000000000009',
        userId: 'dev-user-diana',
        parentId: '20000000-0000-4000-8000-000000000009',
        content: 'We used TypeScript with an AST visitor pattern, which worked smoothly and was easy to test.',
    },

    // --- Comments on ACCT1001 (Review 13) ---
    {
        id: '20000000-0000-4000-8000-000000000011',
        reviewId: '10000000-0000-4000-8000-000000000013',
        userId: 'dev-user-george',
        parentId: null,
        content: 'Is financial accounting useful for software developers working in fintech?',
    },
    {
        id: '20000000-0000-4000-8000-000000000012',
        reviewId: '10000000-0000-4000-8000-000000000013',
        userId: 'dev-user-alice',
        parentId: '20000000-0000-4000-8000-000000000011',
        content: 'Definitely! Understanding general ledger architecture and reconciliation rules is essential for financial software.',
    },

    // --- Comments on COMP4001 (Review 32) ---
    {
        id: '20000000-0000-4000-8000-000000000013',
        reviewId: '10000000-0000-4000-8000-000000000032',
        userId: 'dev-user-bob',
        parentId: null,
        content: 'Does the university provide GPU credits for training the transformer models in practicals?',
    },
    {
        id: '20000000-0000-4000-8000-000000000014',
        reviewId: '10000000-0000-4000-8000-000000000032',
        userId: 'dev-user-alice',
        parentId: '20000000-0000-4000-8000-000000000013',
        content: 'Yes, students are provided access to the Phoenix HPC cluster and Google Colab compute units.',
    },

    // --- Comments on COMP4003 (Review 36) ---
    {
        id: '20000000-0000-4000-8000-000000000015',
        reviewId: '10000000-0000-4000-8000-000000000036',
        userId: 'dev-user-ethan',
        parentId: null,
        content: 'Is familiarity with C++ mandatory or can we implement labs in Rust or Go?',
    },
    {
        id: '20000000-0000-4000-8000-000000000016',
        reviewId: '10000000-0000-4000-8000-000000000036',
        userId: 'dev-user-bob',
        parentId: '20000000-0000-4000-8000-000000000015',
        content: 'The starter skeleton codebase is in modern C++ (C++20), so decent C++ proficiency is strongly recommended.',
    },
];

export const SEED_LIKES = [
    // Likes for COMP1003 reviews
    { userId: 'dev-user-bob', reviewId: '10000000-0000-4000-8000-000000000001' },
    { userId: 'dev-user-charlie', reviewId: '10000000-0000-4000-8000-000000000001' },
    { userId: 'dev-user-diana', reviewId: '10000000-0000-4000-8000-000000000001' },
    { userId: 'dev-user-ethan', reviewId: '10000000-0000-4000-8000-000000000001' },
    { userId: 'dev-user-alice', reviewId: '10000000-0000-4000-8000-000000000002' },
    { userId: 'dev-user-fiona', reviewId: '10000000-0000-4000-8000-000000000002' },
    { userId: 'dev-user-alice', reviewId: '10000000-0000-4000-8000-000000000003' },
    { userId: 'dev-user-bob', reviewId: '10000000-0000-4000-8000-000000000003' },
    { userId: 'dev-user-george', reviewId: '10000000-0000-4000-8000-000000000004' },

    // Likes for COMP1040 reviews
    { userId: 'dev-user-diana', reviewId: '10000000-0000-4000-8000-000000000005' },
    { userId: 'dev-user-ethan', reviewId: '10000000-0000-4000-8000-000000000005' },
    { userId: 'dev-user-fiona', reviewId: '10000000-0000-4000-8000-000000000006' },
    { userId: 'dev-user-alice', reviewId: '10000000-0000-4000-8000-000000000007' },
    { userId: 'dev-user-bob', reviewId: '10000000-0000-4000-8000-000000000007' },
    { userId: 'dev-user-charlie', reviewId: '10000000-0000-4000-8000-000000000007' },

    // Likes for COMP2001 reviews
    { userId: 'dev-user-alice', reviewId: '10000000-0000-4000-8000-000000000009' },
    { userId: 'dev-user-bob', reviewId: '10000000-0000-4000-8000-000000000009' },
    { userId: 'dev-user-ethan', reviewId: '10000000-0000-4000-8000-000000000009' },
    { userId: 'dev-user-admin', reviewId: '10000000-0000-4000-8000-000000000009' },
    { userId: 'dev-user-fiona', reviewId: '10000000-0000-4000-8000-000000000010' },
    { userId: 'dev-user-alice', reviewId: '10000000-0000-4000-8000-000000000011' },

    // Likes for ACCT1001 reviews
    { userId: 'dev-user-bob', reviewId: '10000000-0000-4000-8000-000000000013' },
    { userId: 'dev-user-charlie', reviewId: '10000000-0000-4000-8000-000000000013' },
    { userId: 'dev-user-alice', reviewId: '10000000-0000-4000-8000-000000000014' },
    { userId: 'dev-user-george', reviewId: '10000000-0000-4000-8000-000000000015' },

    // Likes for ACCT1000 reviews
    { userId: 'dev-user-alice', reviewId: '10000000-0000-4000-8000-000000000017' },
    { userId: 'dev-user-charlie', reviewId: '10000000-0000-4000-8000-000000000017' },
    { userId: 'dev-user-diana', reviewId: '10000000-0000-4000-8000-000000000019' },

    // Likes for ACCT1004 reviews
    { userId: 'dev-user-bob', reviewId: '10000000-0000-4000-8000-000000000021' },
    { userId: 'dev-user-fiona', reviewId: '10000000-0000-4000-8000-000000000023' },

    // Likes for COMP1023 reviews
    { userId: 'dev-user-alice', reviewId: '10000000-0000-4000-8000-000000000024' },
    { userId: 'dev-user-diana', reviewId: '10000000-0000-4000-8000-000000000024' },
    { userId: 'dev-user-george', reviewId: '10000000-0000-4000-8000-000000000025' },
    { userId: 'dev-user-bob', reviewId: '10000000-0000-4000-8000-000000000026' },

    // Likes for COMP3001 reviews
    { userId: 'dev-user-alice', reviewId: '10000000-0000-4000-8000-000000000028' },
    { userId: 'dev-user-bob', reviewId: '10000000-0000-4000-8000-000000000028' },
    { userId: 'dev-user-charlie', reviewId: '10000000-0000-4000-8000-000000000028' },
    { userId: 'dev-user-ethan', reviewId: '10000000-0000-4000-8000-000000000029' },

    // Likes for COMP4001 reviews
    { userId: 'dev-user-bob', reviewId: '10000000-0000-4000-8000-000000000032' },
    { userId: 'dev-user-charlie', reviewId: '10000000-0000-4000-8000-000000000032' },
    { userId: 'dev-user-diana', reviewId: '10000000-0000-4000-8000-000000000032' },
    { userId: 'dev-user-george', reviewId: '10000000-0000-4000-8000-000000000032' },
    { userId: 'dev-user-alice', reviewId: '10000000-0000-4000-8000-000000000034' },

    // Likes for COMP4003 reviews
    { userId: 'dev-user-alice', reviewId: '10000000-0000-4000-8000-000000000036' },
    { userId: 'dev-user-diana', reviewId: '10000000-0000-4000-8000-000000000036' },
    { userId: 'dev-user-ethan', reviewId: '10000000-0000-4000-8000-000000000036' },
    { userId: 'dev-user-bob', reviewId: '10000000-0000-4000-8000-000000000038' },
];

export const SEED_COURSE_UPDATE_VOTES = [
    // --- 1. COMP1003: Consensus updated to Semester 1, 2025 (3 confirm, 1 dispute) ---
    {
        id: '30000000-0000-4000-8000-000000000001',
        userId: 'dev-user-alice',
        courseCode: 'COMP1003',
        suggestedTerm: 'Semester 1, 2025',
    },
    {
        id: '30000000-0000-4000-8000-000000000002',
        userId: 'dev-user-bob',
        courseCode: 'COMP1003',
        suggestedTerm: 'Semester 1, 2025',
    },
    {
        id: '30000000-0000-4000-8000-000000000003',
        userId: 'dev-user-charlie',
        courseCode: 'COMP1003',
        suggestedTerm: 'Semester 1, 2025',
    },
    {
        id: '30000000-0000-4000-8000-000000000004',
        userId: 'dev-user-diana',
        courseCode: 'COMP1003',
        suggestedTerm: 'Semester 2, 2024',
    },

    // --- 2. COMP1040: Consensus updated to Semester 2, 2025 (3 confirm, 1 dispute) ---
    {
        id: '30000000-0000-4000-8000-000000000005',
        userId: 'dev-user-bob',
        courseCode: 'COMP1040',
        suggestedTerm: 'Semester 2, 2025',
    },
    {
        id: '30000000-0000-4000-8000-000000000006',
        userId: 'dev-user-ethan',
        courseCode: 'COMP1040',
        suggestedTerm: 'Semester 2, 2025',
    },
    {
        id: '30000000-0000-4000-8000-000000000007',
        userId: 'dev-user-fiona',
        courseCode: 'COMP1040',
        suggestedTerm: 'Semester 2, 2025',
    },
    {
        id: '30000000-0000-4000-8000-000000000008',
        userId: 'dev-user-charlie',
        courseCode: 'COMP1040',
        suggestedTerm: 'Semester 1, 2025',
    },

    // --- 3. COMP2001: Consensus updated to Semester 2, 2025 (4 confirm) ---
    {
        id: '30000000-0000-4000-8000-000000000009',
        userId: 'dev-user-diana',
        courseCode: 'COMP2001',
        suggestedTerm: 'Semester 2, 2025',
    },
    {
        id: '30000000-0000-4000-8000-000000000010',
        userId: 'dev-user-charlie',
        courseCode: 'COMP2001',
        suggestedTerm: 'Semester 2, 2025',
    },
    {
        id: '30000000-0000-4000-8000-000000000011',
        userId: 'dev-user-george',
        courseCode: 'COMP2001',
        suggestedTerm: 'Semester 2, 2025',
    },
    {
        id: '30000000-0000-4000-8000-000000000012',
        userId: 'dev-user-alice',
        courseCode: 'COMP2001',
        suggestedTerm: 'Semester 2, 2025',
    },

    // --- 4. ACCT1001: Consensus updated to Semester 2, 2024 (3 confirm, 1 dispute) ---
    {
        id: '30000000-0000-4000-8000-000000000013',
        userId: 'dev-user-alice',
        courseCode: 'ACCT1001',
        suggestedTerm: 'Semester 2, 2024',
    },
    {
        id: '30000000-0000-4000-8000-000000000014',
        userId: 'dev-user-bob',
        courseCode: 'ACCT1001',
        suggestedTerm: 'Semester 2, 2024',
    },
    {
        id: '30000000-0000-4000-8000-000000000015',
        userId: 'dev-user-fiona',
        courseCode: 'ACCT1001',
        suggestedTerm: 'Semester 2, 2024',
    },
    {
        id: '30000000-0000-4000-8000-000000000016',
        userId: 'dev-user-ethan',
        courseCode: 'ACCT1001',
        suggestedTerm: 'Semester 1, 2025',
    },

    // --- 5. ACCT1000: Consensus updated to Semester 1, 2025 (3 confirm) ---
    {
        id: '30000000-0000-4000-8000-000000000017',
        userId: 'dev-user-bob',
        courseCode: 'ACCT1000',
        suggestedTerm: 'Semester 1, 2025',
    },
    {
        id: '30000000-0000-4000-8000-000000000018',
        userId: 'dev-user-george',
        courseCode: 'ACCT1000',
        suggestedTerm: 'Semester 1, 2025',
    },
    {
        id: '30000000-0000-4000-8000-000000000019',
        userId: 'dev-user-alice',
        courseCode: 'ACCT1000',
        suggestedTerm: 'Semester 1, 2025',
    },

    // --- 6. ACCT1004: Consensus updated to Semester 2, 2025 (3 confirm) ---
    {
        id: '30000000-0000-4000-8000-000000000020',
        userId: 'dev-user-ethan',
        courseCode: 'ACCT1004',
        suggestedTerm: 'Semester 2, 2025',
    },
    {
        id: '30000000-0000-4000-8000-000000000021',
        userId: 'dev-user-fiona',
        courseCode: 'ACCT1004',
        suggestedTerm: 'Semester 2, 2025',
    },
    {
        id: '30000000-0000-4000-8000-000000000022',
        userId: 'dev-user-george',
        courseCode: 'ACCT1004',
        suggestedTerm: 'Semester 2, 2025',
    },

    // --- 7. COMP1023: Consensus updated to Semester 1, 2025 (3 confirm) ---
    {
        id: '30000000-0000-4000-8000-000000000023',
        userId: 'dev-user-charlie',
        courseCode: 'COMP1023',
        suggestedTerm: 'Semester 1, 2025',
    },
    {
        id: '30000000-0000-4000-8000-000000000024',
        userId: 'dev-user-bob',
        courseCode: 'COMP1023',
        suggestedTerm: 'Semester 1, 2025',
    },
    {
        id: '30000000-0000-4000-8000-000000000025',
        userId: 'dev-user-ethan',
        courseCode: 'COMP1023',
        suggestedTerm: 'Semester 1, 2025',
    },

    // --- 8. COMP3001: Consensus updated to Semester 2, 2024 (3 confirm, 1 dispute) ---
    {
        id: '30000000-0000-4000-8000-000000000026',
        userId: 'dev-user-diana',
        courseCode: 'COMP3001',
        suggestedTerm: 'Semester 2, 2024',
    },
    {
        id: '30000000-0000-4000-8000-000000000027',
        userId: 'dev-user-alice',
        courseCode: 'COMP3001',
        suggestedTerm: 'Semester 2, 2024',
    },
    {
        id: '30000000-0000-4000-8000-000000000028',
        userId: 'dev-user-george',
        courseCode: 'COMP3001',
        suggestedTerm: 'Semester 2, 2024',
    },
    {
        id: '30000000-0000-4000-8000-000000000029',
        userId: 'dev-user-bob',
        courseCode: 'COMP3001',
        suggestedTerm: 'Semester 1, 2025',
    },

    // --- 9. COMP4001: Consensus updated to Semester 1, 2025 (3 confirm) ---
    {
        id: '30000000-0000-4000-8000-000000000030',
        userId: 'dev-user-alice',
        courseCode: 'COMP4001',
        suggestedTerm: 'Semester 1, 2025',
    },
    {
        id: '30000000-0000-4000-8000-000000000031',
        userId: 'dev-user-ethan',
        courseCode: 'COMP4001',
        suggestedTerm: 'Semester 1, 2025',
    },
    {
        id: '30000000-0000-4000-8000-000000000032',
        userId: 'dev-user-diana',
        courseCode: 'COMP4001',
        suggestedTerm: 'Semester 1, 2025',
    },

    // --- 10. COMP4003: Consensus updated to Semester 2, 2025 (3 confirm, 1 dispute) ---
    {
        id: '30000000-0000-4000-8000-000000000033',
        userId: 'dev-user-bob',
        courseCode: 'COMP4003',
        suggestedTerm: 'Semester 2, 2025',
    },
    {
        id: '30000000-0000-4000-8000-000000000034',
        userId: 'dev-user-fiona',
        courseCode: 'COMP4003',
        suggestedTerm: 'Semester 2, 2025',
    },
    {
        id: '30000000-0000-4000-8000-000000000035',
        userId: 'dev-user-george',
        courseCode: 'COMP4003',
        suggestedTerm: 'Semester 2, 2025',
    },
    {
        id: '30000000-0000-4000-8000-000000000036',
        userId: 'dev-user-ethan',
        courseCode: 'COMP4003',
        suggestedTerm: 'Semester 1, 2024',
    },
];

export interface SeedOptions {
    reset?: boolean;
    databaseUrl?: string;
    silent?: boolean;
}

export async function seedDatabase(options: SeedOptions = {}) {
    const databaseUrl =
        options.databaseUrl ||
        process.env.DATABASE_URL ||
        'postgresql://postgres:postgres@localhost:5432/mycoursereviews';

    const log = (...args: any[]) => {
        if (!options.silent) {
            console.log(...args);
        }
    };

    const sqlClient = postgres(databaseUrl, { max: 1 });
    const drizzleDb = drizzle(sqlClient, { schema });

    try {
        log('Connecting to database for seeding...');

        if (options.reset) {
            log('Reset flag specified: cleaning existing seed records...');
            // Delete child tables first to respect foreign keys
            await drizzleDb
                .delete(courseUpdateVotes)
                .where(
                    inArray(
                        courseUpdateVotes.id,
                        SEED_COURSE_UPDATE_VOTES.map((v) => v.id)
                    )
                );

            await drizzleDb
                .delete(likes)
                .where(
                    inArray(
                        likes.reviewId,
                        SEED_REVIEWS.map((r) => r.id)
                    )
                );

            await drizzleDb
                .delete(comments)
                .where(
                    inArray(
                        comments.id,
                        SEED_COMMENTS.map((c) => c.id)
                    )
                );

            await drizzleDb
                .delete(reviews)
                .where(
                    inArray(
                        reviews.id,
                        SEED_REVIEWS.map((r) => r.id)
                    )
                );

            await drizzleDb
                .delete(users)
                .where(
                    inArray(
                        users.id,
                        SEED_USERS.map((u) => u.id)
                    )
                );
            log('✨ Cleaned existing seed data.');
        }

        // 1. Upsert Users
        log(`Upserting ${SEED_USERS.length} mock users...`);
        for (const user of SEED_USERS) {
            await drizzleDb
                .insert(users)
                .values(user)
                .onConflictDoUpdate({
                    target: users.id,
                    set: {
                        name: user.name,
                        role: user.role,
                    },
                });
        }

        // 2. Upsert Reviews
        log(`Upserting ${SEED_REVIEWS.length} example reviews across 10 courses (3-5 reviews each)...`);
        for (const review of SEED_REVIEWS) {
            await drizzleDb
                .insert(reviews)
                .values(review)
                .onConflictDoUpdate({
                    target: reviews.id,
                    set: {
                        courseCode: review.courseCode,
                        title: review.title,
                        description: review.description,
                        overallRating: review.overallRating,
                        difficultyScore: review.difficultyScore,
                        usefulnessScore: review.usefulnessScore,
                        enjoymentScore: review.enjoymentScore,
                        termTaken: review.termTaken,
                        grade: review.grade,
                        isAnonymous: review.isAnonymous,
                    },
                });
        }

        // 3. Upsert Comments (parents first, then replies)
        log(`Upserting ${SEED_COMMENTS.length} discussion comments...`);
        // Split top-level and replies to guarantee foreign key parent satisfaction
        const topLevelComments = SEED_COMMENTS.filter((c) => !c.parentId);
        const replyComments = SEED_COMMENTS.filter((c) => Boolean(c.parentId));

        for (const comment of topLevelComments) {
            await drizzleDb
                .insert(comments)
                .values(comment)
                .onConflictDoUpdate({
                    target: comments.id,
                    set: {
                        content: comment.content,
                    },
                });
        }

        for (const comment of replyComments) {
            await drizzleDb
                .insert(comments)
                .values(comment)
                .onConflictDoUpdate({
                    target: comments.id,
                    set: {
                        content: comment.content,
                    },
                });
        }

        // 4. Upsert Likes
        log(`Upserting ${SEED_LIKES.length} review likes...`);
        for (const like of SEED_LIKES) {
            await drizzleDb
                .insert(likes)
                .values(like)
                .onConflictDoNothing();
        }

        // 5. Upsert Course Update Votes
        log(`Upserting ${SEED_COURSE_UPDATE_VOTES.length} course update consensus votes across 10 courses...`);
        for (const vote of SEED_COURSE_UPDATE_VOTES) {
            await drizzleDb
                .insert(courseUpdateVotes)
                .values(vote)
                .onConflictDoUpdate({
                    target: courseUpdateVotes.id,
                    set: {
                        courseCode: vote.courseCode,
                        suggestedTerm: vote.suggestedTerm,
                    },
                });
        }

        log('Database seeding completed successfully!');
        return {
            usersCount: SEED_USERS.length,
            reviewsCount: SEED_REVIEWS.length,
            commentsCount: SEED_COMMENTS.length,
            likesCount: SEED_LIKES.length,
            votesCount: SEED_COURSE_UPDATE_VOTES.length,
        };
    } finally {
        await sqlClient.end();
    }
}

// Run directly when invoked via CLI
if (import.meta.url === `file://${process.argv[1]}`) {
    const args = process.argv.slice(2);
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
Usage: pnpm run db:seed [options]

Options:
  --reset, --clean    Remove previously seeded records before inserting
  --help, -h          Show this help message
`);
        process.exit(0);
    }

    const reset = args.includes('--reset') || args.includes('--clean');
    seedDatabase({ reset })
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('Error during database seeding:', error);
            process.exit(1);
        });
}
