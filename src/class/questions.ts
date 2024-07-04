import { page, zone } from '@/index.js'
import { PageTypes } from '@/types/page.js'
import 'dotenv/config'
import enquirer from 'enquirer'
import inquirer, { CheckboxQuestion, ListChoiceOptions, ListQuestion } from 'inquirer'
import autoComplete from 'inquirer-autocomplete-standalone'
import { Page } from './pages.js'

export class Questions {
  async ask (message: string): Promise<string> {
    const result = await inquirer.prompt({
      name: 'value',
      type: 'input',
      message
    })
    return result.value
  }

  async select (options: { message: string, choices: ListChoiceOptions[], type?: ListQuestion['type'] | CheckboxQuestion['type'], pageName: string }): Promise<string> {
    const { choices, message, pageName, type } = options
    if (process.env.isTest) return choices[0].value

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

    const result = await inquirer.prompt({
      name: 'value',
      type: type ?? 'list',
      pageSize: 20,
      choices: [
        new inquirer.Separator(),
        ...choices,
        new inquirer.Separator(),
        ...footerBar,
      ],
      message: !['zones', null].includes(page.get()) ? `[${zone.get()?.name}] - ${message}` : message
    })
    return result.value as string
  }

  async autoComplete<T>(options: { message: string, choices: ListChoiceOptions[], pageName: string }): Promise<T> {
    const { message, choices, pageName } = options

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
      message,
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

  async multipleQuestions (options: { message: string, templates: string[] }): Promise<{ values: Record<string, string>; result: string }> {
    const { message, templates } = options

    const answer = await enquirer.prompt({
      name: 'value',
      type: 'snippet',
      message,
      required: true,
      template: `
{
  ${templates.filter((value) => value !== undefined).join(',\n  ')}
}
      `
    })
    console.log(answer)
    return (answer as { value: { values: Record<string, string>, result: string } }).value
  }
}