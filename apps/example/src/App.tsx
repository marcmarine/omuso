import { Reader } from '@omuso/react-reader'
import * as ctx from './omuso.config'

import '@omuso/react-reader/styles.css'
import './index.css'

export function App() {
	return <Reader {...ctx} language="en" />
}

export default App
