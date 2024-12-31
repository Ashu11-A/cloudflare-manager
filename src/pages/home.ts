import { Page } from '@/class/pages.js'
import { question } from '@/class/questions.js'
import { i18 } from '@/controller/lang.js'
import { credentials } from '@/index.js'
import { PageTypes } from '@/types/page.js'
import { Separator } from '@inquirer/prompts'
import About from './home/about.js'

export default new Page({
  name: 'home',
  loaders: [],
  requirements: [credentials],
  type: PageTypes.Command,
  async run(options) {
    const [credentials] = options.interaction.requirements
    const nextPage = await question({
      type: 'select',
      message: i18('pages.home.question'),
      choices: [
        new Separator(),
        {
          name: i18('pages.home.zones'),
          value: 'zones',
          disabled: credentials.get('email') === undefined
        },
        new Separator(),
        {
          name: i18('pages.home.language'),
          value: 'language'
        },
        {
          name: i18('pages.home.settings'),
          value: 'settings',
          disabled: credentials.get('email') === undefined
        },
        credentials.get('email') === undefined
          ? {
            name: i18('pages.home.login'),
            value: 'login',
          }
          : {
            name: i18('pages.home.logout'),
            value: 'logout',
          },
        new Separator(),
        {
          name: i18('pages.home.about'),
          value: 'about'
        },
      ]
    })

    if (nextPage === 'about') {
      About.interaction.previous = 'home'
      About.interaction.run(About)
    } else {
      options.reply(nextPage)
    }

    return options
  },
})