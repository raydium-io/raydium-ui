import { getterTree, mutationTree, actionTree } from 'typed-vuex'

import { Context, SignatureResult } from '@solana/web3.js'

import LocalStorage from '@/utils/local-storage'
import { getUnixTs } from '@/utils'
import logger from '@/utils/logger'

const history = LocalStorage.get('RAY_TX_HISTORY')

export const state = () => ({
  history: history ? JSON.parse(history) : {}
})

export const getters = getterTree(state, {
  reverseHistory: (state) => {
    const reversedHistory: { [key: string]: any } = {}
    const keys = []

    for (const key in state.history) {
      keys.push(key)
    }

    for (let i = keys.length - 1; i >= 0; i--) {
      const value = state.history[keys[i]]
      reversedHistory[keys[i]] = value
    }
    return reversedHistory
  }
})

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
    sub({ commit }, { txid, description }: { txid: string; description: string }): Promise<boolean> {
      return new Promise((resolve, reject) => {
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
              resolve(true)
            } else {
              // fail
              commit('setTxStatus', [txid, 'f', slot])

              notify.error({
                key: txid,
                message: 'Transaction failed',
                description
              })
              reject(signatureResult.err)
            }
          },
          'single'
        )

        commit('setListenerId', [txid, listenerId + 1])
      })
    }
  }
)
