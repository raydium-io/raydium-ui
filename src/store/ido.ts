import { getterTree, mutationTree, actionTree } from 'typed-vuex'
import { cloneDeep } from 'lodash-es'

import { TOKENS } from '@/utils/tokens'
import { TokenAmount } from '@/utils/safe-math'
import { commitment, getMultipleAccounts } from '@/utils/web3'
import { IDO_POOLS, IdoPool, getIdoPoolById, IDO_POOL_INFO_LAYOUT } from '@/utils/ido'
import { PublicKey } from '@solana/web3.js'
import logger from '@/utils/logger'

const AUTO_REFRESH_TIME = 60

export const state = () => ({
  initialized: false,
  loading: false,

  autoRefreshTime: AUTO_REFRESH_TIME,
  countdown: 0,
  lastSubBlock: 0,

  pools: [] as Array<IdoPool>
})

export const getters = getterTree(state, {})

export const mutations = mutationTree(state, {
  setInitialized(state) {
    state.initialized = true
  },

  setLoading(state, loading: boolean) {
    if (loading) {
      state.countdown = AUTO_REFRESH_TIME
    }

    state.loading = loading

    if (!loading) {
      state.countdown = 0
    }
  },

  setPools(state, pools: Array<IdoPool>) {
    state.pools = cloneDeep(pools)
  },

  setCountdown(state, countdown: number) {
    state.countdown = countdown
  },

  setLastSubBlock(state, lastSubBlock: number) {
    state.lastSubBlock = lastSubBlock
  }
})

export const actions = actionTree(
  { state, getters, mutations },
  {
    async requestInfos({ commit }) {
      commit('setLoading', true)

      const conn = this.$web3

      const idoPools: Array<IdoPool> = []
      const publicKeys: Array<PublicKey> = []

      IDO_POOLS.forEach((pool) => {
        const { idoId } = pool

        publicKeys.push(new PublicKey(idoId))
      })

      const multipleInfo = await getMultipleAccounts(conn, publicKeys, commitment)
      multipleInfo.forEach((info) => {
        if (info) {
          const address = info.publicKey.toBase58()
          const data = Buffer.from(info.account.data)

          const pool = getIdoPoolById(address)
          if (pool) {
            const decoded = IDO_POOL_INFO_LAYOUT.decode(data)

            pool.info = {
              startTime: decoded.startTime.toNumber(),
              endTime: decoded.endTime.toNumber(),

              minDepositLimit: new TokenAmount(decoded.minDepositLimit.toNumber(), pool.quote.decimals),
              maxDepositLimit: new TokenAmount(decoded.maxDepositLimit.toNumber(), pool.quote.decimals),
              stakePoolId: decoded.stakePoolId,
              minStakeLimit: new TokenAmount(decoded.minStakeLimit.toNumber(), TOKENS.RAY.decimals)
            }

            idoPools.push(pool)
          }
        }
      })

      commit('setPools', idoPools)
      logger('Ido pool infomations updated')
      commit('setInitialized')
      commit('setLoading', false)
    }
  }
)
