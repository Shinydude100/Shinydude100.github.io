## 2024-05-18 - Uncapped Idle Animation Loops
**Learning:** Continuous `requestAnimationFrame` loops for UI effects (like custom cursors) that don't pause when idle cause constant baseline CPU usage (3-5%) even when the user isn't interacting with the page.
**Action:** Always track motion states and pause `requestAnimationFrame` loops when target coordinates are reached. Restart the loop conditionally from event listeners.

## 2024-05-19 - Garbage Collection Thrashing in Animation Loops
**Learning:** Continuous string interpolation (e.g. `\`rgba(..., \${alpha})\``) inside a `requestAnimationFrame` loop spanning multiple elements (like 30 streams with 20 characters) causes tens of thousands of string allocations per second. This leads to garbage collection (GC) thrashing, resulting in micro-stutters and increased CPU usage.
**Action:** Pre-calculate and cache strings or style objects during initialization (or when state changes) instead of generating them dynamically within high-frequency render loops.
