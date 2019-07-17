import { ethers } from 'ethers'
import { Networks } from './network'
import { getGasPrice, getGasLimit, EthereumUnits } from './gas'
import erc20ABI, { ERC20Contract } from './contracts/erc20'

export enum AssetType {
  eth = 'ETH',
  dai = 'DAI',
}

export interface Asset {
  type: AssetType
  balance: number
  displayBalance: number
}

export interface TransactionRequest {
  wallet: ethers.Wallet
  to: string
  amount: number
  type: AssetType
}

//* TODO: Allow user to add their own tokens
const TOKENS = {
  [Networks.mainnet]: {
    [AssetType.dai]: '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359',
  },
  [Networks.ropsten]: {
    [AssetType.dai]: '0xad6d458402f60fd3bd25163575031acdce07538d',
  },
  [Networks.unknown]: {
    [AssetType.dai]: '0x0000000000000000000000000000000000000000' // LOCAL_DAI,
  },
}

export const getTokenContract = async (wallet: ethers.Wallet, type: AssetType) => {
  const network = await wallet.provider.getNetwork()
  const tokenAddress = TOKENS[network.name as Networks][type as AssetType.dai]
  const contract = new ethers.Contract(tokenAddress, erc20ABI, wallet) as ERC20Contract
  return contract
}

export const sendEther = async (
  args: TransactionRequest
): Promise<ethers.providers.TransactionResponse> => {
  const { wallet, to, amount } = args
  const weiAmount = new ethers.utils.BigNumber(ethers.utils.parseEther(amount.toString()))
  const etherBalance = await wallet.getBalance()

  if (weiAmount.gt(etherBalance)) {
    throw new Error('Not enough funds')
  }

  const network = await wallet.provider.getNetwork()
  const gasLimit = await getGasLimit(args)
  const gasPrice: string | undefined = await new Promise(async resolve => {
    try {
      const gasPrice = await getGasPrice()
      return resolve(gasPrice)
    } catch (e) {
      console.log('ERROR', e)
      return resolve(undefined)
    }
  })

  //* TODO: Add min amount

  if (
    gasPrice &&
    ethers.utils
      .parseUnits(gasPrice, EthereumUnits.gwei)
      .add(ethers.utils.parseUnits(gasLimit, EthereumUnits.gwei))
      .gt(etherBalance)
  ) {
    throw new Error('Not enough Gas')
  }

  if (
    gasPrice
      ? weiAmount
          .add(ethers.utils.parseUnits(gasPrice, EthereumUnits.gwei))
          .add(ethers.utils.parseUnits(gasLimit, EthereumUnits.gwei))
          .gt(etherBalance)
      : weiAmount.add(ethers.utils.parseUnits(gasLimit, EthereumUnits.gwei)).gt(etherBalance)
  ) {
    throw new Error('Not enough funds')
  }

  return wallet.sendTransaction({
    to,
    value: weiAmount,
    chainId: network.chainId,
    gasLimit: ethers.utils.parseUnits(gasLimit, EthereumUnits.gwei),
    gasPrice: gasPrice ? ethers.utils.parseUnits(gasPrice, EthereumUnits.gwei) : undefined,
  })
}

export const sendToken = async (
  args: TransactionRequest
): Promise<ethers.providers.TransactionResponse> => {
  const { wallet, to, amount, type } = args

  if (type === AssetType.eth) throw new Error('Use sendEther function to send ETH')

  //* TODO: Add min amount

  const contract = await getTokenContract(wallet, type)
  const decimals = await contract.decimals()
  const weiAmount = new ethers.utils.BigNumber(ethers.utils.parseUnits(amount.toString(), decimals))
  const tokenBalance = await contract.balanceOf(wallet.address)

  if (weiAmount.gt(tokenBalance)) {
    throw new Error('Not enough funds')
  }

  const etherBalance = await wallet.getBalance()
  const gasPrice: string | undefined = await new Promise(async resolve => {
    try {
      const gasPrice = await getGasPrice()
      return resolve(gasPrice)
    } catch (e) {
      console.log('ERROR', e)
      return resolve(undefined)
    }
  })

  if (gasPrice && ethers.utils.parseUnits(gasPrice, EthereumUnits.gwei).gt(etherBalance)) {
    throw new Error('Not enough Gas')
  }

  return contract.transfer(to, weiAmount)
}

export const getEtherBalance = async (wallet: ethers.Wallet): Promise<number> => {
  //* TODO: Get pending transactions. Sub amount from balance
  const balance = await wallet.provider.getBalance(wallet.address)
  return Number(ethers.utils.formatEther(balance))
}

export const getTokenBalance = async (
  tokenAddress: string,
  wallet: ethers.Wallet
): Promise<number> => {
  //* TODO: Get pending transactions. Sub amount from balance
  const contract = new ethers.Contract(tokenAddress, erc20ABI, wallet) as ERC20Contract
  const balance: ethers.utils.BigNumber = await contract.balanceOf(wallet.address)
  const decimals: number = await contract.decimals()
  const tokenBalance = ethers.utils.formatUnits(balance, decimals)
  return Number(tokenBalance)
}

export const loadAssets = async (assets: AssetType[], wallet: ethers.Wallet): Promise<Asset[]> => {
  const network = await wallet.provider.getNetwork()
  const tokensAddresses = TOKENS[network.name as Networks]
  const assetMap = await Promise.all(
    assets.map(async (asset: AssetType) => {
      try {
        if (asset === AssetType.eth) {
          const balance = await getEtherBalance(wallet)
          return {
            type: asset,
            balance,
            displayBalance: balance,
          }
        } else {
          const balance = await getTokenBalance(tokensAddresses[asset], wallet)
          return {
            type: asset,
            balance,
            displayBalance: balance,
          }
        }
      } catch (e) {
        console.log('ERROR', e)
        return null
      }
    })
  )
  return assetMap.filter((asset: Asset | null) => !!asset) as Asset[]
}
