import { credentials } from '@/index.js'
import Cloudflare from 'cloudflare'

const createClient = async () => {
  return new Cloudflare({
    apiEmail: credentials.get('email') as string ?? '',
    apiKey: credentials.get('token') as string ?? ''
  })
}

/**
 * Cloudflare client instance.
 *
 * @type {Cloudflare}
 */
export const client: Cloudflare = await createClient()
