<script setup lang="ts">
import { Moon, Sun } from 'lucide-vue-next'
import { useTheme } from '~/composables/useTheme'

const { isDark, toggleTheme } = useTheme()
</script>

<template>
  <button
    type="button"
    @click="toggleTheme"
    class="p-2 rounded-lg text-gray-400 hover:text-gray-200 dark:hover:text-white hover:bg-gray-800/60 dark:hover:bg-gray-800/80 transition-colors border border-transparent hover:border-gray-700/50"
    :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
    :title="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
  >
    <Sun v-if="isDark" class="w-4 h-4 text-amber-400" />
    <Moon v-else class="w-4 h-4 text-slate-700 dark:text-slate-300" />
  </button>
</template>
