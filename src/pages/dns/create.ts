import { Page } from '@/class/pages.js'
import { Questions } from '@/class/questions.js'
import { client, zone } from '@/index.js'
import { extractTypes, Properties } from '@/lib/extractTypes.js'
import { PageTypes } from '@/types/page.js'
import chalk from 'chalk'

enum Types {
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
    const { id } = zone.get()
    const type = await new Questions().autoComplete<string>({
      pageName: options.interaction.name,
      message: '🎯 Escolha o tipo de Record',
      choices: Object.values(Types).map((type) => ({ value: type, name: type }))
    })
        
    const record = Object.entries(Types).find(([, typeName]) => typeName === type)?.[0] as unknown as string
    /**
     * Caso o Record não esteja na lista, então ele é um comando.
     */
    if (record === undefined) {
      options.reply(type)
      return options
    }

    /**
     * Isso pega e converte as tipagens que o cloudflare contem, e deixa de uma forma consumivel.
     */
    const properties = extractTypes('node_modules/cloudflare/src/resources/dns/records.ts', record)
    if (properties === undefined) throw new Error(`Não foi possivel achar os types de ${record}`)

    /**
     * Converte para o formato utilizado no snippet do enquirer.
     */
    const variables = Object.entries(properties).map(([name, { description, fullTypeName, properties, isOptional }]) => {
      if ([
        'zone_id', 'zone_name', 'type', 'id',
        'ttl', 'tags', 'proxiable', 'modified_on',
        'meta', 'locked', 'comment', 'created_on',
        'source', 'auto_added'
      ].includes(name)) return

      let steps = 1

      const convertProperties = (props: Record<string, Properties>): string => {
        let result = ''
    
        Object.entries(props).forEach(([propName, propDetails]) => {
          const { description, fullTypeName, properties, isOptional } = propDetails
          const spaces = '    '.repeat(steps)
          if (properties) {
            result += `${spaces}"${propName}": "\${[${fullTypeName}${isOptional ? ' - optional' : ''}]${description.length === 0 ? '' : ` ${description}`}}"\n`
            steps++
            result += convertProperties(properties) // Chamada recursiva para propriedades aninhadas
          } else {
            result += `${spaces}"${propName}": "\${[${fullTypeName}${isOptional ? ' - optional' : ''}]${description.length === 0 ? '' : ` ${description}`}}"\n`
          }
          steps = 1
        })
    
        return result
      }

      let output = ''
      
      if (properties) {
        output = `${name}: {\n`
        output += convertProperties(properties)
        output += '}'
      } else {
        output = `"${name}": "\${[${fullTypeName}${isOptional ? ' - optional' : ''}]${description.length === 0 ? '' : ` ${description}`}}"`
      }
      return output
    }) as string[]

    const { result } = await new Questions().multipleQuestions({ message: `Opções para criar o Record ${type}`, templates: variables })
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