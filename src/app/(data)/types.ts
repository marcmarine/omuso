export interface Chapter {
  title: string
  subtitle: string
  paragraphs: string[]
}

export interface Book {
  title: string
  language: string
  author: string
  items: Chapter[]
}

export interface Author {
  name: string
  image: string
  items: string[]
}
