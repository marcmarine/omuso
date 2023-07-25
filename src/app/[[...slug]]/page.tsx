import { bookListByAuthor } from '@/app/(data)/bookListByAuthor'
import { bookByTitle } from '@/app/(data)/bookByTitle'
import Navigation from './navigation'
import Chapter from './chapter'
import { slugify } from '@/utils/slugify'

const authorList = Object.keys(bookListByAuthor)

export default function Home({ params }: { params: { slug: string[] } }) {
  const { slug: path } = params

  const [author, book, chapterSlug] = path ?? []
  const chaptersList = bookByTitle[book]?.chapters.map(chaprer => chaprer.title)
  const chapters = bookByTitle[book]?.chapters
  const chapter =
    chapters?.find(({ title }) => slugify(title) === chapterSlug) ??
    bookByTitle[book]?.chapters[0]

  const currentChapterIndex = chaptersList?.findIndex(
    chapter => slugify(chapter) === chapterSlug
  )

  const nextChapter =
    chaptersList?.[currentChapterIndex >= 1 ? currentChapterIndex + 1 : 1]
  const previousChapter = chaptersList?.[currentChapterIndex - 1]

  return (
    <>
      <nav className="flex flex-col gap-5 mb-5 px-5">
        <Navigation list={authorList} selected={author} />
        <Navigation
          list={bookListByAuthor[author]}
          selected={book}
          parent1={author}
        />
        <Navigation
          parent1={author}
          parent2={book}
          list={chaptersList}
          selected={chapterSlug}
        />
      </nav>
      <Chapter data={chapter} />
      <nav className="p-5">
        <Navigation
          parent1={author}
          parent2={book}
          list={[previousChapter, nextChapter]}
          selected={chapterSlug}
        />
      </nav>
    </>
  )
}
