import Link from 'next/link'
import { Book } from '../(data)/types'
import Navigation from './navigation'
import { slugify } from '@/utils/slugify'

interface BookProps {
  data: Book
}

export default function Book({ data }: BookProps) {
  if (!data) return <></>
  const { title, chapters } = data
  return (
    <div>
      <h1>
        <Link href={slugify(title)}>{title}</Link>
      </h1>
      <Navigation
        parent1={title}
        list={chapters?.map(chaprer => chaprer.title)}
      />
    </div>
  )
}
