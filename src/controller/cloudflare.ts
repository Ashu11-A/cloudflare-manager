import { Questions } from '@/class/questions.js'
import { exists } from '@/lib/exists.js'
import Cloudflare from 'cloudflare'
import 'dotenv/config'
import { readFile, writeFile } from 'fs/promises'


export async function checker() {
  let email: string | undefined
  let key: string | undefined
  let data = await exists('.env') ? await readFile('.env', { encoding: 'utf-8' }) ?? '' : ''
    
  if ([undefined, ''].includes(process.env.CLOUDFLARE_EMAIL)) {
    email = await new Questions({ message: 'Email do cloudflare está indefinido!' }).ask('Email do Cloudflare')
  }
  if ([undefined, ''].includes(process.env.CLOUDFLARE_API_KEY)) {
    key = await new Questions({ message: 'Token do cloudflare está indefinido!' }).ask('Token do Cloudflare')
  }


  if (email !== undefined) {
    const regex = /CLOUDFLARE_EMAIL="(?:[^"]|"")*"/im

    data = regex.test(data)
      ? data.replace(regex, `CLOUDFLARE_EMAIL="${email}"`)
      : data += `\nCLOUDFLARE_EMAIL="${email}"`
  }
  if (key !== undefined) {
    const regex = /CLOUDFLARE_API_KEY="(?:[^"]|"")*"/im

    data = regex.test(data)
      ? data.replace(regex, `CLOUDFLARE_API_KEY="${email}"`)
      : data += `\nCLOUDFLARE_API_KEY="${key}"`
  }

  await writeFile('.env', data)
}

const client = async () => {
  if (!process.env.isTest) await checker();
  (await import('dotenv')).config({ override: true })
  return new Cloudflare({
    apiEmail: process.env.CLOUDFLARE_EMAIL ?? '',
    apiKey: process.env.CLOUDFLARE_API_KEY ?? ''
  })
}

export default client
