import { Author, Book } from '@/data/types'
import { authors, books } from '@/data/database'
import { slugify } from '@/utils/slugify'

export async function getAuthors(): Promise<Author[]> {
  return authors
}

export async function getAuthor(slug: string): Promise<Author | undefined> {
  const author = authors.find(author => slugify(author.name) === slug)

  if (!author) return

  return author
}

export async function getAuthorItems(
  slug: string
): Promise<Book[] | undefined> {
  const authorItems = books.filter(book => slugify(book.author) === slug)

  if (!authorItems) return

  return authorItems
}
