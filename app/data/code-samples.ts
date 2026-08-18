export const homeCodeSamples = {
  login: `// pages/login.vue
<script setup lang="ts">
const auth = useBearerAuth()

async function handleLogin(email: string, pass: string) {
  // 1. Sends credentials to Nuxt local endpoint /api/auth/login
  // 2. Nuxt server authenticates with your backend API
  // 3. Nuxt receives bearer token and stores it in Redis
  // 4. Browser receives an HTTP-only session cookie
  await auth.login({
    identifier: email,
    password: pass,
  })

  if (auth.isAuthenticated.value) {
    await navigateTo('/dashboard')
  }
}
</script>`,

  ssr: `// pages/dashboard.vue (Server-Side Rendered)
<script setup lang="ts">
// Auth state is hydrated synchronously during SSR via bearer-auth.server.ts
const auth = useBearerAuth()

// Fetch private user data on server during SSR
const { data: profile } = await useFetch('/api/user/profile')
</script>

<template>
  <div>
    <h1>Welcome, {{ auth.user.value?.name }}</h1>
    <p>Session rendered securely on server with zero layout flicker.</p>
  </div>
</template>`,

  guard: `// nuxt.config.ts - Automatic Route Protection
export default defineNuxtConfig({
  modules: ['nuxt-bearer-auth'],

  bearerAuth: {
    redirects: {
      login: '/login',
      authenticated: '/dashboard',
      logout: '/',
    },
    routes: {
      // Unprotected public routes
      public: ['/', '/login', '/forgot-password', '/pricing'],
      // Auth pages (redirect to /dashboard if already logged in)
      authPages: ['/login', '/register'],
    },
  },
})`,

  serverRoute: `// server/api/projects.get.ts - Protected Nitro API Route
import { requireBearerAuthSession, callAuthApi } from '#imports'

export default defineEventHandler(async (event) => {
  // 1. Ensures user has a valid Redis session or throws 401
  const session = requireBearerAuthSession(event)

  // 2. Calls external backend with the user's server-held bearer token
  const data = await callAuthApi('/v1/projects', {
    event,
    method: 'GET',
  })

  return { projects: data, userId: session.userId }
})`,
}

export const exampleRecipes = {
  laravel: {
    title: 'Laravel Sanctum / Passport API Integration',
    desc: 'Connect a Laravel backend issuing plain text API tokens via Sanctum.',
    config: `// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-bearer-auth'],

  bearerAuth: {
    apiBaseUrl: 'https://api.myapp.com/api',
    redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',

    endpoints: {
      login: 'auth/login',
      logout: 'auth/logout',
      me: 'auth/user',
      register: 'auth/register',
    },

    responsePaths: {
      token: ['data.token', 'token'],
      user: ['data.user', 'user'],
    },
  },
})`,
    backend: `// app/Http/Controllers/AuthController.php (Laravel)
namespace App\\Http\\Controllers;

use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\Auth;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($credentials)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $user = Auth::user();
        $token = $user->createToken('nuxt-session')->plainTextToken;

        return response()->json([
            'success' => true,
            'data' => [
                'token' => $token,
                'user' => $user,
            ],
        ]);
    }
}`,
  },
  custom: {
    title: 'FastAPI / Express / Go JWT Bearer API',
    desc: 'Map non-standard response bodies with nested properties into normalized sessions.',
    config: `// nuxt.config.ts - Custom Response Path Normalization
export default defineNuxtConfig({
  modules: ['nuxt-bearer-auth'],

  bearerAuth: {
    apiBaseUrl: 'https://fastapi.example.com',

    endpoints: {
      login: 'v1/oauth/token',
      refresh: 'v1/oauth/refresh',
      me: 'v1/users/me',
    },

    // Custom response key mapping
    responsePaths: {
      token: ['result.accessToken', 'jwt_token'],
      refreshToken: ['result.refreshToken'],
      user: ['result.accountProfile'],
      userId: ['result.accountProfile.id', 'user_id'],
      success: ['status_code', 'is_success'],
    },
  },
})`,
    backend: `// FastAPI response JSON shape
{
  "status_code": 200,
  "result": {
    "accessToken": "eyJhbGciOiJIUzI1Ni...",
    "refreshToken": "rf_7491823948",
    "accountProfile": {
      "id": "usr_9921",
      "email": "alex@example.com",
      "name": "Alex Rivera"
    }
  }
}`,
  },
  dashboard: {
    title: 'SSR Authenticated Dashboard',
    desc: 'Pre-render private user dashboards on the server with zero auth flicker.',
    config: `// pages/dashboard.vue
<script setup lang="ts">
// Protected by global middleware automatically
const auth = useBearerAuth()

// Fetch private data during SSR via custom Nitro route
const { data: dashboardData, pending } = await useFetch('/api/analytics')

async function handleLogout() {
  await auth.logout('/login')
}
</script>

<template>
  <div class="dashboard-page p-6 max-w-5xl mx-auto space-y-6">
    <header class="flex justify-between items-center pb-4 border-b">
      <div>
        <h1 class="text-2xl font-bold">Welcome, {{ auth.user.value?.name }}</h1>
        <p class="text-sm text-gray-500">{{ auth.user.value?.email }}</p>
      </div>
      <button @click="handleLogout" class="px-4 py-2 bg-red-600 text-white rounded-lg">
        Log Out
      </button>
    </header>

    <div v-if="pending">Loading private metrics...</div>
    <div v-else class="grid grid-cols-3 gap-4">
      <div class="p-4 rounded-xl border bg-gray-900">
        <div>Total Revenue</div>
        <div class="text-2xl font-bold">\${{ dashboardData?.revenue }}</div>
      </div>
    </div>
  </div>
</template>`,
    backend: `// server/api/analytics.get.ts
import { requireBearerAuthSession, callAuthApi } from '#imports'

export default defineEventHandler(async (event) => {
  // 1. Ensures user session exists in Redis
  const session = requireBearerAuthSession(event)

  // 2. Calls external backend with bearer token
  return await callAuthApi('/v1/analytics', {
    event,
    method: 'GET',
  })
})`,
  },
  sessions: {
    title: 'Multi-Device Session Manager UI',
    desc: 'Provide users with a dashboard to view and revoke active browser sessions.',
    config: `// pages/account/security.vue
<script setup lang="ts">
interface SessionItem {
  id: string
  createdAt: string
  lastActivity: string
  userAgent?: string
  ipAddress?: string
}

const { data: sessions, refresh } = await useFetch<SessionItem[]>('/api/auth/sessions')

async function revokeDevice(id: string) {
  await $fetch('/api/auth/sessions/' + id, { method: 'DELETE' })
  await refresh()
}
</script>

<template>
  <div class="max-w-3xl mx-auto p-6 space-y-4">
    <h2 class="text-xl font-bold">Active Device Sessions</h2>
    <div v-for="s in sessions" :key="s.id" class="p-4 rounded-xl border flex justify-between">
      <div>
        <div class="font-bold">{{ s.userAgent || 'Unknown Browser' }}</div>
        <div class="text-xs text-gray-500">IP: {{ s.ipAddress }} • Last active: {{ new Date(s.lastActivity).toLocaleTimeString() }}</div>
      </div>
      <button @click="revokeDevice(s.id)" class="text-xs text-red-400">Revoke</button>
    </div>
  </div>
</template>`,
    backend: `// Built-in Nuxt Bearer Auth endpoints:
// GET /api/auth/sessions -> Lists active Redis sessions
// DELETE /api/auth/sessions/:id -> Revokes specific session key`,
  },
}
