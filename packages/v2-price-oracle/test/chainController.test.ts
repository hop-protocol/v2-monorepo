import { ChainController } from '../src/ChainController'

describe('ChainController', () => {
  describe('optimism', () => {
    const controller = new ChainController('optimism')
    it('getL1BaseFee - latest', async () => {
      const l1BaseFee = await controller.getL1BaseFee()
      console.log(l1BaseFee)
      expect(Number(l1BaseFee?.toString())).toBeGreaterThan(0)
    }, 60 * 1000)

    it('getL1BaseFee - blockTag', async () => {
      const l1BaseFee = await controller.getL1BaseFee(15122085)
      console.log(l1BaseFee)
      expect(l1BaseFee?.toString()).toBe('19')
    }, 60 * 1000)
  })
  describe('arbitrum', () => {
    const controller = new ChainController('arbitrum')
    it('getL1BaseFee - latest', async () => {
      const l1BaseFee = await controller.getL1BaseFee()
      console.log(l1BaseFee)
      expect(Number(l1BaseFee?.toString())).toBe(0)
    }, 60 * 1000)

    it('getL1BaseFee - blockTag', async () => {
      const l1BaseFee = await controller.getL1BaseFee(43621149)
      console.log(l1BaseFee)
      expect(l1BaseFee?.toString()).toBe('0')
    }, 60 * 1000)
  })
})
