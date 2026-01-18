import type { Paragraph, Root, Section } from './types'

export class SectionStack {
	private sections: Section[] = []
	private readonly root: Root

	constructor(root: Root) {
		this.root = root
	}

	getCurrentParent(): Section | Root {
		return this.sections.at(-1) ?? this.root
	}

	pushSection(section: Section): void {
		this.popSectionsAtOrDeeperThan(section.depth)

		const parent = this.getCurrentParent()
		const sectionIndex = this.countSectionsIn(parent)

		const sectionWithMetadata = this.enrichWithLocation(
			section,
			parent,
			sectionIndex,
		)

		parent.content.push(sectionWithMetadata)
		this.sections.push(sectionWithMetadata)
	}

	addContentToCurrentParent(content: Paragraph): void {
		const parent = this.getCurrentParent()
		const contentIndex = parent.content.length

		const contentWithMetadata = this.enrichWithLocation(
			content,
			parent,
			contentIndex,
		)

		parent.content.push(contentWithMetadata)
	}

	private popSectionsAtOrDeeperThan(depth: number): void {
		while (
			this.sections.length > 0 &&
			(this.sections.at(-1) as Section).depth >= depth
		) {
			this.sections.pop()
		}
	}

	private countSectionsIn(parent: Section | Root): number {
		return parent.content.filter((item) => item.type === 'section').length
	}

	private enrichWithLocation<T extends Section | Paragraph>(
		item: T,
		parent: Section | Root,
		index: number,
	): T & { path: string; slug: string } {
		const separator = item.type === 'section' ? '.' : '_'
		const path = this.createPath(parent, index, separator)
		const slug = this.createSlug(parent, item, index)

		return { ...item, path, slug }
	}

	private createPath(
		parent: Section | Root,
		index: number,
		separator: string,
	): string {
		const indexStr = `${index + 1}`

		if (parent.type === 'root') {
			return separator === '.' ? indexStr : `${separator}${indexStr}`
		}

		return `${parent.path}${separator}${indexStr}`
	}

	private createSlug(
		parent: Section | Root,
		current: Section | Paragraph,
		index: number,
	): string {
		const suffix =
			current.type === 'section'
				? `/${slugify(current.title)}`
				: `#${index + 1}`

		return parent.type === 'root' ? suffix : `${parent.slug}${suffix}`
	}
}

function slugify(text: string): string {
	return text
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[^\p{L}\p{N}\s.-]/gu, '')
		.trim()
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.replace(/\./g, '-')
}
