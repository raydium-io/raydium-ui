export const state = () => ({
  show: false,

  // percent
  slippage: 1,
})

export const mutations = {
  setModal(state: any, show: boolean) {
    state.show = show
  },

  setSlippage(state: any, slippage: number) {
    state.slippage = slippage
  },
}

export const actions = {
  open({ commit }: { commit: any }) {
    commit('setModal', true)
  },

  close({ commit }: { commit: any }) {
    commit('setModal', false)
  },

  copy({ _commit }: { _commit: any }, text: string) {
    const copy = (this as any)._vm.$copyText
    const notify = (this as any)._vm.$notify

    copy(text)
      .then(() => {
        notify.success({
          message: 'Copy success',
          description: '',
        })
      })
      .catch(() => {
        notify.error({
          message: 'Copy failed',
          description: '',
        })
      })
  },
}
