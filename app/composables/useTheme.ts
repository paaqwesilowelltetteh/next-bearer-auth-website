export type ThemeMode = 'dark' | 'light' | 'system'

export function useTheme() {
  const theme = useState<ThemeMode>('app-theme', () => 'dark')
  const isDark = useState<boolean>('app-is-dark', () => true)

  function applyTheme(mode: ThemeMode) {
    theme.value = mode
    if (import.meta.client) {
      localStorage.setItem('nuxt-bearer-auth-theme', mode)
      
      let darkActive = true
      if (mode === 'dark') {
        darkActive = true
      } else if (mode === 'light') {
        darkActive = false
      } else {
        darkActive = window.matchMedia('(prefers-color-scheme: dark)').matches
      }

      isDark.value = darkActive
      if (darkActive) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }

  function initTheme() {
    if (import.meta.client) {
      const saved = localStorage.getItem('nuxt-bearer-auth-theme') as ThemeMode | null
      const initial = saved || 'dark'
      applyTheme(initial)

      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (theme.value === 'system') {
          isDark.value = e.matches
          if (e.matches) {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
        }
      })
    }
  }

  function toggleTheme() {
    if (isDark.value) {
      applyTheme('light')
    } else {
      applyTheme('dark')
    }
  }

  return {
    theme,
    isDark,
    applyTheme,
    initTheme,
    toggleTheme,
  }
}
