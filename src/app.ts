import { Page } from './class/pages.js'
import { page } from './index.js'

await Page.register()
const cachePage = Page.all.find((pagee) => pagee.interaction.name === page.get())
Page.execute(cachePage?.interaction.name ?? 'zones')
