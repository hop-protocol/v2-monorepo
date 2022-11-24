# Hop v2 Monorepo

> The [Hop Protocol](https://hop.exchange/) v2 monorepo

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

## Packages

| Library                                                       | Current Version                                                                                                                                   | Description                                 |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| [@hop-protocol/v2-core](packages/core)                             | [![npm version](https://badge.fury.io/js/%40hop-protocol%2Fv2-core.svg)](https://badge.fury.io/js/)                                                   | v2 config and metadata                         |
| [@hop-protocol/v2-sdk](packages/sdk)                             | [![npm version](https://badge.fury.io/js/%40hop-protocol%2Fv2-sdk.svg)](https://badge.fury.io/js/)                                                   | v2 TypeScript Hop SDK                          |
| [@hop-protocol/v2-bundle-relayer](packages/bundle-relayer)                             | [![npm version](https://badge.fury.io/js/%40hop-protocol%2Fv2-bundle-relayer.svg)](https://badge.fury.io/js/)                                                   | v2 Hop bundle relayer worker

## Quickstart

Install dependencies & link packages

    npm install
    npm run bootstrap

Run sdk app in development

    cd packages/sdk
    npm run dev

## Contributing

See [./CONTRIBUTING.md](./CONTRIBUTING.md)

## License

[MIT](LICENSE)