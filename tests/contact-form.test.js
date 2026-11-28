const fs = require('fs');
const path = require('path');
const { ReadableStream, WritableStream, TransformStream } = require('stream/web');
const { MessageChannel, MessagePort } = require('worker_threads');
const { Blob } = require('buffer');

if (typeof globalThis.ReadableStream === 'undefined') globalThis.ReadableStream = ReadableStream;
if (typeof globalThis.WritableStream === 'undefined') globalThis.WritableStream = WritableStream;
if (typeof globalThis.TransformStream === 'undefined') globalThis.TransformStream = TransformStream;
if (typeof globalThis.MessageChannel === 'undefined') globalThis.MessageChannel = MessageChannel;
if (typeof globalThis.MessagePort === 'undefined') globalThis.MessagePort = MessagePort;
if (typeof globalThis.Blob === 'undefined') globalThis.Blob = Blob;

const { Request: UndiciRequest, Response: UndiciResponse, Headers: UndiciHeaders } = require('undici');

if (typeof globalThis.Request === 'undefined') globalThis.Request = UndiciRequest;
if (typeof globalThis.Response === 'undefined') globalThis.Response = UndiciResponse;
if (typeof globalThis.Headers === 'undefined') globalThis.Headers = UndiciHeaders;

const {
  initContactForm,
  initWebMCP,
  initCopyButtons
} = require('../script.js');

const contactModule = require('../worker/contact.js');
const { handleContactRequest, resetRateLimitStore } = contactModule;

function createStatefulMockD1(options = {}) {
  const rows = [];
  const queries = [];
  return {
    rows,
    queries,
    prepare(sql) {
      queries.push(sql);
      return {
        bind(...params) {
          return {
            async run() {
              if (options.shouldThrow) {
                throw new Error('D1 connection lost');
              }
              rows.push({ sql, params });
              return { success: true, meta: { changes: 1, last_row_id: rows.length } };
            }
          };
        }
      };
    }
  };
}

function mountContactSectionFromIndex() {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  const contactSection = parsed.getElementById('contact');
  document.body.replaceChildren(contactSection);
  return { html, parsed, contactSection };
}

describe('PR #2 — Inline B2B Contact Form (toolname="contactForm") & Worker /api/contact', () => {
  beforeEach(() => {
    resetRateLimitStore();
    jest.restoreAllMocks();
    document.body.replaceChildren();
  });

  afterEach(() => {
    delete global.fetch;
    jest.useRealTimers();
  });

  describe('HTML, CSP Line-Separation Contract & CSS Architecture', () => {
    it('updates ONLY line 7 CSP form-action to self while keeping line 8 blank and lines 9-79 untouched', () => {
      const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
      const lines = html.split('\n');

      // Line 7 (index 6): strict CSP with form-action 'self'
      expect(lines[6]).toContain('<meta http-equiv="Content-Security-Policy"');
      expect(lines[6]).toContain("form-action 'self';");
      expect(lines[6]).not.toContain("form-action 'none'");
      expect(lines[6]).toContain("script-src 'self'");
      expect(lines[6]).toContain("style-src 'self';");
      expect(lines[6]).not.toContain("'unsafe-inline'");

      // Line 8 (index 7): frozen blank separator line for zero-conflict merge with PR #3
      expect(lines[7]).toBe('');

      // Lines 9-20 (indices 8-19): preserved post-PR-#105 SERP SEO, canonical/OG & MCP discovery tags
      expect(lines[8]).toBe('<title>Hugo Luna | Systems &amp; Security Architect · Irving &amp; DFW, TX</title>');
      expect(lines[9]).toBe('<meta name="description" content="Eliminate network downtime and hardware bottlenecks. Zero-downtime business networks, 24h stress-tested custom workstations, and Irving/DFW IT consulting.">');
      expect(lines[10]).toBe('<link rel="canonical" href="https://daca.me/">');
      expect(lines[18]).toBe('<link rel="alternate" type="application/ld+json" href="/schema.jsonld">');
      expect(lines[19]).toBe('<link rel="mcp" href="/mcp">');

      // Zero inline styles or inline event handlers
      expect(html).not.toMatch(/<style\b/i);
      expect(html).not.toMatch(/\sstyle="/i);
      expect(html).not.toMatch(/\son(click|load|error|mouseover|submit)=/i);
    });

    it('declares accessible WebMCP <form toolname="contactForm"> and preserves direct channels & 2 Hero CTAs', () => {
      const { parsed } = mountContactSectionFromIndex();
      const form = document.getElementById('contact-form');

      expect(form).not.toBeNull();
      expect(form.getAttribute('method')).toBe('POST');
      expect(form.getAttribute('action')).toBe('/api/contact');
      expect(form.getAttribute('toolname')).toBe('contactForm');
      expect(form.getAttribute('tooldescription')).toMatch(/consulting|workstation|Cloudflare|leadership/i);
      expect(form.hasAttribute('toolautosubmit')).toBe(false);
      expect(form.getAttribute('aria-labelledby')).toBe('contact-form-heading');

      // Named schema controls
      const nameInput = form.querySelector('input[name="name"]');
      const emailInput = form.querySelector('input[name="email"]');
      const orgInput = form.querySelector('input[name="organization"]');
      const topicSelect = form.querySelector('select[name="inquiry_type"]');
      const msgTextarea = form.querySelector('textarea[name="message"]');
      const honeypot = form.querySelector('input[name="website"]');

      expect(nameInput.required).toBe(true);
      expect(emailInput.type).toBe('email');
      expect(emailInput.required).toBe(true);
      expect(emailInput.getAttribute('aria-describedby')).toBe('contact-email-hint');
      expect(orgInput.required).toBe(false);
      expect(topicSelect.required).toBe(true);
      expect(msgTextarea.required).toBe(true);
      expect(msgTextarea.getAttribute('aria-describedby')).toBe('contact-message-hint');

      const optionValues = Array.from(topicSelect.querySelectorAll('option'))
        .map((o) => o.value)
        .filter(Boolean);
      expect(optionValues).toEqual([
        'enterprise_network',
        'workstation_ai_build',
        'cloudflare_mcp',
        'leadership_hiring',
        'general_consulting'
      ]);

      // Visually-hidden honeypot
      expect(honeypot).not.toBeNull();
      expect(honeypot.getAttribute('tabindex')).toBe('-1');
      expect(honeypot.getAttribute('toolparamdescription')).toContain('Anti-spam honeypot');
      expect(honeypot.closest('.visually-hidden').getAttribute('aria-hidden')).toBe('true');

      // Preserved Direct Channels, Channel 02 DFW Support & 2 Hero CTAs
      expect(document.getElementById('contact-email-code').textContent).toBe('hugo.luna.sec@gmail.com');
      expect(document.querySelector('button[command="--copy"][commandfor="contact-email-code"]')).not.toBeNull();
      expect(document.querySelector('#contact a[href="./Hugo Luna Resume 2027.pdf"]')).not.toBeNull();
      expect(document.querySelector('#contact a[href*="linkedin.com/in/hugoaluna"]')).not.toBeNull();
      expect(document.querySelector('#contact .support-channel a[href="/support/#book"]')).not.toBeNull();
      expect(parsed.querySelectorAll('#hero .btn-stack .btn-primitive')).toHaveLength(2);
    });

    it('includes :user-invalid, field-sizing: content, WebMCP pseudo-classes, >=48px targets, and forced-colors in assets/home.css', () => {
      const css = fs.readFileSync(path.join(__dirname, '..', 'assets/home.css'), 'utf8');
      expect(css).toContain(':user-invalid');
      expect(css).toContain('field-sizing: content');
      expect(css).toContain('form:tool-form-active');
      expect(css).toContain('button:tool-submit-active');
      expect(css).toContain('min-block-size: 48px');
      expect(css).toContain('font-size: max(1rem, 1em)');
      expect(css).toContain('@media (forced-colors: active)');
    });
  });

  describe('script.js initContactForm() Client Validation, WebMCP respondWith & Fallback', () => {
    it('defers aria-invalid and aria-describedby error linking until after field interaction and clears on valid input', () => {
      mountContactSectionFromIndex();
      initContactForm();

      const emailInput = document.getElementById('contact-email');
      expect(emailInput.getAttribute('aria-invalid')).toBe('false');
      expect(emailInput.getAttribute('aria-describedby')).toBe('contact-email-hint');

      // Typing partial email without blurring does not prematurely mark invalid
      emailInput.value = 'alex@invalid';
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));
      expect(emailInput.getAttribute('aria-invalid')).toBe('false');

      // Blurring after editing marks aria-invalid="true" and appends error id after hint
      emailInput.dispatchEvent(new Event('blur'));
      expect(emailInput.getAttribute('aria-invalid')).toBe('true');
      expect(emailInput.getAttribute('aria-describedby')).toBe('contact-email-hint contact-email-error');

      // Fixing value on input immediately clears error state while keeping format hint
      emailInput.value = 'alex@enterprise.io';
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));
      expect(emailInput.getAttribute('aria-invalid')).toBe('false');
      expect(emailInput.getAttribute('aria-describedby')).toBe('contact-email-hint');
    });

    it('blocks invalid submission without calling fetch and resolves WebMCP respondWith validation_error', async () => {
      mountContactSectionFromIndex();
      initContactForm();

      global.fetch = jest.fn();
      const form = document.getElementById('contact-form');
      let capturedPromise = null;

      const submitEv = new Event('submit', { bubbles: true, cancelable: true });
      submitEv.agentInvoked = true;
      submitEv.respondWith = jest.fn((p) => { capturedPromise = p; });

      form.dispatchEvent(submitEv);

      expect(submitEv.defaultPrevented).toBe(true);
      expect(global.fetch).not.toHaveBeenCalled();
      expect(document.getElementById('contact-name').getAttribute('aria-invalid')).toBe('true');
      expect(document.getElementById('contact-feedback').hidden).toBe(false);
      expect(submitEv.respondWith).toHaveBeenCalledTimes(1);

      const agentResult = await capturedPromise;
      expect(agentResult.status).toBe('validation_error');
      expect(agentResult.fields).toEqual(['name', 'email', 'inquiry_type', 'message']);
    });

    it('confirms 201 inquiry with ticket status banner, resolves WebMCP respondWith, and supports form reset', async () => {
      mountContactSectionFromIndex();
      initContactForm();

      global.fetch = jest.fn(() => Promise.resolve({
        status: 201,
        ok: true,
        json: () => Promise.resolve({ success: true, ticket: 'INQ-7F3A91BC', status: 'received' })
      }));

      document.getElementById('contact-name').value = 'Jordan Vance';
      document.getElementById('contact-email').value = 'jordan@vancecloud.com';
      document.getElementById('contact-organization').value = 'Vance Cloud Labs';
      document.getElementById('contact-inquiry-type').value = 'cloudflare_mcp';
      document.getElementById('contact-message').value = 'We need a production Cloudflare Edge MCP deployment across 4 regions.';

      const form = document.getElementById('contact-form');
      let capturedPromise = null;
      const submitEv = new Event('submit', { bubbles: true, cancelable: true });
      submitEv.agentInvoked = true;
      submitEv.respondWith = jest.fn((p) => { capturedPromise = p; });

      form.dispatchEvent(submitEv);
      const outcome = await capturedPromise;

      expect(outcome).toEqual({
        status: 'confirmed',
        ticket: 'INQ-7F3A91BC',
        inquiry_type: 'cloudflare_mcp'
      });

      const successBox = document.getElementById('contact-success');
      expect(form.hidden).toBe(true);
      expect(successBox.hidden).toBe(false);
      expect(successBox.getAttribute('role')).toBe('status');
      expect(successBox.getAttribute('aria-live')).toBe('polite');
      expect(document.getElementById('contact-success-ticket').textContent).toContain('INQ-7F3A91BC');

      // Reset restores form cleanly
      document.getElementById('contact-reset-btn').click();
      expect(form.hidden).toBe(false);
      expect(successBox.hidden).toBe(true);
    });

    it('displays non-destructive pre-filled mailto fallback on 404 or 10000ms timeout and resolves fallback_required', async () => {
      jest.useFakeTimers();
      mountContactSectionFromIndex();
      initContactForm();
      initCopyButtons();

      // 1. Test 404 response (static GitHub Pages prior to Worker deployment)
      global.fetch = jest.fn(() => Promise.resolve({
        status: 404,
        ok: false,
        json: () => Promise.resolve({ error: 'Not Found' })
      }));

      document.getElementById('contact-name').value = 'Elena Rostova';
      document.getElementById('contact-email').value = 'elena@studio8k.io';
      document.getElementById('contact-organization').value = 'Studio 8K';
      document.getElementById('contact-inquiry-type').value = 'workstation_ai_build';
      document.getElementById('contact-message').value = 'Looking to deploy three Threadripper Pro CAD & local LLM workstations.';

      const form = document.getElementById('contact-form');
      const submitBtn = document.getElementById('contact-submit-btn');
      let promise404 = null;

      const ev404 = new Event('submit', { bubbles: true, cancelable: true });
      ev404.agentInvoked = true;
      ev404.respondWith = jest.fn((p) => { promise404 = p; });
      form.dispatchEvent(ev404);

      const res404 = await promise404;
      expect(res404).toEqual({
        status: 'fallback_required',
        error: 'HTTP 404',
        fallback_email: 'hugo.luna.sec@gmail.com'
      });
      expect(submitBtn.disabled).toBe(false);

      const mailtoLink = document.getElementById('contact-mailto-fallback');
      expect(document.getElementById('contact-feedback').hidden).toBe(false);
      expect(mailtoLink.hidden).toBe(false);
      expect(mailtoLink.getAttribute('href')).toMatch(/^mailto:hugo\.luna\.sec@gmail\.com\?subject=.*Elena%20Rostova.*&body=.*Threadripper/i);

      // 2. Test 10000ms AbortController timeout
      global.fetch = jest.fn((_url, opts) => new Promise((_resolve, reject) => {
        opts.signal.addEventListener('abort', () => {
          const abortErr = new Error('Aborted');
          abortErr.name = 'AbortError';
          reject(abortErr);
        });
      }));

      let promiseTimeout = null;
      const evTimeout = new Event('submit', { bubbles: true, cancelable: true });
      evTimeout.agentInvoked = true;
      evTimeout.respondWith = jest.fn((p) => { promiseTimeout = p; });
      form.dispatchEvent(evTimeout);

      jest.advanceTimersByTime(10000);
      const resTimeout = await promiseTimeout;

      expect(resTimeout).toEqual({
        status: 'fallback_required',
        error: 'Request timed out after 10s',
        fallback_email: 'hugo.luna.sec@gmail.com'
      });
      expect(submitBtn.disabled).toBe(false);
    });

    it('preserves existing imperative WebMCP read-only tools in initWebMCP()', () => {
      jest.useFakeTimers();
      const registered = [];
      document.modelContext = {
        registerTool: jest.fn((def) => registered.push(def.name))
      };
      delete window.requestIdleCallback;

      initWebMCP();
      jest.runAllTimers();

      expect(registered).toEqual(['get_portfolio_info', 'get_services_and_pricing']);
      delete document.modelContext;
    });
  });

  describe('worker/contact.js, D1 Migration & wrangler.toml Edge Contract', () => {
    const validBody = {
      name: 'Marcus Sterling',
      email: 'MARCUS@STERLINGNET.COM',
      organization: 'Sterling Enterprise Infra',
      inquiry_type: 'enterprise_network',
      message: 'Multi-site dual-WAN BGP failover and 802.1Q segmentation across 4 DFW offices.',
      website: ''
    };

    it('exports handleContactRequest, resetRateLimitStore, and default.fetch', () => {
      expect(typeof handleContactRequest).toBe('function');
      expect(typeof resetRateLimitStore).toBe('function');
      expect(contactModule.default).toBeDefined();
      expect(contactModule.default.fetch).toBe(handleContactRequest);
    });

    it('handles OPTIONS preflight (204) and rejects unsupported methods with 405 + Allow: POST, OPTIONS', async () => {
      const optRes = await handleContactRequest(
        new Request('https://daca.me/api/contact', { method: 'OPTIONS' }),
        {}
      );
      expect(optRes.status).toBe(204);
      expect(optRes.headers.get('allow')).toBe('POST, OPTIONS');
      expect(optRes.headers.get('strict-transport-security')).toContain('max-age=31536000');
      expect(optRes.headers.get('x-content-type-options')).toBe('nosniff');
      expect(optRes.headers.get('x-frame-options')).toBe('DENY');
      expect(optRes.headers.get('referrer-policy')).toBe('no-referrer');

      const getRes = await handleContactRequest(
        new Request('https://daca.me/api/contact', { method: 'GET' }),
        {}
      );
      expect(getRes.status).toBe(405);
      expect(getRes.headers.get('allow')).toBe('POST, OPTIONS');
      expect(await getRes.json()).toEqual({ success: false, error: 'Method not allowed' });
    });

    it('enforces field length, email format, and inquiry_type enum validation with 400 Bad Request', async () => {
      const db = createStatefulMockD1();

      const badPayload = {
        name: ' A ',
        email: 'not-an-email',
        organization: 'X'.repeat(161),
        inquiry_type: 'unknown_category',
        message: 'Too short'
      };

      const res = await handleContactRequest(
        new Request('https://daca.me/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '198.51.100.11' },
          body: JSON.stringify(badPayload)
        }),
        { DB: db }
      );

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.fields).toEqual(['name', 'email', 'organization', 'inquiry_type', 'message']);
      expect(db.rows).toHaveLength(0);

      const malformedRes = await handleContactRequest(
        new Request('https://daca.me/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '198.51.100.12' },
          body: '{broken-json'
        }),
        { DB: db }
      );
      expect(malformedRes.status).toBe(400);
    });

    it('silently traps non-empty honeypot website with 200 OK without inserting into D1', async () => {
      const db = createStatefulMockD1();
      const res = await handleContactRequest(
        new Request('https://daca.me/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '198.51.100.20' },
          body: JSON.stringify({ ...validBody, website: 'https://spam-directory.biz' })
        }),
        { DB: db }
      );

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.status).toBe('received');
      expect(data.ticket).toMatch(/^INQ-[0-9A-F]{8}$/);
      expect(db.rows).toHaveLength(0);
    });

    it('persists valid inquiries via parameterized D1 bind() and returns 201 Created + Sentinel headers', async () => {
      const db = createStatefulMockD1();
      const res = await handleContactRequest(
        new Request('https://daca.me/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'CF-Connecting-IP': '198.51.100.30',
            'User-Agent': 'EnterpriseClient/1.0'
          },
          body: JSON.stringify(validBody)
        }),
        { DB: db }
      );

      expect(res.status).toBe(201);
      expect(res.headers.get('x-content-type-options')).toBe('nosniff');
      expect(res.headers.get('x-frame-options')).toBe('DENY');
      expect(res.headers.get('referrer-policy')).toBe('no-referrer');
      expect(res.headers.get('strict-transport-security')).toContain('max-age=31536000');

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.status).toBe('received');
      expect(data.ticket).toMatch(/^INQ-[0-9A-F]{8}$/);

      expect(db.rows).toHaveLength(1);
      const inserted = db.rows[0];
      expect(inserted.sql).toContain('INSERT INTO contact_inquiries');
      expect(inserted.sql).toContain('VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
      expect(inserted.params[0]).toBe(data.ticket);
      expect(inserted.params[1]).toBe('Marcus Sterling');
      expect(inserted.params[2]).toBe('marcus@sterlingnet.com');
      expect(inserted.params[3]).toBe('Sterling Enterprise Infra');
      expect(inserted.params[4]).toBe('enterprise_network');
      expect(inserted.params[8]).toBe('new');
    });

    it('returns 503 Service Unavailable when env.DB is missing or D1 throws', async () => {
      const missingRes = await handleContactRequest(
        new Request('https://daca.me/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '198.51.100.40' },
          body: JSON.stringify(validBody)
        }),
        {}
      );
      expect(missingRes.status).toBe(503);
      expect(await missingRes.json()).toEqual({
        success: false,
        error: 'Inquiry datastore unavailable'
      });

      const failingDb = createStatefulMockD1({ shouldThrow: true });
      const throwRes = await handleContactRequest(
        new Request('https://daca.me/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '198.51.100.41' },
          body: JSON.stringify(validBody)
        }),
        { DB: failingDb }
      );
      expect(throwRes.status).toBe(503);
      expect(await throwRes.json()).toEqual({
        success: false,
        error: 'Inquiry datastore unavailable'
      });
    });

    it('enforces per-IP rate limiting (429) and resets cleanly via resetRateLimitStore()', async () => {
      const db = createStatefulMockD1();
      const makeReq = (ip) =>
        new Request('https://daca.me/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': ip },
          body: JSON.stringify(validBody)
        });

      for (let i = 0; i < 5; i++) {
        const okRes = await handleContactRequest(makeReq('203.0.113.77'), { DB: db });
        expect(okRes.status).toBe(201);
      }

      const blockedRes = await handleContactRequest(makeReq('203.0.113.77'), { DB: db });
      expect(blockedRes.status).toBe(429);
      expect(await blockedRes.json()).toEqual({
        success: false,
        error: 'Rate limit exceeded. Please try again shortly.'
      });

      // Distinct IP remains unaffected
      const otherIpRes = await handleContactRequest(makeReq('203.0.113.88'), { DB: db });
      expect(otherIpRes.status).toBe(201);

      // Reset clears store
      resetRateLimitStore();
      const afterResetRes = await handleContactRequest(makeReq('203.0.113.77'), { DB: db });
      expect(afterResetRes.status).toBe(201);
    });

    it('aligns D1 SQL schema, worker/index.ts delegation, and wrangler.toml configuration', () => {
      const sql = fs.readFileSync(
        path.join(__dirname, '..', 'worker/migrations/0001_contact_inquiries.sql'),
        'utf8'
      );
      expect(sql).toContain('CREATE TABLE IF NOT EXISTS contact_inquiries');
      for (const col of [
        'ticket_number',
        'client_name',
        'client_email',
        'organization',
        'inquiry_type',
        'message',
        'ip_hash',
        'user_agent',
        'status',
        'created_at'
      ]) {
        expect(sql).toContain(col);
      }
      expect(sql).toContain('CREATE INDEX IF NOT EXISTS');

      const workerTs = fs.readFileSync(path.join(__dirname, '..', 'worker/index.ts'), 'utf8');
      expect(workerTs).toContain('import { handleContactRequest } from "./contact.js"');
      expect(workerTs).toContain('DB?: D1Database');
      expect(workerTs).toContain('path === "/api/contact"');

      const wranglerToml = fs.readFileSync(path.join(__dirname, '..', 'wrangler.toml'), 'utf8');
      expect(wranglerToml).toContain('pattern = "daca.me/api/contact*"');
      expect(wranglerToml).toContain('[[d1_databases]]');
      expect(wranglerToml).toContain('binding = "DB"');
    });
  });
});
