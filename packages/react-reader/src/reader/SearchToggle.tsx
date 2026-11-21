import { useShortcut } from '../hooks/useShortcut'
import { useReader } from '../providers/BookContextProvider'
import { useReaderI18n } from '../providers/I18nProvider'
import { useReaderPanels } from '../providers/LayoutProvider'

export default function SearchToggle() {
	const panel = useReaderPanels()
	const { t } = useReaderI18n()
	const { query } = useReader().state.session.search
	const toggle = panel.right.toggle

	useShortcut('mod+k', toggle)

	return (
		<button
			className="om-icon-button om-interactive"
			onClick={toggle}
			type="button"
			aria-label={t('search')}
			aria-expanded={panel.right.isOpen}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
				fill="none"
				focusable="false"
				viewBox="0 0 24 24"
				strokeWidth={2}
				stroke="currentColor"
				className="om-icon"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
				/>
			</svg>
			<span
				className="om-icon-button__badge"
				data-visible={(query && !panel.right.isOpen) || undefined}
			/>
			{/* <kbd>⌘K</kbd> */}
		</button>
	)
}
