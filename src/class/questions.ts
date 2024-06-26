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

    async select (message: string, choices: Choice[]): Promise<string> {
        choices = choices.map((choice) => ({ ...choice, title: `⤷ ${choice.title}` }))
        choices.push(
            {
                title: '⟳ Recarregar',
                value: 'reload'
            },
            {
                title: '↩ Voltar',
                value: 'back'
            },
            {
                title: '✖ Sair',
                value: 'exit'
            }
        )
        const result = await prompts({
            name: 'value',
            type: 'select',
            message,
            choices
        })
        if (result.value === 'exit') process.exit()
        return result.value as string
    }
}