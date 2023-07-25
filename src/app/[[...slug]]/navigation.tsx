import { slugify } from '@/utils/slugify'
import Image from 'next/image'
import Link from 'next/link'

interface ListProps {
  list: string[]
  parent1?: string
  parent2?: string
  selected?: string
}

export default function Navigation({
  list,
  parent1,
  parent2,
  selected
}: ListProps) {
  const isAuthor = !Boolean(parent1)
  const isBook = Boolean(parent1) && !Boolean(parent2)
  const isSelected = (item: string): boolean => selected === slugify(item)
  if (!list?.length) return <></>
  const filteredList = list.filter(item => item)
  return (
    <ul
      className={`inline-flex flex-wrap justify-center ${
        isBook ? 'gap-5' : 'gap-4'
      }`}
    >
      {filteredList?.map(item => (
        <li
          key={item}
          className={`rounded ${isBook ? '' : isAuthor ? '' : ''}`}
        >
          <Link
            href={
              parent1
                ? parent2
                  ? `${slugify(parent1)}/${slugify(parent2)}/${slugify(item)}`
                  : `${slugify(parent1)}/${slugify(item)}`
                : slugify(item)
            }
            className={`flex hover:bg-neutral-700 hover:bg-opacity-20 ${
              isBook
                ? 'w-40 h-56 bg-neutral-800 flex justify-center pt-16'
                : isAuthor
                ? 'flex flex-col gap-3 p-2 items-center'
                : ''
            }  border outline -outline-offset-4 outline-1 ${
              isSelected(item)
                ? ' border-neutral-800 outline-neutral-700'
                : 'border-transparent outline-transparent'
            }`}
          >
            {isAuthor && (
              <Image
                width={100}
                height={100}
                src={`/${slugify(item).toLocaleLowerCase()}.jpg`}
                className="rounded-full"
                alt={item}
              />
            )}
            {item?.replace('_', ' ').replace('_', ' ')}
          </Link>
        </li>
      ))}
    </ul>
  )
}
