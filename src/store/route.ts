import { getterTree, mutationTree, actionTree } from 'typed-vuex'

export const state = () => ({
  name: ''
})

export const getters = getterTree(state, {})

export const mutations = mutationTree(state, {
  changeName(state, name: string) {
    state.name = name
  }
})

export const actions = actionTree({ state, getters, mutations }, {})
