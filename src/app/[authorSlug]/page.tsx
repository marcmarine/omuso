import { getAuthorItems, getAuthors } from '../(services)'
import Authors, { Skeleton as AuthorsSkeleton } from '../(components)/authors'
import { Suspense } from 'react'
import Books, { Skeleton as BooksSkeleton } from '../(components)/books'
import Divider from '../(components)/divider'

export default async function AuthorPage({
  params
}: {
  params: { authorSlug: string }
}) {
  const authorSlug = params.authorSlug
  const authorsData = getAuthors()
  const itemsData = getAuthorItems(authorSlug)

  return (
    <div className="container">
      <Suspense fallback={<AuthorsSkeleton />}>
        <Authors promise={authorsData} selected={authorSlug} />
      </Suspense>
      <Divider />
      <Suspense fallback={<BooksSkeleton />}>
        <Books promise={itemsData} />
      </Suspense>
    </div>
  )
}
