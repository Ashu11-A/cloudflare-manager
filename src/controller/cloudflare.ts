import Cloudflare from 'cloudflare'
import 'dotenv/config'

const createClient = async () => {
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
