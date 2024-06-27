import { Page } from "@/class/pages.js";
import { Questions } from "@/class/questions.js";
import { client, records, zone } from "@/index.js";
import { PageTypes } from "@/types/page.js";
import { ListChoiceOptions } from "inquirer";

new Page({
    name: 'dns-edit',
    previous: 'dns',
    type: PageTypes.SubCommand,
    loaders: [async () => records.save((await client.dns.records.list({ zone_id: zone.get().id })).result)],
    requirements: [records],
    async run(options) {
        /**
         * Para deixar o console visivelmente mais bonito
         * Isso deixará o expaçamento uniforme
         */
        const maxTypeLength = Math.max(...records.get().map((record) => record.type.length))
        const maxNameLength = Math.max(...records.get().map((record) => record.name.length))

        /**
         * Colocar em ordem crescente
         */
        const sortedRecord = records.get().sort((r1, r2) => r1.type.length - r2.type.length)

        const selectsRecord = await new Questions().select({
            message: 'Selecione os Records para serem editadas',
            pageName: options.interaction.name,
            type: "checkbox",
            choices: sortedRecord.map((record) => {
                const paddedType = `[${record.type}]`.padEnd(maxTypeLength + 2, ' ')
                const paddedName = record.name.padEnd(maxNameLength, ' ')
                return ({
                    name: `${paddedType} ${paddedName}`,
                    value: `record_${record.name}_${record.id}`
                } satisfies ListChoiceOptions)
            })
        })
        console.log(selectsRecord)
        // options.reply(selectRecord)
    },
})