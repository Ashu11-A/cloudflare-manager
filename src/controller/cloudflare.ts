import { credentials, Crypt } from '@/class/crypt.js'
import { question } from '@/class/questions.js'
import { QuestionTypes } from '@/types/questions.js'
import Cloudflare from 'cloudflare'
import 'dotenv/config'


export async function checker() {
  const data = await new Crypt().read()

  let email = data?.email
  let token = data?.token

  if ([undefined, ''].includes(email)) {
    email = await question({
      type: QuestionTypes.Input,
      message: 'Email do Cloudflare',
    })()
  }
  if ([undefined, ''].includes(token)) {
    token = await question({
      type: QuestionTypes.Password,
      message: 'Token do Cloudflare'
    })()
  }

  await new Crypt().write({ email, token })
}

const createClient = async () => {
  if (!process.env.isTest) await checker();
  (await import('dotenv')).config({ override: true })
  return new Cloudflare({
    apiEmail: process.env.CLOUDFLARE_EMAIL ?? '',
    apiKey: process.env.CLOUDFLARE_API_KEY ?? ''
  })
}

/**
 * Cloudflare client instance.
 *
 * @type {Cloudflare}
 */
export const client: Cloudflare = await createClient()
