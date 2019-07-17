import * as React from 'react'
import { ethers } from 'ethers'
import { Provider, connect } from 'react-redux'
import store from './lib/state/store'
import { EthereumState } from './lib/state/reducer'
import {
  AsyncDispatch,
  initWallet,
  createWallet,
  removeWallet,
  restoreWallet,
  addToAssetBalance,
  sendAsset,
} from './lib/state/actions'
import { AssetType, getTokenContract } from './lib/assets'
import { ProviderOpts } from './common/types'

export interface Ethereum extends EthereumState {
  sendAsset: (to: string, amount: number, asset: AssetType) => void
  createWallet: () => void
  removeWallet: () => void
  restoreWallet: (mnemonics: string, userAddress: string) => void
}

export const EthereumContext = React.createContext({} as Ethereum)

interface EthereumReduxProviderProps {
  useTestnet?: boolean
  children: JSX.Element
}

interface EthereumProviderProps extends EthereumReduxProviderProps, EthereumState {
  initWallet: () => void
  createWallet: (opts?: ProviderOpts) => void
  removeWallet: () => void
  restoreWallet: (mnemonics: string, userAddress: string, opts?: ProviderOpts) => void
  addToAssetBalance: (asset: AssetType, balance: number, noDiff?: boolean) => void
  sendAsset: (to: string, amount: number, asset: AssetType) => void
}

class EthereumProvider extends React.Component<EthereumProviderProps> {
  public componentDidMount = async () => {
    await this.props.initWallet()
    this.handleIncomingFunds()
  }

  public createWallet = async () => {
    await this.props.createWallet({ useTestnet: this.props.useTestnet })
    this.handleIncomingFunds()
  }

  public removeWallet = async () => {
    if (this.props.wallet && this.props.wallet.provider) {
      this.props.wallet.provider.removeAllListeners(this.props.wallet.address)
    }
    try {
      await this.props.removeWallet()
    } catch (e) {
      this.handleIncomingFunds()
    }
  }

  public restoreWallet = async (mnemonics: string, userAddress: string) => {
    await this.props.restoreWallet(mnemonics, userAddress, { useTestnet: this.props.useTestnet })
    this.handleIncomingFunds()
  }

  public handleIncomingFunds = async () => {
    const { wallet } = this.props
    if (wallet) {
      const daiContract = await getTokenContract(wallet, AssetType.dai)

      this.props.wallet.provider.removeAllListeners(this.props.wallet.address)
      daiContract.removeAllListeners('Transfer')

      this.props.wallet.provider.on(wallet.address, newBalance => {
        const balance = ethers.utils.formatEther(newBalance)
        this.props.addToAssetBalance(AssetType.eth, parseFloat(balance))
      })
      daiContract.on(
        'Transfer',
        async (from: string, to: string, amount: ethers.utils.BigNumber) => {
          if (to.toLowerCase() === this.props.wallet.address.toLowerCase()) {
            const decimals = await daiContract.decimals()
            const balance = ethers.utils.formatUnits(amount, decimals)
            this.props.addToAssetBalance(AssetType.dai, parseFloat(balance), true)
          }
        }
      )

      console.log('Listening ERC20 transfer...')
    }
  }

  public sendAsset = (to: string, amount: number, asset: AssetType) =>
    this.props.sendAsset(to, amount, asset)

  public render() {
    const { children } = this.props
    const value = {
      wallet: this.props.wallet,
      assets: this.props.assets,
      loading: this.props.loading,
      createWallet: this.createWallet,
      removeWallet: this.removeWallet,
      restoreWallet: this.restoreWallet,
      sendAsset: this.sendAsset,
    }
    return <EthereumContext.Provider value={value}>{children}</EthereumContext.Provider>
  }
}

export const useEthereum = () => React.useContext(EthereumContext)

export const withEthereum = (
  BaseComponent: React.ComponentType<Ethereum & any>
) => (props: any) => (
  <EthereumContext.Consumer>
    {ethereum => (
      <BaseComponent {...props} {...ethereum} />
    )}
  </EthereumContext.Consumer>
)

const mapStateToProps = (state: EthereumState) => ({ ...state })
const mapDispatchToProps = (dispatch: AsyncDispatch) => ({
  initWallet: () => dispatch(initWallet()),
  createWallet: (opts?: ProviderOpts) => dispatch(createWallet(opts)),
  removeWallet: () => dispatch(removeWallet()),
  restoreWallet: (mnemonics: string, userAddress: string, opts?: ProviderOpts) =>
    dispatch(restoreWallet(mnemonics, userAddress, opts)),
  addToAssetBalance: (asset: AssetType, balance: number, noDiff?: boolean) =>
    dispatch(addToAssetBalance(asset, balance, noDiff)),
  sendAsset: (to: string, amount: number, asset: AssetType) =>
    dispatch(sendAsset(to, amount, asset)),
})

const EthereumProviderWithRedux = connect(
  mapStateToProps,
  mapDispatchToProps
)(EthereumProvider)
const EthereumReduxProvider = (props: EthereumReduxProviderProps) => (
  <Provider store={store}>
    <EthereumProviderWithRedux {...props} />
  </Provider>
)

export default EthereumReduxProvider
