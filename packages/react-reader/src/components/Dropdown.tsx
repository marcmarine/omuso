import {
	type KeyboardEvent as ReactKeyboardEvent,
	type ReactNode,
	useCallback,
	useId,
	useLayoutEffect,
	useRef,
	useState,
} from 'react'
import { classes } from '../utils'

const DEFAULT_GAP_PX = 2
const VIEWPORT_PADDING_PX = 4

type Side = 'top' | 'right' | 'bottom' | 'left'
type Align = 'start' | 'end'
type CloseDropdown = (options?: { restoreFocus?: boolean }) => void

interface TriggerProps<TElement extends HTMLElement> {
	id: string
	'aria-controls': string
	'aria-expanded': boolean
	'aria-haspopup': 'menu'
	popoverTarget: string
	popoverTargetAction: 'toggle'
	ref: React.RefObject<TElement | null>
}

interface DropdownProps<TElement extends HTMLElement> {
	renderTrigger: (triggerProps: TriggerProps<TElement>) => ReactNode
	children: ReactNode | ((closeDropdown: CloseDropdown) => ReactNode)
	side?: Side
	align?: Align
	gap?: number
	offset?: number
	contentClassName?: string
}

const clamp = (value: number, min: number, max: number) =>
	Math.min(Math.max(value, min), Math.max(min, max))

const getMenuItems = (contentEl: HTMLElement) =>
	Array.from(
		contentEl.querySelectorAll<HTMLElement>(
			[
				'[role="menuitem"]',
				'[role="menuitemcheckbox"]',
				'[role="menuitemradio"]',
				'button:not([disabled])',
				'a[href]',
			].join(','),
		),
	).filter(
		(item) =>
			!item.hasAttribute('disabled') &&
			item.getAttribute('aria-disabled') !== 'true',
	)

export function Dropdown<TElement extends HTMLElement = HTMLButtonElement>({
	renderTrigger,
	children,
	side = 'bottom',
	align = 'start',
	gap = DEFAULT_GAP_PX,
	offset = -4,
	contentClassName = '',
}: DropdownProps<TElement>) {
	const triggerId = useId()
	const contentId = useId()
	const triggerRef = useRef<TElement | null>(null)
	const contentRef = useRef<HTMLDivElement | null>(null)
	const [isOpen, setIsOpen] = useState(false)

	const updateContentPosition = useCallback(() => {
		const triggerEl = triggerRef.current
		const contentEl = contentRef.current
		if (!triggerEl || !contentEl) return

		const triggerRect = triggerEl.getBoundingClientRect()
		const contentRect = contentEl.getBoundingClientRect()

		const alignSign = align === 'start' ? 1 : -1

		let nextTop: number
		let nextLeft: number

		switch (side) {
			case 'top': {
				nextTop = triggerRect.top - contentRect.height - gap
				nextLeft =
					(align === 'start'
						? triggerRect.left
						: triggerRect.right - contentRect.width) +
					offset * alignSign
				const spaceAbove = triggerRect.top - VIEWPORT_PADDING_PX
				const spaceBelow =
					window.innerHeight - triggerRect.bottom - VIEWPORT_PADDING_PX
				if (nextTop < VIEWPORT_PADDING_PX && spaceBelow > spaceAbove) {
					nextTop = triggerRect.bottom + gap
				}
				break
			}
			case 'bottom': {
				nextTop = triggerRect.bottom + gap
				nextLeft =
					(align === 'start'
						? triggerRect.left
						: triggerRect.right - contentRect.width) +
					offset * alignSign
				const spaceAbove = triggerRect.top - VIEWPORT_PADDING_PX
				const spaceBelow =
					window.innerHeight - triggerRect.bottom - VIEWPORT_PADDING_PX
				if (
					nextTop + contentRect.height >
						window.innerHeight - VIEWPORT_PADDING_PX &&
					spaceAbove > spaceBelow
				) {
					nextTop = triggerRect.top - contentRect.height - gap
				}
				break
			}
			case 'left': {
				nextLeft = triggerRect.left - contentRect.width - gap
				nextTop =
					(align === 'start'
						? triggerRect.top
						: triggerRect.bottom - contentRect.height) +
					offset * alignSign
				const spaceLeft = triggerRect.left - VIEWPORT_PADDING_PX
				const spaceRight =
					window.innerWidth - triggerRect.right - VIEWPORT_PADDING_PX
				if (nextLeft < VIEWPORT_PADDING_PX && spaceRight > spaceLeft) {
					nextLeft = triggerRect.right + gap
				}
				break
			}
			case 'right': {
				nextLeft = triggerRect.right + gap
				nextTop =
					(align === 'start'
						? triggerRect.top
						: triggerRect.bottom - contentRect.height) +
					offset * alignSign
				const spaceLeft = triggerRect.left - VIEWPORT_PADDING_PX
				const spaceRight =
					window.innerWidth - triggerRect.right - VIEWPORT_PADDING_PX
				if (
					nextLeft + contentRect.width >
						window.innerWidth - VIEWPORT_PADDING_PX &&
					spaceLeft > spaceRight
				) {
					nextLeft = triggerRect.left - contentRect.width - gap
				}
				break
			}
		}

		nextLeft = clamp(
			nextLeft,
			VIEWPORT_PADDING_PX,
			window.innerWidth - contentRect.width - VIEWPORT_PADDING_PX,
		)
		nextTop = clamp(
			nextTop,
			VIEWPORT_PADDING_PX,
			window.innerHeight - contentRect.height - VIEWPORT_PADDING_PX,
		)

		contentEl.style.top = `${nextTop}px`
		contentEl.style.left = `${nextLeft}px`
	}, [side, align, gap, offset])

	const closeDropdown = useCallback<CloseDropdown>((options) => {
		contentRef.current?.hidePopover()
		if (options?.restoreFocus !== false) {
			triggerRef.current?.focus()
		}
	}, [])

	const focusFirstMenuItem = useCallback(() => {
		const contentEl = contentRef.current
		if (!contentEl) return

		const menuItems = getMenuItems(contentEl)
		const selectedItem =
			menuItems.find((item) => item.getAttribute('aria-checked') === 'true') ??
			menuItems[0]

		selectedItem?.focus()
	}, [])

	const handleContentKeyDown = useCallback(
		(e: ReactKeyboardEvent<HTMLDivElement>) => {
			const contentEl = contentRef.current
			if (!contentEl) return

			const menuItems = getMenuItems(contentEl)
			if (menuItems.length === 0) return

			const currentIndex = menuItems.indexOf(
				document.activeElement as HTMLElement,
			)
			const lastIndex = menuItems.length - 1

			switch (e.key) {
				case 'ArrowDown':
				case 'ArrowRight': {
					e.preventDefault()
					menuItems[
						currentIndex >= 0 ? (currentIndex + 1) % menuItems.length : 0
					]?.focus()
					break
				}
				case 'ArrowUp':
				case 'ArrowLeft': {
					e.preventDefault()
					menuItems[
						currentIndex >= 0
							? (currentIndex - 1 + menuItems.length) % menuItems.length
							: lastIndex
					]?.focus()
					break
				}
				case 'Home':
					e.preventDefault()
					menuItems[0]?.focus()
					break
				case 'End':
					e.preventDefault()
					menuItems[lastIndex]?.focus()
					break
			}
		},
		[],
	)

	useLayoutEffect(() => {
		const contentEl = contentRef.current
		const triggerEl = triggerRef.current
		if (!contentEl) return

		const handleOutsidePointerDown = (e: PointerEvent) => {
			const target = e.target as Node
			if (contentEl.contains(target) || triggerEl?.contains(target)) return
			closeDropdown({ restoreFocus: false })
		}

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') closeDropdown()
		}

		const handlePopoverToggle = (e: Event) => {
			const isOpen = (e as ToggleEvent).newState === 'open'
			setIsOpen(isOpen)
			if (isOpen) {
				updateContentPosition()
				requestAnimationFrame(focusFirstMenuItem)
				document.addEventListener('pointerdown', handleOutsidePointerDown, true)
				document.addEventListener('keydown', handleKeyDown, true)
			} else {
				document.removeEventListener(
					'pointerdown',
					handleOutsidePointerDown,
					true,
				)
				document.removeEventListener('keydown', handleKeyDown, true)
			}
		}

		contentEl.addEventListener('toggle', handlePopoverToggle)
		window.addEventListener('scroll', updateContentPosition, true)
		window.addEventListener('resize', updateContentPosition)
		return () => {
			contentEl.removeEventListener('toggle', handlePopoverToggle)
			window.removeEventListener('scroll', updateContentPosition, true)
			window.removeEventListener('resize', updateContentPosition)
			document.removeEventListener(
				'pointerdown',
				handleOutsidePointerDown,
				true,
			)
			document.removeEventListener('keydown', handleKeyDown, true)
		}
	}, [updateContentPosition, closeDropdown, focusFirstMenuItem])

	return (
		<>
			{renderTrigger({
				id: triggerId,
				'aria-controls': contentId,
				'aria-expanded': isOpen,
				'aria-haspopup': 'menu',
				popoverTarget: contentId,
				popoverTargetAction: 'toggle',
				ref: triggerRef,
			})}
			<div
				ref={contentRef}
				popover="auto"
				id={contentId}
				role="menu"
				aria-labelledby={triggerId}
				className={classes('or-dropdown__content', contentClassName)}
				onKeyDown={handleContentKeyDown}
			>
				{typeof children === 'function' ? children(closeDropdown) : children}
			</div>
		</>
	)
}
