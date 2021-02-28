// @ts-ignore
import enquireJs from 'enquire.js'

function enquireScreen(call: Function) {
  const handler = {
    match() {
      call && call(true)
    },
    unmatch() {
      call && call(false)
    },
  }

  enquireJs.register('only screen and (max-width: 922.99px)', handler)
}

export const state = () => ({
  isMobile: false,
})

export const mutations = {
  setIsMobile(state: any, isMobile: boolean) {
    state.isMobile = isMobile
  },
}

export const actions = {
  queryIsMobile({ commit }: { commit: any }) {
    enquireScreen((isMobile: boolean) => commit('setIsMobile', isMobile))
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
