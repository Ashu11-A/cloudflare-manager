import { Page } from '@/class/pages.js'
import { question } from '@/class/questions.js'
import { lang } from '@/controller/lang.js'
import { rootPath } from '@/index.js'
import { PageTypes } from '@/types/page.js'
import { join } from 'path'
import flags from 'country-code-to-flag-emoji'
import { QuestionTypes } from '@/types/questions.js'
import { glob } from 'glob'


new Page({
  name: 'language',
  loaders: [],
  requirements: [],
  type: PageTypes.SubCommand,
  next: 'home',
  previous: 'home',
  async run(options) {
    const langs = []
    const path = join(rootPath, '..', 'locales')
    const allLangs = (await glob('**/translation.json', { cwd: path }))

    for (const lang of allLangs.map((lang) => lang.split('/')[0])) {
      if (langs.filter((langExist) => langExist === lang).length == 0) langs.push(lang)
    }
    const choices = langs.map((lang) => ({ name: `${flags(lang)} - ${lang}`, value: lang }))
    const response = await question({
      type: QuestionTypes.Select,
      message: 'Which language should I continue with?',
      choices
    })
    if (response === undefined) throw new Error('Please select a language')
    await lang.setLanguage(response, true)

    options.reply(options.interaction.next as string)
    return options
  },
})