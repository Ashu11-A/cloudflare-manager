import { Page } from '@/class/pages.js'
import { question } from '@/class/questions.js'
import { PageTypes } from '@/types/page.js'

export default new Page({
  name: 'about',
  type: PageTypes.Option,
  requirements: [],
  loaders: [],
  previous: '',
  async run(options) {
    console.log('')
    console.log('')
    const back = await question({ type: 'select', choices: [], message: '' })
    options.reply(back)
    return options
  },
})