import { fileURLToPath } from 'url'
import { dirname } from 'path'
import Cache from '@/class/cache.js';
import cloudflare from '@/controller/cloudflare.js';
import { Zone } from 'cloudflare/resources/zones/zones.mjs';

export const __dirname = dirname(fileURLToPath(import.meta.url))

export const client = await cloudflare();
export const zones = new Cache<Zone[]>('zones')
export const zone = new Cache<{ name: string, id: string }>('zone')
export const page = new Cache<string>('pagination')