import Enmap from 'enmap'
import { Path } from 'glob'

export default class Cache<Result> extends Enmap<string, string> {
  static all: Enmap<string, string>[] = []

  constructor(key: string) {
    super({ name: key })
    Cache.all.push(this)
  }

  getData (): Result {
    return JSON.parse(this.get('data') ?? '{}')
  }
  save(data: Result) {
    super.set('data', JSON.stringify(data))
    return this
  }
  exist() { return this.has('data') }
}