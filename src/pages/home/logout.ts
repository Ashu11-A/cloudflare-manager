import { credentials, Crypt } from '@/class/crypt.js'
import { Page } from '@/class/pages.js'
import { question } from '@/class/questions.js'
import { PageTypes } from '@/types/page.js'
import { QuestionTypes } from '@/types/questions.js'

new Page({
  name: 'logout',
  loaders: [],
  requirements: [credentials],
  next: 'home',
  type: PageTypes.Command,
  async run(options) {
    const [credentials] = options.interaction.requirements
    await new Crypt().delete()
    credentials.clear()

    options.reply(options.interaction.next as string)
    return options
  },
})