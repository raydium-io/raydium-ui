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
    getCompaign: ({ campaignId = 1, address, referral }) =>
      ctx.$axios.get(`https://api.raydium.io/campaign/${campaignId}`, { params: { address, referral } }),
    postCompaign: ({ campaignId = 1, address, task, result = '', sign = '' }) =>
      ctx.$axios.post(`https://api.raydium.io/campaign/${campaignId}`, { address, task, result, sign }),
    getCompaignWinners: () => ctx.$axios.get(`https://api.raydium.io/campaign`),
    getCompaignWinnerList: ({ type }) => ctx.$axios.get(`https://api.raydium.io/campaign`, { params: { type } }), // TEMP mock backend response // deprecated
    getRouter: (mintIn, mintOut) => ctx.$axios.post(`http://54.65.53.89/routing`, { base: mintIn, quote: mintOut })
  }

  ctx.$api = api
  inject('api', api)
}

export default apiPlugin
