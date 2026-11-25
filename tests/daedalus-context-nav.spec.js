const { test, expect } = require('@playwright/test');

test.describe('/DaedalusX64/ executive context & navbar parity', () => {
  test('shows the plain-English banner above the technical hero', async ({ page }) => {
    const errors = [];
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/DaedalusX64/');
    const banner = page.locator('#exec-context');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('In plain English:');

    const bannerBox = await banner.boundingBox();
    const h1Box = await page.locator('#hero h1').boundingBox();
    expect(bannerBox.y).toBeLessThan(h1Box.y);

    await expect(banner.locator('a.exec-context-link')).toHaveAttribute('href', '/#contact');
    expect(errors.filter((e) => /Content Security Policy|Refused/i.test(e))).toEqual([]);
  });

  test('Contact and Support pills match the home page computed styles', async ({ page }) => {
    const pick = (sel) => page.locator(sel).evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, color: s.color, radius: s.borderRadius, weight: s.fontWeight, minH: s.minHeight };
    });

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    const homeCta = await pick('#menu-box .nav-pill--cta a');

    await page.goto('/DaedalusX64/');
    const labCta = await pick('header .nav-pill--cta a');
    expect(labCta).toEqual(homeCta);

    await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible();
    await expect(page.locator('header .nav-pill--support a')).toHaveCSS('border-top-style', 'solid');
  });

  test('navbar wraps on a 375px phone without horizontal overflow and keeps 44px pill targets', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 740 });
    await page.goto('/DaedalusX64/');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);

    for (const sel of ['header .nav-pill--support a', 'header .nav-pill--cta a']) {
      const box = await page.locator(sel).boundingBox();
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
    await expect(page.locator('#exec-context')).toBeVisible();
    await expect(page.locator('header .nav-sep')).toBeHidden();
  });

  test('Contact pill is keyboard reachable with a visible focus ring', async ({ page }) => {
    await page.goto('/DaedalusX64/');
    const cta = page.locator('header .nav-pill--cta a');
    await cta.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await expect(cta).toBeFocused();
    await expect(cta).toHaveCSS('outline-style', 'solid');
  });
});
