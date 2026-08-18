<script setup lang="ts">
import { Check, Copy, Terminal } from 'lucide-vue-next'
import { useCopy } from '~/composables/useCopy'
import { useHighlighter } from '~/composables/useHighlighter'
import { useTheme } from '~/composables/useTheme'

const props = withDefaults(
  defineProps<{
    code: string
    lang?: string
    filename?: string
    showCopy?: boolean
    showLineNumbers?: boolean
  }>(),
  {
    lang: 'typescript',
    filename: '',
    showCopy: true,
    showLineNumbers: false,
  }
)

const { copied, copy } = useCopy()
const { highlight } = useHighlighter()
const { isDark } = useTheme()

const highlightedHtml = ref('')

async function updateHighlight() {
  highlightedHtml.value = await highlight(props.code, props.lang, isDark.value)
}

watch(
  () => [props.code, props.lang, isDark.value],
  () => {
    updateHighlight()
  },
  { immediate: true }
)
</script>

<template>
  <div class="relative my-4 rounded-xl border border-gray-800/80 dark:border-dark-border bg-gray-950/90 dark:bg-dark-card overflow-hidden shadow-card-dark">
    <!-- Header bar if filename or language is present -->
    <div class="flex items-center justify-between px-4 py-2 bg-gray-900/80 dark:bg-dark-surface/60 border-b border-gray-800/70 dark:border-dark-border/70 text-xs text-gray-400">
      <div class="flex items-center gap-2">
        <Terminal v-if="!filename" class="w-3.5 h-3.5 text-emerald-400" />
        <span v-if="filename" class="font-mono text-gray-300 font-medium">{{ filename }}</span>
        <span v-else class="font-mono text-gray-400 uppercase tracking-wider text-[11px]">{{ lang }}</span>
      </div>

      <div class="flex items-center gap-2">
        <span v-if="filename && lang" class="font-mono text-[10px] uppercase text-gray-500 bg-gray-800/50 px-1.5 py-0.5 rounded">
          {{ lang }}
        </span>
        <button
          v-if="showCopy"
          type="button"
          @click="copy(code)"
          class="flex items-center gap-1 px-2 py-1 rounded bg-gray-800/50 hover:bg-gray-700/60 text-gray-300 hover:text-white transition-all text-xs font-mono"
          :title="copied ? 'Copied to clipboard' : 'Copy code'"
        >
          <Check v-if="copied" class="w-3.5 h-3.5 text-emerald-400" />
          <Copy v-else class="w-3.5 h-3.5 text-gray-400" />
          <span>{{ copied ? 'Copied' : 'Copy' }}</span>
        </button>
      </div>
    </div>

    <!-- Code body -->
    <div class="p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed">
      <div v-if="highlightedHtml" v-html="highlightedHtml" class="shiki-wrapper" />
      <pre v-else class="text-gray-300"><code>{{ code }}</code></pre>
    </div>
  </div>
</template>

<style scoped>
:deep(pre) {
  background-color: transparent !important;
  padding: 0 !important;
  margin: 0 !important;
}
:deep(code) {
  font-family: inherit;
  background: transparent !important;
}
</style>
