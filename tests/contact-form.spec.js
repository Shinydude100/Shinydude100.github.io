const { test, expect } = require('@playwright/test');

function attachErrorCollectors(page, { allowMockedHttpErrorStatuses = [] } = {}) {
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (text.includes('speculation rules')) return;
      const isExpectedHttpStatus = allowMockedHttpErrorStatuses.some((code) =>
        text.includes(`Failed to load resource: the server responded with a status of ${code}`)
      );
      if (!isExpectedHttpStatus) {
        consoleErrors.push(text);
      }
    }
  });
  page.on('pageerror', (err) => pageErrors.push(err.message));
  return { consoleErrors, pageErrors };
}

test.describe('Inline B2B Contact Form (toolname="contactForm") E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('https://api.github.com/**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    );
    await page.route('/api/telemetry', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{"colo":"DFW"}' })
    );
  });

  test('201 happy path submits JSON to /api/contact, announces confirmed ticket, and resets cleanly', async ({ page }) => {
    const { consoleErrors, pageErrors } = attachErrorCollectors(page);
    let capturedBody = null;

    await page.route('/api/contact', async (route) => {
      capturedBody = route.request().postDataJSON();
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          ticket: 'INQ-E2E90001',
          status: 'received'
        })
      });
    });

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/index.html');

    const form = page.locator('#contact-form');
    await form.scrollIntoViewIfNeeded();
    await expect(form).toBeVisible();
    await expect(form).toHaveAttribute('toolname', 'contactForm');

    // Verify >= 48px touch target height and >= 16px font size to prevent mobile auto-zoom
    const inputMetrics = await page.locator('#contact-name').evaluate((el) => {
      const style = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return {
        height: rect.height,
        fontSize: parseFloat(style.fontSize)
      };
    });
    expect(inputMetrics.height).toBeGreaterThanOrEqual(48);
    expect(inputMetrics.fontSize).toBeGreaterThanOrEqual(16);

    await page.fill('#contact-name', 'Morgan Vance');
    await page.fill('#contact-email', 'morgan@vancenetworks.io');
    await page.fill('#contact-organization', 'Vance Networks');
    await page.selectOption('#contact-inquiry-type', 'enterprise_network');
    await page.fill('#contact-message', 'Planning redundant dual-ISP BGP failover across three Dallas-Fort Worth facilities.');

    await page.click('#contact-submit-btn');

    expect(capturedBody).toEqual({
      name: 'Morgan Vance',
      email: 'morgan@vancenetworks.io',
      organization: 'Vance Networks',
      inquiry_type: 'enterprise_network',
      message: 'Planning redundant dual-ISP BGP failover across three Dallas-Fort Worth facilities.',
      website: ''
    });

    await expect(form).toBeHidden();
    const successBox = page.locator('#contact-success');
    await expect(successBox).toBeVisible();
    await expect(page.locator('#contact-success-ticket')).toHaveText('Ticket ID: INQ-E2E90001');

    // Direct contact & Channel 02 DFW support remain visible alongside confirmation
    await expect(page.locator('#contact-email-code')).toBeVisible();
    await expect(page.locator('#contact .support-channel a[href="/support/#book"]')).toBeVisible();

    // Reset restores form
    await page.click('#contact-reset-btn');
    await expect(form).toBeVisible();
    await expect(successBox).toBeHidden();

    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('404 static-Pages response gracefully reveals pre-filled mailto fallback and re-enables submit button', async ({ page }) => {
    const { consoleErrors, pageErrors } = attachErrorCollectors(page, { allowMockedHttpErrorStatuses: [404] });

    await page.route('/api/contact', (route) =>
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Not Found' })
      })
    );

    await page.goto('/index.html');
    await page.locator('#contact-form').scrollIntoViewIfNeeded();

    await page.fill('#contact-name', 'Claire Bennett');
    await page.fill('#contact-email', 'claire@studioforge.com');
    await page.fill('#contact-organization', 'Studio Forge');
    await page.selectOption('#contact-inquiry-type', 'workstation_ai_build');
    await page.fill('#contact-message', 'Need custom liquid-quiet CAD and local AI render workstations in Irving.');

    await page.click('#contact-submit-btn');

    const feedback = page.locator('#contact-feedback');
    const mailtoFallback = page.locator('#contact-mailto-fallback');
    const submitBtn = page.locator('#contact-submit-btn');

    await expect(feedback).toBeVisible();
    await expect(mailtoFallback).toBeVisible();
    await expect(submitBtn).toBeEnabled();

    const href = await mailtoFallback.getAttribute('href');
    expect(href).toContain('mailto:hugo.luna.sec@gmail.com?subject=');
    expect(decodeURIComponent(href)).toContain('Claire Bennett');
    expect(decodeURIComponent(href)).toContain('Studio Forge');
    expect(decodeURIComponent(href)).toContain('Need custom liquid-quiet CAD');

    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('post-interaction client validation syncs :user-invalid, aria-invalid, and aria-describedby without premature errors', async ({ page }) => {
    const { consoleErrors, pageErrors } = attachErrorCollectors(page);
    await page.goto('/index.html');
    await page.locator('#contact-form').scrollIntoViewIfNeeded();

    const emailInput = page.locator('#contact-email');
    const emailError = page.locator('#contact-email-error');

    await expect(emailInput).toHaveAttribute('aria-invalid', 'false');
    await expect(emailError).toBeHidden();

    // Type invalid email and tab out to trigger blur / :user-invalid
    await emailInput.fill('invalid-email');
    await page.locator('#contact-organization').focus();

    await expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    await expect(emailInput).toHaveAttribute('aria-describedby', 'contact-email-hint contact-email-error');
    await expect(emailError).toBeVisible();

    // Correct email and confirm error clears immediately
    await emailInput.fill('architect@company.com');
    await expect(emailInput).toHaveAttribute('aria-invalid', 'false');
    await expect(emailInput).toHaveAttribute('aria-describedby', 'contact-email-hint');
    await expect(emailError).toBeHidden();

    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('WebMCP SubmitEvent agentInvoked + respondWith resolves confirmed and fallback_required payloads', async ({ page }) => {
    const { consoleErrors, pageErrors } = attachErrorCollectors(page, { allowMockedHttpErrorStatuses: [503] });

    let shouldFail = false;
    await page.route('/api/contact', async (route) => {
      if (shouldFail) {
        await route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, error: 'Inquiry datastore unavailable' })
        });
        return;
      }
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, ticket: 'INQ-MCP88421', status: 'received' })
      });
    });

    await page.goto('/index.html');
    await page.locator('#contact-form').scrollIntoViewIfNeeded();

    const confirmedPayload = await page.evaluate(async () => {
      document.getElementById('contact-name').value = 'Agent Caller';
      document.getElementById('contact-email').value = 'agent@mcp.example';
      document.getElementById('contact-inquiry-type').value = 'cloudflare_mcp';
      document.getElementById('contact-message').value = 'Automated WebMCP consulting inquiry with human review.';

      let responsePromise = null;
      const ev = new SubmitEvent('submit', { bubbles: true, cancelable: true });
      Object.defineProperty(ev, 'agentInvoked', { value: true });
      ev.respondWith = (p) => { responsePromise = p; };
      document.getElementById('contact-form').dispatchEvent(ev);
      return await responsePromise;
    });

    expect(confirmedPayload).toEqual({
      status: 'confirmed',
      ticket: 'INQ-MCP88421',
      inquiry_type: 'cloudflare_mcp'
    });

    await page.click('#contact-reset-btn');
    shouldFail = true;

    const fallbackPayload = await page.evaluate(async () => {
      document.getElementById('contact-name').value = 'Agent Caller';
      document.getElementById('contact-email').value = 'agent@mcp.example';
      document.getElementById('contact-inquiry-type').value = 'leadership_hiring';
      document.getElementById('contact-message').value = 'Director of Systems & Security Engineering opportunity.';

      let responsePromise = null;
      const ev = new SubmitEvent('submit', { bubbles: true, cancelable: true });
      Object.defineProperty(ev, 'agentInvoked', { value: true });
      ev.respondWith = (p) => { responsePromise = p; };
      document.getElementById('contact-form').dispatchEvent(ev);
      return await responsePromise;
    });

    expect(fallbackPayload).toEqual({
      status: 'fallback_required',
      error: 'Inquiry datastore unavailable',
      fallback_email: 'hugo.luna.sec@gmail.com'
    });

    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('maintains zero horizontal overflow across 375x812, 768x1024, 1280x800, and 1440x900 viewports with zero CSP errors', async ({ page }) => {
    const { consoleErrors, pageErrors } = attachErrorCollectors(page, { allowMockedHttpErrorStatuses: [404] });
    await page.route('/api/contact', (route) =>
      route.fulfill({ status: 404, contentType: 'application/json', body: '{"error":"Not Found"}' })
    );

    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/index.html');
    await page.locator('#contact-form').scrollIntoViewIfNeeded();

    // Trigger fallback UI at 375px to ensure fallback banner + buttons also never overflow
    await page.fill('#contact-name', 'Mobile Lead');
    await page.fill('#contact-email', 'lead@mobiletest.com');
    await page.selectOption('#contact-inquiry-type', 'general_consulting');
    await page.fill('#contact-message', 'Testing mobile 375px layout resilience with fallback banner active.');
    await page.click('#contact-submit-btn');
    await expect(page.locator('#contact-mailto-fallback')).toBeVisible();

    for (const [width, height] of [[375, 812], [768, 1024], [1280, 800], [1440, 900]]) {
      await page.setViewportSize({ width, height });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth
      );
      expect(overflow).toBe(false);
    }

    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });
});
