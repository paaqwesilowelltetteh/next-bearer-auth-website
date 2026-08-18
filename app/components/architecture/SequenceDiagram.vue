<script setup lang="ts">
import { ref } from 'vue'
import { ArrowRight, Lock, Key, RefreshCw, LogOut, CheckCircle2, Shield, Database, Server, Monitor } from 'lucide-vue-next'

type FlowType = 'login' | 'request' | 'refresh' | 'logout'

const currentFlow = ref<FlowType>('login')

const flows = {
  login: {
    title: 'Login & Session Creation',
    description: 'User enters credentials. Nuxt authenticates with your backend API, receives the bearer token, stores it securely in Redis, and issues an HTTP-only cookie.',
    steps: [
      { from: 'Browser', to: 'Nuxt Server', action: 'POST /api/auth/login { email/username, password }', detail: 'Local Nuxt API route' },
      { from: 'Nuxt Server', to: 'Backend API', action: 'POST https://api.example.com/auth/login', detail: 'Direct server-to-server call' },
      { from: 'Backend API', to: 'Nuxt Server', action: '200 OK { token: "secret_bearer_token", user: {...} }', detail: 'Bearer token received on server' },
      { from: 'Nuxt Server', to: 'Redis', action: 'SETEX session:<uuid> 604800 { token, profile, ... }', detail: 'Stored in server memory with TTL' },
      { from: 'Nuxt Server', to: 'Browser', action: 'Set-Cookie: nuxt_bearer_auth_session=<uuid>; HttpOnly; Secure', detail: 'Browser receives session UUID only' },
    ]
  },
  request: {
    title: 'Authenticated Request & SSR',
    description: 'When visiting a page or calling an API route, Nuxt uses the session cookie to look up the bearer token in Redis and communicate with the backend.',
    steps: [
      { from: 'Browser', to: 'Nuxt Server', action: 'GET /dashboard (Cookie: nuxt_bearer_auth_session=<uuid>)', detail: 'Cookie sent automatically' },
      { from: 'Nuxt Server', to: 'Redis', action: 'GET session:<uuid>', detail: 'Fast server-side session lookup' },
      { from: 'Redis', to: 'Nuxt Server', action: 'Returns { token: "secret_bearer_token", user: {...} }', detail: 'Hydrates event.context.auth' },
      { from: 'Nuxt Server', to: 'Backend API', action: 'GET /v1/user-data (Authorization: Bearer <token>)', detail: 'Proxied with real bearer token' },
      { from: 'Nuxt Server', to: 'Browser', action: 'Streams fully rendered SSR HTML & user payload', detail: 'Zero layout shift or client flash' },
    ]
  },
  refresh: {
    title: 'Silent Token Refresh',
    description: 'Nuxt uses the refresh token stored in Redis to obtain a new access token from the backend without exposing either token to the browser.',
    steps: [
      { from: 'Browser', to: 'Nuxt Server', action: 'POST /api/auth/refresh (Cookie attached)', detail: 'Triggered automatically or on demand' },
      { from: 'Nuxt Server', to: 'Redis', action: 'GET session:<uuid> (Read existing refreshToken)', detail: 'Retrieves server-held refresh token' },
      { from: 'Nuxt Server', to: 'Backend API', action: 'POST /auth/refresh (Body: { refresh_token })', detail: 'Backend rotates access token' },
      { from: 'Backend API', to: 'Nuxt Server', action: 'Returns { token: "new_token", refresh_token: "new_ref" }', detail: 'New credentials intercepted' },
      { from: 'Nuxt Server', to: 'Redis', action: 'SETEX session:<uuid> (Updates stored tokens)', detail: 'Session updated in place' },
      { from: 'Nuxt Server', to: 'Browser', action: '200 OK { success: true, user: {...} }', detail: 'Browser session remains intact' },
    ]
  },
  logout: {
    title: 'Session Revocation & Logout',
    description: 'Nuxt invalidates the session in Redis, notifies the backend to revoke the bearer token, and deletes the browser cookie.',
    steps: [
      { from: 'Browser', to: 'Nuxt Server', action: 'POST /api/auth/logout', detail: 'Logout request initiated' },
      { from: 'Nuxt Server', to: 'Redis', action: 'DEL session:<uuid> & SREM user_sessions:<userId>', detail: 'Deletes session from Redis' },
      { from: 'Nuxt Server', to: 'Backend API', action: 'POST /auth/logout (Authorization: Bearer <token>)', detail: 'Informs backend to revoke token' },
      { from: 'Nuxt Server', to: 'Browser', action: 'Set-Cookie: nuxt_bearer_auth_session=; Max-Age=0', detail: 'Deletes browser session cookie' },
    ]
  }
}
</script>

<template>
  <div class="rounded-2xl border border-gray-800 bg-gray-950/80 p-6 sm:p-8 space-y-6">
    <!-- Flow Selector Tabs -->
    <div class="flex flex-wrap items-center gap-2 border-b border-gray-800 pb-4">
      <button
        type="button"
        @click="currentFlow = 'login'"
        class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all"
        :class="currentFlow === 'login' ? 'bg-emerald-500 text-black font-semibold shadow-glow-emerald' : 'text-gray-400 hover:text-white bg-gray-900/60'"
      >
        <Lock class="w-3.5 h-3.5" />
        <span>1. Login Flow</span>
      </button>

      <button
        type="button"
        @click="currentFlow = 'request'"
        class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all"
        :class="currentFlow === 'request' ? 'bg-emerald-500 text-black font-semibold shadow-glow-emerald' : 'text-gray-400 hover:text-white bg-gray-900/60'"
      >
        <Server class="w-3.5 h-3.5" />
        <span>2. Authenticated Request / SSR</span>
      </button>

      <button
        type="button"
        @click="currentFlow = 'refresh'"
        class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all"
        :class="currentFlow === 'refresh' ? 'bg-emerald-500 text-black font-semibold shadow-glow-emerald' : 'text-gray-400 hover:text-white bg-gray-900/60'"
      >
        <RefreshCw class="w-3.5 h-3.5" />
        <span>3. Silent Token Refresh</span>
      </button>

      <button
        type="button"
        @click="currentFlow = 'logout'"
        class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all"
        :class="currentFlow === 'logout' ? 'bg-emerald-500 text-black font-semibold shadow-glow-emerald' : 'text-gray-400 hover:text-white bg-gray-900/60'"
      >
        <LogOut class="w-3.5 h-3.5" />
        <span>4. Logout & Revocation</span>
      </button>
    </div>

    <!-- Active Flow Info -->
    <div>
      <h3 class="text-lg font-bold text-white flex items-center gap-2">
        <span>{{ flows[currentFlow].title }}</span>
      </h3>
      <p class="text-sm text-gray-400 mt-1">{{ flows[currentFlow].description }}</p>
    </div>

    <!-- Visual Sequence Step List -->
    <div class="space-y-3 pt-2">
      <div
        v-for="(st, idx) in flows[currentFlow].steps"
        :key="idx"
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-gray-800/80 bg-gray-900/40 hover:bg-gray-900/70 transition-colors"
      >
        <div class="flex items-center gap-3">
          <span class="w-6 h-6 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-mono flex items-center justify-center font-bold">
            {{ idx + 1 }}
          </span>

          <div class="flex items-center gap-2 text-xs font-mono">
            <span class="px-2 py-0.5 rounded bg-gray-800 text-gray-300">{{ st.from }}</span>
            <ArrowRight class="w-3 h-3 text-emerald-400" />
            <span class="px-2 py-0.5 rounded bg-gray-800 text-gray-300">{{ st.to }}</span>
          </div>
        </div>

        <div class="flex-1 sm:text-right">
          <div class="text-xs font-mono text-emerald-300 font-medium">{{ st.action }}</div>
          <div class="text-[11px] text-gray-500 mt-0.5">{{ st.detail }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
