import { ethers } from 'ethers'
import { AssetType, sendEther, sendToken, TransactionRequest } from './assets'
import { getProvider } from './network'
import { setWallet, getWalletPrivateKey } from './storage'
import { ProviderOpts } from '../common/types'

export enum WalletStorageType {
  privateKey = 'PRIVATE_KEY',
  mnemonics = 'MNEMONICS',
}

const generateMnemonics = () => {
  return ethers.utils.HDNode.entropyToMnemonic(ethers.utils.randomBytes(16)).split(' ')
}

const loadWalletFromMnemonics = async (mnemonics: string[], opts?: ProviderOpts) => {
  if (!(mnemonics instanceof Array)) throw new Error('invalid mnemonic')

  const provider = getProvider(opts)
  const wallet = ethers.Wallet.fromMnemonic(mnemonics.join(' ')).connect(provider)
  await setWallet({
    privateKey: wallet.privateKey,
    mnemonic: wallet.mnemonic,
    publicKey: wallet.address,
  })
  return wallet
}

const loadWalletFromPrivateKey = async (privateKey: string, opts?: ProviderOpts): Promise<ethers.Wallet> => {
  const provider = getProvider(opts)
  const wallet = new ethers.Wallet(privateKey, provider)
  return wallet
}

export const createWallet = async (opts?: ProviderOpts): Promise<ethers.Wallet> => {
  const mnemonics = generateMnemonics()
  const wallet = await loadWalletFromMnemonics(mnemonics, opts)
  return wallet
}

export const loadWallet = async (
  type: WalletStorageType,
  mnemonics?: string[],
  opts?: ProviderOpts
): Promise<ethers.Wallet> => {
  switch (type) {
    case WalletStorageType.privateKey:
      const privateKey = await getWalletPrivateKey()
      if (!privateKey) throw new Error(`No private key in storage`)
      return loadWalletFromPrivateKey(privateKey, opts)
    case WalletStorageType.mnemonics:
      if (!mnemonics) throw new Error(`No mnemonics provided`)
      return loadWalletFromMnemonics(mnemonics)
  }
}

export const sendAsset = async (
  args: TransactionRequest
): Promise<ethers.providers.TransactionResponse> => {
  const { type } = args
  return type === AssetType.eth ? sendEther(args) : sendToken(args)
}
