import { describe, it, mock } from 'node:test';
import assert from 'node:assert';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// Mock next-auth/react
const mockSignIn = mock.fn();
mock.module('next-auth/react', {
    exports: {
        signIn: mockSignIn,
        useSession: () => ({ data: null, status: 'unauthenticated' }),
    }
});

// Dynamically import component after mocks
const { ModerationWarningModal } = await import('../../course/ModerationWarningModal');

describe('ModerationWarningModal Component', () => {
    it('renders as an authentication prompt when message requires login', () => {
        let closed = false;
        render(
            <ModerationWarningModal
                isOpen={true}
                onClose={() => { closed = true; }}
                message="You must be logged in to like reviews."
            />
        );

        // Header check
        assert.ok(screen.getByText('Authentication Required'));
        assert.strictEqual(screen.queryByText(/Moderation Alert/i), null);
        assert.strictEqual(screen.queryByText(/Submission Blocked/i), null);

        // Message content check
        assert.ok(screen.getByText(/You need to be logged into your/i));
        assert.ok(screen.getByText(/like reviews/i));

        // Action buttons check
        assert.strictEqual(screen.queryByText(/I Understand, Let Me Update It/i), null);
        const loginBtn = screen.getByRole('button', { name: /Log In with CS Club account/i });
        assert.ok(loginBtn);

        fireEvent.click(loginBtn);
        assert.strictEqual(mockSignIn.mock.callCount(), 1);
        assert.strictEqual(closed, true);
    });

    it('renders login prompt for comment login requirement', () => {
        render(
            <ModerationWarningModal
                isOpen={true}
                onClose={() => {}}
                message="Please login to write comments."
            />
        );

        assert.ok(screen.getByText('Authentication Required'));
        assert.strictEqual(screen.queryByText(/Moderation Alert/i), null);
        assert.strictEqual(screen.queryByText(/Submission Blocked/i), null);
        assert.ok(screen.getByText(/write comments/i));
    });

    it('renders standard moderation alert for true content/validation errors', () => {
        let closed = false;
        render(
            <ModerationWarningModal
                isOpen={true}
                onClose={() => { closed = true; }}
                message="Profanity or abusive language is not permitted."
            />
        );

        // Moderation alert check
        assert.ok(screen.getByText('Moderation Alert'));
        assert.ok(screen.getByText('Submission Blocked'));
        assert.ok(screen.getByText('Profanity or abusive language is not permitted.'));

        // Dismiss button check
        const dismissBtn = screen.getByRole('button', { name: /I Understand, Let Me Update It/i });
        assert.ok(dismissBtn);

        fireEvent.click(dismissBtn);
        assert.strictEqual(closed, true);
    });
});
