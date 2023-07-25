export interface Chapter {
  title: string
  subtitle: string
  paragraphs: string[]
}

export interface Book {
  title: string
  language: string
  author: string
  chapters: Chapter[]
}
