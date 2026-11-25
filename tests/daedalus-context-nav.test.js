const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const daedalusHtml = fs.readFileSync(path.join(root, 'DaedalusX64/index.html'), 'utf8');
const homeHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const daedalusCss = fs.readFileSync(path.join(root, 'assets/daedalus.css'), 'utf8');

const parse = (html) => new DOMParser().parseFromString(html, 'text/html');

describe('DaedalusX64 executive context & navbar parity', () => {
    const doc = parse(daedalusHtml);
    const home = parse(homeHtml);

    it('leads the hero with a single plain-English executive context sentence', () => {
        const hero = doc.getElementById('hero');
        const banner = doc.getElementById('exec-context');
        expect(banner).not.toBeNull();
        expect(hero.firstElementChild).toBe(banner);
        expect(banner.tagName).toBe('P');

        const text = banner.textContent.replace(/\s+/g, ' ').trim();
        expect(text).toMatch(/^In plain English:/);
        expect(text).toMatch(/16/);
        expect(text).toMatch(/business networks/);
        // Exactly one sentence (the trailing CTA link has no terminal punctuation)
        const body = text.replace(/^In plain English:\s*/, '').replace(/Work with Hugo.*$/, '').trim();
        expect(body.match(/[.!?](\s|$)/g)).toHaveLength(1);

        const cta = banner.querySelector('a.exec-context-link');
        expect(cta.getAttribute('href')).toBe('/#contact');
    });

    it('uses a labelled <nav> landmark with a list, matching the home page structure', () => {
        const nav = doc.querySelector('header nav[aria-label="Primary"]');
        expect(nav).not.toBeNull();
        const list = nav.querySelector('ul.nav-links');
        expect(list).not.toBeNull();
        list.querySelectorAll(':scope > li').forEach((li) => {
            expect(li.classList.contains('nav-item') || li.classList.contains('nav-sep') || li.classList.contains('nav-cmd-item')).toBe(true);
        });
        expect(doc.querySelector('header div.nav-links')).toBeNull();
    });

    it('mirrors the home page Support + Contact pill buttons', () => {
        const homePills = [...home.querySelectorAll('#menu-box .nav-pill')].map((li) => li.className);
        const pills = [...doc.querySelectorAll('header .nav-pill')].map((li) => li.className);
        expect(pills).toEqual(homePills);

        expect(doc.querySelector('.nav-pill--support a').getAttribute('href')).toBe('/support/');
        expect(doc.querySelector('.nav-pill--cta a').getAttribute('href')).toBe('/#contact');
        expect(doc.querySelector('header .nav-sep').getAttribute('aria-hidden')).toBe('true');
    });

    it('keeps in-page anchors, hardened GitHub link, and the command palette trigger', () => {
        ['#combiner-lab', '#exhibits', '#docs'].forEach((href) => {
            const link = doc.querySelector(`header .nav-item a[href="${href}"]`);
            expect(link).not.toBeNull();
            expect(doc.getElementById(href.slice(1))).not.toBeNull();
        });

        const gh = doc.querySelector('header a[href="https://github.com/DaedalusX64/daedalus"]');
        expect(gh.getAttribute('target')).toBe('_blank');
        expect(gh.getAttribute('rel')).toBe('noopener noreferrer');
        expect(gh.getAttribute('referrerpolicy')).toBe('no-referrer');
        expect(gh.getAttribute('aria-label')).toBe(gh.getAttribute('title'));

        const cmd = doc.querySelector('header .nav-cmd-item button.cmd-palette-trigger[data-open-command-palette]');
        expect(cmd).not.toBeNull();
        expect(cmd.getAttribute('aria-label')).toBe(cmd.getAttribute('title'));
    });

    it('preserves strict CSP, SEO metadata, and structured data', () => {
        const csp = doc.querySelector('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
        expect(csp).toContain("script-src 'self'");
        expect(csp).toContain("style-src 'self'");
        expect(csp).not.toContain('unsafe-inline');

        expect(doc.title).toBe('DaedalusX64 — Reverse Engineering N64 Emulation | Hugo Luna (daca.me)');
        expect(doc.querySelector('meta[property="og:url"]').getAttribute('content')).toBe('https://daca.me/DaedalusX64/');
        expect(() => JSON.parse(doc.querySelector('script[type="application/ld+json"]').textContent)).not.toThrow();
    });

    it('introduces no inline styles, inline handlers, or new inline scripts', () => {
        expect(doc.querySelectorAll('[style]')).toHaveLength(0);
        const handlerAttrs = [...doc.querySelectorAll('*')].flatMap((el) => [...el.attributes].map((a) => a.name)).filter((n) => /^on/i.test(n));
        expect(handlerAttrs).toEqual([]);
        expect(doc.querySelectorAll('script:not([src]):not([type="application/ld+json"])')).toHaveLength(0);
    });

    it('styles the pills and banner in the route stylesheet with focus + forced-colors support', () => {
        ['.nav-item.nav-pill--support a', '.nav-item.nav-pill--cta a', '.exec-context', '.nav-item a:focus-visible', '.exec-context-link:focus-visible'].forEach((sel) => {
            expect(daedalusCss).toContain(sel);
        });
        expect(daedalusCss).toMatch(/@media \(forced-colors: active\)\s*\{\s*\.exec-context/);
    });
});
