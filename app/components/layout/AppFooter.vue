<script setup lang="ts">
import { Lock, Github, Heart, ArrowUpRight, Terminal, Shield } from 'lucide-vue-next'
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="w-full border-t border-gray-800/80 dark:border-dark-border/80 bg-gray-950/90 dark:bg-dark-bg text-gray-400 text-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12 mb-12">
        <!-- Col 1: Brand & Positioning -->
        <div class="md:col-span-2 space-y-4">
          <div class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-glow-emerald">
              <Lock class="w-3.5 h-3.5" />
            </div>
            <span class="font-bold text-base text-white tracking-tight">Nuxt Bearer Auth</span>
          </div>

          <p class="text-sm text-gray-400 max-w-md leading-relaxed">
            Server-side authentication infrastructure for Nuxt applications consuming bearer-token APIs. Keeps access tokens securely on the server with Redis-backed sessions and HTTP-only cookies.
          </p>

          <div class="flex flex-wrap items-center gap-3 pt-2">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-950/50 text-emerald-400 border border-emerald-800/40">
              <Shield class="w-3 h-3" />
              MIT Licensed
            </span>
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono bg-gray-900 text-gray-300 border border-gray-800">
              Nuxt 4 Ready
            </span>
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono bg-gray-900 text-gray-300 border border-gray-800">
              Redis Store
            </span>
          </div>
        </div>

        <!-- Col 2: Documentation Links -->
        <div class="space-y-3">
          <h4 class="text-xs font-mono uppercase tracking-wider text-gray-300 font-semibold">Documentation</h4>
          <ul class="space-y-2 text-sm">
            <li>
              <NuxtLink to="/docs/getting-started" class="hover:text-emerald-400 transition-colors">
                Getting Started
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/docs/configuration" class="hover:text-emerald-400 transition-colors">
                Configuration
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/docs/authentication" class="hover:text-emerald-400 transition-colors">
                Authentication Flows
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/docs/sessions" class="hover:text-emerald-400 transition-colors">
                Session Management
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/docs/ssr" class="hover:text-emerald-400 transition-colors">
                SSR & Hydration
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/docs/security" class="hover:text-emerald-400 transition-colors">
                Security Model
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/docs/api" class="hover:text-emerald-400 transition-colors">
                API Reference
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Col 3: Resources & Community -->
        <div class="space-y-3">
          <h4 class="text-xs font-mono uppercase tracking-wider text-gray-300 font-semibold">Resources & Project</h4>
          <ul class="space-y-2 text-sm">
            <li>
              <NuxtLink to="/architecture" class="hover:text-emerald-400 transition-colors">
                Architecture Deep Dive
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/examples" class="hover:text-emerald-400 transition-colors">
                Integration Examples
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/playground" class="hover:text-emerald-400 transition-colors">
                Interactive Playground
              </NuxtLink>
            </li>
            <li>
              <a
                href="https://github.com/paaqwesilowelltetteh/nuxt-bearer-auth"
                target="_blank"
                rel="noopener noreferrer"
                class="hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
              >
                GitHub Repository
                <ArrowUpRight class="w-3 h-3 opacity-60" />
              </a>
            </li>
            <li>
              <a
                href="https://github.com/paaqwesilowelltetteh/nuxt-bearer-auth/issues"
                target="_blank"
                rel="noopener noreferrer"
                class="hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
              >
                Issue Tracker
                <ArrowUpRight class="w-3 h-3 opacity-60" />
              </a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="pt-8 border-t border-gray-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
        <div>
          © {{ currentYear }} <a href="https://github.com/paaqwesilowelltetteh" target="_blank" rel="noopener noreferrer" class="text-gray-400 hover:text-white font-medium">Enoch Tetteh</a>. Open Source under the MIT License.
        </div>
        <div class="flex items-center gap-4">
          <span>Crafted for high-security Nuxt applications</span>
        </div>
      </div>
    </div>
  </footer>
</template>
