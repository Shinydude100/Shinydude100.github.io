## 2026-07-02 - Screen Reader Punctuation in Pseudo-Terminal Aesthetics
**Learning:** This application heavily relies on "pseudo-terminal" aesthetics (e.g. `./connect_with_hugo.sh`, `pull_sanitized_resume.pdf`, `Core_Expertise`). Screen readers will read all punctuation aloud, which severely degrades the auditory experience and makes navigation confusing.
**Action:** Add natural-language `aria-label` attributes to all navigation links and interactive elements that use pseudo-terminal strings as their visible text content (e.g. converting `pull_sanitized_resume.pdf` to `"Download sanitized resume PDF"`).
## 2026-07-02 - Skip to Content Navigation Pattern
**Learning:** For a single-page application with complex 3D CSS and "pseudo-terminal" visual overlays, standard top-left "skip to content" links need high `z-index` and contrasting background colors to ensure they remain clearly visible during keyboard navigation.
**Action:** Always verify `z-index` bounds against complex hero elements like `#matrix-backplane` when adding accessible focus overlays.
## 2026-07-02 - Token Implementation Strategy
**Learning:** Migrating from hard-coded values to CSS variables for typography and shapes allows for centralizing design themes, but care must be taken to not affect SVG assets or internal components unintentionally. Replacing inline rgba usages with hex-derived alternatives enables rapid color shifting.
**Action:** Enforce strict usage of `var(--font-body)` or `var(--radius-md)` across components instead of raw sizing units to adhere to the design system.

## 2026-07-02 - Server Widget Redesign
**Learning:** Upgrading static UI elements (like cards) into detailed "widgets" with decorative overlays (like `.card-grid`, `.metric-grid`, `.activity-graph`) significantly enhances the technical dashboard aesthetic.
**Action:** Always wrap purely visual/decorative sub-elements with `aria-hidden="true"` to maintain accessibility and prevent screen readers from reading meaningless data or structure.

## 2026-07-02 - Silence Decorative Terminal Animations
**Learning:** Purely decorative, fast-updating terminal logs and structural SVGs create massive noise for screen readers, breaking the navigation experience.
**Action:** Always add `aria-hidden="true"` to large decorative visualizer blocks (like pseudo-terminals) and non-semantic SVG icons within UI controls.

## 2026-07-02 - Screen Reader Noise in Pseudo-Terminal Interfaces
**Learning:** Fast-updating typing animations simulating terminal output cause massive screen reader noise. Cryptic "pseudo-terminal" button text (like `./connect_with_hugo.sh`) provides a poor experience without tooltips.
**Action:** Always add `aria-hidden="true"` to dynamic typing animations, provide a static natural-language alternative using a `.sr-only` class, and append `title` attributes (matching `aria-label`) to pseudo-terminal buttons for visual tooltips.


## 2026-07-09 - Scroll Spy Navigation Accessibility
**Learning:** For single-page applications using Intersection Observers ("scroll spies") to visually highlight the active section, visual classes like `.active` do not convey information to screen readers.
**Action:** Always programmatically toggle the `aria-current="page"` attribute alongside visual highlight classes on navigation links to ensure keyboard and screen reader users know their context.
## 2026-07-02 - Enhancing State Feedback for Interactive Elements
**Learning:** For interactive UI elements (like a mobile menu toggle), users rely on immediate visual and structural feedback. A simple hamburger icon that never changes state creates ambiguity about whether the menu is open or closed, and screen readers need `aria-current="page"` to understand navigation context.
**Action:** When building interactive toggles, ensure the visual representation changes (e.g., morphing an SVG to an "X") alongside the `aria-expanded` attributes. For navigation links controlled by a ScrollSpy, dynamically update `aria-current="page"` to reflect the active page state.
## 2026-07-10 - Global CSS Reduced Motion
**Learning:** While JavaScript can check `window.matchMedia('(prefers-reduced-motion: reduce)')` to disable complex canvas rendering and typing logic, structural CSS animations (like pulsating elements, fades, and smooth scrolling) will still trigger.
**Action:** Always include a global CSS media query for `prefers-reduced-motion` that forces `animation-duration`, `transition-duration` to a near-zero value (e.g., `0.01ms`), and sets `scroll-behavior: auto !important` to ensure all structural styling respects the user's accessibility preferences.
## 2026-07-11 - Semantics for Decorative Mock Elements
**Learning:** For mock decorative UI elements styled as interactive buttons (e.g., terminal window controls) that lack actual event handlers, screen reader users might become confused if the element appears interactive visually but provides no structural feedback.
**Action:** Explicitly add `role="button"`, descriptive `aria-label`s, and `aria-disabled="true"` to mock controls. Any nested decorative shapes or SVG icons must be explicitly hidden with `aria-hidden="true"`. This ensures screen reader users perceive the visual layout correctly while understanding the elements are non-interactive.
## 2026-07-12 - Visual Tooltips for All Pseudo-Terminal UI
**Learning:** Sighted users relying on mouse navigation also experience cognitive friction with cryptic "pseudo-terminal" navigation links (like `Contact_Init`), not just primary buttons. Providing `title` attributes matching the `aria-label` provides a necessary visual tooltip for clarification.
**Action:** Always add visual tooltips (`title` attributes) matching `aria-label`s to *all* interactive elements using pseudo-terminal aesthetics, including primary navigation links and interactive toggles.
## 2026-07-08 - Active Navigation State Tracking
**Learning:** For single-page applications using Intersection Observers ("scroll spies") to visually highlight the active section, relying solely on CSS classes (like `.active`) is insufficient for screen readers. They require programmatic tracking of the active state.
**Action:** Always dynamically toggle the `aria-current="page"` attribute alongside visual highlight classes on navigation links to ensure keyboard and screen reader users know their current context.
## 2026-07-14 - Mobile Menu Overlay Accessibility
**Learning:** Users navigating overlay menus via keyboard lose their context when the menu closes, and mobile users expect to tap outside a menu to dismiss it. Lack of these interactions creates navigation dead-ends.
**Action:** Always implement focus restoration to the triggering element (e.g., `toggle.focus()`) when closing overlays, especially via the 'Escape' key or inner links. Bind a `document` click listener to dismiss menus when clicking outside the boundary.
## 2026-07-14 - Contrast Ratio for Subtle Elements
**Learning:** Subtle UI elements (like `.footer-loc` with `rgba(255,255,255,0.15)`) often fail WCAG contrast requirements against dark backgrounds.
**Action:** When designing subtle text, ensure the calculated luminance contrast ratio against the background color meets at least WCAG 4.5:1 (e.g., using `rgba(255,255,255,0.5)` on deep dark backgrounds).
