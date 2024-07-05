import { exec } from 'child_process'
import { name } from '../../package.json'

export async function isGlobal (): Promise<boolean> {
  return await new Promise<boolean>(resolve => {
    const process = exec(`npm list --depth 1 --global ${name}`)
    let output = ''

    process.stdout?.on('data', (content) => {
      output += content
    })

    process.on('close', (code) => {
      if (code !== 0) resolve(false)

      if (output.includes(name)) resolve(true)
      resolve(false)
    })
  })
}