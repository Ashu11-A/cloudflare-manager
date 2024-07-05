import { Page } from './class/pages.js'
import { page } from './index.js'
import { isGlobal } from './lib/isGlobal.js'
import c from 'chalk'

if (!(await isGlobal())) {
  console.log(`⚠️  ${c.red('Warning')}!`)
  console.log(`     It is ${c.bgRed(c.black('not recommended'))} to use this module locally, ${c.bgGreen('install it globally')} with ${c.italic.underline('npm i -g cloudflare-manager')}\n`)
}

await Page.register()
const cachePage = Page.all.find((pagee) => pagee.interaction.name === page.get())
Page.execute(cachePage?.interaction.name ?? 'zones')
