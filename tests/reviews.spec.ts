import { test, expect } from '@playwright/test';

test('unauthenticated clicking write review opens AuthRequired modal', async ({ page }) => {
    // Suppress guide modal auto-popup
    await page.addInitScript(() => {
        localStorage.setItem('hasSeenGuide', 'true');
    });
    // Navigate directly to the default course outline page
    await page.goto('/courses/COMP%20SCI%201102');

    // Verify course detail page headers loaded successfully
    await expect(page.getByText('COMP SCI 1102').first()).toBeVisible();
    await expect(page.getByText('Object Oriented Programming').first()).toBeVisible();

    // Find and click the "Write Review" CTA
    const writeBtn = page.getByRole('button', { name: /Write Review/i }).first();
    await expect(writeBtn).toBeVisible();
    await writeBtn.click({ force: true });

    // Verify that the Authentication Required warning modal shows up
    const modalHeader = page.getByText('Authentication Required').first();
    await expect(modalHeader).toBeVisible();

    // Validate explainers and club anti-spam safeguards
    await expect(
        page.getByText('CS Club account', { exact: false }).first()
    ).toBeVisible();
    await expect(
        page.getByText('This helps us ensure reviews are written by genuine students', { exact: false }).first()
    ).toBeVisible();

    // Verify presence of interactive CTA options
    const cancelBtn = page.getByRole('button', { name: /Cancel/i }).first();
    const loginBtn = page.getByRole('button', { name: /Log In with CS Club account/i }).first();
    await expect(cancelBtn).toBeVisible();
    await expect(loginBtn).toBeVisible();

    // Click cancel button and verify the modal is closed safely
    await cancelBtn.click({ force: true });
    await expect(modalHeader).not.toBeVisible();
});
