## 2025-05-18 - [Security Enhancement] Replaced innerHTML with textContent
**Vulnerability:** Use of innerHTML for DOM updates which could theoretically be a vector for DOM-based XSS (though currently hardcoded).
**Learning:** Defense in depth: removing innerHTML sinks ensures safety against future regressions or strict static analysis linters.
**Prevention:** Use textContent and createElement/appendChild instead of innerHTML when updating the DOM.

## 2026-07-03 - [Security Enhancement] Enforced explicit timeout on external API calls
**Vulnerability:** The application was making an external fetch request without an explicit timeout, posing a risk of resource exhaustion or hanging connections if the API server was unresponsive.
**Learning:** Defense in depth: Client-side logic should not assume that external services will respond promptly.
**Prevention:** Always attach an AbortController with a setTimeout to `fetch` calls.

## 2026-07-04 - [Security Enhancement] Prevent Referer Leakage on External Links
**Vulnerability:** External links were missing the `referrerpolicy="no-referrer"` attribute, which could leak internal or sensitive URL paths to third-party sites.
**Learning:** Defense in depth: Always use `referrerpolicy="no-referrer"` (along with `rel="noopener noreferrer"`) on external links to protect user privacy and prevent data leakage.
**Prevention:** Add `referrerpolicy="no-referrer"` to all external anchor tags.
