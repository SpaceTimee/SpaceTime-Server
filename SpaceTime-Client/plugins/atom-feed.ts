import type { Plugin } from 'vite'
import { XMLParser } from 'fast-xml-parser'
import { Feed } from 'feed'
import { endpoints } from '../src/endpoints'

interface AtomFeedOptions {
  readonly title: string
  readonly description: string
  readonly author: string
  readonly siteUrl: string
}

interface ExistingEntry {
  readonly summary: string
  readonly link: string
  readonly updated: string
}

export function AtomFeed(options: AtomFeedOptions): Plugin {
  return {
    name: 'atom-feed',
    apply: 'build',

    async generateBundle() {
      const { title, description, author, siteUrl } = options
      const now = new Date()

      const extractText = (value: unknown) =>
        typeof value === 'string'
          ? value
          : value && typeof value === 'object' && '#text' in value
            ? String((value as Record<string, unknown>)['#text'])
            : String(value ?? '')

      const currentEntries = endpoints.map((entry) => ({
        title: entry.name,
        summary: `<code>${entry.method} ${entry.path}</code>`,
        link: `${siteUrl}${entry.href}`
      }))

      const existingEntries = new Map<string, ExistingEntry>()
      try {
        const response = await fetch(`${siteUrl}/atom.xml`)
        if (response.ok) {
          const xml = await response.text()
          const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '@_',
            isArray: (_, jpath) => jpath === 'feed.entry' || jpath === 'feed.entry.link'
          })

          for (const entry of parser.parse(xml)?.feed?.entry ?? []) {
            const entryTitle = extractText(entry.title)
            const summary = extractText(entry.summary)
            const links: unknown[] = entry.link ?? []
            const link =
              (links as Record<string, string>[]).find(
                (linkEl) => !linkEl['@_rel'] || linkEl['@_rel'] === 'alternate'
              )?.['@_href'] || ''
            const updated = typeof entry.updated === 'string' ? entry.updated : String(entry.updated ?? '')

            if (entryTitle) {
              existingEntries.set(entryTitle, { summary, link, updated })
            }
          }
        }
      } catch {
        // Ignore fetch failures
      }

      const currentTitles = new Set<string>(currentEntries.map((entry) => entry.title))
      const hasDeletedEntries = [...existingEntries.keys()].some(
        (existingTitle) => !currentTitles.has(existingTitle)
      )

      let feedUpdated = new Date(0)

      const feedItems = currentEntries.map((entry) => {
        const existing = existingEntries.get(entry.title)
        let updatedDate: Date

        if (!existing || entry.summary !== existing.summary || entry.link !== existing.link) {
          updatedDate = now
        } else {
          updatedDate = new Date(existing.updated)
          if (Number.isNaN(updatedDate.getTime())) updatedDate = now
        }

        if (updatedDate > feedUpdated) feedUpdated = updatedDate

        return {
          title: entry.title,
          id: entry.link,
          description: entry.summary,
          link: entry.link,
          date: updatedDate
        }
      })

      if (hasDeletedEntries && now > feedUpdated) {
        feedUpdated = now
      }

      const feed = new Feed({
        title,
        description,
        id: `${siteUrl}/`,
        link: siteUrl,
        feedLinks: {
          atom: `${siteUrl}/atom.xml`
        },
        author: {
          name: author
        },
        updated: feedUpdated
      })

      for (const item of feedItems) {
        feed.addItem(item)
      }

      this.emitFile({
        type: 'asset',
        fileName: 'atom.xml',
        source: feed.atom1()
      })
    }
  }
}
