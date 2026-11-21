import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react'
import useLocalStorage from '../hooks/useLocalStorage'
import { isWideLayout } from '../utils'
import { useReader } from './BookContextProvider'

export type Panels = Record<'left' | 'right', PanelState>

type LayoutContextType = {
	panel: Panels
	/**
	 * The `.om-layout` element, registered by `Layout`. Pass it to
	 * `isWideLayout()` to know whether the panels sit beside the page or over
	 * it. `null` without a `Layout`.
	 */
	layoutRef: React.RefObject<HTMLDivElement | null>
	/**
	 * Closes both panels when they cover the page (narrow layout). Links call
	 * it, so following one shows the page even when it doesn't change.
	 */
	closePanelsIfNarrow: () => void
}

interface LayoutProviderProps {
	children: React.ReactNode
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined)

export function useLayout(): LayoutContextType {
	const value = useContext(LayoutContext)
	if (!value) {
		throw new Error('useReaderPanels must be used within a reader Root')
	}
	return value
}

/**
 * The reader's side panels. The panel policy lives here, so every piece that
 * opens, closes or follows a link gets it:
 * - When narrow, the panels cover the page, so opening one closes the other.
 * - When narrow, a new page closes them, whatever led to it: a link, the
 *   pager or the browser history.
 */
export const useReaderPanels = (): Panels => useLayout().panel

export function LayoutProvider({ children }: LayoutProviderProps) {
	const currentPath = useReader().state.session.currentSection?.path
	const layoutRef = useRef<HTMLDivElement>(null)

	const leftState = usePanelState('leftPanel', false, 250)
	const rightState = usePanelState('rightPanel', false, 300)

	// The panels cover the page when the layout is narrow. Without a `Layout`
	// there's nothing for them to cover, so the policy doesn't apply.
	const isNarrow = useCallback(() => {
		const layout = layoutRef.current
		return layout !== null && !isWideLayout(layout)
	}, [])
	const left = useExclusivePanel(leftState, rightState, isNarrow)
	const right = useExclusivePanel(rightState, leftState, isNarrow)
	const panel = useMemo(() => ({ left, right }), [left, right])

	const closeLeft = leftState.close
	const closeRight = rightState.close
	const closePanelsIfNarrow = useCallback(() => {
		if (!isNarrow()) return
		closeLeft()
		closeRight()
	}, [isNarrow, closeLeft, closeRight])

	// Only on a change, so a panel left open isn't closed on load.
	const shownPath = useRef(currentPath)
	useEffect(() => {
		if (shownPath.current === currentPath) return
		shownPath.current = currentPath
		closePanelsIfNarrow()
	}, [currentPath, closePanelsIfNarrow])

	const value = useMemo(
		() => ({ panel, layoutRef, closePanelsIfNarrow }),
		[panel, closePanelsIfNarrow],
	)

	return (
		<LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
	)
}

/**
 * Wraps a panel so that opening it closes `other` when narrow.
 */
function useExclusivePanel(
	panel: PanelState,
	other: PanelState,
	isNarrow: () => boolean,
): PanelState {
	const { isOpen, open: openPanel, close } = panel
	const closeOther = other.close

	const open = useCallback(() => {
		if (isNarrow()) closeOther()
		openPanel()
	}, [isNarrow, closeOther, openPanel])

	const toggle = useCallback(() => {
		if (isOpen) close()
		else open()
	}, [isOpen, close, open])

	return useMemo(() => ({ ...panel, open, toggle }), [panel, open, toggle])
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
