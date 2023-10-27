import fs from 'fs'
import path from 'path'

export function getKeystore (filepath: string): any {
  try {
    return JSON.parse(
      fs.readFileSync(path.resolve(filepath), 'utf8')
    )
  } catch (err) {
    throw new Error(`keystore does not exist at ${filepath}`)
  }
}
