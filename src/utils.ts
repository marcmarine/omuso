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

		let sectionCount = 0
		for (const item of parent.content) {
			if (item.type === 'section') {
				sectionCount++
			}
		}

		const path = this.createPath(parent, sectionCount)

		const sectionWithPath = {
			...section,
			path,
		}

		parent.content.push(sectionWithPath)
		this.sections.push(sectionWithPath)
	}

	addContentToCurrentParent(content: Paragraph): void {
		const parent = this.getCurrentParent()
		const contentCount = parent.content.length
		const path = this.createPath(parent, contentCount, '#')

		const contentWithPath = {
			...content,
			path,
		}

		parent.content.push(contentWithPath)
	}

	private createPath(
		parent: Section | Root,
		index: number,
		separator: string = '.',
	): string {
		if (parent.type === 'root') {
			return `${separator === '.' ? '' : separator}${index + 1}`
		} else {
			return `${parent.path}${separator}${index + 1}`
		}
	}
}
