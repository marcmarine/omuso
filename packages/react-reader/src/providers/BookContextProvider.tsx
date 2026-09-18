import type { BookContext, Manifest, Session } from 'omuso'
import React, { useMemo } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'

const DEFAULT_LANGUAGE = 'en'

export type Context = {
	manifest: Manifest
	session: Session
	navigate: (currentSlug: string) => void
	search: (value: string) => void
	resetSearch: () => void
	availableLanguages: Array<string>
	setLanguage: (newLanguage: string) => void
}

export const BookContextContext = React.createContext<Context | undefined>(
	undefined,
)

export function BookContextProvider({
	children,
	defaultLanguage,
	context,
}: {
	children: React.ReactNode
	defaultLanguage?: string
	context: BookContext
}) {
	const [location, setLocation] = useLocalStorage('location', {
		language: defaultLanguage || DEFAULT_LANGUAGE,
		path: '0',
	})
	const [searchQuery, setSearchQuery] = React.useState<string>()
	const manifests = React.useMemo(() => context.manifests, [context])
	const availableLanguages = useMemo(() => Object.keys(manifests), [manifests])

	const validatedLanguage = useMemo(() => {
		if (availableLanguages.includes(location.language)) {
			return location.language
		} else {
			return defaultLanguage || DEFAULT_LANGUAGE
		}
	}, [location.language, availableLanguages, defaultLanguage])

	const manifest = React.useMemo(
		() => context.manifest(validatedLanguage) as Manifest,
		[context, validatedLanguage],
	)
	const session = React.useMemo(
		() => context.session(location.path, searchQuery || '', validatedLanguage),
		[context, location.path, validatedLanguage, searchQuery],
	)

	const navigate = React.useCallback(
		(currentSlug: string) => {
			const currentLanguage = validatedLanguage
			const urlParams = new URLSearchParams(window.location.search)
			const query = urlParams.get('query')
			if (query) {
				setSearchQuery(query)
			}

			if (currentSlug === '/') {
				setLocation({
					language: currentLanguage,
					path: '0',
				})
				return
			}

			const path = manifest.pathBySlug[decodeURIComponent(currentSlug)]
			if (path !== undefined) {
				setLocation({ language: currentLanguage, path })
				return
			}

			for (const language of availableLanguages) {
				if (language === currentLanguage) continue
				const path = manifest.pathBySlug[currentSlug]
				if (path !== undefined) {
					setLocation({ language, path })
					return
				}
			}

			console.warn(`Slug not found: ${currentSlug}`)
		},
		[validatedLanguage, availableLanguages, manifest.pathBySlug, setLocation],
	)

	const search = (value: string) => {
		setSearchQuery(value)
	}

	const resetSearch = () => {
		setSearchQuery(undefined)
	}

	const setLanguage = (newLanguage: string) => {
		setLocation({
			language: newLanguage,
			path: location.path,
		})
	}

	return (
		<BookContextContext.Provider
			value={{
				manifest,
				session,
				navigate,
				search,
				resetSearch,
				availableLanguages,
				setLanguage,
			}}
		>
			{children}
		</BookContextContext.Provider>
	)
}

export function useBookContext() {
	const context = React.useContext(BookContextContext)
	if (!context) {
		throw new Error('useBookContext must be used within a BookProvider')
	}
	return context
}
