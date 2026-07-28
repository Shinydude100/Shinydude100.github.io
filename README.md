# daca.me — Agent-Native Portfolio & MCP Server

## Overview
This repository contains the source code for the personal and professional portfolio hosted at [daca.me](https://daca.me), a terminal-inspired static website showcasing expertise in AI Systems Architecture, Agentic Web Transformations, and Security Engineering.

What started as a performance-optimized portfolio evolved into a living case study for AI agent readiness — a real, functional MCP server running on Cloudflare's edge network, with machine-readable discovery surfaces that allow autonomous AI agents to discover, connect to, and interact with the site programmatically.

## Architecture

This project uses a dual-layer architecture on a single domain:

```
daca.me
├── GitHub Pages (static)          → Homepage, /llms.txt, /portfolio.md, /schema.jsonld, /.well-known/*
└── Cloudflare Worker (dynamic)   → /mcp (live MCP server with 5 custom tools)
```

- **Static layer**: Raw HTML, vanilla JavaScript, zero-trust local font hosting. No heavy frameworks, no hydration, no layout shifts.
- **Dynamic layer**: Cloudflare Worker (`remote-mcp-server`) serving a live MCP server at `/mcp` using Streamable HTTP transport, with 5 custom tools for agent consumption.
- **Edge layer**: Cloudflare Transform Rules for Content-Type overrides, URL rewrites for Markdown negotiation, and response header injection for agent discovery.

## Agent Discovery Surfaces

The site implements 7 machine-readable discovery surfaces, all scoring 10/10 on independent AI readiness audits (Gemini Spark) and 9.5/10 (ChatGPT):

| Surface | URL | Purpose |
|---|---|---|
| `robots.txt` | `/robots.txt` | AI crawler permissions + discovery directives |
| `sitemap.xml` | `/sitemap.xml` | XML sitemap with all discovery endpoints |
| `llms.txt` | `/llms.txt` | LLM-optimized content summary with discovery links |
| MCP Server Card | `/.well-known/mcp/server-card.json` | MCP transport & capability declaration |
| Agent Card | `/.well-known/agent-card.json` | A2A + MCP interface declaration with skills |
| MCP Manifest | `/.well-known/mcp.json` | MCP endpoint & capabilities manifest |
| JSON-LD Schema | `/schema.jsonld` | Schema.org `Person` entity for disambiguation |

### MCP Server Tools

The live MCP server at `https://daca.me/mcp` exposes 5 tools:

| Tool | Description |
|---|---|
| `get_agentic_status` | Returns the agentic readiness status of daca.me |
| `get_services` | Lists service offerings with pricing |
| `get_contact` | Returns contact info, role, location, and GitHub link |
| `get_llms_txt` | Fetches and returns the /llms.txt content |
| `get_portfolio` | Fetches and returns the /portfolio.md content |

## File Structure

- **`index.html`**: Core entry point. Single-page application with inline JSON-LD, MCP discovery links, and terminal-inspired UI.
- **`memory-backplane.js`**: Client-side JavaScript logic, separated from HTML for CSP compliance.
- **`script.js`**: Additional UI interactions and WebMCP integration.
- **`design.md`**: Design system manifesto — colors, typography, layout grid, pseudo-terminal aesthetic.
- **`portfolio.md`**: Markdown version of the portfolio, served to agents via Cloudflare URL Rewrite Rules.
- **`llms.txt`**: LLM-optimized content summary with capabilities, discovery links, and resources.
- **`schema.jsonld`**: Schema.org `Person` structured data for entity disambiguation.
- **`robots.txt`**: AI crawler permissions for GPTBot, Google-Extended, PerplexityBot, ClaudeBot, Bytespider + custom discovery directives.
- **`sitemap.xml`**: XML sitemap with `<lastmod>` timestamps for all discovery surfaces.
- **`.well-known/`**: Agent discovery files (MCP server card, agent card, MCP manifest, OAuth metadata, API catalog).
- **`.jules/` & `.Jules/`**: AI agent operational memory (bolt.md, sentinel.md, palette.md).
- **`tests/`**: Jest (unit) and Playwright (E2E) tests.
- **`fonts/`**: Zero-trust local font hosting (Inter, JetBrains Mono, Space Grotesk).
- **`SECURITY.md`**: Edge-routing vulnerability scope.
- **`LICENSE`**: Custom proprietary licensing.

## Collaborative Workflow

This repository is maintained through continuous collaboration between human direction and specialized AI agents:

- **🎨 Palette (UX & Accessibility)**: Visual polish, ARIA labels, accessibility standards.
- **🛡️ Sentinel (Security)**: CSP enforcement, vulnerability prevention, defensive coding.
- **⚡ Bolt (Performance)**: Rendering performance, CPU optimization, network load.

All agents run pre-commit checks and automated tests (`pnpm test`) before submitting changes.

## Cloudflare Configuration

| Feature | Configuration |
|---|---|
| Worker Route | `daca.me/mcp*` → `remote-mcp-server` |
| Transform Rule (Response Header) | `Content-Type: application/ld+json` on `/schema.jsonld` |
| Transform Rule (Response Header) | `Link` headers for agent discovery on `/` |
| URL Rewrite Rule | `Accept: text/markdown` on `/` → serve `/portfolio.md` |
| Bot Fight Mode | Disabled (agent accessibility) |
| DNSSEC | Enabled at root |
| CNAME | `daca.me` → `shinydude100.github.io` (proxied) |

## Audit Results

| Auditor | Score | Date |
|---|---|---|
| Gemini Spark | 10.0/10 | 2026-07-28 |
| ChatGPT | 9.5/10 | 2026-07-28 |
| Initial (pre-MCP) | 8.1/10 | 2026-07-28 |

## The Vision

This codebase is a living system — not a static artifact. It serves as a real-world proof that a single developer can build agent-native infrastructure that rivals enterprise implementations, using Cloudflare's edge network, GitHub Pages, and the Model Context Protocol. Every metric is earned, every score is verifiable, and every discovery surface is live and functional.
