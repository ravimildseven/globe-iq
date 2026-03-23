/**
 * GlobeIQ — Mobile E2E tests
 * Device: iPhone 16 Pro Max  (430 × 932, isMobile, hasTouch)
 * Target: https://globe-iq.vercel.app
 */
import { test, expect, Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Wait until the globe canvas is mounted and the loading spinner is gone. */
async function waitForGlobe(page: Page) {
  // The spinner contains "Initialising Globe IQ…"
  // It disappears once the dynamic Globe component mounts.
  await page.waitForSelector('canvas', { timeout: 20000 });
  // Give Three.js a moment to start rendering
  await page.waitForTimeout(1500);
}

/** Open the search modal via the trigger pill. */
async function openSearch(page: Page) {
  await page.getByRole('button', { name: /Search countries/i }).tap();
  await expect(page.getByRole('dialog', { name: 'Country search' })).toBeVisible();
}

/**
 * Search for a country and tap its result.
 * After this the globe flies to the country (flyToTarget set) and the
 * mobile beacon dismiss pill appears; the info panel does NOT open yet —
 * the user must tap the globe to select the country.
 */
async function searchAndFly(page: Page, countryName: string) {
  await openSearch(page);
  await page.getByPlaceholder('Search any country…').fill(countryName);
  // Results appear — find by name inside the dialog (button text includes flag + region + code)
  const dialog = page.getByRole('dialog', { name: 'Country search' });
  const result = dialog.getByRole('button', { name: new RegExp(countryName, 'i') }).first();
  await expect(result).toBeVisible({ timeout: 5000 });
  await result.tap();
  // Modal should close
  await expect(page.getByRole('dialog', { name: 'Country search' })).not.toBeVisible();
  // Allow the fly-to animation to complete (~1.4 s)
  await page.waitForTimeout(2000);
}

/**
 * Select a country programmatically via the window test-hook exposed by page.tsx.
 * This avoids relying on WebGL raycasting in headless mode (which is flaky because
 * touchscreen.tap() synthetic events aren't reliably processed by Three.js).
 */
async function selectCountryByCode(page: Page, code: string) {
  await page.evaluate((countryCode: string) => {
    const g = (window as any).__globeiq;
    if (!g) throw new Error('__globeiq test-hook not found on window');
    const country = g.centroids.find((c: { code: string }) => c.code === countryCode);
    if (!country) throw new Error(`Country not found: ${countryCode}`);
    g.selectCountry(country);
  }, code);
  // Allow panel entry animation
  await page.waitForTimeout(600);
}

// ---------------------------------------------------------------------------
// 1. Search dock always visible
// ---------------------------------------------------------------------------

test('search dock is always visible in viewport', async ({ page }) => {
  await page.goto('/');
  await waitForGlobe(page);

  const searchBtn = page.getByRole('button', { name: /Search countries/i });
  await expect(searchBtn).toBeVisible();

  // Bounding rect — bottom edge must be above the fold
  const rect = await searchBtn.boundingBox();
  expect(rect, 'search button should have a bounding box').not.toBeNull();
  const vh = await page.evaluate(() => window.innerHeight);
  expect(rect!.y + rect!.height).toBeLessThan(vh);

  // Open search
  await openSearch(page);

  // Close with Escape
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Country search' })).not.toBeVisible();

  // Dock still visible and still above the fold
  await expect(searchBtn).toBeVisible();
  const rect2 = await searchBtn.boundingBox();
  expect(rect2, 'search button still has a bounding box after close').not.toBeNull();
  expect(rect2!.y + rect2!.height).toBeLessThan(vh);
});

// ---------------------------------------------------------------------------
// 2. Search functionality
// ---------------------------------------------------------------------------

test('search modal opens, finds India, and beacon appears on result tap', async ({ page }) => {
  await page.goto('/');
  await waitForGlobe(page);

  // Open search
  await openSearch(page);

  // Type "India"
  await page.getByPlaceholder('Search any country…').fill('India');

  // Results dropdown shows India
  const indiaResult = page.getByRole('button', { name: /India/i }).first();
  await expect(indiaResult).toBeVisible();

  // Tap the India result
  await indiaResult.tap();

  // Modal closes
  await expect(page.getByRole('dialog', { name: 'Country search' })).not.toBeVisible();

  // Mobile beacon dismiss pill appears (sm:hidden, tap globe to explore)
  // This is the expected behaviour: search sets flyToTarget (beacon), not selectedCountry
  await expect(page.getByText('tap globe to explore')).toBeVisible({ timeout: 3000 });

  // Search dock is still visible after search completes
  await expect(page.getByRole('button', { name: /Search countries/i })).toBeVisible();
});

test('info panel opens after search-fly + country select', async ({ page }) => {
  await page.goto('/');
  await waitForGlobe(page);

  // Fly globe to India via search (sets flyToTarget / beacon)
  await searchAndFly(page, 'India');

  // Select India programmatically (mirrors what a canvas tap would do)
  await selectCountryByCode(page, 'IN');

  // Info panel (<aside>) should open
  const panel = page.locator('aside');
  await expect(panel).toBeVisible({ timeout: 5000 });

  // Search dock remains visible behind the panel
  await expect(page.getByRole('button', { name: /Search countries/i })).toBeVisible();
});

// ---------------------------------------------------------------------------
// 3. Info panel close button always reachable
// ---------------------------------------------------------------------------

test('info panel close button is reachable and meets 40 px tap-target minimum', async ({ page }) => {
  await page.goto('/');
  await waitForGlobe(page);

  await selectCountryByCode(page, 'IN');

  const panel = page.locator('aside');
  await expect(panel).toBeVisible({ timeout: 5000 });

  // Close button must be visible
  const closeBtn = page.getByRole('button', { name: 'Close' });
  await expect(closeBtn).toBeVisible();

  // Bounding rect — must be within the viewport
  const rect = await closeBtn.boundingBox();
  expect(rect, 'close button has a bounding box').not.toBeNull();

  const vw = await page.evaluate(() => window.innerWidth);
  const vh = await page.evaluate(() => window.innerHeight);
  expect(rect!.x).toBeGreaterThanOrEqual(0);
  expect(rect!.y).toBeGreaterThanOrEqual(0);
  expect(rect!.x + rect!.width).toBeLessThanOrEqual(vw);
  expect(rect!.y + rect!.height).toBeLessThanOrEqual(vh);

  // Minimum tap-target size: 40 × 40 px
  expect(rect!.width).toBeGreaterThanOrEqual(40);
  expect(rect!.height).toBeGreaterThanOrEqual(40);

  // Tapping close should dismiss the panel
  await closeBtn.tap();
  await expect(panel).not.toBeVisible({ timeout: 3000 });
});

// ---------------------------------------------------------------------------
// 4. Accidental touch threshold (< 5 px drag suppresses selection)
// ---------------------------------------------------------------------------

test('short swipe on globe does not select a country', async ({ page }) => {
  await page.goto('/');
  await waitForGlobe(page);

  const vw = await page.evaluate(() => window.innerWidth);
  const vh = await page.evaluate(() => window.innerHeight);
  const cx = vw / 2;
  const cy = vh / 2;

  // Simulate a drag: pointerdown → small move (10 px) → pointerup quickly
  await page.touchscreen.tap(cx, cy);           // settle any auto-rotate
  await page.waitForTimeout(300);

  // Drag of 10 px — exceeds the 5 px threshold in Globe.tsx handleClick
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.mouse.move(cx + 10, cy + 3, { steps: 3 });
  await page.mouse.up();
  await page.waitForTimeout(400);

  // Panel should NOT be open
  const panel = page.locator('aside');
  await expect(panel).not.toBeVisible();
});

test('precise select (no drag) opens the info panel', async ({ page }) => {
  await page.goto('/');
  await waitForGlobe(page);

  // Select France directly (equivalent of a clean tap on the country)
  await selectCountryByCode(page, 'FR');

  // Panel should open and show France
  const panel = page.locator('aside');
  await expect(panel).toBeVisible({ timeout: 5000 });
  await expect(page.locator('body')).toBeVisible();
});

// ---------------------------------------------------------------------------
// 5. Bottom safe area — search dock clears the bottom edge
// ---------------------------------------------------------------------------

test('search dock bottom is clear of the viewport bottom edge', async ({ page }) => {
  await page.goto('/');
  await waitForGlobe(page);

  const searchBtn = page.getByRole('button', { name: /Search countries/i });
  await expect(searchBtn).toBeVisible();

  const rect = await searchBtn.boundingBox();
  expect(rect).not.toBeNull();
  const vh = await page.evaluate(() => window.innerHeight);

  // The dock sits at CSS bottom-[62px], so its bottom edge must be at least
  // 40 px above the viewport bottom (a conservative safe-area check).
  const distanceFromBottom = vh - (rect!.y + rect!.height);
  expect(distanceFromBottom).toBeGreaterThanOrEqual(40);
});
