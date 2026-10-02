import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from 'react'
import useLocalStorage from '../hooks/useLocalStorage'
import { type TranslationKey, t } from '../i18n'

type LayoutContextType = {
	panel: Record<'left' | 'right', PanelState>
	maxDepth: number
	i18n: {
		t: (_key: TranslationKey) => string
	}
	omitSections?: Array<string>
}

interface LayoutProviderProps {
	children: React.ReactNode
	language?: string
	maxDepth?: number
	omitSections?: Array<string>
}

const LayoutContext = createContext<LayoutContextType>({
	panel: {} as LayoutContextType['panel'],
	maxDepth: 3,
	i18n: {
		t: () => '',
	},
})

export const useLayout = () => useContext(LayoutContext)

export function LayoutProvider({
	children,
	language = 'en',
	maxDepth = Infinity,
	omitSections,
}: LayoutProviderProps) {
	const left = usePanelState('leftPanel', false, 250)
	const right = usePanelState('rightPanel', false, 300)
	const panel = useMemo(() => ({ left, right }), [left, right])

	const i18n = useMemo(
		() => ({
			t: (key: TranslationKey) => t(key, language),
		}),
		[language],
	)

	const value = useMemo(
		() => ({ panel, i18n, maxDepth, omitSections }),
		[panel, i18n, maxDepth, omitSections],
	)

	return (
		<LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
	)
}

export interface PanelState {
	open: boolean
	toggle: () => void
	width: number
	setPanelWidth: (newWidth: number) => void
}

function usePanelState(
	key: string,
	defaultOpen = false,
	defaultWidth = 250,
): PanelState {
	const [storedOpen, setStoredOpen] = useLocalStorage(`${key}Open`, defaultOpen)
	const [storedWidth, setStoredWidth] = useLocalStorage(
		`${key}Width`,
		defaultWidth,
	)

	const [open, setOpen] = useState(storedOpen)
	const [width, setWidth] = useState(storedWidth)

	const toggle = useCallback(() => {
		setOpen(!open)
		setStoredOpen(!open)
	}, [open, setStoredOpen])

	const setPanelWidth = useCallback(
		(newWidth: number) => {
			setWidth(newWidth)
			setStoredWidth(newWidth)
		},
		[setStoredWidth],
	)

	return useMemo(
		() => ({ open, toggle, width, setPanelWidth }),
		[open, toggle, width, setPanelWidth],
	)
}
