import { Page } from "@/class/pages.js";
import { Questions } from "@/class/questions.js";
import { zone } from "@/index.js";
import { PageTypes } from "@/types/page.js";

new Page({
    name: 'options',
    requirements: [zone],
    type: PageTypes.Option,
    previous: 'zones',
    async run(options) {
        const result = await new Questions().select({
            message: `📂 Opções disponiveis`,
            pageName: options.interaction.name,
            choices: [
                {
                    name: '🌐 DNS',
                    value: 'dns'
                },
            ]
        })
        options.reply(result)
    }
})
