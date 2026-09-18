import { createContext, type ElementType, useContext } from 'react'

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
	return (
		<RoutingContext.Provider value={{ Component: linkComponent }}>
			{children}
		</RoutingContext.Provider>
	)
}
