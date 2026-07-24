import { describe, it, mock } from 'node:test';
import assert from 'node:assert';
import { render, screen } from '@testing-library/react';
import { CourseData } from '@/lib/courses-db';

// Mock @heroui/react before importing the component using modern Node 26 exports API
mock.module('@heroui/react', {
    exports: {
        Button: ({ children, as: Component = 'button', href, ...props }: any) => (
            <Component href={href} {...props}>
                {children}
            </Component>
        ),
        Chip: ({ children, className, ...props }: any) => (
            <div data-testid="mock-chip" className={className} {...props}>
                {children}
            </div>
        ),
    }
});

// Dynamically import component after registering mocks
const { CourseHeaderSection } = await import('../../course/CourseHeaderSection');

const mockCourse: CourseData = {
    code: 'COMP SCI 1102',
    name: 'Object Oriented Programming',
    description: 'OOP details...',
    terms: ['Semester 1', 'Semester 2'],
    officialLink: 'https://example.com/outline',
    coordinator: 'Dr. John Doe',
    campus: 'North Terrace',
    units: 3,
    levelOfStudy: 'Undergraduate',
    universityWideElective: true,
};

describe('CourseHeaderSection Component', () => {
    it('renders basic course info successfully', () => {
        render(<CourseHeaderSection course={mockCourse} />);

        assert.ok(screen.getByText('COMP SCI 1102'));
        assert.ok(screen.getByText('Object Oriented Programming'));
        assert.ok(screen.getByText('Semester 1'));
        assert.ok(screen.getByText('Semester 2'));
    });

    it('renders full metadata pills successfully', () => {
        render(<CourseHeaderSection course={mockCourse} />);

        assert.ok(screen.getByText(/COORDINATOR: Dr. John Doe/i));
        assert.ok(screen.getByText(/CAMPUS: North Terrace/i));
        assert.ok(screen.getByText(/UNITS: 3/i));
        assert.ok(screen.getByText(/LEVEL: Undergraduate/i));
        assert.ok(screen.getByText(/ELECTIVE: YES/i));
    });

    it('renders no longer offered warnings when appropriate', () => {
        const inactiveCourse = {
            ...mockCourse,
            terms: ['No Longer Offered'],
            isNoLongerOffered: true,
        };
        render(<CourseHeaderSection course={inactiveCourse} />);

        assert.ok(screen.getByText('Course No Longer Offered'));
        assert.ok(screen.getByText(/This course is no longer offered by Adelaide University/i));
    });
});
