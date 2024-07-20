import Cache from '@/class/cache.js'
import { Record } from 'cloudflare/resources/dns/records.mjs'
import { Zone } from 'cloudflare/resources/zones/zones.mjs'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

/**
 * The directory name of the current module.
 *
 * @type {string}
 */
export const rootPath: string = dirname(fileURLToPath(import.meta.url))

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

export const credentials = new Map<string, string | object | boolean | number>()