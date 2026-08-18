import { createHighlighter, type Highlighter } from 'shiki'

let highlighterPromise: Promise<Highlighter> | null = null

export function getShikiHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['vitesse-dark', 'vitesse-light'],
      langs: ['typescript', 'javascript', 'vue', 'json', 'bash', 'yaml', 'markdown'],
    })
  }
  return highlighterPromise
}

export function useHighlighter() {
  async function highlight(code: string, lang = 'typescript', isDark = true) {
    try {
      const highlighter = await getShikiHighlighter()
      return highlighter.codeToHtml(code.trim(), {
        lang,
        theme: isDark ? 'vitesse-dark' : 'vitesse-light',
      })
    } catch (e) {
      // Fallback if grammar or lang fails
      const escaped = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
      return `<pre class="shiki"><code>${escaped}</code></pre>`
    }
  }

  return {
    highlight,
  }
}
