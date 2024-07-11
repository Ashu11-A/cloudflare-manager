import { Crypt } from '@/class/crypt.js'
import { Page } from '@/class/pages.js'
import { question } from '@/class/questions.js'
import { PageTypes } from '@/types/page.js'
import { QuestionTypes } from '@/types/questions.js'

new Page({
  name: 'login',
  loaders: [],
  requirements: [],
  next: 'home',
  previous: 'home',
  type: PageTypes.SubCommand,
  async run(options) {
    const email = await question({
      type: QuestionTypes.Input,
      message: 'Email do Cloudflare',
    })
    const token = await question({
      type: QuestionTypes.Password,
      message: 'Token do Cloudflare'
    })
  
    await new Crypt().write({ email, token })
    await new Crypt().read()

    options.reply(options.interaction.next as string)
    return options
  },
})