import { Page } from '@/class/pages.js'
import { question } from '@/class/questions.js'
import { client } from '@/controller/cloudflare.js'
import { zone, zones } from '@/index.js'
import { PageTypes } from '@/types/page.js'
import { QuestionTypes } from '@/types/questions.js'

export default new Page ({
  name: 'zones',
  type: PageTypes.Command,
  next: 'options',
  loaders: [async () => zones.save((await client.zones.list({ per_page: 100 })).result)],
  requirements: [zones],
  async run(options) {
    const [zones] = options.interaction.requirements
    const response = await question({
      type: QuestionTypes.Select,
      message: '🚧 Selecione a zona que deseja modificar',
      pageName: options.interaction.name,
      choices: zones.getData().map((zone)=> ({
        name: zone.name,
        value: `${zone.name}_${zone.id}`
      }))
    })()
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