import { getterTree, mutationTree, actionTree } from 'typed-vuex'

import LocalStorage from '@/utils/local-storage'

export const state = () => ({
  show: false,
  // percent
  slippage: parseFloat(LocalStorage.get('RAYDIUM_SLIPPAGE') || '1')
})

export const getters = getterTree(state, {})

export const mutations = mutationTree(state, {
  setModal(state, show: boolean) {
    state.show = show
  },

  setSlippage(state, slippage: number) {
    state.slippage = slippage
    LocalStorage.set('RAYDIUM_SLIPPAGE', slippage)
  }
})

export const actions = actionTree(
  { state, getters, mutations },
  {
    open({ commit }) {
      commit('setModal', true)
    },

    close({ commit }) {
      commit('setModal', false)
    }
  }
)
