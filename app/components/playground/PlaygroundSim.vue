<script setup lang="ts">
import { ref } from 'vue'
import {
  Lock,
  Monitor,
  Database,
  RefreshCw,
  Trash2,
  PlusCircle,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Terminal,
} from 'lucide-vue-next'

const isAuthenticated = ref(false)
const user = ref<{ id: string; name: string; email: string; role: string } | null>(null)
const status = ref<'idle' | 'loading' | 'authenticated' | 'unauthenticated'>('unauthenticated')
const activeSessionId = ref<string | null>(null)

interface SimSession {
  id: string
  userId: string
  token: string
  refreshToken: string
  device: string
  ip: string
  createdAt: string
  lastActivity: string
  ttl: number
}

const redisSessions = ref<SimSession[]>([])
const inputEmail = ref('enoch@example.com')
const inputPassword = ref('password123')
const isSimulating = ref(false)

interface LogEntry {
  id: number
  time: string
  level: 'info' | 'success' | 'warn' | 'action'
  message: string
}

const logs = ref<LogEntry[]>([
  {
    id: 1,
    time: new Date().toLocaleTimeString(),
    level: 'info',
    message: 'Playground initialized. Redis session store is empty and ready.',
  },
])

function addLog(message: string, level: LogEntry['level'] = 'info') {
  logs.value.unshift({
    id: Date.now() + Math.random(),
    time: new Date().toLocaleTimeString(),
    level,
    message,
  })
}

async function simulateLogin() {
  isSimulating.value = true
  status.value = 'loading'
  addLog('[Browser] Initiating POST /api/auth/login with email="' + inputEmail.value + '"', 'action')

  await new Promise((r) => setTimeout(r, 400))
  addLog('[Nuxt Server] Forwarding credentials to https://api.example.com/auth/login...', 'info')

  await new Promise((r) => setTimeout(r, 400))
  const newBearerToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + btoa(inputEmail.value) + '.' + Math.random().toString(36).substring(2, 10)
  const newRefreshToken = 'rf_' + Math.random().toString(36).substring(2, 18)
  const sessionUuid = 'sess_' + Math.random().toString(36).substring(2, 10) + '-' + Math.random().toString(36).substring(2, 6)

  addLog('[External API] 200 OK — Bearer token generated on external backend.', 'success')

  const profile = {
    id: 'usr_84920',
    name: 'Enoch Tetteh',
    email: inputEmail.value,
    role: 'Admin Developer',
  }

  const newSession: SimSession = {
    id: sessionUuid,
    userId: profile.id,
    token: newBearerToken,
    refreshToken: newRefreshToken,
    device: 'MacBook Pro (Chrome)',
    ip: '192.168.1.104',
    createdAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    ttl: 604800,
  }

  redisSessions.value = [newSession, ...redisSessions.value]
  activeSessionId.value = sessionUuid
  user.value = profile
  isAuthenticated.value = true
  status.value = 'authenticated'
  isSimulating.value = false

  addLog('[Redis] Stored session in key "session:' + sessionUuid + '" (TTL: 7d)', 'success')
  addLog('[Nuxt Server] Set HTTP-only cookie: nuxt_bearer_auth_session=' + sessionUuid, 'success')
  addLog('[Client] Composable useBearerAuth() updated: isAuthenticated=true', 'info')
}

async function simulateTokenRefresh() {
  if (!activeSessionId.value) return
  isSimulating.value = true
  addLog('[Browser] Invoked auth.refresh() ➔ POST /api/auth/refresh', 'action')

  await new Promise((r) => setTimeout(r, 400))
  addLog('[Nuxt Server] Reading stored refreshToken from Redis session "' + activeSessionId.value + '"', 'info')

  await new Promise((r) => setTimeout(r, 400))
  const refreshedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.REFRESHED_' + Math.random().toString(36).substring(2, 10)

  const target = redisSessions.value.find((s) => s.id === activeSessionId.value)
  if (target) {
    target.token = refreshedToken
    target.lastActivity = new Date().toISOString()
  }

  isSimulating.value = false
  addLog('[External API] 200 OK — Issued rotated access token.', 'success')
  addLog('[Redis] Updated bearer token inside Redis session "' + activeSessionId.value + '"', 'success')
}

async function simulateAddDeviceSession() {
  const secondUuid = 'sess_' + Math.random().toString(36).substring(2, 10) + '-mobile'
  const secondSession: SimSession = {
    id: secondUuid,
    userId: user.value?.id || 'usr_84920',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.MOBILE_' + Math.random().toString(36).substring(2, 10),
    refreshToken: 'rf_mob_' + Math.random().toString(36).substring(2, 10),
    device: 'iPhone 15 Pro (Mobile Safari)',
    ip: '172.56.21.9',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    lastActivity: new Date().toISOString(),
    ttl: 604800,
  }

  redisSessions.value.push(secondSession)
  addLog('[Simulated Device] Logged in from iPhone 15 Pro. Added session "' + secondUuid + '" to Redis', 'action')
}

async function simulateRevokeSession(sessionId: string) {
  addLog('[Browser] Sent DELETE /api/auth/sessions/' + sessionId, 'action')
  redisSessions.value = redisSessions.value.filter((s) => s.id !== sessionId)

  if (activeSessionId.value === sessionId) {
    activeSessionId.value = null
    isAuthenticated.value = false
    user.value = null
    status.value = 'unauthenticated'
    addLog('[Client] Current active session was revoked. Client state cleared.', 'warn')
  } else {
    addLog('[Redis] Revoked remote session "' + sessionId + '". Device disconnected.', 'success')
  }
}

async function simulateLogout() {
  isSimulating.value = true
  addLog('[Browser] Invoked auth.logout() ➔ POST /api/auth/logout', 'action')

  await new Promise((r) => setTimeout(r, 400))
  if (activeSessionId.value) {
    redisSessions.value = redisSessions.value.filter((s) => s.id !== activeSessionId.value)
  }

  activeSessionId.value = null
  isAuthenticated.value = false
  user.value = null
  status.value = 'unauthenticated'
  isSimulating.value = false

  addLog('[Redis] Session destroyed and cookie deleted.', 'info')
}
</script>

<template>
  <div class="space-y-6">
    <div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-300 text-xs sm:text-sm">
      <AlertCircle class="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
      <div>
        <span class="font-bold">Simulated environment:</span> No real credentials or network requests are transmitted. This interactive playground visually demonstrates how Redis sessions, HTTP-only cookies, and bearer tokens interact behind the scenes.
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Left: Client (5 cols) -->
      <div class="lg:col-span-5 space-y-6">
        <div class="p-5 rounded-2xl border border-gray-800 bg-gray-950/80 shadow-card-dark">
          <div class="flex items-center justify-between pb-3 border-b border-gray-800">
            <h3 class="text-sm font-bold text-white flex items-center gap-2">
              <Monitor class="w-4 h-4 text-emerald-400" />
              <span>Client State (useBearerAuth)</span>
            </h3>
            <span
              class="px-2 py-0.5 text-[10px] font-mono uppercase rounded-full"
              :class="isAuthenticated ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-gray-800 text-gray-400'"
            >
              {{ status }}
            </span>
          </div>

          <div class="py-4 space-y-4">
            <div v-if="!isAuthenticated" class="space-y-3">
              <div>
                <label class="block text-xs font-mono text-gray-400 mb-1">Email / Username / Identifier</label>
                <input
                  v-model="inputEmail"
                  type="email"
                  class="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label class="block text-xs font-mono text-gray-400 mb-1">Password</label>
                <input
                  v-model="inputPassword"
                  type="password"
                  class="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <button
                type="button"
                @click="simulateLogin"
                :disabled="isSimulating"
                class="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs flex items-center justify-center gap-2 shadow-glow-emerald transition-all"
              >
                <Lock class="w-3.5 h-3.5" />
                <span>{{ isSimulating ? 'Authenticating...' : 'Simulate Login' }}</span>
              </button>
            </div>

            <div v-else class="space-y-3">
              <div class="p-3 rounded-xl bg-gray-900/80 border border-gray-800 space-y-1 text-xs">
                <div class="text-gray-400">Authenticated User:</div>
                <div class="text-white font-medium">{{ user?.name }} ({{ user?.email }})</div>
                <div class="text-[10px] font-mono text-emerald-400">Role: {{ user?.role }}</div>
              </div>

              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  @click="simulateTokenRefresh"
                  :disabled="isSimulating"
                  class="p-2.5 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 text-xs text-emerald-400 font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': isSimulating }" />
                  <span>Silent Refresh</span>
                </button>

                <button
                  type="button"
                  @click="simulateAddDeviceSession"
                  class="p-2.5 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 text-xs text-cyan-400 font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <PlusCircle class="w-3.5 h-3.5" />
                  <span>Add 2nd Device</span>
                </button>
              </div>

              <button
                type="button"
                @click="simulateLogout"
                :disabled="isSimulating"
                class="w-full py-2 rounded-lg bg-red-950/40 hover:bg-red-900/50 border border-red-800/40 text-red-400 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Trash2 class="w-3.5 h-3.5" />
                <span>Simulate Logout</span>
              </button>
            </div>
          </div>
        </div>

        <div class="p-5 rounded-2xl border border-gray-800 bg-gray-950/80 shadow-card-dark">
          <div class="flex items-center justify-between pb-3 border-b border-gray-800">
            <h3 class="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck class="w-4 h-4 text-emerald-400" />
              <span>Browser Cookie Jar</span>
            </h3>
            <span class="text-[10px] font-mono text-gray-500">HttpOnly; Secure</span>
          </div>

          <div class="py-3">
            <div v-if="activeSessionId" class="p-3 rounded-xl bg-gray-900/60 border border-emerald-500/20 space-y-2 text-xs font-mono">
              <div class="flex items-center justify-between text-emerald-400 font-semibold">
                <span>nuxt_bearer_auth_session</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">SameSite=Lax</span>
              </div>
              <div class="text-gray-300 break-all text-[11px]">
                {{ activeSessionId }}
              </div>
              <div class="text-[10px] text-gray-500 pt-1 border-t border-gray-800 flex items-center gap-1">
                <CheckCircle2 class="w-3 h-3 text-emerald-400" />
                <span>Bearer token is completely invisible to client JS.</span>
              </div>
            </div>

            <div v-else class="text-xs text-gray-500 font-mono italic p-3 text-center">
              No session cookie. User is unauthenticated.
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Redis & Logs (7 cols) -->
      <div class="lg:col-span-7 space-y-6">
        <div class="p-5 rounded-2xl border border-gray-800 bg-gray-950/80 shadow-card-dark">
          <div class="flex items-center justify-between pb-3 border-b border-gray-800">
            <div class="flex items-center gap-2">
              <Database class="w-4 h-4 text-red-400" />
              <h3 class="text-sm font-bold text-white">Live Redis Server Keys</h3>
            </div>
            <span class="text-[10px] font-mono text-gray-400 bg-gray-900 px-2 py-0.5 rounded border border-gray-800">
              {{ redisSessions.length }} active key(s)
            </span>
          </div>

          <div class="py-3 space-y-3">
            <div v-if="redisSessions.length === 0" class="text-xs text-gray-500 font-mono italic p-6 text-center">
              Redis store is empty. Log in above to create a session key.
            </div>

            <div
              v-for="s in redisSessions"
              :key="s.id"
              class="p-3.5 rounded-xl border transition-all"
              :class="activeSessionId === s.id ? 'bg-gray-900/90 border-emerald-500/40' : 'bg-gray-900/40 border-gray-800'"
            >
              <div class="flex items-center justify-between text-xs font-mono mb-2">
                <div class="flex items-center gap-2">
                  <span class="text-red-400 font-bold">KEY: session:{{ s.id }}</span>
                  <span v-if="activeSessionId === s.id" class="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                    Current Device
                  </span>
                </div>

                <button
                  type="button"
                  @click="simulateRevokeSession(s.id)"
                  class="text-[11px] text-red-400 hover:text-red-300 font-sans hover:underline flex items-center gap-1"
                >
                  <Trash2 class="w-3 h-3" /> Revoke
                </button>
              </div>

              <div class="p-2.5 rounded-lg bg-gray-950 border border-gray-800 text-[11px] font-mono space-y-1 text-gray-300">
                <div><span class="text-gray-500">userId:</span> "{{ s.userId }}"</div>
                <div class="truncate text-purple-300">
                  <span class="text-gray-500">token:</span> "{{ s.token }}"
                </div>
                <div class="truncate text-cyan-300">
                  <span class="text-gray-500">refreshToken:</span> "{{ s.refreshToken }}"
                </div>
                <div class="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-gray-800/80">
                  <span>{{ s.device }} ({{ s.ip }})</span>
                  <span>TTL: {{ s.ttl }}s (7 days)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-5 rounded-2xl border border-gray-800 bg-gray-950/80 shadow-card-dark">
          <div class="flex items-center justify-between pb-3 border-b border-gray-800">
            <h3 class="text-sm font-bold text-white flex items-center gap-2">
              <Terminal class="w-4 h-4 text-emerald-400" />
              <span>Event Timeline</span>
            </h3>
            <button
              type="button"
              @click="logs = []"
              class="text-[10px] text-gray-500 hover:text-gray-300 font-mono"
            >
              Clear Logs
            </button>
          </div>

          <div class="max-h-56 overflow-y-auto py-2 space-y-1.5 font-mono text-[11px]">
            <div
              v-for="l in logs"
              :key="l.id"
              class="p-2 rounded-lg flex items-start gap-2"
              :class="{
                'bg-emerald-950/20 text-emerald-300': l.level === 'success',
                'bg-blue-950/20 text-blue-300': l.level === 'action',
                'bg-amber-950/20 text-amber-300': l.level === 'warn',
                'bg-gray-900/40 text-gray-400': l.level === 'info',
              }"
            >
              <span class="text-gray-500 shrink-0">{{ l.time }}</span>
              <span class="flex-1 break-all">{{ l.message }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>