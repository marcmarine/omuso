import { createContext } from 'omuso'
import ca from './content/ca.md' with { type: 'text' }
import en from './content/en.md' with { type: 'text' }
import es from './content/es.md' with { type: 'text' }
import grc from './content/grc.md' with { type: 'text' }

const context = createContext().init({
	markdowns: { en, es, grc, ca },
	slugStyle: 'wiki',
})

export { context }
