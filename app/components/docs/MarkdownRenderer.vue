<script setup lang="ts">
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
  const codeRegex = new RegExp('```([a-zA-Z0-9_-]*)\\n([\\s\\S]*?)```', 'g')
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
  return md
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-white mt-8 mb-3">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 id="$1" class="text-xl font-bold text-white mt-10 mb-4 pb-2 border-b border-gray-800/80 flex items-center gap-2">$1</h2>')
    .replace(/^> \*\*Security Tip\*\*: (.*$)/gim, '<div class="my-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm"><strong>Security Tip:</strong> $1</div>')
    .replace(/^> (.*$)/gim, '<blockquote class="my-4 pl-4 border-l-2 border-emerald-500 text-gray-300 italic text-sm">$1</blockquote>')
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-gray-800/80 text-emerald-400 font-mono text-xs border border-gray-700/50">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-emerald-400 hover:underline font-medium">$1</a>')
    .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc text-gray-300 my-1 text-sm leading-relaxed">$1</li>')
    .replace(/\n\n([^<\n]+)\n\n/g, '<p class="text-gray-300 leading-relaxed my-4 text-sm sm:text-base">$1</p>')
}
</script>

<template>
  <div class="docs-content space-y-2">
    <template v-for="(t, idx) in tokens" :key="idx">
      <CodeBlock v-if="t.type === 'code'" :code="t.raw" :lang="t.lang" />
      <div v-else v-html="formatMarkdownToHtml(t.raw)" />
    </template>
  </div>
</template>
