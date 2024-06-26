import Enmap from "enmap";

const all: Array<Enmap> = []

export default class Cache<Result>{
    private cache!: Enmap<string, string>

    constructor(key: string) {
        this.loader(key)
    }

    private find (key: string) {
        return all.find((cache) => cache.name === key)
    }
    private create (key: string) {
        const newCache = new Enmap({ name: key })
        all.push(newCache)
        return newCache
    }
    private loader(key: string) {
        let cache = this.find(key)
        if (cache === undefined) cache = this.create(key)
        this.cache = cache as Enmap<string, string>
        return this
    }

    get (): Result {
        return JSON.parse(String(this.cache.get('data')))
    }
    save(data: Result) {
        this.cache.set('data', JSON.stringify(data))
        return this
    }
}