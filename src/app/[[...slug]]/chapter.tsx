import { Chapter } from '../(data)/types'

interface ChapterProps {
  data?: Chapter
}
export default function Chapter({ data }: ChapterProps) {
  if (!data) return <></>
  const { subtitle, paragraphs } = data
  return (
    <div className="text-justify mx-auto max-w-2xl space-y-3 px-5">
      <h2 className="text-2xl text-center">{subtitle}</h2>
      {paragraphs.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </div>
  )
}
