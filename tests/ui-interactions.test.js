const fs = require('fs');
const path = require('path');
const {
    initParallaxArchitecture,
    initDynamicTelemetry,
    initCaseStudyAccordion
} = require('../script.js');

describe('UI Interactions', () => {
    let mockRequestAnimationFrame;
    let mockMatchMedia;
    let rafCallbacks = [];

    beforeEach(() => {
        jest.clearAllMocks();

        rafCallbacks = [];
        mockRequestAnimationFrame = jest.fn((callback) => {
            rafCallbacks.push(callback);
            return 1;
        });
        window.requestAnimationFrame = mockRequestAnimationFrame;

        mockMatchMedia = jest.fn().mockImplementation(query => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: jest.fn(),
            removeListener: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(),
        }));
        window.matchMedia = mockMatchMedia;

        document.body.innerHTML = `
            <div class="interactive-card">Card Content</div>
            <span class="node-load">0.34</span>
            <span class="node-uptime">99.992</span>
            <span class="node-mem">42.5</span>
        `;

        Element.prototype.getBoundingClientRect = jest.fn(() => ({
            width: 100,
            height: 100,
            top: 0,
            left: 0,
            bottom: 100,
            right: 100,
        }));
    });

    afterEach(() => {
        document.body.innerHTML = '';
        document.documentElement.className = '';
        jest.restoreAllMocks();
    });

    describe('initParallaxArchitecture', () => {
        it('should update css custom properties and transform on mousemove via requestAnimationFrame', () => {
            initParallaxArchitecture();

            const card = document.querySelector('.interactive-card');

            card.dispatchEvent(new MouseEvent('mousemove', {
                clientX: 50,
                clientY: 50,
                bubbles: true
            }));

            expect(mockRequestAnimationFrame).toHaveBeenCalled();
            rafCallbacks[0]();

            expect(card.style.getPropertyValue('--m-x')).toBe('50px');
            expect(card.style.getPropertyValue('--m-y')).toBe('50px');
            expect(card.style.transform).toBe('rotateX(0deg) rotateY(0deg) translateZ(5px)');

            card.dispatchEvent(new MouseEvent('mousemove', {
                clientX: 100,
                clientY: 100,
                bubbles: true
            }));

            rafCallbacks[1]();

            expect(card.style.getPropertyValue('--m-x')).toBe('100px');
            expect(card.style.getPropertyValue('--m-y')).toBe('100px');
            expect(card.style.transform).toBe('rotateX(-4deg) rotateY(4deg) translateZ(5px)');
        });

        it('should reset transform on mouseleave', () => {
            initParallaxArchitecture();
            const card = document.querySelector('.interactive-card');

            card.style.transform = 'rotateX(-4deg) rotateY(4deg) translateZ(5px)';
            card.dispatchEvent(new Event('mouseleave'));

            expect(card.style.transform).toBe('rotateX(0deg) rotateY(0deg) translateZ(0px)');
        });
    });

    describe('initDynamicTelemetry (de-gimmicked)', () => {
        beforeEach(() => {
            jest.useFakeTimers();
            global.fetch = jest.fn(() => Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ colo: 'DFW', protocol: 'HTTP/3', tlsVersion: 'TLSv1.3', ray: 'LOCAL' })
            }));
        });

        afterEach(() => {
            delete global.fetch;
            jest.useRealTimers();
        });

        it('preserves static verified telemetry metrics without random jitter loops', async () => {
            initDynamicTelemetry();
            await Promise.resolve();
            await Promise.resolve();
            jest.advanceTimersByTime(15000);

            expect(document.querySelector('.node-load').textContent).toBe('0.34');
            expect(document.querySelector('.node-uptime').textContent).toBe('99.992');
            expect(document.querySelector('.node-mem').textContent).toBe('42.5');
        });
    });

    describe('Shared CSS Architecture & Strict style-src CSP across all routes', () => {
        const routes = [
            { file: 'index.html', routeCss: '/assets/home.css' },
            { file: 'support/index.html', routeCss: '/assets/support.css' },
            { file: 'DaedalusX64/index.html', routeCss: '/assets/daedalus.css' },
            { file: 'admin/index.html', routeCss: '/assets/admin.css' },
        ];

        test.each(routes)('$file enforces strict style-src self, external CSS, and zero inline styles', ({ file, routeCss }) => {
            const html = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

            expect(html).toContain("style-src 'self';");
            expect(html).not.toContain("'unsafe-inline'");
            expect(html).not.toMatch(/<style\b/i);
            expect(html).not.toMatch(/\sstyle="/i);
            expect(html).toContain('href="/assets/core.css"');
            expect(html).toContain(`href="${routeCss}"`);
            expect(html).toContain('/fonts/inter-latin-wght-normal.woff2');
            expect(html).toContain('/fonts/space-grotesk-latin-wght-normal.woff2');
            expect(html).toContain('/fonts/jetbrains-mono-latin-wght-normal.woff2');
        });
    });

    describe('Phase 2 Bento Hierarchy & Case Studies Accordion', () => {
        it('renders asymmetric bento grids, workstation standards, and accessible <details> case studies', () => {
            const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
            const parsed = new DOMParser().parseFromString(html, 'text/html');

            expect(parsed.querySelector('.bento-services')).not.toBeNull();
            expect(parsed.querySelector('.bento-span-7[class*="matrix-cell"] [data-node-id="node-01"]')).not.toBeNull();
            expect(parsed.querySelector('.bento-span-5 [data-node-id="node-03"]')).not.toBeNull();
            expect(parsed.querySelector('.bento-span-12 [data-node-id="node-02"]')).not.toBeNull();
            expect(parsed.querySelector('.workstation-standard-bar')).not.toBeNull();

            const list = parsed.getElementById('case-studies-list');
            expect(list).not.toBeNull();
            const items = list.querySelectorAll(':scope > details');
            expect(items).toHaveLength(3);
            expect(items[0].hasAttribute('open')).toBe(true);

            // Screen readers drop heading navigation inside <summary>
            items.forEach((details) => {
                expect(details.hasAttribute('name')).toBe(false);
                const summary = details.querySelector(':scope > summary');
                expect(summary).not.toBeNull();
                expect(summary.querySelector('h1, h2, h3, h4, h5, h6')).toBeNull();
            });

            expect(fs.existsSync(path.join(__dirname, '..', 'assets/chevron-down.svg'))).toBe(true);
        });

        it('toggles all case studies and synchronizes aria-expanded on expand/collapse control', () => {
            const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
            const parsed = new DOMParser().parseFromString(html, 'text/html');
            const section = parsed.getElementById('case-studies');
            document.body.replaceChildren(section);

            initCaseStudyAccordion();

            const btn = document.getElementById('case-studies-toggle-all');
            const items = Array.from(document.querySelectorAll('#case-studies-list > details'));

            expect(btn.getAttribute('aria-expanded')).toBe('false');
            expect(items.filter(d => d.open)).toHaveLength(1);

            btn.click();
            expect(items.every(d => d.open)).toBe(true);
            expect(btn.getAttribute('aria-expanded')).toBe('true');

            btn.click();
            expect(items.every(d => !d.open)).toBe(true);
            expect(btn.getAttribute('aria-expanded')).toBe('false');
        });
    });

    describe('Marketing Audit Conversion & Messaging Simplification', () => {
        it('declutters hero to 2 CTAs + 4 KPIs, relocates COMMAND_DECK to #command-deck, spotlights DaedalusX64, and preserves MCP/SEO', () => {
            const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
            const parsed = new DOMParser().parseFromString(html, 'text/html');

            // 1. Inline telemetry log box removed from hero; interactive terminal relocated out of hero
            const hero = parsed.getElementById('hero');
            expect(hero).not.toBeNull();
            expect(hero.querySelector('.hero-console-shell')).toBeNull();
            expect(hero.querySelector('.hero-hud-panel')).toBeNull();
            expect(hero.querySelector('.hero-solutions-panel')).not.toBeNull();
            expect(hero.querySelector('a.hero-terminal-link[href="#command-deck"]')).not.toBeNull();

            // Relocated COMMAND_DECK exists in dedicated lower-page #command-deck section
            const commandDeck = parsed.getElementById('command-deck');
            expect(commandDeck).not.toBeNull();
            expect(commandDeck.querySelector('.hero-hud-panel')).not.toBeNull();
            expect(commandDeck.querySelector('#hud-ping-btn')).not.toBeNull();
            expect(commandDeck.querySelector('#mcp-curl-snippet')).not.toBeNull();

            // 2. Hero CTAs streamlined to 2 actions max; DFW Support kept exclusively in header nav
            const heroCtas = Array.from(hero.querySelectorAll('.btn-stack .btn-primitive'));
            expect(heroCtas).toHaveLength(2);
            expect(heroCtas[0].getAttribute('href')).toBe('#contact');
            expect(heroCtas[0].textContent.trim()).toBe('Contact Hugo');
            expect(heroCtas[1].getAttribute('href')).toBe('#services');
            expect(heroCtas[1].textContent.trim()).toBe('Explore Architecture');
            expect(hero.querySelector('.btn-stack a[href="/support/"]')).toBeNull();
            expect(parsed.querySelector('#site-header a[href="/support/"]')).not.toBeNull();
            expect(parsed.querySelector('#site-header a[href="#contact"]')).not.toBeNull();

            // 3. 4-metric credibility strip preserved with plain-English labels
            const kpiCells = Array.from(hero.querySelectorAll('.hero-kpi-strip .kpi-cell'));
            expect(kpiCells).toHaveLength(4);
            const kpiText = hero.querySelector('.hero-kpi-strip').textContent;
            expect(kpiText).toContain('170+');
            expect(kpiText).toContain('100.0');
            expect(kpiText).toContain('60 FPS');
            expect(kpiText).toContain('~15m');

            // 4. DaedalusX64 age-16 hook spotlighted prominently
            const daedalusCard = parsed.querySelector('[data-node-id="node-02"]');
            expect(daedalusCard.textContent).toMatch(/Nintendo 64 emulator.*age 16/i);

            // 5. Preserved SEO, MCP discovery, llms.txt, and /support WebMCP form
            expect(parsed.querySelector('link[rel="mcp"][href="/mcp"]')).not.toBeNull();
            expect(parsed.querySelector('link[rel="alternate"][href="/schema.jsonld"]')).not.toBeNull();
            expect(fs.existsSync(path.join(__dirname, '..', 'llms.txt'))).toBe(true);
            const supportHtml = fs.readFileSync(path.join(__dirname, '..', 'support/index.html'), 'utf8');
            expect(supportHtml).toContain('toolname="book_support_appointment"');
        });
    });
});


