import { type ReaderValue, useReader } from '../providers/BookContextProvider'
import SectionContent from './Content'
import Cover from './Cover'
import Layout from './Layout'
import Page from './Page'
import Root, { type ReaderRootProps } from './Root'
import Search from './Search'
import Sidebar from './Sidebar'
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

	return (
		<Layout>
			<Sidebar side="left">
				<TableOfContents />
			</Sidebar>
			<Page>
				<Cover />
				{ContentComponent ? (
					currentSection && <ContentComponent context={context} />
				) : (
					<SectionContent />
				)}
			</Page>
			<Sidebar side="right">
				<Search />
			</Sidebar>
		</Layout>
	)
}
