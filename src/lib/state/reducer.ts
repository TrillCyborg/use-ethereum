import { ethers } from 'ethers'
import { ACTIONS } from './actions'
import { Asset, AssetType } from '../assets'

interface Assets {
  [AssetType.eth]: Asset
  [AssetType.dai]: Asset
}

export interface WalletAndAssets {
  wallet: ethers.Wallet
  assets: Asset[]
}

export interface AssetAndValue {
  asset: AssetType
  value: number
}

export interface EthereumState {
  loading: boolean
  wallet: ethers.Wallet
  assets: Assets
}

const initialState = {
  loading: true,
} as EthereumState

const setLoading = (state: EthereumState, loading: boolean) => Object.assign({}, state, { loading })
const walletActionSuccess = (state: EthereumState, payload: WalletAndAssets) => {
  const newState = { wallet: payload.wallet, assets: {} as Assets, loading: false }
  payload.assets.forEach(asset => {
    newState.assets[asset.type] = asset
  })
  return Object.assign({}, state, newState)
}
const updateAsset = (state: EthereumState, assetType: AssetType, update: Partial<Asset>) =>
  Object.assign({}, state, {
    assets: Object.assign({}, state.assets, {
      [assetType]: Object.assign({}, state.assets[assetType], update),
    }),
  })

const ethereumReducer = {
  [ACTIONS.initWalletStart]: (state: EthereumState): EthereumState => setLoading(state, true),
  [ACTIONS.initWalletSuccess]: (state: EthereumState, payload: WalletAndAssets): EthereumState =>
    walletActionSuccess(state, payload),
  [ACTIONS.initWalletFailed]: (state: EthereumState): EthereumState => setLoading(state, false),
  [ACTIONS.createWalletStart]: (state: EthereumState): EthereumState => setLoading(state, true),
  [ACTIONS.createWalletSuccess]: (state: EthereumState, payload: WalletAndAssets): EthereumState =>
    walletActionSuccess(state, payload),
  [ACTIONS.createWalletFailed]: (state: EthereumState): EthereumState => setLoading(state, false),
  [ACTIONS.removeWalletStart]: (state: EthereumState): EthereumState => setLoading(state, true),
  [ACTIONS.removeWalletSuccess]: (state: EthereumState): EthereumState => {
    return Object.assign({}, state, { loading: false, wallet: null, assets: null })
  },
  [ACTIONS.removeWalletFailed]: (state: EthereumState): EthereumState => setLoading(state, false),
  [ACTIONS.restoreWalletStart]: (state: EthereumState): EthereumState => setLoading(state, true),
  [ACTIONS.restoreWalletSuccess]: (state: EthereumState, payload: WalletAndAssets): EthereumState =>
    walletActionSuccess(state, payload),
  [ACTIONS.restoreWalletFailed]: (state: EthereumState): EthereumState => setLoading(state, false),
  [ACTIONS.addToAssetBalance]: (state: EthereumState, payload: AssetAndValue): EthereumState =>
    Object.assign({}, state, {
      assets: Object.assign({}, state.assets, {
        [payload.asset]: Object.assign({}, state.assets[payload.asset], {
          balance: state.assets[payload.asset].balance + payload.value,
          displayBalance: state.assets[payload.asset].displayBalance + payload.value,
        }),
      }),
    }),
  [ACTIONS.sendAssetStart]: (state: EthereumState, payload: AssetAndValue): EthereumState =>
    Object.assign({}, state, {
      assets: Object.assign({}, state.assets, {
        [payload.asset]: Object.assign({}, state.assets[payload.asset], {
          displayBalance: state.assets[payload.asset].displayBalance - payload.value,
        }),
      }),
    }),
  [ACTIONS.sendAssetSuccess]: (state: EthereumState, payload: AssetAndValue): EthereumState =>
    Object.assign({}, state, {
      assets: Object.assign({}, state.assets, {
        [payload.asset]: Object.assign({}, state.assets[payload.asset], {
          balance: state.assets[payload.asset].balance - payload.value,
        }),
      }),
    }),
  [ACTIONS.sendAssetFailed]: (state: EthereumState, payload: AssetAndValue): EthereumState =>
    Object.assign({}, state, {
      assets: Object.assign({}, state.assets, {
        [payload.asset]: Object.assign({}, state.assets[payload.asset], {
          displayBalance: state.assets[payload.asset].displayBalance + payload.value,
        }),
      }),
    }),
}

export default (state = initialState, action: { type: ACTIONS; payload: any }) => {
  const { type, payload } = action
  return ethereumReducer[type] ? ethereumReducer[type](state, payload) : state
}
