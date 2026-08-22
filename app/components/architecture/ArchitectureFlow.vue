<script setup lang="ts">
import { ref, computed } from 'vue'
import { Monitor, Server, Database, Cloud, Cookie, ArrowRight, Lock, CheckCircle2 } from 'lucide-vue-next'

const activeStep = ref(0)

interface FlowStep {
  title: string
  description: string
  boundary: string
  status: string
}

const steps: FlowStep[] = [
  {
    title: '1. User Submits Credentials',
    description: 'Browser sends login request to local Nuxt endpoint (/api/auth/login).',
    boundary: 'Browser ➔ Nuxt Server',
    status: 'Client Boundary'
  },
  {
    title: '2. Nuxt Calls External API',
    description: 'Nuxt server forwards credentials to backend API (e.g., auth/login) over server network.',
    boundary: 'Nuxt Server ➔ Backend API',
    status: 'Private Server Network'
  },
  {
    title: '3. API Returns Bearer Token',
    description: 'External API generates bearer token. Nuxt intercepts it on the server.',
    boundary: 'Backend API ➔ Nuxt Server',
    status: 'Token Intercepted'
  },
  {
    title: '4. Nuxt Stores Token in Redis',
    description: 'Nuxt stores { token, refreshToken, profile } in Redis under session:UUID.',
    boundary: 'Nuxt Server ➔ Redis Store',
    status: 'Token Saved in Redis'
  },
  {
    title: '5. Browser Receives Cookie',
    description: 'Browser receives an HTTP-only, Secure cookie containing only the random session UUID. Bearer token is NEVER exposed to JavaScript.',
    boundary: 'Nuxt Server ➔ Browser Cookie',
    status: 'Zero Token Leakage'
  }
]

const currentStep = computed<FlowStep>(() => (steps[activeStep.value] || steps[0]) as FlowStep)
</script>

<template>
  <div class="w-full rounded-2xl border border-gray-800/80 dark:border-dark-border bg-gray-950/70 dark:bg-dark-card/90 p-6 sm:p-8 backdrop-blur-sm shadow-card-dark glow-border">
    <!-- Top Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-800/70">
      <div>
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Lock class="w-3 h-3" />
            Security Boundary Architecture
          </span>
          <span class="text-xs text-gray-500 font-mono hidden sm:inline">Zero-Trust Isolation</span>
        </div>
        <h3 class="text-lg sm:text-xl font-bold text-white mt-1">
          How Nuxt Bearer Auth Isolates Tokens
        </h3>
      </div>

      <!-- Step Counter Controls -->
      <div class="flex items-center gap-1.5 bg-gray-900/80 p-1 rounded-xl border border-gray-800 text-xs font-mono">
        <button
          v-for="(_, idx) in steps"
          :key="idx"
          type="button"
          @click="activeStep = idx"
          class="px-2.5 py-1 rounded-lg transition-all"
          :class="activeStep === idx ? 'bg-emerald-500 text-black font-semibold shadow-sm' : 'text-gray-400 hover:text-white'"
        >
          Step {{ idx + 1 }}
        </button>
      </div>
    </div>

    <!-- Interactive Diagram Nodes -->
    <div class="py-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 relative">
        <!-- Node 1: Browser -->
        <div
          class="relative p-5 rounded-xl border transition-all duration-300 flex flex-col justify-between"
          :class="[
            activeStep === 0 || activeStep === 4
              ? 'bg-emerald-950/20 border-emerald-500/50 shadow-glow-emerald'
              : 'bg-gray-900/50 dark:bg-dark-surface/40 border-gray-800/80'
          ]"
        >
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div class="w-9 h-9 rounded-lg bg-gray-800/80 flex items-center justify-center text-cyan-400 border border-gray-700/50">
                <Monitor class="w-5 h-5" />
              </div>
              <span class="text-[11px] font-mono px-2 py-0.5 rounded bg-gray-800 text-gray-300">Client</span>
            </div>

            <div>
              <h4 class="text-sm font-bold text-white">Browser</h4>
              <p class="text-xs text-gray-400 mt-0.5">Vue / Nuxt SPA</p>
            </div>

            <div class="p-2.5 rounded-lg bg-gray-950/80 border border-gray-800/80 text-[11px] font-mono space-y-1">
              <div class="text-emerald-400 flex items-center gap-1">
                <Cookie class="w-3.5 h-3.5" />
                <span>HTTP-Only Cookie</span>
              </div>
              <div class="text-gray-500 truncate text-[10px]">
                nuxt_bearer_auth_session=UUID
              </div>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-gray-800/50 flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
            <CheckCircle2 class="w-3.5 h-3.5" />
            <span>No Plaintext Tokens</span>
          </div>
        </div>

        <!-- Connector 1 -->
        <div class="hidden md:flex absolute top-1/2 left-[23%] -translate-y-1/2 z-10 text-emerald-400">
          <div class="w-8 h-8 rounded-full bg-gray-900 border border-emerald-500/30 flex items-center justify-center">
            <ArrowRight class="w-4 h-4 animate-pulse" />
          </div>
        </div>

        <!-- Node 2: Nuxt Server -->
        <div
          class="relative p-5 rounded-xl border transition-all duration-300 flex flex-col justify-between"
          :class="[
            activeStep === 0 || activeStep === 1 || activeStep === 2 || activeStep === 3 || activeStep === 4
              ? 'bg-emerald-950/25 border-emerald-500/60 shadow-glow-emerald-lg'
              : 'bg-gray-900/50 dark:bg-dark-surface/40 border-gray-800/80'
          ]"
        >
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div class="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/40">
                <Server class="w-5 h-5" />
              </div>
              <span class="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">Gateway</span>
            </div>

            <div>
              <h4 class="text-sm font-bold text-white">Nuxt Server</h4>
              <p class="text-xs text-gray-400 mt-0.5">Nitro Auth Gateway</p>
            </div>

            <div class="p-2.5 rounded-lg bg-gray-950/80 border border-gray-800/80 text-[11px] font-mono space-y-1">
              <div class="text-gray-300 flex items-center gap-1">
                <Lock class="w-3.5 h-3.5 text-emerald-400" />
                <span>Session Hydrator</span>
              </div>
              <div class="text-gray-500 text-[10px]">
                /api/auth/* endpoints
              </div>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-gray-800/50 flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
            <CheckCircle2 class="w-3.5 h-3.5" />
            <span>SSR Auth Ready</span>
          </div>
        </div>

        <!-- Connector 2 -->
        <div class="hidden md:flex absolute top-1/2 left-[48%] -translate-y-1/2 z-10 text-emerald-400">
          <div class="w-8 h-8 rounded-full bg-gray-900 border border-emerald-500/30 flex items-center justify-center">
            <ArrowRight class="w-4 h-4 animate-pulse" />
          </div>
        </div>

        <!-- Node 3: Redis Session Store -->
        <div
          class="relative p-5 rounded-xl border transition-all duration-300 flex flex-col justify-between"
          :class="[
            activeStep === 3 || activeStep === 4
              ? 'bg-emerald-950/20 border-emerald-500/50 shadow-glow-emerald'
              : 'bg-gray-900/50 dark:bg-dark-surface/40 border-gray-800/80'
          ]"
        >
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div class="w-9 h-9 rounded-lg bg-red-950/40 flex items-center justify-center text-red-400 border border-red-800/40">
                <Database class="w-5 h-5" />
              </div>
              <span class="text-[11px] font-mono px-2 py-0.5 rounded bg-gray-800 text-gray-300">Storage</span>
            </div>

            <div>
              <h4 class="text-sm font-bold text-white">Redis Cache</h4>
              <p class="text-xs text-gray-400 mt-0.5">Session Store (TTL)</p>
            </div>

            <div class="p-2.5 rounded-lg bg-gray-950/80 border border-gray-800/80 text-[11px] font-mono space-y-1">
              <div class="text-red-400 flex items-center gap-1">
                <Lock class="w-3.5 h-3.5" />
                <span>Stores Bearer Token</span>
              </div>
              <div class="text-gray-500 text-[10px]">
                session:UUID (TTL 7d)
              </div>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-gray-800/50 flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
            <CheckCircle2 class="w-3.5 h-3.5" />
            <span>Fast Key Lookup</span>
          </div>
        </div>

        <!-- Connector 3 -->
        <div class="hidden md:flex absolute top-1/2 left-[73%] -translate-y-1/2 z-10 text-emerald-400">
          <div class="w-8 h-8 rounded-full bg-gray-900 border border-emerald-500/30 flex items-center justify-center">
            <ArrowRight class="w-4 h-4 animate-pulse" />
          </div>
        </div>

        <!-- Node 4: External API -->
        <div
          class="relative p-5 rounded-xl border transition-all duration-300 flex flex-col justify-between"
          :class="[
            activeStep === 1 || activeStep === 2
              ? 'bg-purple-950/25 border-purple-500/50 shadow-glow-cyan'
              : 'bg-gray-900/50 dark:bg-dark-surface/40 border-gray-800/80'
          ]"
        >
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div class="w-9 h-9 rounded-lg bg-purple-950/40 flex items-center justify-center text-purple-400 border border-purple-800/40">
                <Cloud class="w-5 h-5" />
              </div>
              <span class="text-[11px] font-mono px-2 py-0.5 rounded bg-gray-800 text-gray-300">Backend</span>
            </div>

            <div>
              <h4 class="text-sm font-bold text-white">External API</h4>
              <p class="text-xs text-gray-400 mt-0.5">Laravel / REST API</p>
            </div>

            <div class="p-2.5 rounded-lg bg-gray-950/80 border border-gray-800/80 text-[11px] font-mono space-y-1">
              <div class="text-purple-400 flex items-center gap-1">
                <Lock class="w-3.5 h-3.5" />
                <span>Issues Bearer Token</span>
              </div>
              <div class="text-gray-500 text-[10px]">
                Authorization: Bearer ...
              </div>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-gray-800/50 flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
            <CheckCircle2 class="w-3.5 h-3.5" />
            <span>Agnostic Protocol</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Active Step Detail Callout -->
    <div class="mt-2 p-4 rounded-xl bg-gray-900/70 border border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <span class="text-xs font-mono font-semibold text-emerald-400">{{ currentStep.title }}</span>
          <span class="text-[10px] font-mono text-gray-400 bg-gray-800 px-2 py-0.5 rounded">{{ currentStep.boundary }}</span>
        </div>
        <p class="text-xs sm:text-sm text-gray-300">{{ currentStep.description }}</p>
      </div>

      <button
        type="button"
        @click="activeStep = (activeStep + 1) % steps.length"
        class="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-800 hover:bg-gray-700 text-white transition-colors"
      >
        <span>Next Step</span>
        <ArrowRight class="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
</template>
