import { getterTree, mutationTree, actionTree } from 'typed-vuex'

import { PublicKey } from '@solana/web3.js'
import { SERUM_PROGRAM_ID_V3 } from '@/utils/ids'
import { _MARKET_STATE_LAYOUT_V2 } from '@project-serum/serum/lib/market.js'
import { cloneDeep } from 'lodash-es'
import { startMarkets } from '@/utils/serum'
import { getFilteredProgramAccounts } from '@/utils/web3'
import logger from '@/utils/logger'

export const state = () => ({
  markets: {}
})

export const getters = getterTree(state, {})

export const mutations = mutationTree(state, {
  setMarkets(state, markets: any) {
    state.markets = cloneDeep(markets)
  }
})

export const actions = actionTree(
  { state, getters, mutations },
  {
    getMarkets({ commit }) {
      const conn = this.$web3

      const filters = [
        {
          dataSize: _MARKET_STATE_LAYOUT_V2.span
        }
      ]

      startMarkets()

      getFilteredProgramAccounts(conn, new PublicKey(SERUM_PROGRAM_ID_V3), filters)
        .then((marketInfos) => {
          const markets: any = {}

          marketInfos.forEach((marketInfo) => {
            const address = marketInfo.publicKey.toBase58()

            const { data } = marketInfo.accountInfo
            // console.log(address, _MARKET_STATE_LAYOUT_V2.decode(data))
            markets[address] = _MARKET_STATE_LAYOUT_V2.decode(data)
          })

          commit('setMarkets', markets)
          logger('Markets updated')
        })
        .catch()
    }
  }
)
