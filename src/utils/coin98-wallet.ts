import EventEmitter from 'eventemitter3'
import { PublicKey } from '@solana/web3.js'

export default class Coin98Wallet extends EventEmitter {
  _publicKey: any
  _onProcess: boolean
  // eslint-disable-next-line
  constructor(network = '') {
    super()
    this._publicKey = null
    this._onProcess = false
    this.connect = this.connect.bind(this)
    this.disconnect = this.disconnect.bind(this)
  }

  get publicKey() {
    return this._publicKey
  }

  async signTransaction(transaction: any) {
    const trx = await (window as any).coin98.signTransaction(transaction).catch(() => {
      throw new Error('User reject sign request')
    })
    return trx
  }

  connect() {
    if (this._onProcess) {
      return
    }

    this._onProcess = true
    ;(window as any).coin98
      .connect({
        name: 'Raydium',
        logo: ''
      })
      .then((event: any) => {
        const { data } = event.detail
        const address = data[0].address
        this._publicKey = new PublicKey(address)
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
      this.emit('disconnect')
    }
  }
}
