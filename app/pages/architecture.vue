<script setup lang="ts">
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
</template>
