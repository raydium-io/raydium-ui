import { getterTree, mutationTree, actionTree } from 'typed-vuex'

import { PublicKey } from '@solana/web3.js'
import { SERUM_PROGRAM_ID_V3 } from '@/utils/ids'
import { _MARKET_STATE_LAYOUT_V2 } from '@project-serum/serum/lib/market.js'
import { cloneDeep } from 'lodash-es'
import { MARKETS } from '@/utils/serum'
import { getFilteredProgramAccounts } from '@/utils/web3'
import logger from '@/utils/logger'
// import {  TokenInfo } from '@/utils/tokens'
import { getTokenBySymbol, TokenInfo } from '@/utils/tokens'
import LocalStorage from '@/utils/local-storage'

interface State {
  fromCoin: TokenInfo | null
  toCoin: TokenInfo | null
  markets: any
}

export const state = (): State => ({
  fromCoin: getTokenBySymbol(LocalStorage.get('RAYDIUM_SWAP_FROM_COIN') || 'RAY'),
  toCoin: getTokenBySymbol(LocalStorage.get('RAYDIUM_SWAP_TO_COIN') || ''),
  // fromCoin: null,
  // toCoin: null,
  markets: {}
})

export const getters = getterTree(state, {})

export const mutations = mutationTree(state, {
  setMarkets(state, markets: any) {
    state.markets = cloneDeep(markets)
  },
  setFromCoin(state, tokenInfo: TokenInfo | null) {
    LocalStorage.set('RAYDIUM_SWAP_FROM_COIN', tokenInfo?.symbol)
    state.fromCoin = tokenInfo
  },
  setToCoin(state, tokenInfo: TokenInfo | null) {
    LocalStorage.set('RAYDIUM_SWAP_TO_COIN', tokenInfo?.symbol)
    state.toCoin = tokenInfo
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

      getFilteredProgramAccounts(conn, new PublicKey(SERUM_PROGRAM_ID_V3), filters)
        .then((marketInfos) => {
          const markets: any = {}

          marketInfos.forEach((marketInfo) => {
            const address = marketInfo.publicKey.toBase58()

            if (MARKETS.includes(address)) {
              const { data } = marketInfo.accountInfo

              markets[address] = _MARKET_STATE_LAYOUT_V2.decode(data)
            }
          })

          commit('setMarkets', markets)
          logger('Markets updated')
        })
        .catch()
    }
  }
)
