import { page, zone } from '@/index.js'
import { linkTables } from '@/lib/linkTables.js'
import { PageTypes } from '@/types/page.js'
import { QuestionProps, QuestionTypes } from '@/types/questions.js'
import { input, password, select, Separator } from '@inquirer/prompts'
import enquirer from 'enquirer'
import autoComplete from 'inquirer-autocomplete-standalone'
import { Page } from './pages.js'

class Question {
  public readonly options

  constructor(options: QuestionProps) {
    this.options = options
  }

  async run() {
    switch (this.options.type) {
    case QuestionTypes.Input: return await input(this.options)
    case QuestionTypes.Password: return await password(this.options)
    case QuestionTypes.Select: {
      if (process.env.isTest) {
        let choiceData
        for (const choice of this.options.choices) {
          if (choice.type !== 'separator') { choiceData = choice; break }
        }
        return choiceData?.value
      }
      const pageName = this.options.pageName
      const footerBar = []
      const pageSelect = Page.all.find((page) => page.interaction.name === pageName) as Page<PageTypes> | undefined

      if (pageSelect !== undefined) {
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
          value: 'home'
        })
      }
      footerBar.push({
        name: '❌ Sair',
        value: 'exit',
      })

      const zoneName = zone.getData()?.name
      const message = zoneName !== undefined && this.options.message !== undefined && !['zones', 'home', null].includes(page.getData())
        ? `[${zoneName}] - ${this.options.message}`
        : this.options.message

      return await select(Object.assign(this.options, {
        pageSize: 20,
        choices: [...this.options.choices, new Separator(), ...footerBar],
        message
      })) as string
    }
    case QuestionTypes.AutoComplete: {
      const pageName = this.options.pageName
      const options = this.options

      const pageSelect = Page.all.find((page) => page.interaction.name === pageName) as Page<PageTypes>
      const footerBar: { name: string, value: string }[] = []

      if (pageSelect !== undefined) {
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
          value: 'home'
        })
      }
      footerBar.push({
        name: '❌ Sair',
        value: 'exit',
      })

      const answer = await autoComplete({
        message: options.message,
        async source(input) {
          const filtered = [...options.choices, ...footerBar].filter(({ name }) => name.toLowerCase().includes(input?.toLocaleLowerCase() ?? ''))
          return filtered.map(choice => {
            return {
              value: choice.value,
              name: choice.name
            }
          })
        }
      })

      return answer
    }
    case QuestionTypes.Snippet: {
      return (await enquirer.prompt(Object.assign(this.options, {
        name: 'value',
        async validate(value: any) {
          const result = JSON.parse((value as { result: string }).result) as Record<string, string | Record<string, string>>
          const values = (value as unknown as { values: string }).values as unknown as Record<string, string>
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
  ${this.options.templates.filter((value) => value !== undefined).join(',\n  ')}
}
        `
      })) as { value: { values: Record<string, string>, result: string } }).value
    }
    default: return ''
    }
  }
}

export async function question<Result = string>(options: QuestionProps): Promise<Result> {
  return await (new Question(options)).run() as Result
}