import { test, expect } from '@playwright/test';

test.describe('Mobile – iPhone 16 Pro Max', () => {
  /**
   * The search dock (trigger pill + random button) must stay anchored near the
   * bottom of the viewport at all times — opening or dismissing the search modal
   * must not push it off-screen.
   */
  test('search dock always visible', async ({ page }) => {
    await page.goto('/');

    // Search button should be visible on first paint
    const searchBtn = page.getByRole('button', { name: /search countries/i });
    await expect(searchBtn).toBeVisible();

    // Open the search modal
    await searchBtn.tap();
    await expect(page.getByRole('dialog', { name: /country search/i })).toBeVisible();

    // Dismiss via Escape — modal closes, dock must stay in viewport
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();

    // Dock bounding rect must be fully within the visible viewport height
    const dock = page.locator('[data-testid="search-dock"]');
    await expect(dock).toBeVisible();
    const box = await dock.boundingBox();
    const viewport = page.viewportSize()!;
    expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height);
  });

  /**
   * Tapping search, typing "India", and selecting the result should close the
   * modal and trigger the globe-fly animation (beacon pill appears on mobile
   * confirming the selection propagated to app state).
   */
  test('search works', async ({ page }) => {
    await page.goto('/');

    // Open search modal
    const searchBtn = page.getByRole('button', { name: /search countries/i });
    await expect(searchBtn).toBeVisible();
    await searchBtn.tap();

    const dialog = page.getByRole('dialog', { name: /country search/i });
    await expect(dialog).toBeVisible();

    // Type a query
    const input = page.getByPlaceholder('Search any country…');
    await input.fill('India');

    // India should appear in results — pick the first match inside the dialog
    const indiaResult = dialog.getByRole('button', { name: /\bIndia\b/ }).first();
    await expect(indiaResult).toBeVisible();
    await indiaResult.tap();

    // Modal must close after selection
    await expect(dialog).toBeHidden();

    // On mobile, a beacon pill confirms flyToTarget was set (sm:hidden div)
    const beacon = page.locator('button', { hasText: 'tap globe to explore' });
    await expect(beacon).toBeVisible();
  });

  /**
   * After a country is selected the info panel slides in from the right.
   * The close button must be visible and within the viewport — not hidden
   * behind the notch or home indicator bar.
   */
  test('info panel close reachable', async ({ page }) => {
    await page.goto('/');

    // Use the "random country" button to reliably open the info panel
    // without needing to click the WebGL globe canvas.
    const randomBtn = page.getByRole('button', { name: /explore a random country/i });
    await expect(randomBtn).toBeVisible();
    await randomBtn.tap();

    const closeBtn = page.getByRole('button', { name: 'Close' });
    await expect(closeBtn).toBeVisible();

    const box = await closeBtn.boundingBox();
    const viewport = page.viewportSize()!;

    // Top edge must be below the status bar / notch
    expect(box!.y).toBeGreaterThan(0);
    // Bottom edge must be above the viewport bottom (home indicator area)
    expect(box!.y + box!.height).toBeLessThan(viewport.height);
  });

  /**
   * Apple HIG requires interactive tap targets to be at least 44 × 44 pt.
   * We enforce the slightly relaxed 40 × 40 px minimum here.
   * (The close button is currently w-8 h-8 = 32 px — this test documents the gap.)
   */
  test('close button tap target', async ({ page }) => {
    await page.goto('/');

    const randomBtn = page.getByRole('button', { name: /explore a random country/i });
    await expect(randomBtn).toBeVisible();
    await randomBtn.tap();

    const closeBtn = page.getByRole('button', { name: 'Close' });
    await expect(closeBtn).toBeVisible();

    const box = await closeBtn.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(40);
    expect(box!.height).toBeGreaterThanOrEqual(40);
  });

  /**
   * The search dock must not sit flush against the viewport bottom edge.
   * On iPhone 16 Pro Max the home indicator bar is ~34 px tall — the dock
   * should leave at least 20 px of clearance so it is not obscured.
   */
  test('safe area respected', async ({ page }) => {
    await page.goto('/');

    const dock = page.locator('[data-testid="search-dock"]');
    await expect(dock).toBeVisible();

    const box = await dock.boundingBox();
    const viewport = page.viewportSize()!;

    // Gap between dock bottom and viewport bottom must be > 20 px
    const clearance = viewport.height - (box!.y + box!.height);
    expect(clearance).toBeGreaterThan(20);
  });
});
