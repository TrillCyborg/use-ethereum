export enum Envs {
  dev = 'development',
  stag = 'staging',
  prod = 'production',
}

export interface ProviderOpts {
  useTestnet?: boolean
}

export interface WalletStorage {
  getWalletPublicKey: () => Promise<string | null>
  getWalletPrivateKey: () => Promise<string | null>
  setWallet: (args: {
    publicKey: string
    privateKey: string
    mnemonic: string
  }) => Promise<void>
  removeWallet: () => Promise<void>
}