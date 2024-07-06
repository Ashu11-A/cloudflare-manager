import { Page } from '@/class/pages.js'
import { Questions } from '@/class/questions.js'
import { client, zone, zones } from '@/index.js'
import { PageTypes } from '@/types/page.js'
import { ListChoiceOptions } from 'inquirer'

export default new Page ({
  name: 'zones',
  type: PageTypes.Command,
  next: 'options',
  loaders: [async () => zones.save((await client.zones.list({ per_page: 100 })).result)],
  requirements: [zones],
  async run(options) {
    const [zones] = options.interaction.requirements
    const response = await new Questions({ message: '🚧 Selecione a zona que deseja modificar' }).select({
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
    } else {
      options.reply(response)
    }

    return options
  }
})