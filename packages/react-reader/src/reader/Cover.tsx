import { Link } from '../components/Link'
import ThemeToggle from '../components/ThemeToggle'
import TranslationSelector from '../components/TranslationSelector'
import { useBookContext } from '../providers/BookContextProvider'
import { useLayout } from '../providers/LayoutProvider'

export default function Cover() {
	const { manifest } = useBookContext()
	const { metadata } = manifest

	const firstChapterSlug = manifest.slugs[1]
	const { i18n } = useLayout()

	return (
		<div className="or-cover">
			<div className="or-cover__header">
				<h2 className="or-cover__author">{metadata.author}</h2>
				<h1 className="or-cover__title">{metadata.title}</h1>
				{firstChapterSlug && (
					<Link
						to={firstChapterSlug}
						className="or-cover__start or-interactive"
					>
						{i18n.t('startReading')}
					</Link>
				)}
			</div>
			<div className="or-cover__footer">
				<TranslationSelector />
				{metadata.translator && (
					<div className="or-cover__translator">
						<p>{i18n.t('translatedBy')}</p>
						<h4 className="or-cover__translator-name">{metadata.translator}</h4>
					</div>
				)}
				<div className="or-cover__theme">
					<ThemeToggle />
				</div>
			</div>
		</div>
	)
}
