import { Link } from '../components/Link'
import { useBookContext } from '../providers/BookContextProvider'
import { useLayout } from '../providers/LayoutProvider'

export default function Cover() {
	const { manifest } = useBookContext()
	const { metadata } = manifest

	const firstChapterPath = manifest.paths[0]
	const { i18n } = useLayout()

	return (
		<div className="or-cover">
			<div className="or-cover__header">
				<p className="or-cover__author">{metadata.author}</p>
				<h1 className="or-cover__title">{metadata.title}</h1>
				{firstChapterPath && (
					<Link
						path={firstChapterPath}
						className="or-cover__start or-interactive"
					>
						{i18n.t('startReading')}
					</Link>
				)}
			</div>
			<div className="or-cover__footer">
				{metadata.translator && (
					<div className="or-cover__translator">
						<p>{i18n.t('translatedBy')}</p>
						<p className="or-cover__translator-name">{metadata.translator}</p>
					</div>
				)}
			</div>
		</div>
	)
}
