import type { BookContext, Manifest, SearchFilter, Session } from 'omuso'
import React from 'react'

/**
 * Builds the manifest and session for the current location. Search and
 * navigation are memoized apart, so moving between sections does not
 * repeat the search.
 */
function useReaderSession(
	context: BookContext,
	path: string,
	query: string | undefined,
	language: string,
	searchFilter?: SearchFilter,
): { manifest: Manifest; session: Session } {
	const manifest = React.useMemo(
		() => context.manifest(language) as Manifest,
		[context, language],
	)
	const searchState = React.useMemo(
		() => context.search(query || '', language, { filter: searchFilter }),
		[context, query, language, searchFilter],
	)
	const navigation = React.useMemo(
		() => context.session(path, '', language),
		[context, path, language],
	)
	const session = React.useMemo<Session>(
		() => ({ ...navigation, search: searchState }),
		[navigation, searchState],
	)

	return { manifest, session }
}

export default useReaderSession
