import { useShortcut } from '../hooks/useShortcut'
import { useReaderI18n } from '../providers/I18nProvider'
import { useReaderPanels } from '../providers/LayoutProvider'

export default function TocToggle() {
	const panel = useReaderPanels()
	const { t } = useReaderI18n()
	const toggle = panel.left.toggle

	// ⌘M would minimize the window.
	useShortcut('mod+m', (event) => {
		event.preventDefault()
		toggle()
	})

	return (
		<button
			type="button"
			onClick={toggle}
			className="om-icon-button om-interactive"
			aria-label={t('tableOfContents')}
			aria-expanded={panel.left.isOpen}
		>
			<svg
				aria-hidden="true"
				className="om-icon"
				focusable="false"
				strokeWidth={2}
				fill="currentColor"
				viewBox="0 0 256 256"
			>
				<path d="M76,64A12,12,0,0,1,88,52H216a12,12,0,0,1,0,24H88A12,12,0,0,1,76,64Zm140,52H88a12,12,0,0,0,0,24H216a12,12,0,0,0,0-24Zm0,64H88a12,12,0,0,0,0,24H216a12,12,0,0,0,0-24ZM44,112a16,16,0,1,0,16,16A16,16,0,0,0,44,112Zm0-64A16,16,0,1,0,60,64,16,16,0,0,0,44,48Zm0,128a16,16,0,1,0,16,16A16,16,0,0,0,44,176Z" />
			</svg>
		</button>
	)
}
