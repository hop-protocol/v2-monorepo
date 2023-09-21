import mcache from 'memory-cache'
const cache = new mcache.Cache()

export class DbController {
  async putGasFeeData (input: any) {
    const { chainSlug, timestamp, feeData } = input
    const key = `${chainSlug}-${timestamp}-fee-data`
    await cache.put(key, {
      chainSlug,
      timestamp,
      ...feeData,
    })
  }

  async getGasFeeData(input: any): Promise<any> {
      const { chainSlug, timestamp } = input

      const keys = cache.keys()

      let closestTimestamp = 0
      let closestKey = ''
      keys.forEach((key: string) => {
          const keyChainSlug = key.split('-')[0]
          const keyTimestamp = parseInt(key.split('-')[1])
          if (keyChainSlug === chainSlug && keyTimestamp > closestTimestamp && keyTimestamp <= timestamp) {
              closestTimestamp = keyTimestamp
              closestKey = key
          }
      })

      const feeData = await cache.get(closestKey)
      return feeData
  }
}
