export interface LangProps {
  language: 'pt-BR' | 'en' | string
}

export type ExtractObjectPath<T, Key extends keyof T> = Key extends string
  ? T[Key] extends Record<string, any>
    ? `${Key}.${ExtractObjectPath<T[Key], Extract<keyof T[Key], string>>}`
    : `${Key}`
  : never

export type Paths<T> = ExtractObjectPath<T, keyof T>

export type ValueOfLang<T, P extends Paths<T>> = P extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? Rest extends Paths<T[Key]>
      ? ValueOfLang<T[Key], Rest>
      : never
    : never
  : P extends keyof T
  ? T[P]
  : never