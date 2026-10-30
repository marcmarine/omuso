import type { BookContext } from 'omuso'
import { useEffect } from 'react'
import {
	BookContextProvider,
	type Context,
	useBookContext,
} from '../providers/BookContextProvider'
import { LayoutProvider } from '../providers/LayoutProvider'
import { RoutingProvider } from '../providers/RoutingProvider'
import { ThemeProvider } from '../providers/ThemeProvider'
import SectionContent from './Content'
import Cover from './Cover'
import Layout from './Layout'
import Search from './Search'
import TableOfContents from './TableOfContents'

export interface ReaderProps {
	location?: Partial<Location>
	language: string
	basePath?: string
	linkComponent?: React.ElementType
	/**
	 * The deepest section level shown as a page, counted in path levels
	 * (`'1'` → 1, `'1.2'` → 2) like `maxNavigationDepth` in `omuso`. Deeper
	 * sections are rendered inline within their page. Keep the context's
	 * `maxNavigationDepth` at or below it, or prev/next lead to sections
	 * already shown inline.
	 */
	maxPageDepth?: number
	contentComponent?: React.ComponentType<{ context: Context }>
	omitSections?: Array<string>
	/**
	 * The `BookContext` backing this reader, created via
	 * `createContext().init({...})` from the `omuso` package.
	 */
	context: BookContext
}

function Reader({ contentComponent: ContentComponent }: ReaderProps) {
	const context = useBookContext()
	const { session } = context
	const { currentSection } = session

	const mainContent = !currentSection ? (
		<Cover />
	) : ContentComponent ? (
		<ContentComponent context={context} />
	) : (
		<SectionContent />
	)

	return (
		<Layout>
			<TableOfContents />
			{mainContent}
			<Search />
		</Layout>
	)
}

function useDepthWarning(context: BookContext, maxPageDepth = Infinity) {
	const navigationDepth = context.maxNavigationDepth ?? Infinity

	useEffect(() => {
		if (navigationDepth <= maxPageDepth) return
		console.warn(
			`maxNavigationDepth (${navigationDepth}) is deeper than the reader's maxPageDepth (${maxPageDepth}): prev/next will lead to sections already rendered inline.`,
		)
	}, [navigationDepth, maxPageDepth])
}

function withProviders<P extends ReaderProps>(
	WrappedComponent: React.ComponentType<P>,
) {
	return (props: P) => {
		useDepthWarning(props.context, props.maxPageDepth)

		return (
			<BookContextProvider
				defaultLanguage={props.language}
				context={props.context}
				location={props.location}
				basePath={props.basePath}
			>
				<RoutingProvider linkComponent={props.linkComponent}>
					<LayoutProvider
						language={props.language}
						maxPageDepth={props.maxPageDepth}
						omitSections={props.omitSections}
					>
						<ThemeProvider>
							<WrappedComponent {...props} />
						</ThemeProvider>
					</LayoutProvider>
				</RoutingProvider>
			</BookContextProvider>
		)
	}
}

export default withProviders(Reader)
