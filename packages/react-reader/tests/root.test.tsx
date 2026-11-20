import { afterEach, describe, expect, mock, spyOn, test } from 'bun:test'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import {
	Reader,
	ReaderRoot,
	useReader,
	useReaderI18n,
	useReaderMetadata,
	useReaderPanels,
	useReaderTheme,
} from '../src/index'
import { writeStoredLocation } from '../src/utils/location'
import { book } from './fixtures'

declare global {
	var IS_REACT_ACT_ENVIRONMENT: boolean
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true

let mounted: { root: Root; container: HTMLElement } | undefined

async function render(element: React.ReactNode) {
	const container = document.createElement('div')
	document.body.append(container)
	const root = createRoot(container)
	await act(async () => root.render(element))
	mounted = { root, container }
	return container
}

afterEach(async () => {
	if (!mounted) return
	const { root, container } = mounted
	await act(async () => root.unmount())
	container.remove()
	mounted = undefined
})

const heading = (container: HTMLElement) =>
	container.querySelector('.om-content h1, .om-content h2, .om-content h3')
		?.textContent

describe('Reader', () => {
	test('opens the section in the URL', async () => {
		window.history.pushState(null, '', '/libro/capitulo-dos')

		const container = await render(<Reader context={book} language="en" />)

		expect(heading(container)).toBe('Capítulo dos')
	})

	test('opens the stored location when the URL is unknown', async () => {
		writeStoredLocation({ language: 'en', path: '1.1.1' })
		window.history.pushState(null, '', '/nowhere')

		const container = await render(<Reader context={book} language="es" />)

		expect(heading(container)).toBe('Part A')
	})

	test('opens the cover at the root', async () => {
		const container = await render(<Reader context={book} language="en" />)

		expect(container.querySelector('.om-cover')).not.toBeNull()
	})
})

describe('ReaderRoot', () => {
	function Probe() {
		const { state, meta } = useReader()
		const metadata = useReaderMetadata()
		const { locale, t } = useReaderI18n()
		const panels = useReaderPanels()
		const { theme } = useReaderTheme()

		return (
			<output>
				{JSON.stringify({
					language: state.language,
					path: state.session.currentSection?.path ?? null,
					languages: meta.languages,
					title: metadata.title,
					locale,
					label: t('search'),
					leftOpen: panels.left.isOpen,
					theme,
				})}
			</output>
		)
	}

	test('renders its children without DOM of its own', async () => {
		const container = await render(
			<ReaderRoot context={book} language="en">
				<p>Inside</p>
			</ReaderRoot>,
		)

		expect(container.innerHTML).toBe('<p>Inside</p>')
	})

	test('gives the hooks the reader state', async () => {
		window.history.pushState(null, '', '/libro/capitulo-uno')

		const container = await render(
			<ReaderRoot context={book} language="en">
				<Probe />
			</ReaderRoot>,
		)

		expect(JSON.parse(container.textContent ?? '')).toEqual({
			language: 'es',
			path: '1.1',
			languages: ['en', 'es'],
			title: 'Libro',
			locale: 'en',
			label: 'Search',
			leftOpen: false,
			theme: 'light',
		})
	})

	test('the hooks throw outside a Root', () => {
		const hooks = [
			useReader,
			useReaderMetadata,
			useReaderI18n,
			useReaderPanels,
			useReaderTheme,
		]
		const consoleError = spyOn(console, 'error').mockImplementation(() => {})

		for (const useHook of hooks) {
			function Outside() {
				useHook()
				return null
			}
			const container = document.createElement('div')
			const root = createRoot(container)
			expect(() => act(() => root.render(<Outside />))).toThrow(
				/must be used within a reader Root/,
			)
		}

		consoleError.mockRestore()
	})

	test('warns when nested in another Root', async () => {
		const warn = mock(() => {})
		const consoleWarn = spyOn(console, 'warn').mockImplementation(warn)

		await render(
			<ReaderRoot context={book} language="en">
				<ReaderRoot context={book} language="es">
					<p>Inside</p>
				</ReaderRoot>
			</ReaderRoot>,
		)

		expect(warn).toHaveBeenCalledTimes(1)
		expect(String(warn.mock.calls[0]?.[0])).toContain('inside another one')
		consoleWarn.mockRestore()
	})

	test('does not warn on its own', async () => {
		const consoleWarn = spyOn(console, 'warn').mockImplementation(() => {})

		await render(
			<ReaderRoot context={book} language="en">
				<p>Inside</p>
			</ReaderRoot>,
		)

		expect(consoleWarn).not.toHaveBeenCalled()
		consoleWarn.mockRestore()
	})
})
