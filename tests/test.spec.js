const { test, expect } = require('@playwright/test');

test('runPipelineTelemetry handles fetch error correctly', async ({ page }) => {
  // Intercept the fetch call and abort it to simulate a network error
  await page.route('https://api.github.com/repos/Shinydude100/Shinydude100.github.io/releases', route => route.abort());

  // Load the page
  await page.goto(`file://${__dirname}/../index.html`);

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
  await page.goto(`file://${__dirname}/../index.html`);

  // Verify the fallback text is set due to the timeout aborting the fetch
  const counter = page.locator('#download-counter');
  await expect(counter).toHaveText('LOCAL_SECURE_MIRROR', { timeout: 7000 });
});
