import { describe, it } from 'node:test';
import assert from 'node:assert';
import { render, screen } from '@testing-library/react';

// Dynamically import after bootstrap mocks are initialized
const { Footer } = await import('../../layout/Footer');

describe('Footer Component', () => {
    it('renders the branding text and copyrights successfully', () => {
        render(<Footer />);

        // Assert branding presence
        assert.ok(screen.getByText(/MyCourse/));
        assert.ok(screen.getByText(/Reviews/));

        // Assert copyright reference
        assert.ok(screen.getByText(/Adelaide University Computer Science Club/));
    });

    it('contains interactive modal toggle triggers for About, Disclaimer, Privacy, and Terms & Conditions', () => {
        render(<Footer />);

        const aboutTrigger = screen.getByText('About');
        const disclaimerTrigger = screen.getByText('Disclaimer');
        const privacyTrigger = screen.getByText('Privacy');
        const termsTrigger = screen.getByText('Terms & Conditions');

        assert.ok(aboutTrigger);
        assert.ok(disclaimerTrigger);
        assert.ok(privacyTrigger);
        assert.ok(termsTrigger);
    });
});
