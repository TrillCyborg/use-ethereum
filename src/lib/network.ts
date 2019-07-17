import { ethers } from 'ethers'
import { Envs, ProviderOpts } from '../common/types'

//* TODO: Allow user to configure networks
export enum Networks {
  mainnet = 'mainnet',
  ropsten = 'ropsten',
  unknown = 'unknown',
}

export const getNetwork = (opts?: ProviderOpts): Networks => {
  switch (process.env.NODE_ENV) {
    case Envs.dev:
      return Networks.unknown
    case Envs.stag:
      return Networks.ropsten
    case Envs.prod:
      return Networks.mainnet
    default:
      return opts && opts.useTestnet ? Networks.ropsten : Networks.unknown
  }
}

export const getProvider = (opts?: ProviderOpts):
  | ethers.providers.JsonRpcProvider
  | ethers.providers.BaseProvider
  | ethers.providers.InfuraProvider => {
  const network = getNetwork(opts)
  const provider =
    network === Networks.unknown
      ? new ethers.providers.JsonRpcProvider()
      : ethers.getDefaultProvider(network)
  provider.getBalance = provider.getBalance.bind(provider)
  provider.getNetwork = provider.getNetwork.bind(provider)
  return provider
}
