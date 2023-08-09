import { Book, Author } from './types'
import * as La_Iliada from './la_iliada.json'

export const books: Book[] = [
  {
    ...La_Iliada
  }
]

export const authors: Author[] = [
  {
    name: 'Homero',
    items: ['La Ilíada'],
    image: '/homero.jpg'
  }
]
