import Enmap from "enmap";

export default class Cache<Result>{
    static all: Array<Enmap> = []
    private cache!: Enmap<string, string>

    constructor(key: string) {
        this.loader(key)
    }

    private find (key: string) {
        return Cache.all.find((cache) => cache.name === key)
    }
    private create (key: string) {
        const newCache = new Enmap({ name: key })
        Cache.all = [...Cache.all, newCache]
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
    exist() { return this.cache.has('data') }
    clear() { return this.cache.clear() }
}