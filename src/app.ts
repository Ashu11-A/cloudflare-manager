import { Page } from './class/pages.js';

await Page.register()
// const savedPage = Page.all.find((page) => page.name === actualPage.get())
Page.execute('zones')
