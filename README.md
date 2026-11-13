# daca.me — Agent-Native Systems Lab, Interactive Workbenches & MCP Server

## Overview

This repository contains the source code for the personal, consulting, and technical engineering platform hosted at [daca.me](https://daca.me). It pairs a high-contrast, terminal-inspired **Command-Center UI** across four static routes (`/`, `/support/`, `/DaedalusX64/`, `/admin/`) with a strict Content Security Policy (`script-src 'self'`), zero external font dependencies, interactive WebGL/2D canvas hardware simulations, native `<dialog>` workflows, and dual-layer **MCP + WebMCP** AI agent integration.

What started as a performance-hardened portfolio evolved into a live testbed for **Agentic Web Readiness Level 5** and **Chrome Modern Web Guidance**—combining machine-readable discovery endpoints and Cloudflare Edge Workers with browser-native APIs (`@view-transition`, Invoker Commands, `<dialog closedby="any">`, CSS Anchor Positioning, Scroll-Driven Animations, and `navigator.modelContext`).

## Architecture

This project uses a dual-layer architecture on a single domain:

```text
daca.me
├── GitHub Pages (static, CSP script-src 'self')
│   ├── /                → Command-Center Systems Lab, Hero Command Deck & Node Inspector (<dialog>)
│   ├── /support/        → DFW Tech Support, Bilingual EN/ES Switcher & Instant Quote Estimator
│   ├── /DaedalusX64/    → Interactive N64 RDP → Sony PSP GU Color Combiner Playground & Exhibits
│   ├── /admin/          → Glassmorphic Dispatch CRM (D1 ticket search & status filters)
│   └── Discovery        → /robots.txt, /sitemap.xml, /llms.txt, /portfolio.md, /schema.jsonld, /.well-known/*
└── Cloudflare Worker (edge / dynamic)
    ├── /mcp             → Live MCP server (Streamable HTTP transport, 6 custom tools)
    ├── /api/telemetry   → Live Cloudflare edge POP telemetry (colo, protocol, TLS, CF-RAY, RTT)
    └── worker/index.ts  → Cloudflare Worker edge security headers & JSON-RPC reference implementation
```

* **Static layer:** Raw HTML5, CSS, and vanilla externalized ES JavaScript with self-hosted `.woff2` fonts (`Inter`, `JetBrains Mono`, `Space Grotesk`), zero frameworks, zero `innerHTML` sinks, and zero layout shifts.
* **Interactive & Simulation layer:** Shared native `<dialog>` `Ctrl+K` / `⌘K` Command Palette (`command-palette.js`), 5 inspectable fleet infrastructure nodes (`#node-inspector-dialog`), an interactive DFW Quote Estimator pre-filling booking forms, and a pixel-accurate `64×64` procedural N64 2-cycle RDP to Sony PSP GU shader/blend playground.
* **Dynamic & WebMCP layer:** Live Cloudflare Worker at `/mcp` (`remote-mcp-server`) + `/api/telemetry`, complemented by browser-native WebMCP tool registration (`get_portfolio_info`, `get_services_and_pricing`) and `SubmitEvent.agentInvoked` form states on `/support/`.
* **Edge layer:** Cloudflare Transform Rules for `Content-Type` overrides, `Link` discovery headers, `Accept: text/markdown` negotiation, and hardened response security headers (`Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, `Cross-Origin-Opener-Policy: same-origin`).

## Recent Engineering Milestones (PRs #93–#98)

| PR | Scope | Key Improvements Shipped |
| --- | --- | --- |
| **#93** | **Modern Web Guidance & Jules Triad Hardening** | Eliminated stored DOM XSS in `/admin/` (`innerHTML` → `createElement`/`textContent` + `sanitizePhoneHref`); enforced strict `script-src 'self'` CSP & externalized JS across `/support/`, `/admin/`, `/DaedalusX64/`; self-hosted `.woff2` fonts on all sub-routes; added `AbortController` `fetch()` timeouts, `content-visibility: auto`, `<script type="speculationrules">`, `:user-invalid` validation, `field-sizing: content`, WebMCP form states, and global `rel="noopener noreferrer"` link delegation. |
| **#94** | **Command-Center Visual Overhaul & Interactive Telemetry HUD** | Unified all 4 routes with a shared command-center aesthetic; added scroll-progress bar (`animation-timeline: scroll()` + `rAF` fallback), Hero Command Deck (3 ARIA tabs + live `./ping_edge_telemetry.sh` probe + `--copy` Invoker buttons), CSS Anchor Positioning active nav underline, 5 distinct fleet node cards (`NODE-01`–`03`, `NODE-RX1`–`RX2`), `/support/` DFW dispatch console + service pre-selection, `/DaedalusX64/` exhibit jump bar + copyable C++, and `/admin/` ticket search & status filter pills. |
| **#95** | **Consistent Cross-Document Named View Transitions** | Enabled `@view-transition { navigation: auto; }` with shared `view-transition-name` landmarks (`site-header`, `brand-mark`, `hero-heading`, `hero-hud`), `<link rel="expect" href="#hero" blocking="render">`, and explicit `prefers-reduced-motion: reduce` opt-outs across `/`, `/support/`, and `/DaedalusX64/`. |
| **#96** | **Global `Ctrl+K` / `⌘K` Command Palette (`<dialog>`)** | Built [`command-palette.js`](command-palette.js) on native modal `<dialog closedby="any">` with `@starting-style` + `transition-behavior: allow-discrete` entry/exit animations, `canTransitionDisplay()` fallback for Firefox/Safari, `overscroll-behavior: contain` backdrop/modal scroll trapping, keyboard navigation, and route-aware command catalogs. |
| **#97** | **Bilingual `EN / ES` Toggle & Instant Quote Estimator** | Added persistent `EN \| ES` language switching (`?lang=es`, `localStorage`, `document.documentElement.lang` sync, strict `textContent` updates) and a live DFW Quote Estimator (`#quote-estimator`) calculating service tiers, dispatch zones, and add-ons before pre-filling the `/support/#book` form. |
| **#98** | **Interactive N64 Color Combiner Playground & Clickable Node Inspector** | Built a live 2-cycle N64 RDP `(A - B) * C + D` → Sony PSP GU (`GU_TFX_*`, `GU_TCC_RGB(A)`, `SetAOpaque()`, `ColourAdjuster`) simulator with triple `64×64` canvases (`N64 Ref`, `PSP HLE`, `4x Δ Heatmap`), parity telemetry table, and live `BlendModes.cpp` code generation on `/DaedalusX64/`; added native `<dialog>` **Node Telemetry Inspector** across all 5 fleet cards on `/` while preserving 3D parallax tilt physics and independent card links. |

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

The live edge MCP server at `https://daca.me/mcp` exposes 6 remote tools:

| Tool | Description |
| --- | --- |
| `get_agentic_status` | Returns the agentic readiness status of `daca.me` |
| `get_services` | Lists consulting and local technical support offerings with pricing |
| `get_contact` | Returns contact info, role, location, and GitHub link |
| `get_llms_txt` | Fetches and returns the `/llms.txt` content |
| `get_portfolio` | Fetches and returns the `/portfolio.md` content |
| `get_track_record` | Returns track record including DaedalusX64, zero-trust deployments, and infrastructure projects |

Client pages also register WebMCP tools (`get_portfolio_info`, `get_services_and_pricing` via `document.modelContext` / `navigator.modelContext`) and declarative/imperative WebMCP booking state feedback on `/support/`.

## File Structure

* `index.html`: Core Command-Center Systems Lab (`/`) with inline JSON-LD (`Person` + `ProfessionalService`), MCP discovery links, live telemetry bindings, 5 inspectable node cards, and `#node-inspector-dialog`.
* `script.js`: UI interactions, Hero Command Deck tabs, live `/api/telemetry` ping probe, Invoker `--copy` engine + legacy fallback, Clickable Node Inspector (`NODE_TELEMETRY_CATALOG`), WebMCP registration, and parallax card tilt physics.
* `memory-backplane.js`: CSP-compliant client-side matrix background `<canvas>` animation engine with `prefers-reduced-motion` and visibility-state throttling.
* `command-palette.js`: Shared global `Ctrl+K` / `⌘K` Command Palette (`<dialog closedby="any">`) shared across `/`, `/support/`, and `/DaedalusX64/`.
* `support/`: Local DFW Tech Support & PC Builds storefront (`support/index.html`, `support/support.js`) featuring bilingual `EN / ES` translation, `#quote-estimator`, dispatch HUD, and booking form validation.
* `DaedalusX64/`: Reverse-engineering showcase (`DaedalusX64/index.html`, `DaedalusX64/daedalus.js`, `DaedalusX64/assets/`) featuring the Interactive N64 RDP → PSP GU Color Combiner Playground and PSP-1000 comparison sliders across Exhibits 1–4.
* `admin/`: Glassmorphic Dispatch CRM (`admin/index.html`, `admin/admin.js`) with search, status filter pills, D1 ticket sync, and safe DOM creation.
* `worker/index.ts` & `wrangler.toml`: Cloudflare Worker edge routes, security headers, and JSON-RPC 2.0 MCP reference implementation (`daca-mcp-server`).
* `tests/`: Jest unit/DOM test suites (`memory-backplane.test.js`, `ui-interactions.test.js`, `console-typing.test.js`, `initCallGlitchText.test.js`, `n64-combiner.test.js`, `node-inspector.test.js`) and Playwright browser E2E suite (`test.spec.js`).
* `fonts/`: Zero-trust self-hosted `.woff2` fonts (`inter-v20-latin-regular.woff2`, `jetbrains-mono-v24-latin-regular.woff2`, `space-grotesk-v22-latin-regular.woff2`).
* `.well-known/`: Agent discovery files (`mcp/server-card.json`, `agent-card.json`, `mcp.json`, `agent-skills/index.json`, `api-catalog`, `oauth-authorization-server`, `oauth-protected-resource`, `openid-configuration`).
* `portfolio.md`, `llms.txt`, `schema.jsonld`, `robots.txt`, `sitemap.xml`: Machine-readable discovery and content negotiation endpoints.
* `.jules/` & `.Jules/`: AI agent operational memory logs (`bolt.md`, `palette.md`, `sentinel.md`).
* `design.md`, `auth.md`, `SECURITY.md`, `LICENSE`: Design system specification, authentication docs, security policy, and license.

## Collaborative Workflow & Quality Gates

This repository is developed with **Chrome Modern Web Guidance** best practices and specialized engineering personas:

* **Sentinel (Security & Strict CSP):** Enforces `script-src 'self'` across all routes, zero inline event handlers, zero `innerHTML` sinks, URL scheme sanitization, `AbortController` `fetch()` timeouts, fail-fast CSPRNG randomness, and `rel="noopener noreferrer"` link delegation.
* **Bolt (Performance & Core Web Vitals):** Self-hosts `.woff2` fonts (`font-display: swap`), defers non-critical scripts, throttles `requestAnimationFrame` loops on idle/hidden tabs, uses fast square-root pixel math instead of `Math.hypot()`, and applies `content-visibility: auto`.
* **Palette (UX, Accessibility & Forced Colors):** Enforces native `<dialog>` top-layer focus handling, WCAG 2.5.3 Label in Name, `<fieldset>`/`<caption>`/`<th scope>` semantics, non-color status badges, `prefers-reduced-motion` fallbacks, and `@media (forced-colors: active)` system contrast borders.

### Running Automated Verification

* **Unit & DOM Integration (`pnpm exec jest`)**: Runs **6 suites / 41 tests** covering N64/PSP GU blend math, Node Inspector modal state & tilt preservation, telemetry animations, and memory backplane constraints.
* **Browser E2E (`pnpm exec playwright test`)**: Runs **5 Playwright specs** against a local HTTP server verifying telemetry error/timeout handling, `#node-inspector-dialog` workflows, `/DaedalusX64/` Combiner Lab canvas rendering + live C++ output, `Ctrl+K` Command Palette, desktop & `375px` mobile zero horizontal overflow, and zero runtime console/page errors.

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
