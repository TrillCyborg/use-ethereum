# use-ethereum

A simple react hook for accessing Ethereum in any react application.

## Installation

```sh
yarn add use-ethereum
```

## Usage

Wrap you React application in the `<EthereumProvider />` component. Any component nested under the EthereumProvider can access  Ethereum by calling the `useEthereum` hook.

```js
const ethereum = useEthereum()
```

An HOC `withEthereum` is also provided.

## Storage

In order for this package to support as many platforms as possible the private key storage is generic and must be implemented by you. In the examples folder you can find an implementation for an Expo React Native app.

The following interface must be implemented and passed into the `EthereumProvider` as a `storage` props:

```ts
interface WalletStorage {
  getWalletPublicKey: () => Promise<string | null>
  getWalletPrivateKey: () => Promise<string | null>
  setWallet: (args: {
    publicKey: string
    privateKey: string
    mnemonic: string
  }) => Promise<void>
  removeWallet: () => Promise<void>
}
```