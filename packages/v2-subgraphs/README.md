# Hop v2 Subgraphs

> The v2 Hop Protocol Subgraphs for [The Graph](https://thegraph.com/).

## Subgraphs

Goerli

- [Goerli](https://thegraph.com/explorer/subgraph/hop-protocol/v2-hop-goerli)
- [Optimism Goerli](https://thegraph.com/explorer/subgraph/hop-protocol/v2-hop-optimism-goerli)

## Development

### Authenticate

```bash
npx graph auth https://api.thegraph.com/deploy/ <access-token>
```

The access token is found on the hosted-service [dashboard](https://thegraph.com/hosted-service/dashboard).

### Build and deploy

```bash
npm run build-deploy:goerli
npm run build-deploy:optimism-goerli
```

By default, it will deploy under `hop-protocol` github org.

Set `GITHUB_ORG` to deploy another a different account.

Example:

```bash
GITHUB_ORG=<github-username> npm run build-deploy:mainnet
```

The following subgraphs will need to be created on the dashboard:

- `v2-hop-goerli`
- `v2-hop-optimism-goerli`

### Clean build files:

```bash
npm run clean
```

## License

[MIT](LICENSE)
