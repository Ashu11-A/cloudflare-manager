import { __dirname } from '@/index.js';
import { PageStructure, PageTypes } from '@/types/page.js';
import { glob } from "glob";
import { join } from "path";
import Cache from './cache.js';

export class Page<PageTyper extends PageTypes>{
    static all: Page<PageTypes>[] = []
    static find(name: string) { return Page.all.find((page) => page.name === name) }

    public name: string
    public type: PageTypes
    public run: PageStructure<PageTyper>['run']

    public next?: string
    public previous?: string

    public requirements?: Cache<any>[]
    public loaders?: (() => Promise<any>)[]
    public action?: string

    constructor(options: PageStructure<PageTyper>) {
        const { name, type, loaders, next, requirements, run } = options
        this.name = name
        this.type = type
        this.next = next
        this.requirements = requirements
        this.loaders = loaders
        this.run = run

        if (type === PageTypes.SubCommand) {
            const { previous } = options
            this.previous = previous
        }
    
        Page.all.push(this)
    }

    async reply (action: string): Promise<any> {
        switch (action) {
            case 'reload':
                if (this.requirements === undefined || this.loaders === undefined) return await Page.execute(this.name)
                for (const cache of this.requirements) {
                    cache.clear()
                }

                for (const fn of this.loaders) {
                    await fn()
                }
                Page.execute(this.name)
                break
            case 'back':
                if (this.type === PageTypes.SubCommand) return await Page.execute(this.previous as string)
                break
            case 'exit':
                process.exit()
            default:
                Page.execute(action)
        }
    }

    static async register () {
        const pages = await glob('pages/*.{ts,js}', { cwd: __dirname })
        for (const page of pages) {
            await import(join(__dirname, page))
        }
    }

    static async execute (name: string) {
        const page = this.find(name)
        if (page === undefined) throw new Error('404 | Page not found!')
        
        if (
            page.requirements !== undefined &&
            page.loaders !== undefined &&
            page.requirements.length > 0
        ) {
            for (const cache of page.requirements) {
                if (cache.exist()) continue
                
                for (const fn of page.loaders) await fn()
            }
        }
        
        switch (page.type) {
        case PageTypes.Command:
            await page.run(page)
            break
        case PageTypes.SubCommand:
            await page.run(page)
        }
    }
}