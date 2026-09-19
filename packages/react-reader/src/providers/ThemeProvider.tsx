import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'
type ThemeContextType = {
	theme: Theme
	setTheme: (theme: Theme) => void
	toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [theme, setTheme] = useState<Theme>(() => {
		if (typeof window !== 'undefined') {
			const savedTheme = localStorage.getItem('theme') as Theme | null
			if (savedTheme) return savedTheme

			if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
				return 'dark'
			}
		}
		return 'light'
	})

	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('theme', theme)

			const readerElement = document.querySelector('.omuso-reader')
			if (readerElement) {
				readerElement.classList.remove('light', 'dark')
				readerElement.classList.add(theme)
			}
		}
	}, [theme])

	const toggleTheme = () => {
		setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'))
	}

	return (
		<ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	)
}

export function useTheme() {
	const context = useContext(ThemeContext)
	if (context === undefined) {
		throw new Error('useTheme must be used within a ThemeProvider')
	}
	return context
}
