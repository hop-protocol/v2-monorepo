# Class: EventFetcher

## Table of contents

### Constructors

- [constructor](EventFetcher.md#constructor)

### Properties

- [batchBlocks](EventFetcher.md#batchblocks)
- [provider](EventFetcher.md#provider)

### Methods

- [aggregateFilters](EventFetcher.md#aggregatefilters)
- [fetchEvents](EventFetcher.md#fetchevents)
- [getChunkedBlockRanges](EventFetcher.md#getchunkedblockranges)

## Constructors

### <a id="constructor" name="constructor"></a> constructor

• **new EventFetcher**(`options`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | `Options` |

## Properties

### <a id="batchblocks" name="batchblocks"></a> batchBlocks

• **batchBlocks**: `number` = `DefaultBatchBlocks`

___

### <a id="provider" name="provider"></a> provider

• **provider**: `Provider`

## Methods

### <a id="aggregatefilters" name="aggregatefilters"></a> aggregateFilters

▸ **aggregateFilters**(`filters`, `options`): `Filter`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `filters` | `InputFilter`[] |
| `options` | `FetchOptions` |

#### Returns

`Filter`[]

___

### <a id="fetchevents" name="fetchevents"></a> fetchEvents

▸ **fetchEvents**(`filters`, `options`): `Promise`<`any`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `filters` | `InputFilter`[] |
| `options` | `FetchOptions` |

#### Returns

`Promise`<`any`[]\>

___

### <a id="getchunkedblockranges" name="getchunkedblockranges"></a> getChunkedBlockRanges

▸ **getChunkedBlockRanges**(`fromBlock`, `toBlock`): `number`[][]

#### Parameters

| Name | Type |
| :------ | :------ |
| `fromBlock` | `number` |
| `toBlock` | `number` |

#### Returns

`number`[][]
