import { Plugin } from '@nuxt/types'
import { NuxtApiInstance } from '@/types/api'

const VERSION = '1.1.0'

const apiPlugin: Plugin = (ctx, inject) => {
  const api: NuxtApiInstance = {
    getPrices: () => ctx.$axios.get('https://api.raydium.io/coin/price'),
    getInfo: () => ctx.$axios.get('https://api.raydium.io/info'),
    getPairs: () => ctx.$axios.get('https://api.raydium.io/pairs'),
    getConfig: () => ctx.$axios.get('https://api.raydium.io/config', { params: { v: VERSION } }),
    getEpochInfo: (rpc: string) => ctx.$axios.post(rpc, { jsonrpc: '2.0', id: 1, method: 'getEpochInfo' }),
    getCompaign: ({ campaignId = 2, address, referral }) =>
      ctx.$axios.get(`http://localhost:8000/campaign/${campaignId}`, { params: { address, referral } }),
    postCompaign: ({ campaignId = 2, address, task, result = '', sign = '' }) =>
      ctx.$axios.post(`httpp://localhost:8000/campaign/${campaignId}`, { address, task, result, sign }),
    getCompaignWinners: () => ctx.$axios.get(`httpp://localhost:8000/campaign`),
    getCompaignWinnerList: ({ type }) => ctx.$axios.get(`httpp://localhost:8000/campaign`, { params: { type } }) // TEMP mock backend response // deprecated
  }

  ctx.$api = api
  inject('api', api)
}

export default apiPlugin
