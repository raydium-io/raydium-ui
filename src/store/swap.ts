import { PublicKey } from '@solana/web3.js'
import { SERUM_PROGRAM_ID_V3 } from '@/utils/ids'
import { _MARKET_STATE_LAYOUT_V2 } from '@project-serum/serum/lib/market.js'
import { cloneDeep } from 'lodash-es'
import { getFilteredProgramAccounts } from '@/utils/web3'
import logger from '@/utils/logger'

export const state = () => ({
  markets: {}
})

export const mutations = {
  setMarkets(state: any, markets: any) {
    state.markets = cloneDeep(markets)
  }
}

export const actions = {
  getMarkets({ commit }: { commit: any }) {
    const conn = (this as any)._vm.$conn

    const filters = [
      {
        dataSize: _MARKET_STATE_LAYOUT_V2.span
      }
    ]

    getFilteredProgramAccounts(conn, new PublicKey(SERUM_PROGRAM_ID_V3), filters)
      .then((marketInfos) => {
        const markets: any = {}

        marketInfos.forEach((marketInfo) => {
          const address = marketInfo.publicKey.toBase58()
          const { data } = marketInfo.accountInfo

          markets[address] = _MARKET_STATE_LAYOUT_V2.decode(data)
        })

        commit('setMarkets', markets)
        logger('Markets updated')
      })
      .catch()
  }
}
