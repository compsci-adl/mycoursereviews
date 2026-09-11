import { describe, it } from 'node:test';
import assert from 'node:assert';
import { fireEvent, render, screen } from '@testing-library/react';

// Dynamically import after bootstrap mocks are initialized
const { HowToUseModal } = await import('../../layout/HowToUseModal');

describe('HowToUseModal Component', () => {
    it('does not render content when isOpen is false', () => {
        render(<HowToUseModal isOpen={false} onClose={() => {}} />);
        const title = screen.queryByText('HOW TO USE GUIDE');
        assert.strictEqual(title, null);
    });

    it('renders step 1 of 5 initially with search course details and WebP image', () => {
        render(<HowToUseModal isOpen={true} onClose={() => {}} />);

        // Header check
        assert.ok(screen.getByText('HOW TO USE GUIDE'));
        assert.ok(screen.getByText('STEP 1 OF 5'));

        // Step 1 content check
        assert.ok(screen.getByText('1. Search for Courses'));

        // Image check
        const img = screen.getByAltText('Step 1: Searching and filtering courses in the catalog');
        assert.ok(img);
        assert.ok(img.getAttribute('src')?.includes('search-courses.webp'));

        // Back button should be disabled on first step
        const backBtn = screen.getByRole('button', { name: /Back/i });
        assert.ok(backBtn.hasAttribute('disabled') || backBtn.getAttribute('aria-disabled') === 'true');

        // Next button should be present
        const nextBtn = screen.getByRole('button', { name: /Next/i });
        assert.ok(nextBtn);
    });

    it('advances through all 5 steps when clicking Next', () => {
        let closed = false;
        render(<HowToUseModal isOpen={true} onClose={() => { closed = true; }} />);

        // Step 1
        assert.ok(screen.getByText('STEP 1 OF 5'));
        assert.ok(screen.getByText('1. Search for Courses'));

        // Click Next -> Step 2
        fireEvent.click(screen.getByRole('button', { name: /Next/i }));
        assert.ok(screen.getByText('STEP 2 OF 5'));
        assert.ok(screen.getByText('2. View Course Information'));
        const img2 = screen.getByAltText('Step 2: Viewing course scorecards, EQ ratings, and syllabus info');
        assert.ok(img2.getAttribute('src')?.includes('course-info.webp'));

        // Click Next -> Step 3
        fireEvent.click(screen.getByRole('button', { name: /Next/i }));
        assert.ok(screen.getByText('STEP 3 OF 5'));
        assert.ok(screen.getByText('3. Write a Review'));
        const img3 = screen.getByAltText('Step 3: Rating course metrics and submitting a student review');
        assert.ok(img3.getAttribute('src')?.includes('write-reviews.webp'));

        // Click Next -> Step 4
        fireEvent.click(screen.getByRole('button', { name: /Next/i }));
        assert.ok(screen.getByText('STEP 4 OF 5'));
        assert.ok(screen.getByText('4. See Other Reviews & Comments'));
        const img4 = screen.getByAltText('Step 4: Reading peer reviews and threaded comments');
        assert.ok(img4.getAttribute('src')?.includes('view-reviews.webp'));

        // Click Next -> Step 5
        fireEvent.click(screen.getByRole('button', { name: /Next/i }));
        assert.ok(screen.getByText('STEP 5 OF 5'));
        assert.ok(screen.getByText('5. Manage Your Reviews & Comments'));
        const img5 = screen.getByAltText('Step 5: Managing your own reviews and comments');
        assert.ok(img5.getAttribute('src')?.includes('manage-reviews.webp'));

        // On step 5, Next button should be replaced by "Let's Go!"
        assert.strictEqual(screen.queryByRole('button', { name: /^Next$/i }), null);
        const finishBtn = screen.getByRole('button', { name: /Let's Go!/i });
        assert.ok(finishBtn);

        // Clicking "Let's Go!" closes the modal
        fireEvent.click(finishBtn);
        assert.strictEqual(closed, true);
    });

    it('allows navigating backward using Back button', () => {
        render(<HowToUseModal isOpen={true} onClose={() => {}} />);

        // Advance to step 2
        fireEvent.click(screen.getByRole('button', { name: /Next/i }));
        assert.ok(screen.getByText('STEP 2 OF 5'));

        // Go back to step 1
        fireEvent.click(screen.getByRole('button', { name: /Back/i }));
        assert.ok(screen.getByText('STEP 1 OF 5'));
        assert.ok(screen.getByText('1. Search for Courses'));
    });

    it('allows jumping directly to a step via indicator buttons', () => {
        render(<HowToUseModal isOpen={true} onClose={() => {}} />);

        const step4Indicator = screen.getByRole('button', { name: /Go to step 4/i });
        fireEvent.click(step4Indicator);

        assert.ok(screen.getByText('STEP 4 OF 5'));
        assert.ok(screen.getByText('4. See Other Reviews & Comments'));
    });

    it('triggers onClose when close button is clicked', () => {
        let closed = false;
        render(<HowToUseModal isOpen={true} onClose={() => { closed = true; }} />);

        const closeBtn = screen.getByRole('button', { name: /Close Guide/i });
        fireEvent.click(closeBtn);
        assert.strictEqual(closed, true);
    });
});
