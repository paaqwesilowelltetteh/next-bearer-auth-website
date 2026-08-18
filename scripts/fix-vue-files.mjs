import fs from 'node:fs'
import path from 'node:path'

const baseDir = '/Users/agrocenta/Sites/Nuxt/nuxt-bearer-auth-website/app'

// 1. Fix MarkdownRenderer.vue
const mdRendererContent = `<script setup lang="ts">
import { computed } from 'vue'
import CodeBlock from '~/components/ui/CodeBlock.vue'

const props = defineProps<{
  content: string
}>()

interface ContentToken {
  type: 'html' | 'code'
  raw: string
  lang?: string
}

const tokens = computed<ContentToken[]>(() => {
  const codeRegex = /\\x60\\x60\\x60([a-zA-Z0-9_-]*)\\n([\\s\\S]*?)\\x60\\x60\\x60/g
  const list: ContentToken[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = codeRegex.exec(props.content)) !== null) {
    if (match.index > lastIndex) {
      list.push({
        type: 'html',
        raw: props.content.substring(lastIndex, match.index),
      })
    }

    list.push({
      type: 'code',
      lang: match[1] || 'typescript',
      raw: match[2] || '',
    })

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < props.content.length) {
    list.push({
      type: 'html',
      raw: props.content.substring(lastIndex),
    })
  }

  return list
})

function formatMarkdownToHtml(md: string) {
  return md
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-white mt-8 mb-3">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 id="$1" class="text-xl font-bold text-white mt-10 mb-4 pb-2 border-b border-gray-800/80 flex items-center gap-2">$1</h2>')
    .replace(/^> \\*\\*Security Tip\\*\\*: (.*$)/gim, '<div class="my-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm"><strong>Security Tip:</strong> $1</div>')
    .replace(/^> (.*$)/gim, '<blockquote class="my-4 pl-4 border-l-2 border-emerald-500 text-gray-300 italic text-sm">$1</blockquote>')
    .replace(/\\x60([^\\x60]+)\\x60/g, '<code class="px-1.5 py-0.5 rounded bg-gray-800/80 text-emerald-400 font-mono text-xs border border-gray-700/50">$1</code>')
    .replace(/\\*\\*([^\\*]+)\\*\\*/g, '<strong class="font-semibold text-white">$1</strong>')
    .replace(/\\[([^\\]]+)\\]\\(([^\\)]+)\\)/g, '<a href="$2" class="text-emerald-400 hover:underline font-medium">$1</a>')
    .replace(/^\\- (.*$)/gim, '<li class="ml-4 list-disc text-gray-300 my-1 text-sm leading-relaxed">$1</li>')
    .replace(/\\n\\n([^<\\n]+)\\n\\n/g, '<p class="text-gray-300 leading-relaxed my-4 text-sm sm:text-base">$1</p>')
}
</script>

<template>
  <div class="docs-content space-y-2">
    <template v-for="(t, idx) in tokens" :key="idx">
      <CodeBlock v-if="t.type === 'code'" :code="t.raw" :lang="t.lang" />
      <div v-else v-html="formatMarkdownToHtml(t.raw)" />
    </template>
  </div>
</template>`

fs.writeFileSync(path.join(baseDir, 'components/docs/MarkdownRenderer.vue'), mdRendererContent, 'utf8')

// 2. Fix pages/index.vue
const indexContent = `<script setup lang="ts">
import { ref } from 'vue'
import {
  ArrowRight,
  Github,
  Check,
  Copy,
  Terminal,
  Shield,
  Lock,
  Zap,
  Server,
  Database,
  RefreshCw,
  Layers,
  Key,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Sliders,
  Laptop,
  Sparkles,
  ArrowUpRight,
} from 'lucide-vue-next'

import ArchitectureFlow from '~/components/architecture/ArchitectureFlow.vue'
import CodeBlock from '~/components/ui/CodeBlock.vue'
import { useCopy } from '~/composables/useCopy'

useHead({
  title: 'Nuxt Bearer Auth — Secure Bearer Authentication for Nuxt',
  meta: [
    {
      name: 'description',
      content: 'Keep API tokens on the server. Give your Nuxt application secure, SSR-aware authentication with Redis-backed sessions and HTTP-only cookies.',
    },
  ],
})

const { copied, copy } = useCopy()
const installCmd = 'pnpm add nuxt-bearer-auth redis nuxt-csurf'

const codeTab = ref<'login' | 'ssr' | 'guard' | 'serverRoute'>('login')

const codeSamples = {
  login: \`// pages/login.vue
<script setup lang="ts">
const auth = useBearerAuth()

async function handleLogin(email: string, pass: string) {
  // 1. Sends credentials to Nuxt local endpoint /api/auth/login
  // 2. Nuxt server authenticates with your backend API
  // 3. Nuxt receives bearer token and stores it in Redis
  // 4. Browser receives an HTTP-only session cookie
  await auth.login({
    identifier: email,
    password: pass,
  })

  if (auth.isAuthenticated.value) {
    await navigateTo('/dashboard')
  }
}
<` + \`/script>\`,

  ssr: \`// pages/dashboard.vue (Server-Side Rendered)
<script setup lang="ts">
// Auth state is hydrated synchronously during SSR via bearer-auth.server.ts
const auth = useBearerAuth()

// Fetch private user data on server during SSR
const { data: profile } = await useFetch('/api/user/profile')
<` + \`/script>

<template>
  <div>
    <h1>Welcome, {{ auth.user.value?.name }}</h1>
    <p>Session rendered securely on server with zero layout flicker.</p>
  </div>
</template>\`,

  guard: \`// nuxt.config.ts - Automatic Route Protection
export default defineNuxtConfig({
  modules: ['nuxt-bearer-auth'],

  bearerAuth: {
    redirects: {
      login: '/login',
      authenticated: '/dashboard',
      logout: '/',
    },
    routes: {
      // Unprotected public routes
      public: ['/', '/login', '/forgot-password', '/pricing'],
      // Auth pages (redirect to /dashboard if already logged in)
      authPages: ['/login', '/register'],
    },
  },
})\`,

  serverRoute: \`// server/api/projects.get.ts - Protected Nitro API Route
import { requireBearerAuthSession, callAuthApi } from '#imports'

export default defineEventHandler(async (event) => {
  // 1. Ensures user has a valid Redis session or throws 401
  const session = requireBearerAuthSession(event)

  // 2. Calls external backend with the user's server-held bearer token
  const data = await callAuthApi('/v1/projects', {
    event,
    method: 'GET',
  })

  return { projects: data, userId: session.userId }
})\`,
}

const features = [
  {
    title: 'Server-Side Sessions',
    description: 'Bearer tokens are kept safely in server-side Redis sessions, never stored in browser memory or localStorage.',
    icon: Database,
    tag: 'Core Storage',
  },
  {
    title: 'HTTP-Only Cookies',
    description: 'The browser receives a protected, secure session cookie rather than the external API access token.',
    icon: ShieldCheck,
    tag: 'Zero-Trust',
  },
  {
    title: 'SSR Authentication',
    description: 'Authentication state is hydrated synchronously during Nuxt SSR with zero layout shifts or client auth flicker.',
    icon: Zap,
    tag: 'Full SSR',
  },
  {
    title: 'Route Protection',
    description: 'Protect Nuxt pages using intelligent global route middleware that redirects unauthenticated users automatically.',
    icon: Lock,
    tag: 'Navigation',
  },
  {
    title: 'Server API Protection',
    description: 'Guard your custom Nitro server API routes with session verification and pre-authenticated external API callers.',
    icon: Server,
    tag: 'Nitro Engine',
  },
  {
    title: 'Silent Token Refresh',
    description: 'Refresh backend authentication tokens on the server without exposing long-lived refresh tokens to the browser.',
    icon: RefreshCw,
    tag: 'Rotation',
  },
  {
    title: 'Session Management',
    description: 'List active user sessions across multiple devices with IP/user-agent tracking and individual remote revocation.',
    icon: Laptop,
    tag: 'Multi-Device',
  },
  {
    title: 'CSRF Protection',
    description: 'Integrated nuxt-csurf protection guards against Cross-Site Request Forgery across mutating HTTP methods.',
    icon: Shield,
    tag: 'Defense',
  },
  {
    title: 'OTP Verification Flows',
    description: 'Built-in support for account verification, two-factor OTP authentication, and resend workflows.',
    icon: Key,
    tag: 'MFA Ready',
  },
  {
    title: 'Social Authentication',
    description: 'Easily forward Google, Apple, and GitHub OAuth credentials to your backend authentication provider.',
    icon: Sparkles,
    tag: 'OAuth',
  },
  {
    title: 'Backend Agnostic',
    description: 'Engineered for any bearer-token API (Laravel Sanctum, FastAPI, Django REST, Node, Go, Rails).',
    icon: Layers,
    tag: 'Agnostic',
  },
  {
    title: 'Configurable Response Paths',
    description: 'Map arbitrary JSON response payloads into normalized session state without backend modifications.',
    icon: Sliders,
    tag: 'Flexible',
  },
]

const lifecycleSteps = [
  {
    num: '01',
    title: 'User Submits Login',
    endpoint: 'POST /api/auth/login',
    desc: 'Browser posts login credentials to Nuxt local auth endpoint. CSRF token is verified.',
  },
  {
    num: '02',
    title: 'Nuxt Authenticates API',
    endpoint: 'POST https://api.example.com/auth/login',
    desc: 'Nuxt server forwards credentials to external backend over a secure private network.',
  },
  {
    num: '03',
    title: 'Backend Issues Bearer Token',
    endpoint: '200 OK { token: \"...\", user: {...} }',
    desc: 'Backend returns bearer access token and user payload. Nuxt intercepts the token on the server.',
  },
  {
    num: '04',
    title: 'Nuxt Stores in Redis',
    endpoint: 'SETEX session:<uuid> 604800',
    desc: 'Session data and bearer tokens are stored in Redis under an isolated random UUID with TTL.',
  },
  {
    num: '05',
    title: 'Browser Receives Cookie',
    endpoint: 'Set-Cookie: nuxt_bearer_auth_session=<uuid>',
    desc: 'Browser receives an HTTP-only, SameSite=Lax cookie. The raw bearer token never reaches the client.',
  },
  {
    num: '06',
    title: 'Subsequent Requests Proxied',
    endpoint: 'Authorization: Bearer <token>',
    desc: 'Nuxt resolves incoming cookie to Redis session and securely injects the bearer token into backend requests.',
  },
]
</script>

<template>
  <div class="space-y-24 sm:space-y-32 pb-24">
    <!-- Hero Section -->
    <section class="relative pt-12 sm:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div class="absolute -top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div class="text-center space-y-6 max-w-4xl mx-auto">
        <div class="flex flex-wrap items-center justify-center gap-2 font-mono text-xs">
          <span class="px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Open Source
          </span>
          <span class="px-2.5 py-1 rounded-full bg-gray-900 text-gray-300 border border-gray-800">
            Nuxt 4
          </span>
          <span class="px-2.5 py-1 rounded-full bg-gray-900 text-gray-300 border border-gray-800">
            TypeScript
          </span>
          <span class="px-2.5 py-1 rounded-full bg-gray-900 text-gray-300 border border-gray-800">
            Redis Sessions
          </span>
          <span class="px-2.5 py-1 rounded-full bg-gray-900 text-gray-300 border border-gray-800">
            SSR Ready
          </span>
        </div>

        <h1 class="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
          Bearer authentication, <br class="hidden sm:inline" />
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
            built for Nuxt.
          </span>
        </h1>

        <p class="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Keep API tokens on the server. Give your Nuxt application secure, SSR-aware authentication with Redis-backed sessions and HTTP-only cookies.
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <NuxtLink
            to="/docs/getting-started"
            class="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm flex items-center justify-center gap-2 shadow-glow-emerald transition-all transform active:scale-95"
          >
            <span>Get Started</span>
            <ArrowRight class="w-4 h-4" />
          </NuxtLink>

          <a
            href="https://github.com/paaqwesilowelltetteh/nuxt-bearer-auth"
            target="_blank"
            rel="noopener noreferrer"
            class="w-full sm:w-auto px-6 py-3 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Github class="w-4 h-4" />
            <span>View on GitHub</span>
            <ArrowUpRight class="w-3.5 h-3.5 opacity-60" />
          </a>
        </div>

        <div class="pt-4 max-w-lg mx-auto">
          <div class="flex items-center justify-between px-4 py-2.5 rounded-xl bg-gray-950/90 border border-gray-800 shadow-inner font-mono text-xs text-gray-300">
            <div class="flex items-center gap-2.5 overflow-x-auto">
              <Terminal class="w-4 h-4 text-emerald-400 shrink-0" />
              <span class="text-gray-400">$</span>
              <span class="text-emerald-300 whitespace-nowrap">{{ installCmd }}</span>
            </div>
            <button
              type="button"
              @click="copy(installCmd)"
              class="shrink-0 ml-3 p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
              :title="copied ? 'Copied!' : 'Copy command'"
            >
              <Check v-if="copied" class="w-4 h-4 text-emerald-400" />
              <Copy v-else class="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      <div class="mt-16 sm:mt-20">
        <ArchitectureFlow />
      </div>
    </section>

    <!-- The Problem vs Solution -->
    <section class="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
        <div class="p-6 sm:p-8 rounded-2xl border border-red-900/30 bg-red-950/10 space-y-6 flex flex-col justify-between">
          <div class="space-y-4">
            <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-red-950/80 text-red-400 border border-red-800/50">
              <XCircle class="w-3.5 h-3.5" />
              <span>The Traditional Vulnerable Approach</span>
            </div>

            <h2 class="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Bearer tokens don’t belong in your browser.
            </h2>

            <p class="text-sm sm:text-base text-gray-300 leading-relaxed">
              When single-page apps store raw bearer tokens in <code class="text-red-400 bg-red-950/60 px-1.5 py-0.5 rounded">localStorage</code> or JavaScript variables, any XSS vulnerability or malicious dependency can immediately exfiltrate the token.
            </p>

            <ul class="space-y-2.5 text-xs sm:text-sm text-gray-400 font-mono">
              <li class="flex items-start gap-2 text-red-300">
                <span class="text-red-500 font-bold">✕</span>
                <span>Tokens become accessible to browser JavaScript & XSS.</span>
              </li>
              <li class="flex items-start gap-2 text-red-300">
                <span class="text-red-500 font-bold">✕</span>
                <span>SSR auth hydration becomes fragmented and flickers.</span>
              </li>
              <li class="flex items-start gap-2 text-red-300">
                <span class="text-red-500 font-bold">✕</span>
                <span>Refresh tokens are exposed on the client device.</span>
              </li>
              <li class="flex items-start gap-2 text-red-300">
                <span class="text-red-500 font-bold">✕</span>
                <span>No centralized server session revocation or device management.</span>
              </li>
            </ul>
          </div>

          <div class="p-3 rounded-xl bg-gray-950/90 border border-red-900/40 text-xs font-mono text-gray-400">
            Browser (localStorage: Bearer Token) ➔ Direct External API (Exposed)
          </div>
        </div>

        <div class="p-6 sm:p-8 rounded-2xl border border-emerald-900/40 bg-emerald-950/10 space-y-6 flex flex-col justify-between">
          <div class="space-y-4">
            <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
              <CheckCircle2 class="w-3.5 h-3.5" />
              <span>The Nuxt Bearer Auth Approach</span>
            </div>

            <h2 class="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Tokens stay on the server. Always.
            </h2>

            <p class="text-sm sm:text-base text-gray-300 leading-relaxed">
              <strong>The browser knows about the session, but the browser never needs to know the API’s bearer token.</strong> Nuxt holds the real bearer credentials in Redis and gives your client a secure HTTP-only cookie.
            </p>

            <ul class="space-y-2.5 text-xs sm:text-sm text-gray-300 font-mono">
              <li class="flex items-start gap-2 text-emerald-400">
                <span class="text-emerald-400 font-bold">✓</span>
                <span>Zero token leakage to client-side scripts.</span>
              </li>
              <li class="flex items-start gap-2 text-emerald-400">
                <span class="text-emerald-400 font-bold">✓</span>
                <span>First-class SSR hydration with zero layout shift.</span>
              </li>
              <li class="flex items-start gap-2 text-emerald-400">
                <span class="text-emerald-400 font-bold">✓</span>
                <span>Silent token refresh executed entirely server-side.</span>
              </li>
              <li class="flex items-start gap-2 text-emerald-400">
                <span class="text-emerald-400 font-bold">✓</span>
                <span>Instant remote session revocation across all devices.</span>
              </li>
            </ul>
          </div>

          <div class="p-3 rounded-xl bg-gray-950/90 border border-emerald-900/40 text-xs font-mono text-emerald-400">
            Browser (HTTP-only Cookie) ➔ Nuxt Server ➔ Redis Store ➔ External API
          </div>
        </div>
      </div>
    </section>

    <!-- Feature Grid -->
    <section class="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      <div class="text-center space-y-3 max-w-3xl mx-auto">
        <h2 class="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
          Infrastructure Features
        </h2>
        <p class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Engineered for production reliability
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="feat in features"
          :key="feat.title"
          class="p-6 rounded-2xl border border-gray-800 bg-gray-950/70 hover:border-gray-700 transition-all space-y-3 group hover:shadow-card-dark"
        >
          <div class="flex items-center justify-between">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <component :is="feat.icon" class="w-5 h-5" />
            </div>
            <span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-gray-900 text-gray-400 border border-gray-800">
              {{ feat.tag }}
            </span>
          </div>

          <h3 class="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
            {{ feat.title }}
          </h3>

          <p class="text-xs sm:text-sm text-gray-400 leading-relaxed">
            {{ feat.description }}
          </p>
        </div>
      </div>
    </section>

    <!-- Code First Developer Section -->
    <section class="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div class="space-y-2">
          <h2 class="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
            Developer Experience
          </h2>
          <p class="text-3xl font-extrabold text-white tracking-tight">
            Authentication without the boilerplate.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-gray-900 border border-gray-800 text-xs font-mono">
          <button
            type="button"
            @click="codeTab = 'login'"
            class="px-3 py-1.5 rounded-lg transition-all"
            :class="codeTab === 'login' ? 'bg-emerald-500 text-black font-bold' : 'text-gray-400 hover:text-white'"
          >
            Login Composable
          </button>
          <button
            type="button"
            @click="codeTab = 'ssr'"
            class="px-3 py-1.5 rounded-lg transition-all"
            :class="codeTab === 'ssr' ? 'bg-emerald-500 text-black font-bold' : 'text-gray-400 hover:text-white'"
          >
            SSR Hydration
          </button>
          <button
            type="button"
            @click="codeTab = 'guard'"
            class="px-3 py-1.5 rounded-lg transition-all"
            :class="codeTab === 'guard' ? 'bg-emerald-500 text-black font-bold' : 'text-gray-400 hover:text-white'"
          >
            Route Middleware
          </button>
          <button
            type="button"
            @click="codeTab = 'serverRoute'"
            class="px-3 py-1.5 rounded-lg transition-all"
            :class="codeTab === 'serverRoute' ? 'bg-emerald-500 text-black font-bold' : 'text-gray-400 hover:text-white'"
          >
            Server API Route
          </button>
        </div>
      </div>

      <CodeBlock :code="codeSamples[codeTab]" lang="typescript" />
    </section>

    <!-- Bottom CTA Bar -->
    <section class="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div class="p-8 sm:p-12 rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-gray-950 to-gray-950 text-center space-y-6 shadow-glow-emerald">
        <h2 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Ready to secure your Nuxt application?
        </h2>
        <p class="text-base text-gray-300 max-w-xl mx-auto leading-relaxed">
          Install the package in under two minutes, connect your Redis instance, and keep bearer tokens off the client forever.
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <NuxtLink
            to="/docs/getting-started"
            class="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm flex items-center justify-center gap-2 shadow-glow-emerald transition-all"
          >
            <span>Read Getting Started Guide</span>
            <ArrowRight class="w-4 h-4" />
          </NuxtLink>

          <NuxtLink
            to="/playground"
            class="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <span>Try Live Playground</span>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>`

fs.writeFileSync(path.join(baseDir, 'pages/index.vue'), indexContent, 'utf8')

// 3. Fix pages/examples.vue
const examplesContent = `<script setup lang="ts">
import { ref } from 'vue'
import { Sparkles } from 'lucide-vue-next'
import CodeBlock from '~/components/ui/CodeBlock.vue'

useHead({
  title: 'Integration Examples & Recipes — Nuxt Bearer Auth',
  meta: [
    {
      name: 'description',
      content: 'Cookbook of realistic recipes for Laravel Sanctum, custom Node/Go APIs, SSR Dashboards, and Multi-Device Session Management.',
    },
  ],
})

const activeTab = ref<'laravel' | 'custom' | 'dashboard' | 'sessions'>('laravel')

const examples = {
  laravel: {
    title: 'Laravel Sanctum / Passport API Integration',
    desc: 'Connect a Laravel backend issuing plain text API tokens via Sanctum.',
    config: \`// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-bearer-auth'],

  bearerAuth: {
    apiBaseUrl: 'https://api.myapp.com/api',
    redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',

    endpoints: {
      login: 'auth/login',
      logout: 'auth/logout',
      me: 'auth/user',
      register: 'auth/register',
    },

    responsePaths: {
      token: ['data.token', 'token'],
      user: ['data.user', 'user'],
    },
  },
})\`,
    backend: \`// app/Http/Controllers/AuthController.php (Laravel)
namespace App\\\\Http\\\\Controllers;

use Illuminate\\\\Http\\\\Request;
use Illuminate\\\\Support\\\\Facades\\\\Auth;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($credentials)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $user = Auth::user();
        $token = $user->createToken('nuxt-session')->plainTextToken;

        return response()->json([
            'success' => true,
            'data' => [
                'token' => $token,
                'user' => $user,
            ],
        ]);
    }
}\`,
  },
  custom: {
    title: 'FastAPI / Express / Go JWT Bearer API',
    desc: 'Map non-standard response bodies with nested properties into normalized sessions.',
    config: \`// nuxt.config.ts - Custom Response Path Normalization
export default defineNuxtConfig({
  modules: ['nuxt-bearer-auth'],

  bearerAuth: {
    apiBaseUrl: 'https://fastapi.example.com',

    endpoints: {
      login: 'v1/oauth/token',
      refresh: 'v1/oauth/refresh',
      me: 'v1/users/me',
    },

    responsePaths: {
      token: ['result.accessToken', 'jwt_token'],
      refreshToken: ['result.refreshToken'],
      user: ['result.accountProfile'],
      userId: ['result.accountProfile.id', 'user_id'],
      success: ['status_code', 'is_success'],
    },
  },
})\`,
    backend: \`// FastAPI response example
{
  "status_code": 200,
  "result": {
    "accessToken": "eyJhbGciOiJIUzI1Ni...",
    "refreshToken": "rf_7491823948",
    "accountProfile": {
      "id": "usr_9921",
      "email": "alex@example.com",
      "name": "Alex Rivera"
    }
  }
}\`,
  },
  dashboard: {
    title: 'SSR Authenticated Dashboard',
    desc: 'Pre-render private user dashboards on the server with zero auth flicker.',
    config: \`// pages/dashboard.vue
<script setup lang="ts">
// Protected by global middleware automatically
const auth = useBearerAuth()

// Fetch private data during SSR via custom Nitro route
const { data: dashboardData, pending } = await useFetch('/api/analytics')

async function handleLogout() {
  await auth.logout('/login')
}
<` + \`/script>

<template>
  <div class="dashboard-page p-6 max-w-5xl mx-auto space-y-6">
    <header class="flex justify-between items-center pb-4 border-b">
      <div>
        <h1 class="text-2xl font-bold">Welcome, {{ auth.user.value?.name }}</h1>
        <p class="text-sm text-gray-500">{{ auth.user.value?.email }}</p>
      </div>
      <button @click="handleLogout" class="px-4 py-2 bg-red-600 text-white rounded-lg">
        Log Out
      </button>
    </header>

    <div v-if="pending">Loading private metrics...</div>
    <div v-else class="grid grid-cols-3 gap-4">
      <div class="p-4 rounded-xl border bg-gray-900">
        <div>Total Revenue</div>
        <div class="text-2xl font-bold">\${{ dashboardData?.revenue }}</div>
      </div>
    </div>
  </div>
</template>\`,
    backend: \`// server/api/analytics.get.ts
import { requireBearerAuthSession, callAuthApi } from '#imports'

export default defineEventHandler(async (event) => {
  // 1. Ensures user session exists in Redis
  const session = requireBearerAuthSession(event)

  // 2. Calls external backend with bearer token
  return await callAuthApi('/v1/analytics', {
    event,
    method: 'GET',
  })
})\`,
  },
  sessions: {
    title: 'Multi-Device Session Manager UI',
    desc: 'Provide users with a dashboard to view and revoke active browser sessions.',
    config: \`// pages/account/security.vue
<script setup lang="ts">
interface SessionItem {
  id: string
  createdAt: string
  lastActivity: string
  userAgent?: string
  ipAddress?: string
}

const { data: sessions, refresh } = await useFetch<SessionItem[]>('/api/auth/sessions')

async function revokeDevice(id: string) {
  await $fetch('/api/auth/sessions/' + id, { method: 'DELETE' })
  await refresh()
}
<` + \`/script>

<template>
  <div class="max-w-3xl mx-auto p-6 space-y-4">
    <h2 class="text-xl font-bold">Active Device Sessions</h2>
    <div v-for="s in sessions" :key="s.id" class="p-4 rounded-xl border flex justify-between">
      <div>
        <div class="font-bold">{{ s.userAgent || 'Unknown Browser' }}</div>
        <div class="text-xs text-gray-500">IP: {{ s.ipAddress }} • Last active: {{ new Date(s.lastActivity).toLocaleTimeString() }}</div>
      </div>
      <button @click="revokeDevice(s.id)" class="text-xs text-red-400">Revoke</button>
    </div>
  </div>
</template>\`,
    backend: \`// Built-in Nuxt Bearer Auth endpoints:
// GET /api/auth/sessions -> Lists active Redis sessions
// DELETE /api/auth/sessions/:id -> Revokes specific session key\`,
  },
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
    <div class="space-y-4 max-w-3xl">
      <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
        <Sparkles class="w-3.5 h-3.5" />
        <span>Integration Recipes</span>
      </div>
      <h1 class="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
        Cookbook & Examples
      </h1>
      <p class="text-base sm:text-lg text-gray-300 leading-relaxed">
        Production-tested integration recipes for Laravel Sanctum, custom JWT backends, SSR dashboards, and device management.
      </p>
    </div>

    <!-- Tabs -->
    <div class="flex flex-wrap items-center gap-2 border-b border-gray-800 pb-4">
      <button
        type="button"
        @click="activeTab = 'laravel'"
        class="px-4 py-2 rounded-xl text-xs font-mono transition-all"
        :class="activeTab === 'laravel' ? 'bg-emerald-500 text-black font-bold shadow-glow-emerald' : 'text-gray-400 hover:text-white bg-gray-900/60'"
      >
        Laravel Sanctum API
      </button>
      <button
        type="button"
        @click="activeTab = 'custom'"
        class="px-4 py-2 rounded-xl text-xs font-mono transition-all"
        :class="activeTab === 'custom' ? 'bg-emerald-500 text-black font-bold shadow-glow-emerald' : 'text-gray-400 hover:text-white bg-gray-900/60'"
      >
        FastAPI / Custom REST
      </button>
      <button
        type="button"
        @click="activeTab = 'dashboard'"
        class="px-4 py-2 rounded-xl text-xs font-mono transition-all"
        :class="activeTab === 'dashboard' ? 'bg-emerald-500 text-black font-bold shadow-glow-emerald' : 'text-gray-400 hover:text-white bg-gray-900/60'"
      >
        SSR Authenticated Dashboard
      </button>
      <button
        type="button"
        @click="activeTab = 'sessions'"
        class="px-4 py-2 rounded-xl text-xs font-mono transition-all"
        :class="activeTab === 'sessions' ? 'bg-emerald-500 text-black font-bold shadow-glow-emerald' : 'text-gray-400 hover:text-white bg-gray-900/60'"
      >
        Device Session Manager UI
      </button>
    </div>

    <!-- Active Example Content -->
    <div class="space-y-6">
      <div>
        <h2 class="text-xl font-bold text-white">{{ examples[activeTab].title }}</h2>
        <p class="text-sm text-gray-400 mt-1">{{ examples[activeTab].desc }}</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div class="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-2 font-semibold">Nuxt Configuration / Frontend</div>
          <CodeBlock :code="examples[activeTab].config" lang="typescript" />
        </div>
        <div>
          <div class="text-xs font-mono text-purple-400 uppercase tracking-wider mb-2 font-semibold">Backend / Server Route</div>
          <CodeBlock :code="examples[activeTab].backend" lang="typescript" />
        </div>
      </div>
    </div>
  </div>
</template>`

fs.writeFileSync(path.join(baseDir, 'pages/examples.vue'), examplesContent, 'utf8')

console.log('Fixed MarkdownRenderer, index.vue, and examples.vue!')
