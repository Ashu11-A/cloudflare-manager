import { Page } from '@/class/pages.js'
import { Questions } from '@/class/questions.js'
import { client, records, zone } from '@/index.js'
import { PageTypes } from '@/types/page.js'
import { ListChoiceOptions } from 'inquirer'

new Page({
  name: 'dns-search',
  previous: 'dns',
  type: PageTypes.SubCommand,
  loaders: [async () => records.save((await client.dns.records.list({ zone_id: zone.getData().id })).result)],
  requirements: [records],
  async run(options) {
    /**
     * Para deixar o console visivelmente mais bonito
     * Isso deixará o expaçamento uniforme
     */
    const maxTypeLength = Math.max(...records.getData().map((record) => record.type.length))
    const maxNameLength = Math.max(...records.getData().map((record) => record.name.length))

    /**
     * Colocar em ordem crescente
     */
    const sortedRecord = records.getData().sort((r1, r2) => r1.type.length - r2.type.length)

    const selectRecord = await new Questions({ message: 'Selecione um Record para editar' }).select({
      pageName: options.interaction.name,
      choices: sortedRecord.map((record) => {
        const paddedType = `[${record.type}]`.padEnd(maxTypeLength + 2, ' ')
        const paddedName = record.name.padEnd(maxNameLength, ' ')
        return ({
          name: `${paddedType} ${paddedName}`,
          value: `record_${record.name}_${record.id}`
        } satisfies ListChoiceOptions)
      })
    })
    if (selectRecord.split('_')[0] === 'record') {
      const recordName = selectRecord.split('_')[1]
      const recordId = selectRecord.split('_')[2]

      const action = await new Questions({ message: `[🔗 ${recordName}] O que deseja fazer?` }).select({
        pageName: options.interaction.name,
        choices: [
          {
            name: '✏️  Editar',
            value: 'dns-edit'
          },
          {
            name: '🗑️  Apagar',
            value: 'dns-delete'
          },
        ]
      })
      return options
    }
    options.reply(selectRecord)
    return options
  },
})