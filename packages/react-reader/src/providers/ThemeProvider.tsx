import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'theme'
const THEME_ATTRIBUTE = 'data-omuso-theme'

function isTheme(value: string | null): value is Theme {
	return value === 'light' || value === 'dark'
}
type ThemeContextType = {
	theme: Theme
	setTheme: (theme: Theme) => void
	toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [theme, setTheme] = useState<Theme>(() => {
		if (typeof window !== 'undefined') {
			const savedTheme = localStorage.getItem(STORAGE_KEY)
			if (isTheme(savedTheme)) return savedTheme

			if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
				return 'dark'
			}
		}
		return 'light'
	})

	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem(STORAGE_KEY, theme)
			document.documentElement.setAttribute(THEME_ATTRIBUTE, theme)
		}
	}, [theme])

	const toggleTheme = useCallback(() => {
		setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'))
	}, [])

	const value = useMemo(
		() => ({ theme, setTheme, toggleTheme }),
		[theme, toggleTheme],
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
