import Authors, {
  Skeleton as AuthorsSkeleton
} from '@/app/(components)/authors'
import Books, { Skeleton as BooksSkeleton } from '@/app/(components)/books'
import Chapters, {
  Skeleton as ChaptersSkeleton
} from '@/app/(components)/chapters'
import Chapter, {
  Skeleton as ChapterSkeleton
} from '@/app/(components)/chapter'
import {
  getAuthorItems,
  getAuthors,
  getBookItems,
  getChapter
} from '@/app/(services)'
import { Suspense } from 'react'
import Divider from '@/app/(components)/divider'

export default async function AuthorPage({
  params
}: {
  params: { authorSlug: string; item: string; detail: string }
}) {
  const bookSlug = params.item
  const chapterSlug = params.detail
  const authorSlug = params.authorSlug
  const authorsData = getAuthors()
  const itemsData = getAuthorItems(authorSlug)
  const chaptersData = getBookItems(bookSlug)
  const chapterData = getChapter(bookSlug, chapterSlug)

  return (
    <div className="container">
      <Suspense fallback={<AuthorsSkeleton />}>
        <Authors promise={authorsData} selected={authorSlug} />
      </Suspense>
      <Divider />
      <Suspense fallback={<BooksSkeleton />}>
        <Books promise={itemsData} selected={bookSlug} />
      </Suspense>
      <Divider />
      <Suspense fallback={<ChaptersSkeleton />}>
        <Chapters
          promise={chaptersData}
          authorSlug={authorSlug}
          bookSlug={bookSlug}
          selected={chapterSlug}
        />
      </Suspense>
      <Divider />
      <Suspense fallback={<ChapterSkeleton />}>
        <Chapter promise={chapterData} />
      </Suspense>
      <Divider />
      <Suspense fallback={<ChaptersSkeleton />}>
        <Chapters
          promise={chaptersData}
          authorSlug={authorSlug}
          bookSlug={bookSlug}
          selected={chapterSlug}
        />
      </Suspense>
    </div>
  )
}
