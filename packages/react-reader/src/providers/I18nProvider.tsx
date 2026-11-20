import { createContext, useContext, useMemo } from 'react'
import { type TranslationKey, t } from '../i18n'

type I18nContextType = {
	/**
	 * The language of the reader's interface, independent of the book's.
	 */
	locale: string
	t: (key: TranslationKey) => string
}

const DEFAULT_LOCALE = 'en'

const I18nContext = createContext<I18nContextType>({
	locale: DEFAULT_LOCALE,
	t: (key) => t(key, DEFAULT_LOCALE),
})

export const useReaderI18n = () => useContext(I18nContext)

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
