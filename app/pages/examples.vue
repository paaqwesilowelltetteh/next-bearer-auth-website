<script setup lang="ts">
import { ref } from 'vue'
import { Sparkles } from 'lucide-vue-next'
import CodeBlock from '~/components/ui/CodeBlock.vue'
import { exampleRecipes } from '~/data/code-samples'

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
        <h2 class="text-xl font-bold text-white">{{ exampleRecipes[activeTab].title }}</h2>
        <p class="text-sm text-gray-400 mt-1">{{ exampleRecipes[activeTab].desc }}</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div class="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-2 font-semibold">Nuxt Configuration / Frontend</div>
          <CodeBlock :code="exampleRecipes[activeTab].config" lang="typescript" />
        </div>
        <div>
          <div class="text-xs font-mono text-purple-400 uppercase tracking-wider mb-2 font-semibold">Backend / Server Route</div>
          <CodeBlock :code="exampleRecipes[activeTab].backend" lang="typescript" />
        </div>
      </div>
    </div>
  </div>
</template>
