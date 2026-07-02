## 2026-07-02 - Screen Reader Punctuation in Pseudo-Terminal Aesthetics
**Learning:** This application heavily relies on "pseudo-terminal" aesthetics (e.g. `./connect_with_hugo.sh`, `pull_sanitized_resume.pdf`, `Core_Expertise`). Screen readers will read all punctuation aloud, which severely degrades the auditory experience and makes navigation confusing.
**Action:** Add natural-language `aria-label` attributes to all navigation links and interactive elements that use pseudo-terminal strings as their visible text content (e.g. converting `pull_sanitized_resume.pdf` to `"Download sanitized resume PDF"`).
## 2026-07-02 - Skip to Content Navigation Pattern
**Learning:** For a single-page application with complex 3D CSS and "pseudo-terminal" visual overlays, standard top-left "skip to content" links need high `z-index` and contrasting background colors to ensure they remain clearly visible during keyboard navigation.
**Action:** Always verify `z-index` bounds against complex hero elements like `#matrix-backplane` when adding accessible focus overlays.
