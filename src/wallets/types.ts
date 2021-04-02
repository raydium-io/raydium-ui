import { PublicKey, Transaction } from '@solana/web3.js'

export interface WalletAdapter {
  publicKey: PublicKey | null | undefined
  autoApprove: boolean
  connected: boolean
  signTransaction: (transaction: Transaction) => Promise<Transaction>
  signAllTransactions: (transaction: Transaction[]) => Promise<Transaction[]>
  connect: () => any
  disconnect: () => any
  // eslint-disable-next-line
  on<T>(event: string, fn: () => void): this
}
