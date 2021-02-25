export const state = () => ({
  connected: false,
  address: '',
  env: 'mainnet-beta',
  // endpoint: 'https://api.mainnet-beta.solana.com',
  endpoint: 'https://solana-api.projectserum.com',
})

export const mutations = {
  connected(state: any, address: any) {
    state.connected = true
    state.address = address
  },

  disconnected(state: any) {
    state.connected = false
    state.address = ''
  },
}
