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
            choices: [
                {
                    name: '🌐 DNS',
                    value: 'dns'
                },
                {
                    name: '✨ Ip Dynamic for DNS',
                    value: 'dynamic_dns'
                },
            ]
        })
        options.reply(result)
    }
})
