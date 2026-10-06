import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react'
import { storageKey } from '../utils/storage'

type Theme = 'light' | 'dark'

const STORAGE_KEY = storageKey('theme')
const THEME_ATTRIBUTE = 'data-omuso-theme'
const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)'

function isTheme(value: string | null): value is Theme {
	return value === 'light' || value === 'dark'
}
type ThemeContextType = {
	theme: Theme
	setTheme: (theme: Theme) => void
	toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

function getSystemTheme(): Theme {
	if (typeof window === 'undefined') return 'light'
	return window.matchMedia(DARK_SCHEME_QUERY).matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	// Only set when the user picks a theme; until then we follow the system.
	const [storedTheme, setStoredTheme] = useState<Theme | null>(() => {
		if (typeof window === 'undefined') return null
		const savedTheme = localStorage.getItem(STORAGE_KEY)
		return isTheme(savedTheme) ? savedTheme : null
	})
	const [systemTheme, setSystemTheme] = useState<Theme>(getSystemTheme)
	const theme = storedTheme ?? systemTheme

	useEffect(() => {
		if (typeof window === 'undefined') return

		const media = window.matchMedia(DARK_SCHEME_QUERY)
		const handleChange = () => setSystemTheme(media.matches ? 'dark' : 'light')

		media.addEventListener('change', handleChange)
		return () => media.removeEventListener('change', handleChange)
	}, [])

	useEffect(() => {
		if (typeof window !== 'undefined') {
			document.documentElement.setAttribute(THEME_ATTRIBUTE, theme)
		}
	}, [theme])

	const setTheme = useCallback((nextTheme: Theme) => {
		localStorage.setItem(STORAGE_KEY, nextTheme)
		setStoredTheme(nextTheme)
	}, [])

	const toggleTheme = useCallback(() => {
		setTheme(theme === 'light' ? 'dark' : 'light')
	}, [setTheme, theme])

	const value = useMemo(
		() => ({ theme, setTheme, toggleTheme }),
		[theme, setTheme, toggleTheme],
	)

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
	const context = useContext(ThemeContext)
	if (context === undefined) {
		throw new Error('useTheme must be used within a ThemeProvider')
	}
	return context
}
