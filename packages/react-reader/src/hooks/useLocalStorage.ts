import React from 'react'
import { storageKey } from '../utils/storage'

function useLocalStorage<T>(
	name: string,
	initialValue: T,
): [T, (value: T) => void] {
	const key = storageKey(name)
	const [storedValue, setStoredValue] = React.useState<T>(() => {
		try {
			const item = window.localStorage.getItem(key)
			return item ? JSON.parse(item) : initialValue
		} catch (error) {
			console.error(error)
			return initialValue
		}
	})

	const setValue = React.useCallback(
		(value: T) => {
			try {
				setStoredValue((previousValue) => {
					const previousSerialized = JSON.stringify(previousValue)
					const nextSerialized = JSON.stringify(value)

					if (previousSerialized === nextSerialized) {
						return previousValue
					}

					window.localStorage.setItem(key, nextSerialized)
					return value
				})
			} catch (error) {
				console.error(error)
			}
		},
		[key],
	)

	return [storedValue, setValue]
}

export default useLocalStorage
