const fs = require('fs');
const path = require('path');
const {
  COMBINER_PRESETS,
  evalRdpCycle,
  evalRdpCombiner,
  evalPspGu,
  generateGuCpp,
  comparePixelsMetrics,
  initCombinerPlayground,
} = require('../DaedalusX64/daedalus.js');

describe('N64 RDP -> Sony PSP GU Color Combiner Playground', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    jest.restoreAllMocks();
  });

  describe('evalRdpCombiner math', () => {
    it('evaluates 2-cycle (A - B) * C + D equation and forwards Combined to Cycle 1', () => {
      const state = {
        c0: {
          rgbA: 'Texel0', rgbB: 'Primitive', rgbC: 'PrimLODFrac', rgbD: 'Primitive',
          aA: '0', aB: '0', aC: '0', aD: '1',
        },
        c1: {
          rgbA: 'Combined', rgbB: '0', rgbC: 'Shade', rgbD: '0',
          aA: '0', aB: '0', aC: '0', aD: 'Combined',
        },
        psp: { firstCycle: false },
      };

      const sampleCtx = {
        texel0: [0.8, 0.4, 0.2, 1.0],
        texel1: [0, 0, 0, 1],
        prim: [0.2, 0.2, 0.2, 1.0],
        env: [0, 0, 0, 1],
        shade: [0.5, 1.0, 0.5, 1.0],
        primLodFrac: 0.5,
      };

      // C0 RGB: (0.8-0.2)*0.5+0.2 = 0.5, (0.4-0.2)*0.5+0.2 = 0.3, (0.2-0.2)*0.5+0.2 = 0.2
      // C1 RGB: C0 * Shade = (0.25, 0.3, 0.1), A = 1
      const out = evalRdpCombiner(state, sampleCtx);
      expect(out[0]).toBeCloseTo(0.25, 5);
      expect(out[1]).toBeCloseTo(0.3, 5);
      expect(out[2]).toBeCloseTo(0.1, 5);
      expect(out[3]).toBeCloseTo(1.0, 5);
    });

    it('returns Cycle 0 output when firstCycle bypass flag is enabled', () => {
      const cycleResult = evalRdpCycle(COMBINER_PRESETS.kokiri.c0, {
        texel0: [0.9, 0.6, 0.3, 1],
        texel1: [0, 0, 0, 1],
        prim: [0.5, 0.5, 0.5, 1],
        env: [0, 0, 0, 1],
        shade: [1, 1, 1, 1],
        primLodFrac: 0.5,
        combined: [0, 0, 0, 1],
      });
      const out = evalRdpCombiner(
        { ...COMBINER_PRESETS.kokiri, psp: { firstCycle: true } },
        {
          texel0: [0.9, 0.6, 0.3, 1],
          texel1: [0, 0, 0, 1],
          prim: [0.5, 0.5, 0.5, 1],
          env: [0, 0, 0, 1],
          shade: [1, 1, 1, 1],
          primLodFrac: 0.5,
        }
      );
      expect(out).toEqual(cycleResult);
    });
  });

  describe('evalPspGu hardware blend modes', () => {
    const baseCtx = {
      texel0: [0.6, 0.4, 0.2, 0.35],
      texel1: [0, 0, 0, 1],
      prim: [0.2, 0.8, 0.4, 0.9],
      env: [0.1, 0.5, 1.0, 0.8],
      shade: [1.0, 1.0, 1.0, 0.5],
      primLodFrac: 0.5,
    };

    it('demonstrates Exhibit 3 SetAOpaque() behavior with GU_TCC_RGBA vs GU_TCC_RGB', () => {
      // With GU_TCC_RGBA, SetAOpaque() sets Cf.a = 1.0, but GU still multiplies Cf.a * Ct.a
      const rgbaTcc = evalPspGu(
        { tfx: 'GU_TFX_BLEND', tcc: 'GU_TCC_RGBA', adjuster: 'set_rgb_env', texEnvSrc: 'prim', setAOpaque: true },
        baseCtx
      );
      expect(rgbaTcc[3]).toBeCloseTo(0.35, 5);

      // Switching to GU_TCC_RGB outputs Cf.a (1.0) regardless of Texel0 alpha
      const rgbTcc = evalPspGu(
        { tfx: 'GU_TFX_BLEND', tcc: 'GU_TCC_RGB', adjuster: 'set_rgb_env', texEnvSrc: 'prim', setAOpaque: true },
        baseCtx
      );
      expect(rgbTcc[3]).toBeCloseTo(1.0, 5);
    });

    it('computes GU_TFX_MODULATE and GU_TFX_DECAL accurately', () => {
      const modOut = evalPspGu(
        { tfx: 'GU_TFX_MODULATE', tcc: 'GU_TCC_RGBA', adjuster: 'set_rgb_prim', texEnvSrc: 'env', setAOpaque: false },
        baseCtx
      );
      expect(modOut[0]).toBeCloseTo(0.2 * 0.6, 5);
      expect(modOut[1]).toBeCloseTo(0.8 * 0.4, 5);
      expect(modOut[2]).toBeCloseTo(0.4 * 0.2, 5);
      expect(modOut[3]).toBeCloseTo(0.5 * 0.35, 5);

      const decalOut = evalPspGu(
        { tfx: 'GU_TFX_DECAL', tcc: 'GU_TCC_RGB', adjuster: 'passthrough', texEnvSrc: 'none', setAOpaque: false },
        baseCtx
      );
      expect(decalOut).toEqual([0.6, 0.4, 0.2, 0.5]);
    });
  });

  describe('generateGuCpp & comparePixelsMetrics', () => {
    it('emits accurate C++ macro calls for Exhibit 1 and Exhibit 3', () => {
      const kokiriCpp = generateGuCpp({
        ...COMBINER_PRESETS.kokiri,
        presetKey: COMBINER_PRESETS.kokiri.key,
      });
      expect(kokiriCpp).toContain('void BlendMode_0x00177e6035fcfd7eLL( BLEND_MODE_ARGS )');
      expect(kokiriCpp).toContain('sceGuTexEnvColor( details.PrimColour.GetColour() );');
      expect(kokiriCpp).toContain('details.ColourAdjuster.SetRGBA( details.EnvColour );');
      expect(kokiriCpp).toContain('sceGuTexFunc( GU_TFX_BLEND, GU_TCC_RGBA );');

      const ex3Cpp = generateGuCpp({
        ...COMBINER_PRESETS.alpha_explore,
        presetKey: 'Custom',
      });
      expect(ex3Cpp).toContain('void BlendMode_Custom_Lab( BLEND_MODE_ARGS )');
      expect(ex3Cpp).toContain('details.ColourAdjuster.SetAOpaque();');
    });

    it('reports 100% parity for identical pixel buffers and detects channel divergence', () => {
      const bufA = new Uint8ClampedArray([100, 150, 200, 255, 50, 60, 70, 255]);
      const exact = comparePixelsMetrics(bufA, new Uint8ClampedArray(bufA));
      expect(exact.totalParity).toBe(100);
      expect(exact.maxDeltaPct).toBe(0);

      const bufB = new Uint8ClampedArray([100, 150, 200, 0, 50, 60, 70, 255]);
      const diff = comparePixelsMetrics(bufA, bufB);
      expect(diff.rgbParity).toBe(100);
      expect(diff.alphaParity).toBeLessThan(40);
      expect(diff.maxDeltaPct).toBe(100);
    });
  });

  describe('initCombinerPlayground DOM integration', () => {
    it('binds real DaedalusX64 combiner lab markup and updates equations, sliders, and C++', () => {
      const putImageDataSpy = jest.fn();
      HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
        createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4), width: w, height: h }),
        putImageData: putImageDataSpy,
        imageSmoothingEnabled: true,
      }));

      const html = fs.readFileSync(path.join(__dirname, '../DaedalusX64/index.html'), 'utf8');
      const labMatch = html.match(/<article class="exhibit-card combiner-lab-card"[\s\S]*?<\/article>/);
      expect(labMatch).not.toBeNull();
      document.body.innerHTML = labMatch[0];

      const api = initCombinerPlayground();
      expect(api).not.toBeNull();
      expect(putImageDataSpy).toHaveBeenCalledTimes(3);

      const cppEl = document.getElementById('lab-cpp-output');
      expect(cppEl.textContent).toContain('BlendMode_0x00177e6035fcfd7eLL');

      const ex3Btn = document.querySelector('[data-combiner-preset="alpha_explore"]');
      ex3Btn.click();
      expect(ex3Btn.getAttribute('aria-pressed')).toBe('true');
      expect(cppEl.textContent).toContain('details.ColourAdjuster.SetAOpaque()');
      expect(document.getElementById('lab-diagnostic-msg').textContent).toContain('GU_TCC_RGBA');

      const tccSelect = document.getElementById('lab-gu-tcc');
      tccSelect.value = 'GU_TCC_RGB';
      tccSelect.dispatchEvent(new Event('change'));
      expect(document.getElementById('lab-tbl-alpha-note').textContent).toBe('GU_TCC_RGB + SetAOpaque()');
      expect(cppEl.textContent).toContain('sceGuTexFunc( GU_TFX_BLEND, GU_TCC_RGB );');

      const lodSlider = document.getElementById('lab-prim-lod');
      lodSlider.value = '75';
      lodSlider.dispatchEvent(new Event('input'));
      expect(lodSlider.style.getPropertyValue('--control-value')).toBe('75');
      expect(lodSlider.getAttribute('aria-valuetext')).toBe('0.75');
      expect(document.getElementById('lab-prim-lod-val').textContent).toBe('0.75');
    });
  });
});
