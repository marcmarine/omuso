import type * as omuso from 'omuso'
import { createContext, type ReactNode, useContext } from 'react'
import { HeadingElement } from './HeadingElement'
import { ParagraphElement } from './ParagraphElement'
import { SectionIndex } from './SectionIndex'

export type ParagraphProps = {
	paragraph: omuso.Paragraph
	/**
	 * The paragraph's text with its marks and the search highlight applied.
	 */
	children: ReactNode
}

export type HeadingProps = {
	section: omuso.Section
	/**
	 * The heading level, from 1 (the page title) to 6.
	 */
	depth: number
	id?: string
	/**
	 * The section's title with the search highlight applied.
	 */
	children: ReactNode
}

export type SectionIndexProps = {
	sections: Array<omuso.Section>
	query?: string
}

/**
 * Replaces how `Content` renders each kind of node. Keys left out keep the
 * default component.
 */
export type ContentComponents = {
	paragraph?: React.ComponentType<ParagraphProps>
	heading?: React.ComponentType<HeadingProps>
	/**
	 * The list of links to the subsections of a page that doesn't render them
	 * inline.
	 */
	sectionIndex?: React.ComponentType<SectionIndexProps>
}

function DefaultParagraph({ children }: ParagraphProps) {
	return <ParagraphElement value={children} />
}

function DefaultHeading({ depth, id, children }: HeadingProps) {
	return <HeadingElement id={id} depth={depth} value={children} />
}

export const defaultContentComponents: Required<ContentComponents> = {
	paragraph: DefaultParagraph,
	heading: DefaultHeading,
	sectionIndex: SectionIndex,
}

export const ContentComponentsContext = createContext<
	Required<ContentComponents>
>(defaultContentComponents)

export const useContentComponents = () => useContext(ContentComponentsContext)
