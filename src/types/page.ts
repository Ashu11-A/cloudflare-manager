import Cache from '@/class/cache.js'
import { Page } from '@/class/pages.js'

export enum PageTypes {
    Command = 'Command',
    Option = 'Option',
    SubCommand = 'SubCommand',
}

type PageBase = {
    /**
     * Page name
     */
    name: string,
    /**
     * This will be executed if a request is not completed
     * @type {Array<Function<Promise<any>>>}
     */
    loaders?: (() => Promise<any>)[],
}

export type PageProps<PageTyper extends PageTypes, Req = any> = PageBase & (
    PageTyper extends PageTypes.Command 
    ? {
        type: PageTypes.Command
        next: string
        /**
         * Requirements that the page needs
         * @type {Cache<Req>[]}
         */
        requirements: Cache<Req>[]
        run:(options: Page<PageTyper, Req>) => Promise<Page<PageTyper, Req>>
    }
    : PageTyper extends PageTypes.SubCommand
    ? {
        type: PageTypes.SubCommand
        previous: string
        next?: string
        /**
         * Requirements that the page needs
         * @type {Cache<Req>[]}
         */
        requirements: Cache<Req>[]
        run:(options: Page<PageTyper, Req>) => Promise<Page<PageTyper, Req>>
    }
    : PageTyper extends PageTypes.Option
    ? {
        type: PageTypes.Option
        previous: string
        /**
         * Requirements that the page needs
         * @type {Cache<Req>[]}
         */
        requirements: Cache<Req>[]
        run:(options: Page<PageTyper, Req>) => Promise<Page<PageTyper, Req>>
    }
    : never
)

export type PageStructure<PageTyper extends PageTypes, TRequirements> = PageProps<PageTyper, TRequirements>
