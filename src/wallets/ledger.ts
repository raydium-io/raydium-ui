import { getPublicKey, signTransaction, getSolanaDerivationPath } from './ledger-core'
import { WalletAdapter } from './types'

import type Transport from '@ledgerhq/hw-transport'
import type { Transaction } from '@solana/web3.js'

import EventEmitter from 'eventemitter3'
import { PublicKey } from '@solana/web3.js'
import TransportWebUSB from '@ledgerhq/hw-transport-webusb'

const DEFAULT_DERIVATION_PATH = getSolanaDerivationPath()

export interface LedgerHDWalletPath {
  account?: number
  change?: number
}

export interface LedgerHDWalletAccount extends LedgerHDWalletPath {
  key: PublicKey
}

export class LedgerWalletAdapter extends EventEmitter implements WalletAdapter {
  _connecting: boolean
  _publicKey: PublicKey | null
  _transport: Transport | null
  _derivationPath: Buffer

  constructor() {
    super()
    this._connecting = false
    this._publicKey = null
    this._transport = null
    this._derivationPath = DEFAULT_DERIVATION_PATH
  }

  get publicKey() {
    return this._publicKey
  }

  get connected() {
    return this._publicKey !== null
  }

  get autoApprove() {
    return false
  }

  get transport(): Transport | null {
    return this._transport
  }

  public async signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {
    const result: Transaction[] = []
    for (let i = 0; i < transactions.length; i++) {
      const transaction = transactions[i]
      const signed = await this.signTransaction(transaction)
      result.push(signed)
    }

    return result
  }

  async signTransaction(transaction: Transaction) {
    if (!this._transport || !this._publicKey) {
      throw new Error('Not connected to Ledger')
    }

    // @TODO: account selection (derivation path changes with account)
    const signature = await signTransaction(this._transport, transaction, this._derivationPath)

    transaction.addSignature(this._publicKey, signature)

    return transaction
  }

  async connect(args?: unknown) {
    if (this._connecting) {
      return
    }

    this._connecting = true
    try {
      // @TODO: transport selection (WebUSB, WebHID, bluetooth, ...)
      this._transport = await TransportWebUSB.create()
      // @TODO: account selection
      if (args) {
        const { account, change } = args as {
          account?: number
          change?: number
        }
        this._derivationPath = getSolanaDerivationPath(account, change)
      }
      this._publicKey = await getPublicKey(this._transport, this._derivationPath)
      this.emit('connect', this._publicKey)
    } catch (error) {
      await this.disconnect()
      this._connecting = false

      throw new Error(error.message)
    } finally {
      this._connecting = false
    }
  }

  async disconnect() {
    let emit = false
    if (this._transport) {
      await this._transport.close()
      this._transport = null
      emit = true
    }

    this._connecting = false
    this._publicKey = null

    if (emit) {
      this.emit('disconnect')
    }
  }

  static async fetchAccountsForPaths(paths: LedgerHDWalletPath[]): Promise<LedgerHDWalletAccount[]> {
    let transport: Transport | null = null
    try {
      transport = await TransportWebUSB.create()
      const ret = []
      for (const path of paths) {
        const derivationPath = getSolanaDerivationPath(path.account, path.change)
        ret.push({
          ...path,
          key: await getPublicKey(transport, derivationPath)
        })
      }
      return ret
    } catch (error) {
      throw new Error(error.message)
    } finally {
      await transport?.close()
    }
  }
}
