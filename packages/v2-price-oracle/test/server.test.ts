import request from 'supertest'
import { app } from '../src/server'

describe('Server', () => {
  it('gas-fee-data - optimism', async () => {
    const timestamp = 1695439134
    const res = await request(app).get(`/v1/gas-fee-data?chain=optimism&timestamp=${timestamp}`).send()
    const { data } = res.body
    console.log(data)
    expect(data).toBeTruthy()
    expect(data.feeData.baseFeePerGas).toBe('50')
    expect(data.feeData.l1BaseFee).toBe('7')
  }, 10 * 60 * 1000)
  it('gas-cost-estimate - ethereum', async () => {
    const timestamp = 1695439134
    const gasLimit = 21000
    const res = await request(app).get(`/v1/gas-cost-estimate?chain=ethereum&timestamp=${timestamp}&gasLimit=${gasLimit}`).send()
    console.log(res.body)
    const { data } = res.body
    console.log(data)
    expect(data).toBeTruthy()
    expect(data.gasCost).toBe('0.000000000000147')
  }, 10 * 60 * 1000)
  it('gas-cost-estimate - optimism', async () => {
    // https://goerli-optimism.etherscan.io/tx/0xa3776d16c92c641847eb96b6a6635b828876edf14df2f1e5478da0629ecc4bc5
    const timestamp = 1696283252
    const gasLimit = 50994
    const txData = '0x723a177900000000000000000000000077c4335bc35abaec784613ad55e9c11399d0222600000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000010a56f823ba000000000000000000000000000000000000000000000000000000000000003b6261666b7265696232616d73697a653372757a70676970757968717a366668677a366d676f7369763578727a78766164666c626268617a357463650000000000'
    const res = await request(app).get(`/v1/gas-cost-estimate?chain=optimism&timestamp=${timestamp}&gasLimit=${gasLimit}&txData=${txData}`).send()
    const { data } = res.body
    console.log(data)
    console.log(JSON.stringify(res.body, null, 2))
    expect(data).toBeTruthy()
    // expect(data.gasCost).toBe('0.00007649100260742') // etherscan value
    expect(data.gasCost).toBe('0.00007649100260338')
  }, 10 * 60 * 1000)
  it('gas-cost-estimate - arbitrum - mainnet', async () => {
    // const timestamp = 1696301141
    const blockNumber = 136958681
    const gasLimit = 400186
    // const destinationAddress = '0x613443dfd45edd3113e8197f6ad55ea721df240f'
    // const from = '0x26b46bc53dbeb1822209d30517c3c464986e559f'
    // &destinationAddress=${destinationAddress}&from=${from}
    const txData = '0xcd5e3c5d'
    const res = await request(app).get(`/v1/gas-cost-estimate?chain=arbitrum&blockNumber=${blockNumber}&gasLimit=${gasLimit}&txData=${txData}`).send()
    console.log('here', res.body)
    if (!res.body.data) {
      console.error(res.body)
      throw new Error('error')
    }
    const { data } = res.body
    console.log(data)
    expect(data).toBeTruthy()
    expect(data.gasCost).toBe('0.0000400186') // etherscan value
  }, 10 * 60 * 1000)
  it('gas-cost-estimate-verify - optimism', async () => {
    const timestamp = 1696283252
    const gasLimit = 50994
    const txData = '0x723a177900000000000000000000000077c4335bc35abaec784613ad55e9c11399d0222600000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000010a56f823ba000000000000000000000000000000000000000000000000000000000000003b6261666b7265696232616d73697a653372757a70676970757968717a366668677a366d676f7369763578727a78766164666c626268617a357463650000000000'
    const targetGasCost = '0.00007649100260742'
    const res = await request(app).get(`/v1/gas-cost-estimate-verify?chain=optimism&timestamp=${timestamp}&gasLimit=${gasLimit}&txData=${txData}&targetGasCost=${targetGasCost}`).send()
    const { data } = res.body
    console.log(JSON.stringify(res.body, null, 2))
    console.log(data)
    expect(data).toBeTruthy()
    expect(data.valid).toBeTruthy()
  }, 10 * 60 * 1000)
  it('gas-cost-estimate-verify - arbitrum - mainnet', async () => {
    const timestamp = 1696301141
    // const blockNumber = 136958681
    const gasLimit = 400186
    const txData = '0xcd5e3c5d'
    const targetGasCost = '0.0000400186'
    const res = await request(app).get(`/v1/gas-cost-estimate-verify?chain=arbitrum&timestamp=${timestamp}&gasLimit=${gasLimit}&txData=${txData}&targetGasCost=${targetGasCost}`).send()
    const { data } = res.body
    console.log(JSON.stringify(res.body, null, 2))
    console.log(data)
    expect(data).toBeTruthy()
    expect(data.valid).toBeTruthy()
  }, 10 * 60 * 1000)
})
