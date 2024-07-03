import { Page } from "@/class/pages.js";
import { Questions } from "@/class/questions.js";
import { zone } from "@/index.js";
import { PageTypes } from "@/types/page.js";

export default new Page({
    name: 'dns',
    previous: 'options',
    type: PageTypes.SubCommand,
    requirements: [zone],
    async run(options) {
        const response = await new Questions().select({
            message: '[🌐 DNS] O que deseja fazer?',
            pageName: options.interaction.name,
            choices: [
                {
                    name: '✨ Ip Dynamic',
                    value: 'dns_dynamic'
                },
                {
                    name: '💡 Criar',
                    value: 'dns-create'
                },
                {
                    name: '✏️  Editar',
                    value: 'dns-edit'
                },
                {
                    name: '🗑️  Apagar',
                    value: 'dns-delete'
                },
                {
                    name: '🔎 Pesquisar',
                    value: 'dns-search'
                }
            ]
        })

        options.reply(response)
        return options
    }
})