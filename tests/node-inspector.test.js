const fs = require('fs');
const path = require('path');
const {
  NODE_ORDER,
  NODE_TELEMETRY_CATALOG,
  initNodeInspector,
  initParallaxArchitecture,
} = require('../script.js');

describe('Clickable Infrastructure Node Inspector (<dialog>)', () => {
  let indexHtml;

  beforeAll(() => {
    indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  });

  beforeEach(() => {
    const parser = new DOMParser();
    const parsed = parser.parseFromString(indexHtml, 'text/html');
    const services = parsed.getElementById('services');
    const pcBuilds = parsed.getElementById('pc-builds');
    const dialog = parsed.getElementById('node-inspector-dialog');
    document.body.replaceChildren(services, pcBuilds, dialog);

    const dlg = document.getElementById('node-inspector-dialog');
    dlg.open = false;
    dlg.showModal = jest.fn(() => {
      dlg.open = true;
      dlg.setAttribute('open', '');
    });
    dlg.close = jest.fn(() => {
      dlg.open = false;
      dlg.removeAttribute('open');
      dlg.dispatchEvent(new Event('close'));
    });

    window.matchMedia = jest.fn().mockImplementation((q) => ({
      matches: false,
      media: q,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.restoreAllMocks();
  });

  it('uses native <dialog> attributes without forbidden role="dialog" or aria-modal and keeps invokers unambiguous', () => {
    const dialog = document.getElementById('node-inspector-dialog');
    expect(dialog).not.toBeNull();
    expect(dialog.getAttribute('closedby')).toBe('any');
    expect(dialog.getAttribute('aria-labelledby')).toBe('node-inspector-title');
    expect(dialog.hasAttribute('role')).toBe(false);
    expect(dialog.hasAttribute('aria-modal')).toBe(false);

    const buttons = Array.from(document.querySelectorAll('.node-inspect-btn'));
    expect(buttons).toHaveLength(NODE_ORDER.length);
    const accessibleTexts = new Set();
    buttons.forEach((btn) => {
      expect(btn.getAttribute('command')).toBe('show-modal');
      expect(btn.getAttribute('commandfor')).toBe('node-inspector-dialog');
      expect(btn.getAttribute('aria-haspopup')).toBe('dialog');
      const normalized = btn.textContent.replace(/\s+/g, ' ').trim();
      expect(normalized.startsWith('Inspect')).toBe(true);
      accessibleTexts.add(normalized);
    });
    expect(accessibleTexts.size).toBe(NODE_ORDER.length);
  });

  it('opens node telemetry modal on inspect click, resets 3D card tilt, and switches nodes cleanly', () => {
    const dialog = document.getElementById('node-inspector-dialog');
    initNodeInspector();

    const card2 = document.querySelector('.interactive-card[data-node-id="node-02"]');
    card2.style.transform = 'rotateX(-4deg) rotateY(4deg) translateZ(5px)';

    const btn2 = card2.querySelector('[data-inspect-node="node-02"]');
    btn2.click();

    expect(dialog.showModal).toHaveBeenCalledTimes(1);
    expect(dialog.open).toBe(true);
    expect(card2.style.transform).toBe('rotateX(0deg) rotateY(0deg) translateZ(0px)');
    expect(document.getElementById('node-inspector-code').textContent).toBe('NODE-02 // MIPS_VFPU');
    expect(document.getElementById('node-inspector-title').textContent).toBe(NODE_TELEMETRY_CATALOG['node-02'].title);
    expect(document.getElementById('node-inspector-cta').getAttribute('href')).toBe('/DaedalusX64/#combiner-lab');
    expect(document.getElementById('node-inspector-kpis').children).toHaveLength(4);
    expect(document.getElementById('node-inspector-specs').children).toHaveLength(4);
    expect(document.getElementById('node-inspector-vlan-body').children).toHaveLength(3);

    // Switch via Next Node button to node-03
    document.getElementById('node-inspector-next').click();
    expect(document.getElementById('node-inspector-code').textContent).toBe('NODE-03 // ZERO_TRUST');
    expect(document.getElementById('node-inspector-index').textContent).toBe('03 / 05');
    expect(document.querySelector('[data-switch-node="node-03"]').getAttribute('aria-current')).toBe('true');

    // Switch via Pill button to node-rx2
    document.querySelector('[data-switch-node="node-rx2"]').click();
    expect(document.getElementById('node-inspector-code').textContent).toBe('NODE-RX2 // EDGE_KVM');
    expect(document.getElementById('node-inspector-index').textContent).toBe('05 / 05');

    // Switch via Prev Node button back to node-rx1
    document.getElementById('node-inspector-prev').click();
    expect(document.getElementById('node-inspector-code').textContent).toBe('NODE-RX1 // STUDIO_PRO');
  });

  it('keeps card anchor links independent while opening inspector on non-interactive card surface clicks', () => {
    const dialog = document.getElementById('node-inspector-dialog');
    initNodeInspector();

    const card2 = document.querySelector('.interactive-card[data-node-id="node-02"]');
    const exploreLink = card2.querySelector('a[href="/DaedalusX64/"]');
    expect(exploreLink).not.toBeNull();
    exploreLink.addEventListener('click', (e) => e.preventDefault());
    exploreLink.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(dialog.open).toBe(false);

    // Click card heading/text instead -> opens node-02 inspector
    const cardText = card2.querySelector('.card-text');
    cardText.click();
    expect(dialog.open).toBe(true);
    expect(document.getElementById('node-inspector-code').textContent).toBe('NODE-02 // MIPS_VFPU');

    // Close resets returnValue
    dialog.returnValue = 'stale';
    document.getElementById('node-inspector-close').click();
    expect(dialog.close).toHaveBeenCalled();
    expect(dialog.open).toBe(false);
    expect(dialog.returnValue).toBe('');
  });

  it('preserves parallax card tilt physics for existing cards', () => {
    Element.prototype.getBoundingClientRect = jest.fn(() => ({
      width: 200,
      height: 200,
      left: 0,
      top: 0,
    }));
    const rafQueue = [];
    window.requestAnimationFrame = jest.fn((cb) => {
      rafQueue.push(cb);
      return 1;
    });

    initParallaxArchitecture();
    const card = document.querySelector('.interactive-card[data-node-id="node-01"]');
    card.dispatchEvent(new MouseEvent('mousemove', { clientX: 200, clientY: 200, bubbles: true }));
    expect(rafQueue.length).toBeGreaterThan(0);
    rafQueue[0]();
    expect(card.style.transform).toBe('rotateX(-4deg) rotateY(4deg) translateZ(5px)');
  });
});
