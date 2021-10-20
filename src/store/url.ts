import { actionTree, getterTree, mutationTree } from 'typed-vuex';

export const state = () => ({
  trading: 'https://dex.raydium.io',
  explorer: 'https://solscan.io',
  trade: 'https://dex.raydium.io/#/market',
  dropZone: 'https://dropzone.raydium.io',
  browseNFTs: 'https://nft.raydium.io/marketplace',
  exploreCollections: 'https://nft.raydium.io/collections'
})

export const getters = getterTree(state, {})

export const mutations = mutationTree(state, {})

export const actions = actionTree({ state, getters, mutations }, {})
