import { Page } from "@/class/pages.js";
import { Questions } from "@/class/questions.js";
import { zone } from "@/index.js";
import { PageTypes } from "@/types/page.js";

new Page({
    name: 'options',
    requirements: [zone],
    type: PageTypes.SubCommand,
    previous: 'zones',
    async run(options) {
        const result = await new Questions().select({
            message: `Opções disponiveis para ${zone.get().name}`,
            isSubCommand: true,
            choices: [
                {
                    title: 'DNS',
                    value: 'dns'
                }
            ]
        })
        options.reply(result)
    }
})
