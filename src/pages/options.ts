import { Page } from '@/class/pages.js'
import { Questions } from '@/class/questions.js'
import { zone } from '@/index.js'
import { PageTypes } from '@/types/page.js'

export default new Page({
  name: 'options',
  requirements: [zone],
  type: PageTypes.Option,
  previous: 'zones',
  async run(options) {
    const result = await new Questions().select({
      message: '📂 Opções disponiveis',
      pageName: options.interaction.name,
      choices: [
        {
          name: '📊 Analytics',
          value: 'analytics'
        },
        {
          name: '🌐 DNS',
          value: 'dns'
        },
        {
          name: '🔒 SSL/TLS',
          value: 'ssl/tls'
        },
        {
          name: '🛡️  Security',
          value: 'security'
        },
        {
          name: '📥 Caching',
          value: 'caching'
        },
        {
          name: '📡 Network',
          value: 'network'
        }
      ]
    })

    options.reply(result)
    return options
  }
})
