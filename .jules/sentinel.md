## 2025-05-18 - [Security Enhancement] Replaced innerHTML with textContent
**Vulnerability:** Use of innerHTML for DOM updates which could theoretically be a vector for DOM-based XSS (though currently hardcoded).
**Learning:** Defense in depth: removing innerHTML sinks ensures safety against future regressions or strict static analysis linters.
**Prevention:** Use textContent and createElement/appendChild instead of innerHTML when updating the DOM.
