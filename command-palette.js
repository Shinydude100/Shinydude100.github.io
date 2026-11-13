// =================================================================
// Global Command Palette (Ctrl+K / Cmd+K) — Native <dialog> Top-Layer Engine
// Sentinel Hardened: Zero innerHTML, CSP script-src 'self' compatible
// =================================================================
(function () {
  'use strict';

  if (typeof document === 'undefined' || typeof window === 'undefined') return;

  let supportsDisplayTransition;
  function canTransitionDisplay() {
    if (supportsDisplayTransition !== undefined) return supportsDisplayTransition;
    if (!window.CSS?.supports?.('transition-behavior', 'allow-discrete') || !document.body) {
      return false;
    }
    const probe = document.createElement('div');
    probe.style.setProperty('transition', 'display 1s allow-discrete', 'important');
    probe.style.display = 'block';
    document.body.appendChild(probe);
    getComputedStyle(probe).display;
    probe.style.display = 'none';
    supportsDisplayTransition = getComputedStyle(probe).display === 'block';
    probe.remove();
    return supportsDisplayTransition;
  }

  function supportsTopLayerExit() {
    return Boolean(window.CSS?.supports?.('overlay', 'auto') && canTransitionDisplay());
  }

  async function closeTopLayer(dialog) {
    if (!dialog || !dialog.open) return;
    if (!supportsTopLayerExit()) {
      dialog.setAttribute('data-closing', '');
      const animations = typeof dialog.getAnimations === 'function'
        ? dialog.getAnimations({ subtree: true })
        : [];
      if (animations.length > 0) {
        await Promise.race([
          Promise.allSettled(animations.map((a) => a.finished)),
          new Promise((r) => setTimeout(r, 400)),
        ]);
      }
      if (!dialog.hasAttribute('data-closing')) return;
      dialog.removeAttribute('data-closing');
    }
    dialog.close();
  }

  function getCommands() {
    const path = window.location.pathname || '/';
    const isSupport = path.includes('/support');
    const isDaedalus = path.includes('/DaedalusX64');
    const isRoot = !isSupport && !isDaedalus;

    const commands = [];

    if (isRoot) {
      commands.push(
        { group: 'ON THIS PAGE', label: 'Inspect Fleet Node Telemetry (NODE-01 Cluster HA)', hint: 'dialog', action: () => document.querySelector('[data-inspect-node="node-01"]')?.click() },
        { group: 'ON THIS PAGE', label: 'Run Live Edge Telemetry Ping', hint: './ping_edge_telemetry.sh', action: () => { const b = document.getElementById('hud-ping-btn'); if (b) b.click(); } },
        { group: 'ON THIS PAGE', label: 'Copy MCP Discovery cURL', hint: 'clipboard', action: async () => { try { await navigator.clipboard?.writeText('curl -s https://daca.me/.well-known/mcp.json'); } catch {} } },
        { group: 'ON THIS PAGE', label: 'Jump to Core Expertise', hint: '#services', href: '#services' },
        { group: 'ON THIS PAGE', label: 'Jump to Workstations', hint: '#pc-builds', href: '#pc-builds' },
        { group: 'ON THIS PAGE', label: 'Jump to Architecture Case Studies', hint: '#case-studies', href: '#case-studies' },
        { group: 'ON THIS PAGE', label: 'Jump to System Automation (win_maintenance_routine.ps1)', hint: '#tools', href: '#tools' },
        { group: 'ON THIS PAGE', label: 'Jump to Track Record', hint: '#about', href: '#about' },
        { group: 'ON THIS PAGE', label: 'Jump to Contact & Dispatch', hint: '#contact', href: '#contact' }
      );
    } else if (isSupport) {
      commands.push(
        { group: 'DFW DISPATCH', label: 'Jump to Live Booking Engine', hint: '#book', href: '#book' },
        { group: 'DFW DISPATCH', label: 'Book: Computer Repair & Crash Recovery ($69–$99)', hint: 'select', action: () => document.querySelector('[data-select-service="Computer Repair & Diagnostic"]')?.click() },
        { group: 'DFW DISPATCH', label: 'Book: SSD / RAM Speed Upgrade ($99 + parts)', hint: 'select', action: () => document.querySelector('[data-select-service="SSD / RAM Hardware Upgrade"]')?.click() },
        { group: 'DFW DISPATCH', label: 'Book: Wi-Fi & Mesh Network Setup ($129)', hint: 'select', action: () => document.querySelector('[data-select-service="Wi-Fi & Mesh Network Setup"]')?.click() },
        { group: 'DFW DISPATCH', label: 'Book: Workstations & Custom Builds ($149)', hint: 'select', action: () => document.querySelector('[data-select-service="Custom PC / Workstation Build"]')?.click() },
        { group: 'DFW DISPATCH', label: 'Call Irving Tech Support: (972) 445-7413', hint: 'tel:', href: 'tel:9724457413' }
      );
    } else if (isDaedalus) {
      commands.push(
        { group: 'EXHIBITS', label: '00 // Interactive N64 Combiner Playground', hint: '#combiner-lab', href: '#combiner-lab' },
        { group: 'EXHIBITS', label: 'Exhibit 01: Kokiri Sword Blade (Zelda OOT)', hint: '#exhibit-1', href: '#exhibit-1' },
        { group: 'EXHIBITS', label: 'Exhibit 02: Cuccos & Hilt (Zelda OOT)', hint: '#exhibit-2', href: '#exhibit-2' },
        { group: 'EXHIBITS', label: 'Exhibit 03: Alpha Channel & Blend Exploration', hint: '#exhibit-3', href: '#exhibit-3' },
        { group: 'EXHIBITS', label: 'Exhibit 04: Partial-Flashing Bomb (Smash Bros)', hint: '#exhibit-4', href: '#exhibit-4' },
        { group: 'EXHIBITS', label: 'Win32 MinPSPw Developer Toolchain Readme', hint: '#docs', href: '#docs' }
      );
    }

    commands.push(
      { group: 'ROUTES', label: 'Main Systems Lab (daca.me)', hint: '/', href: '/' },
      { group: 'ROUTES', label: 'Irving & DFW Tech Support Storefront', hint: '/support/', href: '/support/' },
      { group: 'ROUTES', label: 'DaedalusX64 N64 Microcode Lab', hint: '/DaedalusX64/', href: '/DaedalusX64/' },
      { group: 'ROUTES', label: 'Admin Dispatch CRM', hint: '/admin/', href: '/admin/' }
    );

    return commands;
  }

  function initCommandPalette() {
    if (document.getElementById('cmd-palette')) return;

    const dialog = document.createElement('dialog');
    dialog.id = 'cmd-palette';
    dialog.className = 'cmd-palette';
    dialog.setAttribute('closedby', 'any');
    dialog.setAttribute('aria-labelledby', 'cmd-palette-title');

    const header = document.createElement('div');
    header.className = 'cmd-palette-head';

    const title = document.createElement('h2');
    title.id = 'cmd-palette-title';
    title.className = 'cmd-palette-title';
    title.textContent = 'daca.me // Command Palette';

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'cmd-palette-close';
    closeBtn.setAttribute('aria-label', 'Close Command Palette');
    closeBtn.textContent = 'ESC';

    header.appendChild(title);
    header.appendChild(closeBtn);

    const searchWrap = document.createElement('div');
    searchWrap.className = 'cmd-palette-search-wrap';

    const promptSpan = document.createElement('span');
    promptSpan.className = 'cmd-palette-prompt';
    promptSpan.setAttribute('aria-hidden', 'true');
    promptSpan.textContent = '>';

    const input = document.createElement('input');
    input.type = 'search';
    input.id = 'cmd-palette-input';
    input.className = 'cmd-palette-input';
    input.placeholder = 'Type a command, route, or section...';
    input.setAttribute('aria-label', 'Filter commands');
    input.setAttribute('autocomplete', 'off');
    input.autofocus = true;

    searchWrap.appendChild(promptSpan);
    searchWrap.appendChild(input);

    const list = document.createElement('ul');
    list.id = 'cmd-palette-list';
    list.className = 'cmd-palette-list';
    list.setAttribute('role', 'listbox');
    list.setAttribute('aria-label', 'Available Commands');

    const footer = document.createElement('div');
    footer.className = 'cmd-palette-foot';
    footer.textContent = '↑↓ Navigate · Enter Execute · Esc Close';

    dialog.appendChild(header);
    dialog.appendChild(searchWrap);
    dialog.appendChild(list);
    dialog.appendChild(footer);
    document.body.appendChild(dialog);

    let filtered = [];
    let activeIdx = 0;

    function executeCommand(cmd) {
      if (!cmd) return;
      closeTopLayer(dialog).then(() => {
        if (typeof cmd.action === 'function') {
          cmd.action();
        } else if (cmd.href) {
          if (cmd.href.startsWith('#')) {
            const target = document.querySelector(cmd.href);
            if (target) {
              target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
            }
          } else {
            window.location.href = cmd.href;
          }
        }
      });
    }

    function renderList(query) {
      const q = (query || '').trim().toLowerCase();
      const all = getCommands();
      filtered = q
        ? all.filter((c) => c.label.toLowerCase().includes(q) || c.group.toLowerCase().includes(q) || (c.hint && c.hint.toLowerCase().includes(q)))
        : all;

      if (activeIdx >= filtered.length) activeIdx = 0;
      list.replaceChildren();

      if (filtered.length === 0) {
        const empty = document.createElement('li');
        empty.className = 'cmd-palette-empty';
        empty.textContent = 'No matching commands found.';
        list.appendChild(empty);
        return;
      }

      const frag = document.createDocumentFragment();
      filtered.forEach((cmd, idx) => {
        const li = document.createElement('li');
        li.className = 'cmd-palette-item' + (idx === activeIdx ? ' is-active' : '');
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', idx === activeIdx ? 'true' : 'false');

        const left = document.createElement('span');
        left.className = 'cmd-item-left';

        const grp = document.createElement('span');
        grp.className = 'cmd-item-group';
        grp.textContent = cmd.group;

        const lbl = document.createElement('span');
        lbl.className = 'cmd-item-label';
        lbl.textContent = cmd.label;

        left.appendChild(grp);
        left.appendChild(lbl);

        const hint = document.createElement('span');
        hint.className = 'cmd-item-hint';
        hint.textContent = cmd.hint || '';

        li.appendChild(left);
        li.appendChild(hint);

        li.addEventListener('mouseenter', () => {
          activeIdx = idx;
          updateActiveItem();
        });
        li.addEventListener('click', () => executeCommand(cmd));
        frag.appendChild(li);
      });
      list.appendChild(frag);
    }

    function updateActiveItem() {
      const items = list.querySelectorAll('.cmd-palette-item');
      items.forEach((el, i) => {
        const isActive = i === activeIdx;
        el.classList.toggle('is-active', isActive);
        el.setAttribute('aria-selected', isActive ? 'true' : 'false');
        if (isActive && typeof el.scrollIntoView === 'function') {
          el.scrollIntoView({ block: 'nearest' });
        }
      });
    }

    function openPalette() {
      if (dialog.open) return;
      dialog.removeAttribute('data-closing');
      activeIdx = 0;
      input.value = '';
      renderList('');
      dialog.showModal();
      input.focus();
    }

    closeBtn.addEventListener('click', () => closeTopLayer(dialog));

    dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      closeTopLayer(dialog);
    });

    if (!('closedBy' in HTMLDialogElement.prototype)) {
      const outside = (e) => {
        const r = dialog.getBoundingClientRect();
        return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      };
      let pressedOutside = false;
      dialog.addEventListener('pointerdown', (e) => { pressedOutside = outside(e); });
      dialog.addEventListener('pointerup', (e) => {
        if (pressedOutside && outside(e)) closeTopLayer(dialog);
      });
    }

    input.addEventListener('input', () => {
      activeIdx = 0;
      renderList(input.value);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' && filtered.length > 0) {
        e.preventDefault();
        activeIdx = (activeIdx + 1) % filtered.length;
        updateActiveItem();
      } else if (e.key === 'ArrowUp' && filtered.length > 0) {
        e.preventDefault();
        activeIdx = (activeIdx - 1 + filtered.length) % filtered.length;
        updateActiveItem();
      } else if (e.key === 'Enter' && filtered[activeIdx]) {
        e.preventDefault();
        executeCommand(filtered[activeIdx]);
      }
    });

    document.querySelectorAll('[data-open-command-palette]').forEach((btn) => {
      btn.addEventListener('click', openPalette);
    });

    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (dialog.open) closeTopLayer(dialog);
        else openPalette();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCommandPalette);
  } else {
    initCommandPalette();
  }
})();
