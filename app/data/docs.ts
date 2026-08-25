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
      { slug: 'sessions', title: 'Session Management', description: 'Redis session storage, sliding TTL expiration, active devices, and remote revocation.' },
      { slug: 'ssr', title: 'SSR & Hydration', description: 'Server-side rendering auth state, payload hydration, and route guards.' },
      { slug: 'security', title: 'Security Architecture', description: 'HTTP-only cookies, token isolation, CSRF protection, and production checklist.' },
      { slug: 'authorization', title: 'Authorization', description: 'Abilities, client checks, UI authorization components, route authorization metadata, server-side requireAbility(), and why your backend remains authoritative.' },
    ]
  },
  {
    title: 'Reference & Recipes',
    items: [
      { slug: 'api', title: 'API & Composable Reference', description: 'Complete useBearerAuth() methods, types, server-side utilities, and public type exports.' },
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
# Using npm
npm install nuxt-bearer-auth redis nuxt-csurf

# Using pnpm
pnpm add nuxt-bearer-auth redis nuxt-csurf

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

> **Security Tip**: In production, ensure \`REDIS_URL\` uses password authentication or TLS (\`rediss://...\`) and is isolated within your private VPC network. Redis holds live session data including bearer tokens — treat it as sensitive infrastructure.

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
      domain: undefined, // Optional: set to '.example.com' for subdomain sharing
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
| \`sessionSecret\` | \`string\` | \`""\` | Reserved field for a future session signing or encryption secret. Currently accepted by the module but not used at runtime — sessions are stored as JSON in Redis without additional application-level encryption. See [Redis Security Hardening](/docs/security#redis-hardening) for how to secure Redis at the infrastructure level. |
| \`appEnv\` | \`string\` | \`process.env.APP_ENV\` | Application environment name (\`local\`, \`development\`, \`production\`). Controls dev vs production cookie names and \`Secure\` attribute behaviour. |
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
| \`devName\` | \`string\` | \`"nuxt_bearer_auth_session_dev"\` | Development cookie name (used when \`appEnv\` is \`local\` or \`development\`). |
| \`maxAge\` | \`number\` | \`604800\` (7 days) | Session TTL in seconds. Applied to both the Redis key and the browser cookie. The session uses a **sliding expiration window** — authenticated activity resets this TTL back to the full \`maxAge\` value. |
| \`sameSite\` | \`"lax" \| "strict" \| "none"\` | \`"lax"\` | SameSite attribute for the session cookie. |
| \`secure\` | \`boolean\` | auto (\`true\` in prod) | Requires HTTPS transmission. Automatically \`true\` when \`NODE_ENV=production\` or \`appEnv=production\`. |
| \`domain\` | \`string\` | \`undefined\` | Optional cookie domain. Set to \`.example.com\` to share the session across subdomains. |
| \`path\` | \`string\` | \`"/"\` | Cookie path. |

> **Note**: The \`HttpOnly\` flag is always set on the session cookie — it is hardcoded and not configurable. This ensures the session identifier can never be read by browser JavaScript.
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

The \`login()\` method submits your credentials to Nuxt's local endpoint \`/api/auth/login\`. You can pass any standard credential payload naturally — such as \`{ email, password }\`, \`{ username, password }\`, \`{ phone, password }\`, \`{ mobile, password }\`, or \`{ identifier, password }\`.

Nuxt validates that credentials are provided before forwarding the request to your backend \`endpoints.login\`, parses the bearer token, stores the session in Redis, sets an HTTP-only cookie on the client, and updates the reactive auth state.

\`\`\`typescript
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
\`\`\`

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
// The refresh token is read from Redis — it is never sent to the browser
await auth.refresh()
\`\`\`

## Logout Flow

The logout flow always destroys the local Redis session regardless of whether the remote backend logout call succeeds. This means even if your backend is temporarily unreachable, the Nuxt session is cleared and the cookie is deleted.

\`\`\`typescript
const auth = useBearerAuth()

async function handleLogout() {
  // Destroys session and navigates to '/' (or custom destination)
  await auth.logout('/login')
}
\`\`\`

The server-side sequence on logout:
1. Calls your backend \`endpoints.logout\` with the bearer token.
2. If the backend call fails, the error is logged as a warning — the logout continues regardless.
3. Deletes the Redis session key (\`DEL session:<uuid>\`).
4. Removes the session from the user's active sessions set (\`SREM user_sessions:<userId>\`).
5. Clears the browser cookie.
6. Clears client-side auth state.
    `
  },

  'sessions': {
    slug: 'sessions',
    title: 'Redis Session Architecture',
    description: 'Deep dive into Redis session storage schema, sliding TTL expiration, active devices, and remote revocation.',
    category: 'Core Guides',
    order: 4,
    sections: [
      { id: 'redis-storage-model', title: 'Redis Storage Model', level: 2 },
      { id: 'session-data-structure', title: 'Session Data Structure', level: 2 },
      { id: 'sliding-ttl', title: 'Sliding Session Expiration', level: 2 },
      { id: 'active-sessions-index', title: 'User Sessions Index', level: 2 },
      { id: 'listing-sessions', title: 'Listing Active Sessions', level: 2 },
      { id: 'revoking-sessions', title: 'Revoking Remote Sessions', level: 2 },
      { id: 'destroy-all', title: 'Revoke All Sessions', level: 2 },
    ],
    content: `
## Redis Storage Model

\`nuxt-bearer-auth\` uses Redis as the authoritative server-side session store.

Two key patterns are used in Redis:

1. **\`session:<session_uuid>\`** (String with TTL): Stores the JSON-serialized session object.
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
│  ├── createdAt: "2025-01-15T10:30:00.000Z"                  │
│  ├── expiresAt: 1737030600000  (epoch ms, application check)│
│  ├── lastActivity: "2025-01-15T14:22:10.000Z"               │
│  ├── userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X)"   │
│  └── ipAddress: "192.168.1.50"                              │
│                                                             │
│  user_sessions:usr_101  (Set, TTL 604800s)                  │
│  ├── "a4e98f01-2b81-49c6..."  (MacBook)                     │
│  └── "f72c1092-881a-41b9..."  (iPhone)                      │
└─────────────────────────────────────────────────────────────┘
\`\`\`

Session data is stored as plain JSON in Redis. The session store itself is not application-level encrypted. See [Redis Security Hardening](/docs/security#redis-hardening) for infrastructure-level isolation recommendations.

## Session Data Structure

Each session in Redis adheres to the following TypeScript interface. The full session type is exported from the package root:

\`\`\`typescript
import type { BearerAuthSession, PublicSession } from 'nuxt-bearer-auth'

interface BearerAuthSession<User extends BearerAuthUser = BearerAuthUser> {
  userId: string
  token: string           // Bearer token — stored server-side, never sent to browser
  refreshToken?: string | null
  profile: User | null    // User profile object hydrated from backend
  createdAt: string       // ISO timestamp of session creation
  expiresAt: number       // Epoch milliseconds — application-level expiry guard
  lastActivity: string    // ISO timestamp — updated on every authenticated request
  userAgent?: string      // Request User-Agent header at session creation
  ipAddress?: string      // Client IP address at session creation
}

// Safe shape returned to the browser — omits token, refreshToken, userId, expiresAt
interface PublicSession {
  id: string
  createdAt: string
  lastActivity: string
  userAgent?: string
  ipAddress?: string
}
\`\`\`

> **Important**: The \`token\` and \`refreshToken\` fields are only ever stored in Redis on the Nuxt server. They are intentionally excluded from \`PublicSession\` and never included in any response to the browser.

## Sliding Session Expiration

Sessions use a **sliding expiration window**. Each time an authenticated request is made, the session's \`lastActivity\` timestamp is updated and the Redis TTL is reset to the full \`maxAge\` value.

This means:
- A session with a 7-day \`maxAge\` does not necessarily expire exactly 7 days after login.
- An active user whose requests are processed regularly will maintain a valid session indefinitely, as each request restarts the 7-day window.
- A session that has had no activity for the full \`maxAge\` period (7 days by default) will expire.

\`\`\`
Day 0:    Login       → session created, TTL = 7 days
Day 3:    Request     → TTL reset to 7 days from now (expires Day 10)
Day 9:    Request     → TTL reset to 7 days from now (expires Day 16)
Day 16+:  No request  → session expires after idle for 7 days
\`\`\`

The session JSON also carries an \`expiresAt\` field (epoch milliseconds) that serves as an application-level double-check independent of the Redis TTL, guarding against any TTL drift.

## User Sessions Index

The \`user_sessions:<userId>\` Redis Set tracks all active session IDs for a given user. This enables multi-device session management — listing, inspecting, and remotely revoking individual sessions without affecting others.

When a new session is created, its ID is added to this set. When a session is destroyed (logout, revocation, or TTL expiry cleanup), its ID is removed from the set.

## Listing Active Sessions

You can build a "Manage Active Devices" UI by calling the built-in endpoint \`GET /api/auth/sessions\`. The response shape is \`{ sessions: PublicSession[] }\`:

\`\`\`vue
<script setup lang="ts">
import type { PublicSession } from 'nuxt-bearer-auth'

const { data, refresh } = await useFetch<{ sessions: PublicSession[] }>('/api/auth/sessions')

async function revokeSession(sessionId: string) {
  await $fetch(\`/api/auth/sessions/\${sessionId}\`, { method: 'DELETE' })
  await refresh()
}
</script>

<template>
  <div class="sessions-list">
    <h3>Active Sessions</h3>
    <div v-for="s in data?.sessions" :key="s.id" class="session-card">
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

When a session is revoked via \`DELETE /api/auth/sessions/:id\`:

1. The endpoint verifies the current user owns that session ID — a 403 is returned if there is a mismatch.
2. Redis executes \`DEL session:<id>\`.
3. Redis removes \`<id>\` from the \`user_sessions:<user_id>\` set using \`SREM\`.
4. Any subsequent request from that device finds no session in Redis, the stale cookie is cleared, and a \`401 Unauthenticated\` is returned.

## Revoke All Sessions

To destroy every active session for a user (e.g. on a password change or security incident response), use the server-side utility \`destroyAllBearerAuthSessions\` in a custom Nitro handler:

\`\`\`typescript
// server/api/account/revoke-all-sessions.post.ts
import { requireBearerAuthSession, destroyAllBearerAuthSessions } from '#imports'

export default defineEventHandler(async (event) => {
  const session = requireBearerAuthSession(event)

  // Deletes every session key for this user and clears the user_sessions set
  await destroyAllBearerAuthSessions(session.userId)

  return { success: true, message: 'All sessions revoked' }
})
\`\`\`

This performs a Redis pipeline that deletes all \`session:<id>\` keys for the user and then deletes the \`user_sessions:<userId>\` set in a single atomic operation.
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
      { id: 'payload-exposure', title: 'What the SSR Payload Exposes', level: 2 },
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
   - Attaches { user: profile, status } to nuxtApp.payload.bearerAuth
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

The package includes a dedicated server plugin (\`bearer-auth.server.ts\`) that runs once per SSR request:

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
      abilities: session?.abilities || null,
    }
  } catch (error) {
    auth.clearAuthState()
  } finally {
    auth.setAuthReady(true)
    auth.setServerChecked()
  }
})
\`\`\`

## What the SSR Payload Exposes

Understanding what is and is not included in the SSR payload is important for security and data handling.

**Included in \`nuxtApp.payload.bearerAuth\` (sent to browser):**
- \`user\` — the user profile object returned by your backend (e.g. \`{ id, name, email, role, ... }\`)
- \`status\` — the authentication status string (\`"authenticated"\` or \`"unauthenticated"\`)
- \`abilities\` — the normalized ability strings from the Redis session (\`string[] | null\`); powers advisory client checks such as \`auth.can()\`

**Stays server-side only (never sent to browser):**
- \`token\` — the bearer token
- \`refreshToken\` — the refresh token
- \`userId\` — the internal user identifier
- \`ipAddress\` — the client IP at session creation
- \`userAgent\` — the user agent at session creation
- \`createdAt\` / \`expiresAt\` / \`lastActivity\` — session lifecycle metadata

> **Developer note**: The user profile object (\`session.profile\`) is serialized into the Nuxt SSR payload and becomes visible in the browser's hydration data. Avoid including highly sensitive data (such as internal secrets, PII beyond what your UI requires, or credentials) inside the user profile returned from your backend. Design the \`/me\` endpoint to return only what the client genuinely needs.

## Zero Client Auth Flicker

Because the server plugin runs before SSR rendering begins, Vue components and \`useFetch()\` calls within SSR have immediate access to the correct \`auth.user\` and \`auth.isAuthenticated\` values. The hydrated payload means the browser initializes with the same state synchronously — no loading spinner or unauthenticated flash on page load.

## Accessing Sessions in Server Routes

When building custom Nitro API routes (\`server/api/...\`), you can read the authenticated session directly from the H3 event context:

\`\`\`typescript
// server/api/projects.get.ts
import { requireBearerAuthSession, callAuthApi } from '#imports'

export default defineEventHandler(async (event) => {
  // 1. Ensures user is logged in, or throws 401 Unauthenticated
  //    Reads from event.context.auth — no additional Redis round-trip
  const session = requireBearerAuthSession(event)

  // 2. Call external API using the user's server-held bearer token
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

\`requireBearerAuthSession(event)\` reads from \`event.context.auth\`, which is populated by the server middleware on every request. It does not make an additional Redis query.

\`callAuthApi()\` automatically retrieves the bearer token from the Redis session and injects it as an \`Authorization: Bearer\` header on the outgoing request to your backend. The token is never passed to or through the browser.

## Server-Side Route Middleware

Because the session is hydrated before route middleware executes on SSR, unauthenticated requests to protected pages are redirected on the server before any protected HTML is rendered. On client-side navigation, the same middleware logic runs in the browser using the already-hydrated auth state.
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
      { id: 'ssr-payload-security', title: 'SSR Payload Security', level: 2 },
      { id: 'csrf-defense', title: 'CSRF Defense with nuxt-csurf', level: 2 },
      { id: 'redis-hardening', title: 'Redis Security Hardening', level: 2 },
      { id: 'backend-authorization', title: 'Backend Authorization Boundary', level: 2 },
      { id: 'production-checklist', title: 'Production Deployment Checklist', level: 2 },
    ],
    content: `
## Threat Model & Philosophy

> "Authentication should be boring. Security shouldn't be an afterthought."

\`nuxt-bearer-auth\` was designed to eliminate the most common vulnerability pattern in modern Vue/Nuxt SPAs: **storing sensitive API bearer tokens in \`localStorage\` or client-accessible JavaScript memory**.

We do not claim this package makes an application "100% unhackable". Security requires defense-in-depth across the entire stack. The guarantees described here are precise — read them carefully.

## Why Tokens Stay on the Server

When a bearer token is stored in the browser:
- Any Cross-Site Scripting (XSS) vulnerability in any third-party script, NPM dependency, or CDN can read \`localStorage.getItem('token')\` and exfiltrate it immediately.
- The stolen token can be used from anywhere in the world until it expires.
- Refresh tokens in the browser expose long-lived credentials to client compromise.

When using \`nuxt-bearer-auth\`:
- The browser only possesses a random UUID session cookie flagged as **\`HttpOnly\`**, **\`Secure\`**, and **\`SameSite=Lax\`**.
- Browser JavaScript — including malicious XSS payloads — **cannot read the session cookie value** via \`document.cookie\`.
- Even if an attacker induces a malicious request, they cannot extract the underlying API bearer token from the browser.

The precise guarantee is: **the bearer token itself is not exposed to browser JavaScript**. This is different from claiming XSS has no impact at all — a successful XSS attack can still make authenticated requests on behalf of the user while the browser session is active.

## HTTP-Only Cookies: Strengths & Limits

| Threat | Protected? | Explanation |
| :--- | :---: | :--- |
| **Token exfiltration via XSS** | **YES** | \`document.cookie\` cannot read HttpOnly cookies; the bearer token stays in Redis and is never sent to the browser. |
| **Local device token theft** | **YES** | No plaintext bearer tokens are written to \`localStorage\`, \`sessionStorage\`, or any browser-accessible storage. |
| **Cross-Site Request Forgery (CSRF)** | **REQUIRES CSRF LAYER** | Cookies are sent automatically with same-site requests; mitigated by \`nuxt-csurf\`. |
| **Authenticated XSS requests** | **PARTIAL** | An attacker with XSS can make authenticated HTTP requests using the browser's session, but cannot read or exfiltrate the bearer token itself. |

## SSR Payload Security

During SSR, the server plugin writes the user's profile and authentication status to the Nuxt hydration payload (\`nuxtApp.payload.bearerAuth\`). This payload is embedded in the initial HTML and is visible in the browser's page source.

**What is included in the payload**: the user profile object (\`session.profile\`), the authentication status string, and the normalized session abilities array (\`string[] | null\`) that powers advisory client checks.

**What is never included**: the bearer token, refresh token, session metadata (IP address, user agent, expiry timestamps).

Because the user profile is client-visible, you should design your backend's \`/me\` endpoint to return only the data your UI genuinely needs. Avoid including internal secrets, raw credentials, or excessive PII in the profile object.

## CSRF Defense with nuxt-csurf

Because browser cookies are automatically attached on cross-origin requests, \`nuxt-bearer-auth\` integrates with \`nuxt-csurf\` by default:
- On mutating requests (\`POST\`, \`PUT\`, \`PATCH\`, \`DELETE\`), a cryptographic CSRF token is verified via the \`x-csrf-token\` header.
- The composable's internal fetcher automatically includes the active CSRF token on all requests.
- Pre-authentication endpoints (login, register, etc.) have CSRF enforcement disabled — these routes have no session to protect.

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

Redis holds live session data including bearer tokens and user profiles. It must be treated as sensitive infrastructure.

1. **Network isolation**: Never expose Redis port \`6379\` to the public internet. Keep Redis inside your private VPC or overlay network. The Nuxt server should be the only host that can reach Redis.
2. **TLS in transit**: Use \`rediss://\` (Redis over TLS) in staging and production to encrypt all traffic between Nuxt and Redis.
3. **Strong authentication**: Require a high-entropy password or ACL credentials on your Redis instance.
4. **Automatic key expiration**: All session keys carry a Redis TTL (\`maxAge\` seconds). Sessions expire automatically without manual cleanup.
5. **Credential storage**: Store \`REDIS_URL\` (including any password) only in server-side environment variables — never commit credentials to source control.

> **Current encryption posture**: Session data is stored as JSON in Redis without application-level encryption. The \`sessionSecret\` configuration field is reserved for a future signing or encryption mechanism but is not used in the current release. Transport-level TLS via \`rediss://\` is the recommended approach for protecting data in transit between Nuxt and Redis.

## Backend Authorization Boundary

\`nuxt-bearer-auth\` protects your Nuxt application routes and keeps bearer tokens off the browser. It does **not** automatically secure your external backend API endpoints.

This distinction matters:

- A protected Nuxt page means: unauthenticated users are redirected before they can see your UI.
- A protected Nuxt server route (using \`requireBearerAuthSession\`) means: the Nuxt server verified the request has a valid session before processing it.
- Neither of these prevents a valid bearer token from being used directly against your backend API outside of Nuxt.

**Your backend API remains the authoritative security boundary for its own resources.** Backend endpoints should enforce their own authentication and authorization — verifying the bearer token, checking scopes or roles, and rejecting unauthorized requests regardless of where the request originates.

\`nuxt-bearer-auth\` is a frontend session management layer. It works alongside backend authorization, not as a replacement for it.

## Production Deployment Checklist

Before launching your application to production:

- [ ] **Enforce HTTPS**: Cookies must have the \`Secure\` attribute enabled (automatic when \`NODE_ENV=production\`).
- [ ] **Set SameSite Attribute**: Use \`sameSite: 'lax'\` (or \`'strict'\` for high-security applications).
- [ ] **Configure Redis TLS**: Ensure \`REDIS_URL\` uses \`rediss://\` on cloud providers.
- [ ] **Isolate Redis**: Redis should not be publicly accessible — restrict access to your Nuxt server only.
- [ ] **Require Redis authentication**: Set a strong password or ACL rules on your Redis instance.
- [ ] **Set Strong API_BASE_URL**: Point to your secure, authenticated API gateway.
- [ ] **Enable Backend Rate Limiting**: Protect your backend \`/auth/login\` and \`/auth/refresh\` routes from brute-force attacks.
- [ ] **Set Short Backend Token Lifetimes**: Configure your API (e.g. Laravel Sanctum or JWT) with short access token lifetimes (e.g. 15–60 minutes) combined with silent refresh.
- [ ] **Review SSR payload content**: Ensure your backend \`/me\` endpoint returns only the profile data your UI needs — the profile object is included in the SSR hydration payload visible to the browser.
    `
  },

  'authorization': {
    slug: 'authorization',
    title: 'Authorization',
    description: 'Abilities, client-side checks, route authorization metadata, server-side requireAbility(), and the three-layer security model.',
    category: 'Core Guides',
    order: 7,
    sections: [
      { id: 'three-layer-model', title: 'The Three-Layer Authorization Model', level: 2 },
      { id: 'enabling-authorization', title: 'Enabling Authorization', level: 2 },
      { id: 'abilities', title: 'Abilities, Roles & Permissions', level: 2 },
      { id: 'client-checks', title: 'Client Checks: can() and cannot()', level: 2 },
      { id: 'ui-components', title: 'UI Authorization: <Can> and <Cannot>', level: 2 },
      { id: 'route-authorization', title: 'Route Authorization Metadata', level: 2 },
      { id: 'matching-semantics', title: 'Matching Semantics: all / any / exact', level: 2 },
      { id: 'server-authorization', title: 'Server Authorization with requireAbility()', level: 2 },
      { id: 'http-semantics', title: '401 vs 403', level: 2 },
      { id: 'trust-boundary', title: 'Trust Boundary & Security Rules', level: 2 },
    ],
    content: `
## The Three-Layer Authorization Model

Authorization in this stack has three layers, and each layer stays responsible for its own decisions:

\`\`\`
1. UI authorization          auth.can("users.delete")        → hides buttons, disables links
        ↓
2. Nuxt app/server layer     route metadata + requireAbility → stops page visits and Nuxt routes
        ↓
3. Backend API (Laravel)     policies / gates / middleware   → authoritative enforcement
\`\`\`

**The lower layer is always authoritative.** \`auth.can()\` never secures an API endpoint. Route metadata never authorizes an external API call. \`requireAbility()\` never replaces a Laravel policy. Even when every Nuxt check passes, your backend must still authorize every request it receives using the bearer token.

## Enabling Authorization

Authorization is optional and disabled by default. Enable it in \`nuxt.config.ts\`:

\`\`\`typescript
export default defineNuxtConfig({
  modules: ['nuxt-bearer-auth'],

  bearerAuth: {
    authorization: {
      enabled: true,
      source: 'session',
      responsePaths: {
        abilities: ['abilities', 'data.abilities'],
        roles: ['roles', 'data.roles'],
        permissions: ['permissions', 'data.permissions'],
      },
      rolePrefix: 'role:',
    },

    redirects: {
      unauthorized: '/not-allowed', // where unauthorized users are sent
    },
  },
})
\`\`\`

Abilities are read from session-establishing responses (login, social login, register, OTP verification) and from refresh/\`me\` responses, normalized into a sorted \`string[]\`, and persisted on the Redis session. An omitted field preserves existing abilities; logout and failed authentication clear them.

## Abilities, Roles & Permissions

The canonical representation of authorization state is a flat array of ability strings:

- Direct abilities pass through as-is: \`"campaign.create"\`
- Roles are prefixed to avoid collisions: role \`admin\` becomes \`"role:admin"\`
- Permissions are treated as abilities: \`"users.delete"\`

Roles and permissions are input formats; abilities are what the package stores, exposes, and matches. Matching is **exact string equality only** — there are no wildcards (\`users.*\`), no prefix inheritance (\`users\` granting \`users.view\`), and no hierarchical permissions.

## Client Checks: can() and cannot()

\`\`\`vue
<script setup lang="ts">
const auth = useBearerAuth()
</script>

<template>
  <button v-if="auth.can('users.delete')" @click="destroy">Delete</button>
  <p v-if="auth.cannot('campaign.create')">You cannot create campaigns.</p>
</template>
\`\`\`

These checks are **advisory UI logic only**. They decide whether to render a control — they do not protect the API call behind it. A user can always craft a request directly against your backend, which is why Laravel must re-check \`users.delete\` on \`DELETE /api/users/123\` regardless of what the UI rendered.

## UI Authorization: &lt;Can&gt; and &lt;Cannot&gt;

Two auto-imported components mirror \`can()\`/\`cannot()\` declaratively. Both share one pure evaluator and the same exact-match, \`all\`/\`any\` semantics as route metadata and \`requireAbility()\`:

\`\`\`vue
<template>
  <!-- single ability -->
  <Can ability="users.delete">Delete</Can>

  <!-- every listed ability (default mode: "all") -->
  <Can :abilities="['users.view', 'users.edit']">Edit</Can>

  <!-- at least one listed ability -->
  <Can :abilities="['reports.view', 'reports.export']" mode="any">
    Export
  </Can>

  <!-- inverse rendering with optional fallback -->
  <Cannot ability="users.delete">
    <template #fallback>Request access</template>
  </Cannot>
</template>
\`\`\`

Props and slots:

| Prop / Slot | Type | Behavior |
| --- | --- | --- |
| \`ability\` | \`string\` | Single required ability. Takes precedence over \`abilities\` when both are provided. |
| \`abilities\` | \`string[]\` | Multiple required abilities, combined with \`mode\`. |
| \`mode\` | \`'all' \| 'any'\` | Defaults to \`'all'\`: every listed ability must be held. \`'any'\` requires at least one. |
| default slot | — | Rendered while the check passes (\`&lt;Can&gt;\`) or fails (\`&lt;Cannot&gt;\`). |
| \`#fallback\` | — | Optional. Rendered instead of the default slot when the check denies. |

Behavior:

- Authorized renders the default slot; unauthorized renders the optional \`#fallback\` slot or nothing. Denied content is removed from the DOM, not CSS-hidden.
- An empty \`abilities\` array — or no props at all — means "no restriction", identical to route metadata and server semantics.
- \`&lt;Cannot&gt;\` is the exact negation of the same evaluation used by \`&lt;Can&gt;\` — there is no second matching algorithm.
- Matching is exact string equality. Malformed props or malformed client authorization state fail closed; null or missing ability state can never satisfy a non-empty requirement.
- Evaluation reacts to login, refresh, logout, and session replacement through the existing client authorization state. No second state store exists and nothing is fetched.
- Server-rendered HTML matches hydration because evaluation is synchronous over the SSR-transferred state. In SPA-only rendering, guarded components briefly show the denied branch until the initial auth check resolves — pair with \`auth.ready\` for loading UX.
- Disabled authorization has no special UI mode: extraction never runs, state stays \`null\`, so \`&lt;Can&gt;\` renders fallback/nothing, identical to \`can()\`.

**UI authorization controls rendering only. It never secures API requests. Your backend must authorize every request it receives.** Hiding a button does not authorize \`DELETE /api/users/123\` — Laravel still re-checks every request it receives.

Directives such as \`v-can\` are intentionally not provided; components and \`can()\`/\`cannot()\` cover the same need with better typing and simpler SSR behavior.

## Route Authorization Metadata

Any page can declare the abilities it requires via \`definePageMeta\`. The global \`bearer-auth\` route middleware enforces them:

\`\`\`vue
<script setup lang="ts">
definePageMeta({
  authorization: {
    abilities: ['users.view'],
    mode: 'all', // optional — 'all' is the default
  },
})
</script>
\`\`\`

Runtime behavior:

1. **No metadata on the route** → navigation proceeds exactly as before.
2. **Authorization disabled** (\`authorization.enabled: false\`) → metadata is ignored.
3. **Unauthenticated visitor** → normal login redirect with \`?redirect=\` preserved. Authentication failure and authorization failure stay separate.
4. **Authenticated but lacking abilities** → redirected to \`redirects.unauthorized\` (default \`/auth/not-allowed\`). The user is *not* sent to login — they are logged in, just not allowed.
5. **Authorized** → navigation continues.

Route authorization protects page navigation inside your Nuxt app. It does not authorize requests that bypass routing (direct API calls), and it does not secure external APIs.

## Matching Semantics: all / any / exact

| Metadata | Session abilities | Result |
| --- | --- | --- |
| \`abilities: ['users.view']\` | \`['users.view']\` | allowed |
| \`abilities: ['users.view']\` | \`['users.edit']\` | unauthorized |
| \`['a', 'b']\` (default \`all\`) | has both | allowed |
| \`['a', 'b']\` (default \`all\`) | has only one | unauthorized |
| \`['a', 'b'], mode: 'any'\` | has at least one | allowed |
| \`['a', 'b'], mode: 'any'\` | has neither | unauthorized |

Rules:

- \`mode\` defaults to \`'all'\`: every listed ability must exist.
- \`mode: 'any'\`: at least one listed ability must exist.
- Matching is exact. Holding \`users.*\` does **not** satisfy \`users.view\`; holding \`users.view.edit\` does **not** satisfy \`users.view\`.
- Holding \`role:admin\` does **not** implicitly grant \`users.delete\` or anything else — roles become ordinary ability strings during normalization, so only the exact strings held are ever matched.
- An **empty requirement means unrestricted** everywhere: an empty \`abilities\` prop on \`&lt;Can&gt;\`/\`&lt;Cannot&gt;\`, an empty array in route metadata, and \`requireAbility(event, [])\` all allow access without checking abilities.

## Server Authorization with requireAbility()

For Nitro server routes, import \`requireAbility\` from the dedicated server-only subpath:

\`\`\`typescript
// server/api/admin/users.get.ts
import { requireAbility } from 'nuxt-bearer-auth/server'

export default defineEventHandler((event) => {
  // Throws 401 if unauthenticated, 403 if the ability is missing.
  const session = requireAbility(event, 'users.view')

  // Multiple abilities - every one required by default:
  requireAbility(event, ['users.view', 'users.export'])
  // At least one required:
  requireAbility(event, ['reports.view', 'reports.export'], 'any')

  return { users: [] }
})
\`\`\`

Key facts:

- **Server-only export.** \`nuxt-bearer-auth/server\` keeps the helper out of browser bundles. Importing it from client code will break your build - that is intentional.
- **Trusted source only.** It reads abilities exclusively from \`event.context.auth\`, the Redis-backed server session populated by the package server middleware. It never reads \`useState('bearer-auth-abilities')\`, request headers, query parameters, or request bodies. Client-supplied ability lists cannot grant access.
- **Separate context.** On success it sets \`event.context.authorization = { abilities, source: 'session' }\` - normalized strings only, no tokens or session internals - and returns the authenticated session.
- **Fail-safe.** If the session has no abilities (for example because authorization is disabled), every requirement fails closed with 403.
- **Not backend enforcement.** Guarding a route with \`requireAbility(event, 'campaign.delete')\` stops your own route from running. If that route then calls \`DELETE https://api.example.com/campaigns/123\`, Laravel must still authorize \`campaign.delete\` itself.

## 401 vs 403

The package keeps authentication and authorization failures distinct:

| Situation | Server response | Route behavior |
| --- | --- | --- |
| No valid session | \`401 Unauthenticated\` | Redirect to login with \`?redirect=\` |
| Valid session, missing ability | \`403 Authorization required\` | Redirect to \`redirects.unauthorized\` |

Error payloads contain only a status code and generic message - never tokens, session internals, or the user ability list.

## Trust Boundary & Security Rules

- Bearer and refresh tokens remain server-side in Redis at all times; authorization features never expose them.
- Client authorization state (\`auth.abilities\`) is derived convenience data for UI rendering. It is never consulted by \`requireAbility()\`.
- No request input (headers, query, body, cookies beyond the http-only session id) can grant abilities.
- \`event.context.authorization\` contains only the normalized \`string[]\` of abilities and its source.
- Disabling authorization makes route metadata inert and makes \`requireAbility()\` fail closed - it never silently grants access.
- Your Laravel (or any) backend remains the authoritative security boundary for its own endpoints.
    `
  },

  'api': {
    slug: 'api',
    title: 'API & Composable Reference',
    description: 'Complete reference for useBearerAuth composable, types, server handlers, server utilities, and public type exports.',
    category: 'Reference & Recipes',
    order: 8,
    sections: [
      { id: 'use-bearer-auth', title: 'useBearerAuth() / useAuth()', level: 2 },
      { id: 'reactive-state', title: 'Reactive State Properties', level: 2 },
      { id: 'methods', title: 'Composable Methods', level: 2 },
      { id: 'server-api-routes', title: 'Built-in Server API Routes', level: 2 },
      { id: 'server-utilities', title: 'Server Utilities', level: 2 },
      { id: 'ui-components', title: 'UI Authorization Components', level: 2 },
      { id: 'typescript-types', title: 'TypeScript Types', level: 2 },
      { id: 'public-type-exports', title: 'Public Type Exports', level: 2 },
      { id: 'testing', title: 'Testing Foundation', level: 2 },
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
| \`user\` | \`Ref&lt;User \| null&gt;\` | Current authenticated user profile object. |
| \`status\` | \`Ref&lt;AuthStatus&gt;\` | \`'idle' \| 'loading' \| 'authenticated' \| 'unauthenticated'\`. |
| \`ready\` | \`Ref&lt;boolean&gt;\` | \`true\` once initial auth check (SSR or client) has resolved. |
| \`error\` | \`Ref&lt;string \| null&gt;\` | Last authentication error message string. |
| \`abilities\` | \`Ref&lt;string[] \| null&gt;\` | Normalized ability strings hydrated from the server session; powers the advisory \`can()\` / \`cannot()\` checks. |
| \`loading\` | \`ComputedRef&lt;boolean&gt;\` | Convenience computed shorthand for \`status.value === 'loading'\`. |
| \`isAuthenticated\` | \`ComputedRef&lt;boolean&gt;\` | Convenience computed shorthand for \`status.value === 'authenticated'\`. |
| \`serverReady\` | \`ComputedRef&lt;Promise&lt;void&gt;&gt;\` | Resolves when server-side auth hydration completes. Used internally by the global middleware. |

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
fetchUser(options?: FetchUserOptions): Promise<{ data: User | null; error: string | null }>

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

// 12. Advisory ability check — exact string match against auth.abilities
can(ability: string): boolean

// 13. Inverse of can()
cannot(ability: string): boolean
\`\`\`

## Built-in Server API Routes

The module mounts these Nitro handlers under \`routes.localApiPrefix\` (default: \`/api/auth\`):

| Method & Route | Backend Endpoint Forwarded | Description |
| :--- | :--- | :--- |
| \`POST /api/auth/login\` | \`endpoints.login\` | Authenticates user, creates Redis session, sets cookie. |
| \`POST /api/auth/social-login\` | \`endpoints.socialLogin\` | Passes OAuth token to backend, creates Redis session. |
| \`POST /api/auth/logout\` | \`endpoints.logout\` | Destroys Redis session and cookie; calls backend logout (continues even if backend is unreachable). |
| \`GET /api/auth/me\` | \`endpoints.me\` | Returns current user from Redis session cache or refreshes from backend if \`?refresh=true\`. |
| \`POST /api/auth/refresh\` | \`endpoints.refresh\` | Calls backend refresh using Redis-held refresh token, updates session. New token is not returned to browser. |
| \`POST /api/auth/register\` | \`endpoints.register\` | Forwards registration payload. Creates session if backend returns a token. |
| \`POST /api/auth/otp-verification\`| \`endpoints.verifyOtp\` | Forwards OTP verification payload. Creates session if backend returns a token. |
| \`POST /api/auth/resend-otp/:id\` | \`endpoints.resendOtp\` | Triggers OTP resend for given user identifier. |
| \`POST /api/auth/forgot-password\` | \`endpoints.forgotPassword\`| Forwards forgot-password email/payload. |
| \`POST /api/auth/reset-password\` | \`endpoints.resetPassword\` | Forwards password reset payload with token. |
| \`GET /api/auth/sessions\` | Local Redis | Lists active sessions for current user as \`{ sessions: PublicSession[] }\`. |
| \`DELETE /api/auth/sessions/:id\` | Local Redis | Revokes specific session ID after verifying ownership. |

## Server Utilities

When writing custom Nitro endpoints in your application, import these utilities from \`#imports\`:

\`\`\`typescript
import {
  // Session read/write
  getBearerAuthSession,       // Read session from Redis by cookie
  createBearerAuthSession,    // Create new session after authentication
  updateBearerAuthSession,    // Update token, refreshToken, or profile in session
  destroyBearerAuthSession,   // Delete session from Redis and clear cookie
  destroyAllBearerAuthSessions, // Delete all sessions for a user ID
  getUserBearerAuthSessions,  // List PublicSession[] for a user (no tokens)
  deleteUserBearerAuthSession, // Delete a specific session with ownership check

  // Guard utility
  requireBearerAuthSession,   // Read event.context.auth or throw 401

  // External API proxy
  callAuthApi,                // Make authenticated request to backend using session token

  // Redis client (advanced use)
  getBearerAuthRedisClient,
} from '#imports'
\`\`\`

**\`requireBearerAuthSession(event)\`** reads from \`event.context.auth\` (populated by the server middleware) and throws a \`401 Unauthenticated\` error if no valid session is present. It does not make an additional Redis query — the session is already attached to the event context by the time your handler runs.

**\`requireAbility(event, abilities, mode?)\`** enforces authorization on top of authentication: it throws \`401 Unauthenticated\` when no session exists and \`403 Authorization required\` when the session lacks the required ability. It is imported from the server-only subpath \`nuxt-bearer-auth/server\` rather than \`#imports\` so it never reaches client bundles. See the [Authorization](/docs/authorization) guide.

**\`callAuthApi(endpoint, options)\`** constructs an HTTP request to your backend using \`apiBaseUrl + endpoint\`. When an \`event\` is provided, it automatically retrieves the bearer token from the Redis session and injects it as an \`Authorization: Bearer\` header. The token is never passed through the browser.

The \`nuxt-bearer-auth/server\` subpath also exports the supporting primitives \`requireAbility()\` builds on: \`normalizeAuthorizationData()\`, \`extractAuthorizationFromResponse()\`, and \`hasRequiredAbilities()\`. Treat \`requireAbility()\` as the primary API — the others are the same normalization and matching helpers the module uses internally, exported for custom enforcement code.

## UI Authorization Components

Two auto-imported components expose declarative authorization over the same client ability state that powers \`can()\`/\`cannot()\`. Full usage guidance lives in the [Authorization guide](/docs/authorization#ui-components).

| Component | Renders its default slot when |
| --- | --- |
| \`&lt;Can&gt;\` | The current abilities satisfy the requirement. |
| \`&lt;Cannot&gt;\` | They do not — the exact negation of \`&lt;Can&gt;\`, with no separate matching logic. |

Shared props: \`ability?: string\` (single ability, wins over \`abilities\`), \`abilities?: string[]\` (evaluated with \`mode\`), and \`mode?: 'all' \| 'any'\` (default \`'all'\`). An optional \`#fallback\` slot renders when the check denies, and denied slot content is removed from the DOM. Evaluation is reactive to login, refresh, logout, and session replacement, deterministic across SSR and hydration, and fails closed on malformed props or malformed ability state. An empty requirement means unrestricted.

\`\`\`vue
<Can ability="users.delete">
  <button>Delete user</button>

  <template #fallback>
    <span>You do not have permission to delete users.</span>
  </template>
</Can>
\`\`\`

Components control visibility only — they never secure API requests. Enforce authorization in Nitro handlers with \`requireAbility()\`, and always enforce it again on your backend.

## TypeScript Types

\`\`\`typescript
export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated'

export interface BearerAuthUser {
  id?: string | number
  uuid?: string
  email?: string
  name?: string
  [key: string]: unknown  // Open-ended — your backend user shape
}

export interface BearerAuthSession<User extends BearerAuthUser = BearerAuthUser> {
  userId: string
  token: string           // Bearer token — server-side only
  refreshToken?: string | null
  profile: User | null
  createdAt: string       // ISO timestamp
  expiresAt: number       // Epoch milliseconds (application-level expiry guard)
  lastActivity: string    // ISO timestamp — updated on each authenticated request
  userAgent?: string
  ipAddress?: string
  abilities?: string[] | null  // Normalized ability strings — server-derived
}

// Safe public shape — omits token, refreshToken, userId, expiresAt
export interface PublicSession {
  id: string
  createdAt: string
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

export interface LoginCredentials {
  identifier?: string
  email?: string
  username?: string
  phone?: string
  mobile?: string
  password?: string
  [key: string]: unknown
}

export interface SocialLoginCredentials {
  jwt?: string
  token?: string
  provider?: string
  [key: string]: unknown
}

export interface FetchUserOptions {
  refresh?: boolean
}
\`\`\`

## Public Type Exports

All core authentication types are exported from the package root and can be imported directly in your application:

\`\`\`typescript
import type {
  // Auth state and response types
  AuthStatus,
  AuthApiResponse,
  BearerAuthUser,
  BearerAuthSession,
  PublicSession,

  // Credential types
  LoginCredentials,
  SocialLoginCredentials,
  FetchUserOptions,

  // Module configuration types
  BearerAuthModuleOptions,
  BearerAuthEndpointOptions,
  BearerAuthResponsePaths,
  BearerAuthRedirectOptions,
  BearerAuthRouteOptions,
  BearerAuthCookieOptions,
  BearerAuthCsrfOptions,

  // Authorization types
  Ability,
  AuthorizationSource,
  AuthorizationMatchMode,
  AuthorizationRouteRequirement,
  AuthorizationResponsePaths,
  AuthorizationState,
  BearerAuthAuthorizationConfig,
} from 'nuxt-bearer-auth'
\`\`\`

These types are useful when extending the module, writing typed custom middleware, building strongly-typed composables around \`useBearerAuth\`, or constructing typed server API handlers.

\`\`\`typescript
// Example: extending BearerAuthUser with your own fields
import type { BearerAuthUser } from 'nuxt-bearer-auth'

interface AppUser extends BearerAuthUser {
  role: 'admin' | 'editor' | 'viewer'
  organizationId: string
  avatarUrl?: string
}

// Pass your type to the composable for full type inference
const auth = useBearerAuth<AppUser>()

// auth.user.value is now typed as AppUser | null
console.log(auth.user.value?.role)
\`\`\`

## Testing Foundation

\`nuxt-bearer-auth\` ships with a comprehensive automated test suite to give you confidence in the authentication and authorization foundation you are building on.

**Test runner**: Vitest
**Test results**: 15 test files · 163 tests · 163 passing (verified after the Phase 4 UI authorization release)

The suite covers:

| Suite | What it tests |
| :--- | :--- |
| \`sessions.test.ts\` | Session creation, retrieval, update, sliding TTL, destroy, destroy-all, multi-device listing, per-user revocation, \`requireBearerAuthSession\` |
| \`auth-handlers.test.ts\` | Login, social login, logout resilience, token refresh, \`/me\` cached vs. forced refresh |
| \`otp-register.test.ts\` | OTP verification flow, registration with and without auto-login |
| \`server-middleware.test.ts\` | Public route bypass, safe method bypass, authenticated context attachment, 401 on protected routes |
| \`route-middleware.test.ts\` | Client route guard — public access, protected redirect, auth-page redirect for authenticated users, Phase 3 authorization metadata enforcement (disabled mode inert, all/any modes, exact matching, custom unauthorized route, fail-closed malformed client state) |
| \`authorization-normalization.test.ts\` | Abilities/roles/permissions normalization into sorted unique strings, disabled/missing configuration safety |
| \`authorization-client.test.ts\` | Client ability synchronization across login/refresh/me, omission preservation, logout clearing stale abilities |
| \`authorization-enforcement.test.ts\` | Server \`requireAbility()\` — 401 vs 403, all/any semantics, exact matching, fail-closed malformed session data, rejection of client-supplied state/headers/query |
| \`authorization-ui-evaluator.test.ts\` | Pure Phase 4 evaluator — all/any modes, exact and case-sensitive matching, wildcard/prefix/role non-implication, empty requirements unrestricted, fail-closed malformed state and requirements, input immutability |
| \`authorization-ui-components.test.ts\` | \`&lt;Can&gt;\`/\`&lt;Cannot&gt;\` component matrix — prop normalization and precedence, fallback slots, reactivity to login/logout/refresh, SSR determinism, fail-closed behavior |
| \`ssr-plugin.test.ts\` | SSR hydration with valid session, unauthenticated SSR, Redis error resilience |
| \`normalize.test.ts\` | Response path normalization for multiple backend response shapes |
| \`paths.test.ts\` | JSON path traversal, \`$\` root selector, dot notation, null safety, URL interpolation |
| \`errors.test.ts\` | \`FetchError\` normalization, H3 error passthrough, generic error → 500 |
| \`redis-reliability.test.ts\` | Edge cases: missing cookie, missing session key, partial context |

Run the tests yourself:

\`\`\`bash
# In the nuxt-bearer-auth package directory
npm test
\`\`\`
    `
  },

  'customization': {
    slug: 'customization',
    title: 'Customization & Response Mapping',
    description: 'How to connect non-standard APIs, customize cookies, response paths, and custom middleware.',
    category: 'Reference & Recipes',
    order: 9,
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

> **Note**: The \`HttpOnly\` flag is always \`true\` on the session cookie and is not configurable. The \`Secure\` flag defaults to \`true\` in production and can be overridden via \`sessionCookie.secure\`.

## Custom Route Middleware

If you want to handle route protection entirely in your own middleware (for example to check user roles from \`auth.user.value\`), you can disable the built-in global middleware:

\`\`\`typescript
bearerAuth: {
  routes: {
    middleware: false, // Disables the built-in global route middleware
  },
}
\`\`\`

Then create your own \`middleware/auth.global.ts\`. The example below shows a user-implemented pattern that checks a \`role\` property on the user object — this logic is entirely in your application code, not provided by \`nuxt-bearer-auth\`:

\`\`\`typescript
// middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to) => {
  const auth = useBearerAuth()

  if (!auth.isAuthenticated.value && to.path.startsWith('/admin')) {
    return navigateTo('/login')
  }

  // Role checking is application logic — implement it here based on
  // whatever your auth.user.value shape looks like
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
    order: 10,
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
import type { PublicSession } from 'nuxt-bearer-auth'

// GET /api/auth/sessions returns { sessions: PublicSession[] }
const { data, refresh, pending } = await useFetch<{ sessions: PublicSession[] }>('/api/auth/sessions')
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
        v-for="s in data?.sessions"
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
            IP: {{ s.ipAddress || 'Unknown' }} · Last active: {{ new Date(s.lastActivity).toLocaleString() }}
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
