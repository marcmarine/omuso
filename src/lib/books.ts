import { Book, Chapter } from '@/data/types'
import { books } from '@/data/database'
import { slugify } from '@/utils/slugify'

export async function getBook(slug: string): Promise<Book | undefined> {
  const book = books.find(book => {
    const bookTitle = new RegExp(slugify(book.title), 'i')
    return bookTitle.test(slug)
  })
  if (!book) return
  return book
}

export async function getBookItems(
  slug: string
): Promise<Chapter[] | undefined> {
  const book = books.find(book => slugify(book.title) === slug)

  if (!book) return

  return book.items
}

export async function getChapter(
  bookSlug: string,
  chapterSlug: string
): Promise<Chapter | undefined> {
  const book = books.find(book => slugify(book.title) === bookSlug)

  if (!book) return
  const chapter = book.items.find(
    chapter => slugify(chapter.title) === chapterSlug
  )
  if (!chapter) return
  return chapter
}
