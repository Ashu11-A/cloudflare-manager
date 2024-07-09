import { Page } from '@/class/pages.js'
import { question } from '@/class/questions.js'
import { i18 } from '@/controller/lang.js'
import { zone } from '@/index.js'
import { PageTypes } from '@/types/page.js'
import { QuestionTypes } from '@/types/questions.js'

export default new Page({
  name: 'dns',
  previous: 'options',
  type: PageTypes.Option,
  loaders: [],
  requirements: [zone],
  async run(options) {
    const response = await question({
      type: QuestionTypes.Select,
      message: i18('pages.dns.question'),
      pageName: options.interaction.name,
      choices: [
        {
          name: i18('pages.dns.dynamic'),
          value: 'dns-dynamic'
        },
        {
          name: i18('pages.dns.create'),
          value: 'dns-create'
        },
        {
          name: i18('pages.dns.edit'),
          value: 'dns-edit'
        },
        {
          name: i18('pages.dns.delete'),
          value: 'dns-delete'
        },
        {
          name: i18('pages.dns.search'),
          value: 'dns-search'
        }
      ]
    })

    options.reply(response)
    return options
  }
})