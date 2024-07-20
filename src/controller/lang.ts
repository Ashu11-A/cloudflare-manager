import { Crypt } from '@/class/crypt.js'
import { credentials, rootPath } from '@/index.js'
import { exists } from '@/lib/exists.js'
import { LangProps, Paths, ValueOfLang } from '@/types/lang.js'
import { readFile } from 'fs/promises'
import { join } from 'path'
import langBase from '../../locales/en/translation.json'
import { glob } from 'glob'

const cache = new Map<string, typeof langBase>()

const path = join(rootPath, '..', 'locales')
const allLangs = (await glob('**/translation.json', { cwd: path }))

for (const lang of allLangs) {
  cache.set(lang.split('/')[0], JSON.parse(await readFile(join(path, lang), { encoding: 'utf-8' })))
}

export class Lang {
  static language: string

  constructor ({ language }: LangProps) {
    Lang.language = language
  }

  get<P extends Paths<typeof langBase>>(path: P, metadata?: Record<string, string>): ValueOfLang<typeof langBase, P> | string {
    const keys = path.split('.') as Array<string>
    let result: string | undefined | object
    const data = cache.get(Lang.language) as any | undefined

    if (data === undefined) throw new Error('Cache not defined fotr languages')

    for (const key of keys) {
      if (result === undefined) { result = data[key]; continue }
      if (typeof result === 'object') { result = (result as Record<string, string>)[key]; continue }
    }

    if (metadata !== undefined){
      for (const [key, data] of Object.entries(metadata)) {
        (result as string).replaceAll(key, data)
      }
    }

    return result as string
  }

  async setLanguage (newLang: string, change?: boolean) {
    const path = join(rootPath, '..', 'locales', newLang)
    const crypt = new Crypt()
    
    if (!(await exists(path))) {
      console.log(`⛔ The selected language (${newLang}) does not exist, using English by default`)
      newLang = 'en'
    }

    Lang.language = newLang
    if (change) await crypt.write({ language: newLang })
  }
}

export const lang = new Lang({ language: credentials.get('language') as string ?? 'en' })
export const i18 = lang.get