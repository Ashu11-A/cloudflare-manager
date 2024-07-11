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
 * Base Page Properties
 *
 * @type {PageSchema}
 * @template Req
 * @template Loader
 * 
 * @property {string} name - The name of the page.
 * @property {Req[]} requirements - Requirements that the page needs.
 * @property {Loader[]} loaders - This will be executed if a request is not completed.
 */
type PageSchema<Req, Loader> = {
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
}


/**
 * Page Option Properties
 *
 * @export
 * @type {PageOption}
 * 
 * @property {PageTypes} type - The type of the page, which depends on the PageTyper.
 * @property {string} [next] - The next page in the sequence if the current page type is Command or SubCommand.
 */
export type PageOption = {
    type: PageTypes.Option,
    previous: string,
}

/**
 * Page SubCommand Properties
 *
 * @export
 * @type {SubCommand}
 * 
 * @property {PageTypes} type - The type of the page, which depends on the PageTyper.
 * @property {string} [next] - The next page in the sequence if the current page type is Command or SubCommand.
 * @property {string} [previous] - The previous page in the sequence if the current page type is Option or SubCommand.
 */
export type PageSubCommand = {
    type: PageTypes.SubCommand,
    previous: string,
    next: string
}

/**
 * Page Command Properties
 *
 * @export
 * @type {SubCommand}
 * 
 * @property {PageTypes} type - The type of the page, which depends on the PageTyper.
 */
export type PageCommand = {
    type:PageTypes.Command,
}

/**
 * Properties specific to each page type.
 *
 * @export
 * @property {(options: Page<PageTyper, Req, Loader>) => Promise<Page<PageTyper, Req, Loader>>} run - Function to run for this page.
 */
export type PageProps<PageTyper extends PageTypes, Req, Loader> = (PageSchema<Req, Loader>) & (PageOption | PageSubCommand | PageCommand) & ({

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