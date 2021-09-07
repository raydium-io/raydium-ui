import { cloneDeep } from 'lodash-es'
import { actionTree, getterTree, mutationTree } from 'typed-vuex'

import { SERUM_PROGRAM_ID_V3 } from '@/utils/ids'
import logger from '@/utils/logger'
import { startMarkets } from '@/utils/serum'
import { getFilteredProgramAccountsAmmOrMarketCache } from '@/utils/web3'
import { _MARKET_STATE_LAYOUT_V2 } from '@project-serum/serum/lib/market'
import { PublicKey } from '@solana/web3.js'

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

      getFilteredProgramAccountsAmmOrMarketCache('market', conn, new PublicKey(SERUM_PROGRAM_ID_V3), filters)
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
