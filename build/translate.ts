import { input } from '@inquirer/prompts'
import clipboardListener from 'clipboard-event'
import { copy, paste } from 'copy-paste'
import { rm, writeFile } from 'fs/promises'
import { dirname, join } from 'path'
import { extractTypes, Properties } from './lib/extractTypes'

const rootPath = dirname(import.meta.dirname)

enum Records {
  ARecord = 'A',
  AAAARecord = 'AAAA',
  CAARecord = 'CAA',
  CERTRecord = 'CERT',
  CNAMERecord = 'CNAME',
  DNSKEYRecord = 'DNSKEY',
  DSRecord = 'DS',
  HTTPSRecord = 'HTTPS',
  LOCRecord = 'LOC',
  MXRecord = 'MX',
  NAPTRRecord = 'NAPTR',
  NSRecord = 'NS',
  PTRRecord = 'PTR',
  SMIMEARecord = 'SMIMEA',
  SRVRecord = 'SRV',
  SSHFPRecord = 'SSHFP',
  SVCBRecord = 'SVCB',
  TLSARecord = 'TLSA',
  TXTRecord = 'TXT',
  URIRecord = 'URI'
}

const arrayProperties: { [key: string]: string }[] = []
const formattedObject: Record<string, any> = {}

const objectToArray = (recordName: string, object: Record<string, Properties>) => {
  for (const [name, data] of Object.entries(object)) {
    if (data.properties !== undefined) {
      objectToArray(`${recordName}.${name}`, data.properties)
    } else {
      arrayProperties.push({ [`${recordName}.${name}`]: data.description })
    }
  }
}

const formatObject = (recordPath: string[], object: Record<string, Properties>) => {
  for (const [name, data] of Object.entries(object)) {
    if ([
      'zone_id', 'zone_name', 'type', 'id',
      'ttl', 'tags', 'proxiable', 'modified_on',
      'meta', 'locked', 'comment', 'created_on',
      'source', 'auto_added', 'tag'
    ].includes(name)) continue

    if (data.properties !== undefined) {
      formatObject([...recordPath, name], data.properties)
      continue
    }

    const pathParts = [...recordPath, name]
    let currentLevel = formattedObject

    for (let i = 0; i < pathParts.length - 1; i++) {
      if (!currentLevel[pathParts[i]]) {
        currentLevel[pathParts[i]] = {}
      }
      currentLevel = currentLevel[pathParts[i]]
    }

    currentLevel[pathParts[pathParts.length - 1]] = data
  }
}

const removeDuplicates = (array: { [key: string]: string }[]) => {
  const seen = new Set<string>()

  return array.filter((item) => {
    if (Object.values(item)[0] === '') return false
    
    const serializedItem: string = JSON.stringify(Object.values(item))
    return seen.has(serializedItem) ? false : seen.add(serializedItem)
  }).map((item) => Object.values(item)).flat()
}

const findAndReplace = (search: string, replace: string) => {
  for(const [, content] of Object.entries(arrayProperties)) {
    const [path, value] = Object.entries(content)[0]
    if (value === search) {
      const keys = path.split('.')
      keys.push('description')

      let currentLevel = formattedObject
    
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i]
        if (currentLevel[key] === undefined) {
          return
        }
        currentLevel = currentLevel[key]
      }
    
      const lastKey = keys[keys.length - 1]
      if (currentLevel[lastKey] !== undefined) {
        currentLevel[lastKey] = replace
      }
    }
  }
}

(async () => {
  const language = await input({
    message: 'Which language do you want to convert the cloudflare records into?',
    default: 'pt-BR'
  })

  let currentRecord = 0
  for (const record in Records) {
    currentRecord++
    console.log(`Extracting properties of ${record} (${currentRecord}/${Object.keys(Records).length})`)
    const pathToCloudflare = join(rootPath, 'node_modules/cloudflare/src/resources/dns/records.ts')

    const typing = extractTypes(pathToCloudflare, record)

    if (typing === undefined) continue

    formatObject([record], typing)
    objectToArray(record, typing)
  }

  if (language === 'en') {
    await writeFile(`locales/${language}/cloudflare.json`, JSON.stringify(formattedObject, null, 2), { encoding: 'utf-8' }) 
    return
  }

  const textToTranslate = removeDuplicates(arrayProperties)

  await writeFile(`locales/${language}/records.json`, JSON.stringify(formattedObject, null, 2), { encoding: 'utf-8' })
  await writeFile(`locales/${language}/paths.json`, JSON.stringify(arrayProperties, null, 2), { encoding: 'utf-8' })
  await writeFile(`locales/${language}/texts.json`, JSON.stringify(textToTranslate, null, 2), { encoding: 'utf-8' })
  

  console.log('⚠️  The text will be moved to the "Copy and paste" area, and you should paste the translation afterwards.')

  for (const text of textToTranslate) {
    console.log(`\n📋 Copied: ${text}\n`)
    await new Promise<void>((resolve, reject) => {
      copy(text, (err) => {
        if (err === null) resolve()
        reject(err)
      })
    })

    const result = await new Promise<string>((resolve) => {
      clipboardListener.startListening()
      clipboardListener.once('change', () => {
        clipboardListener.stopListening()
        resolve(paste())
      })
    })

    console.log(`🚨 Text detected: ${result}`)

    findAndReplace(text, result)
    await writeFile(`locales/${language}/cloudflare.json`, JSON.stringify(formattedObject, null, 2), { encoding: 'utf-8' })
  }

  await rm(`locales/${language}/records.json`)
  await rm(`locales/${language}/paths.json`)
  await rm(`locales/${language}/texts.json`)
})()
