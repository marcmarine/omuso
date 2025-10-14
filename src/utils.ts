import type { Paragraph, Root, Section } from './types'

export class SectionStack {
	private sections: Section[] = []
	private root: Root

	constructor(root: Root) {
		this.root = root
	}

	getCurrentParent(): Section | Root {
		return this.sections[this.sections.length - 1] || this.root
	}

	pushSection(section: Section): void {
		while (
			this.sections.length > 0 &&
			(this.sections[this.sections.length - 1] as Section).depth >=
				section.depth
		) {
			this.sections.pop()
		}

		const parent = this.getCurrentParent()
		parent.content.push(section)

		this.sections.push(section)
	}

	addContentToCurrentParent(content: Section | Paragraph): void {
		const parent = this.getCurrentParent()
		parent.content.push(content)
	}
}
