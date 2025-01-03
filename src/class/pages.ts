import { page, rootPath } from '@/index.js'
import { PageProps, PageTypes } from '@/types/page.js'
import chalk from 'chalk'
import { glob } from 'glob'
import ora from 'ora'
import { join } from 'path'
import Cache from './cache.js'

const spinner = ora()

export class Page<PageGeneric extends PageTypes, Req = any, Loader = any> {
  static all: Page<PageTypes>[] = []
  static find(name: string) { return Page.all.find((page) => page.interaction.name === name) }

  private result?: string

  constructor(public interaction: PageProps<PageGeneric, Req, Loader>) {
    Page.all.push(this)
  }

  setResult(result: string) {
    this.result = result
  }

  async reply(action: 'reload' | 'back' | 'exit' | string): Promise<any> {
    this.setResult(action)
    if (process.env.isTest) return

    switch (action) {
    case 'reload':
      if (this.interaction.requirements === undefined || this.interaction.loaders === undefined) {
        Page.execute(this.interaction.name)
        return
      }

      spinner.start('Limpando cache...')
      for (const [index, cache] of Object.entries(this.interaction.requirements) as unknown as [string, Cache<any>][]) {
        spinner.text = `Limpando cache ${chalk.green(Number(index) + 1)}...`
        cache.clear()
      }
      spinner.stop()

      spinner.start('Carregando novos dados...')
      for (const [index, fn] of Object.entries(this.interaction.loaders) as unknown as [string, (() => Promise<any>)][]) {
        spinner.text = `Carregando loaders ${chalk.green(Number(index) + 1)}`
        await fn()
      }
      spinner.stop()

      Page.execute(this.interaction.name)
      break
    case 'back':
      if (this.interaction.type !== PageTypes.Command) {
        page.save(this.interaction.previous as string)
        Page.execute(this.interaction.previous as string)
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
    const pages = await glob('pages/**/*.{ts,js}', { cwd: rootPath, ignore: ['pages/**/*.d.ts'] })
    for (const page of pages) {
      await import(join(rootPath, page))
    }
  }

  static async execute(name: string) {
    // console.clear()
    const page = this.find(name)
    if (page === undefined) throw new Error('404 | Page not found!')

    if (
      page.interaction.requirements !== undefined && page.interaction.requirements.length > 0 &&
      page.interaction.loaders !== undefined && page.interaction.loaders.length > 0

    ) {
      spinner.start()
      for (const cache of page.interaction.requirements) {
        if (cache.exist()) continue

        for (const [index, fn] of Object.entries<any>(page.interaction.loaders)) {
          spinner.text = `Carregando loaders ${chalk.green(Number(index) + 1)}`
          await fn()
        }
      }
      spinner.stop()
    }

    switch (page.interaction.type) {
    case PageTypes.Option:
      page.interaction.run(page)
      break
    case PageTypes.Command:
      page.interaction.run(page)
      break
    case PageTypes.SubCommand:
      page.interaction.run(page)
    }
  }
}
