import { Reader } from '@omuso/react-reader'
import { Link } from 'wouter'
import * as ctx from './omuso.config'

import '@omuso/react-reader/styles.css'
import './index.css'

export function App() {
	return (
		<Reader {...ctx} language="en" location={location} linkComponent={Link} />
	)
}

export default App
