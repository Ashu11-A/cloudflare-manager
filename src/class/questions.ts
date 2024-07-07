import { page, zone } from '@/index.js'
import { linkTables } from '@/lib/linkTables.js'
import { PageTypes } from '@/types/page.js'
import 'dotenv/config'
import enquirer from 'enquirer'
import inquirer, { Answers, CheckboxQuestion, ListChoiceOptions, ListQuestion, PasswordQuestion } from 'inquirer'
import autoComplete from 'inquirer-autocomplete-standalone'
import { Page } from './pages.js'

interface QuestionsOptions {
  message: string
}
export class Questions {
  public readonly message

  constructor({ message }: QuestionsOptions) {
    this.message = message
  }

  async ask (message: string): Promise<string> {
    const result = await inquirer.prompt({
      name: 'value',
      type: 'input',
      message
    })
    return result.value
  }

  async select ({ choices, pageName, type, validate }: {
    choices?: ListChoiceOptions[],
    type?: ListQuestion['type'] | CheckboxQuestion['type'] | PasswordQuestion['type'],
    pageName?: string
    validate?(input: any, answers?: Answers | undefined): boolean | string | Promise<boolean> | Promise<string>
  }): Promise<string> {
    if (process.env.isTest) return choices?.[0].value

    const footerBar: ListChoiceOptions[] = []
    
    if (pageName !== undefined) {
      const pageSelect = Page.all.find((page) => page.interaction.name === pageName) as Page<PageTypes>

      if (pageSelect.interaction.type !== PageTypes.Option) footerBar.push({
        name: '🔄 Recarregar',
        value: 'reload'
      })
      if (pageSelect.interaction.type !== PageTypes.Command) footerBar.push({
        name: '↩️  Voltar',
        value: 'back'
      })
      if (pageSelect.interaction.type !== PageTypes.Command) footerBar.push({
        name: '📍 Home',
        value: 'zones'
      })
      footerBar.push({
        name: '❌ Sair',
        value: 'exit',
      })

    }

    let result

    if (type === 'password') {
      result = await inquirer.prompt({
        name: 'value',
        type,
        validate
      })

    } else {
      result = await inquirer.prompt({
        name: 'value',
        type: type ?? 'list',
        pageSize: 20,
        choices: [
          new inquirer.Separator(),
          ...choices ?? [],
          new inquirer.Separator(),
          ...footerBar,
        ],
        message: !['zones', null].includes(page.getData()) ? `[${zone.getData()?.name}] - ${this.message}` : this.message
      })
    }

    return result.value as string
  }

  async autoComplete<T>({ choices, pageName }: { choices: ListChoiceOptions[], pageName: string }): Promise<T> {

    const pageSelect = Page.all.find((page) => page.interaction.name === pageName) as Page<PageTypes>
    const footerBar: ListChoiceOptions[] = []

    if (pageSelect.interaction.type !== PageTypes.Option) footerBar.push({
      name: '🔄 Recarregar',
      value: 'reload'
    })
    if (pageSelect.interaction.type !== PageTypes.Command) footerBar.push({
      name: '↩️  Voltar',
      value: 'back'
    })
    if (pageSelect.interaction.type !== PageTypes.Command) footerBar.push({
      name: '📍 Home',
      value: 'zones'
    })
    footerBar.push({
      name: '❌ Sair',
      value: 'exit',
    })

    choices.push(...footerBar)

    const answer = await autoComplete({
      message: this.message,
      async source(input) {
        const filtered = choices.filter(({ name }) => name?.toLowerCase().includes(input?.toLocaleLowerCase() ?? ''))
        return filtered.map(choice => {
          return {
            value: choice.value,
            name: choice.name
          }
        })
      }
    })

    return answer as T
  }

  async multipleQuestions ({ templates }: { templates: string[] }): Promise<{ values: Record<string, string>; result: string }> {

    const answer = await enquirer.prompt({
      name: 'value',
      type: 'snippet',
      message: this.message,
      async validate (value) {
        const result = JSON.parse((value as unknown as { result: string }).result) as Record<string, string | Record<string, string>>
        const values = (value as unknown as { values: string} ).values as unknown as Record<string, string>
        const linkedTable = linkTables(values, result)

        let requirements = ''

        for (const [name, value] of Object.entries(linkedTable)) {
          const variables = name.split('[')[1].split(']')[0]
          const types = variables.split(',')[0]
          const isOptional = !!variables.split(',')[1]
  
          if (/string/.test(types) && !isOptional && value == 'undefined') requirements += 'Elemento precisa ser expecificado\n'
  
          /**
           * Valida se a infomação é do tipo number.
           * Isso tenta converte-lo, se não for um numero ele retornará: @type {NaN}.
           * Se for opcional, e ser especificado, também valide se é um numero.
           */
          if (/number/.test(types)) { 
            if (isOptional && value != 'undefined' && !Number(value)) {
              requirements += 'Elemento só pode conter números\n'
            } else if (!isOptional && !Number(value)) {
              requirements += 'Elemento só pode conter números\n'
            }
          }
  
          /**
           * Valida se é "true | false".
           * Se for opcional, e ser especificado, também valide se é um possivel boolean.
           */
          if (/true|false/.test(types)) {
            if (isOptional && value != 'undefined' && !(/true/.test(value) || /false/.test(value))) {
              requirements += 'Elemento só pode ser "true" ou "false"\n'
            } else if (!isOptional && !(/true/.test(value!) || /false/.test(value!))) {
              requirements += 'Elemento só pode ser "true" ou "false"\n'
            }
          }
        }
        return requirements.length === 0 ? true : requirements
      },
      template: `
{
  ${templates.filter((value) => value !== undefined).join(',\n  ')}
}
      `
    })
    return (answer as { value: { values: Record<string, string>, result: string } }).value
  }
}