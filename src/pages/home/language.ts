import { Page } from '@/class/pages.js'
import { Lang } from '@/controller/lang.js'
import { PageTypes } from '@/types/page.js'

new Page({
  name: 'language',
  loaders: [],
  requirements: [],
  type: PageTypes.SubCommand,
  next: 'home',
  previous: 'home',
  async run(options) {
    await new Lang().selectLanguage()

    options.reply(options.interaction.name as string)
    return options
  },
})