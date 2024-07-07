import { Page } from '@/class/pages.js'

/**
 * Existing types of Page
 *
 * @export
 * @enum {number}
 */
export enum PageTypes {
    Command = 'Command',
    Option = 'Option',
    SubCommand = 'SubCommand',
}

/**
 * Description placeholder
 *
 * @type {PageBase}
 */
type PageBase = {
    /**
     * Page name.
     * @type {string}
     */
    name: string,
    /**
     * This will be executed if a request is not completed.
     * @returns {Array<Function<Promise<any>>>}
     */
    loaders?: (() => Promise<any>)[],
}

/**
 * @export
 * @type {PageProps}
 * @template {PageTypes} PageTyper
 * @template Req
 */
export type PageProps<PageTyper extends PageTypes, Req> = PageBase
    & ({
    /**
     * Requirements that the page needs
     * @type {Req[]}
     */
    requirements: Req[]
    })
    & (
        PageTyper extends PageTypes.Command 
        ? {
            type: PageTypes.Command
            next: string
            run:(options: Page<PageTyper, Req>) => Promise<Page<PageTyper, Req>>
        }
        : PageTyper extends PageTypes.SubCommand
        ? {
            type: PageTypes.SubCommand
            previous: string
            next?: string
            run:(options: Page<PageTyper, Req>) => Promise<Page<PageTyper, Req>>
        }
        : PageTyper extends PageTypes.Option
        ? {
            type: PageTypes.Option
            previous: string
            run:(options: Page<PageTyper, Req>) => Promise<Page<PageTyper, Req>>
        }
        : never
    )

/**
 * @export
 * @type {PageStructure}
 * @template {PageTypes} PageTyper
 * @template TRequirements
 */
export type PageStructure<PageTyper extends PageTypes, TRequirements> = PageProps<PageTyper, TRequirements>
