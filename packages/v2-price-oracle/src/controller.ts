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

  async getGasFeeData (input: any) {
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

  async getGasCostEstimate (input: any) {
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

    const gasCost = await this.calcGasCost({
      chainSlug,
      gasLimit,
      txData,
      baseFeePerGas: BigNumber.from(item.feeData.baseFeePerGas),
      l1BaseFee: item.feeData.l1BaseFee != null ? BigNumber.from(item.feeData.l1BaseFee) : null,
      blockNumber: item.blockNumber
    })

    return gasCost
  }

  async calcGasCost (input: any) {
    const { chainSlug, gasLimit, txData, baseFeePerGas, l1BaseFee, blockNumber } = input

    if (chainSlug === 'ethereum') {
      if (!gasLimit) {
        throw new Error('gasLimit is required')
      }
      const gasCost = baseFeePerGas.mul(gasLimit)

      return {
        gasCostBN: gasCost,
        gasCost: formatUnits(gasCost, 18)
      }
    } else if (chainSlug === 'optimism' || chainSlug === 'base') {
      if (!gasLimit) {
        throw new Error('gasLimit is required')
      }
      if (!txData) {
        throw new Error('txData is required')
      }

      // https://community.optimism.io/docs/developers/build/transaction-fees/#priority-fee
      const maxPriorityFeePerGas = parseUnits('0.0001', 'gwei')
      const txGasPrice = baseFeePerGas.add(maxPriorityFeePerGas)
      const l2Fee = txGasPrice.mul(gasLimit)

      const l1FeeOverhead = 2100 // mainnet: 188
      const l1FeeScalar = 1000000 // mainnet: 684000

      // these functions are derived from oracle contract
      // https://goerli-optimism.etherscan.io/address/0x420000000000000000000000000000000000000F#code
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
        // console.log('l1GasUsed:', l1GasUsed.toString())

        const l1Fee = l1GasUsed.mul(l1BaseFee)
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
      // console.log('fee info', formatUnits(l1Fee, 18), formatUnits(l2Fee, 18), formatUnits(totalFee, 18))

      return {
        l1Fee: formatUnits(l1Fee, 18),
        l2Fee: formatUnits(l2Fee, 18),
        gasCostBN: totalFee,
        gasCost: formatUnits(totalFee, 18)
      }
    } else if (chainSlug === 'arbitrum') {
      if (!txData) {
        throw new Error('txData is required')
      }

      // TODO: store in db
      const data = await this.chainControllers[chainSlug].getArbInfo(txData, blockNumber)

      const l1GasEstimated = data.gasEstimateForL1
      const l2GasUsed = data.gasEstimate.sub(l1GasEstimated)
      const l2EstimatedPrice = data.baseFee
      const l1EstimatedPrice = data.l1BaseFeeEstimate.mul(16)
      const l1Cost = l1GasEstimated.mul(l2EstimatedPrice)
      const l1Size = l1Cost.div(l1EstimatedPrice)
      const L1Cost = l1EstimatedPrice.mul(l1Size)
      const ExtraBuffer = L1Cost.div(l2EstimatedPrice)
      const GasLimit = l2GasUsed.add(ExtraBuffer)
      const gasCost = l2EstimatedPrice.mul(GasLimit)

      return {
        gasCostBN: gasCost,
        gasCost: formatUnits(gasCost, 18)
      }
    }

    throw new Error('unsupported chain')
  }

  async gasCostVerify (input: any) {
    const { chainSlug, timestamp, gasLimit, txData, targetGasCost } = input

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

    let minGasCostEstimate = BigNumber.from(0)
    let minGasFeeDataBlockNumber = 0
    let minGasFeeDataTimestamp = 0
    let minGasFeeDataBaseFeePerGas: any
    let minGasFeeDataL1BaseFee: any

    for (const item of items) {
      const baseFeePerGas = BigNumber.from(item.feeData.baseFeePerGas)
      const l1BaseFee = item.feeData.l1BaseFee != null ? BigNumber.from(item.feeData.l1BaseFee) : null
      const { gasCost, gasCostBN } = await this.calcGasCost({
        chainSlug,
        gasLimit,
        txData,
        baseFeePerGas,
        l1BaseFee,
        blockNumber: item.blockNumber
      })

      if (minGasCostEstimate.eq(0)) {
        minGasCostEstimate = gasCostBN
        minGasFeeDataBlockNumber = item.blockNumber
        minGasFeeDataTimestamp = item.timestamp
        minGasFeeDataBaseFeePerGas = baseFeePerGas?.toString()
        minGasFeeDataL1BaseFee = l1BaseFee?.toString()
      } else {
        if (gasCostBN.lt(minGasCostEstimate)) {
          minGasCostEstimate = gasCostBN
          minGasFeeDataBlockNumber = item.blockNumber
          minGasFeeDataTimestamp = item.timestamp
          minGasFeeDataBaseFeePerGas = baseFeePerGas?.toString()
          minGasFeeDataL1BaseFee = l1BaseFee?.toString()
        }
      }
    }

    if (minGasCostEstimate.eq(0)) {
      throw new Error('minGasCostEstimate is 0')
    }

    const valid = parseUnits(targetGasCost, 18).gte(minGasCostEstimate)

    return {
      valid,
      timestamp,
      targetGasCost,
      minGasCostEstimate: formatUnits(minGasCostEstimate, 18),
      minGasFeeDataBlockNumber,
      minGasFeeDataTimestamp,
      minGasFeeDataBaseFeePerGas,
      minGasFeeDataL1BaseFee
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

  async getGasPriceVerify (input: any) {
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
