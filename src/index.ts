import { fileURLToPath } from 'url'
import { dirname } from 'path'
import Cache from '@/class/cache.js';
import cloudflare from '@/controller/cloudflare.js';
import { Zone } from 'cloudflare/resources/zones/zones.mjs';
import { Record } from 'cloudflare/resources/dns/records.mjs';

export const __dirname = dirname(fileURLToPath(import.meta.url))

export const client = await cloudflare();
export const page = new Cache<string>('pagination')
export const zones = new Cache<Zone[]>('zones')
export const zone = new Cache<{ name: string, id: string }>('zone')
export const records = new Cache<Record[]>('records')