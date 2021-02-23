export const state = () => ({
  connected: false,
  address: '',
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
