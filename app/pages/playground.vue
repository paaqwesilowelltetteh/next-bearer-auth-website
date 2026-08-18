<script setup lang="ts">
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
</template>
