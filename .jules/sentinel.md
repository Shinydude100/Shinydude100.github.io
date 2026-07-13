## 2025-05-18 - [Security Enhancement] Replaced innerHTML with textContent
**Vulnerability:** Use of innerHTML for DOM updates which could theoretically be a vector for DOM-based XSS (though currently hardcoded).
**Learning:** Defense in depth: removing innerHTML sinks ensures safety against future regressions or strict static analysis linters.
**Prevention:** Use textContent and createElement/appendChild instead of innerHTML when updating the DOM.

## 2026-07-03 - [Security Enhancement] Enforced explicit timeout on external API calls
**Vulnerability:** The application was making an external fetch request without an explicit timeout, posing a risk of resource exhaustion or hanging connections if the API server was unresponsive.
**Learning:** Defense in depth: Client-side logic should not assume that external services will respond promptly.
**Prevention:** Always attach an AbortController with a setTimeout to `fetch` calls.

## 2026-07-04 - [Security Enhancement] Added structural validation to external API payload
**Vulnerability:** The application was trusting the structure of the JSON payload returned by an external API (GitHub). If the API response changed or an error occurred (e.g., returning an object instead of an array), it could lead to unhandled TypeErrors during iteration (`TypeError: payloads is not iterable`), causing execution to halt unexpectedly and bypassing the intended `catch` block fallback.
**Learning:** Defense in depth: Never trust external input, even from seemingly reliable third-party APIs. Always validate the structure and types of the data before processing it.
**Prevention:** Implement type and structure checks (e.g., `Array.isArray()`, `typeof`) on data received from external sources before iterating or accessing properties.
## 2026-07-04 - [Security Enhancement] Prevent Referer Leakage on External Links
**Vulnerability:** External links were missing the `referrerpolicy="no-referrer"` attribute, which could leak internal or sensitive URL paths to third-party sites.
**Learning:** Defense in depth: Always use `referrerpolicy="no-referrer"` (along with `rel="noopener noreferrer"`) on external links to protect user privacy and prevent data leakage.
**Prevention:** Add `referrerpolicy="no-referrer"` to all external anchor tags.

## 2026-07-10 - [Security Enhancement] Enforce cryptographically secure random number generation
**Vulnerability:** Weak random number generation (`Math.random()`) was being used for randomized states, exposing potentially predictable entropy.
**Learning:** Defense in depth: Even for visual or non-cryptographic purposes like array shuffling, relying on `crypto.getRandomValues()` mitigates edge-case predictability and adheres to strict security linting practices.
**Prevention:** Avoid `Math.random()` entirely when possible and use a `getSecureRandom()` wrapper around `crypto.getRandomValues()`.

## 2026-07-13 - [Security Enhancement] Enforce secure RNG for animation states
**Vulnerability:** Weak random number generation (`Math.random()`) was being used extensively in `memory-backplane.js`, posing a risk of predictable entropy and violating strict security linting practices. Furthermore, doing this inline inside requestAnimationFrame creates performance and GC issues if not buffered.
**Learning:** Defense in depth: Even for visual animations, use `window.crypto.getRandomValues()`. When using it for continuous high-frequency RNG, pre-allocate a larger buffer (e.g. `Uint32Array(256)`) and consume it sequentially to prevent CPU overhead and GC thrashing.
**Prevention:** Avoid `Math.random()` entirely within the application. Add a class property buffer and a `getSecureRandom()` method to manage secure random values efficiently.
