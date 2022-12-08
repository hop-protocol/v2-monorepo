import { goerliAddresses } from '../src/addresses'

test('addresses', () => {
  expect(goerliAddresses.ethereum.hubCoreMessenger).toBeTruthy()
})
