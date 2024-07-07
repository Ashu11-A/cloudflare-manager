import { i18, Lang } from '@/controller/lang.js'
import { rootPath } from '@/index.js'
import { exists } from '@/lib/exists.js'
import { isJson } from '@/lib/validate.js'
import { DataCrypted } from '@/types/crypt.js'
import * as argon2 from 'argon2'
import { passwordStrength } from 'check-password-strength'
import { watch } from 'chokidar'
import { randomBytes } from 'crypto'
import CryptoJS from 'crypto-js'
import 'dotenv/config'
import { readFile, rm, writeFile } from 'fs/promises'
import forge from 'node-forge'
import { join } from 'path'
import { Questions } from './questions.js'

export const credentials = new Map<string, string | object | boolean | number>()

export class Crypt {
  async checker () {
    if (!(await exists(join(rootPath, '..', '.env'))) && process.env?.token === undefined) await this.create()
    if (!(await exists(join(rootPath, '..', 'privateKey.pem'))) || !(await exists(join(rootPath, '..', 'publicKey.pem')))) await this.genKeys()

    for (const path of ['.key', '.hash']) {
      const wather = watch(path, { cwd: rootPath })

      wather.on('change', async () => {
        console.log()
        console.log(i18('crypt.file_change'))
        await this.validate()
      })
    }
  }

  async genKeys () {
    const { privateKey, publicKey } = forge.pki.rsa.generateKeyPair(4096)

    await writeFile('privateKey.pem', forge.pki.privateKeyToPem(privateKey))
    await writeFile('publicKey.pem', forge.pki.publicKeyToPem(publicKey))
  }

  async privateKey () {
    if (!(await exists(join(rootPath, '..', 'privateKey.pem')))) throw new Error(i18('error.not_exist', { name: 'PrivateKey' }))
    return forge.pki.privateKeyFromPem(await readFile(join(rootPath, '..', 'privateKey.pem'), { encoding: 'utf8' }))
  }
    
  async publicKey () {
    if (!await (exists(join(rootPath, '..', 'privateKey.pem')))) throw new Error(i18('error.not_exist', { name: 'PublicKey' }))
    return forge.pki.publicKeyFromPem(await readFile(join(rootPath, '..', 'publicKey.pem'), { encoding: 'utf8' }))
  }

  async encript (data: string) {
    return (await this.publicKey()).encrypt(data, 'RSA-OAEP')
  }

  async decrypt (data: string) {
    return (await this.privateKey()).decrypt(data, 'RSA-OAEP')
  }

  async create () {
    const response = await new Questions({ message: i18('crypt.question') }).select({
      choices: [
        {
          name: i18('crypt.generate_title'),
          short: i18('crypt.generate_description'),
          value: 'random'
        },
        {
          name: i18('crypt.define_title'),
          short: i18('crypt.define_description'),
          value: 'defined'
        }
      ]
    })

    switch (response) {
    case 'random': {
      const password = randomBytes(256).toString('hex')
      await writeFile(join(rootPath, '..', '.env'), `token=${password}`)
      credentials.set('token', password)
      await this.write({})
      break
    }
    case 'defined': {
      const key = await new Questions({ message: i18('crypt.your_password') }).select({
        type: 'password',
        validate: (value: string) => passwordStrength(value).id < 2 ? i18('crypt.weak_password') : true
      })

      if (key === undefined) throw new Error(i18('error.undefined', { element: 'Password' }))
      await writeFile(join(rootPath, '..', '.env'), `token=${key}`)
      credentials.set('token', key)
      await this.write({})
      break
    }
    default: throw new Error(i18('error.not_select'))
    }
  }

  getToken (): string | undefined {
    let token = process.env.token

    if (token === undefined) token = credentials.get('token') as string

    return token
  }

  async validate () {
    const data = await readFile(join(rootPath, '..', '.key'), { encoding: 'utf-8' }).catch(() => '')
    const dataHash = await readFile(join(rootPath, '..', '.hash'), { encoding: 'utf-8' }).catch(() => '')

    const invalid = async () => {
      await this.delete()
      throw new Error((i18('error.invalid', { element: 'Hash' }), i18('crypt.delete_file')))
    }

    const hash = await argon2.verify(dataHash, data).catch(async () => await invalid())
    if (!hash) await invalid()
  }

  async delete () {
    if (await exists(join(rootPath, '..', '.key'))) await rm(join(rootPath, '..', '.key'))
    if (await exists(join(rootPath, '..', '.hash'))) await rm(join(rootPath, '..', '.hash'))
    if (await exists(join(rootPath, '..', '.env'))) await rm(join(rootPath, '..', '.env'))
  }

  async read (ephemeral?: boolean): Promise<DataCrypted | undefined> {
    const token = this.getToken()
    if (token === undefined) return
    const existKey = await exists(join(rootPath, '..', '.key'))
    if (!existKey) return undefined

    await this.validate()
    if (!ephemeral) console.log(i18('crypt.sensitive_information'), '\n')
    const data = await readFile(join(rootPath, '..', '.key'), { encoding: 'utf-8' }).catch(() => '')
    try {
      const TripleDESCrypt =  CryptoJS.TripleDES.decrypt(data, token).toString(CryptoJS.enc.Utf8)
      const BlowfishCrypt =  CryptoJS.Blowfish.decrypt(TripleDESCrypt, token).toString(CryptoJS.enc.Utf8)
      const AESCrypt =  CryptoJS.AES.decrypt(BlowfishCrypt, token).toString(CryptoJS.enc.Utf8)

      const outputData = JSON.parse(AESCrypt) as DataCrypted

      if (outputData.language !== undefined) new Lang().setLanguage(outputData.language)


      for (const [key, value] of Object.entries(outputData) as Array<[string, string | object | boolean | number]>) {
        credentials.set(key, value)
      }

    
      return outputData
    } catch {
      await this.delete()
      throw new Error(i18('error.invalid', { element: 'token' }))
    }
  }

  async write (value: Record<string, string> | string | object) {
    if (!isJson(value)) throw new Error(i18('error.invalid', { element: '.key' }))

    const token = this.getToken()
    if (token === undefined) return
  
    const data = Object.assign(await this.read(true) ?? {}, value)

    const AESCrypt = CryptoJS.AES.encrypt(JSON.stringify(data), token).toString()
    const BlowfishCrypt = CryptoJS.Blowfish.encrypt(AESCrypt, token).toString()
    const TripleDESCrypt = CryptoJS.TripleDES.encrypt(BlowfishCrypt, token).toString()
    const hashCrypt = await argon2.hash(TripleDESCrypt)

    await writeFile(join(rootPath, '..', '.key'), TripleDESCrypt)
    await writeFile(join(rootPath, '..', '.hash'), hashCrypt)
  }
}
