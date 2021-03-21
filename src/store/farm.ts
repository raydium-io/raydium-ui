import { FARMS, getAddressForWhat, getFarmByPoolId } from '@/utils/farms'
import {
  STAKE_INFO_LAYOUT,
  STAKE_INFO_LAYOUT_V4,
  USER_STAKE_INFO_ACCOUNT_LAYOUT,
  USER_STAKE_INFO_ACCOUNT_LAYOUT_V4
} from '@/utils/stake'
import { commitment, getFilteredProgramAccounts, getMultipleAccounts } from '@/utils/web3'

import { ACCOUNT_LAYOUT } from '@/utils/layouts'
import { PublicKey } from '@solana/web3.js'
import { STAKE_PROGRAM_ID, STAKE_PROGRAM_ID_V4 } from '@/utils/ids'
import { TokenAmount } from '@/utils/safe-math'
import { cloneDeep } from 'lodash-es'
import logger from '@/utils/logger'

const AUTO_REFRESH_TIME = 60

export const state = () => ({
  initialized: false,
  loading: false,
  infos: {},
  stakeAccounts: {},
  // 自动刷新倒计时
  autoRefreshTime: AUTO_REFRESH_TIME,
  countdown: 0,
  lastSubBlock: 0
})

export const mutations = {
  setInitialized(state: any) {
    state.initialized = true
  },

  setLoading(state: any, loading: boolean) {
    if (loading) {
      state.countdown = AUTO_REFRESH_TIME
    }

    state.loading = loading

    if (!loading) {
      state.countdown = 0
    }
  },

  setInfos(state: any, infos: object) {
    state.infos = cloneDeep(infos)
  },

  setStakeAccounts(state: any, stakeAccounts: any) {
    state.stakeAccounts = cloneDeep(stakeAccounts)
  },

  setCountdown(state: any, countdown: number) {
    state.countdown = countdown
  },

  setLastSubBlock(state: any, lastSubBlock: number) {
    state.lastSubBlock = lastSubBlock
  }
}

export const actions = {
  requestInfos({ commit, dispatch }: { commit: any; dispatch: any }) {
    commit('setLoading', true)
    dispatch('getStakeAccounts')

    const conn = (this as any)._vm.$conn

    const farms = {} as any
    const publicKeys = [] as any

    FARMS.forEach((farm) => {
      const { lp, poolId, poolLpTokenAccount } = farm

      publicKeys.push(new PublicKey(poolId), new PublicKey(poolLpTokenAccount))

      const farmInfo = cloneDeep(farm)

      farmInfo.lp.balance = new TokenAmount(0, lp.decimals)

      farms[poolId] = farmInfo
    })

    getMultipleAccounts(conn, publicKeys, commitment)
      .then((multipleInfo) => {
        multipleInfo.forEach((info) => {
          if (info) {
            const address = info.publicKey.toBase58()
            const data = Buffer.from(info.account.data)

            const { key, poolId } = getAddressForWhat(address)

            if (key && poolId) {
              const farmInfo = farms[poolId]

              switch (key) {
                // 获取池子信息
                case 'poolId': {
                  let parsed

                  if (farmInfo.version === 4) {
                    parsed = STAKE_INFO_LAYOUT_V4.decode(data)
                  } else {
                    parsed = STAKE_INFO_LAYOUT.decode(data)
                  }

                  farmInfo.poolInfo = parsed

                  break
                }
                // 获取 staked 余额
                case 'poolLpTokenAccount': {
                  const parsed = ACCOUNT_LAYOUT.decode(data)

                  farmInfo.lp.balance.wei = farmInfo.lp.balance.wei.plus(parsed.amount.toNumber())

                  break
                }
              }
            }
          }
        })

        commit('setInfos', farms)
        logger('Farm&Stake pool infomations updated')
      })
      .catch()
      .finally(() => {
        commit('setInitialized')
        commit('setLoading', false)
      })
  },

  getStakeAccounts({ commit }: { commit: any }) {
    const conn = (this as any)._vm.$conn
    const wallet = (this as any)._vm.$wallet

    if (wallet) {
      // 获取 stake user info account
      const stakeFilters = [
        {
          memcmp: {
            offset: 40,
            bytes: wallet.publicKey.toBase58()
          }
        },
        {
          dataSize: USER_STAKE_INFO_ACCOUNT_LAYOUT.span
        }
      ]

      const stakeAccounts: any = {}

      getFilteredProgramAccounts(conn, new PublicKey(STAKE_PROGRAM_ID), stakeFilters)
        .then((stakeAccountInfos) => {
          stakeAccountInfos.forEach((stakeAccountInfo) => {
            const stakeAccountAddress = stakeAccountInfo.publicKey.toBase58()
            const { data } = stakeAccountInfo.accountInfo

            const userStakeInfo = USER_STAKE_INFO_ACCOUNT_LAYOUT.decode(data)

            const poolId = userStakeInfo.poolId.toBase58()
            const depositBalance = userStakeInfo.depositBalance.toNumber()
            const rewardDebt = userStakeInfo.rewardDebt.toNumber()

            const farm = getFarmByPoolId(poolId)

            if (farm) {
              stakeAccounts[poolId] = {
                depositBalance: new TokenAmount(depositBalance, farm.lp.decimals),
                rewardDebt: new TokenAmount(rewardDebt, farm.reward.decimals),
                stakeAccountAddress
              }
            }
          })
        })
        .catch()

      // 获取 stake user info account v4
      const stakeFiltersV4 = [
        {
          memcmp: {
            offset: 40,
            bytes: wallet.publicKey.toBase58()
          }
        },
        {
          dataSize: USER_STAKE_INFO_ACCOUNT_LAYOUT_V4.span
        }
      ]

      const stakeAccountsV4: any = {}

      getFilteredProgramAccounts(conn, new PublicKey(STAKE_PROGRAM_ID_V4), stakeFiltersV4)
        .then((stakeAccountInfos) => {
          stakeAccountInfos.forEach((stakeAccountInfo) => {
            const stakeAccountAddress = stakeAccountInfo.publicKey.toBase58()
            const { data } = stakeAccountInfo.accountInfo

            const userStakeInfo = USER_STAKE_INFO_ACCOUNT_LAYOUT_V4.decode(data)

            const poolId = userStakeInfo.poolId.toBase58()
            const depositBalance = userStakeInfo.depositBalance.toNumber()
            const rewardDebt = userStakeInfo.rewardDebt.toNumber()
            const rewardDebtB = userStakeInfo.rewardDebtB.toNumber()

            const farm = getFarmByPoolId(poolId)

            if (farm) {
              stakeAccountsV4[poolId] = {
                depositBalance: new TokenAmount(depositBalance, farm.lp.decimals),
                rewardDebt: new TokenAmount(rewardDebt, farm.reward.decimals),
                // @ts-ignore
                rewardDebtB: new TokenAmount(rewardDebtB, farm.rewardB.decimals),
                stakeAccountAddress
              }
            }
          })

          commit('setStakeAccounts', { ...stakeAccounts, ...stakeAccountsV4 })
          logger('User StakeAccounts updated')
        })
        .catch()
    }
  }
}
