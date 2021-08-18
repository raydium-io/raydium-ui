import { WalletAdapter } from '@solana/wallet-base'

import EventEmitter from 'eventemitter3'
import { PublicKey, Transaction } from '@solana/web3.js'

export class SolongWalletAdapter extends EventEmitter implements WalletAdapter {
  _publicKey: PublicKey | null
  _onProcess: boolean
  _connected: boolean
  constructor() {
    super()
    this._publicKey = null
    this._onProcess = false
    this._connected = false
    this.connect = this.connect.bind(this)
  }

  get publicKey() {
    return this._publicKey
  }

  get connected() {
    return this._connected
  }

  // eslint-disable-next-line
  async signTransaction(transaction: Transaction) {
    return (window as any).solong.signTransaction(transaction)
  }

  // eslint-disable-next-line
  async signAllTransactions(transactions: Transaction[]) {
    return transactions
  }

  connect() {
    if (this._onProcess) {
      return
    }

    this._onProcess = true
    ;(window as any).solong
      .selectAccount()
      .then((account: any) => {
        this._publicKey = new PublicKey(account)
        this._connected = true
        this.emit('connect', this._publicKey)
      })
      .catch(() => {
        this.disconnect()
      })
      .finally(() => {
        this._onProcess = false
      })
  }

  disconnect() {
    if (this._publicKey) {
      this._publicKey = null
      this._connected = false
      this.emit('disconnect')
    }
  }
}
