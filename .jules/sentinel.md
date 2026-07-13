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
