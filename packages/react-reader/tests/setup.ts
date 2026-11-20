import { afterEach } from 'bun:test'
import { GlobalRegistrator } from '@happy-dom/global-registrator'

// The reader reads `window.location` and `localStorage`, so tests run in a
// DOM. Each test starts at the root URL with empty storage.
GlobalRegistrator.register({ url: 'http://localhost/' })

afterEach(() => {
	window.localStorage.clear()
	window.history.replaceState(null, '', '/')
})
