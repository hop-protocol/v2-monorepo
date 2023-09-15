# Class: Hop

## Table of contents

### Constructors

- [constructor](Hop.md#constructor)

### Properties

- [batchBlocks](Hop.md#batchblocks)
- [contractAddresses](Hop.md#contractaddresses)
- [eventFetcher](Hop.md#eventfetcher)
- [l1ChainId](Hop.md#l1chainid)
- [network](Hop.md#network)
- [providers](Hop.md#providers)

### Accessors

- [version](Hop.md#version)

### Methods

- [connectTargets](Hop.md#connecttargets)
- [exitBundle](Hop.md#exitbundle)
- [getBlock](Hop.md#getblock)
- [getBundleCommittedEvents](Hop.md#getbundlecommittedevents)
- [getBundleExitPopulatedTx](Hop.md#getbundleexitpopulatedtx)
- [getBundleForwardedEvents](Hop.md#getbundleforwardedevents)
- [getBundleProofFromMessageId](Hop.md#getbundleprooffrommessageid)
- [getBundleProofFromTransactionHash](Hop.md#getbundleprooffromtransactionhash)
- [getBundleReceivedEvents](Hop.md#getbundlereceivedevents)
- [getBundleSetEvents](Hop.md#getbundlesetevents)
- [getChainSlug](Hop.md#getchainslug)
- [getContractAddresses](Hop.md#getcontractaddresses)
- [getEstimatedTxCostForForwardMessage](Hop.md#getestimatedtxcostforforwardmessage)
- [getEventNames](Hop.md#geteventnames)
- [getEvents](Hop.md#getevents)
- [getFeesSentToHubEvents](Hop.md#getfeessenttohubevents)
- [getHubMessageBridgeContractAddress](Hop.md#gethubmessagebridgecontractaddress)
- [getIsBundleSet](Hop.md#getisbundleset)
- [getIsL2TxHashExited](Hop.md#getisl2txhashexited)
- [getIsMessageIdRelayed](Hop.md#getismessageidrelayed)
- [getMaxBundleMessageCount](Hop.md#getmaxbundlemessagecount)
- [getMerkleProofForMessageId](Hop.md#getmerkleproofformessageid)
- [getMessageBundleIdFromMessageId](Hop.md#getmessagebundleidfrommessageid)
- [getMessageBundleIdFromTransactionHash](Hop.md#getmessagebundleidfromtransactionhash)
- [getMessageBundledEventFromMessageId](Hop.md#getmessagebundledeventfrommessageid)
- [getMessageBundledEventFromTransactionHash](Hop.md#getmessagebundledeventfromtransactionhash)
- [getMessageBundledEvents](Hop.md#getmessagebundledevents)
- [getMessageBundledEventsForBundleId](Hop.md#getmessagebundledeventsforbundleid)
- [getMessageCalldata](Hop.md#getmessagecalldata)
- [getMessageExecutedEventFromMessageId](Hop.md#getmessageexecutedeventfrommessageid)
- [getMessageExecutedEvents](Hop.md#getmessageexecutedevents)
- [getMessageFee](Hop.md#getmessagefee)
- [getMessageIdFromTransactionHash](Hop.md#getmessageidfromtransactionhash)
- [getMessageIdsForBundleId](Hop.md#getmessageidsforbundleid)
- [getMessageSentEventFromMessageId](Hop.md#getmessagesenteventfrommessageid)
- [getMessageSentEventFromTransactionHash](Hop.md#getmessagesenteventfromtransactionhash)
- [getMessageSentEventFromTransactionReceipt](Hop.md#getmessagesenteventfromtransactionreceipt)
- [getMessageSentEvents](Hop.md#getmessagesentevents)
- [getMessageTreeIndexFromMessageId](Hop.md#getmessagetreeindexfrommessageid)
- [getMessageTreeIndexFromTransactionHash](Hop.md#getmessagetreeindexfromtransactionhash)
- [getNftBridgeContractAddress](Hop.md#getnftbridgecontractaddress)
- [getNftBurnPopulatedTx](Hop.md#getnftburnpopulatedtx)
- [getNftConfirmPopulatedTx](Hop.md#getnftconfirmpopulatedtx)
- [getNftConfirmationSentEvents](Hop.md#getnftconfirmationsentevents)
- [getNftMintAndSendPopulatedTx](Hop.md#getnftmintandsendpopulatedtx)
- [getNftMintPopulatedTx](Hop.md#getnftmintpopulatedtx)
- [getNftSendPopulatedTx](Hop.md#getnftsendpopulatedtx)
- [getNftTokenConfirmedEvents](Hop.md#getnfttokenconfirmedevents)
- [getNftTokenSentEvents](Hop.md#getnfttokensentevents)
- [getRelayMessageDataFromTransactionHash](Hop.md#getrelaymessagedatafromtransactionhash)
- [getRelayMessagePopulatedTx](Hop.md#getrelaymessagepopulatedtx)
- [getRelayReward](Hop.md#getrelayreward)
- [getRelayWindowHours](Hop.md#getrelaywindowhours)
- [getRouteData](Hop.md#getroutedata)
- [getRpcProvider](Hop.md#getrpcprovider)
- [getSendMessagePopulatedTx](Hop.md#getsendmessagepopulatedtx)
- [getSpokeExitTime](Hop.md#getspokeexittime)
- [getSpokeMessageBridgeContractAddress](Hop.md#getspokemessagebridgecontractaddress)
- [getSupportedChainIds](Hop.md#getsupportedchainids)
- [hasAuctionStarted](Hop.md#hasauctionstarted)
- [setContractAddresses](Hop.md#setcontractaddresses)
- [setRpcProvider](Hop.md#setrpcprovider)
- [setRpcProviders](Hop.md#setrpcproviders)
- [shouldAttemptForwardMessage](Hop.md#shouldattemptforwardmessage)

## Constructors

### <a id="constructor" name="constructor"></a> constructor

• **new Hop**(`network?`, `options?`)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `network` | `string` | `'goerli'` |
| `options?` | `Options` | `undefined` |

## Properties

### <a id="batchblocks" name="batchblocks"></a> batchBlocks

• `Optional` **batchBlocks**: `number`

___

### <a id="contractaddresses" name="contractaddresses"></a> contractAddresses

• **contractAddresses**: `Record`<`string`, `any`\>

___

### <a id="eventfetcher" name="eventfetcher"></a> eventFetcher

• **eventFetcher**: [`EventFetcher`](EventFetcher.md)

___

### <a id="l1chainid" name="l1chainid"></a> l1ChainId

• **l1ChainId**: `number`

___

### <a id="network" name="network"></a> network

• **network**: `string`

___

### <a id="providers" name="providers"></a> providers

• **providers**: `Record`<`string`, `any`\> = `{}`

## Accessors

### <a id="version" name="version"></a> version

• `get` **version**(): `string`

#### Returns

`string`

## Methods

### <a id="connecttargets" name="connecttargets"></a> connectTargets

▸ **connectTargets**(`input`): `Promise`<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `ConnectTargetsInput` |

#### Returns

`Promise`<`any`\>

___

### <a id="exitbundle" name="exitbundle"></a> exitBundle

▸ **exitBundle**(`input`): `Promise`<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `ExitBundleInput` |

#### Returns

`Promise`<`any`\>

___

### <a id="getblock" name="getblock"></a> getBlock

▸ **getBlock**(`chainId`, `blockNumber`): `Promise`<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `chainId` | `number` |
| `blockNumber` | `number` |

#### Returns

`Promise`<`any`\>

___

### <a id="getbundlecommittedevents" name="getbundlecommittedevents"></a> getBundleCommittedEvents

▸ **getBundleCommittedEvents**(`input`): `Promise`<`BundleCommitted`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `GetEventsInput` |

#### Returns

`Promise`<`BundleCommitted`[]\>

___

### <a id="getbundleexitpopulatedtx" name="getbundleexitpopulatedtx"></a> getBundleExitPopulatedTx

▸ **getBundleExitPopulatedTx**(`input`): `Promise`<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `GetBundleExitPopulatedTxInput` |

#### Returns

`Promise`<`any`\>

___

### <a id="getbundleforwardedevents" name="getbundleforwardedevents"></a> getBundleForwardedEvents

▸ **getBundleForwardedEvents**(`input`): `Promise`<`BundleForwarded`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `GetEventsInput` |

#### Returns

`Promise`<`BundleForwarded`[]\>

___

### <a id="getbundleprooffrommessageid" name="getbundleprooffrommessageid"></a> getBundleProofFromMessageId

▸ **getBundleProofFromMessageId**(`input`): `Promise`<`BundleProof`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `GetBundleProofFromMessageIdInput` |

#### Returns

`Promise`<`BundleProof`\>

___

### <a id="getbundleprooffromtransactionhash" name="getbundleprooffromtransactionhash"></a> getBundleProofFromTransactionHash

▸ **getBundleProofFromTransactionHash**(`input`): `Promise`<`BundleProof`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `GetBundleProofFromTransactionHashInput` |

#### Returns

`Promise`<`BundleProof`\>

___

### <a id="getbundlereceivedevents" name="getbundlereceivedevents"></a> getBundleReceivedEvents

▸ **getBundleReceivedEvents**(`input`): `Promise`<`BundleReceived`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `GetEventsInput` |

#### Returns

`Promise`<`BundleReceived`[]\>

___

### <a id="getbundlesetevents" name="getbundlesetevents"></a> getBundleSetEvents

▸ **getBundleSetEvents**(`input`): `Promise`<`BundleSet`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `GetEventsInput` |

#### Returns

`Promise`<`BundleSet`[]\>

___

### <a id="getchainslug" name="getchainslug"></a> getChainSlug

▸ **getChainSlug**(`chainId`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `chainId` | `number` |

#### Returns

`string`

___

### <a id="getcontractaddresses" name="getcontractaddresses"></a> getContractAddresses

▸ **getContractAddresses**(): `any`

#### Returns

`any`

___

### <a id="getestimatedtxcostforforwardmessage" name="getestimatedtxcostforforwardmessage"></a> getEstimatedTxCostForForwardMessage

▸ **getEstimatedTxCostForForwardMessage**(`input`): `Promise`<`number`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `GetEstimatedTxCostForForwardMessageInput` |

#### Returns

`Promise`<`number`\>

___

### <a id="geteventnames" name="geteventnames"></a> getEventNames

▸ **getEventNames**(): `string`[]

#### Returns

`string`[]

___

### <a id="getevents" name="getevents"></a> getEvents

▸ **getEvents**(`input`): `Promise`<`any`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `GetGeneralEventsInput` |

#### Returns

`Promise`<`any`[]\>

___

### <a id="getfeessenttohubevents" name="getfeessenttohubevents"></a> getFeesSentToHubEvents

▸ **getFeesSentToHubEvents**(`input`): `Promise`<`FeesSentToHub`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `GetEventsInput` |

#### Returns

`Promise`<`FeesSentToHub`[]\>

___

### <a id="gethubmessagebridgecontractaddress" name="gethubmessagebridgecontractaddress"></a> getHubMessageBridgeContractAddress

▸ **getHubMessageBridgeContractAddress**(`chainId`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `chainId` | `number` |

#### Returns

`string`

___

### <a id="getisbundleset" name="getisbundleset"></a> getIsBundleSet

▸ **getIsBundleSet**(`input`): `Promise`<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `GetIsBundleSetInput` |

#### Returns

`Promise`<`boolean`\>

___

### <a id="getisl2txhashexited" name="getisl2txhashexited"></a> getIsL2TxHashExited

▸ **getIsL2TxHashExited**(`input`): `Promise`<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `GetIsL2TxHashExitedInput` |

#### Returns

`Promise`<`any`\>

___

### <a id="getismessageidrelayed" name="getismessageidrelayed"></a> getIsMessageIdRelayed

▸ **getIsMessageIdRelayed**(`input`): `Promise`<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `GetIsMessageIdRelayedInput` |

#### Returns

`Promise`<`boolean`\>

___

### <a id="getmaxbundlemessagecount" name="getmaxbundlemessagecount"></a> getMaxBundleMessageCount

▸ **getMaxBundleMessageCount**(`input`): `Promise`<`number`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `GetMaxBundleMessageCountInput` |

#### Returns

`Promise`<`number`\>

___

### <a id="getmerkleproofformessageid" name="getmerkleproofformessageid"></a> getMerkleProofForMessageId

▸ **getMerkleProofForMessageId**(`input`): `string`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `GetMerkleProofForMessageIdInput` |

#### Returns

`string`[]

___

### <a id="getmessagebundleidfrommessageid" name="getmessagebundleidfrommessageid"></a> getMessageBundleIdFromMessageId

▸ **getMessageBundleIdFromMessageId**(`input`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `GetMessageBundleIdFromMessageIdInput` |

#### Returns

`Promise`<`string`\>

___

### <a id="getmessagebundleidfromtransactionhash" name="getmessagebundleidfromtransactionhash"></a> getMessageBundleIdFromTransactionHash

▸ **getMessageBundleIdFromTransactionHash**(`input`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `GetMessageBundleIdFromTransactionHashInput` |

#### Returns

`Promise`<`string`\>

___

### <a id="getmessagebundledeventfrommessageid" name="getmessagebundledeventfrommessageid"></a> getMessageBundledEventFromMessageId

▸ **getMessageBundledEventFromMessageId**(`input`): `Promise`<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `GetMessageBundledEventFromMessageIdInput` |

#### Returns

`Promise`<`any`\>

___

### <a id="getmessagebundledeventfromtransactionhash" name="getmessagebundledeventfromtransactionhash"></a> getMessageBundledEventFromTransactionHash

▸ **getMessageBundledEventFromTransactionHash**(`input`): `Promise`<`MessageBundled`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `GetMessageBundledEventFromTransactionHashInput` |

#### Returns

`Promise`<`MessageBundled`\>

___

### <a id="getmessagebundledevents" name="getmessagebundledevents"></a> getMessageBundledEvents

▸ **getMessageBundledEvents**(`input`): `Promise`<`MessageBundled`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `GetEventsInput` |

#### Returns

`Promise`<`MessageBundled`[]\>

___

### <a id="getmessagebundledeventsforbundleid" name="getmessagebundledeventsforbundleid"></a> getMessageBundledEventsForBundleId

▸ **getMessageBundledEventsForBundleId**(`input`): `Promise`<`any`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `GetMessageBundledEventsForBundleIdInput` |

#### Returns

`Promise`<`any`[]\>

___

### <a id="getmessagecalldata" name="getmessagecalldata"></a> getMessageCalldata

▸ **getMessageCalldata**(`input`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `GetMessageCalldataInput` |

#### Returns

`Promise`<`string`\>

___

### <a id="getmessageexecutedeventfrommessageid" name="getmessageexecutedeventfrommessageid"></a> getMessageExecutedEventFromMessageId

▸ **getMessageExecutedEventFromMessageId**(`input`): `Promise`<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `GetMessageExecutedEventFromMessageIdInput` |

#### Returns

`Promise`<`any`\>

___

### <a id="getmessageexecutedevents" name="getmessageexecutedevents"></a> getMessageExecutedEvents

▸ **getMessageExecutedEvents**(`input`): `Promise`<`MessageExecuted`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `GetEventsInput` |

#### Returns

`Promise`<`MessageExecuted`[]\>

___

### <a id="getmessagefee" name="getmessagefee"></a> getMessageFee

▸ **getMessageFee**(`input`): `Promise`<`BigNumber`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `GetMessageFeeInput` |

#### Returns

`Promise`<`BigNumber`\>

___

### <a id="getmessageidfromtransactionhash" name="getmessageidfromtransactionhash"></a> getMessageIdFromTransactionHash

▸ **getMessageIdFromTransactionHash**(`input`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `GetMessageIdFromTransactionHashInput` |

#### Returns

`Promise`<`string`\>

___

### <a id="getmessageidsforbundleid" name="getmessageidsforbundleid"></a> getMessageIdsForBundleId

▸ **getMessageIdsForBundleId**(`input`): `Promise`<`string`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `GetMessageIdsForBundleIdInput` |

#### Returns

`Promise`<`string`[]\>

___

### <a id="getmessagesenteventfrommessageid" name="getmessagesenteventfrommessageid"></a> getMessageSentEventFromMessageId

▸ **getMessageSentEventFromMessageId**(`input`): `Promise`<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `GetMessageSentEventFromMessageIdInput` |

#### Returns

`Promise`<`any`\>

___

### <a id="getmessagesenteventfromtransactionhash" name="getmessagesenteventfromtransactionhash"></a> getMessageSentEventFromTransactionHash

▸ **getMessageSentEventFromTransactionHash**(`input`): `Promise`<`MessageSent`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `GetMessageSentEventFromTransactionHashInput` |

#### Returns

`Promise`<`MessageSent`\>

___

### <a id="getmessagesenteventfromtransactionreceipt" name="getmessagesenteventfromtransactionreceipt"></a> getMessageSentEventFromTransactionReceipt

▸ **getMessageSentEventFromTransactionReceipt**(`input`): `Promise`<`MessageSent`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `GetMessageSentEventFromTransactionReceiptInput` |

#### Returns

`Promise`<`MessageSent`\>

___

### <a id="getmessagesentevents" name="getmessagesentevents"></a> getMessageSentEvents

▸ **getMessageSentEvents**(`input`): `Promise`<`MessageSent`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `GetEventsInput` |

#### Returns

`Promise`<`MessageSent`[]\>

___

### <a id="getmessagetreeindexfrommessageid" name="getmessagetreeindexfrommessageid"></a> getMessageTreeIndexFromMessageId

▸ **getMessageTreeIndexFromMessageId**(`input`): `Promise`<`number`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `GetMessageTreeIndexFromMessageIdInput` |

#### Returns

`Promise`<`number`\>

___

### <a id="getmessagetreeindexfromtransactionhash" name="getmessagetreeindexfromtransactionhash"></a> getMessageTreeIndexFromTransactionHash

▸ **getMessageTreeIndexFromTransactionHash**(`input`): `Promise`<`number`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `GetMessageTreeIndexFromTransactionHashInput` |

#### Returns

`Promise`<`number`\>

___

### <a id="getnftbridgecontractaddress" name="getnftbridgecontractaddress"></a> getNftBridgeContractAddress

▸ **getNftBridgeContractAddress**(`chainId`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `chainId` | `number` |

#### Returns

`string`

___

### <a id="getnftburnpopulatedtx" name="getnftburnpopulatedtx"></a> getNftBurnPopulatedTx

▸ **getNftBurnPopulatedTx**(`input`): `Promise`<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `GetNftBurnPopulatedTxInput` |

#### Returns

`Promise`<`any`\>

___

### <a id="getnftconfirmpopulatedtx" name="getnftconfirmpopulatedtx"></a> getNftConfirmPopulatedTx

▸ **getNftConfirmPopulatedTx**(`input`): `Promise`<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `GetNftConfirmPopulatedTxInput` |

#### Returns

`Promise`<`any`\>

___

### <a id="getnftconfirmationsentevents" name="getnftconfirmationsentevents"></a> getNftConfirmationSentEvents

▸ **getNftConfirmationSentEvents**(`input`): `Promise`<`ConfirmationSent`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `GetEventsInput` |

#### Returns

`Promise`<`ConfirmationSent`[]\>

___

### <a id="getnftmintandsendpopulatedtx" name="getnftmintandsendpopulatedtx"></a> getNftMintAndSendPopulatedTx

▸ **getNftMintAndSendPopulatedTx**(`input`): `Promise`<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `GetNftMintAndSendPopulatedTxInput` |

#### Returns

`Promise`<`any`\>

___

### <a id="getnftmintpopulatedtx" name="getnftmintpopulatedtx"></a> getNftMintPopulatedTx

▸ **getNftMintPopulatedTx**(`input`): `Promise`<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `GetNftMintPopulatedTxInput` |

#### Returns

`Promise`<`any`\>

___

### <a id="getnftsendpopulatedtx" name="getnftsendpopulatedtx"></a> getNftSendPopulatedTx

▸ **getNftSendPopulatedTx**(`input`): `Promise`<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `GetNftSendPopulatedTxInput` |

#### Returns

`Promise`<`any`\>

___

### <a id="getnfttokenconfirmedevents" name="getnfttokenconfirmedevents"></a> getNftTokenConfirmedEvents

▸ **getNftTokenConfirmedEvents**(`input`): `Promise`<`TokenConfirmed`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `GetEventsInput` |

#### Returns

`Promise`<`TokenConfirmed`[]\>

___

### <a id="getnfttokensentevents" name="getnfttokensentevents"></a> getNftTokenSentEvents

▸ **getNftTokenSentEvents**(`input`): `Promise`<`TokenSent`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `GetEventsInput` |

#### Returns

`Promise`<`TokenSent`[]\>

___

### <a id="getrelaymessagedatafromtransactionhash" name="getrelaymessagedatafromtransactionhash"></a> getRelayMessageDataFromTransactionHash

▸ **getRelayMessageDataFromTransactionHash**(`input`): `Promise`<{ `bundleProof`: `BundleProof` ; `fromAddress`: `string` ; `fromChainId`: `number` ; `toAddress`: `string` ; `toCalldata`: `string` ; `toChainId`: `number`  }\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `GetRelayMessageDataFromTransactionHashInput` |

#### Returns

`Promise`<{ `bundleProof`: `BundleProof` ; `fromAddress`: `string` ; `fromChainId`: `number` ; `toAddress`: `string` ; `toCalldata`: `string` ; `toChainId`: `number`  }\>

___

### <a id="getrelaymessagepopulatedtx" name="getrelaymessagepopulatedtx"></a> getRelayMessagePopulatedTx

▸ **getRelayMessagePopulatedTx**(`input`): `Promise`<{ `chainId`: `number` = toChainId }\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `GetRelayMessagePopulatedTxInput` |

#### Returns

`Promise`<{ `chainId`: `number` = toChainId }\>

___

### <a id="getrelayreward" name="getrelayreward"></a> getRelayReward

▸ **getRelayReward**(`input`): `Promise`<`number`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `GetRelayRewardInput` |

#### Returns

`Promise`<`number`\>

___

### <a id="getrelaywindowhours" name="getrelaywindowhours"></a> getRelayWindowHours

▸ **getRelayWindowHours**(): `number`

#### Returns

`number`

___

### <a id="getroutedata" name="getroutedata"></a> getRouteData

▸ **getRouteData**(`input`): `Promise`<{ `maxBundleMessages`: `number` ; `messageFee`: `BigNumber` = routeData.messageFee }\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `GetRouteDataInput` |

#### Returns

`Promise`<{ `maxBundleMessages`: `number` ; `messageFee`: `BigNumber` = routeData.messageFee }\>

___

### <a id="getrpcprovider" name="getrpcprovider"></a> getRpcProvider

▸ **getRpcProvider**(`chainId`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `chainId` | `number` |

#### Returns

`any`

___

### <a id="getsendmessagepopulatedtx" name="getsendmessagepopulatedtx"></a> getSendMessagePopulatedTx

▸ **getSendMessagePopulatedTx**(`input`): `Promise`<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `GetSendMessagePopulatedTxInput` |

#### Returns

`Promise`<`any`\>

___

### <a id="getspokeexittime" name="getspokeexittime"></a> getSpokeExitTime

▸ **getSpokeExitTime**(`input`): `Promise`<`number`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `GetSpokeExitTimeInput` |

#### Returns

`Promise`<`number`\>

___

### <a id="getspokemessagebridgecontractaddress" name="getspokemessagebridgecontractaddress"></a> getSpokeMessageBridgeContractAddress

▸ **getSpokeMessageBridgeContractAddress**(`chainId`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `chainId` | `number` |

#### Returns

`string`

___

### <a id="getsupportedchainids" name="getsupportedchainids"></a> getSupportedChainIds

▸ **getSupportedChainIds**(): `number`[]

#### Returns

`number`[]

___

### <a id="hasauctionstarted" name="hasauctionstarted"></a> hasAuctionStarted

▸ **hasAuctionStarted**(`input`): `Promise`<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `HasAuctionStartedInput` |

#### Returns

`Promise`<`boolean`\>

___

### <a id="setcontractaddresses" name="setcontractaddresses"></a> setContractAddresses

▸ **setContractAddresses**(`contractAddresses`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `contractAddresses` | `any` |

#### Returns

`void`

___

### <a id="setrpcprovider" name="setrpcprovider"></a> setRpcProvider

▸ **setRpcProvider**(`chainId`, `provider`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `chainId` | `number` |
| `provider` | `any` |

#### Returns

`void`

___

### <a id="setrpcproviders" name="setrpcproviders"></a> setRpcProviders

▸ **setRpcProviders**(`providers`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `providers` | `Record`<`string`, `any`\> |

#### Returns

`void`

___

### <a id="shouldattemptforwardmessage" name="shouldattemptforwardmessage"></a> shouldAttemptForwardMessage

▸ **shouldAttemptForwardMessage**(`input`): `Promise`<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `ShouldAttemptForwardMessageInput` |

#### Returns

`Promise`<`boolean`\>
