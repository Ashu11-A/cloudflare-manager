import Enquirer from 'enquirer'
import { InputQuestionOptions, ListQuestionOptions, PasswordQuestionOptions } from 'inquirer'

interface BasePromptOptions {
  message: string | (() => string) | (() => Promise<string>)
  prefix?: string
  initial?: any
  required?: boolean
  enabled?: boolean | string
  disabled?: boolean | string
  format?(value: string): string | Promise<string>
  result?(value: string): string | Promise<string>
  skip?: ((state: object) => boolean | Promise<boolean>) | boolean
  validate?(value: string): boolean | string | Promise<boolean | string>
  onSubmit?(name: string, value: any, prompt: Enquirer.Prompt): boolean | Promise<boolean>
  onCancel?(name: string, value: any, prompt: Enquirer.Prompt): boolean | Promise<boolean>
  stdin?: NodeJS.ReadStream
  stdout?: NodeJS.WriteStream
}

export interface SnippetPromptOptions extends BasePromptOptions {
  newline?: string
  templates: string[]
}

export enum QuestionTypes {
    Input = 'input',
    List = 'list',
    Password = 'password',
    AutoComplete = 'autoComplete',
    Snippet = 'snippet'
}

export type QuestionProps = 
  | ({ type: QuestionTypes.Input } & InputQuestionOptions)
  | ({ type: QuestionTypes.List } & ListQuestionOptions & { pageName?: string })
  | ({ type: QuestionTypes.Password } & PasswordQuestionOptions)
  | ({ type: QuestionTypes.AutoComplete, pageName: string, choices: { name: string, value: string}[], message: string })
  | ({ type: QuestionTypes.Snippet } & SnippetPromptOptions)