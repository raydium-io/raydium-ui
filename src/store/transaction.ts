import { Connection, Context, SignatureResult } from '@solana/web3.js'

import LocalStorage from '@/utils/local-storage'

// import { commitment } from '@/utils/web3'

export const state = () => ({
  history: {}
})

export const mutations = {
  pushTx(state: any, [txid, description]: [txid: string, description: string]) {
    const history = { ...state.history }

    history[txid] = {
      // status pending
      s: 'p',
      // description
      d: description
    }

    state.history = { ...history }
    LocalStorage.set('RAY_TX_HISTORY', JSON.stringify(history))
  },

  setListenerId(state: any, [txid, listenerId]: [txid: string, listenerId: number]) {
    const history = { ...state.history }

    // listenerId
    history[txid] = { ...history[txid], ...{ i: listenerId } }

    state.history = { ...history }
    LocalStorage.set('RAY_TX_HISTORY', JSON.stringify(history))
  },

  setTxStatus(state: any, [txid, status, block]: [txid: string, status: string, block: number]) {
    const history = { ...state.history }

    history[txid] = { ...history[txid], ...{ s: status, b: block } }

    state.history = { ...history }
    LocalStorage.set('RAY_TX_HISTORY', JSON.stringify(history))
  }
}

export const actions = {
  sub(
    { commit, dispatch }: { commit: any; dispatch: any },
    { txid, description }: { txid: string; description: string }
  ) {
    commit('pushTx', [txid, description])

    const conn: Connection = (this as any)._vm.$conn
    const notify = (this as any)._vm.$notify

    const listenerId = conn.onSignature(
      txid,
      function (signatureResult: SignatureResult, context: Context) {
        const { slot } = context

        if (!signatureResult.err) {
          // success
          commit('setTxStatus', [txid, 's', slot])

          notify.success({
            key: txid,
            message: 'Confirmed',
            description,
            duration: 3
          })
        } else {
          // fail
          commit('setTxStatus', [txid, 'f', slot])
        }

        dispatch('unsub', txid)
      },
      'single'
    )

    commit('setListenerId', [txid, listenerId + 1])
  },

  unsub({ commit, state }: { commit: any; state: any }, txid: string) {
    const conn: Connection = (this as any)._vm.$conn

    try {
      conn.removeSignatureListener(state.history[txid].i)
    } catch (error) {}

    commit('setListenerId', [txid, null])
  }
}
