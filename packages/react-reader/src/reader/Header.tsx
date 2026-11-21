import { Link } from '../components/Link'
import { useReader, useReaderMetadata } from '../providers/BookContextProvider'
import { useReaderTheme } from '../providers/ThemeProvider'
import { COVER_PATH } from '../utils/routes'

/**
 * The sticky header, with the book's title linked to the cover.
 */
export default function Header() {
	const { theme } = useReaderTheme()
	const path = useReader().state.session.currentSection?.path ?? ''
	const { title, author } = useReaderMetadata()

	// Safari 26 tints its bars from the sticky header but doesn't notice when
	// its color changes, so it's remounted whenever the color may change: on
	// a new theme or page. It lives here, in the frame, so it can't be lost
	// when the header is composed.
	return (
		<header key={`${theme}:${path}`} className="om-header">
			<Link path={COVER_PATH} className="om-header__title om-interactive">
				{title}
			</Link>
			{author && <p className="om-header__author">{author}</p>}
		</header>
	)
}
