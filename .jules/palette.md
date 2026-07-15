## 2024-07-02 - Redesign Terminal UI
**Learning:** Learned to apply precise CSS matching for Windows 11 aesthetics, including system fonts, flex layouts, SVG control buttons, and custom scrollbars for `.terminal-mode`.
**Action:** Updated `index.html` CSS and HTML structure to reflect a native Windows 11 terminal window.

## 2026-07-02 - Mobile Responsiveness for Data Grids and Terminals
**Learning:** Learned to effectively manage horizontal overflow on compact screens by reducing padding, utilizing `word-wrap: break-word;` and `overflow-wrap: break-word;` on terminal logs, stacking grid templates (`grid-template-columns: 1fr;`), and scaling font sizes across breakpoints (`768px` and `480px`).
**Action:** Implemented robust responsive `@media` query updates in `index.html` to adapt `.matrix-grid`, `.interactive-card`, the PowerShell terminal layout, and memory grid components specifically for mobile displays.

## 2026-07-15 - Clarify Mock Terminal Control States
**Learning:** The design system heavily utilizes mock terminal window controls (`.win-btn`) for aesthetic purposes. While they correctly use `role="button"` and `aria-disabled="true"`, screen reader and mouse users can still experience cognitive friction because standard tooltips (e.g., "Minimize") imply interactivity. Explicitly documenting their inert nature in the tooltip/ARIA label prevents this friction while preserving the terminal aesthetic.
**Action:** Appended contextual explanations (e.g., `(Disabled in visualizer)`) to the `title` and `aria-label` of all mock terminal controls.
