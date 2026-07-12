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

## 2024-11-20 - Array Transformation Chains in Animation Loops
**Learning:** Using array transformation chains (like `split('').map(...).join('')`) inside high-frequency animation loops (such as a 25ms `setInterval`) causes excessive allocations and rapid Garbage Collection (GC) thrashing. Creating arrays, mapping them, and joining them back to strings many times per second per element leads to unnecessary overhead and potential UI stutters.
**Action:** Replace `split/map/join` chains with a pre-calculated length and a simple string concatenation loop (using `+=` and `charAt` or array indexing on strings) within animation loops to avoid allocating short-lived array objects entirely.

## 2025-02-27 - Canvas fillStyle RGBA Parsing Overhead
**Learning:** Assigning CSS strings like `rgba(...)` to `ctx.fillStyle` inside a hot render loop forces the browser to parse strings on every frame, causing a CPU bottleneck.
**Action:** Use base hex codes (e.g., `#fde047`) for `ctx.fillStyle` and separate the transparency by applying a numeric float to `ctx.globalAlpha` instead.

## 2025-02-28 - Crypto API Buffer Allocation Overhead
**Learning:** Calling `window.crypto.getRandomValues(new Uint32Array(1))` repeatedly within high-frequency loops (like animation frames or interval loops) creates severe CPU overhead and Garbage Collection (GC) thrashing due to continuous typed array allocation and FFI boundary crossing per single value.
**Action:** Pre-allocate a larger buffer (e.g., `new Uint32Array(256)`), track an index, and consume values sequentially. Only refill the buffer via `window.crypto.getRandomValues(buffer)` when the index exceeds the buffer length. This drastically reduces allocations and CPU wait time.
