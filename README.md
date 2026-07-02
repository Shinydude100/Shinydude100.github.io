# Shinydude100.github.io (daca.me)

## Project Overview
This repository contains the source code for the personal and professional portfolio hosted at [daca.me](https://daca.me). It is designed as a highly optimized, terminal-inspired static website that showcases expertise in Systems Infrastructure and Security Architecture.

The vision behind this project is to create a digital presence that isn't just a document, but a reflection of core engineering principles: high performance, robust security, and precise, functional design. It serves as a continuous testing ground for web optimization and aesthetic exploration.

## Navigation & Architecture
This project is built using a raw HTML, vanilla JavaScript, and Tailwind CSS (via CDN) stack. It explicitly avoids heavy static site generators to maintain total control over the DOM and performance profile.

- **`index.html`**: The core entry point. Contains the complete markup and structure of the single-page application.
- **`memory-backplane.js`**: Contains the client-side JavaScript logic, separated from HTML for better security (CSP compliance) and testability.
- **`design.md`**: The design system manifesto. Outlines the specific colors, typography, layout grid, and "pseudo-terminal" aesthetic rules applied throughout the site.
- **`.jules/` & `.Jules/`**: Hidden directories containing operational memory for our AI agents.
  - `bolt.md`: Performance learnings and critical optimizations.
  - `sentinel.md`: Security directives and vulnerability prevention notes.
  - `palette.md`: UX, accessibility, and design polish guidelines.
- **`tests/`**: Contains Jest (unit) and Playwright (E2E) tests to ensure continuous stability.
- **`package.json`**: Manages development dependencies specifically for the testing environment (Jest, Playwright) and HTML validation tools.

## Our Collaborative Workflow
This repository is maintained through a unique, continuous collaboration between human direction and specialized AI agents. We utilize strict personas to ensure every PR maintains the high standards of the project:

- **🎨 Palette (UX & Accessibility)**: Focuses on small, targeted improvements to user experience, visual polish, and strict adherence to accessibility standards (like ARIA labels for pseudo-terminal aesthetics).
- **🛡️ Sentinel (Security)**: Enforces defensive coding practices, strict Content-Security-Policies (CSP), and mitigates potential vulnerabilities (e.g., prohibiting `innerHTML` usage).
- **⚡ Bolt (Performance)**: Obsessively monitors and improves rendering performance, CPU usage, and network load (e.g., managing garbage collection thrashing in animation loops).

All agents run rigorous pre-commit checks and automated tests (`pnpm test`) before submitting changes.

## The Vision
We view this codebase not as a static artifact, but as a living, breathing system. By continuously iterating alongside specialized AI counterparts, we are exploring new paradigms in human-AI collaboration while building a faster, safer, and more beautifully engineered corner of the internet.
