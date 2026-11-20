import { Reader } from '@omuso/react-reader'
import { book } from './omuso.config'

import './index.css'

export function App() {
	return <Reader book={book} defaultLanguage="en" basePath="/reader" />
}

export default App
