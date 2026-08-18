export interface DocSection {
  id: string
  title: string
  level: number
}

export interface DocPage {
  slug: string
  title: string
  description: string
  category: string
  order: number
  sections: DocSection[]
  content: string
}

export interface DocCategory {
  title: string
  items: {
    slug: string
    title: string
    description: string
  }[]
}

export const docCategories: DocCategory[] = [
  {
    title: 'Overview & Getting Started',
    items: [
      { slug: 'getting-started', title: 'Getting Started', description: 'Installation, quick setup, environment variables and first login.' },
      { slug: 'configuration', title: 'Configuration', description: 'Complete module options, Redis URLs, endpoints, cookies, and CSRF.' },
    ]
  },
  {
    title: 'Core Guides',
    items: [
      { slug: 'authentication', title: 'Authentication Flows', description: 'Login, registration, social auth, OTP verification, and password resets.' },
      { slug: 'sessions', title: 'Session Management', description: 'Redis session storage, TTL expiration, active devices, and remote revocation.' },
      { slug: 'ssr', title: 'SSR & Hydration', description: 'Server-side rendering auth state, payload hydration, and route guards.' },
      { slug: 'security', title: 'Security Architecture', description: 'HTTP-only cookies, token isolation, CSRF protection, and production checklist.' },
    ]
  },
  {
    title: 'Reference & Recipes',
    items: [
      { slug: 'api', title: 'API & Composable Reference', description: 'Complete useBearerAuth() methods, types, and server-side utilities.' },
      { slug: 'customization', title: 'Customization & Response Mapping', description: 'Adapting to custom backend response shapes, custom cookies, and hooks.' },
      { slug: 'examples', title: 'Cookbook & Integration Examples', description: 'Step-by-step examples for Laravel Sanctum, custom Node/Go APIs, and SSR dashboards.' },
    ]
  }
]

export const docPages: Record<string, DocPage> = {
  'getting-started': {
    slug: 'getting-started',
    title: 'Getting Started with Nuxt Bearer Auth',
    description: 'Learn how to install, configure, and secure your Nuxt application with server-side bearer authentication.',
    category: 'Overview & Getting Started',
    order: 1,
    sections: [
      { id: 'introduction', title: 'Introduction', level: 2 },
      { id: 'requirements', title: 'Requirements', level: 2 },
      { id: 'installation', title: 'Installation', level: 2 },
      { id: 'nuxt-configuration', title: 'Nuxt Configuration', level: 2 },
      { id: 'environment-variables', title: 'Environment Variables', level: 2 },
      { id: 'first-login', title: 'Your First Login', level: 2 },
      { id: 'route-protection', title: 'Protecting Routes', level: 2 },
      { id: 'next-steps', title: 'Next Steps', level: 2 },
    ],
    content: `
## Introduction

**nuxt-bearer-auth** provides a server-side authentication layer between your Nuxt application and any external bearer-token API (e.g. Laravel Sanctum, FastAPI, Django REST Framework, Node.js, Go).

Instead of storing bearer tokens in the browser's \`localStorage\` or cookies where they can be intercepted or exposed to client-side scripts, **nuxt-bearer-auth** holds the bearer token securely on the Nuxt server inside a Redis store and hands the browser an **HTTP-only session cookie**.

\`\`\`
┌───────────────┐     HTTP-only Session Cookie     ┌────────────────┐     Bearer Token     ┌────────────────┐
│    Browser    │ ◄──────────────────────────────► │  Nuxt Server   │ ◄──────────────────► │  External API  │
└───────────────┘                                  └───────┬────────┘                      └────────────────┘
                                                           │
                                                           ▼
                                                   ┌────────────────┐
                                                   │  Redis Store   │
                                                   │ (Server Session)│
                                                   └────────────────┘
\`\`\`

## Requirements

Before installing the module, ensure your environment meets the following:

- **Nuxt**: \`^3.12.0\` or \`^4.0.0+\`
- **Node.js**: \`>=18.20.0\` or \`>=20.0.0\`
- **Redis Server**: A running Redis 6+ or Redis 7+ instance (local or hosted e.g. Upstash, AWS ElastiCache, Redis Cloud)

## Installation

Install \`nuxt-bearer-auth\`, \`redis\` client, and \`nuxt-csurf\` (for CSRF protection) using your package manager:

\`\`\`bash
# Using pnpm (recommended)
pnpm add nuxt-bearer-auth redis nuxt-csurf

# Using npm
npm install nuxt-bearer-auth redis nuxt-csurf

# Using yarn
yarn add nuxt-bearer-auth redis nuxt-csurf
\`\`\`

## Nuxt Configuration

Add \`nuxt-bearer-auth\` to your \`nuxt.config.ts\` \`modules\` array and configure the API base URL and Redis connection:

\`\`\`typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-bearer-auth'],

  bearerAuth: {
    apiBaseUrl: process.env.API_BASE_URL,
    redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
    
    redirects: {
      login: '/login',
      authenticated: '/dashboard',
      logout: '/',
      unauthorized: '/auth/not-allowed',
    },

    routes: {
      public: ['/', '/login', '/forgot-password', '/reset-password'],
      authPages: ['/login', '/forgot-password', '/reset-password'],
    },
  },
})
\`\`\`

## Environment Variables

Create or update your \`.env\` file with your backend and Redis credentials:

\`\`\`bash
# .env
API_BASE_URL=https://api.example.com
REDIS_URL=redis://127.0.0.1:6379
APP_ENV=local
\`\`\`

> **Security Tip**: In production, ensure \`REDIS_URL\` uses password authentication or TLS (\`rediss://...\`) and is isolated within your private VPC network.

## Your First Login

In your Vue component or page (e.g. \`pages/login.vue\`), import and use the \`useBearerAuth()\` composable:

\`\`\`vue
<script setup lang="ts">
const auth = useBearerAuth()
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)

async function handleLogin() {
  isSubmitting.value = true
  errorMessage.value = ''
  
  try {
    // Calls /api/auth/login -> authenticates with backend -> stores token in Redis -> sets session cookie
    await auth.login({
      email: email.value, // accepts email, username, phone, mobile, or identifier
      password: password.value,
    })
    // Upon success, user is automatically redirected to redirects.authenticated ('/dashboard')
  } catch (err: any) {
    errorMessage.value = err?.data?.message || auth.error.value || 'Invalid credentials'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <h1>Sign In</h1>
    <form @submit.prevent="handleLogin">
      <div v-if="errorMessage" class="error-banner">{{ errorMessage }}</div>
      
      <label>Email Address</label>
      <input v-model="email" type="email" required autocomplete="email" />

      <label>Password</label>
      <input v-model="password" type="password" required autocomplete="current-password" />

      <button type="submit" :disabled="isSubmitting || auth.loading.value">
        {{ isSubmitting ? 'Signing in...' : 'Sign In' }}
      </button>
    </form>
  </div>
</template>
\`\`\`

## Protecting Routes

By default, \`nuxt-bearer-auth\` installs a global client and server route middleware.

1. Any route in \`routes.public\` is accessible to unauthenticated visitors.
2. Any route not listed in \`routes.public\` automatically redirects unauthenticated visitors to \`redirects.login\` (e.g. \`/login?redirect=/dashboard\`).
3. If an authenticated user visits an auth page (listed in \`routes.authPages\` such as \`/login\`), they are redirected to \`redirects.authenticated\`.

\`\`\`typescript
// Customizing route protection rules
bearerAuth: {
  routes: {
    public: ['/', '/about', '/pricing', '/login'],
    authPages: ['/login', '/register'],
  }
}
\`\`\`

## Next Steps

- Explore [Configuration Reference](/docs/configuration) to customize endpoints, cookies, and response paths.
- Read [Authentication Flows](/docs/authentication) to implement OTP verification, Social Auth, and Token Refresh.
- Learn about [SSR & Hydration](/docs/ssr) to understand how session state is rendered on the server.
    `
  },

  'configuration': {
    slug: 'configuration',
    title: 'Configuration Reference',
    description: 'Comprehensive guide to all configuration options available in nuxt-bearer-auth.',
    category: 'Overview & Getting Started',
    order: 2,
    sections: [
      { id: 'overview', title: 'Module Options Overview', level: 2 },
      { id: 'core-options', title: 'Core Connection Options', level: 2 },
      { id: 'endpoints', title: 'Endpoints Configuration', level: 2 },
      { id: 'response-paths', title: 'Response Paths (Mapping)', level: 2 },
      { id: 'redirects', title: 'Redirects Configuration', level: 2 },
      { id: 'routes', title: 'Routes & Middleware Options', level: 2 },
      { id: 'session-cookie', title: 'Session Cookie Options', level: 2 },
      { id: 'csrf', title: 'CSRF Protection Options', level: 2 },
      { id: 'action-triggers', title: 'Verification & 2FA Triggers', level: 2 },
    ],
    content: `
## Module Options Overview

All module options are defined under the \`bearerAuth\` key in your \`nuxt.config.ts\`.

Here is a full configuration snippet with all available options and their default values:

\`\`\`typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-bearer-auth'],

  bearerAuth: {
    // 1. Core connection settings
    apiBaseUrl: process.env.API_BASE_URL || '',
    redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
    sessionSecret: process.env.SESSION_SECRET || '',
    appEnv: process.env.APP_ENV || process.env.NODE_ENV || 'development',
    installCsurf: true,

    // 2. External API Endpoints
    endpoints: {
      login: 'auth/login',
      socialLogin: 'auth/social-login',
      logout: 'auth/logout',
      me: 'auth/account/me',
      refresh: 'auth/refresh',
      forgotPassword: 'auth/forgot-password',
      resetPassword: 'auth/reset-password',
      verifyOtp: 'auth/verify-otp',
      resendOtp: 'auth/resend-otp/:identifier',
      register: 'auth/register',
    },

    // 3. Response Shape Normalization
    responsePaths: {
      token: ['data.token', 'token', 'access_token', 'data.access_token'],
      refreshToken: ['data.refreshToken', 'data.refresh_token', 'refreshToken', 'refresh_token'],
      user: ['data.user', 'user', 'data', '$'],
      userId: ['id', 'uuid', 'data.id', 'data.uuid'],
      message: ['message', 'data.message'],
      success: ['success', 'status'],
      code: ['code', 'data.code'],
      nextAction: ['next_action', 'data.next_action', 'nextAction'],
    },

    // 4. Client Navigation Redirects
    redirects: {
      login: '/login',
      authenticated: '/dashboard',
      logout: '/',
      unauthorized: '/auth/not-allowed',
    },

    // 5. Route Protection & Local API Prefixes
    routes: {
      localApiPrefix: '/api/auth',
      public: ['/', '/login', '/forgot-password', '/reset-password'],
      authPages: ['/login', '/forgot-password', '/reset-password'],
      protectedApiPrefixes: ['/api'],
      publicApiPrefixes: [
        '/api/auth/login',
        '/api/auth/social-login',
        '/api/auth/register',
        '/api/auth/forgot-password',
        '/api/auth/reset-password',
        '/api/auth/otp-verification',
        '/api/auth/resend-otp',
        '/api/_csrf',
        '/_nuxt',
        '/__nuxt',
        '/_ipx',
        '/favicon.ico',
      ],
      middleware: true,
    },

    // 6. Session Cookie
    sessionCookie: {
      name: 'nuxt_bearer_auth_session',
      devName: 'nuxt_bearer_auth_session_dev',
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
      sameSite: 'lax',
      secure: undefined, // Defaults to true in production
      path: '/',
    },

    // 7. CSRF Configuration
    csrf: {
      enabled: true,
      https: false,
      cookieKey: 'nuxt_bearer_auth_csrf',
      devCookieKey: 'nuxt_bearer_auth_csrf_dev',
      headerName: 'x-csrf-token',
      methods: ['POST', 'PUT', 'PATCH', 'DELETE'],
      methodsToProtect: ['POST', 'PUT', 'PATCH', 'DELETE'],
      cookie: {
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
      },
    },

    // 8. Next Action Interceptors
    verificationRequiredActions: ['verify_account', 'verification_required'],
    twoFactorRequiredActions: ['two_factor_required', '2fa_required'],
  },
})
\`\`\`

## Core Connection Options

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| \`apiBaseUrl\` | \`string\` | \`""\` | Base URL of your backend bearer-token API. |
| \`redisUrl\` | \`string\` | \`"redis://127.0.0.1:6379"\` | Redis connection URI. |
| \`sessionSecret\` | \`string\` | \`""\` | Optional encryption / signing secret for sessions. |
| \`appEnv\` | \`string\` | \`process.env.APP_ENV\` | Application environment name (\`local\`, \`development\`, \`production\`). |
| \`installCsurf\` | \`boolean\` | \`true\` | Automatically registers \`nuxt-csurf\` module. |

## Endpoints Configuration

Override any endpoint relative to your \`apiBaseUrl\`:

\`\`\`typescript
bearerAuth: {
  endpoints: {
    login: 'v1/oauth/token',
    me: 'v1/users/current',
    logout: 'v1/oauth/revoke',
    refresh: 'v1/oauth/refresh',
  }
}
\`\`\`

## Response Paths (Mapping)

The module includes a JSON path evaluator that iterates through key candidates until it finds a valid value. This allows you to connect non-standard API backends without modifying your backend source code.

\`\`\`typescript
bearerAuth: {
  responsePaths: {
    token: ['payload.token', 'jwt'],
    refreshToken: ['payload.refresh_jwt'],
    user: ['payload.account', 'user_profile'],
    userId: ['user_id', '_id'],
  }
}
\`\`\`

## Session Cookie Options

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| \`name\` | \`string\` | \`"nuxt_bearer_auth_session"\` | Production cookie name. |
| \`devName\` | \`string\` | \`"nuxt_bearer_auth_session_dev"\` | Development cookie name. |
| \`maxAge\` | \`number\` | \`604800\` (7 days) | Session TTL in seconds in Redis and browser cookie. |
| \`sameSite\` | \`"lax" \| "strict" \| "none"\` | \`"lax"\` | SameSite attribute for cookie. |
| \`secure\` | \`boolean\` | auto (\`true\` in prod) | Requires HTTPS transmission. |
| \`domain\` | \`string\` | \`undefined\` | Optional cookie domain for subdomains. |
    `
  },

  'authentication': {
    slug: 'authentication',
    title: 'Authentication Flows',
    description: 'Detailed guide to implementing login, registration, social login, OTP, and token refresh.',
    category: 'Core Guides',
    order: 3,
    sections: [
      { id: 'use-bearer-auth', title: 'useBearerAuth Composable', level: 2 },
      { id: 'login-flow', title: 'Standard Login Flow', level: 2 },
      { id: 'social-login', title: 'Social Authentication', level: 2 },
      { id: 'registration', title: 'User Registration', level: 2 },
      { id: 'otp-verification', title: 'OTP Verification & Resend', level: 2 },
      { id: 'token-refresh', title: 'Silent Token Refresh', level: 2 },
      { id: 'password-reset', title: 'Forgot & Reset Password', level: 2 },
      { id: 'logout', title: 'Logout Flow', level: 2 },
    ],
    content: `
## useBearerAuth Composable

The primary interface for client-side authentication is \`useBearerAuth()\` (also aliased as \`useAuth()\`).

\`\`\`typescript
const {
  user,            // Ref<User | null>
  status,          // Ref<'idle' | 'loading' | 'authenticated' | 'unauthenticated'>
  ready,           // Ref<boolean>
  error,           // Ref<string | null>
  loading,         // ComputedRef<boolean>
  isAuthenticated, // ComputedRef<boolean>
  login,           // (credentials, redirectPath?) => Promise<AuthApiResponse>
  socialLogin,     // (credentials, redirectPath?) => Promise<AuthApiResponse>
  register,        // (payload, redirectPath?) => Promise<AuthApiResponse>
  verifyOtp,       // (payload, redirectPath?) => Promise<AuthApiResponse>
  fetchUser,       // (options?) => Promise<{ data, error }>
  refresh,         // () => Promise<AuthApiResponse>
  logout,          // (destination?) => Promise<void>
  forgotPassword,  // (payload) => Promise<any>
  resetPassword,   // (payload) => Promise<any>
  resendOtp,       // (identifier, payload?) => Promise<any>
} = useBearerAuth<CustomUserType>()
\`\`\`

## Standard Login Flow

The `login()` method submits your credentials to Nuxt's local endpoint `/api/auth/login`. You can pass any standard credential payload naturally — such as `{ email, password }`, `{ username, password }`, `{ phone, password }`, `{ mobile, password }`, or `{ identifier, password }`.

Nuxt validates that credentials are provided before forwarding the request to your backend `endpoints.login`, parses the bearer token, stores the session in Redis, sets an HTTP-only cookie on the client, and updates the reactive auth state.

```typescript
const auth = useBearerAuth()

async function submitLogin() {
  try {
    const response = await auth.login({
      email: 'user@example.com', // Accepts email, username, phone, mobile, or identifier
      password: 'mypassword',
    })

    // If your backend requested an action (e.g. OTP verification):
    if (response.nextAction === 'verify_account') {
      await navigateTo('/verify-otp')
    }
  } catch (err) {
    console.error('Login error:', auth.error.value)
  }
}
```

## Social Authentication

When using third-party identity providers (Google, Apple, GitHub), pass the received OAuth credential or token to \`socialLogin()\`:

\`\`\`typescript
const auth = useBearerAuth()

async function onGoogleCallback(googleCredential: string) {
  await auth.socialLogin({
    provider: 'google',
    jwt: googleCredential,
  })
}
\`\`\`

Your backend verifies the JWT with Google, generates a bearer token for the user, and returns it. Nuxt saves the session to Redis and issues the session cookie.

## User Registration

Register new users via \`auth.register(payload)\`:

\`\`\`typescript
async function handleRegister() {
  await auth.register({
    name: 'Enoch Tetteh',
    email: 'enoch@example.com',
    password: 'SecurePassword123!',
    password_confirmation: 'SecurePassword123!',
  })
}
\`\`\`

If your backend immediately logs in registered users and returns a token, \`useBearerAuth\` completes the authentication flow and sets the session.

## OTP Verification & Resend

For multi-factor authentication or account activation via One-Time Passwords:

\`\`\`typescript
const auth = useBearerAuth()

// 1. Verify OTP code
async function verifyCode(code: string) {
  await auth.verifyOtp({
    code,
    identifier: 'user@example.com',
  })
}

// 2. Resend OTP code
async function handleResend() {
  await auth.resendOtp('user@example.com')
}
\`\`\`

## Silent Token Refresh

If your backend issues short-lived bearer tokens and longer-lived refresh tokens, \`nuxt-bearer-auth\` manages this transparently.

Because both the access token and refresh token are stored in Redis on the server, you can trigger a token refresh without exposing the refresh token to the client:

\`\`\`typescript
const auth = useBearerAuth()

// Triggers server-side call to backend endpoints.refresh
await auth.refresh()
\`\`\`

## Logout Flow

Logging out destroys the Redis session key, deletes the session from the user's active session set, calls your backend's \`endpoints.logout\` (with the bearer token), clears client state, and deletes the browser cookie:

\`\`\`typescript
const auth = useBearerAuth()

async function handleLogout() {
  // Destroys session and navigates to '/' (or custom destination)
  await auth.logout('/login')
}
\`\`\`
    `
  },

  'sessions': {
    slug: 'sessions',
    title: 'Redis Session Architecture',
    description: 'Deep dive into Redis session storage schema, TTL expiration, active devices, and remote revocation.',
    category: 'Core Guides',
    order: 4,
    sections: [
      { id: 'redis-storage-model', title: 'Redis Storage Model', level: 2 },
      { id: 'session-data-structure', title: 'Session Data Structure', level: 2 },
      { id: 'active-sessions-index', title: 'User Sessions Index', level: 2 },
      { id: 'listing-sessions', title: 'Listing Active Sessions', level: 2 },
      { id: 'revoking-sessions', title: 'Revoking Remote Sessions', level: 2 },
      { id: 'destroy-all', title: 'Revoke All Sessions', level: 2 },
    ],
    content: `
## Redis Storage Model

\`nuxt-bearer-auth\` uses Redis as the authoritative server-side session store.

Two key patterns are used in Redis:

1. **\`session:<session_uuid>\`** (String with TTL): Stores the JSON serialized session object.
2. **\`user_sessions:<user_id>\`** (Set with TTL): Stores the list of active session UUIDs belonging to that user.

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│ Redis Server                                                │
│                                                             │
│  session:a4e98f01-2b81-49c6...  (String, TTL 604800s)       │
│  ├── userId: "usr_101"                                      │
│  ├── token: "eyJhbGciOiJIUzI1Ni..." (Bearer Token)          │
│  ├── refreshToken: "d84f2c91..."                            │
│  ├── profile: { name: "Enoch", email: "..." }               │
│  ├── userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X)"   │
│  └── ipAddress: "192.168.1.50"                              │
│                                                             │
│  user_sessions:usr_101  (Set, TTL 604800s)                  │
│  ├── "a4e98f01-2b81-49c6..."  (MacBook)                     │
│  └── "f72c1092-881a-41b9..."  (iPhone)                      │
└─────────────────────────────────────────────────────────────┘
\`\`\`

## Session Data Structure

Each session in Redis adheres to the TypeScript interface:

\`\`\`typescript
export interface BearerAuthSession<User = BearerAuthUser> {
  userId: string
  token: string
  refreshToken?: string | null
  profile: User | null
  createdAt: string      // ISO string
  expiresAt: number      // Unix timestamp (ms)
  lastActivity: string   // ISO string
  userAgent?: string     // Request User-Agent header
  ipAddress?: string     // Client IP address
}
\`\`\`

When a user makes any authenticated request, the session's \`lastActivity\` is updated and its Redis TTL is refreshed.

## Listing Active Sessions

You can build a "Manage Active Devices" UI by calling the built-in endpoint \`GET /api/auth/sessions\`:

\`\`\`vue
<script setup lang="ts">
interface DeviceSession {
  id: string
  createdAt: string
  lastActivity: string
  userAgent?: string
  ipAddress?: string
}

const { data: sessions, refresh } = await useFetch<DeviceSession[]>('/api/auth/sessions')

async function revokeSession(sessionId: string) {
  await $fetch(\`/api/auth/sessions/\${sessionId}\`, { method: 'DELETE' })
  await refresh()
}
</script>

<template>
  <div class="sessions-list">
    <h3>Active Sessions</h3>
    <div v-for="s in sessions" :key="s.id" class="session-card">
      <div>
        <p class="font-bold">{{ s.userAgent || 'Unknown Device' }}</p>
        <p class="text-sm text-gray-400">Last active: {{ new Date(s.lastActivity).toLocaleString() }}</p>
        <p class="text-xs text-gray-500">IP: {{ s.ipAddress }}</p>
      </div>
      <button @click="revokeSession(s.id)" class="btn-danger">Revoke</button>
    </div>
  </div>
</template>
\`\`\`

## Revoking Remote Sessions

When a session is revoked:
1. The \`DELETE /api/auth/sessions/:id\` endpoint checks that the current user owns that session ID.
2. Redis executes \`DEL session:<id>\`.
3. Redis removes \`<id>\` from the \`user_sessions:<user_id>\` set using \`SREM\`.
4. If that device sends a request later, Nuxt finds no session in Redis, deletes the invalid cookie, and returns a \`401 Unauthenticated\`.
    `
  },

  'ssr': {
    slug: 'ssr',
    title: 'SSR & Hydration',
    description: 'How nuxt-bearer-auth handles Server-Side Rendering without auth flicker or token leakage.',
    category: 'Core Guides',
    order: 5,
    sections: [
      { id: 'how-ssr-works', title: 'How SSR Works in Nuxt Bearer Auth', level: 2 },
      { id: 'server-plugin', title: 'The Server Plugin & Payload', level: 2 },
      { id: 'preventing-flicker', title: 'Zero Client Auth Flicker', level: 2 },
      { id: 'server-routes', title: 'Accessing Sessions in Server Routes', level: 2 },
      { id: 'ssr-guards', title: 'Server-Side Route Middleware', level: 2 },
    ],
    content: `
## How SSR Works in Nuxt Bearer Auth

In traditional client-side SPAs using localStorage, the server cannot know whether the visitor is logged in during SSR. This leads to:
- Flash of unauthenticated content (layout flicker)
- Inability to fetch private data during SSR
- Broken SEO or layout shifts

\`nuxt-bearer-auth\` solves this completely using **HTTP-only session cookies** and **Nitro server plugins**.

\`\`\`
1. Client requests page (e.g. /dashboard) with Session Cookie
                      │
                      ▼
2. Nuxt Server Plugin (bearer-auth.server.ts)
   - Reads session cookie from H3Event
   - Queries Redis: GET session:<id>
   - Attaches user profile to nuxtApp.payload.bearerAuth
                      │
                      ▼
3. Nuxt Server-Side Renders HTML
   - Vue components see auth.isAuthenticated === true
   - useFetch() can query protected server routes during SSR
                      │
                      ▼
4. HTML + Hydration Payload streamed to Browser
   - Client initializes state synchronously from payload
   - ZERO layout flicker, ZERO extra client network roundtrip
\`\`\`

## The Server Plugin & Payload

The package includes a dedicated server plugin (\`bearer-auth.server.ts\`):

\`\`\`typescript
// Inside nuxt-bearer-auth runtime server plugin
export default defineNuxtPlugin(async (nuxtApp) => {
  if (import.meta.client) return

  const event = nuxtApp.ssrContext?.event
  if (!event) return

  const auth = useBearerAuth()

  try {
    const session = await getBearerAuthSession(event)
    auth.setUser(session?.profile || null)

    nuxtApp.payload.bearerAuth = {
      user: session?.profile || null,
      status: session?.profile ? 'authenticated' : 'unauthenticated',
    }
  } catch (error) {
    auth.clearAuthState()
  } finally {
    auth.setAuthReady(true)
    auth.setServerChecked()
  }
})
\`\`\`

## Accessing Sessions in Server Routes

When building custom Nitro API routes (\`server/api/...\`), you can read the authenticated session directly from the H3 event context:

\`\`\`typescript
// server/api/projects.get.ts
import { requireBearerAuthSession, callAuthApi } from '#imports'

export default defineEventHandler(async (event) => {
  // 1. Ensures user is logged in, or throws 401 Unauthenticated
  const session = requireBearerAuthSession(event)

  // 2. Call external API using the user's stored bearer token
  const projects = await callAuthApi('/v1/projects', {
    event,
    method: 'GET',
  })

  return {
    userId: session.userId,
    projects,
  }
})
\`\`\`

## Server-Side Route Middleware

Because the session is hydrated before route middleware executes, unauthenticated requests to protected pages are redirected **immediately on the server with a 302 redirect**, preventing any protected HTML from being sent to the client.
    `
  },

  'security': {
    slug: 'security',
    title: 'Security Architecture',
    description: 'Detailed analysis of the threat model, token isolation, CSRF protection, and production hardening.',
    category: 'Core Guides',
    order: 6,
    sections: [
      { id: 'threat-model', title: 'Threat Model & Philosophy', level: 2 },
      { id: 'tokens-stay-server', title: 'Why Tokens Stay on the Server', level: 2 },
      { id: 'http-only-cookies', title: 'HTTP-Only Cookies: Strengths & Limits', level: 2 },
      { id: 'csrf-defense', title: 'CSRF Defense with nuxt-csurf', level: 2 },
      { id: 'redis-hardening', title: 'Redis Security Hardening', level: 2 },
      { id: 'production-checklist', title: 'Production Deployment Checklist', level: 2 },
    ],
    content: `
## Threat Model & Philosophy

> "Authentication should be boring. Security shouldn't be an afterthought."

\`nuxt-bearer-auth\` was designed to eliminate the most common vulnerability pattern in modern Vue/Nuxt SPAs: **storing sensitive API bearer tokens in \`localStorage\` or client-accessible JavaScript memory**.

We do not claim this package makes an application "100% unhackable". Security requires defense-in-depth across the entire stack.

## Why Tokens Stay on the Server

When a bearer token is stored in the browser:
- Any Cross-Site Scripting (XSS) vulnerability in any third-party script, NPM dependency, or CDN can read \`localStorage.getItem('token')\` and exfiltrate it immediately.
- The stolen token can be used from anywhere in the world until it expires.
- Refresh tokens in the browser expose long-lived credentials to client compromise.

When using \`nuxt-bearer-auth\`:
- The browser only possesses a random UUID session cookie flagged as **\`HttpOnly\`**, **\`Secure\`**, and **\`SameSite=Lax\`**.
- JavaScript running in the browser (even malicious XSS payloads) **cannot read the cookie value**.
- Even if an attacker induces a malicious request, they cannot extract the underlying API bearer token.

## HTTP-Only Cookies: Strengths & Limits

| Threat | Protected by HTTP-only Cookie? | Explanation |
| :--- | :---: | :--- |
| **Token Exfiltration via XSS** | **YES** | \`document.cookie\` cannot access HTTP-only cookies; token stays in Redis. |
| **Local Device Token Theft** | **YES** | No plaintext bearer tokens written to browser storage. |
| **Cross-Site Request Forgery (CSRF)** | **REQUIRES CSRF LAYER** | Cookies are sent automatically with requests; mitigated by \`nuxt-csurf\`. |
| **Direct XSS Execution** | **PARTIAL** | Attacker can make requests on user's behalf while page is open, but cannot steal the token itself. |

## CSRF Defense with nuxt-csurf

Because browser cookies are automatically attached by the browser on cross-origin requests, \`nuxt-bearer-auth\` integrates with \`nuxt-csurf\` by default:
- On mutating requests (\`POST\`, \`PUT\`, \`PATCH\`, \`DELETE\`), a cryptographic CSRF token is verified via the \`x-csrf-token\` header.
- The composable's internal fetcher automatically includes the active CSRF token.

\`\`\`typescript
bearerAuth: {
  csrf: {
    enabled: true,
    methodsToProtect: ['POST', 'PUT', 'PATCH', 'DELETE'],
    headerName: 'x-csrf-token',
  }
}
\`\`\`

## Redis Security Hardening

Because Redis holds the mapping of session IDs to bearer tokens:
1. **Network Isolation**: Never expose your Redis port (\`6379\`) to the public internet. Keep it inside your private VPC / overlay network.
2. **TLS in Transit**: Use \`rediss://\` in staging and production to encrypt all traffic between Nuxt and Redis.
3. **Strong Authentication**: Require a high-entropy password or ACL credentials.
4. **Key Expiration**: All sessions automatically expire via Redis TTL (\`maxAge\`).

## Production Deployment Checklist

Before launching your application to production:

- [ ] **Enforce HTTPS**: Cookies must have the \`Secure\` attribute enabled (automatic when \`NODE_ENV=production\`).
- [ ] **Set SameSite Attribute**: Use \`sameSite: 'lax'\` (or \`'strict'\` for high-security applications).
- [ ] **Configure Redis TLS**: Ensure \`REDIS_URL\` uses \`rediss://\` on cloud providers.
- [ ] **Set Strong API_BASE_URL**: Point to your secure API gateway.
- [ ] **Enable Backend Rate Limiting**: Protect your backend \`/auth/login\` and \`/auth/refresh\` routes from brute-force attacks.
- [ ] **Set Short Backend Token Lifetimes**: Configure your API (e.g. Laravel Sanctum or JWT) with short access token lifetimes (e.g. 15-60 minutes) combined with silent refresh.
    `
  },

  'api': {
    slug: 'api',
    title: 'API & Composable Reference',
    description: 'Complete reference for useBearerAuth composable, types, server handlers, and server utilities.',
    category: 'Reference & Recipes',
    order: 7,
    sections: [
      { id: 'use-bearer-auth', title: 'useBearerAuth() / useAuth()', level: 2 },
      { id: 'reactive-state', title: 'Reactive State Properties', level: 2 },
      { id: 'methods', title: 'Composable Methods', level: 2 },
      { id: 'server-api-routes', title: 'Built-in Server API Routes', level: 2 },
      { id: 'server-utilities', title: 'Server Utilities', level: 2 },
      { id: 'typescript-types', title: 'TypeScript Types', level: 2 },
    ],
    content: `
## useBearerAuth() / useAuth()

\`\`\`typescript
import { useBearerAuth, useAuth } from '#imports'

const auth = useBearerAuth<CustomUser>()
\`\`\`

### Reactive State Properties

| Property | Type | Description |
| :--- | :--- | :--- |
| \`user\` | \`Ref<User \| null>\` | Current authenticated user profile object. |
| \`status\` | \`Ref<AuthStatus>\` | \`'idle' \| 'loading' \| 'authenticated' \| 'unauthenticated'\`. |
| \`ready\` | \`Ref<boolean>\` | \`true\` once initial auth check (SSR or client) has resolved. |
| \`error\` | \`Ref<string \| null>\` | Last authentication error message string. |
| \`loading\` | \`ComputedRef<boolean>\` | Convenience computed shorthand for \`status.value === 'loading'\`. |
| \`isAuthenticated\` | \`ComputedRef<boolean>\` | Convenience computed shorthand for \`status.value === 'authenticated'\`. |
| \`serverReady\` | \`ComputedRef<Promise<void>>\` | Resolves when server-side auth hydration completes. |

### Composable Methods

\`\`\`typescript
// 1. Login with credentials
login(credentials: LoginCredentials, redirectPath?: string | null): Promise<AuthApiResponse<User>>

// 2. Social login with OAuth provider JWT/Token
socialLogin(credentials: SocialLoginCredentials, redirectPath?: string | null): Promise<AuthApiResponse<User>>

// 3. Register a new user
register(payload: Record<string, unknown>, redirectPath?: string | null): Promise<AuthApiResponse<User>>

// 4. Verify OTP code
verifyOtp(payload: Record<string, unknown>, redirectPath?: string | null): Promise<AuthApiResponse<User>>

// 5. Fetch current user from /api/auth/me
fetchUser(options?: { refresh?: boolean }): Promise<{ data: User | null; error: string | null }>

// 6. Silent token refresh
refresh(): Promise<AuthApiResponse<User>>

// 7. Logout and destroy session
logout(destination?: string): Promise<void>

// 8. Forgot password request
forgotPassword(payload: Record<string, unknown>): Promise<any>

// 9. Reset password request
resetPassword(payload: Record<string, unknown>): Promise<any>

// 10. Resend OTP code
resendOtp(identifier: string, payload?: Record<string, unknown>): Promise<any>

// 11. Clear client auth state manually
clearAuthState(): void
\`\`\`

## Built-in Server API Routes

The module mounts these Nitro handlers under \`routes.localApiPrefix\` (default: \`/api/auth\`):

| Method & Route | Backend Endpoint Forwarded | Description |
| :--- | :--- | :--- |
| \`POST /api/auth/login\` | \`endpoints.login\` | Authenticates user, creates Redis session, sets cookie. |
| \`POST /api/auth/social-login\` | \`endpoints.socialLogin\` | Passes OAuth token to backend, creates Redis session. |
| \`POST /api/auth/logout\` | \`endpoints.logout\` | Destroys Redis session, deletes cookie, calls backend logout. |
| \`GET /api/auth/me\` | \`endpoints.me\` | Returns current user from Redis or refreshes from backend. |
| \`POST /api/auth/refresh\` | \`endpoints.refresh\` | Calls backend refresh using Redis refresh token, updates session. |
| \`POST /api/auth/register\` | \`endpoints.register\` | Forwards registration payload. |
| \`POST /api/auth/otp-verification\`| \`endpoints.verifyOtp\` | Forwards OTP verification payload. |
| \`POST /api/auth/resend-otp/:id\` | \`endpoints.resendOtp\` | Triggers OTP resend for given user identifier. |
| \`POST /api/auth/forgot-password\` | \`endpoints.forgotPassword\`| Forwards forgot-password email/payload. |
| \`POST /api/auth/reset-password\` | \`endpoints.resetPassword\` | Forwards password reset payload with token. |
| \`GET /api/auth/sessions\` | Local Redis | Lists active sessions for current user. |
| \`DELETE /api/auth/sessions/:id\` | Local Redis | Revokes specific session ID. |

## Server Utilities

When writing custom Nitro endpoints in your application, you can import these utilities:

\`\`\`typescript
import {
  getBearerAuthSession,
  createBearerAuthSession,
  updateBearerAuthSession,
  destroyBearerAuthSession,
  destroyAllBearerAuthSessions,
  getUserBearerAuthSessions,
  deleteUserBearerAuthSession,
  requireBearerAuthSession,
  callAuthApi,
  getBearerAuthRedisClient,
} from '#imports'
\`\`\`

## TypeScript Types

\`\`\`typescript
export interface BearerAuthUser {
  id?: string | number
  uuid?: string
  email?: string
  name?: string
  [key: string]: unknown
}

export interface BearerAuthSession<User extends BearerAuthUser = BearerAuthUser> {
  userId: string
  token: string
  refreshToken?: string | null
  profile: User | null
  createdAt: string
  expiresAt: number
  lastActivity: string
  userAgent?: string
  ipAddress?: string
}

export interface AuthApiResponse<T = unknown> {
  success: boolean
  message?: string
  data?: T
  user?: BearerAuthUser | null
  code?: string | number
  nextAction?: string
}
\`\`\`
    `
  },

  'customization': {
    slug: 'customization',
    title: 'Customization & Response Mapping',
    description: 'How to connect non-standard APIs, customize cookies, response paths, and custom middleware.',
    category: 'Reference & Recipes',
    order: 8,
    sections: [
      { id: 'response-paths', title: 'Configuring Response Paths', level: 2 },
      { id: 'custom-endpoints', title: 'Custom Endpoint Mappings', level: 2 },
      { id: 'custom-cookies', title: 'Custom Cookie Configurations', level: 2 },
      { id: 'disabling-middleware', title: 'Custom Route Middleware', level: 2 },
    ],
    content: `
## Configuring Response Paths

Different backend frameworks structure JSON responses differently. Rather than forcing you to modify your backend, \`nuxt-bearer-auth\` provides a flexible path evaluator.

### Example: Fastify / NestJS Custom JSON Response

Suppose your backend returns:

\`\`\`json
{
  "statusCode": 200,
  "result": {
    "jwt": "eyJhbGciOiJIUz...",
    "refreshJwt": "def987...",
    "account": {
      "uuid": "usr_99182",
      "emailAddress": "alex@example.com",
      "fullName": "Alex Rivera"
    }
  }
}
\`\`\`

Map this in \`nuxt.config.ts\`:

\`\`\`typescript
export default defineNuxtConfig({
  modules: ['nuxt-bearer-auth'],

  bearerAuth: {
    apiBaseUrl: process.env.API_BASE_URL,
    responsePaths: {
      token: ['result.jwt'],
      refreshToken: ['result.refreshJwt'],
      user: ['result.account'],
      userId: ['uuid', 'result.account.uuid'],
      success: ['statusCode'],
    },
  },
})
\`\`\`

## Custom Endpoint Mappings

If your backend uses a non-standard URL structure (e.g. \`/v2/auth/token\` instead of \`/auth/login\`):

\`\`\`typescript
export default defineNuxtConfig({
  bearerAuth: {
    endpoints: {
      login: 'v2/auth/token',
      logout: 'v2/auth/sign-out',
      me: 'v2/users/self',
      refresh: 'v2/auth/token-refresh',
      register: 'v2/onboarding/create-account',
    },
  },
})
\`\`\`

## Custom Cookie Configurations

You can customize the session cookie name, domain (for sharing sessions across subdomains), and security flags:

\`\`\`typescript
bearerAuth: {
  sessionCookie: {
    name: '__Host-app_session',
    devName: 'app_session_dev',
    domain: process.env.NODE_ENV === 'production' ? '.example.com' : undefined,
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: 'lax',
  },
}
\`\`\`

## Custom Route Middleware

If you want to handle route authorization entirely in your own custom middleware (for role-based access control, tenant permissions, etc.), you can disable the built-in global middleware:

\`\`\`typescript
bearerAuth: {
  routes: {
    middleware: false, // Disables built-in global route middleware
  },
}
\`\`\`

Then create your own \`middleware/auth.global.ts\`:

\`\`\`typescript
// middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to) => {
  const auth = useBearerAuth()

  if (!auth.isAuthenticated.value && to.path.startsWith('/admin')) {
    return navigateTo('/login')
  }

  if (to.meta.role && auth.user.value?.role !== to.meta.role) {
    return navigateTo('/forbidden')
  }
})
\`\`\`
    `
  },

  'examples': {
    slug: 'examples',
    title: 'Cookbook & Integration Examples',
    description: 'Realistic recipes for Laravel Sanctum, custom REST APIs, SSR Dashboards, and Session Managers.',
    category: 'Reference & Recipes',
    order: 9,
    sections: [
      { id: 'laravel-sanctum', title: 'Laravel Sanctum / API Integration', level: 2 },
      { id: 'custom-rest-api', title: 'Generic Node/Go/Python Bearer API', level: 2 },
      { id: 'ssr-dashboard', title: 'SSR Authenticated Dashboard Recipe', level: 2 },
      { id: 'session-manager-ui', title: 'Multi-Device Session Manager UI', level: 2 },
    ],
    content: `
## Laravel Sanctum / API Integration

Laravel APIs often issue plaintext API tokens via Sanctum:

### Laravel Controller

\`\`\`php
// app/Http/Controllers/AuthController.php
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
        'message' => 'Authenticated successfully',
        'data' => [
            'token' => $token,
            'user' => $user,
        ]
    ]);
}
\`\`\`

### Nuxt Configuration

\`\`\`typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-bearer-auth'],
  bearerAuth: {
    apiBaseUrl: 'https://laravel-api.example.com/api',
    redisUrl: process.env.REDIS_URL,
    endpoints: {
      login: 'login',
      logout: 'logout',
      me: 'user',
    },
  },
})
\`\`\`

## Generic Node/Go/Python Bearer API

For a FastAPI or Express backend issuing JWT bearer tokens:

\`\`\`typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-bearer-auth'],
  bearerAuth: {
    apiBaseUrl: 'https://api.myapp.com',
    endpoints: {
      login: 'auth/token',
      refresh: 'auth/refresh',
      me: 'auth/profile',
    },
    responsePaths: {
      token: ['access_token'],
      refreshToken: ['refresh_token'],
      user: ['user_info'],
    }
  }
})
\`\`\`

## SSR Authenticated Dashboard Recipe

Here is a full-page SSR Dashboard that fetches data securely during server rendering:

\`\`\`vue
<script setup lang="ts">
// Page requires authentication (protected by default middleware)
const auth = useBearerAuth()

// Fetch dashboard data during SSR using the Nuxt server route
const { data: analytics, pending, error } = await useFetch('/api/dashboard/stats')

async function handleLogout() {
  await auth.logout()
}
</script>

<template>
  <div class="dashboard-layout">
    <header class="flex justify-between items-center p-4 border-b">
      <div>
        <h2 class="text-xl font-bold">Welcome back, {{ auth.user.value?.name }}</h2>
        <p class="text-sm text-gray-500">{{ auth.user.value?.email }}</p>
      </div>
      <button @click="handleLogout" class="px-4 py-2 bg-red-600 text-white rounded">
        Log Out
      </button>
    </header>

    <main class="p-6">
      <div v-if="pending">Loading dashboard metrics...</div>
      <div v-else-if="error">Error loading metrics: {{ error.message }}</div>
      <div v-else class="grid grid-cols-3 gap-6">
        <div class="metric-card">
          <span class="label">Total Orders</span>
          <span class="val">{{ analytics?.totalOrders }}</span>
        </div>
        <div class="metric-card">
          <span class="label">Revenue</span>
          <span class="val">\${{ analytics?.revenue }}</span>
        </div>
        <div class="metric-card">
          <span class="label">Active Sessions</span>
          <span class="val">{{ analytics?.activeSessions }}</span>
        </div>
      </div>
    </main>
  </div>
</template>
\`\`\`

## Multi-Device Session Manager UI

Allow your users to view all currently active browser sessions and remotely revoke unrecognized devices:

\`\`\`vue
<script setup lang="ts">
interface SessionItem {
  id: string
  createdAt: string
  lastActivity: string
  userAgent?: string
  ipAddress?: string
}

const { data: sessions, refresh, pending } = await useFetch<SessionItem[]>('/api/auth/sessions')
const revokingId = ref<string | null>(null)

async function revoke(id: string) {
  revokingId.value = id
  try {
    await $fetch(\`/api/auth/sessions/\${id}\`, { method: 'DELETE' })
    await refresh()
  } finally {
    revokingId.value = null
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto p-6">
    <h2 class="text-2xl font-bold mb-4">Security & Active Devices</h2>
    <p class="text-gray-400 mb-6">Manage active sessions logged into your account across devices.</p>

    <div v-if="pending" class="text-gray-400">Loading active sessions...</div>

    <div v-else class="space-y-4">
      <div
        v-for="s in sessions"
        :key="s.id"
        class="p-4 rounded-xl border border-gray-800 bg-gray-900/60 flex items-center justify-between"
      >
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="font-medium text-white">{{ s.userAgent || 'Unknown Device' }}</span>
            <span class="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Active
            </span>
          </div>
          <p class="text-xs text-gray-400">
            IP: {{ s.ipAddress || 'Unknown' }} • Last active: {{ new Date(s.lastActivity).toLocaleString() }}
          </p>
        </div>

        <button
          @click="revoke(s.id)"
          :disabled="revokingId === s.id"
          class="px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg border border-red-500/20 transition"
        >
          {{ revokingId === s.id ? 'Revoking...' : 'Revoke Session' }}
        </button>
      </div>
    </div>
  </div>
</template>
\`\`\`
    `
  }
}
