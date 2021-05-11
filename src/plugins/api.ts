import { Plugin } from '@nuxt/types'
import { NuxtApiInstance } from '@/types/api'

const apiPlugin: Plugin = (ctx, inject) => {
  const api: NuxtApiInstance = {
    getPrices: () => ctx.$axios.get('https://api.raydium.io/coin/price'),
    getInfo: () => ctx.$axios.get('https://api.raydium.io/info'),
    getPairs: () => ctx.$axios.get('https://api.raydium.io/pairs')
  }

  ctx.$api = api
  inject('api', api)
}

export default apiPlugin
