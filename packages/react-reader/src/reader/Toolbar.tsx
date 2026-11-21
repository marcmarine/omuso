import LanguageSelect from './LanguageSelect'
import Navigation from './Navigation'
import SearchToggle from './SearchToggle'
import ThemeToggle from './ThemeToggle'
import TocToggle from './TocToggle'

export default function Toolbar({ children }: { children?: React.ReactNode }) {
	return (
		<footer className="om-toolbar">
			{children ?? (
				<>
					<div className="om-toolbar__group">
						<TocToggle />
						<LanguageSelect />
					</div>
					<div className="om-toolbar__group">
						<ThemeToggle />
						<SearchToggle />
						<Navigation />
					</div>
				</>
			)}
		</footer>
	)
}
