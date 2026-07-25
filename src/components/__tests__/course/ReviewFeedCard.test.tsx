import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { Review } from '../../course/ReviewFeedCard';

// Mock framer-motion before importing using modern Node 26 exports API
mock.module('framer-motion', {
    exports: {
        motion: {
            div: ({ children, ...props }: any) => React.createElement('div', props, children),
        },
    }
});

// Mock heroui components to swallow custom styling props and prevent console warnings
mock.module('@heroui/react', {
    exports: {
        Button: ({ children, onClick, onPress, isLoading, radius, size, variant, color, startContent, ...props }: any) => (
            React.createElement('button', { onClick: onClick || onPress, disabled: isLoading, ...props }, children)
        ),
        Card: ({ children, ...props }: any) => React.createElement('div', props, children),
        CardBody: ({ children, ...props }: any) => React.createElement('div', props, children),
        Textarea: ({ value, onValueChange, placeholder, radius, size, classNames, minRows, isDisabled, ...props }: any) => (
            React.createElement('textarea', {
                value,
                onChange: (e: any) => onValueChange && onValueChange(e.target.value),
                placeholder,
                disabled: isDisabled,
                ...props
            })
        ),
    }
});

mock.module('../../course/ModerationWarningModal', {
    exports: {
        ModerationWarningModal: ({ isOpen, onClose, message }: any) => (
            isOpen ? (
                React.createElement('div', { 'data-testid': 'moderation-warning-modal' },
                    React.createElement('span', { 'data-testid': 'moderation-warning-message' }, message),
                    React.createElement('button', { onClick: onClose, 'data-testid': 'close-warning-btn' }, 'Close Warning')
                )
            ) : null
        )
    }
});

// Mock CommentThread component
mock.module('../../course/CommentThread', {
    exports: {
        CommentThread: ({ reviewId }: any) => React.createElement('div', { 'data-testid': 'mock-comment-thread' }, reviewId),
    }
});

// Dynamically import component after registering mocks
const { ReviewFeedCard } = await import('../../course/ReviewFeedCard');

const mockReview: Review = {
    id: 'rev123',
    userId: 'user1',
    title: 'Highly Recommended Course',
    description: 'This is a long description designed to test truncation and expansion. It needs to be sufficiently long to exceed one hundred and eighty characters in total length so that the truncation mechanism gets triggered correctly by our conditional check inside the component itself.',
    overallRating: 4.5,
    difficultyScore: 3,
    usefulnessScore: 4.5,
    enjoymentScore: 5,
    termTaken: 'Semester 1, 2026',
    grade: 'HD',
    isAnonymous: false,
    reviewerName: 'John Doe',
    createdAt: new Date('2026-05-24T12:00:00Z'),
    likesCount: 5,
    likedByCurrentUser: false,
    comments: [
        {
            id: 'c1',
            userId: 'u1',
            userName: 'Alice',
            content: 'Nice review!',
            parentId: null,
            createdAt: new Date('2026-05-24T12:05:00Z'),
        }
    ],
};

describe('ReviewFeedCard Component', () => {
    let mockOnLike: any;
    let mockOnReviewEdit: any;
    let mockOnReviewDelete: any;
    let mockOnCommentSubmit: any;
    let mockOnCommentEdit: any;
    let mockOnCommentDelete: any;
    let originalConfirm: any;
    let mockAlert: any;

    beforeEach(() => {
        mockOnLike = mock.fn(async () => {});
        mockOnReviewEdit = mock.fn();
        mockOnReviewDelete = mock.fn(async () => {});
        mockOnCommentSubmit = mock.fn(async () => {});
        mockOnCommentEdit = mock.fn(async () => {});
        mockOnCommentDelete = mock.fn(async () => {});
        
        mockAlert = mock.fn();
        Object.defineProperty(window, 'alert', {
            value: mockAlert,
            configurable: true,
            writable: true
        });
        Object.defineProperty(global, 'alert', {
            value: mockAlert,
            configurable: true,
            writable: true
        });
        
        originalConfirm = window.confirm;
        const mockConfirm = mock.fn(() => true);
        window.confirm = mockConfirm;
        global.confirm = mockConfirm;
    });

    afterEach(() => {
        window.confirm = originalConfirm;
        global.confirm = originalConfirm;
    });

    it('renders review details successfully', () => {
        render(
            <ReviewFeedCard
                review={mockReview}
                idx={0}
                session={{ user: { id: 'user1', role: 'user' } }}
                onLike={mockOnLike}
                onReviewEdit={mockOnReviewEdit}
                onReviewDelete={mockOnReviewDelete}
                onCommentSubmit={mockOnCommentSubmit}
                onCommentEdit={mockOnCommentEdit}
                onCommentDelete={mockOnCommentDelete}
            />
        );

        assert.ok(screen.getByText('Highly Recommended Course'));
        assert.ok(screen.getByText('John Doe'));
        assert.ok(screen.getByText('Grade: HD'));
        assert.ok(screen.getByText('Term taken: Semester 1, 2026'));
        assert.ok(screen.getByText('Comments (1)'));
    });

    it('renders anonymous reviewer correctly', () => {
        render(
            <ReviewFeedCard
                review={{ ...mockReview, isAnonymous: true }}
                idx={0}
                session={null}
                onLike={mockOnLike}
                onReviewEdit={mockOnReviewEdit}
                onReviewDelete={mockOnReviewDelete}
                onCommentSubmit={mockOnCommentSubmit}
                onCommentEdit={mockOnCommentEdit}
                onCommentDelete={mockOnCommentDelete}
            />
        );

        assert.ok(screen.getByText('Anonymous'));
        assert.strictEqual(screen.queryByText('John Doe'), null);
    });

    it('allows toggling description truncation/expansion', () => {
        render(
            <ReviewFeedCard
                review={mockReview}
                idx={0}
                session={null}
                onLike={mockOnLike}
                onReviewEdit={mockOnReviewEdit}
                onReviewDelete={mockOnReviewDelete}
                onCommentSubmit={mockOnCommentSubmit}
                onCommentEdit={mockOnCommentEdit}
                onCommentDelete={mockOnCommentDelete}
            />
        );

        const toggleBtn = screen.getByRole('button', { name: 'See More' });
        fireEvent.click(toggleBtn);
        assert.ok(screen.getByRole('button', { name: 'See Less' }));

        fireEvent.click(screen.getByRole('button', { name: 'See Less' }));
        assert.ok(screen.getByRole('button', { name: 'See More' }));
    });

    it('alerts unauthenticated user trying to like', () => {
        render(
            <ReviewFeedCard
                review={mockReview}
                idx={0}
                session={null}
                onLike={mockOnLike}
                onReviewEdit={mockOnReviewEdit}
                onReviewDelete={mockOnReviewDelete}
                onCommentSubmit={mockOnCommentSubmit}
                onCommentEdit={mockOnCommentEdit}
                onCommentDelete={mockOnCommentDelete}
            />
        );

        const likeBtn = screen.getByRole('button', { name: /Like/i });
        fireEvent.click(likeBtn);

        assert.ok(screen.getByTestId('moderation-warning-modal'));
        assert.ok(screen.getByTestId('moderation-warning-message').textContent?.includes('You must be logged in to like reviews.'));
        assert.strictEqual(mockOnLike.mock.callCount(), 0);
    });

    it('calls onLike when authenticated user likes', async () => {
        render(
            <ReviewFeedCard
                review={mockReview}
                idx={0}
                session={{ user: { id: 'user2', role: 'user' } }}
                onLike={mockOnLike}
                onReviewEdit={mockOnReviewEdit}
                onReviewDelete={mockOnReviewDelete}
                onCommentSubmit={mockOnCommentSubmit}
                onCommentEdit={mockOnCommentEdit}
                onCommentDelete={mockOnCommentDelete}
            />
        );

        const likeBtn = screen.getByRole('button', { name: /Like/i });
        fireEvent.click(likeBtn);

        await waitFor(() => {
            assert.strictEqual(mockOnLike.mock.callCount(), 1);
            assert.strictEqual(mockOnLike.mock.calls[0].arguments[0], 'rev123');
        });
    });

    it('handles like errors cleanly', async () => {
        mockOnLike = mock.fn(async () => {
            throw new Error('Network failure');
        });

        render(
            <ReviewFeedCard
                review={mockReview}
                idx={0}
                session={{ user: { id: 'user2', role: 'user' } }}
                onLike={mockOnLike}
                onReviewEdit={mockOnReviewEdit}
                onReviewDelete={mockOnReviewDelete}
                onCommentSubmit={mockOnCommentSubmit}
                onCommentEdit={mockOnCommentEdit}
                onCommentDelete={mockOnCommentDelete}
            />
        );

        const likeBtn = screen.getByRole('button', { name: /Like/i });
        fireEvent.click(likeBtn);

        await waitFor(() => {
            assert.ok(screen.getByTestId('moderation-warning-modal'));
            assert.ok(screen.getByTestId('moderation-warning-message').textContent?.includes('Network failure'));
        });
    });

    it('allows edit of review for owner/admin', () => {
        render(
            <ReviewFeedCard
                review={mockReview}
                idx={0}
                session={{ user: { id: 'user1', role: 'user' } }}
                onLike={mockOnLike}
                onReviewEdit={mockOnReviewEdit}
                onReviewDelete={mockOnReviewDelete}
                onCommentSubmit={mockOnCommentSubmit}
                onCommentEdit={mockOnCommentEdit}
                onCommentDelete={mockOnCommentDelete}
            />
        );

        const editBtn = screen.getByRole('button', { name: /edit/i });
        fireEvent.click(editBtn);
        assert.strictEqual(mockOnReviewEdit.mock.callCount(), 1);
        assert.deepStrictEqual(mockOnReviewEdit.mock.calls[0].arguments[0], mockReview);
    });

    it('allows deletion of review with confirmation', async () => {
        render(
            <ReviewFeedCard
                review={mockReview}
                idx={0}
                session={{ user: { id: 'user1', role: 'user' } }}
                onLike={mockOnLike}
                onReviewEdit={mockOnReviewEdit}
                onReviewDelete={mockOnReviewDelete}
                onCommentSubmit={mockOnCommentSubmit}
                onCommentEdit={mockOnCommentEdit}
                onCommentDelete={mockOnCommentDelete}
            />
        );

        const deleteBtn = screen.getByRole('button', { name: /delete/i });
        fireEvent.click(deleteBtn);

        assert.strictEqual((window.confirm as any).mock.callCount(), 1);
        await waitFor(() => {
            assert.strictEqual(mockOnReviewDelete.mock.callCount(), 1);
            assert.strictEqual(mockOnReviewDelete.mock.calls[0].arguments[0], 'rev123');
        });
    });

    it('aborts deletion if cancel confirmation selected', () => {
        window.confirm = mock.fn(() => false);
        global.confirm = window.confirm as any;

        render(
            <ReviewFeedCard
                review={mockReview}
                idx={0}
                session={{ user: { id: 'user1', role: 'user' } }}
                onLike={mockOnLike}
                onReviewEdit={mockOnReviewEdit}
                onReviewDelete={mockOnReviewDelete}
                onCommentSubmit={mockOnCommentSubmit}
                onCommentEdit={mockOnCommentEdit}
                onCommentDelete={mockOnCommentDelete}
            />
        );

        const deleteBtn = screen.getByRole('button', { name: /delete/i });
        fireEvent.click(deleteBtn);

        assert.strictEqual((window.confirm as any).mock.callCount(), 1);
        assert.strictEqual(mockOnReviewDelete.mock.callCount(), 0);
    });

    it('renders empty comments placeholder', () => {
        render(
            <ReviewFeedCard
                review={{ ...mockReview, comments: [] }}
                idx={0}
                session={null}
                onLike={mockOnLike}
                onReviewEdit={mockOnReviewEdit}
                onReviewDelete={mockOnReviewDelete}
                onCommentSubmit={mockOnCommentSubmit}
                onCommentEdit={mockOnCommentEdit}
                onCommentDelete={mockOnCommentDelete}
            />
        );

        assert.ok(screen.getByText('No comments yet.'));
    });

    it('allows authenticated comment writing', async () => {
        render(
            <ReviewFeedCard
                review={mockReview}
                idx={0}
                session={{ user: { id: 'user2', role: 'user' } }}
                onLike={mockOnLike}
                onReviewEdit={mockOnReviewEdit}
                onReviewDelete={mockOnReviewDelete}
                onCommentSubmit={mockOnCommentSubmit}
                onCommentEdit={mockOnCommentEdit}
                onCommentDelete={mockOnCommentDelete}
            />
        );

        // Click comment feed button to expand comment box if hidden
        const commentFeedBtn = screen.getByRole('button', { name: /Comments \(1\)/i });
        fireEvent.click(commentFeedBtn);

        const commentTextarea = screen.getByPlaceholderText('Write a comment...');
        fireEvent.change(commentTextarea, { target: { value: 'This is my root comment' } });

        const submitBtn = screen.getByRole('button', { name: 'Add a Comment' });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            assert.strictEqual(mockOnCommentSubmit.mock.callCount(), 1);
            assert.strictEqual(mockOnCommentSubmit.mock.calls[0].arguments[0], 'rev123');
            assert.strictEqual(mockOnCommentSubmit.mock.calls[0].arguments[1], 'This is my root comment');
        });
    });

    it('prevents comment submission if content empty', () => {
        render(
            <ReviewFeedCard
                review={mockReview}
                idx={0}
                session={{ user: { id: 'user2', role: 'user' } }}
                onLike={mockOnLike}
                onReviewEdit={mockOnReviewEdit}
                onReviewDelete={mockOnReviewDelete}
                onCommentSubmit={mockOnCommentSubmit}
                onCommentEdit={mockOnCommentEdit}
                onCommentDelete={mockOnCommentDelete}
            />
        );

        const commentFeedBtn = screen.getByRole('button', { name: /Comments \(1\)/i });
        fireEvent.click(commentFeedBtn);

        const submitBtn = screen.getByRole('button', { name: 'Add a Comment' });
        fireEvent.click(submitBtn);

        assert.ok(screen.getByTestId('moderation-warning-modal'));
        assert.ok(screen.getByTestId('moderation-warning-message').textContent?.includes('Comment cannot be empty.'));
        assert.strictEqual(mockOnCommentSubmit.mock.callCount(), 0);
    });

    it('alerts on review deletion failure', async () => {
        mockOnReviewDelete = mock.fn(async () => {
            throw new Error('Deletion failed');
        });

        render(
            <ReviewFeedCard
                review={mockReview}
                idx={0}
                session={{ user: { id: 'user1', role: 'user' } }}
                onLike={mockOnLike}
                onReviewEdit={mockOnReviewEdit}
                onReviewDelete={mockOnReviewDelete}
                onCommentSubmit={mockOnCommentSubmit}
                onCommentEdit={mockOnCommentEdit}
                onCommentDelete={mockOnCommentDelete}
            />
        );

        const deleteBtn = screen.getByRole('button', { name: /delete/i });
        fireEvent.click(deleteBtn);

        await waitFor(() => {
            assert.ok(screen.getByTestId('moderation-warning-modal'));
            assert.ok(screen.getByTestId('moderation-warning-message').textContent?.includes('Deletion failed'));
        });
    });

    it('alerts on comment submission failure', async () => {
        mockOnCommentSubmit = mock.fn(async () => {
            throw new Error('Comment submission failed');
        });

        render(
            <ReviewFeedCard
                review={mockReview}
                idx={0}
                session={{ user: { id: 'user2', role: 'user' } }}
                onLike={mockOnLike}
                onReviewEdit={mockOnReviewEdit}
                onReviewDelete={mockOnReviewDelete}
                onCommentSubmit={mockOnCommentSubmit}
                onCommentEdit={mockOnCommentEdit}
                onCommentDelete={mockOnCommentDelete}
            />
        );

        const commentFeedBtn = screen.getByRole('button', { name: /Comments \(1\)/i });
        fireEvent.click(commentFeedBtn);

        const commentTextarea = screen.getByPlaceholderText('Write a comment...');
        fireEvent.change(commentTextarea, { target: { value: 'This comment is going to fail' } });

        const submitBtn = screen.getByRole('button', { name: 'Add a Comment' });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            assert.ok(screen.getByTestId('moderation-warning-modal'));
            assert.ok(screen.getByTestId('moderation-warning-message').textContent?.includes('Comment submission failed'));
        });
    });
});
