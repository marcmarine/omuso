import { parse } from '../parser'
import type { Root } from '../parser/types'
import {
	type BookContext,
	type BookContextConfig,
	buildManifest,
	generateReadingSession,
	type Manifest,
} from '.'

/**
 * Creates an isolated book context. State lives in a closure, so methods
 * work when destructured (`const { session } = ctx`) and each instance is
 * independent from the others.
 */
export const createContext = (): BookContext => {
	const state = {
		roots: {} as Record<string, Root>,
		manifests: {} as Record<string, Manifest>,
		maxNavigationDepth: Infinity as number | undefined,
		languages: [] as Array<string>,
		omittedPaths: [] as Array<string>,
	}

	const init = (config: BookContextConfig): BookContext => {
		const markdowns = config.markdowns
		const slugStyle = config.slugStyle ?? 'kebab'
		state.languages = Object.keys(markdowns)
		state.maxNavigationDepth =
			config?.maxNavigationDepth ?? state.maxNavigationDepth
		state.omittedPaths = config?.omitPaths ?? state.omittedPaths
		state.roots = {}
		state.manifests = {}

		for (const lang of state.languages) {
			const root = parse(markdowns[lang] as string, { slugStyle })

			state.roots[lang] = root
			state.manifests[lang] = buildManifest(
				root,
				state.omittedPaths,
				slugStyle,
			)
		}

		return ctx
	}

	const manifest = (lang: string): Manifest => {
		return state.manifests[lang] as Manifest
	}

	const session = (path: string, query: string = '', lang: string) => {
		const root = state.roots[lang] as Root
		const manifest = state.manifests[lang] as Manifest

		return generateReadingSession(
			root.content,
			manifest,
			path,
			query,
			lang,
			state.maxNavigationDepth,
			state.omittedPaths,
		)
	}

	const ctx: BookContext = {
		get roots() {
			return state.roots
		},
		get manifests() {
			return state.manifests
		},
		get maxNavigationDepth() {
			return state.maxNavigationDepth
		},
		get languages() {
			return state.languages
		},
		get omittedPaths() {
			return state.omittedPaths
		},
		init,
		manifest,
		session,
	}

	return ctx
}

/**
 * Shared singleton context.
 *
 * @deprecated Its state is shared by every module in the process, so two
 * books loaded with it overwrite each other. Use `createContext()` instead.
 */
export const context = createContext()
