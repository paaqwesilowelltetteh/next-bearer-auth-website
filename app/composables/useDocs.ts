import { docCategories, docPages, type DocPage, type DocCategory } from '~/data/docs'

export function useDocs() {
  function getDoc(slug: string): DocPage | null {
    return docPages[slug] || null
  }

  function getAllDocs(): DocPage[] {
    return Object.values(docPages).sort((a, b) => a.order - b.order)
  }

  function getCategories(): DocCategory[] {
    return docCategories
  }

  function getSurroundingDocs(currentSlug: string) {
    const all = getAllDocs()
    const index = all.findIndex((d) => d.slug === currentSlug)
    if (index === -1) {
      return { prev: null, next: null }
    }
    return {
      prev: index > 0 ? all[index - 1] : null,
      next: index < all.length - 1 ? all[index + 1] : null,
    }
  }

  function searchDocs(query: string) {
    if (!query.trim()) return []
    const q = query.toLowerCase().trim()
    const all = getAllDocs()
    const results: {
      slug: string
      title: string
      category: string
      sectionTitle?: string
      snippet: string
    }[] = []

    for (const doc of all) {
      if (doc.title.toLowerCase().includes(q) || doc.description.toLowerCase().includes(q)) {
        results.push({
          slug: doc.slug,
          title: doc.title,
          category: doc.category,
          snippet: doc.description,
        })
      }

      for (const sec of doc.sections) {
        if (sec.title.toLowerCase().includes(q)) {
          results.push({
            slug: `${doc.slug}#${sec.id}`,
            title: `${doc.title} → ${sec.title}`,
            category: doc.category,
            sectionTitle: sec.title,
            snippet: `Section in ${doc.title}`,
          })
        }
      }
    }

    return results.slice(0, 10)
  }

  return {
    getDoc,
    getAllDocs,
    getCategories,
    getSurroundingDocs,
    searchDocs,
  }
}
