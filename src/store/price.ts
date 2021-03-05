import { TOKENS } from '@/utils/tokens'
import { cloneDeep } from 'lodash-es'
import logger from '@/utils/logger'

const AUTO_REFRESH_TIME = 60

export const state = () => ({
  initialized: false,
  loading: false,
  prices: {},
  // 自动刷新倒计时
  autoRefreshTime: AUTO_REFRESH_TIME,
  countdown: 0
})

export const mutations = {
  setInitialized(state: any) {
    state.initialized = true
  },

  setLoading(state: any, loading: boolean) {
    if (loading) {
      state.countdown = AUTO_REFRESH_TIME
    }

    state.loading = loading

    if (!loading) {
      state.countdown = 0
    }
  },

  setPrices(state: any, prices: object) {
    state.prices = cloneDeep(prices)
  },

  setCountdown(state: any, countdown: number) {
    state.countdown = countdown
  }
}

export const actions = {
  requestPrices({ commit }: { commit: any }) {
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
      .then((res: any) => {
        const { status, data } = res
        if (status === 200) {
          commit('setPrices', data)
          logger('Price updated')
        }
      })
      .catch()
      .finally(() => {
        commit('setInitialized')
        commit('setLoading', false)
      })
  }
}
