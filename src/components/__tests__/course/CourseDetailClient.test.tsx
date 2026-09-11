import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// Register mocks before dynamic imports using modern Node 26 exports API
mock.module('next-auth/react', {
    exports: {
        useSession: mock.fn(),
        signIn: mock.fn(),
    }
});

mock.module('@/app/actions/reviews', {
    exports: {
        addComment: mock.fn(),
        toggleLike: mock.fn(),
        deleteReview: mock.fn(),
        deleteComment: mock.fn(),
        updateComment: mock.fn(),
        updateReview: mock.fn(),
    }
});

mock.module('@/app/actions/courseUpdates', {
    exports: {
        voteOnCourseUpdate: mock.fn(),
    }
});

mock.module('@/lib/course-update-voting', {
    exports: {
        UPDATE_TERM_OPTIONS: ['Semester 1, 2026', 'Semester 2, 2026'],
        DEFAULT_LAST_UPDATE: 'Semester 1, 2026',
    }
});

mock.module('@heroui/react', {
    exports: {
        Button: ({ children, onClick, onPress, className, as: Component = 'button', isLoading, startContent, radius, size, variant, isIconOnly, color, isDisabled, ...props }: any) => (
            React.createElement(Component, {
                onClick: onClick || onPress,
                className,
                disabled: isDisabled || isLoading,
                ...props
            }, children)
        ),
        Chip: ({ children, className, radius, size, variant, color, startContent, endContent, ...props }: any) => (
            React.createElement('div', { 'data-testid': 'mock-chip', className, ...props }, children)
        ),
        Card: ({ children, className, radius, shadow, isPressable, onPress, ...props }: any) => (
            React.createElement('div', { 'data-testid': 'mock-card', className, ...props }, children)
        ),
        CardBody: ({ children, className, ...props }: any) => (
            React.createElement('div', { 'data-testid': 'mock-card-body', className, ...props }, children)
        ),
        Textarea: ({ value, onValueChange, placeholder, className, radius, minRows, classNames, size, isInvalid, errorMessage, onChange, ...props }: any) => (
            React.createElement('textarea', {
                value,
                onChange: onChange || ((e: any) => onValueChange && onValueChange(e.target.value)),
                placeholder,
                className,
                ...props
            })
        ),
        Input: ({ id, value, onValueChange, placeholder, isInvalid, errorMessage, classNames, radius, ...props }: any) => (
            React.createElement('input', {
                id,
                type: 'text',
                value,
                onChange: (e: any) => onValueChange && onValueChange(e.target.value),
                placeholder,
                ...props
            })
        ),
        Modal: ({ children, isOpen }: any) => isOpen ? React.createElement('div', { 'data-testid': 'mock-modal' }, children) : null,
        ModalContent: ({ children }: any) => {
            return React.createElement('div', { 'data-testid': 'mock-modal-content' }, typeof children === 'function' ? children(() => {}) : children);
        },
        ModalHeader: ({ children, ...props }: any) => React.createElement('div', props, children),
        ModalBody: ({ children, ...props }: any) => React.createElement('div', props, children),
        ModalFooter: ({ children, ...props }: any) => React.createElement('div', props, children),
        Select: ({ children, label, value, onChange, selectedKeys, onSelectionChange, classNames, popoverProps, listboxProps, radius, errorMessage, isInvalid, size, placeholder, ...props }: any) => {
            const val = selectedKeys ? Array.from(selectedKeys)[0] : value;
            const handleChange = (e: any) => {
                if (onChange) onChange(e);
                if (onSelectionChange) onSelectionChange(new Set([e.target.value]));
            };
            return React.createElement('div', { 'data-testid': 'mock-select', ...props },
                React.createElement('label', null, label),
                React.createElement('select', { 'aria-label': label, value: val || '', onChange: handleChange },
                    React.Children.map(children, (child: any) => {
                        if (!child) return null;
                        const childKey = child.key || child.props?.value || child.props?.textValue;
                        return React.createElement('option', { key: childKey, value: childKey }, child.props?.children || child.props?.textValue);
                    })
                )
            );
        },
        SelectItem: ({ children, value, textValue, className, ...props }: any) => (
            React.createElement('option', { value, ...props }, children)
        ),
        Checkbox: ({ children, isSelected, onValueChange, className, size, radius, ...props }: any) => (
            React.createElement('label', null,
                React.createElement('input', {
                    type: 'checkbox',
                    checked: isSelected,
                    onChange: (e: any) => onValueChange && onValueChange(e.target.checked),
                    ...props
                }),
                children
            )
        ),
        Slider: ({ label, value, onChange, size, radius, step, maxValue, minValue, classNames, className, ...props }: any) => (
            React.createElement('label', null,
                React.createElement('span', null, label),
                React.createElement('input', {
                    type: 'range',
                    value,
                    min: minValue,
                    max: maxValue,
                    step,
                    onChange: (e: any) => onChange && onChange(Number(e.target.value)),
                    ...props
                })
            )
        ),
        useDisclosure: () => {
            const [isOpen, setIsOpen] = React.useState(false);
            return {
                isOpen,
                onOpen: () => setIsOpen(true),
                onClose: () => setIsOpen(false),
                onOpenChange: (val?: boolean) => setIsOpen((prev: boolean) => val !== undefined ? val : !prev),
            };
        },
    }
});

mock.module('../../course/ReviewModal', {
    exports: {
        ReviewModal: () => React.createElement('div', { 'data-testid': 'mock-review-modal' }),
    }
});

// Import dynamically after mocks are loaded
const { useSession, signIn } = await import('next-auth/react');
const { addComment, toggleLike, deleteReview, deleteComment, updateComment, updateReview } = await import('@/app/actions/reviews');
const { voteOnCourseUpdate } = await import('@/app/actions/courseUpdates');
const { CourseDetailClient } = await import('../../course/CourseDetailClient');

const mockCourse = {
    code: 'COMP SCI 1102',
    name: 'Intro to Programming',
    description: 'Learn programming fundamentals.',
    terms: ['Semester 1', 'Semester 2'],
    officialLink: 'https://example.com',
    prerequisites: 'COMP SCI 1101',
    corequisites: 'MATHS 1011',
    antirequisites: 'COMP SCI 1103',
    assessments: [
        { title: 'Exam', weighting: '50%', hurdle: 'Yes' },
        { title: 'Project', weighting: '50%', hurdle: '' },
    ],
    learningOutcomes: [
        { outcomeIndex: 1, description: 'Write basic programs' },
    ],
    textbooks: 'Programming in Python 3',
};

const mockStats = {
    avgOverall: 4.5,
    avgDifficulty: 2.5,
    avgUsefulness: 4.8,
    avgEnjoyment: 4.2,
    totalReviews: 1,
};

const mockUpdateVoteData = {
    consensusTerm: 'Semester 1, 2026',
    confirmCount: 0,
    disputeCount: 0,
    currentUserVote: null,
    totalVotes: 0,
};

const mockReviews = [
    {
        id: 'rev-1',
        userId: 'usr-1',
        title: 'Great Introductory Course',
        description: 'Loved learning python and building projects.',
        overallRating: 5,
        difficultyScore: 2,
        usefulnessScore: 5,
        enjoymentScore: 5,
        termTaken: 'Semester 1, 2026',
        grade: 'HD',
        isAnonymous: false,
        reviewerName: 'John Student',
        createdAt: new Date('2026-05-24T12:00:00Z'),
        likesCount: 2,
        likedByCurrentUser: false,
        comments: [],
    },
];

describe('CourseDetailClient Component', () => {
    beforeEach(() => {
        (toggleLike as any).mock.mockImplementation(async () => {});
        (deleteReview as any).mock.mockImplementation(async () => {});
        (addComment as any).mock.mockImplementation(async () => {});
        (updateComment as any).mock.mockImplementation(async () => {});
        (deleteComment as any).mock.mockImplementation(async () => {});
        (updateReview as any).mock.mockImplementation(async () => {});
        (voteOnCourseUpdate as any).mock.mockImplementation(async () => ({ success: true, voteData: mockUpdateVoteData }));
        
        // Mock confirm
        window.confirm = mock.fn(() => true);
        global.confirm = window.confirm as any;
    });

    it('renders the course headers, statistics and enriched adelaide metadata successfully', () => {
        (useSession as any).mock.mockImplementation(() => ({ data: null, status: 'unauthenticated' }));

        render(
            <CourseDetailClient
                course={mockCourse}
                reviews={mockReviews}
                stats={mockStats}
                updateVoteData={mockUpdateVoteData}
            />
        );

        // Course info renders
        assert.ok(screen.getByText(/COMP SCI 1102/i));
        assert.ok(screen.getByText(/Intro to Programming/i));
        assert.ok(screen.getByText(/Learn programming fundamentals/i));

        // Enriched metadata blocks render
        assert.ok(screen.getByText('Prerequisites'));
        assert.ok(screen.getByText('COMP SCI 1101'));
        assert.ok(screen.getByText('Corequisites'));
        assert.ok(screen.getByText('MATHS 1011'));
        assert.ok(screen.getByText('Antirequisites'));
        assert.ok(screen.getByText('COMP SCI 1103'));
        assert.ok(screen.getByText('Exam'));
        assert.ok(screen.getByText('Project'));
        assert.ok(screen.getByText('Learning Outcomes'));
        assert.ok(screen.getByText('Write basic programs'));
        assert.ok(screen.getByText('Textbooks & Resources'));
        assert.ok(screen.getByText('Programming in Python 3'));
        
        // Write Review button renders
        assert.ok(screen.getByRole('button', { name: /Write Review/i }));
    });

    it('renders placeholder string when description is missing', () => {
        (useSession as any).mock.mockImplementation(() => ({ data: null, status: 'unauthenticated' }));
        render(
            <CourseDetailClient
                course={{ ...mockCourse, description: '' }}
                reviews={[]}
                stats={mockStats}
                updateVoteData={mockUpdateVoteData}
            />
        );
        assert.ok(screen.getByText(/No overview available/i));
        assert.ok(screen.getByText(/No reviews yet/i));
    });

    it('opens the AuthRequired warning modal with review prompt when an unauthenticated user clicks Write Review', async () => {
        (useSession as any).mock.mockImplementation(() => ({ data: null, status: 'unauthenticated' }));

        render(
            <CourseDetailClient
                course={mockCourse}
                reviews={mockReviews}
                stats={mockStats}
                updateVoteData={mockUpdateVoteData}
            />
        );

        const writeButton = screen.getByRole('button', { name: /Write Review/i });
        fireEvent.click(writeButton);

        // Warning modal text should be visible with review-specific copy
        assert.ok(screen.getByText('Authentication Required'));
        assert.ok(screen.getByText(/You need to be logged into your/i));
        assert.ok(screen.getByText(/to write a review/i));
        assert.ok(screen.getByText(/Posting anonymously is fully supported/i));

        // Clicking the sign in option triggers NextAuth OIDC flow
        const loginBtn = screen.getByRole('button', { name: /Log In with CS Club account/i });
        fireEvent.click(loginBtn);
        assert.strictEqual((signIn as any).mock.callCount(), 1);
        assert.strictEqual((signIn as any).mock.calls[0].arguments[0], 'keycloak');
    });

    it('opens the AuthRequired modal with community interactions message when unauthenticated user votes on Last Major Update', async () => {
        (useSession as any).mock.mockImplementation(() => ({ data: null, status: 'unauthenticated' }));

        render(
            <CourseDetailClient
                course={mockCourse}
                reviews={mockReviews}
                stats={mockStats}
                updateVoteData={mockUpdateVoteData}
            />
        );

        // Click Correct button in LastMajorUpdateSection
        const correctBtn = screen.getByRole('button', { name: /Correct/i });
        fireEvent.click(correctBtn);

        // Auth modal should open with community interactions copy
        assert.ok(screen.getByText('Authentication Required'));
        assert.ok(screen.getByText(/participate in community interactions/i));
        assert.ok(screen.getByText(/Community interactions require you to be logged in/i));
    });

    it('opens the AuthRequired modal with community interactions message when unauthenticated user disputes Last Major Update', async () => {
        (useSession as any).mock.mockImplementation(() => ({ data: null, status: 'unauthenticated' }));

        render(
            <CourseDetailClient
                course={mockCourse}
                reviews={mockReviews}
                stats={mockStats}
                updateVoteData={mockUpdateVoteData}
            />
        );

        // Click Outdated button in LastMajorUpdateSection
        const outdatedBtn = screen.getByRole('button', { name: /Outdated/i });
        fireEvent.click(outdatedBtn);

        // Auth modal should open with community interactions copy
        assert.ok(screen.getByText('Authentication Required'));
        assert.ok(screen.getByText(/participate in community interactions/i));
        assert.ok(screen.getByText(/Community interactions require you to be logged in/i));
    });

    it('opens the AuthRequired modal with community interactions message when unauthenticated user likes a review', async () => {
        (useSession as any).mock.mockImplementation(() => ({ data: null, status: 'unauthenticated' }));

        render(
            <CourseDetailClient
                course={mockCourse}
                reviews={mockReviews}
                stats={mockStats}
                updateVoteData={mockUpdateVoteData}
            />
        );

        // Click like button on review card
        const likeBtn = screen.getByRole('button', { name: /Like/i });
        fireEvent.click(likeBtn);

        // Auth modal should open with community interactions copy
        assert.ok(screen.getByText('Authentication Required'));
        assert.ok(screen.getByText(/participate in community interactions/i));
        assert.ok(screen.getByText(/Community interactions require you to be logged in/i));
    });

    it('opens the review submission modal directly if user is logged in', () => {
        (useSession as any).mock.mockImplementation(() => ({
            data: { user: { id: 'usr-1', name: 'John Student', email: 'john@student.adelaide.edu.au', role: 'user' } },
            status: 'authenticated',
        }));

        render(
            <CourseDetailClient
                course={mockCourse}
                reviews={mockReviews}
                stats={mockStats}
                updateVoteData={mockUpdateVoteData}
            />
        );

        const writeButton = screen.getByRole('button', { name: /Write Review/i });
        fireEvent.click(writeButton);

        // Should NOT show warning modal
        assert.strictEqual(screen.queryByText('Authentication Required'), null);

        // Review modal mock should be rendered
        assert.ok(screen.getByTestId('mock-review-modal'));
    });

    it('allows sorting reviews feed', () => {
        (useSession as any).mock.mockImplementation(() => ({ data: null, status: 'unauthenticated' }));
        render(
            <CourseDetailClient
                course={mockCourse}
                reviews={mockReviews}
                stats={mockStats}
                updateVoteData={mockUpdateVoteData}
            />
        );

        const selectEl = screen.getByRole('combobox', { name: 'Sort Feed' }) as HTMLSelectElement;
        fireEvent.change(selectEl, { target: { value: 'rating-desc' } });
        assert.strictEqual(selectEl.value, 'rating-desc');

        fireEvent.change(selectEl, { target: { value: 'rating-asc' } });
        assert.strictEqual(selectEl.value, 'rating-asc');
    });

    it('handles review actions when authenticated', async () => {
        (useSession as any).mock.mockImplementation(() => ({
            data: { user: { id: 'usr-1', name: 'John Student', role: 'user' } },
            status: 'authenticated',
        }));

        render(
            <CourseDetailClient
                course={mockCourse}
                reviews={mockReviews}
                stats={mockStats}
                updateVoteData={mockUpdateVoteData}
            />
        );

        // Like review callback triggered on card
        const likeBtn = screen.getByRole('button', { name: /Like/i });
        fireEvent.click(likeBtn);
        await waitFor(() => {
            assert.strictEqual((toggleLike as any).mock.callCount(), 1);
            assert.strictEqual((toggleLike as any).mock.calls[0].arguments[0], 'rev-1');
        });

        // Delete review callback triggered on card
        const deleteBtn = screen.getByRole('button', { name: /Delete/i });
        fireEvent.click(deleteBtn);
        await waitFor(() => {
            assert.strictEqual((deleteReview as any).mock.callCount(), 1);
            assert.strictEqual((deleteReview as any).mock.calls[0].arguments[0], 'rev-1');
        });
    });

    it('handles comment submission when authenticated', async () => {
        (useSession as any).mock.mockImplementation(() => ({
            data: { user: { id: 'usr-1', name: 'John Student', role: 'user' } },
            status: 'authenticated',
        }));

        render(
            <CourseDetailClient
                course={mockCourse}
                reviews={mockReviews}
                stats={mockStats}
                updateVoteData={mockUpdateVoteData}
            />
        );

        // Click Comments button to expand
        const commentBtn = screen.getByRole('button', { name: /Comments/i });
        fireEvent.click(commentBtn);

        // Write a root comment
        const commentTextarea = screen.getByPlaceholderText('Write a comment...');
        fireEvent.change(commentTextarea, { target: { value: 'This is my integration comment' } });

        const submitBtn = screen.getByRole('button', { name: 'Add a Comment' });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            assert.strictEqual((addComment as any).mock.callCount(), 1);
            assert.strictEqual((addComment as any).mock.calls[0].arguments[0], 'rev-1');
            assert.strictEqual((addComment as any).mock.calls[0].arguments[1], 'This is my integration comment');
            assert.strictEqual((addComment as any).mock.calls[0].arguments[2], undefined);
        });
    });

    it('handles consensus update voting triggers', async () => {
        (useSession as any).mock.mockImplementation(() => ({
            data: { user: { id: 'usr-1', name: 'John Student', role: 'user' } },
            status: 'authenticated',
        }));

        render(
            <CourseDetailClient
                course={mockCourse}
                reviews={mockReviews}
                stats={mockStats}
                updateVoteData={mockUpdateVoteData}
            />
        );

        const correctBtn = screen.getByRole('button', { name: /Correct/i });
        fireEvent.click(correctBtn);

        await waitFor(() => {
            assert.strictEqual((voteOnCourseUpdate as any).mock.callCount(), 1);
            assert.strictEqual((voteOnCourseUpdate as any).mock.calls[0].arguments[0], 'COMP SCI 1102');
            assert.strictEqual((voteOnCourseUpdate as any).mock.calls[0].arguments[1], 'Semester 1, 2026');
            assert.strictEqual((voteOnCourseUpdate as any).mock.calls[0].arguments[2], 'Semester 1, 2026');
        });
    });
});
