import { Crypt } from '@/class/crypt.js'
import { question } from '@/class/questions.js'
import { rootPath } from '@/index.js'
import { exists } from '@/lib/exists.js'
import { QuestionTypes } from '@/types/questions.js'
import flags from 'country-code-to-flag-emoji'
import { glob } from 'glob'
import i18next, { TFunction } from 'i18next'
import Backend, { FsBackendOptions } from 'i18next-fs-backend'
import { join } from 'path'

export class Lang {  
  async setLanguage (lang: string, change?: boolean) {
    const path = join(rootPath, '..', 'locales', lang)
    const crypt = new Crypt()
    
    if (!(await exists(path))) {
      console.log(`⛔ The selected language (${lang}) does not exist, using English by default`)
      await i18next.changeLanguage('en')
      if (change) await crypt.write({ language: 'en' })
    } else {
      await i18next.changeLanguage(lang)
      if (change) await crypt.write({ language: lang })
    }
  }
  
  async selectLanguage () {
    const path = join(rootPath, '..', 'locales')
    const allLangs = (await glob('**/*.json', { cwd: path })).map((lang) => lang.split('/')[0])
    const langs = []
    for (const lang of allLangs) {
      if (langs.filter((langExist) => langExist === lang).length == 0) langs.push(lang)
    }
    const choices = langs.map((lang) => ({ name: `${flags(lang)} - ${lang}`, value: lang }))
    const response = await question({
      type: QuestionTypes.Select,
      message: 'Which language should I continue with?',
      choices
    })
    if (response === undefined) throw new Error('Please select a language')
    this.setLanguage(response, true)
  }
  /**
   * Inicializar i18
  */
  async create () {
    return await i18next.use(Backend).init<FsBackendOptions>({
      debug: false,
      lng: i18next.language ?? 'en',
      fallbackLng: i18next.language ?? 'en',
      backend: {
        loadPath: join(rootPath, '..', 'locales', '{{lng}}', '{{ns}}.json'),
      }
    })

  }
}

/**
 * Package language controller
 *
 * @type {TFunction<'translation', undefined>}
 */
export const i18: TFunction<'translation', undefined> = i18next.isInitialized ? i18next.t : await new Lang().create()
