import { createContext, useContext, useMemo } from 'react'
import { type TranslationKey, t } from '../i18n'

export type ReaderI18n = {
	/**
	 * The language of the reader's interface, independent of the book's.
	 */
	locale: string
	t: (key: TranslationKey) => string
}

const DEFAULT_LOCALE = 'en'

const I18nContext = createContext<ReaderI18n | undefined>(undefined)

/**
 * The language of the interface and the labels translated into it.
 */
export function useReaderI18n(): ReaderI18n {
	const value = useContext(I18nContext)
	if (!value) {
		throw new Error('useReaderI18n must be used within a reader Root')
	}
	return value
}

export function I18nProvider({
	children,
	locale = DEFAULT_LOCALE,
}: {
	children: React.ReactNode
	locale?: string
}) {
	const value = useMemo(
		() => ({ locale, t: (key: TranslationKey) => t(key, locale) }),
		[locale],
	)

	return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
