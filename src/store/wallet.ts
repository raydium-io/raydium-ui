export const state = () => ({
  connected: false,
  wallet: null,
})

export const mutations = {
  connect(state: any, wallet: any) {
    state.connected = true
    state.wallet = wallet
  },

  disconnect(state: any) {
    state.connected = false
    state.wallet = null
  },
}
