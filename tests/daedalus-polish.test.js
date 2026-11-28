const fs = require('fs');
const path = require('path');

const { initDaedalusNav } = require('../DaedalusX64/daedalus.js');

const ROOT = path.join(__dirname, '..');
const daedalusHtml = fs.readFileSync(path.join(ROOT, 'DaedalusX64/index.html'), 'utf8');
const homeHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const daedalusCss = fs.readFileSync(path.join(ROOT, 'assets/daedalus.css'), 'utf8');

const parseHtml = (html) => new DOMParser().parseFromString(html, 'text/html');

describe('DaedalusX64 cross-route header, mobile menu focus restore, View Transitions & Palette hardening', () => {
  let doc;
  let homeDoc;

  beforeEach(() => {
    doc = parseHtml(daedalusHtml);
    homeDoc = parseHtml(homeHtml);
    document.body.replaceChildren();
    jest.restoreAllMocks();
  });

  it('test_exec_context_banner_and_origin_story_maintain_age_16_continuity', () => {
    const hero = doc.getElementById('hero');
    const banner = doc.getElementById('exec-context');
    expect(banner).not.toBeNull();
    expect(hero.firstElementChild).toBe(banner);
    expect(banner.tagName).toBe('P');
    expect(doc.querySelectorAll('.exec-context, .exec-context-banner')).toHaveLength(1);

    const originParagraph = doc.querySelector('.origin-story-banner p');
    expect(originParagraph).not.toBeNull();
    const normalizedOrigin = originParagraph.textContent.replace(/\s+/g, ' ').trim();
    expect(normalizedOrigin).toContain('Starting at age 16 and jumping directly into C++ with zero prior programming experience');
  });

  it('test_view_transition_landmark_selectors_are_strictly_unique', () => {
    // Matches assets/core.css:38-49 cross-document view-transition-name selectors
    expect(doc.querySelectorAll('#site-header, .sys-header, header')).toHaveLength(1);
    expect(doc.querySelectorAll('.sys-logo, .brand, .logo')).toHaveLength(1);
    expect(doc.querySelectorAll('.hero-title, .hero h1')).toHaveLength(1);
    expect(doc.querySelectorAll('.hero-solutions-panel, .dispatch-hud, .hud-status-bar')).toHaveLength(1);
  });

  it('test_semantic_header_logo_portfolio_link_and_cross_route_targets_exist', () => {
    const header = doc.getElementById('site-header');
    expect(header).not.toBeNull();
    expect(header.tagName).toBe('HEADER');
    expect(header.classList.contains('sys-header')).toBe(true);
    expect(header.querySelector('.nav-container.nav-inner')).not.toBeNull();

    const logo = header.querySelector('a.sys-logo.logo');
    expect(logo).not.toBeNull();
    expect(logo.getAttribute('href')).toBe('/');
    expect(logo.getAttribute('aria-label')).toBeTruthy();
    expect(logo.getAttribute('aria-label')).toBe(logo.getAttribute('title'));

    const nav = header.querySelector('nav[aria-label="Primary"]');
    expect(nav).not.toBeNull();

    const toggle = nav.querySelector('button#mobile-toggle');
    expect(toggle).not.toBeNull();
    expect(toggle.getAttribute('type')).toBe('button');
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(toggle.getAttribute('aria-controls')).toBe('daedalus-menu-box');
    expect(toggle.getAttribute('aria-label')).toBe('Menu Toggle');
    expect(toggle.getAttribute('title')).toBe('Menu Toggle');
    expect(toggle.querySelector('svg').getAttribute('aria-hidden')).toBe('true');

    const menuBox = nav.querySelector('ul#daedalus-menu-box.nav-links');
    expect(menuBox).not.toBeNull();

    // Plain .nav-item Portfolio back-link keeps .nav-pill list strictly aligned with homePills
    const backLink = menuBox.querySelector('li.nav-item:not(.nav-pill) > a[href="/"]');
    expect(backLink).not.toBeNull();
    expect(backLink.textContent).toContain('Portfolio');
    expect(backLink.querySelector('span[aria-hidden="true"]')).not.toBeNull();

    const homePills = [...homeDoc.querySelectorAll('#menu-box .nav-pill')].map((el) => el.className);
    const daedalusPills = [...header.querySelectorAll('.nav-pill')].map((el) => el.className);
    expect(daedalusPills).toEqual(homePills);

    // Cross-route fragment targets exist on index.html
    expect(homeDoc.getElementById('services')).not.toBeNull();
    expect(homeDoc.getElementById('contact')).not.toBeNull();
  });

  it('test_initDaedalusNav_toggles_mobile_menu_and_closes_on_link_and_outside_click', () => {
    const headerClone = doc.getElementById('site-header').cloneNode(true);
    const outsideDiv = document.createElement('div');
    outsideDiv.id = 'outside-region';
    document.body.append(headerClone, outsideDiv);

    initDaedalusNav();

    const mobileToggle = document.getElementById('mobile-toggle');
    const menuBox = document.getElementById('daedalus-menu-box');
    const svgPath = mobileToggle.querySelector('svg path');

    // Open menu via toggle button
    mobileToggle.click();
    expect(menuBox.classList.contains('active')).toBe(true);
    expect(mobileToggle.getAttribute('aria-expanded')).toBe('true');
    expect(svgPath.getAttribute('d')).toBe('M18 6L6 18M6 6l12 12');

    // Clicking a nav link closes the menu without forcing focus back to toggle
    const docsLink = menuBox.querySelector('a[href="#docs"]');
    docsLink.focus();
    docsLink.click();
    expect(menuBox.classList.contains('active')).toBe(false);
    expect(mobileToggle.getAttribute('aria-expanded')).toBe('false');
    expect(svgPath.getAttribute('d')).toBe('M3 12h18M3 6h18M3 18h18');

    // Re-open and click outside header/menu to dismiss
    mobileToggle.click();
    expect(menuBox.classList.contains('active')).toBe(true);
    outsideDiv.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(menuBox.classList.contains('active')).toBe(false);
    expect(mobileToggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('test_initDaedalusNav_escape_restores_focus_to_mobile_toggle_unless_command_palette_open', () => {
    const headerClone = doc.getElementById('site-header').cloneNode(true);
    const cmdDialog = document.createElement('dialog');
    cmdDialog.id = 'cmd-palette';
    cmdDialog.setAttribute('open', '');
    document.body.append(headerClone, cmdDialog);

    // Calling initDaedalusNav twice verifies listener cleanup idempotency
    initDaedalusNav();
    initDaedalusNav();

    const mobileToggle = document.getElementById('mobile-toggle');
    const menuBox = document.getElementById('daedalus-menu-box');
    const firstLink = menuBox.querySelector('a[href="#combiner-lab"]');

    mobileToggle.click();
    expect(menuBox.classList.contains('active')).toBe(true);
    firstLink.focus();
    expect(document.activeElement).toBe(firstLink);

    // While #cmd-palette[open] is open, Escape must not close the underlying mobile menu
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(menuBox.classList.contains('active')).toBe(true);

    // Once #cmd-palette is closed, Escape closes mobile menu and restores focus to #mobile-toggle
    cmdDialog.removeAttribute('open');
    cmdDialog.open = false;
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(menuBox.classList.contains('active')).toBe(false);
    expect(mobileToggle.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(mobileToggle);
  });

  it('test_initDaedalusNav_scrollspy_updates_aria_current_page_and_scrolled_header_state', () => {
    let observerCallback = null;
    const observedIds = [];
    global.IntersectionObserver = jest.fn((cb) => {
      observerCallback = cb;
      return {
        observe: (el) => observedIds.push(el.id),
        disconnect: jest.fn(),
      };
    });

    const headerClone = doc.getElementById('site-header').cloneNode(true);
    const labSec = document.createElement('article');
    labSec.id = 'combiner-lab';
    const exhibitsSec = document.createElement('section');
    exhibitsSec.id = 'exhibits';
    const docsSec = document.createElement('section');
    docsSec.id = 'docs';
    document.body.append(headerClone, labSec, exhibitsSec, docsSec);

    initDaedalusNav();
    expect(observedIds).toEqual(['combiner-lab', 'exhibits', 'docs']);

    const labLink = document.querySelector('#daedalus-menu-box a[href="#combiner-lab"]');
    const docsLink = document.querySelector('#daedalus-menu-box a[href="#docs"]');

    observerCallback([{ isIntersecting: true, target: labSec }]);
    expect(labLink.getAttribute('aria-current')).toBe('page');
    expect(labLink.closest('li').classList.contains('active')).toBe(true);
    expect(docsLink.hasAttribute('aria-current')).toBe(false);

    observerCallback([{ isIntersecting: true, target: docsSec }]);
    expect(docsLink.getAttribute('aria-current')).toBe('page');
    expect(docsLink.closest('li').classList.contains('active')).toBe(true);
    expect(labLink.hasAttribute('aria-current')).toBe(false);
    expect(labLink.closest('li').classList.contains('active')).toBe(false);

    Object.defineProperty(window, 'scrollY', { value: 42, configurable: true });
    window.dispatchEvent(new Event('scroll'));
    expect(headerClone.classList.contains('scrolled')).toBe(true);

    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
    window.dispatchEvent(new Event('scroll'));
    expect(headerClone.classList.contains('scrolled')).toBe(false);
  });

  it('test_external_links_and_decorative_elements_meet_sentinel_and_palette_standards', () => {
    const externalLinks = [...doc.querySelectorAll('a[target="_blank"]')];
    expect(externalLinks.length).toBeGreaterThanOrEqual(6);

    externalLinks.forEach((link) => {
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
      expect(link.getAttribute('referrerpolicy')).toBe('no-referrer');
      const ariaLabel = link.getAttribute('aria-label');
      const title = link.getAttribute('title');
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel).toBe(title);
      expect(ariaLabel).toContain('(opens in a new tab)');
      // Visible label text (excluding aria-hidden icon spans) must appear in accessible name (WCAG 2.5.3)
      const clone = link.cloneNode(true);
      clone.querySelectorAll('[aria-hidden="true"]').forEach((n) => n.remove());
      const visibleText = clone.textContent.replace(/\s+/g, ' ').trim();
      expect(ariaLabel).toContain(visibleText);
    });

    // All decorative dots, scanlines, glow backdrops, divider lines, and slider knob SVGs are aria-hidden="true"
    [
      '.agent-badge-dot',
      '.psp-live-dot',
      '.glitch-scanlines',
      '.patched-glow-bg',
      '.slider-divider-line',
      '.slider-handle-knob svg',
    ].forEach((selector) => {
      const nodes = [...doc.querySelectorAll(selector)];
      expect(nodes.length).toBeGreaterThan(0);
      nodes.forEach((node) => {
        expect(node.getAttribute('aria-hidden')).toBe('true');
      });
    });

    // Section title leading icon spans are aria-hidden="true"
    const sectionLeadingIcons = [...doc.querySelectorAll('h2.section-title > span:first-child')];
    expect(sectionLeadingIcons).toHaveLength(2);
    sectionLeadingIcons.forEach((span) => {
      expect(span.getAttribute('aria-hidden')).toBe('true');
    });

    // CSS architecture checks: single @layer pages wrapper with balanced braces, coarse-pointer 44px & forced-colors
    expect(daedalusCss).toMatch(/@layer pages\s*\{/);
    let braceDepth = 0;
    for (const ch of daedalusCss) {
      if (ch === '{') braceDepth += 1;
      if (ch === '}') braceDepth -= 1;
      expect(braceDepth).toBeGreaterThanOrEqual(0);
    }
    expect(braceDepth).toBe(0);
    expect(daedalusCss).toContain('@media (max-width: 1024px)');
    expect(daedalusCss).toContain('@media (pointer: coarse)');
    expect(daedalusCss).toContain('min-block-size: 44px');
    expect(daedalusCss).toContain('@media (forced-colors: active)');
    expect(daedalusCss).toContain('a[aria-current="page"]');
  });
});
