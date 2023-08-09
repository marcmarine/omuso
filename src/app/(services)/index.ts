import { Author, Book, Chapter } from '../../data/types'

const dev = process.env.NODE_ENV !== 'production'
const baseUrl = dev ? 'http://localhost:3000' : 'https://omu.so'

export async function getAuthors(): Promise<Author[]> {
  const response = await fetch(`${baseUrl}/api/authors`)
  console.log(response.status)
  if (!response.ok) {
    throw new Error('Failed to fetch data')
  }
  return response.json()
}

export async function getAuthor(slug: string): Promise<Author> {
  const response = await fetch(`${baseUrl}/api/authors/${slug}`)
  if (!response.ok) {
    throw new Error('Failed to fetch data')
  }

  return response.json()
}

export async function getAuthorItems(slug: string): Promise<Book[]> {
  const response = await fetch(`${baseUrl}/api/authors/${slug}/items`)
  if (!response.ok) {
    throw new Error('Failed to fetch data')
  }

  return response.json()
}

export async function getBook(slug: string): Promise<Book> {
  const response = await fetch(`${baseUrl}/api/books/${slug}`)
  if (!response.ok) {
    throw new Error('Failed to fetch data')
  }

  return response.json()
}

export async function getBookItems(slug: string): Promise<Chapter[]> {
  const response = await fetch(`${baseUrl}/api/books/${slug}/items`)
  if (!response.ok) {
    throw new Error('Failed to fetch data')
  }

  return response.json()
}

export async function getChapter(
  bookSlug: string,
  chapterSlug: string
): Promise<Chapter> {
  const response = await fetch(
    `${baseUrl}/api/books/${bookSlug}/${chapterSlug}`
  )
  if (!response.ok) {
    throw new Error('Failed to fetch data')
  }

  return response.json()
}
