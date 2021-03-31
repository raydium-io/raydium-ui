import { ActionTree, MutationTree } from 'vuex'

import LocalStorage from '@/utils/local-storage'

export const state = () => ({
  show: false,

  // percent
  slippage: LocalStorage.get('RAYDIUM_SLIPPAGE') || 1
})

type RootState = ReturnType<typeof state>

export const mutations: MutationTree<RootState> = {
  setModal(state, show: boolean) {
    state.show = show
  },

  setSlippage(state, slippage: number) {
    state.slippage = slippage
    LocalStorage.set('RAY_SLIPPAGE', slippage)
  }
}

export const actions: ActionTree<RootState, RootState> = {
  open({ commit }) {
    commit('setModal', true)
  },

  close({ commit }) {
    commit('setModal', false)
  }
}
