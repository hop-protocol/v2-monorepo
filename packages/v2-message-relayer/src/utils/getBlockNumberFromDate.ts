import BlockDater from 'ethereum-block-by-date'
import { DateTime } from 'luxon'

export async function getBlockNumberFromDate (provider: any, timestamp: number): Promise<number> {
  const blockDater = new BlockDater(provider)
  const date = DateTime.fromSeconds(timestamp).toJSDate()

  let retryCount = 0
  let info: any
  while (true) {
    try {
      info = await blockDater.getDate(date)
      if (!info) {
        throw new Error('could not retrieve block number')
      }
    } catch (err) {
      retryCount++
      // console.warn(`getBlockNumberFromDate: retrying ${retryCount}`)
      if (retryCount < 5) continue
      break
    }
    break
  }

  if (!info) {
    throw new Error('could not retrieve block number')
  }
  return info.block
}
