import { slugify } from '@/utils/slugify'
import Image from 'next/image'
import Link from 'next/link'
import { Author } from '../../data/types'

export function Skeleton() {
  return (
    <ul className="animate-pulse inline-flex flex-wrap justify-center px-5">
      <li className="w-[118px] h-[154px] bg-neutral-300 dark:bg-neutral-700 blur-sm" />
    </ul>
  )
}

export default async function Authors({
  promise,
  selected
}: {
  promise: Promise<Author[]>
  selected?: string
}) {
  const authors = await promise

  return (
    <nav className="px-5">
      <ul className="inline-flex flex-wrap justify-center">
        {authors.map(author => {
          let authorSlug = slugify(author.name),
            isSelected = authorSlug === selected
          return (
            <li key={author.name} className="rounded">
              <Link
                href={`/${authorSlug}`}
                className={`flex hover:bg-neutral-700 hover:bg-opacity-20 flex-col gap-3 p-2 items-center border outline -outline-offset-4 outline-1 ${
                  isSelected
                    ? 'border-neutral-800 outline-neutral-700'
                    : 'border-transparent outline-transparent'
                }`}
              >
                <Image
                  width={100}
                  height={100}
                  src={author.image}
                  className="rounded-full"
                  alt={author.name}
                />
                {author.name}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
