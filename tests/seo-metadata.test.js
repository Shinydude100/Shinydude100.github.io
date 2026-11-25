const fs = require('fs');
const path = require('path');

const INDEX_HTML_PATH = path.join(__dirname, '..', 'index.html');
const EXPECTED_TITLE = 'Hugo Luna | Systems & Security Architect · Irving & DFW, TX';
const EXPECTED_DESCRIPTION =
    'Eliminate network downtime and hardware bottlenecks. Zero-downtime business networks, 24h stress-tested custom workstations, and Irving/DFW IT consulting.';
const EXPECTED_CANONICAL_URL = 'https://daca.me/';

describe('Google SERP <title>, <meta name="description"> & Social/Canonical Parity (index.html)', () => {
    let rawHtml;
    let parsedDoc;

    beforeEach(() => {
        rawHtml = fs.readFileSync(INDEX_HTML_PATH, 'utf8');
        parsedDoc = new DOMParser().parseFromString(rawHtml, 'text/html');
    });

    afterEach(() => {
        document.head.replaceChildren();
        document.body.replaceChildren();
        document.title = '';
        delete document.modelContext;
        jest.restoreAllMocks();
    });

    test('renders SERP <title> within <= 60 characters (59 chars) with plain-English role and Irving/DFW location', () => {
        const titleElements = parsedDoc.head.querySelectorAll('title');
        expect(titleElements).toHaveLength(1);

        expect(parsedDoc.title).toBe(EXPECTED_TITLE);
        expect(parsedDoc.title.length).toBe(59);
        expect(parsedDoc.title.length).toBeGreaterThanOrEqual(45);
        expect(parsedDoc.title.length).toBeLessThanOrEqual(60);

        // Ensure raw HTML properly encodes ampersands inside <title>
        expect(rawHtml).toContain(
            '<title>Hugo Luna | Systems &amp; Security Architect · Irving &amp; DFW, TX</title>'
        );
    });

    test('renders SERP <meta name="description"> within 120..160 characters (154 chars) covering all plain-English outcome hooks', () => {
        const descNodes = parsedDoc.head.querySelectorAll('meta[name="description"]');
        expect(descNodes).toHaveLength(1);

        const content = descNodes[0].getAttribute('content');
        expect(content).toBe(EXPECTED_DESCRIPTION);
        expect(content.length).toBe(154);
        expect(content.length).toBeGreaterThanOrEqual(120);
        expect(content.length).toBeLessThanOrEqual(160);

        // Mirrors Hero <h1> problem/outcome hook and covers all 3 required pillars
        const heroH1 = parsedDoc.querySelector('main h1');
        expect(heroH1).not.toBeNull();
        expect(heroH1.textContent.replace(/\s+/g, ' ').trim()).toBe(
            'Eliminate Network Downtime & Hardware Bottlenecks.'
        );
        expect(content).toMatch(/zero-downtime business networks/i);
        expect(content).toMatch(/custom workstations/i);
        expect(content).toMatch(/Irving\/DFW IT consulting/i);
    });

    test('includes <link rel="canonical"> and exact Open Graph (og:*) and Twitter Card (twitter:*) parity without duplicate tags', () => {
        const canonicalLinks = parsedDoc.head.querySelectorAll('link[rel="canonical"]');
        expect(canonicalLinks).toHaveLength(1);
        expect(canonicalLinks[0].getAttribute('href')).toBe(EXPECTED_CANONICAL_URL);

        const getMetaByProperty = (prop) => {
            const nodes = parsedDoc.head.querySelectorAll(`meta[property="${prop}"]`);
            expect(nodes).toHaveLength(1);
            return nodes[0].getAttribute('content');
        };

        const getMetaByName = (name) => {
            const nodes = parsedDoc.head.querySelectorAll(`meta[name="${name}"]`);
            expect(nodes).toHaveLength(1);
            return nodes[0].getAttribute('content');
        };

        expect(getMetaByProperty('og:title')).toBe(EXPECTED_TITLE);
        expect(getMetaByProperty('og:description')).toBe(EXPECTED_DESCRIPTION);
        expect(getMetaByProperty('og:type')).toBe('website');
        expect(getMetaByProperty('og:url')).toBe(EXPECTED_CANONICAL_URL);

        expect(getMetaByName('twitter:card')).toBe('summary');
        expect(getMetaByName('twitter:title')).toBe(EXPECTED_TITLE);
        expect(getMetaByName('twitter:description')).toBe(EXPECTED_DESCRIPTION);
    });

    test('preserves line 7 strict CSP, blank line 8 separator, discovery links, and inline JSON-LD @graph structured data', () => {
        const lines = rawHtml.split('\n');

        // Line 7 (0-indexed 6): intact strict CSP meta tag
        expect(lines[6]).toMatch(/^<meta http-equiv="Content-Security-Policy" content="/);
        expect(lines[6]).toContain("default-src 'self';");
        expect(lines[6]).toContain("script-src 'self' https://static.cloudflareinsights.com 'inline-speculation-rules';");
        expect(lines[6]).toContain("style-src 'self';");
        expect(lines[6]).toContain("font-src 'self';");
        expect(lines[6]).toMatch(/\bform-action '(none|self)';/);
        expect(lines[6]).not.toContain("'unsafe-inline'");

        // Line 8 (0-indexed 7): frozen blank line separator before line 9 <title>
        expect(lines[7]).toBe('');
        expect(lines[8]).toBe(
            '<title>Hugo Luna | Systems &amp; Security Architect · Irving &amp; DFW, TX</title>'
        );

        // Immediately after the 10 SERP/canonical/social lines (lines 9..18), old lines 11..12 remain intact at lines 19..20
        expect(lines[18]).toBe('<link rel="alternate" type="application/ld+json" href="/schema.jsonld">');
        expect(lines[19]).toBe('<link rel="mcp" href="/mcp">');

        expect(parsedDoc.head.querySelector('link[rel="alternate"][type="application/ld+json"][href="/schema.jsonld"]')).not.toBeNull();
        expect(parsedDoc.head.querySelector('link[rel="mcp"][href="/mcp"]')).not.toBeNull();

        // Inline JSON-LD @graph remains valid and intact
        const ldJsonScript = parsedDoc.head.querySelector('script[type="application/ld+json"]');
        expect(ldJsonScript).not.toBeNull();
        const parsedSchema = JSON.parse(ldJsonScript.textContent);
        expect(parsedSchema['@context']).toBe('https://schema.org');
        expect(Array.isArray(parsedSchema['@graph'])).toBe(true);
        expect(parsedSchema['@graph']).toHaveLength(2);
        expect(parsedSchema['@graph'][0]).toMatchObject({
            '@type': 'Person',
            '@id': 'https://daca.me/#person',
            name: 'Hugo Luna'
        });
        expect(parsedSchema['@graph'][1]).toMatchObject({
            '@type': 'ProfessionalService',
            '@id': 'https://daca.me/#business',
            name: "Hugo's DFW Tech Support & PC Builds"
        });

        // Companion discovery files remain intact
        expect(fs.existsSync(path.join(__dirname, '..', 'llms.txt'))).toBe(true);
        expect(fs.existsSync(path.join(__dirname, '..', 'schema.jsonld'))).toBe(true);
    });

    test('initWebMCP() get_portfolio_info dynamically returns the refreshed SERP document.title', () => {
        document.title = parsedDoc.title;

        const registeredTools = new Map();
        document.modelContext = {
            registerTool: jest.fn((toolDef) => {
                registeredTools.set(toolDef.name, toolDef);
            })
        };

        window.requestIdleCallback = jest.fn((cb) => {
            cb({ didTimeout: false, timeRemaining: () => 50 });
            return 1;
        });
        window.matchMedia = jest.fn().mockImplementation((query) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: jest.fn(),
            removeListener: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn()
        }));
        window.IntersectionObserver = jest.fn(() => ({
            observe: jest.fn(),
            unobserve: jest.fn(),
            disconnect: jest.fn()
        }));
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve([])
            })
        );

        try {
            jest.isolateModules(() => {
                require('../script.js');
            });

            document.dispatchEvent(new Event('DOMContentLoaded'));

            expect(document.modelContext.registerTool).toHaveBeenCalled();
            expect(registeredTools.has('get_portfolio_info')).toBe(true);

            const portfolioTool = registeredTools.get('get_portfolio_info');
            expect(portfolioTool.annotations).toEqual({ readOnlyHint: true });

            const result = portfolioTool.execute();
            expect(result).toMatchObject({
                title: EXPECTED_TITLE,
                architect: 'Hugo Luna',
                location: 'Irving / Dallas-Fort Worth, TX',
                endpoints: {
                    mcp_manifest: '/.well-known/mcp.json',
                    llms_txt: '/llms.txt',
                    schema_jsonld: '/schema.jsonld',
                    support_booking: '/support/',
                    daedalus_lab: '/DaedalusX64/'
                }
            });
        } finally {
            delete global.fetch;
            delete window.requestIdleCallback;
            delete window.IntersectionObserver;
        }
    });

    test('initWebMCP() falls back to setTimeout via navigator.modelContext when requestIdleCallback is unavailable and no-ops safely when modelContext is absent', () => {
        jest.useFakeTimers();
        document.title = parsedDoc.title;
        delete window.requestIdleCallback;

        const registeredViaNavigator = new Map();
        Object.defineProperty(navigator, 'modelContext', {
            configurable: true,
            value: {
                registerTool: jest.fn((toolDef) => {
                    registeredViaNavigator.set(toolDef.name, toolDef);
                })
            }
        });

        window.matchMedia = jest.fn().mockImplementation((query) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: jest.fn(),
            removeListener: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn()
        }));
        window.IntersectionObserver = jest.fn(() => ({
            observe: jest.fn(),
            unobserve: jest.fn(),
            disconnect: jest.fn()
        }));
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve([])
            })
        );

        try {
            jest.isolateModules(() => {
                require('../script.js');
            });

            document.dispatchEvent(new Event('DOMContentLoaded'));
            jest.runOnlyPendingTimers();

            expect(registeredViaNavigator.has('get_portfolio_info')).toBe(true);
            expect(registeredViaNavigator.get('get_portfolio_info').execute().title).toBe(EXPECTED_TITLE);

            // Verify graceful no-op when both document.modelContext and navigator.modelContext are absent
            delete navigator.modelContext;
            expect(() => {
                document.dispatchEvent(new Event('DOMContentLoaded'));
                jest.runOnlyPendingTimers();
            }).not.toThrow();
        } finally {
            delete navigator.modelContext;
            delete global.fetch;
            delete window.IntersectionObserver;
            jest.useRealTimers();
        }
    });
});
