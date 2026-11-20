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
	isOpen: boolean
	open: () => void
	close: () => void
	toggle: () => void
	width: number
	setWidth: (width: number) => void
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

	const [isOpen, setIsOpen] = useState(storedOpen)
	const [width, setWidthState] = useState(storedWidth)

	const setOpen = useCallback(
		(nextOpen: boolean) => {
			setIsOpen(nextOpen)
			setStoredOpen(nextOpen)
		},
		[setStoredOpen],
	)
	const open = useCallback(() => setOpen(true), [setOpen])
	const close = useCallback(() => setOpen(false), [setOpen])
	const toggle = useCallback(() => setOpen(!isOpen), [isOpen, setOpen])

	const setWidth = useCallback(
		(newWidth: number) => {
			setWidthState(newWidth)
			setStoredWidth(newWidth)
		},
		[setStoredWidth],
	)

	return useMemo(
		() => ({ isOpen, open, close, toggle, width, setWidth }),
		[isOpen, open, close, toggle, width, setWidth],
	)
}
