<script setup lang="ts">
import type { DocSection } from '~/data/docs'
import { AlignLeft, ArrowUpRight } from 'lucide-vue-next'

defineProps<{
  sections: DocSection[]
  activeSection?: string
}>()
</script>

<template>
  <aside class="w-56 shrink-0 hidden xl:block pl-6 space-y-6 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto border-l border-gray-800/70 text-xs font-mono">
    <div class="space-y-3">
      <div class="flex items-center gap-1.5 text-gray-400 uppercase tracking-wider text-[11px] font-semibold">
        <AlignLeft class="w-3.5 h-3.5 text-emerald-400" />
        <span>On this page</span>
      </div>

      <nav class="space-y-2">
        <a
          v-for="sec in sections"
          :key="sec.id"
          :href="'#' + sec.id"
          class="block transition-colors leading-relaxed"
          :class="[
            activeSection === sec.id
              ? 'text-emerald-400 font-semibold'
              : 'text-gray-400 hover:text-gray-200'
          ]"
        >
          {{ sec.title }}
        </a>
      </nav>
    </div>

    <div class="pt-4 border-t border-gray-800/60 space-y-2 text-[11px]">
      <a
        href="https://github.com/paaqwesilowelltetteh/nuxt-bearer-auth/issues/new"
        target="_blank"
        rel="noopener noreferrer"
        class="text-gray-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
      >
        <span>Report an issue</span>
        <ArrowUpRight class="w-3 h-3" />
      </a>
      <a
        href="https://github.com/paaqwesilowelltetteh/nuxt-bearer-auth"
        target="_blank"
        rel="noopener noreferrer"
        class="text-gray-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
      >
        <span>View on GitHub</span>
        <ArrowUpRight class="w-3 h-3" />
      </a>
    </div>
  </aside>
</template>
