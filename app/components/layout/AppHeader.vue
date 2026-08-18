<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Lock, Search, Github, Menu, X, ArrowUpRight, ArrowRight, ShieldCheck, BookOpen, Layers, Sparkles, Play } from 'lucide-vue-next'
import ThemeToggle from '~/components/ui/ThemeToggle.vue'
import CommandPalette from '~/components/ui/CommandPalette.vue'
import { docCategories } from '~/data/docs'

const config = useRuntimeConfig()
const isCommandPaletteOpen = ref(false)
const isMobileMenuOpen = ref(false)
const isScrolled = ref(false)
const moduleVersion = computed(() => String(config.public.moduleVersion || 'v0.1.5'))

function onScroll() {
  isScrolled.value = window.scrollY > 10
}

function handleKeyCombo(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    isCommandPaletteOpen.value = !isCommandPaletteOpen.value
  }
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', handleKeyCombo)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', handleKeyCombo)
})
</script>

<template>
  <header
    class="sticky top-0 z-40 w-full transition-all duration-200 border-b"
    :class="[
      isScrolled
        ? 'bg-gray-950/85 dark:bg-dark-bg/85 backdrop-blur-md border-gray-800/80 dark:border-dark-border/80 shadow-md'
        : 'bg-gray-950/60 dark:bg-dark-bg/60 backdrop-blur-sm border-transparent'
    ]"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
      <!-- Left: Logo & Brand -->
      <div class="flex items-center gap-6">
        <NuxtLink to="/" class="flex items-center gap-2.5 group">
          <div class="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:border-emerald-500 group-hover:scale-105 transition-all shadow-glow-emerald">
            <Lock class="w-4 h-4" />
          </div>
          <div class="flex items-center gap-2">
            <span class="font-bold text-base tracking-tight text-white group-hover:text-emerald-400 transition-colors">
              Nuxt Bearer Auth
            </span>
            <span class="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono uppercase bg-emerald-950/60 text-emerald-400 rounded border border-emerald-800/60">
              v{{ moduleVersion }}
            </span>
          </div>
        </NuxtLink>

        <!-- Desktop Navigation Links -->
        <nav class="hidden md:flex items-center gap-1 text-sm font-medium text-gray-300">
          <NuxtLink
            to="/docs/getting-started"
            class="px-3 py-1.5 rounded-lg hover:text-white hover:bg-gray-800/50 transition-colors"
            active-class="text-emerald-400 bg-gray-800/60"
          >
            Docs
          </NuxtLink>
          <NuxtLink
            to="/architecture"
            class="px-3 py-1.5 rounded-lg hover:text-white hover:bg-gray-800/50 transition-colors"
            active-class="text-emerald-400 bg-gray-800/60"
          >
            Architecture
          </NuxtLink>
          <NuxtLink
            to="/examples"
            class="px-3 py-1.5 rounded-lg hover:text-white hover:bg-gray-800/50 transition-colors"
            active-class="text-emerald-400 bg-gray-800/60"
          >
            Examples
          </NuxtLink>
          <NuxtLink
            to="/playground"
            class="px-3 py-1.5 rounded-lg hover:text-white hover:bg-gray-800/50 transition-colors flex items-center gap-1.5"
            active-class="text-emerald-400 bg-gray-800/60"
          >
            <span>Playground</span>
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </NuxtLink>
        </nav>
      </div>

      <!-- Right: Search, Theme, GitHub, CTA -->
      <div class="flex items-center gap-2 sm:gap-3">
        <!-- Search Trigger -->
        <button
          type="button"
          @click="isCommandPaletteOpen = true"
          class="flex items-center gap-2 px-2.5 py-1.5 text-xs text-gray-400 hover:text-white bg-gray-900/80 hover:bg-gray-800 rounded-lg border border-gray-800 transition-colors font-mono"
          aria-label="Search documentation"
        >
          <Search class="w-3.5 h-3.5" />
          <span class="hidden sm:inline">Search...</span>
          <kbd class="hidden sm:inline-block px-1.5 py-0.2 text-[10px] bg-gray-800 text-gray-400 rounded border border-gray-700">
            ⌘K
          </kbd>
        </button>

        <!-- Theme Switcher -->
        <ThemeToggle />

        <!-- GitHub Link -->
        <a
          href="https://github.com/paaqwesilowelltetteh/nuxt-bearer-auth"
          target="_blank"
          rel="noopener noreferrer"
          class="hidden sm:flex items-center gap-1.5 p-2 text-gray-400 hover:text-white hover:bg-gray-800/60 rounded-lg border border-transparent hover:border-gray-700/50 transition-colors text-xs font-medium"
          aria-label="GitHub Repository"
        >
          <Github class="w-4 h-4" />
          <span class="hidden lg:inline">GitHub</span>
          <ArrowUpRight class="w-3 h-3 opacity-60" />
        </a>

        <!-- Primary CTA -->
        <NuxtLink
          to="/docs/getting-started"
          class="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black shadow-glow-emerald transition-all transform active:scale-95"
        >
          <span>Get Started</span>
          <ArrowRight class="w-3.5 h-3.5" />
        </NuxtLink>

        <!-- Mobile Menu Button -->
        <button
          type="button"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
          class="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/60"
          aria-label="Toggle navigation menu"
        >
          <X v-if="isMobileMenuOpen" class="w-5 h-5" />
          <Menu v-else class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Mobile Drawer Overlay -->
    <div
      v-if="isMobileMenuOpen"
      class="fixed inset-0 top-16 z-50 bg-gray-950/95 dark:bg-dark-bg/95 backdrop-blur-xl border-b border-gray-800 md:hidden overflow-y-auto px-6 py-8"
    >
      <div class="space-y-6">
        <!-- Main Links -->
        <div class="space-y-2">
          <div class="text-[11px] font-mono text-gray-500 uppercase tracking-wider px-3">Navigation</div>
          <NuxtLink
            to="/docs/getting-started"
            @click="isMobileMenuOpen = false"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium text-gray-200 hover:bg-gray-800/60 hover:text-emerald-400"
          >
            <BookOpen class="w-5 h-5 text-emerald-400" />
            Documentation
          </NuxtLink>
          <NuxtLink
            to="/architecture"
            @click="isMobileMenuOpen = false"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium text-gray-200 hover:bg-gray-800/60 hover:text-emerald-400"
          >
            <Layers class="w-5 h-5 text-cyan-400" />
            Architecture Deep-Dive
          </NuxtLink>
          <NuxtLink
            to="/examples"
            @click="isMobileMenuOpen = false"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium text-gray-200 hover:bg-gray-800/60 hover:text-emerald-400"
          >
            <Sparkles class="w-5 h-5 text-purple-400" />
            Integration Examples
          </NuxtLink>
          <NuxtLink
            to="/playground"
            @click="isMobileMenuOpen = false"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium text-gray-200 hover:bg-gray-800/60 hover:text-emerald-400"
          >
            <Play class="w-5 h-5 text-amber-400" />
            Interactive Playground
          </NuxtLink>
        </div>

        <!-- Documentation Index on Mobile -->
        <div class="pt-4 border-t border-gray-800 space-y-4">
          <div class="text-[11px] font-mono text-gray-500 uppercase tracking-wider px-3">Documentation Pages</div>
          <div v-for="cat in docCategories" :key="cat.title" class="space-y-1">
            <div class="text-xs font-semibold text-gray-400 px-3">{{ cat.title }}</div>
            <NuxtLink
              v-for="item in cat.items"
              :key="item.slug"
              :to="`/docs/${item.slug}`"
              @click="isMobileMenuOpen = false"
              class="block px-3 py-1.5 text-sm text-gray-300 hover:text-emerald-400 rounded-lg hover:bg-gray-800/40"
            >
              {{ item.title }}
            </NuxtLink>
          </div>
        </div>

        <!-- Mobile Actions -->
        <div class="pt-6 border-t border-gray-800 flex flex-col gap-3">
          <a
            href="https://github.com/paaqwesilowelltetteh/nuxt-bearer-auth"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium text-gray-200 bg-gray-900 rounded-xl border border-gray-800"
          >
            <Github class="w-4 h-4" />
            <span>GitHub Repository</span>
            <ArrowUpRight class="w-4 h-4" />
          </a>
          <NuxtLink
            to="/docs/getting-started"
            @click="isMobileMenuOpen = false"
            class="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-black bg-emerald-500 rounded-xl"
          >
            <span>Get Started</span>
            <ArrowRight class="w-4 h-4" />
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Command Palette Modal -->
    <CommandPalette :is-open="isCommandPaletteOpen" @close="isCommandPaletteOpen = false" />
  </header>
</template>
