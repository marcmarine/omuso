import { Chapter } from '../../data/types'

export function Skeleton() {
  return (
    <div className="animate-pulse text-justify w-full mx-auto max-w-2xl space-y-5 px-5">
      <div className="mx-auto w-80 h-7 bg-neutral-300 dark:bg-neutral-700 blur-sm" />
      {([...Array(10)] as number[]).map(index => (
        <p key={index} className="space-y-2">
          {[...Array(4)].map(index => (
            <span
              key={index}
              className="block w-full h-4 bg-neutral-300 dark:bg-neutral-700 blur-sm"
            />
          ))}
        </p>
      ))}
    </div>
  )
}

export default async function ChapterDetail({
  promise
}: {
  promise: Promise<Chapter | undefined>
}) {
  const chapter = await promise

  return (
    <div className="text-justify mx-auto max-w-2xl space-y-3 px-5">
      <h2 className="text-2xl text-center">{chapter?.subtitle}</h2>
      {chapter?.paragraphs.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </div>
  )
}
