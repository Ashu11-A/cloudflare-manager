import { Page } from '@/class/pages.js'
import { question } from '@/class/questions.js'
import { zone } from '@/index.js'
import { PageTypes } from '@/types/page.js'
import chalk from 'chalk'
import { rootPath } from '@/index.js'
import { join } from 'path'
import { client } from '@/controller/cloudflare.js'
import { QuestionTypes } from '@/types/questions.js'
import { readFile } from 'fs/promises'
import { Lang } from '@/controller/lang.js'

type Properties = {
type: string,
fullTypeName: string
description: string
isOptional: boolean
properties: Record<string, Properties>
}

enum RecordsType {
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

new Page({
  name: 'dns-create',
  type: PageTypes.Option,
  previous: 'dns',
  loaders: [],
  requirements: [zone],
  async run(options) {
    const [zone] = options.interaction.requirements
    const { id } = zone.getData()
    const type = await question({
      type: QuestionTypes.AutoComplete,
      message: '🎯 Escolha o tipo de Record',
      pageName: options.interaction.name,
      choices: Object.values(RecordsType).map((type) => ({ value: type, name: type }))
    })
        
    const record = Object.entries(RecordsType).find(([, typeName]) => typeName === type)?.[0] as unknown as string
    /**
     * Caso o Record não esteja na lista será um comando.
     */
    if (record === undefined) {
      options.reply(type)
      return options
    }

    const properties = JSON.parse(await readFile(`${join(rootPath, '..')}/locales/${Lang.language}/cloudflare.json`, { encoding: 'utf-8' }))[record] as Record<string, Properties>

    // console.log(properties)

    if (properties === undefined) throw new Error(`Não foi possivel achar os types de ${record}`)

    /**
     * Converte para o formato utilizado no snippet do enquirer.
     */
    const variables = Object.entries(properties).map(([name, properties]) => {
      const { description, fullTypeName, isOptional } = properties
      if ([
        'zone_id', 'zone_name', 'type', 'id',
        'ttl', 'tags', 'proxiable', 'modified_on',
        'meta', 'locked', 'comment', 'created_on',
        'source', 'auto_added'
      ].includes(name)) return

      let steps = 1

      const convertProperties = (props: Properties): string => {
        let result = ''
        const all = Object.keys(props).length
        let actual = 0
        Object.entries(props).forEach(([propName, propDetails]) => {
          const { description, fullTypeName, isOptional } = propDetails as unknown as Properties
          const spaces = '    '.repeat(steps)
          actual++
          if (description === undefined) {
            steps++
            result += convertProperties(propDetails as unknown as Properties) // Chamada recursiva para propriedades aninhadas
          } else {
            result += `${spaces}"${propName}": "\${[${fullTypeName}${isOptional ? ', optional' : ''}] ${description.length === 0 ? propName : description}}"${actual < all ? ',' : ''}\n`
          }
          steps = 1
        })
    
        return result
      }

      let output = ''
      
      if (description === undefined) {
        output += `"${name}": {\n`
        output += convertProperties(properties)
        output += '}'
      } else {
        output = `"${name}": "\${[${fullTypeName}${isOptional ? ', optional' : ''}] ${description.length === 0 ? name : description}}"`
      }
      return output
    }) as string[]

    const { result } = await question<{ values: Record<string, string>, result: string }>({
      type: QuestionTypes.Snippet,
      message: `Opções para criar um Record ${type}`,
      templates: variables
    })
    const json = JSON.parse(result)

    await client.dns.records.create(Object.assign(json, { type, path_zone_id: id, zone_id: id}))
      .then((value) => {
        console.log(`[${value.name}] ✅ ${chalk.green('Record criado com sucesso!')}`)
      })
      .catch((err) => console.log(err))

    options.reply('dns')
    return options  
  },
})