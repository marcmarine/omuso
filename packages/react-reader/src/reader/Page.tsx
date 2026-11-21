import { useEffect, useRef } from 'react'
import { useReader } from '../providers/BookContextProvider'

export default function Page({ children }: { children: React.ReactNode }) {
	const path = useReader().state.session.currentSection?.path
	const ref = useRef<HTMLDivElement>(null)

	// Back to the top on every page change, whatever is rendered inside.
	// biome-ignore lint/correctness/useExhaustiveDependencies: runs on page change
	useEffect(() => {
		ref.current?.scrollTo({ top: 0 })
	}, [path])

	return (
		<div ref={ref} className="om-page">
			{children}
		</div>
	)
}
