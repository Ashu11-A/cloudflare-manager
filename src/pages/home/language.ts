import { Page } from '@/class/pages.js'
import { Lang } from '@/controller/lang.js'
import { PageTypes } from '@/types/page.js'
import i18next from 'i18next'

new Page({
  name: 'language',
  loaders: [],
  requirements: [],
  type: PageTypes.Command,
  next: 'home',
  async run(options) {
    await new Lang().selectLanguage()

    options.reply(options.interaction.next as string)
    return options
  },
})