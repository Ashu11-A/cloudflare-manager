import { exec } from 'child_process'
import packageData from '../../package.json' assert { type: 'json' }

export async function isGlobal (): Promise<boolean> {
  return await new Promise<boolean>(resolve => {
    const process = exec(`npm list --depth 1 --global ${packageData.name}`)
    let output = ''

    process.stdout?.on('data', (content) => {
      output += content
    })

    process.on('close', (code) => {
      if (code !== 0) resolve(false)

      if (output.includes(packageData.name)) resolve(true)
      resolve(false)
    })
  })
}