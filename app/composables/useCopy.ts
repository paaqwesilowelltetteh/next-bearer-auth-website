export function useCopy(timeout = 2000) {
  const copied = ref(false)
  let timer: ReturnType<typeof setTimeout> | null = null

  async function copy(text: string) {
    if (import.meta.client && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text)
        copied.value = true
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => {
          copied.value = false
        }, timeout)
        return true
      } catch (err) {
        console.error('Failed to copy text:', err)
        return false
      }
    }
    return false
  }

  return {
    copied,
    copy,
  }
}
