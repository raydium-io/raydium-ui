import { MutationTree } from 'vuex'

export const state = () => ({
  name: ''
})

type RootState = ReturnType<typeof state>

export const mutations: MutationTree<RootState> = {
  changeName(state, name: string) {
    state.name = name
  }
}
