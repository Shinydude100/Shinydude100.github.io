const { test, expect } = require('@playwright/test');

test('runPipelineTelemetry handles fetch error correctly', async ({ page }) => {
  // Intercept the fetch call and abort it to simulate a network error
  await page.route('https://api.github.com/repos/Shinydude100/Shinydude100.github.io/releases', route => route.abort());

  // Load the page
  await page.goto(`/index.html`);

  // Verify the fallback text is set
  const counter = page.locator('#download-counter');
  await expect(counter).toHaveText('LOCAL_SECURE_MIRROR', { timeout: 5000 });
});

test('runPipelineTelemetry handles timeout correctly', async ({ page }) => {
  // Let the route hang indefinitely without fulfilling so the frontend timeout takes over
  await page.route('https://api.github.com/repos/Shinydude100/Shinydude100.github.io/releases', async route => {
    // Intentionally do nothing to simulate a hanging connection
  });

  // Load the page
  await page.goto(`/index.html`);

  // Verify the fallback text is set due to the timeout aborting the fetch
  const counter = page.locator('#download-counter');
  await expect(counter).toHaveText('LOCAL_SECURE_MIRROR', { timeout: 7000 });
});

test('runPipelineTelemetry handles invalid JSON payload structure correctly', async ({ page }) => {
  // Mock the response with invalid JSON structure (not an array)
  await page.route('https://api.github.com/repos/Shinydude100/Shinydude100.github.io/releases', route => {
    route.fulfill({ status: 200, contentType: 'application/json', body: '{"invalid": "payload"}' });
  });

  // Load the page
  await page.goto(`/index.html`);

  // Verify the fallback text is set due to the payload structure error
  const counter = page.locator('#download-counter');
  await expect(counter).toHaveText('LOCAL_SECURE_MIRROR', { timeout: 5000 });
});

test('Clickable Node Inspector <dialog> opens from cards/buttons, switches nodes, keeps links independent, and closes cleanly', async ({ page }) => {
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const txt = msg.text();
      if (!txt.includes('speculation rules')) {
        consoleErrors.push(txt);
      }
    }
  });
  page.on('pageerror', (err) => pageErrors.push(err.message));

  await page.route('https://api.github.com/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  await page.route('/api/telemetry', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{"colo":"DFW"}' }));

  await page.goto('/index.html');

  const dialog = page.locator('#node-inspector-dialog');
  await expect(dialog).not.toHaveAttribute('open', '');

  // Ensure card link stays independent and points to /DaedalusX64/
  const exploreLink = page.locator('[data-node-id="node-02"] a.sys-badge[href="/DaedalusX64/"]');
  await expect(exploreLink).toBeVisible();

  // Open NODE-02 via declarative Inspect button
  await page.locator('[data-inspect-node="node-02"]').click();
  await expect(dialog).toBeVisible();
  await expect(page.locator('#node-inspector-code')).toHaveText('NODE-02 // MIPS_VFPU');
  await expect(page.locator('#node-inspector-cta')).toHaveAttribute('href', '/DaedalusX64/#combiner-lab');

  // Switch nodes via pill and Next/Prev controls
  await page.locator('[data-switch-node="node-rx2"]').click();
  await expect(page.locator('#node-inspector-code')).toHaveText('NODE-RX2 // EDGE_KVM');
  await expect(page.locator('#node-inspector-index')).toHaveText('05 / 05');

  await page.locator('#node-inspector-prev').click();
  await expect(page.locator('#node-inspector-code')).toHaveText('NODE-RX1 // STUDIO_PRO');
  await expect(page.locator('#node-inspector-index')).toHaveText('04 / 05');

  // Verify no horizontal overflow on desktop viewport
  const hasDesktopOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(hasDesktopOverflow).toBe(false);

  // Close via close button and verify focus returns cleanly
  await page.locator('#node-inspector-close').click();
  await expect(dialog).toBeHidden();

  // Clicking non-interactive card surface opens node-01 and Esc closes it
  await page.locator('[data-node-id="node-01"] .card-text').click();
  await expect(dialog).toBeVisible();
  await expect(page.locator('#node-inspector-code')).toHaveText('NODE-01 // CLUSTER_HA');
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();

  // Verify no horizontal overflow on mobile 375px viewport even with dialog open
  await page.setViewportSize({ width: 375, height: 812 });
  await page.locator('[data-inspect-node="node-03"]').click();
  await expect(dialog).toBeVisible();
  const hasMobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(hasMobileOverflow).toBe(false);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();

  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test('N64 Color Combiner Playground on /DaedalusX64/ simulates RDP->PSP GU blend math and updates C++ live', async ({ page }) => {
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => pageErrors.push(err.message));

  await page.goto('/DaedalusX64/');

  const lab = page.locator('#combiner-lab');
  await expect(lab).toBeVisible();

  // Verify non-empty rendered pixels on N64 Reference canvas
  const nonZeroPixels = await page.evaluate(() => {
    const canvas = document.getElementById('lab-canvas-n64');
    const ctx = canvas.getContext('2d');
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let count = 0;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] > 0) count++;
    }
    return count;
  });
  expect(nonZeroPixels).toBeGreaterThan(100);

  // Switch to Exhibit 3 (Alpha Exploration)
  await page.locator('[data-combiner-preset="alpha_explore"]').click();
  await expect(page.locator('#lab-cpp-output')).toContainText('SetAOpaque()');
  await expect(page.locator('#lab-diagnostic-msg')).toContainText('GU_TCC_RGBA');

  // Toggle GU_TCC_RGB and confirm C++ and parity telemetry update immediately
  await page.selectOption('#lab-gu-tcc', 'GU_TCC_RGB');
  await expect(page.locator('#lab-cpp-output')).toContainText('sceGuTexFunc( GU_TFX_BLEND, GU_TCC_RGB )');
  await expect(page.locator('#lab-tbl-alpha-note')).toHaveText('GU_TCC_RGB + SetAOpaque()');

  // Adjust PrimLODFrac range slider and verify custom CSS property sync
  await page.locator('#lab-prim-lod').fill('80');
  await expect(page.locator('#lab-prim-lod-val')).toHaveText('0.80');
  const controlVar = await page.locator('#lab-prim-lod').evaluate((el) => el.style.getPropertyValue('--control-value'));
  expect(controlVar).toBe('80');

  // Verify no horizontal overflow on desktop viewport
  const hasDesktopOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(hasDesktopOverflow).toBe(false);

  // Open Command Palette via Ctrl+K and filter for Combiner
  await page.keyboard.press('Control+k');
  const palette = page.locator('#cmd-palette');
  await expect(palette).toBeVisible();
  await page.locator('#cmd-palette-input').fill('Combiner');
  await expect(page.locator('#cmd-palette-list')).toContainText('Interactive N64 Combiner Playground');
  // Close via Escape (first Esc clears native <input type="search">, second Esc closes <dialog>)
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await expect(palette).toBeHidden();

  // Verify no horizontal overflow on mobile 375px viewport
  await page.setViewportSize({ width: 375, height: 812 });
  const hasMobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(hasMobileOverflow).toBe(false);

  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test('Phase 2 Bento layout hierarchy, single-row header, and Case Studies accordion work cleanly on desktop and mobile', async ({ page }) => {
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => pageErrors.push(err.message));

  await page.route('https://api.github.com/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  await page.route('/api/telemetry', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{"colo":"DFW"}' }));

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/index.html', { waitUntil: 'networkidle' });

  // Compact single-row desktop header
  const headerRect = await page.locator('#site-header').boundingBox();
  expect(headerRect.height).toBeLessThan(90);

  // Asymmetric 12-column Bento layout geometry in #services
  const node01Box = await page.locator('[data-node-id="node-01"]').boundingBox();
  const node03Box = await page.locator('[data-node-id="node-03"]').boundingBox();
  const node02Box = await page.locator('[data-node-id="node-02"]').boundingBox();

  expect(node01Box.width).toBeGreaterThan(node03Box.width);
  expect(Math.abs(node01Box.y - node03Box.y)).toBeLessThan(5);
  expect(node02Box.width).toBeGreaterThan(node01Box.width);
  expect(node02Box.y).toBeGreaterThan(node01Box.y + 50);

  // Case Studies Accordion Expand/Collapse All + individual toggle + CSS checks
  const toggleAllBtn = page.locator('#case-studies-toggle-all');
  const detailsItems = page.locator('#case-studies-list > details');
  await expect(detailsItems).toHaveCount(3);
  await expect(detailsItems.nth(0)).toHaveAttribute('open', '');
  await expect(toggleAllBtn).toHaveAttribute('aria-expanded', 'false');
  await expect(toggleAllBtn.locator('.expand')).toBeVisible();
  await expect(toggleAllBtn.locator('.collapse')).toBeHidden();

  await page.locator('#case-studies-list').scrollIntoViewIfNeeded();
  await expect(page.locator('#case-studies-list')).toHaveCSS('opacity', '1');

  const triageYDiff = await detailsItems.nth(0).locator('.cs-triage-grid').evaluate((grid) => {
    const tops = Array.from(grid.querySelectorAll(':scope > .cs-block')).map((el) => el.getBoundingClientRect().top);
    return Math.max(...tops) - Math.min(...tops);
  });
  expect(triageYDiff).toBeLessThan(5);

  await toggleAllBtn.click();
  await expect(toggleAllBtn).toHaveAttribute('aria-expanded', 'true');
  await expect(toggleAllBtn.locator('.expand')).toBeHidden();
  await expect(toggleAllBtn.locator('.collapse')).toBeVisible();
  for (let i = 0; i < 3; i++) {
    await expect(detailsItems.nth(i)).toHaveAttribute('open', '');
  }

  await toggleAllBtn.click();
  await expect(toggleAllBtn).toHaveAttribute('aria-expanded', 'false');
  for (let i = 0; i < 3; i++) {
    await expect(detailsItems.nth(i)).not.toHaveAttribute('open', '');
  }

  // Open individual Case Study 1 and verify Inspector launch button works
  await detailsItems.nth(0).locator('summary').click();
  await expect(detailsItems.nth(0)).toHaveAttribute('open', '');
  await detailsItems.nth(0).locator('[data-inspect-node="node-01"]').click();
  await expect(page.locator('#node-inspector-dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#node-inspector-dialog')).toBeHidden();

  const hasDesktopOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(hasDesktopOverflow).toBe(false);

  // Mobile stacking & zero horizontal overflow
  await page.setViewportSize({ width: 375, height: 812 });
  const mNode01 = await page.locator('[data-node-id="node-01"]').boundingBox();
  const mNode03 = await page.locator('[data-node-id="node-03"]').boundingBox();
  expect(mNode03.y).toBeGreaterThan(mNode01.y + 50);

  const hasMobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(hasMobileOverflow).toBe(false);

  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test('Marketing Audit Simplification: hero clarity, 2 CTAs, relocated Command Deck, and responsive navbar across 375/768/1280/1440px', async ({ page }) => {
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' && !msg.text().includes('speculation rules')) {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => pageErrors.push(err.message));

  await page.route('https://api.github.com/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  await page.route('/api/telemetry', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{"colo":"DFW","httpProtocol":"HTTP/3","tlsVersion":"TLSv1.3","ray":"TEST-RAY"}' }));

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/index.html', { waitUntil: 'networkidle' });

  // Verify Hero has exactly 2 CTA buttons and clean Problems I Solve panel
  const heroCtas = page.locator('#hero .btn-stack .btn-primitive');
  await expect(heroCtas).toHaveCount(2);
  await expect(heroCtas.nth(0)).toHaveText('Contact Hugo');
  await expect(heroCtas.nth(1)).toHaveText('Explore Architecture');
  await expect(page.locator('#hero .hero-solutions-panel')).toBeVisible();
  await expect(page.locator('#hero .hero-console-shell')).toHaveCount(0);

  // Verify DFW Support and Contact in navbar are distinct and non-overlapping on desktop
  const supportNavBox = await page.locator('#site-header .nav-pill--support a').boundingBox();
  const contactNavBox = await page.locator('#site-header .nav-pill--cta a').boundingBox();
  expect(supportNavBox.x + supportNavBox.width).toBeLessThan(contactNavBox.x);

  // Verify Open Terminal link points to relocated #command-deck and tabs + ping work
  const openTermLink = page.locator('#hero a.hero-terminal-link[href="#command-deck"]');
  await expect(openTermLink).toBeVisible();
  await openTermLink.click();

  const commandDeck = page.locator('#command-deck');
  await expect(commandDeck).toBeVisible();
  await page.locator('#tab-btn-mcp').click();
  await expect(page.locator('#panel-mcp')).toBeVisible();
  await page.locator('#tab-btn-topology').click();
  await page.locator('#hud-ping-btn').click();
  await expect(page.locator('#hud-ping-readout')).toContainText('PING_OK');

  // Verify zero horizontal overflow across all required breakpoints (1440px, 1280px, 768px, 375px)
  for (const [w, h] of [[1440, 900], [1280, 800], [768, 1024], [375, 812]]) {
    await page.setViewportSize({ width: w, height: h });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow).toBe(false);
  }

  // Verify mobile/tablet menu toggle opens cleanly at 768px and 375px and closes on Escape
  await page.setViewportSize({ width: 375, height: 812 });
  const mobileToggle = page.locator('#mobile-toggle');
  await expect(mobileToggle).toBeVisible();
  await mobileToggle.click();
  await expect(page.locator('#menu-box')).toBeVisible();
  await expect(page.locator('#menu-box a[href="/support/"]')).toBeVisible();
  await expect(page.locator('#menu-box a[href="#contact"]')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(mobileToggle).toHaveAttribute('aria-expanded', 'false');

  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});


