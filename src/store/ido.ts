import { getterTree, mutationTree, actionTree } from 'typed-vuex'
import { cloneDeep } from 'lodash-es'

import { TOKENS } from '@/utils/tokens'
import { TokenAmount } from '@/utils/safe-math'
import { commitment, getMultipleAccounts } from '@/utils/web3'
import {
  IDO_POOLS,
  IdoPool,
  getIdoPoolById,
  IDO_POOL_INFO_LAYOUT,
  IDO_USER_INFO_LAYOUT,
  findAssociatedIdoInfoAddress
} from '@/utils/ido'
import { PublicKey } from '@solana/web3.js'
import logger from '@/utils/logger'

const AUTO_REFRESH_TIME = 60

export const state = () => ({
  initialized: false,
  loading: false,

  autoRefreshTime: AUTO_REFRESH_TIME,
  countdown: 0,
  lastSubBlock: 0,

  pools: [] as Array<IdoPool>,
  userInfos: {} as any
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

  setUserInfos(state, userInfos: any) {
    state.userInfos = cloneDeep(userInfos)
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
    async requestInfos({ commit, dispatch }) {
      commit('setLoading', true)
      dispatch('getIdoAccounts')

      const conn = this.$web3

      const idoPools: Array<IdoPool> = []
      const publicKeys: Array<PublicKey> = []

      IDO_POOLS.forEach((pool) => {
        const { idoId, quoteVault } = pool

        publicKeys.push(new PublicKey(idoId), new PublicKey(quoteVault))
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
              minStakeLimit: new TokenAmount(decoded.minStakeLimit.toNumber(), TOKENS.RAY.decimals),
              quoteTokenDeposited: new TokenAmount(decoded.quoteTokenDeposited.toNumber(), pool.quote.decimals)
            }

            idoPools.push(pool)
          }
        }
      })

      commit('setPools', idoPools)
      logger('Ido pool infomations updated')
      commit('setInitialized')
      commit('setLoading', false)
    },

    async getIdoAccounts({ commit }) {
      const conn = this.$web3
      const wallet = (this as any)._vm.$wallet

      if (wallet && wallet.connected) {
        const userInfos = {} as any
        const publicKeys: Array<PublicKey> = []

        for (const pool of IDO_POOLS) {
          const { idoId, programId } = pool

          const userIdoAccount = await findAssociatedIdoInfoAddress(
            new PublicKey(idoId),
            wallet.publicKey,
            new PublicKey(programId)
          )
          publicKeys.push(userIdoAccount)
        }

        const multipleInfo = await getMultipleAccounts(conn, publicKeys, commitment)
        multipleInfo.forEach((info) => {
          if (info) {
            // const address = info.publicKey.toBase58()
            const data = Buffer.from(info.account.data)

            const decoded = IDO_USER_INFO_LAYOUT.decode(data)
            const idoId = decoded.idoPoolId.toBase58()
            const pool = getIdoPoolById(idoId)
            if (pool) {
              userInfos[idoId] = new TokenAmount(decoded.quoteTokenDeposited.toNumber(), pool.quote.decimals)
            }
          }
        })
        commit('setUserInfos', userInfos)
        logger('Ido user infomations updated')
      }
    }
  }
)
