import fs from 'node:fs'
import path from 'node:path'

const baseDir = '/Users/agrocenta/Sites/Nuxt/nuxt-bearer-auth-website'

function writeFile(relPath, content) {
  const fullPath = path.join(baseDir, relPath)
  const dir = path.dirname(fullPath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8')
  console.log('Created:', relPath)
}

// 1. pages/docs/index.vue
writeFile('pages/docs/index.vue', `<script setup lang="ts">
await navigateTo('/docs/getting-started', { replace: true })
</script>

<template>
  <div class="p-12 text-center text-gray-400 font-mono text-sm">
    Redirecting to documentation...
  </div>
</template>`)

// 2. pages/docs/[slug].vue
writeFile('pages/docs/[slug].vue', `<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ChevronRight, ArrowLeft, ArrowRight, Github, Clock, Tag } from 'lucide-vue-next'
import { useDocs } from '~/composables/useDocs'
import DocsSidebar from '~/components/docs/DocsSidebar.vue'
import DocsToc from '~/components/docs/DocsToc.vue'
import MarkdownRenderer from '~/components/docs/MarkdownRenderer.vue'

const route = useRoute()
const slug = computed(() => (route.params.slug as string) || 'getting-started')
const { getDoc, getSurroundingDocs } = useDocs()

const doc = computed(() => getDoc(slug.value))
const surrounding = computed(() => getSurroundingDocs(slug.value))

if (!doc.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Documentation page not found',
  })
}

useHead({
  title: computed(() => (doc.value ? \`\${doc.value.title} — Nuxt Bearer Auth\` : 'Documentation — Nuxt Bearer Auth')),
  meta: [
    {
      name: 'description',
      content: computed(() => doc.value?.description || 'Documentation for nuxt-bearer-auth module'),
    },
  ],
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
    <div class="flex gap-8 lg:gap-12">
      <!-- Left Sidebar -->
      <DocsSidebar />

      <!-- Center Content Article -->
      <article class="flex-1 min-w-0 max-w-4xl space-y-8">
        <!-- Breadcrumb Navigation -->
        <nav class="flex items-center gap-2 text-xs font-mono text-gray-500">
          <NuxtLink to="/docs/getting-started" class="hover:text-emerald-400">Docs</NuxtLink>
          <ChevronRight class="w-3.5 h-3.5" />
          <span class="text-gray-400">{{ doc?.category }}</span>
          <ChevronRight class="w-3.5 h-3.5" />
          <span class="text-emerald-400 font-semibold">{{ doc?.title }}</span>
        </nav>

        <!-- Document Header -->
        <div class="space-y-3 pb-6 border-b border-gray-800/80">
          <h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {{ doc?.title }}
          </h1>
          <p class="text-base sm:text-lg text-gray-300 leading-relaxed">
            {{ doc?.description }}
          </p>

          <div class="flex flex-wrap items-center gap-4 pt-2 text-xs font-mono text-gray-500">
            <span class="flex items-center gap-1">
              <Tag class="w-3.5 h-3.5 text-emerald-400" />
              {{ doc?.category }}
            </span>
            <span class="flex items-center gap-1">
              <Clock class="w-3.5 h-3.5 text-gray-400" />
              Nuxt 4 / TypeScript
            </span>
          </div>
        </div>

        <!-- Rendered Document Body -->
        <MarkdownRenderer v-if="doc" :content="doc.content" />

        <!-- Surrounding Next / Previous Navigation Links -->
        <div class="pt-8 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <NuxtLink
            v-if="surrounding.prev"
            :to="'/docs/' + surrounding.prev.slug"
            class="w-full sm:w-auto p-4 rounded-xl border border-gray-800 bg-gray-900/40 hover:bg-gray-900/80 hover:border-emerald-500/30 transition-all flex items-center gap-3 text-left group"
          >
            <ArrowLeft class="w-4 h-4 text-gray-500 group-hover:text-emerald-400 transition-colors" />
            <div>
              <div class="text-[11px] font-mono text-gray-500">Previous</div>
              <div class="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">{{ surrounding.prev.title }}</div>
            </div>
          </NuxtLink>
          <div v-else class="hidden sm:block"></div>

          <NuxtLink
            v-if="surrounding.next"
            :to="'/docs/' + surrounding.next.slug"
            class="w-full sm:w-auto p-4 rounded-xl border border-gray-800 bg-gray-900/40 hover:bg-gray-900/80 hover:border-emerald-500/30 transition-all flex items-center gap-3 text-right justify-end group ml-auto"
          >
            <div>
              <div class="text-[11px] font-mono text-gray-500">Next</div>
              <div class="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">{{ surrounding.next.title }}</div>
            </div>
            <ArrowRight class="w-4 h-4 text-gray-500 group-hover:text-emerald-400 transition-colors" />
          </NuxtLink>
        </div>
      </article>

      <!-- Right Table of Contents -->
      <DocsToc v-if="doc" :sections="doc.sections" />
    </div>
  </div>
</template>`)

// 3. pages/architecture.vue
writeFile('pages/architecture.vue', `<script setup lang="ts">
import { ref } from 'vue'
import { Layers, ShieldCheck, Database, Server, Key, Lock, ArrowRight, CheckCircle2, Shield, Monitor } from 'lucide-vue-next'
import SequenceDiagram from '~/components/architecture/SequenceDiagram.vue'
import ArchitectureFlow from '~/components/architecture/ArchitectureFlow.vue'

useHead({
  title: 'Architecture & Security Model — Nuxt Bearer Auth',
  meta: [
    {
      name: 'description',
      content: 'Detailed architectural overview of Nuxt Bearer Auth: server-side token holding, Redis session storage, and zero-trust security boundaries.',
    },
  ],
})

const layers = [
  {
    num: '1',
    name: 'Client / Nuxt Composable Layer',
    desc: 'Provides reactive state (user, isAuthenticated, status, loading) and action composables (login, logout, refresh, verifyOtp) via useBearerAuth(). Holds only session state, zero raw bearer tokens.',
    tech: 'Vue 3 Composition API / useState()',
  },
  {
    num: '2',
    name: 'Nitro Server Auth Routes Layer',
    desc: 'Local endpoints mounted under /api/auth/* (/login, /logout, /me, /refresh, /sessions) that handle CSRF verification, input normalization, and request proxying.',
    tech: 'H3 Event Handlers / Nitro Server Engine',
  },
  {
    num: '3',
    name: 'Session Manager Layer',
    desc: 'Generates secure UUID session IDs, encrypts cookies, updates last-activity timestamps, manages session TTLs, and indexes multi-device logins under user_sessions:userId sets.',
    tech: 'Node Crypto / H3 Cookie Utilities',
  },
  {
    num: '4',
    name: 'Redis Storage Layer',
    desc: 'High-speed in-memory database storing JSON serialized session payloads (session:<uuid>) and active device session sets with automated expiration.',
    tech: 'Redis 6/7 Protocol / node-redis Client',
  },
  {
    num: '5',
    name: 'External API Adapter Layer',
    desc: 'Universal HTTP caller (callAuthApi) that resolves server-held bearer tokens and proxies requests to external backends with dynamic response path mapping.',
    tech: 'ofetch / Response Normalizer',
  },
]
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
    <!-- Header -->
    <div class="space-y-4 max-w-3xl">
      <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <Layers class="w-3.5 h-3.5" />
        <span>Technical Deep Dive</span>
      </div>
      <h1 class="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
        Architecture & Security Model
      </h1>
      <p class="text-base sm:text-lg text-gray-300 leading-relaxed">
        Explore the multi-tier authentication architecture that separates browser sessions from external API bearer tokens.
      </p>
    </div>

    <!-- Visual Architecture Flow -->
    <section class="space-y-6">
      <h2 class="text-xl font-bold text-white flex items-center gap-2">
        <ShieldCheck class="w-5 h-5 text-emerald-400" />
        <span>System Boundaries Overview</span>
      </h2>
      <ArchitectureFlow />
    </section>

    <!-- Sequence Flows -->
    <section class="space-y-6">
      <h2 class="text-xl font-bold text-white flex items-center gap-2">
        <Server class="w-5 h-5 text-emerald-400" />
        <span>Interactive Sequence Flows</span>
      </h2>
      <SequenceDiagram />
    </section>

    <!-- 5 Architectural Layers Breakdown -->
    <section class="space-y-8">
      <div class="space-y-2">
        <h2 class="text-2xl font-bold text-white">The 5 Architectural Layers</h2>
        <p class="text-sm text-gray-400">How responsibilities are partitioned across the stack.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="layer in layers"
          :key="layer.num"
          class="p-6 rounded-2xl border border-gray-800 bg-gray-950/70 space-y-4 flex flex-col justify-between"
        >
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="w-7 h-7 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono text-xs font-bold flex items-center justify-center">
                {{ layer.num }}
              </span>
              <span class="text-[10px] font-mono text-gray-500 bg-gray-900 px-2 py-0.5 rounded border border-gray-800">
                {{ layer.tech }}
              </span>
            </div>
            <h3 class="text-base font-bold text-white">{{ layer.name }}</h3>
            <p class="text-xs sm:text-sm text-gray-400 leading-relaxed">{{ layer.desc }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>`)

// 4. pages/examples.vue
writeFile('pages/examples.vue', `<script setup lang="ts">
import { ref } from 'vue'
import { Sparkles, Code2, Layers, Server, Laptop, CheckCircle2 } from 'lucide-vue-next'
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

    // Custom response key mapping
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
<\/script>

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
  await $fetch(\`/api/auth/sessions/\${id}\`, { method: 'DELETE' })
  await refresh()
}
<\/script>

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
    backend: \`// Uses built-in Nuxt Bearer Auth endpoints:
// GET /api/auth/sessions -> Lists Redis keys for user
// DELETE /api/auth/sessions/:id -> Deletes specific Redis key\`,
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
</template>`)

// 5. pages/playground.vue
writeFile('pages/playground.vue', `<script setup lang="ts">
import { Play, Sparkles } from 'lucide-vue-next'
import PlaygroundSim from '~/components/playground/PlaygroundSim.vue'

useHead({
  title: 'Interactive Playground — Nuxt Bearer Auth',
  meta: [
    {
      name: 'description',
      content: 'Interactive live authentication simulator for Nuxt Bearer Auth with Redis state inspection and HTTP-only cookie tracking.',
    },
  ],
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
    <div class="space-y-3 max-w-3xl">
      <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <Play class="w-3.5 h-3.5" />
        <span>Live Simulator</span>
      </div>
      <h1 class="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
        Interactive Playground
      </h1>
      <p class="text-base sm:text-lg text-gray-300 leading-relaxed">
        Test authentication lifecycles, inspect Redis memory keys, simulate multi-device logins, and watch how tokens stay on the server in real time.
      </p>
    </div>

    <!-- Playground Simulator Component -->
    <PlaygroundSim />
  </div>
</template>`)

// 6. server/routes/sitemap.xml.ts
writeFile('server/routes/sitemap.xml.ts', `import { docPages } from '~/data/docs'

export default defineEventHandler((event) => {
  const host = 'https://nuxt-bearer-auth.pages.dev'
  const staticRoutes = [
    '',
    '/architecture',
    '/examples',
    '/playground',
    '/docs/getting-started',
  ]

  const docRoutes = Object.keys(docPages).map((slug) => \`/docs/\${slug}\`)
  const allRoutes = Array.from(new Set([...staticRoutes, ...docRoutes]))

  const xml = \`<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">
\${allRoutes
  .map(
    (route) => \`  <url>
    <loc>\${host}\${route}</loc>
    <changefreq>weekly</changefreq>
    <priority>\${route === '' ? '1.0' : '0.8'}</priority>
  </url>\`
  )
  .join('\\n')}
</urlset>\`

  setResponseHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return xml
})`)

console.log('All pages generated successfully!')
