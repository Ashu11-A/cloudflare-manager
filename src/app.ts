import { Page } from './class/pages.js'
import { page } from './index.js'

await Page.register()
const cachePage = Page.all.find((pagee) => pagee.interaction.name === page.getData())
Page.execute(cachePage?.interaction.name ?? 'home')
