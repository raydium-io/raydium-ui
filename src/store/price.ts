import { ActionTree, MutationTree } from 'vuex'

import { TOKENS } from '@/utils/tokens'
import { cloneDeep } from 'lodash-es'
import logger from '@/utils/logger'

const AUTO_REFRESH_TIME = 60

export const state = () => ({
  initialized: false,
  loading: false,
  prices: {},

  autoRefreshTime: AUTO_REFRESH_TIME,
  countdown: 0
})

type RootState = ReturnType<typeof state>

export const mutations: MutationTree<RootState> = {
  setInitialized(state) {
    state.initialized = true
  },

  setLoading(state, loading: boolean) {
    if (loading) {
      state.countdown = AUTO_REFRESH_TIME
    }

    state.loading = loading

    if (!loading) {
      state.countdown = 0
    }
  },

  setPrices(state, prices: object) {
    state.prices = cloneDeep(prices)
  },

  setCountdown(state, countdown: number) {
    state.countdown = countdown
  }
}

export const actions: ActionTree<RootState, RootState> = {
  requestPrices({ commit }) {
    commit('setLoading', true)

    const tokens = ['SOL']

    for (const symbol of Object.keys({ ...TOKENS })) {
      tokens.push(symbol)
    }

    ;(this as any).$axios
      .get('https://api.raydium.io/coin/price', {
        params: {
          coins: tokens.join(',')
        }
      })
      .then((data: any) => {
        commit('setPrices', data)
        logger('Price updated')
      })
      .catch()
      .finally(() => {
        commit('setInitialized')
        commit('setLoading', false)
      })
  }
}
