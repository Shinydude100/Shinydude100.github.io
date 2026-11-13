const fs = require('fs');
const path = require('path');
const {
    initParallaxArchitecture,
    initDynamicTelemetry
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
});

