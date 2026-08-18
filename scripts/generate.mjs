import fs from 'node:fs'
import path from 'node:path'

const baseDir = '/Users/agrocenta/Sites/Nuxt/nuxt-bearer-auth-website'

function ensureDir(filePath) {
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function writeFile(relPath, content) {
  const fullPath = path.join(baseDir, relPath)
  ensureDir(fullPath)
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8')
  console.log('Created:', relPath)
}

// 1. DocsSidebar.vue
writeFile('components/docs/DocsSidebar.vue', `<script setup lang="ts">
import { useDocs } from '~/composables/useDocs'
import { ChevronRight } from 'lucide-vue-next'

const { getCategories } = useDocs()
const categories = getCategories()
const route = useRoute()
</script>

<template>
  <aside class="w-64 shrink-0 hidden lg:block pr-6 space-y-8 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
    <div v-for="cat in categories" :key="cat.title" class="space-y-2">
      <h3 class="text-xs font-mono uppercase tracking-wider text-gray-400 font-semibold px-3">
        {{ cat.title }}
      </h3>
      <ul class="space-y-1">
        <li v-for="item in cat.items" :key="item.slug">
          <NuxtLink
            :to="'/docs/' + item.slug"
            class="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all group"
            :class="[
              route.params.slug === item.slug
                ? 'bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20 shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40 border border-transparent'
            ]"
          >
            <span>{{ item.title }}</span>
            <ChevronRight
              class="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5"
              :class="route.params.slug === item.slug ? 'text-emerald-400' : 'text-gray-600'"
            />
          </NuxtLink>
        </li>
      </ul>
    </div>
  </aside>
</template>`)

// 2. DocsToc.vue
writeFile('components/docs/DocsToc.vue', `<script setup lang="ts">
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
</template>`)

// 3. MarkdownRenderer.vue
writeFile('components/docs/MarkdownRenderer.vue', `<script setup lang="ts">
import { computed } from 'vue'
import CodeBlock from '~/components/ui/CodeBlock.vue'

const props = defineProps<{
  content: string
}>()

interface ContentToken {
  type: 'html' | 'code'
  raw: string
  lang?: string
}

const tokens = computed<ContentToken[]>(() => {
  const codeRegex = /\`\`\`([a-zA-Z0-9_-]*)\n([\\s\\S]*?)\`\`\`/g
  const list: ContentToken[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = codeRegex.exec(props.content)) !== null) {
    if (match.index > lastIndex) {
      list.push({
        type: 'html',
        raw: props.content.substring(lastIndex, match.index),
      })
    }

    list.push({
      type: 'code',
      lang: match[1] || 'typescript',
      raw: match[2] || '',
    })

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < props.content.length) {
    list.push({
      type: 'html',
      raw: props.content.substring(lastIndex),
    })
  }

  return list
})

function formatMarkdownToHtml(md: string) {
  let html = md
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-white mt-8 mb-3">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 id="$1" class="text-xl font-bold text-white mt-10 mb-4 pb-2 border-b border-gray-800/80 flex items-center gap-2">$1</h2>')
    .replace(/^> \*\*Security Tip\*\*: (.*$)/gim, '<div class="my-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm"><strong>Security Tip:</strong> $1</div>')
    .replace(/^> (.*$)/gim, '<blockquote class="my-4 pl-4 border-l-2 border-emerald-500 text-gray-300 italic text-sm">$1</blockquote>')
    .replace(/\`([^\`]+)\`/g, '<code class="px-1.5 py-0.5 rounded bg-gray-800/80 text-emerald-400 font-mono text-xs border border-gray-700/50">$1</code>')
    .replace(/\\*\\*([^\\*]+)\\*\\*/g, '<strong class="font-semibold text-white">$1</strong>')
    .replace(/\\[([^\\]]+)\\]\\(([^\\)]+)\\)/g, '<a href="$2" class="text-emerald-400 hover:underline font-medium">$1</a>')
    .replace(/^\\- (.*$)/gim, '<li class="ml-4 list-disc text-gray-300 my-1 text-sm leading-relaxed">$1</li>')
    .replace(/\\n\\n([^<\\n]+)\\n\\n/g, '<p class="text-gray-300 leading-relaxed my-4 text-sm sm:text-base">$1</p>')

  return html
}
</script>

<template>
  <div class="docs-content space-y-2">
    <template v-for="(t, idx) in tokens" :key="idx">
      <CodeBlock v-if="t.type === 'code'" :code="t.raw" :lang="t.lang" />
      <div v-else v-html="formatMarkdownToHtml(t.raw)" />
    </template>
  </div>
</template>`)

// 4. app.vue
writeFile('app.vue', `<script setup lang="ts">
import { onMounted } from 'vue'
import AppHeader from '~/components/layout/AppHeader.vue'
import AppFooter from '~/components/layout/AppFooter.vue'
import { useTheme } from '~/composables/useTheme'

const { initTheme } = useTheme()

onMounted(() => {
  initTheme()
})
</script>

<template>
  <div class="min-h-screen bg-gray-950 dark:bg-dark-bg text-gray-100 flex flex-col selection:bg-emerald-500 selection:text-black">
    <AppHeader />
    <main class="flex-1">
      <NuxtPage />
    </main>
    <AppFooter />
  </div>
</template>`)

console.log('Initial components created!')
