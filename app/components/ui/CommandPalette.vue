<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, FileText, ArrowRight, CornerDownLeft, Sparkles, BookOpen, Layers, Terminal, Play } from 'lucide-vue-next'
import { useDocs } from '~/composables/useDocs'
import { useCopy } from '~/composables/useCopy'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const router = useRouter()
const { searchDocs } = useDocs()
const { copy } = useCopy()

const searchInput = ref('')
const selectedIndex = ref(0)
const inputRef = ref<HTMLInputElement | null>(null)

const quickLinks = [
  { title: 'Getting Started', path: '/docs/getting-started', icon: BookOpen, category: 'Docs' },
  { title: 'Architecture Overview', path: '/architecture', icon: Layers, category: 'Architecture' },
  { title: 'Configuration Reference', path: '/docs/configuration', icon: FileText, category: 'Docs' },
  { title: 'Interactive Playground', path: '/playground', icon: Play, category: 'Demo' },
  { title: 'Integration Examples', path: '/examples', icon: Sparkles, category: 'Cookbook' },
]

const searchResults = computed(() => {
  if (!searchInput.value.trim()) {
    return []
  }
  return searchDocs(searchInput.value)
})

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      selectedIndex.value = 0
      searchInput.value = ''
      setTimeout(() => {
        inputRef.value?.focus()
      }, 50)
    }
  }
)

watch(searchResults, () => {
  selectedIndex.value = 0
})

function navigateToPath(path: string) {
  emit('close')
  if (path.startsWith('http')) {
    window.open(path, '_blank')
  } else if (path.startsWith('/docs')) {
    router.push(path)
  } else {
    router.push(path)
  }
}

function handleKeyDown(e: KeyboardEvent) {
  if (!props.isOpen) return

  const total = searchResults.value.length > 0 ? searchResults.value.length : quickLinks.length

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    selectedIndex.value = (selectedIndex.value + 1) % total
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    selectedIndex.value = (selectedIndex.value - 1 + total) % total
  } else if (e.key === 'Enter') {
    e.preventDefault()
    if (searchResults.value.length > 0) {
      const item = searchResults.value[selectedIndex.value]
      if (item) navigateToPath(`/docs/${item.slug}`)
    } else {
      const item = quickLinks[selectedIndex.value]
      if (item) navigateToPath(item.path)
    }
  } else if (e.key === 'Escape') {
    emit('close')
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/70 backdrop-blur-sm"
        @click.self="emit('close')"
      >
        <div class="relative w-full max-w-xl rounded-2xl border border-gray-800 bg-gray-950 dark:bg-dark-card shadow-2xl overflow-hidden">
          <!-- Search Header Input -->
          <div class="flex items-center px-4 border-b border-gray-800 bg-gray-900/50">
            <Search class="w-5 h-5 text-gray-400 shrink-0" />
            <input
              ref="inputRef"
              v-model="searchInput"
              type="text"
              placeholder="Search documentation, configuration, API..."
              class="w-full px-3 py-4 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
            />
            <kbd class="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono uppercase bg-gray-800 text-gray-400 rounded border border-gray-700">
              ESC
            </kbd>
          </div>

          <!-- Search Results or Quick Links -->
          <div class="max-h-96 overflow-y-auto p-2 divide-y divide-gray-800/40">
            <!-- Search Hits -->
            <div v-if="searchResults.length > 0" class="py-1">
              <div class="px-3 py-1.5 text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                Documentation Matches
              </div>
              <button
                v-for="(res, idx) in searchResults"
                :key="res.slug"
                type="button"
                @click="navigateToPath(`/docs/${res.slug}`)"
                @mouseenter="selectedIndex = idx"
                class="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-colors"
                :class="selectedIndex === idx ? 'bg-emerald-500/10 text-white' : 'text-gray-300 hover:bg-gray-800/50'"
              >
                <FileText class="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" />
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium text-white flex items-center justify-between">
                    <span>{{ res.title }}</span>
                    <span class="text-[10px] font-mono text-gray-500 bg-gray-900 px-1.5 py-0.5 rounded">{{ res.category }}</span>
                  </div>
                  <p class="text-xs text-gray-400 truncate mt-0.5">{{ res.snippet }}</p>
                </div>
                <ArrowRight v-if="selectedIndex === idx" class="w-4 h-4 text-emerald-400 shrink-0 self-center" />
              </button>
            </div>

            <!-- No search input: Quick navigation links -->
            <div v-else-if="!searchInput.trim()" class="py-1">
              <div class="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Quick Navigation
              </div>
              <button
                v-for="(item, idx) in quickLinks"
                :key="item.path"
                type="button"
                @click="navigateToPath(item.path)"
                @mouseenter="selectedIndex = idx"
                class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors"
                :class="selectedIndex === idx ? 'bg-emerald-500/10 text-white' : 'text-gray-300 hover:bg-gray-800/50'"
              >
                <component :is="item.icon" class="w-4 h-4 text-emerald-400 shrink-0" />
                <span class="text-sm font-medium text-white flex-1">{{ item.title }}</span>
                <span class="text-[11px] text-gray-500 font-mono">{{ item.category }}</span>
              </button>
            </div>

            <!-- No results state -->
            <div v-else class="p-8 text-center text-gray-400">
              <p class="text-sm">No documentation matches found for "{{ searchInput }}".</p>
              <p class="text-xs text-gray-500 mt-1">Try searching for keywords like "login", "redis", "csrf", or "ssr".</p>
            </div>
          </div>

          <!-- Footer shortcuts -->
          <div class="flex items-center justify-between px-4 py-2 bg-gray-900/60 border-t border-gray-800 text-[11px] text-gray-500 font-mono">
            <div class="flex items-center gap-3">
              <span class="flex items-center gap-1"><CornerDownLeft class="w-3 h-3" /> Select</span>
              <span>↑↓ Navigate</span>
            </div>
            <button
              type="button"
              @click="copy('pnpm add nuxt-bearer-auth redis nuxt-csurf')"
              class="hover:text-emerald-400 flex items-center gap-1 transition-colors"
            >
              <Terminal class="w-3 h-3" /> Copy Install Command
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
