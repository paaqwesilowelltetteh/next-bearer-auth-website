<script setup lang="ts">
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
</template>
