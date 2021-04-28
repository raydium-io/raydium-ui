import { getterTree, mutationTree, actionTree } from 'typed-vuex'

export const state = () => ({
  trading: 'https://dex.raydium.io',
  explorer: 'https://explorer.solana.com'
})

export const getters = getterTree(state, {})

export const mutations = mutationTree(state, {})

export const actions = actionTree({ state, getters, mutations }, {})
