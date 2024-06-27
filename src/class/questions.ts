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

    async select (options: { message: string, choices: ListChoiceOptions[], type?: ListQuestion['type'] | CheckboxQuestion['type'], isCommand?: boolean }): Promise<string> {
        let { choices, message, isCommand, type } = options

        const footerBar: ListChoiceOptions[] = []

        if (!(isCommand ?? false)) footerBar.push({
            name: '🔄 Recarregar',
            value: 'reload'
        })
        if (!(isCommand ?? false)) footerBar.push({
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
            message: page.get() !== 'zones' ? `[${zone.get().name}] - ${message}` : message
        })
        return result.value as string
    }
}