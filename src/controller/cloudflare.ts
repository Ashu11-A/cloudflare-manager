import 'dotenv/config'
import Cloudflare from 'cloudflare'
import { readFile, writeFile } from 'fs/promises'
import { Questions } from '@/class/questions.js'

const question = new Questions()

export async function checker() {
    let email: string | undefined
    let key: string | undefined
    let data = await readFile('.env', { encoding: 'utf-8' }) ?? ''

    if ([undefined, ""].includes(process.env.CLOUDFLARE_EMAIL)) {
        console.log('Email do cloudflare está indefinido!')
        email = await question.ask('Email do Cloudflare')
    }
    if ([undefined, ""].includes(process.env.CLOUDFLARE_API_KEY)) {
        console.log('Token do cloudflare está indefinido!')
        key = await question.ask('Token do Cloudflare')
    }


    if (email !== undefined) {
        const regex = /CLOUDFLARE_EMAIL="(?:[^"]|"")*"/im;

        data = regex.test(data)
        ? data.replace(regex, `CLOUDFLARE_EMAIL="${email}"`)
        : data += `\nCLOUDFLARE_EMAIL="${email}"`
    }
    if (key !== undefined) {
        const regex = /CLOUDFLARE_API_KEY="(?:[^"]|"")*"/im;

        data = regex.test(data)
        ? data.replace(regex, `CLOUDFLARE_API_KEY="${email}"`)
        : data += `\nCLOUDFLARE_API_KEY="${key}"`
    }

    await writeFile('.env', data)
}

const client = async () => {
    await checker();
    (await import('dotenv')).config({ override: true })
    return new Cloudflare({
        apiEmail: process.env.CLOUDFLARE_EMAIL,
        apiKey: process.env.CLOUDFLARE_API_KEY
    })
}

export default client
