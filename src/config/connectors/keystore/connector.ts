import { getAddress } from 'viem'
import type { Chain } from 'viem/chains'

import type { KeystoreProviderOptions, WalletClient } from './provider'
import { KeystoreProvider } from './provider'
import { Connector } from "wagmi";
import { KEYSTORE_AUTOCONNECT_KEY } from "@/config/connectors/keystore/constants";

type KeystoreConnectorOptions = Omit<KeystoreProviderOptions, 'chainId'> & {
  chainId?: number
}

export class KeystoreConnector {
  readonly id = 'keystore'
  readonly name = 'Keystore'
  readonly ready = true

  // #provider?: KeystoreProvider
  //
  // constructor({
  //               chains,
  //               options,
  //             }: {
  //   chains?: Chain[]
  //   options: KeystoreConnectorOptions
  // }) {
  //   super({
  //     chains,
  //     options: {
  //       ...options,
  //       chainId: options.chainId ?? chains?.[0]?.id,
  //     },
  //   })
  // }
  //
  // async connect({ chainId }: { chainId?: number } = {}) {
  //   const provider = await this.getProvider({ chainId })
  //   provider.on('accountsChanged', this.onAccountsChanged)
  //   provider.on('chainChanged', this.onChainChanged)
  //   provider.on('disconnect', this.onDisconnect)
  //
  //   this.emit('message', { type: 'connecting' })
  //
  //   const accounts = await provider.enable()
  //   const account = getAddress(accounts[0] as string)
  //   const id = normalizeChainId(provider.chainId)
  //   const unsupported = this.isChainUnsupported(id)
  //   const data = { account, chain: { id, unsupported }, provider }
  //
  //   return new Promise<Required<ConnectorData>>((res) =>
  //     setTimeout(() => res(data), 100),
  //   )
  // }
  //
  // async disconnect() {
  //   const provider = await this.getProvider()
  //   await provider.disconnect()
  //
  //   provider.removeListener('accountsChanged', this.onAccountsChanged)
  //   provider.removeListener('chainChanged', this.onChainChanged)
  //   provider.removeListener('disconnect', this.onDisconnect)
  // }
  //
  // async getAccount() {
  //   const provider = await this.getProvider()
  //   const accounts = await provider.getAccounts()
  //   const account = accounts[0]
  //   if (!account) throw new Error('Failed to get account')
  //   // return checksum address
  //   return getAddress(account)
  // }
  //
  // async getChainId() {
  //   const provider = await this.getProvider()
  //   return normalizeChainId(provider.chainId)
  // }
  //
  // async getProvider({ chainId }: { chainId?: number } = {}) {
  //   if (!this.#provider || chainId)
  //     this.#provider = new KeystoreProvider({
  //       ...this.options,
  //       chainId: chainId ?? this.options.chainId ?? this.chains[0]!.id,
  //     })
  //   return this.#provider
  // }
  //
  // async getWalletClient(): Promise<WalletClient> {
  //   const provider = await this.getProvider()
  //   return provider.getWalletClient()
  // }
  //
  // async isAuthorized() {
  //   try {
  //     const provider = await this.getProvider()
  //     const account = await provider.getAccounts()
  //     return !!account;
  //   } catch {
  //     return false
  //   }
  // }
  //
  // async #switchChain(chainId: number) {
  //   const provider = await this.getProvider()
  //   await provider.switchChain(chainId)
  //   return (
  //     this.chains.find((x) => x.id === chainId) ?? {
  //       id: chainId,
  //       name: `Chain ${chainId}`,
  //       network: `${chainId}`,
  //       nativeCurrency: { name: 'Ether', decimals: 18, symbol: 'ETH' },
  //       rpcUrls: { default: { http: [''] }, public: { http: [''] } },
  //     }
  //   )
  // }
  //
  // async watchAsset(asset: {
  //   address: string
  //   decimals?: number
  //   image?: string
  //   symbol: string
  // }) {
  //   const provider = await this.getProvider()
  //   return provider.watchAsset(asset)
  // }
  //
  // protected onAccountsChanged = (accounts: string[]) => {
  //   if (accounts.length === 0) this.emit('disconnect')
  //   else this.emit('change', { account: getAddress(accounts[0] as string) })
  // }
  //
  // protected onChainChanged = (chainId: number | string) => {
  //   const id = normalizeChainId(chainId)
  //   const unsupported = this.isChainUnsupported(id)
  //   this.emit('change', { chain: { id, unsupported } })
  // }
  //
  // protected onDisconnect = () => {
  //   this.emit('disconnect');
  // }
  //
  // toJSON() {
  //   return '<MockConnector>'
  // }
}
