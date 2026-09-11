import { describe, it, mock } from 'node:test';
import assert from 'node:assert';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

mock.module('@heroui/react', {
    exports: {
        Modal: ({ children, isOpen, onClose }: any) => {
            if (!isOpen) return null;
            return (
                <div data-testid="mock-modal">
                    <button data-testid="modal-close-trigger" onClick={onClose}>Close</button>
                    {children}
                </div>
            );
        },
        ModalContent: ({ children }: any) => <div data-testid="mock-modal-content">{children}</div>,
        ModalHeader: ({ children, className }: any) => <div className={className}>{children}</div>,
        ModalBody: ({ children, className }: any) => <div className={className}>{children}</div>,
    }
});

const { TermsAndConditionsModal } = await import('../../course/TermsAndConditionsModal');

describe('TermsAndConditionsModal Component', () => {
    it('does not render when isOpen is false', () => {
        render(<TermsAndConditionsModal isOpen={false} onClose={() => {}} />);
        assert.strictEqual(screen.queryByText('Terms & Conditions'), null);
    });

    it('renders the agreement clause and dot points when isOpen is true', () => {
        render(<TermsAndConditionsModal isOpen={true} onClose={() => {}} />);

        // Header
        assert.ok(screen.getByText('Terms & Conditions'));

        // Prominent agreement clause
        assert.ok(screen.getByText(/By using this service, you agree to these terms and conditions\./i));

        // Acceptance of terms
        assert.ok(screen.getByText(/1\. Acceptance of Terms/i));
        assert.ok(screen.getByText(/By accessing, browsing, or using this service, you agree to these terms and conditions in full\./i));

        // Student charter & code of conduct
        assert.ok(screen.getByText(/2\. Student Charter & Code of Conduct/i));
        assert.ok(screen.getByText(/Adelaide University Student Charter/i));

        // Prohibited content
        assert.ok(screen.getByText(/3\. Prohibited Content & Conflicts of Interest/i));
        assert.ok(screen.getByText(/Profanity, harassment, hate speech, defamation/i));

        // Explicit review removal policy
        assert.ok(screen.getByText(/4\. Removal of Reviews & Moderation Policy/i));
        assert.ok(screen.getByText(/We will remove reviews that do not meet the Terms & Conditions\./i));
    });

    it('calls onClose when close trigger is fired', () => {
        let closed = false;
        render(<TermsAndConditionsModal isOpen={true} onClose={() => { closed = true; }} />);

        const closeBtn = screen.getByTestId('modal-close-trigger');
        fireEvent.click(closeBtn);
        assert.strictEqual(closed, true);
    });
});
