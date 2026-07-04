## 2024-05-18 - Uncapped Idle Animation Loops
**Learning:** Continuous `requestAnimationFrame` loops for UI effects (like custom cursors) that don't pause when idle cause constant baseline CPU usage (3-5%) even when the user isn't interacting with the page.
**Action:** Always track motion states and pause `requestAnimationFrame` loops when target coordinates are reached. Restart the loop conditionally from event listeners.

## 2024-05-19 - Garbage Collection Thrashing in Animation Loops
**Learning:** Continuous string interpolation (e.g. `\`rgba(..., \${alpha})\``) inside a `requestAnimationFrame` loop spanning multiple elements (like 30 streams with 20 characters) causes tens of thousands of string allocations per second. This leads to garbage collection (GC) thrashing, resulting in micro-stutters and increased CPU usage.
**Action:** Pre-calculate and cache strings or style objects during initialization (or when state changes) instead of generating them dynamically within high-frequency render loops.

## 2024-07-03 - Avoiding Math.hypot in Hot Animation Loops
**Learning:** `Math.hypot()` carries a significant overhead (in V8/JS engines) because it handles an arbitrary number of arguments and incorporates safeguards against overflow/underflow. In tight, high-frequency render loops (like `<canvas>` animations) where coordinate values are standard pixel boundaries, the extra safety of `Math.hypot` is unnecessary.
**Action:** Replace `Math.hypot(dx, dy)` with the simpler, faster mathematical equivalent `Math.sqrt(dx * dx + dy * dy)` inside hot loops, and hoist invariant calculations (like `dx`) outside of inner loops to drastically reduce computation time.

## 2024-07-15 - Uncaching DOM Properties inside Nested Animation Loops
**Learning:** Reading DOM properties like `window.innerHeight` and `window.innerWidth` forces the JavaScript engine to cross the C++ boundary, and in some engines can trigger synchronous layout recalculations (layout thrashing). When these properties are accessed unconditionally inside deeply nested `requestAnimationFrame` render loops (e.g., hundreds of times per frame, totaling tens of thousands of times per second), it creates a severe performance bottleneck.
**Action:** Always extract invariant DOM properties to local cached variables at the top of an animation frame (e.g., `const winHeight = window.innerHeight`), and use the cached local variables for all boundary calculations within that frame. Additionally, move static canvas context configurations (like `ctx.font`) out of the loop and into `init()` handlers triggered only on setup or resize.
