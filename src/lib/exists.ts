import { stat } from 'fs/promises'

export const exists = async (dir: string): Promise<boolean> => {
  try {
    await stat(dir)
    return true
  } catch {
    return false
  }
}