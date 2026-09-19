const translations = {
	en: {
		startReading: 'Start reading',
		searchContent: 'Search content',
		noResults: 'No results for',
		translations: 'Translations',
		translatedBy: 'Translated by',
		resultsIn: 'Results In',
		chapter: 'Chapter',
		chapters: 'Chapters',
		forWord: 'For The Word',
	},
	es: {
		startReading: 'Empezar a leer',
		searchContent: 'Buscar contenido',
		noResults: 'No hay resultados para',
		translations: 'Traducciones',
		translatedBy: 'Traducido por',
		resultsIn: 'Resultados en',
		chapter: 'Apartado',
		chapters: 'Apartados',
		forWord: 'Para la palabra',
	},
	ca: {
		startReading: 'Començar a llegir',
		searchContent: 'Cercar contingut',
		noResults: 'No hi ha resultats per a',
		translations: 'Traduccions',
		translatedBy: 'Traduït per',
		resultsIn: 'Resultats en',
		chapter: 'Apartat',
		chapters: 'Apartats',
		forWord: 'Per a la paraula',
	},
	ru: {
		startReading: 'Начать чтение',
		searchContent: 'Поиск контента',
		noResults: 'Нет результатов для',
		translations: 'Переводы',
		translatedBy: 'Переведено',
		resultsIn: 'Результаты в',
		chapter: 'Глава',
		chapters: 'Главы',
		forWord: 'Для слова',
	},
} as const

export type TranslationKey = keyof typeof translations.en

export function t(key: TranslationKey, language: string): string {
	const langTranslations = translations[language as keyof typeof translations]
	return langTranslations?.[key] || translations.en[key] || key
}
