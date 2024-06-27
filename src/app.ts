import { Page } from './class/pages.js';
import { page } from './index.js';

await Page.register()
Page.execute(page.get() ?? 'zones')
