// DaedalusX64 Microcode Exhibit — Interactive Comparison Slider & Security Delegation
// Sentinel & Bolt Hardened: Externalized Script (CSP script-src 'self'), Zero Inline Handlers

function updateComparisonSlider(id, val) {
  const numericVal = Math.max(0, Math.min(100, Number(val) || 0));
  const patchedLayer = document.getElementById(`layer-patched-${id}`);
  const divider = document.getElementById(`divider-${id}`);
  const readout = document.getElementById(`readout-${id}`);

  if (patchedLayer && divider) {
    patchedLayer.style.clipPath = `inset(0 0 0 ${numericVal}%)`;
    divider.style.left = `${numericVal}%`;
  }

  if (readout) {
    readout.textContent = `SPLIT: ${numericVal}%`;
  }

  const presets = document.querySelectorAll(`#slider-${id} ~ .slider-controls-bar .preset-chip`);
  presets.forEach((chip) => {
    const presetVal = Number(chip.getAttribute('data-preset-val'));
    const isActive = presetVal === numericVal;
    chip.classList.toggle('active', isActive);
    chip.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
}

function setComparisonPreset(id, val) {
  const sliderBox = document.getElementById(`slider-${id}`);
  if (!sliderBox) return;
  const input = sliderBox.querySelector('.comparison-range-input');
  if (input) {
    input.value = String(val);
    updateComparisonSlider(id, val);
  }
}

function initDaedalusExhibits() {
  // Global Security Delegation for external links
  document.addEventListener('click', (e) => {
    if (!e.target || typeof e.target.closest !== 'function') return;
    const link = e.target.closest('a[target="_blank"]');
    if (link) {
      link.setAttribute('rel', 'noopener noreferrer');
      link.setAttribute('referrerpolicy', 'no-referrer');
    }
  });

  // Bind range sliders via data-slider-id
  const sliders = document.querySelectorAll('.comparison-range-input[data-slider-id]');
  sliders.forEach((input) => {
    const sliderId = input.getAttribute('data-slider-id');
    input.addEventListener('input', () => {
      updateComparisonSlider(sliderId, input.value);
    });
  });

  // Bind preset buttons via data-slider-id and data-preset-val
  const presetBtns = document.querySelectorAll('.preset-chip[data-slider-id][data-preset-val]');
  presetBtns.forEach((btn) => {
    const sliderId = btn.getAttribute('data-slider-id');
    const presetVal = Number(btn.getAttribute('data-preset-val'));
    btn.addEventListener('click', () => {
      setComparisonPreset(sliderId, presetVal);
    });
  });

  // Bind graceful image error hide fallback without inline onerror
  const chassisImages = document.querySelectorAll('.psp-chassis-overlay-img');
  chassisImages.forEach((img) => {
    img.addEventListener('error', () => {
      img.style.display = 'none';
    });
  });

  // Invoker Commands --copy handler + legacy fallback
  let copyToggle = false;
  const handleCopy = async (button, target) => {
    if (!button || !target) return;
    const text = target.textContent.trim();
    if (!text) return;
    const tip = button.parentElement ? button.parentElement.querySelector('.copy-tip') : null;
    clearTimeout(button._copyTimer);
    delete button.dataset.copied;
    try {
      if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
        throw new Error('Clipboard unavailable');
      }
      await navigator.clipboard.writeText(text);
      button.dataset.copied = '';
      if (tip) {
        copyToggle = !copyToggle;
        tip.textContent = `Copied C++${copyToggle ? '\u00A0' : ''}`;
      }
    } catch {
      if (tip) {
        copyToggle = !copyToggle;
        tip.textContent = `Press Ctrl+C${copyToggle ? '\u00A0' : ''}`;
      }
    }
    button._copyTimer = setTimeout(() => {
      delete button.dataset.copied;
      if (tip) tip.textContent = '';
    }, 2000);
  };

  document.addEventListener('command', (e) => {
    if (e.command === '--copy') handleCopy(e.source, e.target);
  }, true);

  if (typeof window !== 'undefined' && !('CommandEvent' in window)) {
    document.addEventListener('click', (e) => {
      const btn = e.target && e.target.closest ? e.target.closest('button[command="--copy"]') : null;
      if (!btn) return;
      const targetId = btn.getAttribute('commandfor');
      const target = targetId ? document.getElementById(targetId) : null;
      handleCopy(btn, target);
    });
  }

  // Scroll progress bar JS fallback
  const progressEl = document.getElementById('scroll-progress');
  const supportsScrollTimeline = typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('animation-timeline', 'scroll()');
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (progressEl && !supportsScrollTimeline && !prefersReduced) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          const pct = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
          progressEl.style.transform = `scaleX(${pct})`;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDaedalusExhibits);
  } else {
    initDaedalusExhibits();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { updateComparisonSlider, setComparisonPreset, initDaedalusExhibits };
}
