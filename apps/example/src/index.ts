import { networkInterfaces } from 'node:os'
import { serve } from 'bun'
import index from './index.html'

const hostname = '0.0.0.0'
const preferredPort = Number(process.env.PORT ?? 3000)
const isProduction = process.env.NODE_ENV === 'production'
const maxPortAttempts = 20

let server: ReturnType<typeof serve> | undefined
let activePort = preferredPort

for (let offset = 0; offset < maxPortAttempts; offset++) {
	const port = preferredPort + offset

	try {
		server = serve({
			hostname,
			port,
			routes: {
				'/*': index,
			},
			development: !isProduction && {
				hmr: true,
				console: true,
			},
		})
		activePort = port
		break
	} catch (error) {
		const code =
			typeof error === 'object' && error && 'code' in error
				? String((error as { code?: unknown }).code)
				: ''
		const message = error instanceof Error ? error.message : String(error)

		if (code !== 'EADDRINUSE' && !message.includes('EADDRINUSE')) {
			throw error
		}
	}
}

if (!server) {
	throw new Error(
		`No free port found in range ${preferredPort}-${preferredPort + maxPortAttempts - 1}. Set PORT to a free port and retry.`,
	)
}

const lanIp = Object.values(networkInterfaces())
	.flat()
	.find((net) => net?.family === 'IPv4' && !net.internal)?.address

console.log(`🚀 Server running at ${server.url}`)
console.log(`🔗 Local: http://localhost:${activePort}`)

if (lanIp) {
	console.log(`📱 Mobile/LAN: http://${lanIp}:${activePort}`)
}
