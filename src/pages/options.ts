import { Page } from '@/class/pages.js'
import { question } from '@/class/questions.js'
import { i18 } from '@/controller/lang.js'
import { zone } from '@/index.js'
import { PageTypes } from '@/types/page.js'
import { QuestionTypes } from '@/types/questions.js'

export default new Page({
  name: 'options',
  loaders: [],
  requirements: [zone],
  type: PageTypes.Option,
  previous: 'zones',
  async run(options) {
    const result = await question({
      type: QuestionTypes.Select,
      message: i18('pages.options.question'),
      pageName: options.interaction.name,
      choices: [
        {
          name: i18('pages.options.analytics'),
          value: 'analytics'
        },
        {
          name: i18('pages.options.dns'),
          value: 'dns'
        },
        {
          name: i18('pages.options.ssl/tls'),
          value: 'ssl/tls'
        },
        {
          name: i18('pages.options.security'),
          value: 'security'
        },
        {
          name: i18('pages.options.caching'),
          value: 'caching'
        },
        {
          name: i18('pages.options.network'),
          value: 'network'
        },
      ]
    })

    options.reply(result)
    return options
  }
})
