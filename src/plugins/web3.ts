import { Connection } from '@solana/web3.js'
import { Plugin } from '@nuxt/types'

import { getRandomEndpoint, commitment } from '@/utils/web3'

const createWeb3Instance = () => {
  const endpoint = getRandomEndpoint()
  const web3 = new Connection(endpoint, commitment)
  return web3
}

const web3Plugin: Plugin = (ctx, inject) => {
  const web3 = createWeb3Instance()

  ctx.$web3 = web3
  inject('web3', web3)
}

export default web3Plugin
