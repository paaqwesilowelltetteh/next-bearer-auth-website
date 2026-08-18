<script setup lang="ts">
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
  title: computed(() => (doc.value ? `${doc.value.title} — Nuxt Bearer Auth` : 'Documentation — Nuxt Bearer Auth')),
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
</template>
