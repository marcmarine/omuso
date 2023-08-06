import { slugify } from '@/utils/slugify'
import { Book } from '../(data)/types'
import Link from 'next/link'

export function Skeleton() {
  return (
    <ul className="animate-pulse inline-flex flex-wrap justify-center px-5">
      <li className="w-40 h-56 bg-neutral-300 dark:bg-neutral-700" />
    </ul>
  )
}

export default async function Books({
  promise,
  selected
}: {
  promise: Promise<Book[]>
  selected?: string
}) {
  const books = await promise
  return (
    <nav className="px-5">
      <ul className="inline-flex flex-wrap justify-center">
        {books.map(item => {
          let authorSlug = slugify(item.author),
            bookSlug = slugify(item.title),
            isSelected = bookSlug === selected
          return (
            <li key={item.title}>
              <Link
                href={`/${authorSlug}/${bookSlug}`}
                className={`w-40 h-56 hover:bg-neutral-700 hover:bg-opacity-20 bg-neutral-300 dark:bg-neutral-800 flex justify-center pt-16 border outline -outline-offset-4 outline-1 ${
                  isSelected
                    ? 'border-neutral-800 outline-neutral-700'
                    : 'border-transparent outline-transparent'
                }`}
              >
                {item.title}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
