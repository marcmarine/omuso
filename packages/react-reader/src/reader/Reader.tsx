import { type ReaderValue, useReader } from '../providers/BookContextProvider'
import SectionContent from './Content'
import Cover from './Cover'
import Layout from './Layout'
import Root, { type ReaderRootProps } from './Root'
import Search from './Search'
import TableOfContents from './TableOfContents'

export interface ReaderProps extends Omit<ReaderRootProps, 'children'> {
	contentComponent?: React.ComponentType<{ context: ReaderValue }>
}

/**
 * The complete reader: a `Root` with the default layout.
 */
export default function Reader({ contentComponent, ...props }: ReaderProps) {
	return (
		<Root {...props}>
			<DefaultLayout contentComponent={contentComponent} />
		</Root>
	)
}

function DefaultLayout({
	contentComponent: ContentComponent,
}: Pick<ReaderProps, 'contentComponent'>) {
	const context = useReader()
	const { currentSection } = context.state.session

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
