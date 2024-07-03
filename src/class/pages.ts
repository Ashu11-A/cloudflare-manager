import 'dotenv/config'
import { __dirname, page } from '@/index.js'
import { PageStructure, PageTypes } from '@/types/page.js'
import { glob } from 'glob'
import { join } from 'path'

export class Page<PageTyper extends PageTypes, Req = any> {
  static all: Page<PageTypes>[] = []
  static find(name: string) { return Page.all.find((page) => page.interaction.name === name) }

  interaction: PageStructure<PageTyper, Req>
  result?: string

  constructor(options: PageStructure<PageTyper, Req>) {
    this.interaction = options
    Page.all.push(this)
  }

  async setResult(result: string) {
    this.result = result
  }

  async reply(action: 'reload' | 'back' | 'exit' | string): Promise<any> {
    if (process.env.isTest) return this.setResult(action)

    switch (action) {
    case 'reload':
      if (this.interaction.requirements === undefined || this.interaction.loaders === undefined) {
        Page.execute(this.interaction.name)
        return
      }
      for (const cache of this.interaction.requirements) {
        cache.clear()
      }

      for (const fn of this.interaction.loaders) {
        await fn()
      }
      Page.execute(this.interaction.name)
      break
    case 'back':
      if (this.interaction.type !== PageTypes.Command) {
        page.save(this.interaction.previous)
        Page.execute(this.interaction.previous)
      }
      break
    case 'exit':
      process.exit()
      break
    default:
      page.save(action)
      Page.execute(action)
    }
  }

  static async register() {
    const pages = await glob('pages/**/*.{ts,js}', { cwd: __dirname })
    for (const page of pages) {
      await import(join(__dirname, page))
    }
  }

  static async execute(name: string) {
    const page = this.find(name)
    if (page === undefined) throw new Error('404 | Page not found!')

    if (
      page.interaction.requirements !== undefined &&
            page.interaction.loaders !== undefined &&
            page.interaction.requirements.length > 0
    ) {
      for (const cache of page.interaction.requirements) {
        if (cache.exist()) continue

        for (const fn of page.interaction.loaders) await fn()
      }
    }

    switch (page.interaction.type) {
    case PageTypes.Option:
      await page.interaction.run(page)
      break
    case PageTypes.Command:
      await page.interaction.run(page)
      break
    case PageTypes.SubCommand:
      await page.interaction.run(page)
    }
  }
}
