import * as SecureStore from 'expo-secure-store'

const PUBLIC_KEY_STORAGE_KEY = '_Ethereum.publicKey'
const PRIVATE_KEY_STORAGE_KEY = '_Ethereum.privatekey'
const MNEMONIC_STORAGE_KEY = '_Ethereum.mnemonic'

export const getWalletPublicKey = async () => {
  const address = await SecureStore.getItemAsync(PUBLIC_KEY_STORAGE_KEY)
  return address ? JSON.parse(address) : null
}

export const getWalletPrivateKey = async () => {
  const privateKey = await SecureStore.getItemAsync(PRIVATE_KEY_STORAGE_KEY)
  return privateKey ? JSON.parse(privateKey) : null
}

export const setWallet = async (args: {
  publicKey: string
  privateKey: string
  mnemonic: string
}) => {
  const { publicKey, privateKey, mnemonic } = args
  await SecureStore.setItemAsync(PUBLIC_KEY_STORAGE_KEY, JSON.stringify(publicKey.toLowerCase()))
  await SecureStore.setItemAsync(MNEMONIC_STORAGE_KEY, JSON.stringify(mnemonic.toLowerCase()))
  await SecureStore.setItemAsync(PRIVATE_KEY_STORAGE_KEY, JSON.stringify(privateKey.toLowerCase()))
}

export const removeWallet = async () => {
  await SecureStore.deleteItemAsync(PUBLIC_KEY_STORAGE_KEY)
  await SecureStore.deleteItemAsync(PRIVATE_KEY_STORAGE_KEY)
  await SecureStore.deleteItemAsync(MNEMONIC_STORAGE_KEY)
}
