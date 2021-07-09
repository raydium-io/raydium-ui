import { getterTree, mutationTree, actionTree } from 'typed-vuex'

import { FARMS, getAddressForWhat, getFarmByPoolId } from '@/utils/farms'
import {
  STAKE_INFO_LAYOUT,
  STAKE_INFO_LAYOUT_V4,
  USER_STAKE_INFO_ACCOUNT_LAYOUT,
  USER_STAKE_INFO_ACCOUNT_LAYOUT_V4
} from '@/utils/stake'
import { commitment, getFilteredProgramAccounts, getMultipleAccounts } from '@/utils/web3'

import { ACCOUNT_LAYOUT, getBigNumber } from '@/utils/layouts'
import { PublicKey } from '@solana/web3.js'
import { STAKE_PROGRAM_ID, STAKE_PROGRAM_ID_V4, STAKE_PROGRAM_ID_V5 } from '@/utils/ids'
import { TokenAmount, lt } from '@/utils/safe-math'
import { cloneDeep } from 'lodash-es'
import logger from '@/utils/logger'

const AUTO_REFRESH_TIME = 60

export const state = () => ({
  initialized: false,
  loading: false,

  autoRefreshTime: AUTO_REFRESH_TIME,
  countdown: 0,
  lastSubBlock: 0,

  infos: {},
  stakeAccounts: {}
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

  setInfos(state, infos: object) {
    state.infos = cloneDeep(infos)
  },

  setStakeAccounts(state, stakeAccounts) {
    state.stakeAccounts = cloneDeep(stakeAccounts)
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
      dispatch('getStakeAccounts')

      const conn = this.$web3

      const farms = {} as any
      const publicKeys = [] as any

      FARMS.forEach((farm) => {
        const { lp, poolId, poolLpTokenAccount } = farm

        publicKeys.push(new PublicKey(poolId), new PublicKey(poolLpTokenAccount))

        const farmInfo = cloneDeep(farm)

        farmInfo.lp.balance = new TokenAmount(0, lp.decimals)

        farms[poolId] = farmInfo
      })

      const multipleInfo = await getMultipleAccounts(conn, publicKeys, commitment)
      multipleInfo.forEach((info) => {
        if (info) {
          const address = info.publicKey.toBase58()
          const data = Buffer.from(info.account.data)

          const { key, poolId } = getAddressForWhat(address)

          if (key && poolId) {
            const farmInfo = farms[poolId]

            switch (key) {
              // pool info
              case 'poolId': {
                let parsed

                if ([4, 5].includes(farmInfo.version)) {
                  parsed = STAKE_INFO_LAYOUT_V4.decode(data)
                } else {
                  parsed = STAKE_INFO_LAYOUT.decode(data)
                }

                farmInfo.poolInfo = parsed

                break
              }
              // staked balance
              case 'poolLpTokenAccount': {
                const parsed = ACCOUNT_LAYOUT.decode(data)

                farmInfo.lp.balance.wei = farmInfo.lp.balance.wei.plus(getBigNumber(parsed.amount))

                break
              }
            }
          }
        }
      })

      commit('setInfos', farms)
      logger('Farm&Stake pool infomations updated')
      commit('setInitialized')
      commit('setLoading', false)
    },

    getStakeAccounts({ commit }) {
      const conn = this.$web3
      const wallet = (this as any)._vm.$wallet

      if (wallet && wallet.connected) {
        // stake user info account
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

              const rewardDebt = getBigNumber(userStakeInfo.rewardDebt)

              const farm = getFarmByPoolId(poolId)

              if (farm) {
                const depositBalance = new TokenAmount(getBigNumber(userStakeInfo.depositBalance), farm.lp.decimals)

                if (Object.prototype.hasOwnProperty.call(stakeAccounts, poolId)) {
                  if (lt(getBigNumber(stakeAccounts[poolId].depositBalance.wei), getBigNumber(depositBalance.wei))) {
                    stakeAccounts[poolId] = {
                      depositBalance,
                      rewardDebt: new TokenAmount(rewardDebt, farm.reward.decimals),
                      stakeAccountAddress
                    }
                  }
                } else {
                  stakeAccounts[poolId] = {
                    depositBalance,
                    rewardDebt: new TokenAmount(rewardDebt, farm.reward.decimals),
                    stakeAccountAddress
                  }
                }
              }
            })

            // stake user info account v4
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

            getFilteredProgramAccounts(conn, new PublicKey(STAKE_PROGRAM_ID_V4), stakeFiltersV4)
              .then((stakeAccountInfos) => {
                stakeAccountInfos.forEach((stakeAccountInfo) => {
                  const stakeAccountAddress = stakeAccountInfo.publicKey.toBase58()
                  const { data } = stakeAccountInfo.accountInfo

                  const userStakeInfo = USER_STAKE_INFO_ACCOUNT_LAYOUT_V4.decode(data)

                  const poolId = userStakeInfo.poolId.toBase58()

                  const rewardDebt = getBigNumber(userStakeInfo.rewardDebt)
                  const rewardDebtB = getBigNumber(userStakeInfo.rewardDebtB)

                  const farm = getFarmByPoolId(poolId)

                  if (farm) {
                    const depositBalance = new TokenAmount(getBigNumber(userStakeInfo.depositBalance), farm.lp.decimals)

                    if (Object.prototype.hasOwnProperty.call(stakeAccounts, poolId)) {
                      if (
                        lt(getBigNumber(stakeAccounts[poolId].depositBalance.wei), getBigNumber(depositBalance.wei))
                      ) {
                        stakeAccounts[poolId] = {
                          depositBalance,
                          rewardDebt: new TokenAmount(rewardDebt, farm.reward.decimals),
                          // @ts-ignore
                          rewardDebtB: new TokenAmount(rewardDebtB, farm.rewardB.decimals),
                          stakeAccountAddress
                        }
                      }
                    } else {
                      stakeAccounts[poolId] = {
                        depositBalance,
                        rewardDebt: new TokenAmount(rewardDebt, farm.reward.decimals),
                        // @ts-ignore
                        rewardDebtB: new TokenAmount(rewardDebtB, farm.rewardB.decimals),
                        stakeAccountAddress
                      }
                    }
                  }
                })

                getFilteredProgramAccounts(conn, new PublicKey(STAKE_PROGRAM_ID_V5), stakeFiltersV4)
                  .then((stakeAccountInfos) => {
                    stakeAccountInfos.forEach((stakeAccountInfo) => {
                      const stakeAccountAddress = stakeAccountInfo.publicKey.toBase58()
                      const { data } = stakeAccountInfo.accountInfo

                      const userStakeInfo = USER_STAKE_INFO_ACCOUNT_LAYOUT_V4.decode(data)

                      const poolId = userStakeInfo.poolId.toBase58()

                      const rewardDebt = getBigNumber(userStakeInfo.rewardDebt)
                      const rewardDebtB = getBigNumber(userStakeInfo.rewardDebtB)

                      const farm = getFarmByPoolId(poolId)

                      if (farm) {
                        const depositBalance = new TokenAmount(
                          getBigNumber(userStakeInfo.depositBalance),
                          farm.lp.decimals
                        )

                        if (Object.prototype.hasOwnProperty.call(stakeAccounts, poolId)) {
                          if (
                            lt(getBigNumber(stakeAccounts[poolId].depositBalance.wei), getBigNumber(depositBalance.wei))
                          ) {
                            stakeAccounts[poolId] = {
                              depositBalance,
                              rewardDebt: new TokenAmount(rewardDebt, farm.reward.decimals),
                              // @ts-ignore
                              rewardDebtB: new TokenAmount(rewardDebtB, farm.rewardB.decimals),
                              stakeAccountAddress
                            }
                          }
                        } else {
                          stakeAccounts[poolId] = {
                            depositBalance,
                            rewardDebt: new TokenAmount(rewardDebt, farm.reward.decimals),
                            // @ts-ignore
                            rewardDebtB: new TokenAmount(rewardDebtB, farm.rewardB.decimals),
                            stakeAccountAddress
                          }
                        }
                      }
                    })

                    commit('setStakeAccounts', stakeAccounts)
                    logger('User StakeAccounts updated')
                  })
                  .catch()
              })
              .catch()
          })
          .catch()
      }
    }
  }
)
