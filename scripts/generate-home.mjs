import fs from 'node:fs'
import path from 'node:path'

const filePath = '/Users/agrocenta/Sites/Nuxt/nuxt-bearer-auth-website/pages/index.vue'
const dir = path.dirname(filePath)
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

const content = `<script setup lang="ts">
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
  Code2,
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
      content: 'Keep API tokens on the server. Secure, SSR-aware authentication with Redis-backed sessions and HTTP-only cookies for Nuxt 4.',
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
  // 1. Sends credentials to Nuxt's local endpoint /api/auth/login
  // 2. Nuxt server authenticates with your backend API
  // 3. Nuxt receives the bearer token and stores it in Redis
  // 4. Browser receives an HTTP-only session cookie
  await auth.login({
    identifier: email,
    password: pass,
  })

  if (auth.isAuthenticated.value) {
    await navigateTo('/dashboard')
  }
}
<\/script>\`,

  ssr: \`// pages/dashboard.vue (Server-Side Rendered)
<script setup lang="ts">
// Auth state is hydrated synchronously during SSR via bearer-auth.server.ts
const auth = useBearerAuth()

// Fetch private user data on the server during SSR
const { data: profile } = await useFetch('/api/user/profile')
<\/script>

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
    endpoint: '200 OK { token: "...", user: {...} }',
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
      <!-- Background subtle glow -->
      <div class="absolute -top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div class="text-center space-y-6 max-w-4xl mx-auto">
        <!-- Badges Bar -->
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

        <!-- Main Headline -->
        <h1 class="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
          Bearer authentication, <br class="hidden sm:inline" />
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
            built for Nuxt.
          </span>
        </h1>

        <!-- Supporting Headline -->
        <p class="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Keep API tokens on the server. Give your Nuxt application secure, SSR-aware authentication with Redis-backed sessions and HTTP-only cookies.
        </p>

        <!-- CTA Buttons -->
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

        <!-- Copyable Install Bar -->
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

      <!-- Hero Architecture Flow Visualization -->
      <div class="mt-16 sm:mt-20">
        <ArchitectureFlow />
      </div>
    </section>

    <!-- The Problem vs Solution Section -->
    <section class="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
        <!-- Left: The Problem -->
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
              When single-page apps store raw bearer tokens in <code class="text-red-400 bg-red-950/60 px-1.5 py-0.5 rounded">localStorage</code> or JavaScript variables, any XSS vulnerability or malicious NPM dependency can immediately exfiltrate the token.
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

        <!-- Right: The Solution -->
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
        <p class="text-base text-gray-400">
          Everything required for robust, enterprise-grade bearer authentication without inventing custom infrastructure.
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

    <!-- Authentication Lifecycle Section -->
    <section class="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      <div class="text-center space-y-3 max-w-3xl mx-auto">
        <h2 class="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
          Step-by-Step Lifecycle
        </h2>
        <p class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          How requests flow through the system
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="step in lifecycleSteps"
          :key="step.num"
          class="p-6 rounded-2xl border border-gray-800 bg-gray-950/70 space-y-3 relative overflow-hidden"
        >
          <div class="flex items-center justify-between">
            <span class="text-2xl font-extrabold text-emerald-500/40 font-mono">{{ step.num }}</span>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-900 text-gray-400 border border-gray-800 truncate max-w-[180px]">
              {{ step.endpoint }}
            </span>
          </div>

          <h3 class="text-base font-bold text-white">{{ step.title }}</h3>
          <p class="text-xs sm:text-sm text-gray-400 leading-relaxed">{{ step.desc }}</p>
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

        <!-- Code Tabs -->
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

fs.writeFileSync(filePath, content, 'utf8')
console.log('Successfully generated pages/index.vue')
