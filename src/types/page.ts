import { Page } from '@/class/pages.js'

/**
 * Enumeration for the different types of pages.
 *
 * @export
 * @enum {string}
 */
export enum PageTypes {
    Command = 'Command',
    Option = 'Option',
    SubCommand = 'SubCommand',
}

/**
 * Properties specific to each page type.
 *
 * @export
 * @type {object} PageProps
 * @template {PageTypes} PageTyper - The type of the page.
 * @template Req - The requirements for the page.
 * @template Loader - The loader functions for the page.
 * 
 * @property {string} name - The name of the page.
 * @property {Req[]} requirements - Requirements that the page needs.
 * @property {Loader[]} loaders - This will be executed if a request is not completed.
 * @property {PageTypes} type - The type of the page, which depends on the PageTyper.
 * @property {string} [next] - The next page in the sequence if the current page type is Command or SubCommand.
 * @property {string} [previous] - The previous page in the sequence if the current page type is Option or SubCommand.
 * @property {(options: Page<PageTyper, Req, Loader>) => Promise<Page<PageTyper, Req, Loader>>} run - Function to run for this page.
 */
export type PageProps<PageTyper extends PageTypes, Req, Loader> = ({
    /**
     * The name of the page.
     * @type {string}
     */
    name: string,

    /**
     * Requirements that the page needs.
     * @type {Req[]}
     */
    requirements: Req[]

    /**
     * This will be executed if a request is not completed.
     * @type {Loader[]}
     */
    loaders: Loader[],
    
    /**
     * The type of the page, which depends on the PageTyper.
     * @type {PageTypes}
     */
    type: PageTyper extends PageTypes.Command 
        ? PageTypes.Command
        : PageTyper extends PageTypes.SubCommand
        ? PageTypes.SubCommand
        : PageTyper extends PageTypes.Option
        ? PageTypes.Option
        : never

    /**
     * The next page in the sequence if the current page type is Command or SubCommand.
     * @type {string | undefined}
     */
    next?: PageTyper extends PageTypes.Command | PageTypes.SubCommand ? string : never

    /**
     * The previous page in the sequence if the current page type is Option or SubCommand.
     * @type {string | undefined}
     */
    previous?: PageTyper extends PageTypes.Option | PageTypes.SubCommand ? string : never

    /**
     * Function to run for this page.
     * @param {Page<PageTyper, Req, Loader>} options - The page options.
     * @returns {Promise<Page<PageTyper, Req, Loader>>} - A promise that resolves to a Page instance.
     */
    run:(options: Page<PageTyper, Req, Loader>) => Promise<Page<PageTyper, Req, Loader>>
})