import { describe, expect, test } from 'bun:test'
import * as index from '../src/index'

describe('index', () => {
	test('should have all expected exports', () => {
		const exportedKeys = Object.keys(index)
		expect(exportedKeys).toContain('omuso')
		expect(exportedKeys).toContain('parse')
	})
})
