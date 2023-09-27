import wait from 'wait'
import { BigNumber, constants } from 'ethers'
import { ChainController } from './ChainController'
import { DateTime } from 'luxon'
import { DbController } from './DbController'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { getBlockNumberFromDate } from './utils/getBlockNumberFromDate'
import { pollIntervalSeconds } from './config'
import { serialize } from '@ethersproject/transactions'

let dbController: DbController

export class Controller {
  chainControllers: Record<string, ChainController>
  dbController: DbController

  constructor () {
    this.chainControllers = {
      ethereum: new ChainController('ethereum'),
      arbitrum: new ChainController('arbitrum'),
      optimism: new ChainController('optimism'),
      base: new ChainController('base')
    }

    if (!dbController) {
      dbController = new DbController()
    }

    this.dbController = dbController
  }

  async getFeeData (input: any) {
    const { chainSlug, timestamp } = input
    let item = await this.dbController.getNearestGasFeeData({ chainSlug, timestamp })
    if (!item) {
      const startTime = DateTime.fromSeconds(timestamp).toUTC().minus({ minutes: 10 }).toSeconds()
      const endTime = DateTime.fromSeconds(timestamp).toUTC().plus({ minutes: 10 }).toSeconds()
      const chainController = this.chainControllers[chainSlug]
      const startBlockNumber = await getBlockNumberFromDate(chainController.provider, startTime)
      const endBlockNumber = await getBlockNumberFromDate(chainController.provider, endTime)
      await this.syncBlockNumberRange(chainSlug, startBlockNumber, endBlockNumber)
    }

    item = await this.dbController.getNearestGasFeeData({ chainSlug, timestamp })
    if (!item) {
      throw new Error('result not found')
    }

    const dt = DateTime.fromSeconds(item.timestamp)
    const expiration = dt.plus({ minutes: 10 }).toSeconds()
    return {
      expiration,
      ...item
    }
  }

  async calcGasCost (input: any) {
    const { chainSlug, timestamp, gasLimit, txData } = input

    let item = await this.dbController.getNearestGasFeeData({ chainSlug, timestamp })
    if (!item) {
      const startTime = DateTime.fromSeconds(timestamp).toUTC().minus({ minutes: 10 }).toSeconds()
      const endTime = DateTime.fromSeconds(timestamp).toUTC().plus({ minutes: 10 }).toSeconds()
      const chainController = this.chainControllers[chainSlug]
      const startBlockNumber = await getBlockNumberFromDate(chainController.provider, startTime)
      const endBlockNumber = await getBlockNumberFromDate(chainController.provider, endTime)
      await this.syncBlockNumberRange(chainSlug, startBlockNumber, endBlockNumber)
    }

    item = await this.dbController.getNearestGasFeeData({ chainSlug, timestamp })
    if (!item) {
      throw new Error('result not found')
    }

    const baseFeePerGas = BigNumber.from(item.feeData.baseFeePerGas)
    let gasCost: BigNumber = BigNumber.from(0)
    if (chainSlug === 'ethereum') {
      gasCost = baseFeePerGas.mul(gasLimit)
    }

    if (chainSlug === 'optimism' || chainSlug === 'base') {
      const maxPriorityFeePerGas = parseUnits('0.0001', 'gwei') // https://community.optimism.io/docs/developers/build/transaction-fees/#priority-fee
      const txGasPrice = baseFeePerGas.add(maxPriorityFeePerGas)
      const l2Fee = txGasPrice.mul(gasLimit)

      const l1BaseFee = item.feeData.l1BaseFee
      const l1FeeOverhead = 2100 // mainnet: 188
      const l1FeeScalar = 1000000 // mainnet: 684000

      function getL1GasUsed (data: string) {
        const _data = Buffer.from(data.replace('0x', ''), 'hex')
        let total = 0
        const length = _data.length
        for (let i = 0; i < length; i++) {
          if (_data[i] === 0) {
            total += 4
          } else {
            total += 16
          }
        }
        const unsigned = total + l1FeeOverhead
        return BigNumber.from(unsigned + (68 * 16))
      }

      function getL1Fee (_data: string) {
        const DECIMALS = 6
        const l1GasUsed = getL1GasUsed(_data)
        console.log('l1GasUsed:', l1GasUsed.toString())
        const l1Fee = l1GasUsed.mul(BigNumber.from(l1BaseFee))
        const divisor = BigNumber.from(10).pow(DECIMALS)
        const unscaled = l1Fee.mul(BigNumber.from(l1FeeScalar))
        const scaled = unscaled.div(divisor)
        return scaled
      }

      const serialized = serialize({
        data: txData,
        to: constants.AddressZero,
        gasPrice: baseFeePerGas,
        type: 1,
        gasLimit: gasLimit,
        nonce: 1
      })

      const l1Fee = getL1Fee(serialized)
      const totalFee = l1Fee.add(l1Fee)
      console.log('fee info', formatUnits(l1Fee, 18), formatUnits(l2Fee, 18), formatUnits(totalFee, 18))

      return {
        l1Fee: formatUnits(l1Fee, 18),
        l2Fee: formatUnits(l2Fee, 18),
        gasCost: formatUnits(totalFee, 18)
      }
    }

    return {
      gasCost: formatUnits(gasCost, 18)
    }
  }

  async startPoller (options: any = {}) {
    const { syncStartTimestamp } = options
    while (true) {
      let isFirstPoll = true
      try {
        console.log('poll')
        for (const chainSlug in this.chainControllers) {
          try {
            const chainController = this.chainControllers[chainSlug]
            console.log('fetching chain', chainSlug)

            let customStartSyncBlock: any = null
            if (syncStartTimestamp && isFirstPoll) {
              customStartSyncBlock = await getBlockNumberFromDate(chainController.provider, syncStartTimestamp)
            }

            const syncKey = `${chainSlug}`
            let lastSyncedBlocked: any = null
            try {
              if (customStartSyncBlock) {
                lastSyncedBlocked = customStartSyncBlock
              } else {
                lastSyncedBlocked = await this.dbController.getSyncState(syncKey)
              }
            } catch (err: any) {
            }
            const endBlockNumber = (await chainController.getBlockNumber() - 1)
            const startBlockNumber = lastSyncedBlocked ? Number(lastSyncedBlocked) : endBlockNumber - 1
            if (startBlockNumber === endBlockNumber || startBlockNumber > endBlockNumber) {
              continue
            }

            await this.syncBlockNumberRange(chainSlug, startBlockNumber, endBlockNumber, async (res: any) => {
              await this.dbController.putSyncState(syncKey, endBlockNumber)
            })
          } catch (err: any) {
            console.error(`error fetching chain ${chainSlug}`, err)
          }
        }
      } catch (err: any) {
        console.error('poll error', err)
      }
      isFirstPoll = false

      await wait(pollIntervalSeconds * 1000)
    }
  }

  async syncBlockNumberRange (chainSlug: string, startBlockNumber: number, endBlockNumber: number, cb?: any) {
    console.log('chain', chainSlug, 'startBlockNumber', startBlockNumber, 'endBlockNumber', endBlockNumber, 'diff', endBlockNumber - startBlockNumber)
    let lastItem: any
    for (let blockNumber = startBlockNumber; blockNumber <= endBlockNumber; blockNumber++) {
      if (lastItem && blockNumber === Number(lastItem.blockNumber) + 1) {
        const exists = await this.dbController.getGasFeeData({ chainSlug, timestamp: lastItem.timestamp })
        if (exists) {
          console.log('chain', chainSlug, 'blockNumber', blockNumber, 'lastTimestamp', lastItem.timestamp, 'exists')
          continue
        }
      }

      const res = await this.syncBlockNumber(chainSlug, blockNumber)
      if (!res) {
        lastItem = null
        continue
      }

      // lastItem = res
      if (cb) {
        await cb(res)
      }
    }
  }

  async syncBlockNumber (chainSlug: string, blockNumber: number) {
    console.log('syncBlockNumber', chainSlug, blockNumber)
    const exists = await this.dbController.getGasFeeData({ chainSlug, blockNumber })
    if (exists) {
      console.log('syncBlockNumber', chainSlug, blockNumber, 'exists')
      return exists
    }

    const chainController = this.chainControllers[chainSlug]
    const feeData = await chainController.getFeeData(blockNumber)
    const timestamp = feeData.timestamp
    const dt = DateTime.fromSeconds(timestamp)
    const relativeTime = dt.toRelative()
    const gwei = formatUnits(feeData.feeData.baseFeePerGas, 9)
    console.log('storing', chainSlug, 'blockNumber', blockNumber, 'gwei', gwei, 'timestamp', timestamp, 'relativeTime', relativeTime, 'feeData', JSON.stringify(feeData))
    const data = {
      chainSlug,
      blockNumber,
      timestamp,
      feeData
    }

    await this.dbController.putGasFeeData(data)
    return data
  }

  async getGasPriceValid (input: any) {
    const { gasPrice, chainSlug, timestamp } = input

    let items = await this.dbController.getGasFeeDataRange({ chainSlug, timestamp })
    if (items.length === 0) {
      const startTime = DateTime.fromSeconds(timestamp).toUTC().minus({ minutes: 10 }).toSeconds()
      const endTime = DateTime.fromSeconds(timestamp).toUTC().plus({ minutes: 10 }).toSeconds()
      const chainController = this.chainControllers[chainSlug]
      const startBlockNumber = await getBlockNumberFromDate(chainController.provider, startTime)
      const endBlockNumber = await getBlockNumberFromDate(chainController.provider, endTime)
      await this.syncBlockNumberRange(chainSlug, startBlockNumber, endBlockNumber)
    }

    items = await this.dbController.getGasFeeDataRange({ chainSlug, timestamp })
    const targetBaseFeePerGasBN = BigNumber.from(gasPrice)
    let valid = false
    let minBaseFeePerGas = BigNumber.from(0)
    let minBaseFeePerGasBlockNumber = 0
    let minBaseFeePerGasTimestamp = 0
    for (const item of items) {
      const baseFeePerGasBN = BigNumber.from(item.feeData.baseFeePerGas)
      if (minBaseFeePerGas.eq(0) || baseFeePerGasBN.lte(minBaseFeePerGas)) {
        minBaseFeePerGas = baseFeePerGasBN
        minBaseFeePerGasBlockNumber = item.blockNumber
        minBaseFeePerGasTimestamp = item.timestamp
      }
      // console.log('item', item.feeData.baseFeePerGas, item.blockNumber)
      if (targetBaseFeePerGasBN.gte(item.feeData.baseFeePerGas)) {
        valid = true
        // break
      }
    }

    return {
      valid,
      timestamp,
      gasPrice,
      minBaseFeePerGas: minBaseFeePerGas.toString(),
      minBaseFeePerGasBlockNumber,
      minBaseFeePerGasTimestamp
    }
  }

  close () {
    this.dbController.close()
  }
}
