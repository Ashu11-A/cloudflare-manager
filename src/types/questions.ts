import type { input, password, select } from '@inquirer/prompts'
import Enquirer from 'enquirer'

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
    Select = 'select',
    Password = 'password',
    AutoComplete = 'autoComplete',
    Snippet = 'snippet'
}

export type QuestionProps = 
  | ({ type: QuestionTypes.Input } & Parameters<typeof input>[0])
  | ({ type: QuestionTypes.Select } & Parameters<typeof select>[0] & { pageName?: string })
  | ({ type: QuestionTypes.Password } & Parameters<typeof password>[0])
  | ({ type: QuestionTypes.AutoComplete, pageName: string, choices: { name: string, value: string}[], message: string })
  | ({ type: QuestionTypes.Snippet } & SnippetPromptOptions)