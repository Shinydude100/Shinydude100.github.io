const { test, expect } = require('@playwright/test');

function collectRuntimeErrors(page) {
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!text.includes('speculation rules')) {
        consoleErrors.push(text);
      }
    }
  });
  page.on('pageerror', (err) => pageErrors.push(err.message));
  return { consoleErrors, pageErrors };
}

test.describe('/DaedalusX64/ responsive header, mobile menu focus restore & cross-route polish', () => {
  test('desktop viewports (1280x800 & 1440x900) render compact single-row header, age-16 context, and non-overlapping pills', async ({ page }) => {
    const { consoleErrors, pageErrors } = collectRuntimeErrors(page);

    for (const [width, height] of [[1280, 800], [1440, 900]]) {
      await page.setViewportSize({ width, height });
      await page.goto('/DaedalusX64/');

      const headerBox = await page.locator('#site-header').boundingBox();
      expect(headerBox).not.toBeNull();
      expect(headerBox.height).toBeLessThan(90);

      await expect(page.locator('#mobile-toggle')).toBeHidden();
      await expect(page.locator('#exec-context')).toBeVisible();
      await expect(page.locator('.origin-story-banner')).toContainText('Starting at age 16');

      const bannerBox = await page.locator('#exec-context').boundingBox();
      const h1Box = await page.locator('#hero h1').boundingBox();
      expect(bannerBox.y).toBeLessThan(h1Box.y);

      const supportBox = await page.locator('#site-header .nav-pill--support a').boundingBox();
      const contactBox = await page.locator('#site-header .nav-pill--cta a').boundingBox();
      expect(supportBox.x + supportBox.width).toBeLessThan(contactBox.x);

      const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      expect(hasOverflow).toBe(false);
    }

    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('mobile and tablet viewports (375x812 & 768x1024) prevent overflow, open #daedalus-menu-box, and restore focus on Escape', async ({ page }) => {
    const { consoleErrors, pageErrors } = collectRuntimeErrors(page);

    for (const [width, height] of [[375, 812], [768, 1024]]) {
      await page.setViewportSize({ width, height });
      await page.goto('/DaedalusX64/');

      const collapsedOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      expect(collapsedOverflow).toBe(false);

      const mobileToggle = page.locator('#mobile-toggle');
      await expect(mobileToggle).toBeVisible();
      await expect(mobileToggle).toHaveAttribute('aria-expanded', 'false');

      const toggleBox = await mobileToggle.boundingBox();
      expect(toggleBox.width).toBeGreaterThanOrEqual(44);
      expect(toggleBox.height).toBeGreaterThanOrEqual(44);

      // Secondary links collapse behind #mobile-toggle while persistent pills stay >=44px
      await expect(page.locator('#daedalus-menu-box a[href="#combiner-lab"]')).toBeHidden();

      // Open collapsible #daedalus-menu-box panel
      await mobileToggle.click();
      await expect(mobileToggle).toHaveAttribute('aria-expanded', 'true');

      const menuBox = page.locator('#daedalus-menu-box');
      await expect(menuBox).toHaveClass(/active/);
      await expect(menuBox).toHaveCSS('background-color', 'rgb(8, 12, 20)');
      await expect(menuBox.locator('a[href="#combiner-lab"]')).toBeVisible();
      await expect(menuBox.locator('a[href="/"]')).toBeVisible();

      for (const sel of ['#daedalus-menu-box a[href="#combiner-lab"]', '#daedalus-menu-box a[href="/"]', '#daedalus-menu-box .nav-pill--cta a']) {
        const itemBox = await page.locator(sel).boundingBox();
        expect(itemBox.height).toBeGreaterThanOrEqual(44);
      }

      const expandedOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      expect(expandedOverflow).toBe(false);

      // Move focus inside open menu, press Escape, and verify focus restores to #mobile-toggle
      await menuBox.locator('a[href="#combiner-lab"]').focus();
      await page.keyboard.press('Escape');
      await expect(mobileToggle).toHaveAttribute('aria-expanded', 'false');
      await expect(menuBox).not.toHaveClass(/active/);
      await expect(mobileToggle).toBeFocused();
    }

    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('Command Palette button in navbar opens #cmd-palette dialog cleanly and closes on Escape', async ({ page }) => {
    const { consoleErrors, pageErrors } = collectRuntimeErrors(page);

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/DaedalusX64/');

    await page.locator('#site-header [data-open-command-palette]').click();
    const palette = page.locator('#cmd-palette');
    await expect(palette).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(palette).toBeHidden();

    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('cross-route navigation via relative .sys-logo transitions cleanly from /DaedalusX64/ to / without view-transition errors', async ({ page }) => {
    const { consoleErrors, pageErrors } = collectRuntimeErrors(page);

    await page.route('https://api.github.com/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await page.route('/api/telemetry', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{"colo":"DFW"}' }));

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/DaedalusX64/');

    await page.locator('#site-header a.sys-logo[href="/"]').click();
    await expect(page).toHaveURL(/\/(index\.html)?$/);
    await expect(page.locator('#hero')).toBeVisible();

    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('cross-route navigation via navbar Contact CTA transitions cleanly from /DaedalusX64/ to /#contact without view-transition errors', async ({ page }) => {
    const { consoleErrors, pageErrors } = collectRuntimeErrors(page);

    await page.route('https://api.github.com/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await page.route('/api/telemetry', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{"colo":"DFW"}' }));

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/DaedalusX64/');

    await page.locator('#site-header .nav-pill--cta a[href="/#contact"]').click();
    await expect(page).toHaveURL(/\/#contact$/);
    await expect(page.locator('#contact-form')).toBeVisible();

    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });
});
