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
