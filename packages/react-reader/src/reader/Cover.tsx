import { useBookContext } from '../providers/BookContextProvider'
import { useLayout } from '../providers/LayoutProvider'
import { formatYear } from '../utils'

export default function Cover() {
	const { manifest } = useBookContext()
	const { metadata } = manifest

	const { i18n } = useLayout()

	const year = formatYear(metadata.date, metadata.language)

	return (
		<div className="om-cover">
			<div className="om-cover__header">
				<p className="om-cover__author">{metadata.author}</p>
				<h1 className="om-cover__title">{metadata.title}</h1>
			</div>
			<div className="om-cover__footer">
				{year && (
					<p>
						<time dateTime={metadata.date}>{year}</time>
					</p>
				)}
				{metadata.translator && (
					<div className="om-cover__translator">
						<p>{i18n.t('translatedBy')}</p>
						<p className="om-cover__translator-name">{metadata.translator}</p>
					</div>
				)}
			</div>
		</div>
	)
}
