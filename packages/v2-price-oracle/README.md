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
curl -X GET "https://v2-gas-price-oracle.hop.exchange/v1/gas-price?chain=ethereum&timestamp=1695439134"
```

Response

```json
{
  "status": "ok",
  "data": {
    "expiration": 1695439739,
    "chainSlug": "ethereum",
    "timestamp": 1695439139,
    "blockNumber": 18195791,
    "feeData": {
      "baseFeePerGas": "7904402770"
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

## License

[MIT](LICENSE)
