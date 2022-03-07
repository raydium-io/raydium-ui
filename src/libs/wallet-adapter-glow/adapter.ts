import {
  BaseMessageSignerWalletAdapter,
  EventEmitter,
  SendTransactionOptions,
  WalletAccountError,
  WalletConnectionError,
  WalletDisconnectedError,
  WalletDisconnectionError,
  WalletError,
  WalletNotConnectedError,
  WalletNotReadyError,
  WalletPublicKeyError,
  WalletSignTransactionError,
  WalletWindowClosedError
} from '@solana/wallet-adapter-base'
import { Connection, PublicKey, SendOptions, Transaction, TransactionSignature } from '@solana/web3.js'

interface GlowWalletEvents {
  connect(...args: unknown[]): unknown
  disconnect(...args: unknown[]): unknown
}

interface GlowWallet extends EventEmitter<GlowWalletEvents> {
  isGlow?: boolean
  publicKey?: { toBytes(): Uint8Array }
  isConnected: boolean
  signTransaction(transaction: Transaction): Promise<Transaction>
  signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>
  signAndSendTransaction(transaction: Transaction, options?: SendOptions): Promise<{ signature: TransactionSignature }>
  signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>
  connect(): Promise<void>
  disconnect(): Promise<void>
  _handleDisconnect(...args: unknown[]): unknown
}

interface GlowWindow extends Window {
  glowSolana?: GlowWallet
}

declare const window: GlowWindow

export interface GlowWalletAdapterConfig {}

export class GlowWalletAdapter extends BaseMessageSignerWalletAdapter {
  private _connecting: boolean
  private _wallet: GlowWallet | null
  private _publicKey: PublicKey | null

  constructor(_config: GlowWalletAdapterConfig = {}) {
    super()
    this._connecting = false
    this._wallet = null
    this._publicKey = null
  }

  get publicKey(): PublicKey | null {
    return this._publicKey
  }

  get connecting(): boolean {
    return this._connecting
  }

  get connected(): boolean {
    return !!this._wallet?.isConnected
  }

  ready(): Promise<boolean> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || typeof document === 'undefined') return resolve(false)

      if (document.readyState === 'complete') return resolve(!!window.glowSolana?.isGlow)

      function listener() {
        window.removeEventListener('load', listener)
        resolve(!!window.glowSolana?.isGlow)
      }

      window.addEventListener('load', listener)
    })
  }

  async connect(): Promise<void> {
    try {
      if (this.connected || this.connecting) return
      this._connecting = true

      if (!(await this.ready())) throw new WalletNotReadyError()

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const wallet = window!.glowSolana!

      if (!wallet.isConnected) {
        const handleDisconnect = wallet._handleDisconnect
        try {
          await new Promise<void>((resolve, reject) => {
            const connect = () => {
              wallet.off('connect', connect)
              resolve()
            }

            wallet._handleDisconnect = (...args: unknown[]) => {
              wallet.off('connect', connect)
              reject(new WalletWindowClosedError())
              return handleDisconnect.apply(wallet, args)
            }

            wallet.on('connect', connect)

            wallet.connect().catch((reason: any) => {
              wallet.off('connect', connect)
              reject(reason)
            })
          })
        } catch (error: any) {
          if (error instanceof WalletError) throw error
          throw new WalletConnectionError(error?.message, error)
        } finally {
          wallet._handleDisconnect = handleDisconnect
        }
      }

      if (!wallet.publicKey) throw new WalletAccountError()

      let publicKey: PublicKey
      try {
        publicKey = new PublicKey(wallet.publicKey.toBytes())
      } catch (error: any) {
        throw new WalletPublicKeyError(error?.message, error)
      }

      wallet.on('disconnect', this._disconnected)

      this._wallet = wallet
      this._publicKey = publicKey

      this.emit('connect')
    } catch (error: any) {
      this.emit('error', error)
      throw error
    } finally {
      this._connecting = false
    }
  }

  async disconnect(): Promise<void> {
    const wallet = this._wallet
    if (wallet) {
      wallet.off('disconnect', this._disconnected)

      this._wallet = null
      this._publicKey = null

      try {
        await wallet.disconnect()
      } catch (error: any) {
        this.emit('error', new WalletDisconnectionError(error?.message, error))
      }
    }

    this.emit('disconnect')
  }

  async sendTransaction(
    transaction: Transaction,
    connection: Connection,
    options?: SendTransactionOptions
  ): Promise<TransactionSignature> {
    try {
      const wallet = this._wallet
      // Glow doesn't handle partial signers, so if they are provided, don't use `signAndSendTransaction`
      if (wallet && 'signAndSendTransaction' in wallet && !options?.signers) {
        // TODO: update glow to fix this
        // HACK: Glow's `signAndSendTransaction` should always set these, but doesn't yet
        transaction.feePayer = transaction.feePayer || this.publicKey || undefined
        transaction.recentBlockhash =
          transaction.recentBlockhash || (await connection.getRecentBlockhash('finalized')).blockhash

        const { signature } = await wallet.signAndSendTransaction(transaction, options)
        return signature
      }
    } catch (error: any) {
      this.emit('error', error)
      throw error
    }

    return await super.sendTransaction(transaction, connection, options)
  }

  async signTransaction(transaction: Transaction): Promise<Transaction> {
    try {
      const wallet = this._wallet
      if (!wallet) throw new WalletNotConnectedError()

      try {
        return (await wallet.signTransaction(transaction)) || transaction
      } catch (error: any) {
        throw new WalletSignTransactionError(error?.message, error)
      }
    } catch (error: any) {
      this.emit('error', error)
      throw error
    }
  }

  async signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {
    try {
      const wallet = this._wallet
      if (!wallet) throw new WalletNotConnectedError()

      try {
        return (await wallet.signAllTransactions(transactions)) || transactions
      } catch (error: any) {
        throw new WalletSignTransactionError(error?.message, error)
      }
    } catch (error: any) {
      this.emit('error', error)
      throw error
    }
  }

  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    try {
      const wallet = this._wallet
      if (!wallet) throw new WalletNotConnectedError()

      try {
        const { signature } = await wallet.signMessage(message)
        return signature
      } catch (error: any) {
        throw new WalletSignTransactionError(error?.message, error)
      }
    } catch (error: any) {
      this.emit('error', error)
      throw error
    }
  }

  private _disconnected = () => {
    const wallet = this._wallet
    if (wallet) {
      wallet.off('disconnect', this._disconnected)

      this._wallet = null
      this._publicKey = null

      this.emit('error', new WalletDisconnectedError())
      this.emit('disconnect')
    }
  }
}
