import Link from 'next/link'
import { Chapter } from '../../data/types'
import { slugify } from '@/utils/slugify'

export function Skeleton() {
  return (
    <ul className="animate-pulse gap-5 inline-flex flex-wrap justify-center px-5">
      {([...Array(4)] as number[]).map(index => (
        <li
          key={index}
          className="w-20 h-6 bg-neutral-300 dark:bg-neutral-700 blur-sm"
        />
      ))}
    </ul>
  )
}

export default async function Books({
  promise,
  authorSlug,
  bookSlug,
  selected
}: {
  promise: Promise<Chapter[] | undefined>
  authorSlug: string
  bookSlug: string
  selected?: string
}) {
  const chapters = await promise
  return (
    <nav className="px-5">
      <ul className="inline-flex gap-5 flex-wrap justify-center">
        {chapters?.map(({ title }) => {
          const chapterSlug = slugify(title)
          const isSelected = chapterSlug === selected
          return (
            <li key={title}>
              <Link
                href={`/${authorSlug}/${bookSlug}/${chapterSlug}`}
                className={`${isSelected ? 'underline' : 'hover:opacity-60'}`}
              >
                {title}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
