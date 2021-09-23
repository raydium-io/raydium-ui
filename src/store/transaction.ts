import { Context, SignatureResult } from '@solana/web3.js';
import { actionTree, getterTree, mutationTree } from 'typed-vuex';

import { getUnixTs } from '@/utils';
import LocalStorage from '@/utils/local-storage';
import logger from '@/utils/logger';

type TxHistoryInfo = { status: 'Succeed' | 'Fail' | 'Pending' | 'Droped'; description: string; time: number }
export const state = () => {
  try {
    return { history: JSON.parse(LocalStorage.get('RAY_TX_HISTORY') ?? '{}') }
  } catch (err) {
    return { history: {} }
  }
}

export const getters = getterTree(state, {})

export const mutations = mutationTree(state, {
  pushTx(
    state: any,
    { txid, description, walletAddress }: { txid: string; description: string; walletAddress: string }
  ) {
    const wholeHistory = { ...state.history }
    const targetHistory = wholeHistory[walletAddress] ?? {}

    if (Object.keys(targetHistory).length >= 20) {
      const earliestTime = Math.min(...Object.values(targetHistory).map((o: any) => o.time))
      const [earliestTxid] =
        Object.entries<TxHistoryInfo>(targetHistory).find(([, { time }]) => time === earliestTime) ?? []
      delete targetHistory[earliestTxid ?? '']
    }

    targetHistory[txid] = {
      status: 'pending',
      description,
      time: getUnixTs()
    }

    state.history = { ...wholeHistory, [walletAddress]: targetHistory }
    LocalStorage.set('RAY_TX_HISTORY', JSON.stringify(state.history))
  },

  setListenerId(
    state: any,
    { txid, listenerId, walletAddress }: { txid: string; listenerId: number; walletAddress: string }
  ) {
    const wholeHistory = { ...state.history }
    const targetHistory = wholeHistory[walletAddress] ?? {}

    // listenerId
    targetHistory[txid] = { ...targetHistory[txid], ...{ listenerId } }

    state.history = { ...wholeHistory, [walletAddress]: targetHistory }
    LocalStorage.set('RAY_TX_HISTORY', JSON.stringify(state.history))
  },

  setTxStatus(
    state: any,
    { txid, status, block, walletAddress }: { txid: string; status: string; block: number; walletAddress: string }
  ) {
    const wholeHistory = { ...state.history }
    const targetHistory = wholeHistory[walletAddress] ?? {}

    targetHistory[txid] = { ...targetHistory[txid], ...{ status, block } }

    state.history = { ...wholeHistory, [walletAddress]: targetHistory }
    LocalStorage.set('RAY_TX_HISTORY', JSON.stringify(state.history))
  }
})

export const actions = actionTree(
  { state, getters, mutations },
  {
    sub({ commit }, { txid, description }: { txid: string; description: string }) {
      const walletAddress = this.$accessor.wallet?.address
      commit('pushTx', { txid, description, walletAddress })
      logger('Sub', txid)

      const conn = this.$web3
      const notify = this.$notify

      const listenerId = conn.onSignature(
        txid,
        function (signatureResult: SignatureResult, context: Context) {
          const { slot } = context

          if (!signatureResult.err) {
            // success
            commit('setTxStatus', { txid, status: 'success', block: slot, walletAddress })

            notify.success({
              key: txid,
              message: 'Transaction has been confirmed',
              description
            })
          } else {
            // fail
            commit('setTxStatus', { txid, status: 'fail', block: slot, walletAddress })

            notify.error({
              key: txid,
              message: 'Transaction failed',
              description
            })
          }
        },
        'single'
      )

      commit('setListenerId', { txid, listenerId: listenerId + 1, walletAddress })
    }
  }
)
