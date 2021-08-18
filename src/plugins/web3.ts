import { Connection } from '@solana/web3.js'
import { Plugin } from '@nuxt/types'

import { web3Config, commitment } from '@/utils/web3'
import logger from '@/utils/logger'
import { NuxtApiInstance, Rpc } from '@/types/api'

const createWeb3Instance = (endpoint: string) => {
  const web3 = new Connection(endpoint, commitment)
  return web3
}

async function getFastEndpoint(api: NuxtApiInstance, endpoints: Rpc[]) {
  return await Promise.any(endpoints.map((endpoint) => api.getEpochInfo(endpoint.url).then(() => endpoint.url)))
}

export function getWeightEndpoint(endpoints: Rpc[]) {
  let pointer = 0
  const random = Math.random() * 100
  let api = endpoints[0].url

  for (const endpoint of endpoints) {
    if (random > pointer + endpoint.weight) {
      pointer += pointer + endpoint.weight
    } else if (random >= pointer && random < pointer + endpoint.weight) {
      api = endpoint.url
      break
    } else {
      api = endpoint.url
      break
    }
  }

  return api
}

const web3Plugin: Plugin = async (ctx, inject) => {
  const { $api } = ctx

  let config
  let endpoint
  let configFrom

  try {
    config = await $api.getConfig()
    configFrom = 'remote'
    if (!window.location.hostname.includes('raydium')) {
      config = web3Config
    }
  } catch (error) {
    config = web3Config
    configFrom = 'local'
  }

  const { rpcs, strategy } = config

  if (strategy === 'weight') {
    endpoint = getWeightEndpoint(rpcs)
  } else {
    endpoint = await getFastEndpoint($api, rpcs)
  }

  logger(`config from: ${configFrom}, strategy: ${strategy}, using ${endpoint}`)

  const web3 = createWeb3Instance(endpoint)

  ctx.$web3 = web3
  inject('web3', web3)
}

export default web3Plugin
