import { Connection, Context, SignatureResult } from '@solana/web3.js'

import LocalStorage from '@/utils/local-storage'

// import { commitment } from '@/utils/web3'

export const state = () => ({
  history: []
})

export const mutations = {
  setHistory(state: any, history: number) {
    state.history = history
    LocalStorage.set('RAY_TX_HISTORY', history)
  }

  // setListenerId(state: any, txid: string, listenerId: number) {}
}

export const actions = {
  onTransactionChange({ _commit }: { _commit: any }, signatureResult: SignatureResult, context: Context) {
    console.log(signatureResult, context)
  },

  sub({ _commit, dispatch }: { _commit: any; dispatch: any }, txid: string) {
    const conn: Connection = (this as any)._vm.$conn

    const listenerId = conn.onSignature(txid, dispatch('onTransactionChange'), 'single')
    console.log(listenerId)
  },

  unsub() {
    // const conn: Connection = (this as any)._vm.$conn
  }
}
