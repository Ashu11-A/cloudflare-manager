import { rootPath } from '@/index.js'
import Enmap from 'enmap'
import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'

export default class Cache<Result> extends Enmap<string, string> {
  static all: Enmap<string, string>[] = []

  constructor(key: string) {
    const dataDir = join(rootPath, '..', 'cache')
    if (!existsSync(dataDir)) mkdirSync(dataDir)

    super({ name: key, dataDir })
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