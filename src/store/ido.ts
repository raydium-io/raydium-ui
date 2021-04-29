import { getterTree, mutationTree, actionTree } from 'typed-vuex'
import { cloneDeep } from 'lodash-es'

import { TOKENS } from '@/utils/tokens'
import { TokenAmount } from '@/utils/safe-math'
import { commitment, getMultipleAccounts } from '@/utils/web3'
import {
  IDO_POOLS,
  IdoPool,
  IdoUserInfo,
  IDO_POOL_INFO_LAYOUT,
  IDO_USER_INFO_LAYOUT,
  findAssociatedIdoInfoAddress,
  findAssociatedIdoCheckAddress
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
    async requestInfos({ commit, dispatch }) {
      commit('setLoading', true)
      dispatch('getIdoAccounts')

      const conn = this.$web3

      const idoPools: Array<IdoPool> = cloneDeep(IDO_POOLS)
      const publicKeys: Array<PublicKey> = []

      const keys = ['idoId']
      const keyLength = keys.length

      idoPools.forEach((pool) => {
        const { idoId } = pool

        publicKeys.push(new PublicKey(idoId))
      })

      const multipleInfo = await getMultipleAccounts(conn, publicKeys, commitment)
      multipleInfo.forEach((info, index) => {
        if (info) {
          const poolIndex = parseInt((index / keyLength).toString())
          // const keyIndex = index % keyLength
          // const key = keys[keyIndex]

          const data = Buffer.from(info.account.data)

          const pool = idoPools[poolIndex]

          const decoded = IDO_POOL_INFO_LAYOUT.decode(data)

          pool.info = {
            startTime: decoded.startTime.toNumber(),
            endTime: decoded.endTime.toNumber(),
            startWithdrawTime: decoded.startWithdrawTime.toNumber(),

            minDepositLimit: new TokenAmount(decoded.minDepositLimit.toNumber(), pool.quote.decimals),
            maxDepositLimit: new TokenAmount(decoded.maxDepositLimit.toNumber(), pool.quote.decimals),
            stakePoolId: decoded.stakePoolId,
            minStakeLimit: new TokenAmount(decoded.minStakeLimit.toNumber(), TOKENS.RAY.decimals),
            quoteTokenDeposited: new TokenAmount(decoded.quoteTokenDeposited.toNumber(), pool.quote.decimals)
          }
        }
      })

      commit('setPools', idoPools)
      logger('Ido pool infomations updated')
      commit('setInitialized')
      commit('setLoading', false)
    },

    async getIdoAccounts({ state, commit }) {
      const conn = this.$web3
      const wallet = (this as any)._vm.$wallet

      if (wallet && wallet.connected) {
        const idoPools: Array<IdoPool> = cloneDeep(state.pools)
        const publicKeys: Array<PublicKey> = []

        const keys = ['idoAccount', 'idoCheck']
        const keyLength = keys.length

        for (const pool of idoPools) {
          const { idoId, programId, snapshotProgramId } = pool

          const userIdoAccount = await findAssociatedIdoInfoAddress(
            new PublicKey(idoId),
            wallet.publicKey,
            new PublicKey(programId)
          )
          const userIdoCheck = await findAssociatedIdoCheckAddress(
            new PublicKey(idoId),
            wallet.publicKey,
            new PublicKey(snapshotProgramId)
          )

          publicKeys.push(userIdoAccount, userIdoCheck)
        }

        const multipleInfo = await getMultipleAccounts(conn, publicKeys, commitment)
        multipleInfo.forEach((info, index) => {
          const poolIndex = parseInt((index / keyLength).toString())
          const keyIndex = index % keyLength
          const key = keys[keyIndex]

          if (info) {
            // const address = info.publicKey.toBase58()
            const data = Buffer.from(info.account.data)

            const pool = idoPools[poolIndex]

            switch (key) {
              case 'idoAccount': {
                const decoded = IDO_USER_INFO_LAYOUT.decode(data)
                if (!pool.userInfo) {
                  pool.userInfo = {} as IdoUserInfo
                }
                pool.userInfo.deposited = new TokenAmount(decoded.quoteTokenDeposited.toNumber(), pool.quote.decimals)
                break
              }
              case 'idoCheck': {
                if (!pool.userInfo) {
                  pool.userInfo = {} as IdoUserInfo
                }
                pool.userInfo.snapshoted = true
                break
              }
            }
          }
        })

        commit('setPools', idoPools)
        logger('Ido user infomations updated')
      }
    }
  }
)
