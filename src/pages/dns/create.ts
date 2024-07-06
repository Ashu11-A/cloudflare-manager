import { Page } from '@/class/pages.js'
import { Questions } from '@/class/questions.js'
import { client, zone } from '@/index.js'
import { extractTypes, Properties } from '@/lib/extractTypes.js'
import { PageTypes } from '@/types/page.js'
import chalk from 'chalk'

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
    const { id } = zone.get()
    const type = await new Questions({ message: '🎯 Escolha o tipo de Record' }).autoComplete<string>({
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

    /**
     * Isso converte as tipagens do cloudflare.
     * @returns {Record<string, Properties> | undefined}
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
        const all = Object.keys(props).length
        let actual = 0
        Object.entries(props).forEach(([propName, propDetails]) => {
          const { description, fullTypeName, properties, isOptional } = propDetails
          const spaces = '    '.repeat(steps)
          actual++
          if (properties) {
            result += `${spaces}"${propName}": "\${[${fullTypeName}${isOptional ? ', optional' : ''}] ${description.length === 0 ? propName : description}}"${actual < all ? ',' : ''}\n`
            steps++
            result += convertProperties(properties) // Chamada recursiva para propriedades aninhadas
          } else {
            result += `${spaces}"${propName}": "\${[${fullTypeName}${isOptional ? ', optional' : ''}] ${description.length === 0 ? propName : description}}"${actual < all ? ',' : ''}\n`
          }
          steps = 1
        })
    
        return result
      }

      let output = ''
      
      if (properties) {
        output += `"${name}": {\n`
        output += convertProperties(properties)
        output += '}'
      } else {
        output = `"${name}": "\${[${fullTypeName}${isOptional ? ', optional' : ''}] ${description.length === 0 ? name : description}}"`
      }
      return output
    }) as string[]

    const { result } = await new Questions({ message: `Opções para criar um Record ${type}` }).multipleQuestions({ templates: variables })
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