import { getterTree, mutationTree, actionTree } from 'typed-vuex'

import { Context, SignatureResult } from '@solana/web3.js'

import LocalStorage from '@/utils/local-storage'
import { getUnixTs } from '@/utils'
import logger from '@/utils/logger'

export const state = () => ({
  history: {}
})

export const getters = getterTree(state, {})

export const mutations = mutationTree(state, {
  pushTx(state: any, [txid, description]: [txid: string, description: string]) {
    const history = { ...state.history }

    history[txid] = {
      // status pending
      s: 'p',
      // description
      d: description,
      // time
      t: getUnixTs()
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
})

export const actions = actionTree(
  { state, getters, mutations },
  {
    sub({ commit }, { txid, description }: { txid: string; description: string }) {
      commit('pushTx', [txid, description])
      logger('Sub', txid)

      const conn = this.$web3
      const notify = this.$notify

      const listenerId = conn.onSignature(
        txid,
        function (signatureResult: SignatureResult, context: Context) {
          const { slot } = context

          if (!signatureResult.err) {
            // success
            commit('setTxStatus', [txid, 's', slot])

            notify.success({
              key: txid,
              message: 'Transaction has been confirmed',
              description
            })
          } else {
            // fail
            commit('setTxStatus', [txid, 'f', slot])

            notify.error({
              key: txid,
              message: 'Transaction failed',
              description
            })
          }
        },
        'single'
      )

      commit('setListenerId', [txid, listenerId + 1])
    }
  }
)
