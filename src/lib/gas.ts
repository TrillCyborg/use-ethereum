import { ethers } from 'ethers'
import { TransactionRequest } from './assets'

export enum EthereumUnits {
  ether = 'ether',
  gwei = 'gwei',
  wei = 'wei',
}

// Returns in Gwei
export const getGasLimit = async (args: TransactionRequest) => {
  const { wallet, to, amount } = args
  const network = await wallet.provider.getNetwork()
  const weiAmount = new ethers.utils.BigNumber(ethers.utils.parseEther(amount.toString()))
  const gasEstimate = await wallet.provider.estimateGas({
    to,
    value: weiAmount,
    chainId: network.chainId,
  })
  return ethers.utils.formatUnits(gasEstimate, EthereumUnits.gwei)
}

// Returns in Gwei
export const getGasPrice = async () => {
  const result = await fetch('https://ethgasstation.info/json/ethgasAPI.json')
  const gasPrices = await result.json()
  return parseInt(gasPrices.average).toFixed(0)
}
