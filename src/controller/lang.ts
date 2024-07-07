import { Crypt } from '@/class/crypt.js'
import { rootPath } from '@/index.js'
import { exists } from '@/lib/exists.js'
import flags from 'country-code-to-flag-emoji'
import { glob } from 'glob'
import i18next from 'i18next'
import Backend, { FsBackendOptions } from 'i18next-fs-backend'
import { join } from 'path'
import prompts, { Choice } from 'prompts'

export class Lang {  
  async setLanguage (lang: string, change?: boolean) {
    const path = join(rootPath, '..', 'locales', lang)
    const crypt = new Crypt()
    
    if (!(await exists(path))) {
      console.log(`⛔ The selected language (${lang}) does not exist, using English by default`)
      if (change) await crypt.write({ language: 'en' })
      i18next.changeLanguage('en')
      return
    }
    await i18next.changeLanguage(lang).then(async () => { 
      if (change) await crypt.write({ language: lang })
    })
  }
  
  async selectLanguage () {
    const path = join(rootPath, '..', 'locales')
    const allLangs = (await glob('**/*.json', { cwd: path })).map((lang) => lang.split('/')[0])
    const langs = []
    for (const lang of allLangs) {
      if (langs.filter((langExist) => langExist === lang).length == 0) langs.push(lang)
    }
    const choices: Choice[] = langs.map((lang) => ({ title: `${flags(lang)} - ${lang}`, value: lang } satisfies Choice))
    const response = await prompts({
      name: 'Language',
      type: 'select',
      choices,
      message: 'Which language should I continue with?',
      initial: 1
    })
    if (response.Language === undefined) throw new Error('Please select a language')
      
    this.setLanguage(response.Language, true)
  }
  /**
   * Inicializar i18
  */
  async create () {
    return await i18next.use(Backend).init<FsBackendOptions>({
      debug: false,
      lng: 'en',
      backend: {
        loadPath: join(rootPath, '..', 'locales', '{{lng}}', '{{ns}}.json'),
      }
    })

  }
}
  