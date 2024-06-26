import { client, zone, zones } from "@/index.js";
import { Page } from "@/class/pages.js";
import { Questions } from "@/class/questions.js";
import { PageTypes } from "@/types/page.js";
import { ListChoiceOptions } from "inquirer";

new Page ({
    name: 'zones',
    type: PageTypes.Command,
    next: 'options',
    loaders: [async () => zones.save((await client.zones.list({ per_page: 100 })).result)],
    requirements: [zones],
    async run(options) {
        const response = await new Questions().select({
            message: '🚧 Selecione a zona que deseja modificar',
            pageName: options.interaction.name,
            choices: zones.get().map((zone)=> ({
                name: zone.name,
                value: `${zone.name}_${zone.id}`
            } satisfies ListChoiceOptions))
        })
        const zoneSelected = response.split('_')
        if (zoneSelected.length === 2) {
            zone.save({ name: zoneSelected[0], id: zoneSelected[1] })
            options.reply(options.interaction.next)
            return
        }
        options.reply(response)
        return
    }
})