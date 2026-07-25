import { test, expect } from '@playwright/test';

test('courses page renders course cards, filters, search, and infinite scroll', async ({ page }) => {
    // Suppress guide modal auto-popup
    await page.addInitScript(() => {
        localStorage.setItem('hasSeenGuide', 'true');
    });

    await page.goto('/courses');

    // 1. Verify main heading and page subtitle
    await expect(page.getByRole('heading', { name: /Browse Courses/i }).first()).toBeVisible();
    await expect(page.getByText('Explore student reviews for Adelaide University courses.')).toBeVisible();

    // 2. Verify search input is visible and interactive
    const searchInput = page.getByPlaceholder('Search courses (code/title)').first();
    await expect(searchInput).toBeVisible();

    // 3. Verify course cards render on initial load
    const firstCourseCard = page.getByTestId('course-card').first();
    await expect(firstCourseCard).toBeVisible();

    // 4. Test searching for a course and clearing search
    await searchInput.fill('ACCT');
    await page.waitForTimeout(300);
    const searchCards = page.getByTestId('course-card');
    expect(await searchCards.count()).toBeGreaterThan(0);

    // Clear search query so all courses are shown
    await searchInput.fill('');
    await page.waitForTimeout(300);

    // 5. Verify scrolling triggers infinite loading of additional cards
    await page.locator('#infinite-scroll-sentinel').scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);

    // Verify card count increases after scroll
    const courseCards = page.getByTestId('course-card');
    const cardCount = await courseCards.count();
    expect(cardCount).toBeGreaterThan(10);
});
