// import { Platform } from 'react-native'
// import * as SecureStore from 'expo-secure-store';
// import {
//   PRIVATE_KEY_STORAGE_KEY,
//   MNEMONIC_STORAGE_KEY,
//   PUBLIC_KEY_STORAGE_KEY,
// } from '../common/consts'

// const isMobile = Platform.OS === 'ios' || Platform.OS === 'android'

//* TODO: Get this file working on both mobile and web

export const getWalletPublicKey = async () => {
  // if (isMobile) {
  //   const address = await SecureStore.getItemAsync(PUBLIC_KEY_STORAGE_KEY)
  //   return address ? JSON.parse(address) : null
  // }
}

export const getWalletPrivateKey = async () => {
  // if (isMobile) {
  //   const privateKey = await SecureStore.getItemAsync(PRIVATE_KEY_STORAGE_KEY)
  //   return privateKey ? JSON.parse(privateKey) : null
  // }
}

export const setWallet = async (args: {
  publicKey: string
  privateKey: string
  mnemonic: string
}) => {
  // if (isMobile) {
  //   const { publicKey, privateKey, mnemonic } = args
  //   await SecureStore.setItemAsync(PUBLIC_KEY_STORAGE_KEY, JSON.stringify(publicKey.toLowerCase()))
  //   await SecureStore.setItemAsync(MNEMONIC_STORAGE_KEY, JSON.stringify(mnemonic.toLowerCase()))
  //   await SecureStore.setItemAsync(PRIVATE_KEY_STORAGE_KEY, JSON.stringify(privateKey.toLowerCase()))
  // }
}

export const removeWallet = async () => {
  // if (isMobile) {
  //   await SecureStore.deleteItemAsync(PUBLIC_KEY_STORAGE_KEY)
  //   await SecureStore.deleteItemAsync(PRIVATE_KEY_STORAGE_KEY)
  //   await SecureStore.deleteItemAsync(MNEMONIC_STORAGE_KEY)
  // }
}
