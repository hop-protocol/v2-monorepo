import { goerliAddresses } from '../src/addresses'

test('addresses', () => {
  expect(goerliAddresses['5'].hubCoreMessenger).toBeTruthy()
})
