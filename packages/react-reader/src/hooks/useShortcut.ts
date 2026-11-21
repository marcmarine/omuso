import { useEffect, useRef } from 'react'

type Shortcut = {
	key: string
	mod: boolean
	ctrl: boolean
	meta: boolean
	alt: boolean
	shift: boolean
}

/**
 * Parses `'mod+k'`, `'shift+?'` or `'escape'`. `mod` is ⌘ or Ctrl, so the
 * same shortcut works on every platform.
 */
function parseShortcut(keys: string): Shortcut {
	const parts = keys.toLowerCase().split('+')
	const key = parts.pop() ?? ''
	const has = (modifier: string) => parts.includes(modifier)

	return {
		key: key === 'esc' ? 'escape' : key,
		mod: has('mod'),
		ctrl: has('ctrl'),
		meta: has('meta'),
		alt: has('alt'),
		shift: has('shift'),
	}
}

function matches(shortcut: Shortcut, event: KeyboardEvent): boolean {
	if (event.key.toLowerCase() !== shortcut.key) return false
	if (event.altKey !== shortcut.alt) return false
	if (event.shiftKey !== shortcut.shift) return false

	if (shortcut.mod) return event.metaKey || event.ctrlKey
	return event.ctrlKey === shortcut.ctrl && event.metaKey === shortcut.meta
}

function isEditable(target: EventTarget | null): boolean {
	if (!(target instanceof HTMLElement)) return false
	return (
		target.isContentEditable ||
		target.tagName === 'INPUT' ||
		target.tagName === 'TEXTAREA' ||
		target.tagName === 'SELECT'
	)
}

/**
 * Calls `handler` when `keys` are pressed anywhere in the document, e.g.
 * `useShortcut('mod+k', openSearch)`. Modifiers must match exactly: `mod+k`
 * doesn't fire on ⇧⌘K.
 *
 * Shortcuts of a single character without ⌘, Ctrl or Alt (`'j'`, `'shift+?'`)
 * don't fire while typing in a field. The rest (`'mod+k'`, `'escape'`) do.
 *
 * `handler` gets the event, to call `preventDefault()` when the browser has
 * its own action for the keys.
 */
export function useShortcut(
	keys: string,
	handler: (event: KeyboardEvent) => void,
): void {
	const handlerRef = useRef(handler)
	useEffect(() => {
		handlerRef.current = handler
	})

	useEffect(() => {
		const shortcut = parseShortcut(keys)
		const typesText =
			shortcut.key.length === 1 &&
			!shortcut.mod &&
			!shortcut.ctrl &&
			!shortcut.meta &&
			!shortcut.alt

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.isComposing) return
			if (!matches(shortcut, event)) return
			if (typesText && isEditable(event.target)) return
			handlerRef.current(event)
		}

		document.addEventListener('keydown', handleKeyDown)
		return () => document.removeEventListener('keydown', handleKeyDown)
	}, [keys])
}
