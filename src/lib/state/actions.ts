import { Action } from 'redux'
import { ThunkAction, ThunkDispatch } from 'redux-thunk'
import { EthereumState, WalletAndAssets, AssetAndValue } from './reducer'
import {
  createWallet as create,
  loadWallet as load,
  sendAsset as send,
  WalletStorageType,
} from '../wallet'
import { loadAssets, AssetType } from '../assets'
import { removeWallet as remove } from '../storage'
import { ProviderOpts } from '../../common/types'

export enum ACTIONS {
  initWalletStart = 'INIT_WALLET_START',
  initWalletSuccess = 'INIT_WALLET_SUCCESS',
  initWalletFailed = 'INIT_WALLET_FAILED',

  createWalletStart = 'CREATE_WALLET_START',
  createWalletSuccess = 'CREATE_WALLET_SUCCESS',
  createWalletFailed = 'CREATE_WALLET_FAILED',

  removeWalletStart = 'REMOVE_WALLET_START',
  removeWalletSuccess = 'REMOVE_WALLET_SUCCESS',
  removeWalletFailed = 'REMOVE_WALLET_FAILED',

  restoreWalletStart = 'RESTORE_WALLET_START',
  restoreWalletSuccess = 'RESTORE_WALLET_SUCCESS',
  restoreWalletFailed = 'RESTORE_WALLET_FAILED',

  addToAssetBalance = 'ADD_TO_ASSET_BALANCE',

  sendAssetStart = 'SEND_ASSET_START',
  sendAssetSuccess = 'SEND_ASSET_SUCCESS',
  sendAssetFailed = 'SEND_ASSET_FAILED',
}

export type AsyncAction = ThunkAction<void, EthereumState, null, Action<ACTIONS>>
export type AsyncDispatch = ThunkDispatch<EthereumState, null, Action<ACTIONS>>

const ASSETS = [AssetType.eth, AssetType.dai]

const initWalletStart = () => ({ type: ACTIONS.initWalletStart })
const initWalletSuccess = (payload: WalletAndAssets) => ({
  type: ACTIONS.initWalletSuccess,
  payload,
})
const initWalletFailed = () => ({ type: ACTIONS.initWalletFailed })

export const initWallet = (): AsyncAction => async dispatch => {
  dispatch(initWalletStart())
  try {
    const wallet = await load(WalletStorageType.privateKey)
    const assets = await loadAssets(ASSETS, wallet)
    dispatch(initWalletSuccess({ wallet, assets }))
  } catch (e) {
    console.log('ERROR', e)
    dispatch(initWalletFailed())
    throw new Error(e)
  }
}

const createWalletStart = () => ({ type: ACTIONS.createWalletStart })
const createWalletSuccess = (payload: WalletAndAssets) => ({
  type: ACTIONS.createWalletSuccess,
  payload,
})
const createWalletFailed = () => ({ type: ACTIONS.createWalletFailed })

export const createWallet = (opts?: ProviderOpts): AsyncAction => async dispatch => {
  dispatch(createWalletStart())
  try {
    const wallet = await create(opts)
    const assets = await loadAssets(ASSETS, wallet)
    dispatch(createWalletSuccess({ wallet, assets }))
  } catch (e) {
    console.log('ERROR', e)
    dispatch(createWalletFailed())
    throw new Error(e)
  }
}

const removeWalletStart = () => ({ type: ACTIONS.removeWalletStart })
const removeWalletSuccess = () => ({ type: ACTIONS.removeWalletSuccess })
const removeWalletFailed = () => ({ type: ACTIONS.removeWalletFailed })

export const removeWallet = (): AsyncAction => async dispatch => {
  dispatch(removeWalletStart())
  try {
    // REMOVE INCOMING FUNDS LISTENERS
    await remove()
    dispatch(removeWalletSuccess())
  } catch (e) {
    console.log('ERROR', e)
    // ADD INCOMING FUNDS LISTENERS BACK
    dispatch(removeWalletFailed())
    throw new Error(e)
  }
}

const restoreWalletStart = () => ({ type: ACTIONS.restoreWalletStart })
const restoreWalletSuccess = (payload: WalletAndAssets) => ({
  type: ACTIONS.restoreWalletSuccess,
  payload,
})
const restoreWalletFailed = () => ({ type: ACTIONS.restoreWalletFailed })

export const restoreWallet = (
  mnemonics: string,
  userAddress: string,
  opts?: ProviderOpts
): AsyncAction => async dispatch => {
  dispatch(restoreWalletStart())
  try {
    const wallet = await load(WalletStorageType.mnemonics, mnemonics.split(' '), opts)
    if (wallet.address.toLowerCase() !== userAddress.toLowerCase()) {
      await remove()
      throw new Error(
        `Incorrect wallet restored. Restored: ${wallet.address} Expected: ${userAddress}`
      )
    }
    const assets = await loadAssets(ASSETS, wallet)
    dispatch(restoreWalletSuccess({ wallet, assets }))
  } catch (e) {
    console.log('ERROR', e)
    dispatch(restoreWalletFailed())
    throw new Error(e)
  }
}

export const addToAssetBalance = (
  asset: AssetType,
  newBalance: number,
  noDiff?: boolean
): AsyncAction => (dispatch, getState) => {
  const { assets } = getState()
  const currentDisplayBalance = assets[asset].displayBalance
  const balanceDiff = noDiff ? newBalance : newBalance - currentDisplayBalance

  return dispatch({
    type: ACTIONS.addToAssetBalance,
    payload: { asset, value: balanceDiff },
  })
}

const sendAssetStart = (payload: AssetAndValue) => ({ type: ACTIONS.sendAssetStart, payload })
const sendAssetSuccess = (payload: AssetAndValue) => ({ type: ACTIONS.sendAssetSuccess, payload })
const sendAssetFailed = (payload: AssetAndValue) => ({ type: ACTIONS.sendAssetFailed, payload })

export const sendAsset = (to: string, amount: number, asset: AssetType): AsyncAction => async (
  dispatch,
  getState
) => {
  const { wallet } = getState()

  dispatch(sendAssetStart({ asset, value: amount }))

  try {
    const tx = await send({ wallet, to, amount, type: asset })

    if (!tx.hash) {
      throw new Error('No tx hash')
    }

    const transaction = await wallet.provider.waitForTransaction(tx.hash)

    if (transaction.status === 1) {
      console.log('TRANSACTION DONE')
      dispatch(sendAssetSuccess({ asset, value: amount }))
    } else {
      dispatch(sendAssetFailed({ asset, value: amount }))
    }
  } catch (e) {
    console.log('ERROR', e)
    dispatch(sendAssetFailed({ asset, value: amount }))
  }
}
