import { FARMS, getAddressForWhat } from '@/utils/farms'
import { commitment, getMultipleAccounts } from '@/utils/web3'

import { ACCOUNT_LAYOUT } from '@/utils/layouts'
import { PublicKey } from '@solana/web3.js'
import { STAKE_INFO_LAYOUT } from '@/utils/stake'
import { TokenAmount } from '@/utils/safe-math'
import { cloneDeep } from 'lodash-es'
import logger from '@/utils/logger'

const AUTO_REFRESH_TIME = 60

export const state = () => ({
  initialized: false,
  loading: false,
  infos: {},
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

  setCountdown(state: any, countdown: number) {
    state.countdown = countdown
  },

  setLastSubBlock(state: any, lastSubBlock: number) {
    state.lastSubBlock = lastSubBlock
  }
}

export const actions = {
  requestInfos({ commit }: { commit: any }) {
    commit('setLoading', true)

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
                  const parsed = STAKE_INFO_LAYOUT.decode(data)

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
      .finally(() => {
        commit('setInitialized')
        commit('setLoading', false)
      })
  }
}
