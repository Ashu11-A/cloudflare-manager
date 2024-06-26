import 'dotenv/config'
import prompts, { Choice } from 'prompts'

export class Questions {
    async ask (message: string): Promise<string> {
        const result = await prompts({
            name: 'value',
            type: 'text',
            message
        })
        return result.value
    }

    async select (options: { message: string, choices: Choice[], isSubCommand?: boolean }): Promise<string> {
        let { choices, message, isSubCommand } = options
        choices = choices.map((choice) => ({ ...choice, title: `⤷ ${choice.title}` }))

        choices.push({
            title: '⟳ Recarregar',
            value: 'reload'
        })
        if (isSubCommand) choices.push({
            title: '↩ Voltar',
            value: 'back'
        })
        choices.push({
            title: '✖ Sair',
            value: 'exit'
        })
        const result = await prompts({
            name: 'value',
            type: 'select',
            message,
            choices
        })
        return result.value as string
    }
}