import { getAuthorItems, getAuthors, getBookItems } from '@/app/(services)'
import { Suspense } from 'react'
import Authors, { Skeleton as AuthorsSkeleton } from '@/app/components/authors'
import Books, { Skeleton as BooksSkeleton } from '@/app/components/books'
import Chapters, {
  Skeleton as ChaptersSkeleton
} from '@/app/components/chapters'
import { Skeleton } from '@/app/components/chapter'
import Divider from '@/app/components/divider'

export default async function AuthorPage({
  params
}: {
  params: { authorSlug: string; item: string }
}) {
  const bookSlug = params.item
  const authorSlug = params.authorSlug
  const authorsData = getAuthors()
  const itemsData = getAuthorItems(authorSlug)
  const chaptersData = getBookItems(bookSlug)

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
        />
      </Suspense>
    </div>
  )
}
