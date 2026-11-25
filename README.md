# daca.me — Agent-Native Systems Lab, Interactive Workbenches & MCP Server

## Overview

This repository contains the source code for the personal, consulting, and technical engineering platform hosted at [daca.me](https://daca.me). It pairs a high-contrast, executive-clear **Command-Center UI** across four static routes (`/`, `/support/`, `/DaedalusX64/`, `/admin/`) with a strict Content Security Policy (`script-src 'self'; style-src 'self'`), cascade-layered external CSS, zero external font dependencies, interactive 2D canvas hardware simulations, native `<dialog>` and `<details>` workflows, and dual-layer **MCP + WebMCP** AI agent integration.

What started as a performance-hardened portfolio evolved into a live testbed for **Agentic Web Readiness Level 5** and **Chrome Modern Web Guidance**—combining machine-readable discovery endpoints and Cloudflare Edge Workers with browser-native APIs (`@view-transition`, Invoker Commands, `<dialog closedby="any">`, `<details>` `::details-content` accordions, CSS Anchor Positioning, Scroll-Driven Animations, and `navigator.modelContext`).

## Architecture

This project uses a dual-layer architecture on a single domain:

```text
daca.me
├── GitHub Pages (static, CSP script-src 'self'; style-src 'self')
│   ├── /                → Executive Hero ("Problems I Solve" Panel), Asymmetric Bento Showcase,
│   │                      <details> Case Studies Accordion, Relocated #command-deck & Node Inspector (<dialog>)
│   ├── /support/        → DFW Tech Support, Bilingual EN/ES Switcher & Instant Quote Estimator
│   ├── /DaedalusX64/    → Interactive N64 RDP → Sony PSP GU Color Combiner Playground & Exhibits
│   ├── /admin/          → Glassmorphic Dispatch CRM (D1 ticket search & status filters)
│   └── Discovery        → /robots.txt, /sitemap.xml, /llms.txt, /portfolio.md, /schema.jsonld, /.well-known/*
└── Cloudflare Worker (edge / dynamic)
    ├── /mcp             → Live MCP server (Shinydude100/remote-mcp-server, Streamable HTTP, 8 custom tools)
    ├── /api/telemetry   → Live Cloudflare edge POP telemetry (colo, protocol, TLS, CF-RAY, RTT)
    └── worker/index.ts  → Cloudflare Worker edge security headers & JSON-RPC reference implementation
```

* **Static layer:** Raw HTML5, cascade-layered CSS (`@layer reset, base, components, pages, utilities` in `assets/*.css`), and vanilla externalized ES JavaScript with self-hosted variable `.woff2` fonts (`Inter`, `JetBrains Mono`, `Space Grotesk`), zero frameworks, zero inline styles/handlers, zero `innerHTML` sinks, and zero layout shifts.
* **Interactive & Simulation layer:** Shared native `<dialog>` `Ctrl+K` / `⌘K` Command Palette (`command-palette.js`), 5 inspectable fleet infrastructure nodes (`#node-inspector-dialog`), native `<details>` Case Studies accordion (`#case-studies`), relocated `#command-deck` live edge/MCP terminal, an interactive DFW Quote Estimator pre-filling booking forms, and a pixel-accurate `64×64` procedural N64 2-cycle RDP to Sony PSP GU shader/blend playground.
* **Dynamic & WebMCP layer:** Live Cloudflare Worker at `/mcp` (`Shinydude100/remote-mcp-server`, exposing 8 remote tools) + `/api/telemetry`, complemented by browser-native WebMCP tool registration (`get_portfolio_info`, `get_services_and_pricing`) and `SubmitEvent.agentInvoked` form states on `/support/`.
* **Edge layer:** Cloudflare Transform Rules for `Content-Type` overrides, `Link` discovery headers, `Accept: text/markdown` negotiation (rewriting `/` to `/portfolio.md`), and hardened response security headers (`Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, `Cross-Origin-Opener-Policy: same-origin`).

## Recent Engineering Milestones (PRs #93–#102)

| PR | Scope | Key Improvements Shipped |
| --- | --- | --- |
| **#93** | **Modern Web Guidance & Jules Triad Hardening** | Eliminated stored DOM XSS in `/admin/` (`innerHTML` → `createElement`/`textContent` + `sanitizePhoneHref`); enforced strict `script-src 'self'` CSP & externalized JS across `/support/`, `/admin/`, `/DaedalusX64/`; self-hosted `.woff2` fonts on all sub-routes; added `AbortController` `fetch()` timeouts, `content-visibility: auto`, `<script type="speculationrules">`, `:user-invalid` validation, `field-sizing: content`, WebMCP form states, and global `rel="noopener noreferrer"` link delegation. |
| **#94** | **Command-Center Visual Overhaul & Interactive Telemetry HUD** | Unified all 4 routes with a shared command-center aesthetic; added scroll-progress bar (`animation-timeline: scroll()` + `rAF` fallback), interactive Command Deck (3 ARIA tabs + live `./ping_edge_telemetry.sh` probe + `--copy` Invoker buttons), CSS Anchor Positioning active nav underline, 5 distinct fleet node cards (`NODE-01`–`03`, `NODE-RX1`–`RX2`), `/support/` DFW dispatch console + service pre-selection, `/DaedalusX64/` exhibit jump bar + copyable C++, and `/admin/` ticket search & status filter pills. |
| **#95** | **Consistent Cross-Document Named View Transitions** | Enabled `@view-transition { navigation: auto; }` with shared `view-transition-name` landmarks (`site-header`, `brand-mark`, `hero-heading`, `hero-hud`), `<link rel="expect" href="#hero" blocking="render">`, and explicit `prefers-reduced-motion: reduce` opt-outs across `/`, `/support/`, and `/DaedalusX64/`. |
| **#96** | **Global `Ctrl+K` / `⌘K` Command Palette (`<dialog>`)** | Built [`command-palette.js`](command-palette.js) on native modal `<dialog closedby="any">` with `@starting-style` + `transition-behavior: allow-discrete` entry/exit animations, `canTransitionDisplay()` fallback for Firefox/Safari, `overscroll-behavior: contain` backdrop/modal scroll trapping, keyboard navigation, and route-aware command catalogs. |
| **#97** | **Bilingual `EN / ES` Toggle & Instant Quote Estimator** | Added persistent `EN \| ES` language switching (`?lang=es`, `localStorage`, `document.documentElement.lang` sync, strict `textContent` updates) and a live DFW Quote Estimator (`#quote-estimator`) calculating service tiers, dispatch zones, and add-ons before pre-filling the `/support/#book` form. |
| **#98** | **Interactive N64 Color Combiner Playground & Clickable Node Inspector** | Built a live 2-cycle N64 RDP `(A - B) * C + D` → Sony PSP GU (`GU_TFX_*`, `GU_TCC_RGB(A)`, `SetAOpaque()`, `ColourAdjuster`) simulator with triple `64×64` canvases (`N64 Ref`, `PSP HLE`, `4x Δ Heatmap`), parity telemetry table, and live `BlendModes.cpp` code generation on `/DaedalusX64/`; added native `<dialog>` **Node Telemetry Inspector** across all 5 fleet cards on `/` while preserving 3D parallax tilt physics and independent card links. |
| **#99** | **Architecture & Agentic Discovery Documentation Sync** | Documented PRs #93–#98 milestones, `.well-known/` Level 5 agent discovery surfaces, remote MCP + client WebMCP tool catalogs, Cloudflare edge rules, and automated verification workflows in `README.md`. |
| **#100** | **Phase 1 Overhaul: Variable Typography, Cascade-Layered CSS, Strict `style-src 'self'` & De-Gimmicking** | Upgraded to variable-weight `.woff2` fonts (`inter-latin-wght-normal.woff2`, `space-grotesk-latin-wght-normal.woff2`, `jetbrains-mono-latin-wght-normal.woff2`) with `font-size-adjust: from-font`; extracted ~4,000 lines of inline styles into cascade-layered `/assets/*.css` (`core.css`, `home.css`, `support.css`, `daedalus.css`, `admin.css`) to enforce strict `style-src 'self'` (zero `'unsafe-inline'`) across all 4 routes; removed decorative background canvas/scrambler gimmicks and synthetic telemetry jitter. |
| **#101** | **Phase 2: Asymmetric Bento Layout, Tonal Surface Pacing & Case Studies Proof** | Refactored `#services` into a 12-column asymmetric Bento grid (`7/5` + full-width `DaedalusX64` showcase), added the Workstation Engineering Standards bar (`24h Prime95 + MemTest86`, `≤ 21 dBA`) in `#pc-builds`, built the native `<details>` Case Studies accordion (`CASE_01`–`CASE_03`) with Invoker `--toggle-all` controls, and gated scroll-driven reveals via `@supports (animation-timeline: view())`. |
| **#102** | **Conversion & Plain-English Messaging Redesign (Marketing Audit Integration)** | Rewrote `/` copy around plain-English outcomes (*"Eliminate Network Downtime & Hardware Bottlenecks."*), replaced the hero terminal with the **Problems I Solve** executive summary panel (relocating the interactive 3-tab terminal intact to `#command-deck`), streamlined hero CTAs to 2 actions + 4 KPIs, spotlighted the age-16 `DaedalusX64` origin story, and refined distinct navbar pills (`DFW Support`, `Contact`, `<kbd>⌘K</kbd>`). |

## Agent Discovery Surfaces

The site implements machine-readable discovery surfaces across root paths and `/.well-known/`, achieving verified Level 5 Agentic Readiness scores (10/10):

| Surface | URL | Purpose |
| --- | --- | --- |
| **robots.txt** | `/robots.txt` | AI crawler permissions + discovery directives |
| **sitemap.xml** | `/sitemap.xml` | XML sitemap with discovery and route endpoints |
| **llms.txt** | `/llms.txt` | LLM-optimized content summary with discovery links |
| **MCP Server Card** | `/.well-known/mcp/server-card.json` | MCP transport & capability declaration |
| **Agent Card** | `/.well-known/agent-card.json` | A2A + MCP interface declaration with skills |
| **Agent Skills Index** | `/.well-known/agent-skills/index.json` | Advertised agent skill capabilities |
| **MCP Manifest** | `/.well-known/mcp.json` | MCP endpoint & capabilities manifest |
| **API Catalog & Auth Metadata** | `/.well-known/api-catalog` | API catalog plus OAuth/OIDC discovery documents (`oauth-authorization-server`, `oauth-protected-resource`, `openid-configuration`) |
| **JSON-LD Schema** | `/schema.jsonld` | Schema.org `Person` & `ProfessionalService` entity disambiguation |

## MCP & WebMCP Tools

The live edge MCP server (`Shinydude100/remote-mcp-server`) at `https://daca.me/mcp` exposes 8 remote tools:

| Tool | Description |
| --- | --- |
| `get_agentic_status` | Returns the agentic readiness status of `daca.me` |
| `get_services` | Lists consulting and local technical support offerings with pricing |
| `get_contact` | Returns contact information, business listings, and professional links for Hugo Luna |
| `get_llms_txt` | Fetches and returns the `/llms.txt` content for LLM context ingestion |
| `get_portfolio` | Fetches and returns the live `/portfolio.md` content |
| `get_track_record` | Returns track record including DaedalusX64, zero-trust deployments, and infrastructure projects |
| `get_availability` | Returns current availability for new projects and incident/support response times |
| `get_case_study` | Returns detailed case study by project name (`DaedalusX64`, `Zero-Trust`, `daca.me`, `Workstations`) |

Client pages also register WebMCP tools (`get_portfolio_info`, `get_services_and_pricing` via `document.modelContext` / `navigator.modelContext`) and declarative/imperative WebMCP booking state feedback on `/support/`.

## File Structure

* `index.html`: Core Command-Center Systems Lab (`/`) with plain-English Executive Hero + *Problems I Solve* panel, inline JSON-LD (`Person` + `ProfessionalService`), MCP discovery links, asymmetric 12-column Bento showcase (spotlighting age-16 `DaedalusX64`), `<details>` Case Studies accordion (`#case-studies`), relocated `#command-deck` live edge/MCP terminal, 5 inspectable node cards, and `#node-inspector-dialog`.
* `script.js`: UI interactions, relocated `#command-deck` tabs & live `/api/telemetry` ping probe, Invoker `--copy` & `--toggle-all` engines + feature-detected fallbacks, Case Studies `<details>` accordion (`initCaseStudyAccordion`), Clickable Node Inspector (`NODE_TELEMETRY_CATALOG`), WebMCP registration (`initWebMCP`), and parallax card tilt physics.
* `assets/`: Cascade-layered stylesheets (`assets/core.css`, `assets/home.css`, `assets/support.css`, `assets/daedalus.css`, `assets/admin.css`) and UI icons (`assets/chevron-down.svg`) enforced under strict `style-src 'self'`.
* `command-palette.js`: Shared global `Ctrl+K` / `⌘K` Command Palette (`<dialog closedby="any">`) shared across `/`, `/support/`, and `/DaedalusX64/`.
* `support/`: Local DFW Tech Support & PC Builds storefront (`support/index.html`, `support/support.js`) featuring bilingual `EN / ES` translation, `#quote-estimator`, dispatch HUD, and booking form validation.
* `DaedalusX64/`: Reverse-engineering showcase (`DaedalusX64/index.html`, `DaedalusX64/daedalus.js`, `DaedalusX64/assets/`) featuring the Interactive N64 RDP → PSP GU Color Combiner Playground and PSP-1000 comparison sliders across Exhibits 1–4.
* `admin/`: Glassmorphic Dispatch CRM (`admin/index.html`, `admin/admin.js`) with search, status filter pills, D1 ticket sync, and safe DOM creation.
* `worker/index.ts` & `wrangler.toml`: Cloudflare Worker edge routes, security headers, and JSON-RPC 2.0 MCP reference implementation (`daca-mcp-server`).
* `tests/`: Jest unit/DOM test suites (`ui-interactions.test.js`, `n64-combiner.test.js`, `node-inspector.test.js`, `portfolio-markdown.test.js`) and Playwright browser E2E suite (`test.spec.js`).
* `fonts/`: Zero-trust self-hosted variable `.woff2` fonts (`inter-latin-wght-normal.woff2`, `jetbrains-mono-latin-wght-normal.woff2`, `space-grotesk-latin-wght-normal.woff2`).
* `.well-known/`: Agent discovery files (`mcp/server-card.json`, `agent-card.json`, `mcp.json`, `agent-skills/index.json`, `api-catalog`, `oauth-authorization-server`, `oauth-protected-resource`, `openid-configuration`).
* `portfolio.md`, `llms.txt`, `schema.jsonld`, `robots.txt`, `sitemap.xml`: Machine-readable discovery and content negotiation endpoints.
* `.jules/` & `.Jules/`: AI agent operational memory logs (`bolt.md`, `palette.md`, `sentinel.md`).
* `design.md`, `auth.md`, `SECURITY.md`, `LICENSE`: Design system specification, authentication docs, security policy, and license.

## Collaborative Workflow & Quality Gates

This repository is developed with **Chrome Modern Web Guidance** best practices and specialized engineering personas:

* **Sentinel (Security & Strict CSP):** Enforces `script-src 'self'` and `style-src 'self'` across all routes, zero inline styles or event handlers, zero `innerHTML` sinks, URL scheme sanitization, `AbortController` `fetch()` timeouts, fail-fast CSPRNG randomness, and `rel="noopener noreferrer"` link delegation.
* **Bolt (Performance & Core Web Vitals):** Self-hosts variable `.woff2` fonts (`font-display: swap`, `font-size-adjust: from-font`), defers non-critical scripts, pauses `requestAnimationFrame` loops on idle/hidden tabs, uses fast square-root pixel math instead of `Math.hypot()`, and applies `content-visibility: auto`.
* **Palette (UX, Accessibility & Forced Colors):** Enforces native `<dialog>` & `<details>` focus/disclosure semantics, WCAG 2.5.3 Label in Name, `<fieldset>`/`<caption>`/`<th scope>` semantics, non-color status badges, `prefers-reduced-motion` fallbacks, and `@media (forced-colors: active)` system contrast borders.

### Running Automated Verification

* **Unit & DOM Integration (`pnpm exec jest` / `npx jest`)**: Runs Jest suites (`tests/*.test.js` — 4 suites on baseline + docs parity) covering strict `style-src 'self'` CSP & external asset invariants across all 4 routes, N64/PSP GU blend math, Node Inspector `<dialog>` state & tilt preservation, Case Studies `<details>` accordion, plain-English hero & relocated `#command-deck` structure, and `portfolio.md` / `README.md` parity.
* **Browser E2E (`pnpm exec playwright test` / `npx playwright test`)**: Runs Playwright browser specs (`tests/*.spec.js` — 7 core route specs in `tests/test.spec.js`) against a local HTTP server verifying telemetry error/timeout handling, `#node-inspector-dialog` workflows, `/DaedalusX64/` Combiner Lab canvas rendering + live C++ output, asymmetric Bento layout & Case Studies accordion, relocated `#command-deck` & navbar pills, `Ctrl+K` Command Palette, responsive zero horizontal overflow across `375px` / `768px` / `1280px` / `1440px`, and zero runtime console/page errors.

## Cloudflare Configuration

| Feature | Configuration |
| --- | --- |
| **Worker Route** | `daca.me/mcp*` → `remote-mcp-server` |
| **Worker Route** | `daca.me/api/telemetry*` → `remote-mcp-server` |
| **Transform Rule (Response Header)** | `Content-Type: application/ld+json` on `/schema.jsonld` |
| **Transform Rule (Response Header)** | `Link` headers for agent discovery on `/` |
| **URL Rewrite Rule** | `Accept: text/markdown` on `/` → serve `/portfolio.md` |
| **Bot Fight Mode** | Disabled (agent accessibility) |
| **DNSSEC** | Enabled at root |
| **CNAME** | `daca.me` → `shinydude100.github.io` (proxied) |

## Audit Results

| Auditor | Score | Date |
| --- | --- | --- |
| **Gemini Spark** | **10.0 / 10** | **2026-08-03** |
| **ChatGPT** | **9.5 / 10** | **2026-08-03** |
| Initial (pre-MCP) | 8.1 / 10 | 2026-07-28 |

## The Vision

This codebase is a living system — not a static artifact. It serves as a real-world proof that a single engineer can build agent-native, standards-first infrastructure combining Cloudflare's edge network, GitHub Pages, the Model Context Protocol, and modern web platform capabilities—where every interactive control works natively in the browser, every metric is earned, and every discovery surface is verifiable.
