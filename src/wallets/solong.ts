import { WalletAdapter } from './types'

import EventEmitter from 'eventemitter3'
import { PublicKey, Transaction } from '@solana/web3.js'

export class SolongWalletAdapter extends EventEmitter implements WalletAdapter {
  _publicKey?: PublicKey
  _onProcess: boolean
  _connected: boolean
  constructor() {
    super()
    this._onProcess = false
    this._connected = false
    this.connect = this.connect.bind(this)
  }

  get connected() {
    return this._connected
  }

  get autoApprove() {
    return false
  }

  public async signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {
    const solong = (window as any).solong
    if (solong.signAllTransactions) {
      return solong.signAllTransactions(transactions)
    } else {
      const result: Transaction[] = []
      for (let i = 0; i < transactions.length; i++) {
        const transaction = transactions[i]
        const signed = await solong.signTransaction(transaction)
        result.push(signed)
      }

      return result
    }
  }

  get publicKey() {
    return this._publicKey
  }

  signTransaction(transaction: Transaction) {
    return (window as any).solong.signTransaction(transaction)
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
      this._publicKey = undefined
      this._connected = false
      this.emit('disconnect')
    }
  }
}
