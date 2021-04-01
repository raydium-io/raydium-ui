import { Plugin } from '@nuxt/types'
import { NuxtApiInstance } from '@/types/api'

const apiPlugin: Plugin = (ctx, inject) => {
  const api: NuxtApiInstance = {
    getPrices: (coins) =>
      ctx.$axios.get('https://api.raydium.io/coin/price', {
        params: {
          coins
        }
      }),
    getInfo: () => ctx.$axios.get('https://api.raydium.io/info')
  }

  ctx.$api = api
  inject('api', api)
}

export default apiPlugin
