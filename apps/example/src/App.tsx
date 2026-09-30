import { Reader } from '@omuso/react-reader'
import * as ctx from './omuso.config'

import './index.css'

export function App() {
	return <Reader {...ctx} language="en" basePath="/reader" />
}

export default App
