import type { BookContext } from 'omuso'
import { useLayoutEffect } from 'react'
import SectionContent from '../content/ReaderContent'
import {
	BookContextProvider,
	type Context,
	useBookContext,
} from '../providers/BookContextProvider'
import { LayoutProvider } from '../providers/LayoutProvider'
import { RoutingProvider } from '../providers/RoutingProvider'
import { ThemeProvider } from '../providers/ThemeProvider'
import Cover from './Cover'
import Layout from './Layout'
import Search from './Search'
import TableOfContents from './TableOfContents'

export interface ReaderProps {
	location: Partial<Location>
	language: string
	linkComponent?: React.ElementType
	maxDepth?: number
	contentComponent?: React.ComponentType<{ context: Context }>
	omitSections?: Array<string>
	/**
	 * The `BookContext` backing this reader, created via
	 * `createContext().init({...})` from the `omuso` package.
	 */
	context: BookContext
}

function Reader({ location, contentComponent: ContentComponent }: ReaderProps) {
	const context = useBookContext()
	const { session, navigate } = context
	const { currentSection } = session

	useLayoutEffect(() => {
		navigate(location.pathname as string)
	}, [location.pathname, navigate])

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

function withProviders<P extends ReaderProps>(
	WrappedComponent: React.ComponentType<P>,
) {
	return (props: P) => {
		return (
			<BookContextProvider
				defaultLanguage={props.language}
				context={props.context}
			>
				<RoutingProvider linkComponent={props.linkComponent}>
					<LayoutProvider
						language={props.language}
						maxDepth={props.maxDepth}
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
