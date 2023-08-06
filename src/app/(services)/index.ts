import { Author, Book, Chapter } from '../(data)/types'

export async function getAuthors() {
  const response = await fetch('http://localhost:3000/api/authors', {
    cache: 'force-cache'
  })
  if (!response.ok) {
    throw new Error('Failed to fetch data')
  }
  const authors = (await response.json()) as Author[]
  return authors
}

export async function getAuthor(slug: string) {
  const response = await fetch(`http://localhost:3000/api/authors/${slug}`, {
    cache: 'force-cache'
  })
  if (!response.ok) {
    throw new Error('Failed to fetch data')
  }
  const author = (await response.json()) as Author
  return author
}

export async function getAuthorItems(slug: string) {
  const response = await fetch(
    `http://localhost:3000/api/authors/${slug}/items`,
    {
      cache: 'force-cache'
    }
  )
  if (!response.ok) {
    throw new Error('Failed to fetch data')
  }
  const items = (await response.json()) as Book[]
  return items
}

export async function getBook(slug: string) {
  const response = await fetch(`http://localhost:3000/api/books/${slug}`, {
    cache: 'force-cache'
  })
  if (!response.ok) {
    throw new Error('Failed to fetch data')
  }
  const book = (await response.json()) as Book
  return book
}

export async function getBookItems(slug: string) {
  const response = await fetch(
    `http://localhost:3000/api/books/${slug}/items`,
    {
      cache: 'force-cache'
    }
  )
  if (!response.ok) {
    throw new Error('Failed to fetch data')
  }
  const bookItems = (await response.json()) as Chapter[]
  return bookItems
}

export async function getChapter(bookSlug: string, chapterSlug: string) {
  const response = await fetch(
    `http://localhost:3000/api/books/${bookSlug}/${chapterSlug}`,
    {
      cache: 'force-cache'
    }
  )
  if (!response.ok) {
    throw new Error('Failed to fetch data')
  }
  const chapter = (await response.json()) as Chapter
  return chapter
}
