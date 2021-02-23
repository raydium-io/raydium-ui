export default ({ store, route }: any) => {
  if (route.name) {
    store.commit('route/changeName', route.name)
  }
}
