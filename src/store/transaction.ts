import { getterTree, mutationTree, actionTree } from 'typed-vuex'

import { Context, SignatureResult } from '@solana/web3.js'

import LocalStorage from '@/utils/local-storage'
import { getUnixTs } from '@/utils'
import logger from '@/utils/logger'
type TxHistoryInfo = { status: 'Succeed' | 'Fail' | 'Pending'; description: string; time: number }
export const state = () => {
  try {
    return { history: JSON.parse(LocalStorage.get('RAY_TX_HISTORY') ?? '{}') }
  } catch (err) {
    return { history: {} }
  }
}

export const getters = getterTree(state, {})

export const mutations = mutationTree(state, {
  pushTx(state: any, [txid, description]: [txid: string, description: string]) {
    const history = { ...state.history }

    if (Object.keys(history).length >= 20) {
      const earliestTime = Math.min(...Object.values(history).map((o: any) => o.time))
      const [earliestTxid] = Object.entries<TxHistoryInfo>(history).find(([, { time }]) => time === earliestTime) ?? []
      delete history[earliestTxid ?? '']
    }
    history[txid] = {
      status: 'Pending',
      description,
      time: getUnixTs()
    }

    state.history = { ...history }
    LocalStorage.set('RAY_TX_HISTORY', JSON.stringify(history))
  },

  setListenerId(state: any, [txid, listenerId]: [txid: string, listenerId: number]) {
    const history = { ...state.history }

    // listenerId
    history[txid] = { ...history[txid], ...{ listenerId } }

    state.history = { ...history }
    LocalStorage.set('RAY_TX_HISTORY', JSON.stringify(history))
  },

  setTxStatus(state: any, [txid, status, block]: [txid: string, status: string, block: number]) {
    const history = { ...state.history }

    history[txid] = { ...history[txid], ...{ status, block } }

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
            commit('setTxStatus', [txid, 'Success', slot])

            notify.success({
              key: txid,
              message: 'Transaction has been confirmed',
              description
            })
          } else {
            // fail
            commit('setTxStatus', [txid, 'Fail', slot])

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
