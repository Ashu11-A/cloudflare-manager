import Cache from "@/class/cache.js"
import { Page } from "@/class/pages.js"

export enum PageTypes {
    Command = 'Command',
    Option = 'Option',
    SubCommand = 'SubCommand',
}

type PageBase = {
    name: string,
    requirements?: Cache<any>[]
    loaders?: (() => Promise<any>)[]
}

export type PageProps<PageTyper extends PageTypes> = PageBase & (
    PageTyper extends PageTypes.Command 
    ? {
        type: PageTypes.Command
        next: string
        run:(options: Page<PageTyper>) => Promise<void>
    }
    : PageTyper extends PageTypes.SubCommand
    ? {
        type: PageTypes.SubCommand
        previous: string
        next?: string
        run:(options: Page<PageTyper>) => Promise<void>
    }
    : PageTyper extends PageTypes.Option
    ? {
        type: PageTypes.Option
        previous: string
        run:(options: Page<PageTyper>) => Promise<void>
    }
    : never
)

export type PageStructure<PageTyper extends PageTypes> = PageProps<PageTyper>
