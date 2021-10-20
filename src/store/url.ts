import { actionTree, getterTree, mutationTree } from 'typed-vuex';

export const state = () => ({
  trading: 'https://dex.raydium.io',
  explorer: 'https://solscan.io',
  trade: 'https://dex.raydium.io/#/market',
  dropZone: 'https://dropzone.raydium.io',
  'browse-NFTs': 'https://nft.raydium.io/marketplace',
  'explore-Collections': 'https://nft.raydium.io/collections'
})

export const getters = getterTree(state, {})

export const mutations = mutationTree(state, {})

export const actions = actionTree({ state, getters, mutations }, {})
