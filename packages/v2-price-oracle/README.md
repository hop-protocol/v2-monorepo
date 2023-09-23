# v2-price-oracle

> A node.js server gas price oracle for the Hop V2 Protocol.

## API

### GET /v1/gas-price

> Returns the gas price for the given chain and timestamp.

Query Parameters

| Name      | Type     | Description                                                                 |
| --------- | -------- | --------------------------------------------------------------------------- |
| `chain`   | `string` | The chain to get the gas price for. Supported values are `ethereum`, `optimism`, `arbitrum`, `base`         |
| `timestamp` | `number` | The UTC timestamp in seconds to get the gas price for. |

Example

```sh
curl -X GET "http://localhost:8000/v1/gas-price?chain=optimism&timestamp=1695439134"
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

### GET /v1/gas-price-valid

> Returns true if the gas price is valid (within acceptable range) for the given chain and timestamp.

Query Parameters

| Name      | Type     | Description                                                                 |
| --------- | -------- | --------------------------------------------------------------------------- |
| `chain`   | `string` | The chain of the gas price to check for. Supported values are `ethereum`, `optimism`, `arbitrum`, `base`         |
| `timestamp` | `number` | The UTC timestamp in seconds of the target gas price. |
| `gasPrice` | `string` | The gas price to check for validity. |

Example

```sh
curl -X GET "http://localhost:8000/v1/gas-price-check?chain=optimism&timestamp=1695439134&gasPrice=50"
```

Response

```json
{
    "valid": true,
    "timestamp": 1695439139,
    "gasPrice": "60",
    "minFee": "50",
    "minFeeBlockNumber": 15005833,
    "minFeeTimestamp": 1695439734
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
BASE_RPC=https://goerli.base.org
POLL_INTERVAL_SECONDS=2
DB_PATH=/tmp/mydb
```

## License

[MIT](LICENSE)
