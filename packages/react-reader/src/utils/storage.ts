/**
 * Namespaces a local-storage key so the reader does not clash with the
 * host site.
 */
export function storageKey(name: string): string {
	return `omuso:${name}`
}
