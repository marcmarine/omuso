import { parse } from '../parser'
import type { Root } from '../parser/types'
import { buildManifest, generateReadingSession, type Manifest } from '.'

export const createContext = () => {
	const ctx = {
		roots: {} as Record<string, Root>,
		manifests: {} as Record<string, Manifest>,
		maxNavigationDepth: Infinity as number | undefined,
		languages: [] as Array<string>,

		init(config: {
			markdowns: Record<string, string>
			defaultLanguage?: string
			maxNavigationDepth?: number
		}) {
			const markdowns = config.markdowns
			this.languages = Object.keys(markdowns)
			this.maxNavigationDepth = config.maxNavigationDepth

			for (const lang of this.languages) {
				const root = parse(markdowns[lang] as string)
				this.roots[lang] = root
				this.manifests[lang] = buildManifest(root)
			}

			return this
		},

		manifest(lang: string) {
			const manifest = this.manifests[lang]

			return manifest
		},

		session(path: string, query: string = '', lang: string) {
			const root = this.roots[lang] as Root
			const manifest = this.manifests[lang] as Manifest

			const session = generateReadingSession(
				root.content,
				manifest,
				path,
				query,
				lang,
				this.maxNavigationDepth,
			)

			return session
		},
	}

	return ctx
}

export type BookContext = ReturnType<typeof createContext>
export const context = createContext()
