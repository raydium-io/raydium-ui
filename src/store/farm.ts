import { PublicKey } from '@solana/web3.js';
import { cloneDeep } from 'lodash-es';
import { actionTree, getterTree, mutationTree } from 'typed-vuex';

import { FARMS, getAddressForWhat, getFarmByPoolId } from '@/utils/farms';
import { STAKE_PROGRAM_ID, STAKE_PROGRAM_ID_V4, STAKE_PROGRAM_ID_V5 } from '@/utils/ids';
import { ACCOUNT_LAYOUT, getBigNumber } from '@/utils/layouts';
import logger from '@/utils/logger';
import { lt, TokenAmount } from '@/utils/safe-math';
import {
  STAKE_INFO_LAYOUT, STAKE_INFO_LAYOUT_V4, USER_STAKE_INFO_ACCOUNT_LAYOUT,
  USER_STAKE_INFO_ACCOUNT_LAYOUT_V4, USER_STAKE_INFO_ACCOUNT_LAYOUT_V5
} from '@/utils/stake';
import {
  commitment, findAssociatedStakeInfoAddress, getFilteredProgramAccounts, getMultipleAccounts
} from '@/utils/web3';

const AUTO_REFRESH_TIME = 60

export const state = () => ({
  initialized: false,
  loading: false,

  autoRefreshTime: AUTO_REFRESH_TIME,
  countdown: 0,
  lastSubBlock: 0,

  infos: {},
  stakeAccounts: {},
  auxiliaryStakeAccounts: {}
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

  setAuxiliaryStakeAccounts(state, auxiliaryStakeAccounts) {
    state.auxiliaryStakeAccounts = cloneDeep(auxiliaryStakeAccounts)
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

    async getStakeAccounts({ commit }) {
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

        // stake user info account v5
        const stakeFiltersV5 = [
          {
            memcmp: {
              offset: 40,
              bytes: wallet.publicKey.toBase58()
            }
          }
        ]

        const stakeAccounts: any = {}
        const auxiliaryStakeAccounts: any = {}

        await Promise.all([
          await stakeProgramIdAccount(stakeAccounts, conn, stakeFilters),
          await stakeProgramIdAccountV4(STAKE_PROGRAM_ID_V4, stakeAccounts, conn, stakeFiltersV4),
          await stakeProgramIdAccountV5(
            STAKE_PROGRAM_ID_V5,
            stakeAccounts,
            auxiliaryStakeAccounts,
            conn,
            stakeFiltersV5
          )
        ])

        commit('setStakeAccounts', stakeAccounts)
        commit('setAuxiliaryStakeAccounts', auxiliaryStakeAccounts)
        logger('User StakeAccounts updated')
      }
    }
  }
)

async function stakeProgramIdAccount(stakeAccounts: any, conn: any, stakeFilters: any) {
  const stakeAccountInfos = await getFilteredProgramAccounts(conn, new PublicKey(STAKE_PROGRAM_ID), stakeFilters)
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
}

async function stakeProgramIdAccountV4(programId: string, stakeAccounts: any, conn: any, stakeFilters: any) {
  const stakeAccountInfos = await getFilteredProgramAccounts(conn, new PublicKey(programId), stakeFilters)

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
        if (lt(getBigNumber(stakeAccounts[poolId].depositBalance.wei), getBigNumber(depositBalance.wei))) {
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
}

async function stakeProgramIdAccountV5(
  programId: string,
  stakeAccounts: any,
  auxiliaryStakeAccounts: any,
  conn: any,
  stakeFilters: any
) {
  const stakeAccountInfos = await getFilteredProgramAccounts(conn, new PublicKey(programId), stakeFilters)

  for (const stakeAccountInfo of stakeAccountInfos) {
    const stakeAccountAddress = stakeAccountInfo.publicKey.toBase58()
    const { data } = stakeAccountInfo.accountInfo

    const LAYOUT =
      data.length === USER_STAKE_INFO_ACCOUNT_LAYOUT_V4.span
        ? USER_STAKE_INFO_ACCOUNT_LAYOUT_V4
        : USER_STAKE_INFO_ACCOUNT_LAYOUT_V5

    const userStakeInfo = LAYOUT.decode(data)

    const poolId = userStakeInfo.poolId.toBase58()

    const rewardDebt = getBigNumber(userStakeInfo.rewardDebt)
    const rewardDebtB = getBigNumber(userStakeInfo.rewardDebtB)

    const farm = getFarmByPoolId(poolId)

    if (farm) {
      const depositBalance = new TokenAmount(getBigNumber(userStakeInfo.depositBalance), farm.lp.decimals)

      const pda = await findAssociatedStakeInfoAddress(
        userStakeInfo.poolId,
        userStakeInfo.stakerOwner,
        new PublicKey(programId)
      )

      if (pda.equals(stakeAccountInfo.publicKey)) {
        stakeAccounts[poolId] = {
          depositBalance,
          rewardDebt: new TokenAmount(rewardDebt, farm.reward.decimals),
          // @ts-ignore
          rewardDebtB: new TokenAmount(rewardDebtB, farm.rewardB.decimals),
          stakeAccountAddress
        }
      } else if (Object.prototype.hasOwnProperty.call(stakeAccounts, poolId)) {
        if (lt(getBigNumber(stakeAccounts[poolId].depositBalance.wei), getBigNumber(depositBalance.wei))) {
          stakeAccounts[poolId] = {
            depositBalance,
            rewardDebt: new TokenAmount(rewardDebt, farm.reward.decimals),
            // @ts-ignore
            rewardDebtB: new TokenAmount(rewardDebtB, farm.rewardB.decimals),
            stakeAccountAddress
          }
        }

        if (!Object.prototype.hasOwnProperty.call(auxiliaryStakeAccounts, poolId)) {
          auxiliaryStakeAccounts[poolId] = []
        }
        auxiliaryStakeAccounts[poolId].push(stakeAccountAddress)
      } else {
        stakeAccounts[poolId] = {
          depositBalance,
          rewardDebt: new TokenAmount(rewardDebt, farm.reward.decimals),
          // @ts-ignore
          rewardDebtB: new TokenAmount(rewardDebtB, farm.rewardB.decimals),
          stakeAccountAddress
        }

        if (!Object.prototype.hasOwnProperty.call(auxiliaryStakeAccounts, poolId)) {
          auxiliaryStakeAccounts[poolId] = []
        }
        auxiliaryStakeAccounts[poolId].push(stakeAccountAddress)
      }
    }
  }
}
