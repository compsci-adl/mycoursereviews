import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { render, screen } from '@testing-library/react';

import { CourseOverviewSection } from '@/components/course/CourseOverviewSection';
import { CourseData } from '@/lib/courses-types';

describe('CourseOverviewSection Component', () => {
    const mockCourse: CourseData = {
        code: 'ACCT1000',
        name: 'Accounting for Decision Makers',
        description: 'The objective of the course is to provide an introductory knowledge of accounting.',
        terms: ['Semester 1', 'Semester 2'],
        officialLink: '#',
        prerequisites: 'Must have completed COMP1003 Structured Data',
        corequisites: null,
        antirequisites: 'N/A',
        assessments: [
            { title: 'Financial Statement Preparation and Analysis', weighting: '20%', hurdle: '', learningOutcomes: '1,2,3' },
            { title: 'In- Class Tests', weighting: '40%', hurdle: '', learningOutcomes: '1,2,4' },
            { title: 'Final Exam', weighting: '40%', hurdle: '40%', learningOutcomes: '1,2,4' },
        ],
        learningOutcomes: [
            { description: 'Apply accounting principles and concepts in order to interpret accounting information', outcomeIndex: 1 },
            { description: 'Analyse accounting information from a management and user perspective', outcomeIndex: 2 },
            { description: 'Communicate financial and non-financial information to management to assist in business decision making', outcomeIndex: 3 },
            { description: 'Apply management accounting techniques to assess performance, prepare budgets and assist in decision making', outcomeIndex: 4 },
        ],
        textbooks: 'Recommended Textbook: Modern Accounting (3rd Edition)',
    };

    it('renders overview, requirements, assessments, and learning outcomes in neo-brutalist style', () => {
        render(<CourseOverviewSection course={mockCourse} />);

        // Overview
        assert.ok(screen.getByText('Course Overview'));
        assert.ok(screen.getByText(/The objective of the course is to provide an introductory knowledge/i));

        // Requirements
        assert.ok(screen.getByText('Requirements'));
        assert.ok(screen.getByText('Prerequisites'));
        assert.ok(screen.getByText('Must have completed COMP1003 Structured Data'));
        assert.ok(screen.getByText('Corequisites'));
        assert.ok(screen.getByText('Antirequisites'));

        // Learning Outcomes
        assert.ok(screen.getAllByText('Learning Outcomes').length >= 1);
        assert.ok(screen.getByText(/Apply accounting principles and concepts in order to interpret accounting information/i));
        assert.ok(screen.getByText(/Analyse accounting information from a management and user perspective/i));
        assert.ok(screen.getByText(/Communicate financial and non-financial information to management to assist in business decision making/i));
        assert.ok(screen.getByText(/Apply management accounting techniques to assess performance, prepare budgets and assist in decision making/i));

        // Assessments
        assert.ok(screen.getByText('Assessments'));
        assert.ok(screen.getByText('Hurdle'));
        assert.ok(screen.getByText('Financial Statement Preparation and Analysis'));
        assert.ok(screen.getByText('20%'));
        assert.ok(screen.getByText('In- Class Tests'));
        assert.ok(screen.getByText('Final Exam'));
        assert.ok(screen.getByText('1,2,3'));
        assert.ok(screen.getAllByText('40%').length >= 2);

        // Textbooks & Resources
        assert.ok(screen.getByText('Textbooks & Resources'));
        assert.ok(screen.getByText('Recommended Textbook: Modern Accounting (3rd Edition)'));
    });

    it('renders hurdle column with threshold for COMP1003 (da96a257ded4)', () => {
        const comp1003: CourseData = {
            code: 'COMP1003',
            name: 'Structured Data',
            description: 'The course will equip students with the knowledge and skills required to implement and work with structured data.',
            terms: ['Semester 1', 'Semester 2'],
            officialLink: '#',
            apiId: 'da96a257ded4',
            learningOutcomes: [
                { description: 'Explain how data is stored and retrieved', outcomeIndex: 1 },
                { description: 'Design a relational database', outcomeIndex: 2 },
            ],
            assessments: [
                { title: 'Concept Design', weighting: '30%', hurdle: '', learningOutcomes: '2,3,4' },
                { title: 'In Class Work', weighting: '20%', hurdle: '', learningOutcomes: '1,2,3,4,5,6' },
                { title: 'Practical Exam', weighting: '50%', hurdle: 'Threshold (50% Required)', learningOutcomes: '3,4,5,6' },
            ],
        };

        render(<CourseOverviewSection course={comp1003} />);

        // Hurdle column header exists
        assert.ok(screen.getByText('Hurdle'));
        // Hurdle value badge for Practical Exam exists
        assert.ok(screen.getByText('Threshold (50% Required)'));
        // Empty hurdles render em dashes
        assert.ok(screen.getAllByText('—').length >= 2);
    });
});
