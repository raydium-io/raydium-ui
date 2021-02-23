export const state = () => ({
  name: '',
})

export const mutations = {
  changeName(state: any, name: string) {
    state.name = name
  },
}
