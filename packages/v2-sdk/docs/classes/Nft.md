# Class: Nft

## Table of contents

### Constructors

- [constructor](Nft.md#constructor)

### Properties

- [network](Nft.md#network)
- [populateTransaction](Nft.md#populatetransaction)

### Methods

- [mintNftWrapper](Nft.md#mintnftwrapper)
- [reclaimNftWrapper](Nft.md#reclaimnftwrapper)
- [sendNft](Nft.md#sendnft)
- [sendNftWrapper](Nft.md#sendnftwrapper)

## Constructors

### <a id="constructor" name="constructor"></a> constructor

• **new Nft**(`network?`)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `network` | `string` | `'goerli'` |

## Properties

### <a id="network" name="network"></a> network

• **network**: `string`

___

### <a id="populatetransaction" name="populatetransaction"></a> populateTransaction

• **populateTransaction**: `any`

## Methods

### <a id="mintnftwrapper" name="mintnftwrapper"></a> mintNftWrapper

▸ **mintNftWrapper**(`input`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `MintNftWrapperInput` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `data` | `string` |
| `to` | `string` |

___

### <a id="reclaimnftwrapper" name="reclaimnftwrapper"></a> reclaimNftWrapper

▸ **reclaimNftWrapper**(`input`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `ReclaimNftWrapperInput` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `data` | `string` |
| `to` | `string` |

___

### <a id="sendnft" name="sendnft"></a> sendNft

▸ **sendNft**(`input`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `SendNftInput` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `data` | `string` |
| `to` | `string` |

___

### <a id="sendnftwrapper" name="sendnftwrapper"></a> sendNftWrapper

▸ **sendNftWrapper**(`input`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `SendNftWrapperInput` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `data` | `string` |
| `to` | `string` |
| `value` | `string` |
