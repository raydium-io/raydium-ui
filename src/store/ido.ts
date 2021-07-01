import { getterTree, mutationTree, actionTree } from 'typed-vuex'
import { cloneDeep } from 'lodash-es'

import { TOKENS } from '@/utils/tokens'
import { TokenAmount } from '@/utils/safe-math'
import { commitment, getMultipleAccounts } from '@/utils/web3'
import {
  IDO_POOLS,
  IdoPool,
  IdoUserInfo,
  findAssociatedIdoInfoAddress,
  findAssociatedIdoCheckAddress,
  IdoPoolInfo,
  IdoLotteryPoolInfo,
  IDO_POOL_INFO_LAYOUT,
  IDO_USER_INFO_LAYOUT,
  IDO_LOTTERY_POOL_INFO_LAYOUT,
  IDO_LOTTERY_USER_INFO_LAYOUT,
  IDO_LOTTERY_SNAPSHOT_DATA_LAYOUT,
  IdoLotteryUserInfo
} from '@/utils/ido'
import { PublicKey } from '@solana/web3.js'
import logger from '@/utils/logger'
import { getUnixTs } from '@/utils'

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

          if (pool.version === 3) {
            const decoded = IDO_LOTTERY_POOL_INFO_LAYOUT.decode(data)
            pool.info = {
              status: decoded.status.toNumber(),
              nonce: decoded.nonce.toNumber(),
              startTime: decoded.startTime.toNumber(),
              endTime: decoded.endTime.toNumber(),
              startWithdrawTime: decoded.startWithdrawTime.toNumber(),
              numerator: decoded.numerator.toNumber(),
              denominator: decoded.denominator.toNumber(),
              quoteTokenDeposited: new TokenAmount(decoded.quoteTokenDeposited.toNumber(), pool.quote.decimals),
              baseTokenSupply: new TokenAmount(decoded.baseTokenSupply.toNumber(), pool.base.decimals),
              perUserMaxLottery: decoded.perUserMaxLottery.toNumber(),
              perUserMinLottery: decoded.perUserMinLottery.toNumber(),
              perLotteryNeedMinStake: decoded.perLotteryNeedMinStake.toNumber(),
              perLotteryWorthQuoteAmount: new TokenAmount(
                decoded.perLotteryWorthQuoteAmount.toNumber(),
                pool.quote.decimals
              ),
              totalWinLotteryLimit: decoded.totalWinLotteryLimit.toNumber(),
              totalDepositUserNumber: decoded.totalDepositUserNumber.toNumber(),
              currentLotteryNumber: decoded.currentLotteryNumber.toNumber(),
              luckyInfos: decoded.luckyInfos.map((obj: any[]) =>
                Object.entries(obj).reduce((acc, [key, value]) => ({ ...acc, [key]: value.toNumber() }), {})
              ),
              quoteTokenMint: decoded.quoteTokenMint,
              baseTokenMint: decoded.baseTokenMint,
              quoteTokenVault: decoded.quoteTokenVault,
              baseTokenVault: decoded.baseTokenVault,
              stakePoolId: decoded.stakePoolId,
              stakeProgramId: decoded.stakeProgramId,
              checkProgramId: decoded.checkProgramId,
              idoOwner: decoded.idoOwner,
              poolSeedId: decoded.poolSeedId
            } as IdoLotteryPoolInfo
          } else {
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
            } as IdoPoolInfo
          }
          pool.status =
            pool.info.endTime < getUnixTs() / 1000
              ? 'ended'
              : pool.info.startTime < getUnixTs() / 1000
              ? 'open'
              : 'upcoming'
        }
      })

      const pools = await dispatch('getIdoAccounts', { pools: idoPools })

      commit('setPools', pools)
      logger('Ido pool & user infomations updated')
      commit('setInitialized')
      commit('setLoading', false)
    },

    async getIdoAccounts(_, { pools }) {
      const conn = this.$web3
      const wallet = (this as any)._vm.$wallet

      const idoPools: Array<IdoPool> = pools

      if (wallet && wallet.connected) {
        const publicKeys: Array<PublicKey> = []

        const keys = ['idoAccount', 'idoCheck']
        const keyLength = keys.length

        for (const pool of idoPools) {
          const { idoId, programId, version, snapshotProgramId, seedId } = pool

          const userIdoAccount = await findAssociatedIdoInfoAddress(
            new PublicKey(idoId),
            wallet.publicKey,
            new PublicKey(programId)
          )
          const userIdoCheck = await findAssociatedIdoCheckAddress(
            new PublicKey(version === 1 ? idoId : seedId!),
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
                if (!pool.userInfo) {
                  pool.userInfo = {} as IdoUserInfo
                }
                if (pool.version === 3) {
                  const decoded = IDO_LOTTERY_USER_INFO_LAYOUT.decode(data)
                  ;(pool.userInfo as IdoLotteryUserInfo).quoteTokenDeposited = decoded.quoteTokenDeposited.toNumber()
                  ;(pool.userInfo as IdoLotteryUserInfo).quoteTokenWithdrawn = decoded.quoteTokenWithdrawn.toNumber()
                  ;(pool.userInfo as IdoLotteryUserInfo).baseTokenWithdrawn = decoded.baseTokenWithdrawn.toNumber()
                  ;(pool.userInfo as IdoLotteryUserInfo).lotteryBeginNumber = decoded.lotteryBeginNumber.toNumber()
                  ;(pool.userInfo as IdoLotteryUserInfo).lotteryEndNumber = decoded.lotteryEndNumber.toNumber()
                }
                const decoded = IDO_USER_INFO_LAYOUT.decode(data)
                ;(pool.userInfo as IdoUserInfo).deposited = new TokenAmount(
                  decoded.quoteTokenDeposited.toNumber(),
                  pool.quote.decimals
                )
                break
              }
              case 'idoCheck': {
                if (!pool.userInfo) {
                  pool.userInfo = {} as IdoLotteryUserInfo
                }
                if (pool.version === 3) {
                  const decoded = IDO_LOTTERY_SNAPSHOT_DATA_LAYOUT.decode(data)
                  ;(pool.userInfo as IdoLotteryUserInfo).eligibleTicketAmount = decoded.eligibleTicketAmount.toNumber()
                }
                pool.userInfo.snapshoted = true
                break
              }
            }
          }
        })
      }

      return idoPools
    }
  }
)
