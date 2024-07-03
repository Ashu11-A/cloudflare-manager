import { page, zone } from '@/index.js'
import 'dotenv/config'
import inquirer, { CheckboxQuestion, ListChoiceOptions, ListQuestion } from 'inquirer'
import { Page } from './pages.js'
import { PageTypes } from '@/types/page.js'

export class Questions {
    async ask (message: string): Promise<string> {
        const result = await inquirer.prompt({
            name: 'value',
            type: 'input',
            message
        })
        return result.value
    }

    async select (options: { message: string, choices: ListChoiceOptions[], type?: ListQuestion['type'] | CheckboxQuestion['type'], pageName: string }, isTest?: boolean): Promise<string> {
        let { choices, message, pageName, type } = options
        if (isTest) return choices[0].value
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
            message: !['zones', null].includes(page.get()) ? `[${zone.get().name}] - ${message}` : message
        })
        return result.value as string
    }
}