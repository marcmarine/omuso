import { createContext, type ElementType, useContext, useMemo } from 'react'

type RoutingStrategyValue = {
	Component?: ElementType
}

const RoutingContext = createContext<RoutingStrategyValue>({
	Component: 'a',
})

export const useRoutingStrategy = () => useContext(RoutingContext)

export function RoutingProvider({
	linkComponent,
	children,
}: {
	linkComponent?: ElementType
	children: React.ReactNode
}) {
	const value = useMemo(() => ({ Component: linkComponent }), [linkComponent])

	return (
		<RoutingContext.Provider value={value}>{children}</RoutingContext.Provider>
	)
}
