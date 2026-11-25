const { test, expect } = require('@playwright/test');

const EXPECTED_TITLE = 'Hugo Luna | Systems & Security Architect · Irving & DFW, TX';
const EXPECTED_DESCRIPTION =
  'Eliminate network downtime and hardware bottlenecks. Zero-downtime business networks, 24h stress-tested custom workstations, and Irving/DFW IT consulting.';
const EXPECTED_CANONICAL_URL = 'https://daca.me/';

test.describe('Google SERP Metadata, Canonical/Social Parity & WebMCP Integration', () => {
  test('serves refreshed <title>, <meta name="description">, canonical, and OG/Twitter parity with zero console or page errors', async ({ page }) => {
    const consoleErrors = [];
    const pageErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !msg.text().includes('speculation rules')) {
        consoleErrors.push(msg.text());
      }
    });
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.route('https://api.github.com/**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    );
    await page.route('/api/telemetry', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{"colo":"DFW"}' })
    );

    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });

    const liveTitle = await page.title();
    expect(liveTitle).toBe(EXPECTED_TITLE);
    expect(liveTitle.length).toBe(59);
    expect(liveTitle.length).toBeLessThanOrEqual(60);

    const metaDescription = await page.locator('head meta[name="description"]').getAttribute('content');
    expect(metaDescription).toBe(EXPECTED_DESCRIPTION);
    expect(metaDescription.length).toBe(154);
    expect(metaDescription.length).toBeGreaterThanOrEqual(120);
    expect(metaDescription.length).toBeLessThanOrEqual(160);

    await expect(page.locator('head link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute('href', EXPECTED_CANONICAL_URL);

    await expect(page.locator('head meta[property="og:title"]')).toHaveAttribute('content', EXPECTED_TITLE);
    await expect(page.locator('head meta[property="og:description"]')).toHaveAttribute('content', EXPECTED_DESCRIPTION);
    await expect(page.locator('head meta[property="og:type"]')).toHaveAttribute('content', 'website');
    await expect(page.locator('head meta[property="og:url"]')).toHaveAttribute('content', EXPECTED_CANONICAL_URL);

    await expect(page.locator('head meta[name="twitter:card"]')).toHaveAttribute('content', 'summary');
    await expect(page.locator('head meta[name="twitter:title"]')).toHaveAttribute('content', EXPECTED_TITLE);
    await expect(page.locator('head meta[name="twitter:description"]')).toHaveAttribute('content', EXPECTED_DESCRIPTION);

    // Discovery links & structured data remain intact
    await expect(page.locator('head link[rel="alternate"][type="application/ld+json"]')).toHaveAttribute('href', '/schema.jsonld');
    await expect(page.locator('head link[rel="mcp"]')).toHaveAttribute('href', '/mcp');

    const graphTypes = await page.evaluate(() => {
      const ldEl = document.querySelector('head script[type="application/ld+json"]');
      if (!ldEl) return null;
      const parsed = JSON.parse(ldEl.textContent);
      return Array.isArray(parsed['@graph']) ? parsed['@graph'].map((n) => n['@type']) : null;
    });
    expect(graphTypes).toEqual(['Person', 'ProfessionalService']);

    // Single main <h1> aligns with SERP description hook
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.locator('main h1')).toHaveText('Eliminate Network Downtime & Hardware Bottlenecks.');

    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('registers and executes WebMCP get_portfolio_info in live Chromium returning refreshed document.title', async ({ page }) => {
    const consoleErrors = [];
    const pageErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !msg.text().includes('speculation rules')) {
        consoleErrors.push(msg.text());
      }
    });
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.addInitScript(() => {
      const registered = new Map();
      Object.defineProperty(document, 'modelContext', {
        configurable: true,
        value: {
          registerTool(toolDef) {
            registered.set(toolDef.name, toolDef);
          }
        }
      });
      window.__webMcpRegistry = registered;
    });

    await page.route('https://api.github.com/**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    );
    await page.route('/api/telemetry', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{"colo":"DFW"}' })
    );

    await page.goto('/index.html', { waitUntil: 'networkidle' });

    await expect
      .poll(async () => {
        return page.evaluate(() => window.__webMcpRegistry && window.__webMcpRegistry.has('get_portfolio_info'));
      })
      .toBe(true);

    const toolOutput = await page.evaluate(() => {
      const tool = window.__webMcpRegistry.get('get_portfolio_info');
      return {
        annotations: tool.annotations,
        payload: tool.execute()
      };
    });

    expect(toolOutput.annotations).toEqual({ readOnlyHint: true });
    expect(toolOutput.payload.title).toBe(EXPECTED_TITLE);
    expect(toolOutput.payload.url).toContain('/index.html');
    expect(toolOutput.payload.architect).toBe('Hugo Luna');
    expect(toolOutput.payload.location).toBe('Irving / Dallas-Fort Worth, TX');
    expect(toolOutput.payload.endpoints).toEqual({
      mcp_manifest: '/.well-known/mcp.json',
      llms_txt: '/llms.txt',
      schema_jsonld: '/schema.jsonld',
      support_booking: '/support/',
      daedalus_lab: '/DaedalusX64/'
    });

    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });
});
