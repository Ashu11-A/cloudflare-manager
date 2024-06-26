import { Questions } from '@/class/questions.js';
import { Zone } from 'cloudflare/resources/zones/zones.mjs'
import Cache from '@/class/cache.js'
import cloudflare from '@/controller/cloudflare.js'

const zones = new Cache<Zone[]>('zones')
const client = await cloudflare();

(async () => {
    zones.save((await client.zones.list()).result)
    const zoneId = await new Questions().select('Selecione a zona que deseja modificar', zones.get().map((zone) => ({
        title: zone.name,
        value: zone.id
    })))
    console.log(zoneId)
})()