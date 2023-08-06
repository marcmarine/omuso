import { Suspense } from 'react'
import Authors, { Skeleton as AuthorsSkeleton } from './(components)/authors'
import { getAuthors } from './(services)'

export default async function Home() {
  const authorsData = getAuthors()

  return (
    <Suspense fallback={<AuthorsSkeleton />}>
      <Authors promise={authorsData} />
    </Suspense>
  )
}
