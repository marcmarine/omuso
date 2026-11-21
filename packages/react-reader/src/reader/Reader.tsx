import { type ReaderValue, useReader } from '../providers/BookContextProvider'
import Cover from './Cover'
import Header from './Header'
import Layout from './Layout'
import Page from './Page'
import Root, { type ReaderRootProps } from './Root'
import Sidebar from './Sidebar'
import Toolbar from './Toolbar'

export interface ReaderProps extends Omit<ReaderRootProps, 'children'> {
	contentComponent?: React.ComponentType<{ context: ReaderValue }>
}

/**
 * The complete reader: a `Root` with the default layout.
 */
export default function Reader({ contentComponent, ...props }: ReaderProps) {
	return (
		<Root {...props}>
			{contentComponent && (
				<CustomContentLayout contentComponent={contentComponent} />
			)}
		</Root>
	)
}

function CustomContentLayout({
	contentComponent: ContentComponent,
}: {
	contentComponent: NonNullable<ReaderProps['contentComponent']>
}) {
	const context = useReader()
	const { currentSection } = context.state.session

	return (
		<Layout>
			<Header />
			<Sidebar side="left" />
			<Page>
				<Cover />
				{currentSection && <ContentComponent context={context} />}
			</Page>
			<Sidebar side="right" />
			<Toolbar />
		</Layout>
	)
}
