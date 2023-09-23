# v2-price-oracle

> A node.js server price oracle for the v2 protocol

## API

### GET /v1/gas-price

> Returns the gas price in gwei for the given chain and timestamp.

Query Parameters

| Name      | Type     | Description                                                                 |
| --------- | -------- | --------------------------------------------------------------------------- |
| `chain`   | `string` | The chain to get the gas price for. Supported values are `ethereum`, `optimism`, `arbitrum`, `base`         |
| `timestamp` | `number` | The UTC timestamp in seconds to get the gas price for. |

Example

```sh
curl -X GET "https://v2-gas-price-oracle-goerli.hop.exchange/v1/gas-price?chain=optimism&timestamp=1695439134"
```

Response

```json
{
  "status": "ok",
  "data": {
    "expiration": 1695439734,
    "chainSlug": "optimism",
    "timestamp": 1695439134,
    "blockNumber": 15005533,
    "feeData": {
      "baseFeePerGas": "50"
    }
  }
}
```


## Development

```sh
npm run build
```

```sh
npm run start
```

```sh
npm test
```

### Environment Variables

```sh
NETWORK=goerli
ETHEREUM_RPC=https://rpc.ankr.com/eth_goerli
ARBITRUM_RPC=https://goerli-rollup.arbitrum.io/rpc
OPTIMISM_RPC=https://goerli.optimism.io
BASEZK_RPC=https://goerli.base.org
POLL_INTERVAL_SECONDS=2
DB_PATH=/tmp/mydb
```

## License

[MIT](LICENSE)
