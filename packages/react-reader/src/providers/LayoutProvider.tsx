import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useRef,
	useState,
} from 'react'
import useLocalStorage from '../hooks/useLocalStorage'

type LayoutContextType = {
	panel: Record<'left' | 'right', PanelState>
	/**
	 * The `.om-layout` element, set by `Layout`. Pass it to `isWideLayout()` to
	 * know whether the panels sit beside the page or over it.
	 */
	layoutRef: React.RefObject<HTMLDivElement | null>
}

interface LayoutProviderProps {
	children: React.ReactNode
}

const LayoutContext = createContext<LayoutContextType>({
	panel: {} as LayoutContextType['panel'],
	layoutRef: { current: null },
})

export const useLayout = () => useContext(LayoutContext)

export function LayoutProvider({ children }: LayoutProviderProps) {
	const left = usePanelState('leftPanel', false, 250)
	const right = usePanelState('rightPanel', false, 300)
	const panel = useMemo(() => ({ left, right }), [left, right])
	const layoutRef = useRef<HTMLDivElement>(null)

	const value = useMemo(() => ({ panel, layoutRef }), [panel])

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
