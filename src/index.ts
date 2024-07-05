import { fileURLToPath } from 'url'
import { dirname } from 'path'
import Cache from '@/class/cache.js'
import cloudflare from '@/controller/cloudflare.js'
import { Zone } from 'cloudflare/resources/zones/zones.mjs'
import { Record } from 'cloudflare/resources/dns/records.mjs'
import Cloudflare from 'cloudflare'

/**
 * The directory name of the current module.
 *
 * @type {string}
 */
export const __dirname: string = dirname(fileURLToPath(import.meta.url))

/**
 * Cloudflare client instance.
 *
 * @type {Cloudflare}
 */
export const client: Cloudflare = await cloudflare()

/**
 * Cache for pagination data.
 *
 * @type {Cache<string>}
 */
export const page: Cache<string> = new Cache<string>('pagination')

/**
 * Cache for an array of Cloudflare zones.
 *
 * @type {Cache<Zone[]>}
 */
export const zones: Cache<Zone[]> = new Cache<Zone[]>('zones')

/**
 * Cache for a Cloudflare zone with a name and ID.
 *
 * @type {Cache<{ name: string, id: string }>}
 */
export const zone: Cache<{ name: string, id: string }> = new Cache<{ name: string, id: string }>('zone')

/**
 * Cache for an array of Cloudflare DNS records.
 *
 * @type {Cache<Record[]>}
 */
export const records: Cache<Record[]> = new Cache<Record[]>('records')
