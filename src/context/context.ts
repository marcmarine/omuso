import { parse } from '../parser'
import type { Root } from '../parser/types'
import {
	type BookContext,
	type BookContextConfig,
	buildManifest,
	generateReadingSession,
	type Manifest,
} from '.'

export const createContext = () => {
	const ctx: BookContext = {
		roots: {},
		manifests: {},
		maxNavigationDepth: Infinity,
		languages: [],
		omittedPaths: [],

		init(config: BookContextConfig) {
			const markdowns = config.markdowns
			this.languages = Object.keys(markdowns)
			this.maxNavigationDepth =
				config?.maxNavigationDepth ?? this.maxNavigationDepth
			this.omittedPaths = config?.omitPaths ?? this.omittedPaths

      for (const lang of this.languages) {
				const root = parse(markdowns[lang] as string)

				this.roots[lang] = root
				this.manifests[lang] = buildManifest(root, this.omittedPaths)
      }

			return this
		},

		manifest(lang: string) {
			const manifest = this.manifests[lang] as Manifest

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
				this.omittedPaths
			)

			return session
    },
	}

	return ctx
}

export const context = createContext()
