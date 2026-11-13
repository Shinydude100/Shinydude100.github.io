// DaedalusX64 Microcode Exhibit — Interactive Comparison Slider, Color Combiner Lab & Security Delegation
// Sentinel & Bolt Hardened: Externalized Script (CSP script-src 'self'), Zero Inline Handlers, Zero innerHTML

const COMBINER_PRESETS = {
  kokiri: {
    id: 'kokiri',
    label: 'Kokiri Sword Blade',
    key: '0x00177e6035fcfd7eLL',
    sprite: 'kokiri',
    c0: {
      rgbA: 'Texel0', rgbB: 'Primitive', rgbC: 'PrimLODFrac', rgbD: 'Texel0',
      aA: '0', aB: '0', aC: '0', aD: '1',
    },
    c1: {
      rgbA: 'Primitive', rgbB: 'Env', rgbC: 'Combined', rgbD: 'Env',
      aA: '0', aB: '0', aC: '0', aD: '1',
    },
    registers: {
      primColor: '#cbd5e1',
      envColor: '#1d4ed8',
      shadeColor: '#e2e8f0',
      primLodFrac: 35,
      envAlpha: 85,
      primAlpha: 100,
    },
    psp: {
      tfx: 'GU_TFX_BLEND',
      tcc: 'GU_TCC_RGBA',
      adjuster: 'set_rgba_env',
      texEnvSrc: 'prim',
      setAOpaque: false,
      firstCycle: false,
      pulseAnim: false,
    },
  },
  cucco: {
    id: 'cucco',
    label: 'Cuccos & Sword Hilt',
    key: '0x0030fe045ffefdfeLL',
    sprite: 'cucco',
    c0: {
      rgbA: 'Primitive', rgbB: 'Env', rgbC: 'Texel0', rgbD: 'Env',
      aA: '0', aB: '0', aC: '0', aD: '1',
    },
    c1: {
      rgbA: 'Combined', rgbB: '0', rgbC: 'Shade', rgbD: '0',
      aA: '0', aB: '0', aC: '0', aD: '1',
    },
    registers: {
      primColor: '#fef3c7',
      envColor: '#78350f',
      shadeColor: '#fde68a',
      primLodFrac: 50,
      envAlpha: 100,
      primAlpha: 100,
    },
    psp: {
      tfx: 'GU_TFX_MODULATE',
      tcc: 'GU_TCC_RGBA',
      adjuster: 'set_rgb_prim',
      texEnvSrc: 'env',
      setAOpaque: false,
      firstCycle: false,
      pulseAnim: false,
    },
  },
  alpha_explore: {
    id: 'alpha_explore',
    label: 'Alpha Channel & Blend Exploration',
    key: 'Exhibit 3 (Kreationz & Shinydude100)',
    sprite: 'alpha_fairy',
    c0: {
      rgbA: 'Texel0', rgbB: 'Env', rgbC: 'Shade', rgbD: 'Env',
      aA: 'Texel0', aB: '0', aC: 'Primitive', aD: '0',
    },
    c1: {
      rgbA: 'Combined', rgbB: '0', rgbC: '1', rgbD: '0',
      aA: 'Combined', aB: '0', aC: '1', aD: '0',
    },
    registers: {
      primColor: '#ffffff',
      envColor: '#00f0ff',
      shadeColor: '#34d399',
      primLodFrac: 50,
      envAlpha: 80,
      primAlpha: 90,
    },
    psp: {
      tfx: 'GU_TFX_BLEND',
      tcc: 'GU_TCC_RGBA',
      adjuster: 'set_rgb_env',
      texEnvSrc: 'prim',
      setAOpaque: true,
      firstCycle: false,
      pulseAnim: false,
    },
  },
  ssb_bomb: {
    id: 'ssb_bomb',
    label: 'Partial-Flashing Bomb (Smash Bros)',
    key: '0x00127eacf0fff238LL',
    sprite: 'ssb_bomb',
    c0: {
      rgbA: 'Texel0', rgbB: '0', rgbC: 'Shade', rgbD: '0',
      aA: '0', aB: '0', aC: '0', aD: 'Texel0',
    },
    c1: {
      rgbA: 'Env', rgbB: 'Combined', rgbC: 'EnvAlpha', rgbD: 'Combined',
      aA: '0', aB: '0', aC: '0', aD: 'Combined',
    },
    registers: {
      primColor: '#ffffff',
      envColor: '#ef4444',
      shadeColor: '#f8fafc',
      primLodFrac: 50,
      envAlpha: 65,
      primAlpha: 100,
    },
    psp: {
      tfx: 'GU_TFX_BLEND',
      tcc: 'GU_TCC_RGBA',
      adjuster: 'set_rgb_env',
      texEnvSrc: 'env',
      setAOpaque: false,
      firstCycle: false,
      pulseAnim: false,
    },
  },
};

function clamp01(val) {
  if (!Number.isFinite(val)) return 0;
  return val < 0 ? 0 : (val > 1 ? 1 : val);
}

function hexToNormalizedRgb(hex) {
  if (typeof hex !== 'string') return [1, 1, 1];
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return [1, 1, 1];
  const intVal = parseInt(m[1], 16);
  return [
    ((intVal >> 16) & 255) / 255,
    ((intVal >> 8) & 255) / 255,
    (intVal & 255) / 255,
  ];
}

function generateProceduralTexel(spriteId, x, y, size) {
  const denom = Math.max(1, size - 1);
  const u = (x / denom) * 2 - 1;
  const v = (y / denom) * 2 - 1;
  const distSq = u * u + v * v;
  const dist = Math.sqrt(distSq);

  // Gouraud vertex lighting gradient across sprite
  const shadeIntensity = clamp01(0.65 + 0.35 * (-u * 0.55 - v * 0.55));
  const stripe = 0.5 + 0.5 * Math.sin((u + v) * 14);

  if (spriteId === 'kokiri') {
    // Diagonal blade geometry from top-right (+u, -v) down to bottom-left (-u, +v)
    const axis = (u - v) * 0.7071;
    const cross = (u + v) * 0.7071;
    const halfWidth = clamp01(0.32 - axis * 0.22);
    const inBlade = axis > -0.45 && axis < 0.85 && Math.abs(cross) < halfWidth;
    const isHilt = Math.abs(axis + 0.45) < 0.08 && Math.abs(cross) < 0.42;
    const isGrip = axis <= -0.45 && axis > -0.82 && Math.abs(cross) < 0.11;

    if (inBlade) {
      const bevel = 1 - Math.abs(cross) / Math.max(0.05, halfWidth);
      const fuller = Math.abs(cross) < 0.055 ? 0.14 : 0;
      const spec = clamp01(0.45 + 0.45 * bevel + 0.15 * stripe - fuller);
      return {
        texel0: [spec * 0.88, spec * 0.96, clamp01(spec * 1.05), 1],
        texel1: [0.35 + 0.2 * bevel, 0.55, 0.8, 1],
        shadeIntensity,
      };
    }
    if (isHilt) {
      return {
        texel0: [0.14, 0.72, 0.42, 1],
        texel1: [0.1, 0.5, 0.3, 1],
        shadeIntensity,
      };
    }
    if (isGrip) {
      return {
        texel0: [0.55, 0.34, 0.18, 1],
        texel1: [0.3, 0.2, 0.12, 1],
        shadeIntensity,
      };
    }
    // Soft feathered outer halo (alpha < 1 demonstrates GU_TCC_RGBA vs GU_TCC_RGB!)
    const edgeAlpha = clamp01(1 - Math.max(0, Math.abs(cross) - halfWidth) * 3.5);
    return {
      texel0: [0.18, 0.25, 0.36, edgeAlpha * 0.35],
      texel1: [0.15, 0.2, 0.3, edgeAlpha * 0.35],
      shadeIntensity,
    };
  }

  if (spriteId === 'cucco') {
    const featherBand = 0.5 + 0.5 * Math.cos(u * 12 + Math.sin(v * 6) * 1.6);
    const inWing = dist < 0.82;
    const crest = v < -0.35 && Math.abs(u) < 0.25;
    if (crest) {
      return {
        texel0: [0.92, 0.22, 0.28, 1],
        texel1: [0.8, 0.3, 0.2, 1],
        shadeIntensity,
      };
    }
    if (inWing) {
      const lum = clamp01(0.52 + 0.44 * featherBand - dist * 0.28);
      return {
        texel0: [lum, lum * 0.96, lum * 0.86, 1],
        texel1: [0.7, 0.65, 0.5, 1],
        shadeIntensity,
      };
    }
    const edgeA = clamp01((0.95 - dist) / 0.13);
    return {
      texel0: [0.65, 0.58, 0.48, edgeA * 0.45],
      texel1: [0.4, 0.35, 0.28, edgeA * 0.45],
      shadeIntensity,
    };
  }

  if (spriteId === 'alpha_fairy') {
    const radial = clamp01(1 - dist * 1.05);
    const ring = clamp01(0.55 + 0.45 * Math.sin(dist * 15));
    const core = dist < 0.28 ? 1 : 0;
    const alpha = core ? 1 : clamp01(radial * 0.88);
    return {
      texel0: [
        clamp01(0.35 + 0.65 * ring + core * 0.3),
        clamp01(0.75 + 0.25 * ring),
        clamp01(0.95),
        alpha,
      ],
      texel1: [0.2, 0.85, 0.95, alpha],
      shadeIntensity,
    };
  }

  // 'ssb_bomb': Super Smash Bros rounded bomb sprite
  const inSphere = dist < 0.72;
  const inFuseBase = v < -0.64 && v > -0.82 && Math.abs(u) < 0.16;
  const isSpark = (u - 0.1) * (u - 0.1) + (v + 0.88) * (v + 0.88) < 0.015;
  if (isSpark) {
    return { texel0: [1, 0.88, 0.25, 1], texel1: [1, 0.5, 0.1, 1], shadeIntensity: 1 };
  }
  if (inFuseBase) {
    return { texel0: [0.65, 0.52, 0.28, 1], texel1: [0.5, 0.4, 0.2, 1], shadeIntensity };
  }
  if (inSphere) {
    const isLeftEye = Math.abs(u + 0.22) < 0.06 && Math.abs(v + 0.08) < 0.14;
    const isRightEye = Math.abs(u - 0.12) < 0.06 && Math.abs(v + 0.08) < 0.14;
    if (isLeftEye || isRightEye) {
      return { texel0: [0.97, 0.98, 1, 1], texel1: [1, 1, 1, 1], shadeIntensity: 1 };
    }
    const zNorm = Math.sqrt(Math.max(0, 0.72 * 0.72 - distSq)) / 0.72;
    const highlight = clamp01((-u * 0.45 - v * 0.55 + zNorm * 0.85) * 0.55);
    return {
      texel0: [
        clamp01(0.08 + highlight * 0.34),
        clamp01(0.14 + highlight * 0.44),
        clamp01(0.32 + highlight * 0.58),
        1,
      ],
      texel1: [0.15, 0.2, 0.45, 1],
      shadeIntensity,
    };
  }
  return { texel0: [0, 0, 0, 0], texel1: [0, 0, 0, 0], shadeIntensity };
}

function resolveCombinerSource(sourceName, isAlpha, ctx) {
  if (isAlpha) {
    switch (sourceName) {
      case 'Texel0': return ctx.texel0[3];
      case 'Texel1': return ctx.texel1[3];
      case 'Primitive': return ctx.prim[3];
      case 'Env': return ctx.env[3];
      case 'Shade': return ctx.shade[3];
      case 'PrimLODFrac': return ctx.primLodFrac;
      case 'Combined': return ctx.combined[3];
      case '1': return 1;
      case '0':
      default:
        return 0;
    }
  }
  switch (sourceName) {
    case 'Texel0': return [ctx.texel0[0], ctx.texel0[1], ctx.texel0[2]];
    case 'Texel1': return [ctx.texel1[0], ctx.texel1[1], ctx.texel1[2]];
    case 'Primitive': return [ctx.prim[0], ctx.prim[1], ctx.prim[2]];
    case 'Env': return [ctx.env[0], ctx.env[1], ctx.env[2]];
    case 'Shade': return [ctx.shade[0], ctx.shade[1], ctx.shade[2]];
    case 'PrimLODFrac': return [ctx.primLodFrac, ctx.primLodFrac, ctx.primLodFrac];
    case 'EnvAlpha': return [ctx.env[3], ctx.env[3], ctx.env[3]];
    case 'Texel0Alpha': return [ctx.texel0[3], ctx.texel0[3], ctx.texel0[3]];
    case 'Combined': return [ctx.combined[0], ctx.combined[1], ctx.combined[2]];
    case '1': return [1, 1, 1];
    case '0':
    default:
      return [0, 0, 0];
  }
}

function evalRdpCycle(cycleMux, ctx) {
  const aRgb = resolveCombinerSource(cycleMux.rgbA, false, ctx);
  const bRgb = resolveCombinerSource(cycleMux.rgbB, false, ctx);
  const cRgb = resolveCombinerSource(cycleMux.rgbC, false, ctx);
  const dRgb = resolveCombinerSource(cycleMux.rgbD, false, ctx);

  const r = clamp01((aRgb[0] - bRgb[0]) * cRgb[0] + dRgb[0]);
  const g = clamp01((aRgb[1] - bRgb[1]) * cRgb[1] + dRgb[1]);
  const b = clamp01((aRgb[2] - bRgb[2]) * cRgb[2] + dRgb[2]);

  const aA = resolveCombinerSource(cycleMux.aA, true, ctx);
  const bA = resolveCombinerSource(cycleMux.aB, true, ctx);
  const cA = resolveCombinerSource(cycleMux.aC, true, ctx);
  const dA = resolveCombinerSource(cycleMux.aD, true, ctx);
  const alpha = clamp01((aA - bA) * cA + dA);

  return [r, g, b, alpha];
}

function evalRdpCombiner(state, sampleCtx) {
  const baseCtx = { ...sampleCtx, combined: [0, 0, 0, 1] };
  const c0 = evalRdpCycle(state.c0, baseCtx);
  if (state.psp && state.psp.firstCycle) {
    return c0;
  }
  return evalRdpCycle(state.c1, { ...baseCtx, combined: c0 });
}

function evalPspGu(pspState, sampleCtx) {
  let cf = [...sampleCtx.shade];
  switch (pspState.adjuster) {
    case 'set_rgba_env':
      cf = [...sampleCtx.env];
      break;
    case 'set_rgb_env':
      cf = [sampleCtx.env[0], sampleCtx.env[1], sampleCtx.env[2], sampleCtx.shade[3]];
      break;
    case 'set_rgba_prim':
      cf = [...sampleCtx.prim];
      break;
    case 'set_rgb_prim':
      cf = [sampleCtx.prim[0], sampleCtx.prim[1], sampleCtx.prim[2], sampleCtx.shade[3]];
      break;
    case 'passthrough':
    default:
      cf = [...sampleCtx.shade];
      break;
  }

  if (pspState.setAOpaque) {
    cf[3] = 1;
  }

  let cc = [1, 1, 1, 1];
  if (pspState.texEnvSrc === 'env') {
    cc = [...sampleCtx.env];
  } else if (pspState.texEnvSrc === 'prim') {
    cc = [...sampleCtx.prim];
  }

  const ct = sampleCtx.texel0;
  const isRgbaTcc = pspState.tcc !== 'GU_TCC_RGB';
  let r = 0;
  let g = 0;
  let b = 0;
  let a = cf[3];

  switch (pspState.tfx) {
    case 'GU_TFX_MODULATE':
      r = cf[0] * ct[0];
      g = cf[1] * ct[1];
      b = cf[2] * ct[2];
      a = isRgbaTcc ? cf[3] * ct[3] : cf[3];
      break;
    case 'GU_TFX_BLEND':
      r = cf[0] * (1 - ct[0]) + cc[0] * ct[0];
      g = cf[1] * (1 - ct[1]) + cc[1] * ct[1];
      b = cf[2] * (1 - ct[2]) + cc[2] * ct[2];
      a = isRgbaTcc ? cf[3] * ct[3] : cf[3];
      break;
    case 'GU_TFX_DECAL':
      if (!isRgbaTcc) {
        r = ct[0];
        g = ct[1];
        b = ct[2];
      } else {
        r = cf[0] * (1 - ct[3]) + ct[0] * ct[3];
        g = cf[1] * (1 - ct[3]) + ct[1] * ct[3];
        b = cf[2] * (1 - ct[3]) + ct[2] * ct[3];
      }
      a = cf[3];
      break;
    case 'GU_TFX_REPLACE':
      r = ct[0];
      g = ct[1];
      b = ct[2];
      a = isRgbaTcc ? ct[3] : cf[3];
      break;
    case 'GU_TFX_ADD':
      r = cf[0] + ct[0];
      g = cf[1] + ct[1];
      b = cf[2] + ct[2];
      a = isRgbaTcc ? cf[3] * ct[3] : cf[3];
      break;
    default:
      r = cf[0] * ct[0];
      g = cf[1] * ct[1];
      b = cf[2] * ct[2];
      a = isRgbaTcc ? cf[3] * ct[3] : cf[3];
      break;
  }

  return [clamp01(r), clamp01(g), clamp01(b), clamp01(a)];
}

function formatCycleComment(prefix, mux, isAlpha) {
  if (isAlpha) {
    return `// ${prefix}: (${mux.aA.padEnd(11)} - ${mux.aB.padEnd(11)}) * ${mux.aC.padEnd(11)} + ${mux.aD}`;
  }
  return `// ${prefix}: (${mux.rgbA.padEnd(11)} - ${mux.rgbB.padEnd(11)}) * ${mux.rgbC.padEnd(11)} + ${mux.rgbD}`;
}

function generateGuCpp(state) {
  const fnSuffix = state.presetKey && /^0x[0-9a-f]+LL$/i.test(state.presetKey)
    ? state.presetKey
    : 'Custom_Lab';

  const lines = [
    formatCycleComment('aRGB0', state.c0, false),
    formatCycleComment('aA0  ', state.c0, true),
    formatCycleComment('aRGB1', state.c1, false),
    formatCycleComment('aA1  ', state.c1, true),
    `void BlendMode_${fnSuffix}( BLEND_MODE_ARGS )`,
    '{',
  ];

  if (state.psp.firstCycle) {
    lines.push('#ifdef CHECK_FIRST_CYCLE');
    lines.push('\tif( num_cycles == 1 )');
    lines.push('\t{');
    lines.push('\t\tdetails.ColourAdjuster.SetRGB( details.EnvColour );');
    lines.push(`\t\tsceGuTexFunc( ${state.psp.tfx}, GU_TCC_RGB );`);
    lines.push('\t}');
    lines.push('\telse');
    lines.push('#endif');
  }

  if (state.psp.setAOpaque) {
    lines.push('\tdetails.ColourAdjuster.SetAOpaque(); // Forces vertex Cf.a = 1.0 (Texel0.a still multiplies in GU_TCC_RGBA!)');
  }

  if (state.psp.texEnvSrc === 'prim') {
    lines.push('\tsceGuTexEnvColor( details.PrimColour.GetColour() );');
  } else if (state.psp.texEnvSrc === 'env') {
    lines.push('\tsceGuTexEnvColor( details.EnvColour.GetColour() );');
  }

  switch (state.psp.adjuster) {
    case 'set_rgba_env':
      lines.push('\tdetails.ColourAdjuster.SetRGBA( details.EnvColour );');
      break;
    case 'set_rgb_env':
      lines.push('\tdetails.ColourAdjuster.SetRGB( details.EnvColour );');
      break;
    case 'set_rgba_prim':
      lines.push('\tdetails.ColourAdjuster.SetRGBA( details.PrimColour );');
      break;
    case 'set_rgb_prim':
      lines.push('\tdetails.ColourAdjuster.SetRGB( details.PrimColour );');
      break;
    default:
      lines.push('\t// details.ColourAdjuster left in vertex Shade passthrough mode');
      break;
  }

  lines.push(`\tsceGuTexFunc( ${state.psp.tfx}, ${state.psp.tcc} );`);
  lines.push('}');
  return lines.join('\n');
}

function comparePixelsMetrics(n64Data, pspData) {
  const pixelCount = Math.floor(n64Data.length / 4);
  if (pixelCount <= 0) {
    return { rgbParity: 100, alphaParity: 100, totalParity: 100, maxDeltaPct: 0, rmsDiffPct: 0 };
  }
  let rgbSqSum = 0;
  let alphaSqSum = 0;
  let maxDelta = 0;

  for (let i = 0; i < n64Data.length; i += 4) {
    const dr = (n64Data[i] - pspData[i]) / 255;
    const dg = (n64Data[i + 1] - pspData[i + 1]) / 255;
    const db = (n64Data[i + 2] - pspData[i + 2]) / 255;
    const da = (n64Data[i + 3] - pspData[i + 3]) / 255;

    rgbSqSum += (dr * dr + dg * dg + db * db) / 3;
    alphaSqSum += da * da;
    const localMax = Math.max(Math.abs(dr), Math.abs(dg), Math.abs(db), Math.abs(da));
    if (localMax > maxDelta) maxDelta = localMax;
  }

  const rgbRms = Math.sqrt(rgbSqSum / pixelCount);
  const alphaRms = Math.sqrt(alphaSqSum / pixelCount);
  const totalRms = Math.sqrt((rgbSqSum * 3 + alphaSqSum) / (pixelCount * 4));

  return {
    rgbParity: clamp01(1 - rgbRms) * 100,
    alphaParity: clamp01(1 - alphaRms) * 100,
    totalParity: clamp01(1 - totalRms) * 100,
    maxDeltaPct: maxDelta * 100,
    rmsDiffPct: totalRms * 100,
  };
}

function buildDiagnosticMessage(state, metrics) {
  if (state.psp.setAOpaque && state.psp.tcc === 'GU_TCC_RGBA') {
    return `SetAOpaque() sets Cf.a = 1.0, yet GU_TCC_RGBA computes Cv.a = Cf.a * Texel0.a — so Texel0 alpha holes remain! Switch to GU_TCC_RGB to see opaque vertex alpha override texture transparency (Alpha parity: ${metrics.alphaParity.toFixed(1)}%).`;
  }
  if (state.psp.setAOpaque && state.psp.tcc === 'GU_TCC_RGB') {
    return `GU_TCC_RGB ignores Texel0.a and outputs Cv.a = Cf.a, so SetAOpaque() now locks pixel alpha to 1.0 across the entire primitive (Alpha parity: ${metrics.alphaParity.toFixed(1)}%).`;
  }
  if (metrics.totalParity >= 97) {
    return `High fidelity match (${metrics.totalParity.toFixed(1)}%): Sony PSP GU single-pass fixed function closely reproduces the N64 2-cycle RDP combiner result.`;
  }
  if (metrics.alphaParity < metrics.rgbParity - 10) {
    return `Alpha channel divergence (${metrics.alphaParity.toFixed(1)}% parity): compare GU_TCC_RGB vs GU_TCC_RGBA and ColourAdjuster SetRGB vs SetRGBA to align alpha propagation.`;
  }
  return `PSP HLE approximation delta (RGB ${metrics.rgbParity.toFixed(1)}%, Alpha ${metrics.alphaParity.toFixed(1)}%): PSP hardware lacks two independent N64 combiner cycles, requiring register/TexEnv approximations.`;
}

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

function initCombinerPlayground() {
  const labRoot = document.getElementById('combiner-lab');
  if (!labRoot) return null;

  const muxSelects = Array.from(labRoot.querySelectorAll('[data-mux]'));
  const presetBtns = Array.from(labRoot.querySelectorAll('[data-combiner-preset]'));
  const spriteSelect = document.getElementById('lab-sprite');
  const primColorInput = document.getElementById('lab-prim-color');
  const envColorInput = document.getElementById('lab-env-color');
  const shadeColorInput = document.getElementById('lab-shade-color');
  const primLodInput = document.getElementById('lab-prim-lod');
  const envAlphaInput = document.getElementById('lab-env-alpha');
  const primAlphaInput = document.getElementById('lab-prim-alpha');
  const guTfxSelect = document.getElementById('lab-gu-tfx');
  const guTccSelect = document.getElementById('lab-gu-tcc');
  const guAdjusterSelect = document.getElementById('lab-gu-adjuster');
  const guEnvSrcSelect = document.getElementById('lab-gu-env-src');
  const setAOpaqueInput = document.getElementById('lab-set-a-opaque');
  const firstCycleInput = document.getElementById('lab-first-cycle');
  const pulseAnimInput = document.getElementById('lab-pulse-anim');

  const activeKeyEl = document.getElementById('lab-active-key');
  const eqC0El = document.getElementById('lab-eq-c0');
  const eqC1El = document.getElementById('lab-eq-c1');
  const primLodValEl = document.getElementById('lab-prim-lod-val');
  const envAlphaValEl = document.getElementById('lab-env-alpha-val');
  const primAlphaValEl = document.getElementById('lab-prim-alpha-val');

  const n64Canvas = document.getElementById('lab-canvas-n64');
  const pspCanvas = document.getElementById('lab-canvas-psp');
  const diffCanvas = document.getElementById('lab-canvas-diff');
  const sampleN64El = document.getElementById('lab-sample-n64');
  const samplePspEl = document.getElementById('lab-sample-psp');
  const sampleDiffEl = document.getElementById('lab-sample-diff');

  const parityBannerEl = document.getElementById('lab-parity-banner');
  const parityVerdictEl = document.getElementById('lab-parity-verdict');
  const parityScoreEl = document.getElementById('lab-parity-score');
  const diagnosticMsgEl = document.getElementById('lab-diagnostic-msg');
  const tblRgbEl = document.getElementById('lab-tbl-rgb');
  const tblRgbNoteEl = document.getElementById('lab-tbl-rgb-note');
  const tblAlphaEl = document.getElementById('lab-tbl-alpha');
  const tblAlphaNoteEl = document.getElementById('lab-tbl-alpha-note');
  const tblCfEl = document.getElementById('lab-tbl-cf');
  const tblCcEl = document.getElementById('lab-tbl-cc');
  const cppOutputEl = document.getElementById('lab-cpp-output');

  const size = 64;
  let activePresetId = 'kokiri';
  let pulseRafId = 0;

  function syncRangeVars(slider, readoutEl) {
    if (!slider) return;
    const val = Number(slider.value) || 0;
    const normalized = (val / 100).toFixed(2);
    slider.style.setProperty('--attr-min', slider.min || '0');
    slider.style.setProperty('--attr-max', slider.max || '100');
    slider.style.setProperty('--control-value', String(val));
    slider.setAttribute('aria-valuetext', normalized);
    if (readoutEl) readoutEl.textContent = normalized;
  }

  function readMuxField(attr) {
    const el = labRoot.querySelector(`[data-mux="${attr}"]`);
    return el ? el.value : '0';
  }

  function setMuxField(attr, value) {
    const el = labRoot.querySelector(`[data-mux="${attr}"]`);
    if (el) el.value = value;
  }

  function readState() {
    const presetMeta = activePresetId ? COMBINER_PRESETS[activePresetId] : null;
    return {
      presetId: activePresetId,
      presetKey: presetMeta ? presetMeta.key : 'Custom Combiner Mux',
      sprite: spriteSelect ? spriteSelect.value : 'kokiri',
      c0: {
        rgbA: readMuxField('c0RgbA'),
        rgbB: readMuxField('c0RgbB'),
        rgbC: readMuxField('c0RgbC'),
        rgbD: readMuxField('c0RgbD'),
        aA: readMuxField('c0AlphaA'),
        aB: readMuxField('c0AlphaB'),
        aC: readMuxField('c0AlphaC'),
        aD: readMuxField('c0AlphaD'),
      },
      c1: {
        rgbA: readMuxField('c1RgbA'),
        rgbB: readMuxField('c1RgbB'),
        rgbC: readMuxField('c1RgbC'),
        rgbD: readMuxField('c1RgbD'),
        aA: readMuxField('c1AlphaA'),
        aB: readMuxField('c1AlphaB'),
        aC: readMuxField('c1AlphaC'),
        aD: readMuxField('c1AlphaD'),
      },
      registers: {
        primRgb: hexToNormalizedRgb(primColorInput ? primColorInput.value : '#cbd5e1'),
        envRgb: hexToNormalizedRgb(envColorInput ? envColorInput.value : '#1d4ed8'),
        shadeRgb: hexToNormalizedRgb(shadeColorInput ? shadeColorInput.value : '#e2e8f0'),
        primLodFrac: clamp01((Number(primLodInput ? primLodInput.value : 35) || 0) / 100),
        envAlpha: clamp01((Number(envAlphaInput ? envAlphaInput.value : 85) || 0) / 100),
        primAlpha: clamp01((Number(primAlphaInput ? primAlphaInput.value : 100) || 0) / 100),
      },
      psp: {
        tfx: guTfxSelect ? guTfxSelect.value : 'GU_TFX_BLEND',
        tcc: guTccSelect ? guTccSelect.value : 'GU_TCC_RGBA',
        adjuster: guAdjusterSelect ? guAdjusterSelect.value : 'set_rgba_env',
        texEnvSrc: guEnvSrcSelect ? guEnvSrcSelect.value : 'prim',
        setAOpaque: Boolean(setAOpaqueInput && setAOpaqueInput.checked),
        firstCycle: Boolean(firstCycleInput && firstCycleInput.checked),
        pulseAnim: Boolean(pulseAnimInput && pulseAnimInput.checked),
      },
    };
  }

  function updatePresetButtons(id) {
    presetBtns.forEach((btn) => {
      const isMatch = btn.getAttribute('data-combiner-preset') === id;
      btn.setAttribute('aria-pressed', isMatch ? 'true' : 'false');
    });
  }

  function renderSimulation() {
    syncRangeVars(primLodInput, primLodValEl);
    syncRangeVars(envAlphaInput, envAlphaValEl);
    syncRangeVars(primAlphaInput, primAlphaValEl);

    const state = readState();
    const { c0, c1, registers, psp } = state;

    if (activeKeyEl) {
      const presetInfo = state.presetId && COMBINER_PRESETS[state.presetId]
        ? `${COMBINER_PRESETS[state.presetId].key} (${COMBINER_PRESETS[state.presetId].label})`
        : 'Custom Combiner Mux (Modified)';
      activeKeyEl.textContent = `Active Preset Key: ${presetInfo}`;
    }

    if (eqC0El) {
      eqC0El.textContent = `aRGB0: (${c0.rgbA} - ${c0.rgbB}) * ${c0.rgbC} + ${c0.rgbD} | aA0: (${c0.aA} - ${c0.aB}) * ${c0.aC} + ${c0.aD}`;
    }
    if (eqC1El) {
      eqC1El.textContent = psp.firstCycle
        ? 'Cycle 1 bypassed (#ifdef CHECK_FIRST_CYCLE active)'
        : `aRGB1: (${c1.rgbA} - ${c1.rgbB}) * ${c1.rgbC} + ${c1.rgbD} | aA1: (${c1.aA} - ${c1.aB}) * ${c1.aC} + ${c1.aD}`;
    }

    const n64Pixels = new Uint8ClampedArray(size * size * 4);
    const pspPixels = new Uint8ClampedArray(size * size * 4);
    const diffPixels = new Uint8ClampedArray(size * size * 4);

    let centerN64 = [0, 0, 0, 255];
    let centerPsp = [0, 0, 0, 255];
    const centerCoord = Math.floor(size / 2);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const tex = generateProceduralTexel(state.sprite, x, y, size);
        const shade = [
          registers.shadeRgb[0] * tex.shadeIntensity,
          registers.shadeRgb[1] * tex.shadeIntensity,
          registers.shadeRgb[2] * tex.shadeIntensity,
          1,
        ];
        const sampleCtx = {
          texel0: tex.texel0,
          texel1: tex.texel1,
          prim: [registers.primRgb[0], registers.primRgb[1], registers.primRgb[2], registers.primAlpha],
          env: [registers.envRgb[0], registers.envRgb[1], registers.envRgb[2], registers.envAlpha],
          shade,
          primLodFrac: registers.primLodFrac,
        };

        const n64Out = evalRdpCombiner(state, sampleCtx);
        const pspOut = evalPspGu(psp, sampleCtx);

        const idx = (y * size + x) * 4;
        n64Pixels[idx] = Math.round(n64Out[0] * 255);
        n64Pixels[idx + 1] = Math.round(n64Out[1] * 255);
        n64Pixels[idx + 2] = Math.round(n64Out[2] * 255);
        n64Pixels[idx + 3] = Math.round(n64Out[3] * 255);

        pspPixels[idx] = Math.round(pspOut[0] * 255);
        pspPixels[idx + 1] = Math.round(pspOut[1] * 255);
        pspPixels[idx + 2] = Math.round(pspOut[2] * 255);
        pspPixels[idx + 3] = Math.round(pspOut[3] * 255);

        const dr = Math.abs(n64Out[0] - pspOut[0]);
        const dg = Math.abs(n64Out[1] - pspOut[1]);
        const db = Math.abs(n64Out[2] - pspOut[2]);
        const da = Math.abs(n64Out[3] - pspOut[3]);
        const rgbDiff = clamp01(((dr + dg + db) / 3) * 4);
        const alphaDiff = clamp01(da * 4);

        diffPixels[idx] = Math.round(rgbDiff * 255);
        diffPixels[idx + 1] = Math.round(alphaDiff * 210);
        diffPixels[idx + 2] = Math.round(Math.max(rgbDiff, alphaDiff) * 255);
        diffPixels[idx + 3] = Math.round(clamp01(Math.max(rgbDiff, alphaDiff) + 0.15) * 255);

        if (x === centerCoord && y === centerCoord) {
          centerN64 = [n64Pixels[idx], n64Pixels[idx + 1], n64Pixels[idx + 2], n64Pixels[idx + 3]];
          centerPsp = [pspPixels[idx], pspPixels[idx + 1], pspPixels[idx + 2], pspPixels[idx + 3]];
        }
      }
    }

    const drawToCanvas = (canvas, rgbaBytes) => {
      if (!canvas) return;
      try {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const offscreen = typeof ctx.createImageData === 'function'
          ? ctx.createImageData(size, size)
          : { data: new Uint8ClampedArray(size * size * 4), width: size, height: size };
        offscreen.data.set(rgbaBytes);

        if (canvas.width !== size || canvas.height !== size) {
          canvas.width = size;
          canvas.height = size;
        }
        ctx.imageSmoothingEnabled = false;
        ctx.putImageData(offscreen, 0, 0);
      } catch {
        // JSDOM canvas without native node-canvas support
      }
    };

    drawToCanvas(n64Canvas, n64Pixels);
    drawToCanvas(pspCanvas, pspPixels);
    drawToCanvas(diffCanvas, diffPixels);

    if (sampleN64El) sampleN64El.textContent = `Center RGBA: ${centerN64.join(', ')}`;
    if (samplePspEl) samplePspEl.textContent = `Center RGBA: ${centerPsp.join(', ')}`;

    const metrics = comparePixelsMetrics(n64Pixels, pspPixels);
    if (sampleDiffEl) {
      sampleDiffEl.textContent = `Max Δ: ${metrics.maxDeltaPct.toFixed(1)}% · RMS: ${metrics.rmsDiffPct.toFixed(1)}%`;
    }

    let parityState = 'divergent';
    let verdictText = '✕ CHANNEL DIVERGENCE // GLITCH RISK';
    if (metrics.totalParity >= 97) {
      parityState = 'exact';
      verdictText = '✔ EXACT PARITY // HARDWARE ALIGNED';
    } else if (metrics.totalParity >= 78) {
      parityState = 'approx';
      verdictText = '⚠ APPROXIMATE BLEND // PSP HLE APPROXIMATION';
    }

    if (parityBannerEl) parityBannerEl.setAttribute('data-state', parityState);
    if (parityVerdictEl) parityVerdictEl.textContent = verdictText;
    if (parityScoreEl) parityScoreEl.textContent = `PARITY: ${metrics.totalParity.toFixed(1)}%`;
    if (diagnosticMsgEl) diagnosticMsgEl.textContent = buildDiagnosticMessage(state, metrics);

    if (tblRgbEl) tblRgbEl.textContent = `${metrics.rgbParity.toFixed(1)}%`;
    if (tblRgbNoteEl) tblRgbNoteEl.textContent = psp.tfx;
    if (tblAlphaEl) tblAlphaEl.textContent = `${metrics.alphaParity.toFixed(1)}%`;
    if (tblAlphaNoteEl) {
      tblAlphaNoteEl.textContent = psp.setAOpaque ? `${psp.tcc} + SetAOpaque()` : psp.tcc;
    }
    if (tblCfEl) {
      const cfMap = {
        set_rgba_env: 'Cf: EnvColour (RGBA)',
        set_rgb_env: 'Cf: EnvColour (RGB)',
        set_rgba_prim: 'Cf: PrimColour (RGBA)',
        set_rgb_prim: 'Cf: PrimColour (RGB)',
        passthrough: 'Cf: Vertex Shade',
      };
      tblCfEl.textContent = cfMap[psp.adjuster] || psp.adjuster;
    }
    if (tblCcEl) {
      const ccMap = {
        prim: 'Cc: PrimColour',
        env: 'Cc: EnvColour',
        none: 'Cc: 0xFFFFFFFF',
      };
      tblCcEl.textContent = ccMap[psp.texEnvSrc] || psp.texEnvSrc;
    }

    if (cppOutputEl) {
      cppOutputEl.textContent = generateGuCpp(state);
    }

    return { state, metrics };
  }

  function applyPreset(presetId) {
    const preset = COMBINER_PRESETS[presetId];
    if (!preset) return;
    activePresetId = presetId;
    updatePresetButtons(presetId);

    setMuxField('c0RgbA', preset.c0.rgbA);
    setMuxField('c0RgbB', preset.c0.rgbB);
    setMuxField('c0RgbC', preset.c0.rgbC);
    setMuxField('c0RgbD', preset.c0.rgbD);
    setMuxField('c0AlphaA', preset.c0.aA);
    setMuxField('c0AlphaB', preset.c0.aB);
    setMuxField('c0AlphaC', preset.c0.aC);
    setMuxField('c0AlphaD', preset.c0.aD);

    setMuxField('c1RgbA', preset.c1.rgbA);
    setMuxField('c1RgbB', preset.c1.rgbB);
    setMuxField('c1RgbC', preset.c1.rgbC);
    setMuxField('c1RgbD', preset.c1.rgbD);
    setMuxField('c1AlphaA', preset.c1.aA);
    setMuxField('c1AlphaB', preset.c1.aB);
    setMuxField('c1AlphaC', preset.c1.aC);
    setMuxField('c1AlphaD', preset.c1.aD);

    if (spriteSelect) spriteSelect.value = preset.sprite;
    if (primColorInput) primColorInput.value = preset.registers.primColor;
    if (envColorInput) envColorInput.value = preset.registers.envColor;
    if (shadeColorInput) shadeColorInput.value = preset.registers.shadeColor;
    if (primLodInput) primLodInput.value = String(preset.registers.primLodFrac);
    if (envAlphaInput) envAlphaInput.value = String(preset.registers.envAlpha);
    if (primAlphaInput) primAlphaInput.value = String(preset.registers.primAlpha);

    if (guTfxSelect) guTfxSelect.value = preset.psp.tfx;
    if (guTccSelect) guTccSelect.value = preset.psp.tcc;
    if (guAdjusterSelect) guAdjusterSelect.value = preset.psp.adjuster;
    if (guEnvSrcSelect) guEnvSrcSelect.value = preset.psp.texEnvSrc;
    if (setAOpaqueInput) setAOpaqueInput.checked = preset.psp.setAOpaque;
    if (firstCycleInput) firstCycleInput.checked = preset.psp.firstCycle;
    if (pulseAnimInput) pulseAnimInput.checked = preset.psp.pulseAnim;

    stopPulse();
    renderSimulation();
  }

  function markCustomAndRender() {
    activePresetId = null;
    updatePresetButtons(null);
    renderSimulation();
  }

  function stopPulse() {
    if (pulseRafId && typeof window !== 'undefined' && typeof window.cancelAnimationFrame === 'function') {
      window.cancelAnimationFrame(pulseRafId);
    }
    pulseRafId = 0;
  }

  function stepPulse(ts) {
    if (!pulseAnimInput || !pulseAnimInput.checked || !envAlphaInput) {
      stopPulse();
      return;
    }
    const reduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      envAlphaInput.value = '75';
      renderSimulation();
      stopPulse();
      return;
    }
    const pulsePct = Math.round(50 + 50 * Math.sin((ts || 0) * 0.005));
    envAlphaInput.value = String(pulsePct);
    renderSimulation();
    if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
      pulseRafId = window.requestAnimationFrame(stepPulse);
    }
  }

  presetBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      applyPreset(btn.getAttribute('data-combiner-preset'));
    });
  });

  muxSelects.forEach((sel) => sel.addEventListener('change', markCustomAndRender));

  [spriteSelect, guTfxSelect, guTccSelect, guAdjusterSelect, guEnvSrcSelect].forEach((el) => {
    if (el) el.addEventListener('change', markCustomAndRender);
  });

  [primColorInput, envColorInput, shadeColorInput].forEach((el) => {
    if (el) el.addEventListener('input', renderSimulation);
  });

  [primLodInput, envAlphaInput, primAlphaInput].forEach((el) => {
    if (el) el.addEventListener('input', renderSimulation);
  });

  [setAOpaqueInput, firstCycleInput].forEach((el) => {
    if (el) el.addEventListener('change', renderSimulation);
  });

  if (pulseAnimInput) {
    pulseAnimInput.addEventListener('change', () => {
      if (pulseAnimInput.checked) {
        if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
          pulseRafId = window.requestAnimationFrame(stepPulse);
        } else {
          renderSimulation();
        }
      } else {
        stopPulse();
      }
    });
  }

  applyPreset('kokiri');
  return { applyPreset, renderSimulation };
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

  // Initialize N64 Color Combiner Playground
  initCombinerPlayground();

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
  module.exports = {
    COMBINER_PRESETS,
    clamp01,
    hexToNormalizedRgb,
    generateProceduralTexel,
    resolveCombinerSource,
    evalRdpCycle,
    evalRdpCombiner,
    evalPspGu,
    generateGuCpp,
    comparePixelsMetrics,
    updateComparisonSlider,
    setComparisonPreset,
    initCombinerPlayground,
    initDaedalusExhibits,
  };
}
