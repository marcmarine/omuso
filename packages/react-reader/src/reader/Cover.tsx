import { useReader, useReaderMetadata } from '../providers/BookContextProvider'
import { useReaderI18n } from '../providers/I18nProvider'
import { formatYear } from '../utils'

export default function Cover({ children }: { children?: React.ReactNode }) {
	const { currentSection } = useReader().state.session

	if (currentSection) return null

	return (
		<div className="om-cover">
			{children ?? (
				<>
					<div className="om-cover__header">
						<CoverAuthor />
						<CoverTitle />
					</div>
					<div className="om-cover__footer">
						<CoverDate />
						<CoverTranslator />
					</div>
				</>
			)}
		</div>
	)
}

export function CoverTitle() {
	const { title } = useReaderMetadata()
	if (!title) return null

	return <h1 className="om-cover__title">{title}</h1>
}

export function CoverAuthor() {
	const { author } = useReaderMetadata()
	if (!author) return null

	return <p className="om-cover__author">{author}</p>
}

export function CoverDate() {
	const { date } = useReaderMetadata()
	const { language } = useReader().state
	const year = formatYear(date, language)
	if (!year) return null

	return (
		<p>
			<time dateTime={date}>{year}</time>
		</p>
	)
}

export function CoverTranslator() {
	const { translator } = useReaderMetadata()
	const { t } = useReaderI18n()
	if (!translator) return null

	return (
		<div className="om-cover__translator">
			<p>{t('translatedBy')}</p>
			<p className="om-cover__translator-name">{translator}</p>
		</div>
	)
}
