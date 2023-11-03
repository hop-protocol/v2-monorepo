# v2-price-oracle

> A node.js server gas price oracle for the Hop V2 Protocol.

This is node.js worker and server that queries the gas price data of every block using public RPCs for all the supported chains and stores it in a leveldb database. It also provides an API to query the gas price data.

⚠️ This package is under active development and is subject to change.

## API

### Base URL

- Goerli: `https://v2-gas-price-oracle-goerli.hop.exchange`

### GET /v1/gas-fee-data

> Returns the gas fee data for the given chain and timestamp.

Query Parameters

| Name      | Type     | Description                                                                 |
| --------- | -------- | --------------------------------------------------------------------------- |
| `chain`   | `string` | The chain to get the gas price for. Supported values are `ethereum`, `optimism`, `arbitrum`, `base`         |
| `timestamp` | `number` | The UTC timestamp in seconds to get the gas price for. (optional) Uses current time as default. |

Example

```sh
curl -X GET "http://localhost:8000/v1/gas-fee-data?chain=optimism&timestamp=1695439134"
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
      "baseFeePerGas": "50",
      "l1BaseFee": "7"
    }
  }
}
```

The expiration is 10 minutes into the future from the timestamp.

The `baseFeePerGas` response is returned in wei.

The `l1BaseFee` response is returned in wei and it is only returned for rollups.

### GET /v1/gas-price-verify

> Returns true if the gas price is valid for the given chain and timestamp. Valid means that the gasPrice is within acceptable range between given timestamp and 10 minute into the past.

Query Parameters

| Name      | Type     | Description                                                                 |
| --------- | -------- | --------------------------------------------------------------------------- |
| `chain`   | `string` | The chain of the gas price to check for. Supported values are `ethereum`, `optimism`, `arbitrum`, `base`         |
| `timestamp` | `number` | The UTC timestamp in seconds of the target gas price. |
| `gasPrice` | `string` | The target gas price to check for validity. Must be in wei format. |

Example

```sh
curl -X GET "http://localhost:8000/v1/gas-price-verify?chain=optimism&timestamp=1695439134&gasPrice=50"
```

Response

```json
{
    "status": "ok",
    "data": {
        "valid": true,
        "timestamp": 1695439139,
        "gasPrice": "60",
        "minBaseFeePerGasFee": "50",
        "minBaseFeePerGasBlockNumber": 15005833,
        "minBaseFeePerGasTimestamp": 1695439734
    }
}
```

### GET /v1/gas-cost-estimate

> Returns the estimated total gas cost for the given chain, timestamp, gas limit, and tx data.

Query Parameters

| Name      | Type     | Description                                                                 |
| --------- | -------- | --------------------------------------------------------------------------- |
| `chain`   | `string` | The chain to get the estimated gas cost for. Supported values are `ethereum`, `optimism`, `arbitrum`, `base`         |
| `timestamp` | `number` | The UTC timestamp in seconds to get the gas estimate for. (optional) Uses current time as default. |
| `gasLimit` | `number` | The gas limit to use for estimate. |
| `txData` | `number` | The transaction `data` needed to calculate gas cost estimate for rollups. |

Example

```sh
curl -X GET "http://localhost:8000/v1/gas-cost-estimate?chain=optimism&timestamp=1695439134&gasLimit=200000&txData=0x01de8001328252089400000000000000000000000000000000000000008080c0"
```

Response

```json
{
    "status": "ok",
    "data": {
        "l1Fee": "0.000000000000026236",
        "l2Fee": "0.00000000210105",
        "gasCost": "0.000000000000052472"
    }
}
```

### GET /v1/gas-cost-estimate-verify

> Returns true if the target gas cost is greater than or equal to the estimated gas cost for the given chain, timestamp, gas limit, and tx data.

Query Parameters

| Name      | Type     | Description                                                                 |
| --------- | -------- | --------------------------------------------------------------------------- |
| `chain`   | `string` | The chain to get the estimated gas cost for. Supported values are `ethereum`, `optimism`, `arbitrum`, `base`         |
| `timestamp` | `number` | The UTC timestamp in seconds to get the gas estimate for. (optional) Uses current time as default. |
| `gasLimit` | `number` | The gas limit to use for estimate. |
| `txData` | `number` | The transaction `data` needed to calculate gas cost estimate for rollups. |
| `targetGasCost` | `number` | The target gas cost to compare to. |

Example

```sh
curl -X GET "http://localhost:8000/v1/gas-cost-estimate-verify?chain=optimism&timestamp=1695772800&gasLimit=21000&txData=0x01de8001328252089400000000000000000000000000000000000000008080c0&targetGasCost=0.000000000000089952"
```

Response

```json
{
    "status": "ok",
    "data": {
        "valid": true,
        "timestamp": 1695439134,
        "targetGasCost": '0.000000000000089952",
        "minGasCostEstimate": "0.00000000000007496"
        "minGasFeeDataBlockNumber": 15172066,
        "minGasFeeDataTimestamp": 1695772200,
        "minGasFeeDataBaseFeePerGas": "50",
        "minGasFeeDataL1BaseFee": "10"
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
BASE_RPC=https://goerli.base.org
POLL_INTERVAL_SECONDS=2
DB_PATH=/tmp/mydb
```

## License

[MIT](LICENSE)
