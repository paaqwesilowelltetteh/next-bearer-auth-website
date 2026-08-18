# Nuxt Bearer Auth — Documentation & Marketing Website

> Official documentation, architecture guide, and interactive playground website for [`nuxt-bearer-auth`](https://github.com/paaqwesilowelltetteh/nuxt-bearer-auth) — the server-side authentication layer for Nuxt applications consuming bearer-token APIs.

[![Nuxt 4](https://img.shields.io/badge/Nuxt-4.x-00DC82?logo=nuxt.js&logoColor=white)](https://nuxt.com)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D?logo=vue.js&logoColor=white)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)

---

## 🌐 Overview

This website serves as the official portal for **Nuxt Bearer Auth**, providing comprehensive technical documentation, visual architecture sequence diagrams, code recipes, and an interactive simulation environment.

### Core Product Positioning

> **"Secure bearer-token authentication for Nuxt, without exposing your API tokens to the browser."**

```
┌───────────────┐     HTTP-only Session Cookie     ┌────────────────┐     Bearer Token     ┌────────────────┐
│    Browser    │ ◄──────────────────────────────► │  Nuxt Server   │ ◄──────────────────► │  External API  │
└───────────────┘                                  └───────┬────────┘                      └────────────────┘
                                                           │
                                                           ▼
                                                   ┌────────────────┐
                                                   │  Redis Store   │
                                                   │ (Server Session)│
                                                   └────────────────┘
```

---

## 🚀 Key Features of the Website

- **Interactive Architecture Visualizer**: Live responsive diagram demonstrating the 4-tier token isolation boundary between the browser, Nuxt server, Redis store, and backend APIs.
- **Interactive Live Playground (`/playground`)**: Real-time simulation environment enabling developers to test login, inspect client reactive state, examine the HTTP-only cookie jar, inspect Redis keys (`session:UUID`), test silent token refresh, simulate 2nd device logins, revoke sessions, and monitor event timelines.
- **Complete Documentation Suite (`/docs/*`)**:
  - **Getting Started** — Installation, module setup, environment variables, Redis configuration, and first login.
  - **Configuration Reference** — Complete options reference (`apiBaseUrl`, `redisUrl`, `endpoints`, `responsePaths`, `sessionCookie`, `csrf`, `redirects`, `routes`).
  - **Authentication Flows** — Email/Password, Social Login, Registration, OTP Verification, Password Reset, and Silent Refresh.
  - **Session Architecture** — Redis storage schema, TTL expiration, active devices index (`user_sessions:*`), and remote session revocation.
  - **SSR & Hydration** — Server plugin payload hydration (`bearer-auth.server.ts`), zero client-side auth flicker.
  - **Security Model** — Threat model, HTTP-only cookie scope, CSRF defense via `nuxt-csurf`, Redis isolation, and production deployment checklist.
  - **API Reference** — Complete TypeScript interfaces, `useBearerAuth()` / `useAuth()` composables, built-in server endpoints, and server utilities.
  - **Customization & Response Mapping** — Adapting non-standard backend JSON payloads, custom cookies, and custom middleware.
  - **Cookbook & Examples** — Full-stack integration recipes for Laravel Sanctum, FastAPI / Node / Go APIs, SSR Dashboards, and Device Managers.
- **Command Palette (`⌘K` / `Ctrl+K`)**: Instant fuzzy search across all documentation pages, sections, API methods, and quick actions.
- **Syntax Highlighting with Shiki**: Production-quality syntax highlighting supporting both dark and light modes with one-click copy buttons.
- **Dark & Light Mode**: Seamless theme switching with system preference detection and local storage persistence.
- **SEO & Performance**: Dynamic XML sitemap (`/sitemap.xml`), Open Graph & Twitter metadata, and static pre-rendering (SSG).

---

## 🛠️ Technology Stack

- **Framework**: [Nuxt 4](https://nuxt.com)
- **UI & Styling**: [Tailwind CSS](https://tailwindcss.com) + `@nuxtjs/tailwindcss`
- **Composables**: [VueUse](https://vueuse.org) (`@vueuse/nuxt`, `@vueuse/core`)
- **Syntax Highlighting**: [Shiki](https://shiki.style)
- **Icons**: [Lucide Icons](https://lucide.dev) (`@lucide/vue`)
- **Language**: [TypeScript](https://www.typescriptlang.org) (Strict mode)

---

## 📁 Project Structure

```
app/
├── assets/
│   └── css/main.css                 # Tailwind base styles, typography & grid patterns
├── components/
│   ├── architecture/
│   │   ├── ArchitectureFlow.vue     # Interactive visual architecture diagram
│   │   └── SequenceDiagram.vue      # Animated 4-flow sequence diagram
│   ├── docs/
│   │   ├── DocsSidebar.vue          # Categorized documentation navigation
│   │   ├── DocsToc.vue              # Table of contents scrollspy
│   │   └── MarkdownRenderer.vue     # Markdown parser & Shiki code renderer
│   ├── layout/
│   │   ├── AppHeader.vue            # Sticky navbar, search trigger & mobile drawer
│   │   └── AppFooter.vue            # Technical footer, branding & links
│   ├── playground/
│   │   └── PlaygroundSim.vue        # Live interactive authentication sandbox
│   └── ui/
│       ├── CodeBlock.vue            # High-performance syntax-highlighted code block
│       ├── CommandPalette.vue       # Global search modal (⌘K / Ctrl+K)
│       └── ThemeToggle.vue          # Dark / Light theme switcher
├── composables/
│   ├── useCopy.ts                   # Stateful clipboard copy utility
│   ├── useDocs.ts                   # Documentation store & search engine
│   ├── useHighlighter.ts            # Shiki syntax highlighter singleton
│   └── useTheme.ts                  # Theme mode manager (dark/light/system)
├── data/
│   ├── code-samples.ts              # Code samples for homepage & examples
│   └── docs.ts                      # Full documentation content & navigation data
└── pages/
    ├── index.vue                    # Homepage & Marketing landing page
    ├── architecture.vue             # Architecture deep-dive page
    ├── examples.vue                 # Cookbook & integration recipes page
    ├── playground.vue               # Dedicated playground page
    └── docs/
        ├── index.vue                # Docs index redirect
        └── [slug].vue               # Dynamic documentation reader
server/
└── routes/
    └── sitemap.xml.ts               # Dynamic XML sitemap generator
public/
├── favicon.svg                      # Custom vector lock favicon
└── robots.txt                       # Search engine crawler directives
```

---

## 💻 Getting Started

### Prerequisites

- Node.js `^18.20.0` or `>=20.0.0`
- `pnpm` (recommended) or `npm` / `yarn` / `bun`

### Installation

```bash
# Clone the repository
git clone https://github.com/paaqwesilowelltetteh/nuxt-bearer-auth-website.git
cd nuxt-bearer-auth-website

# Install dependencies
pnpm install
```

### Development Server

Start the local development server at `http://localhost:3000`:

```bash
pnpm dev
```

### Type Checking

Verify TypeScript types across all components, composables, and pages:

```bash
pnpm typecheck
# or:
npx nuxt typecheck
```

### Production Build

Build the application for production:

```bash
pnpm build
```

Preview the production build locally:

```bash
pnpm preview
```

### Static Generation (SSG)

Generate static HTML files into `.output/public` for deployment to Cloudflare Pages, Vercel, Netlify, or GitHub Pages:

```bash
pnpm generate
```

---

## 🔗 Related Repositories

- **Package Repository**: [nuxt-bearer-auth](https://github.com/paaqwesilowelltetteh/nuxt-bearer-auth)
- **Author**: [Enoch Tetteh](https://github.com/paaqwesilowelltetteh)

---

## 📄 License

This project is open-source software licensed under the [MIT License](LICENSE).
