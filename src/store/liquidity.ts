import { LIQUIDITY_POOLS, getAddressForWhat } from '@/utils/pools'
import { MINT_LAYOUT, TOKEN_ACCOUNT_LAYOUT } from '@/utils/layouts'

import { AMM_INFO_LAYOUT } from '@/utils/liquidity'
import { OpenOrders } from '@project-serum/serum'
import { PublicKey } from '@solana/web3.js'
import { TokenAmount } from '@/utils/safe-math'
import { cloneDeep } from 'lodash-es'
import commitment from '@/utils/commitment'
import { getMultipleAccounts } from '@/utils/web3'
import logger from '@/utils/logger'

const AUTO_REFRESH_TIME = 60

export const state = () => ({
  initialized: false,
  quoting: false,
  infos: {},
  // 自动刷新倒计时
  autoRefreshTime: AUTO_REFRESH_TIME,
  countdown: 0,
  lastSubBlock: 0,
  timer: null,
})

export const mutations = {
  setInitialized(state: any) {
    state.initialized = true
  },

  setQuoting(state: any, quoting: boolean) {
    if (quoting) {
      state.countdown = AUTO_REFRESH_TIME
    }

    state.quoting = quoting

    if (!quoting) {
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
  },
}

export const actions = {
  getLiquidityPoolInfo({ commit }: { commit: any }) {
    commit('setQuoting', true)

    const conn = (this as any)._vm.$conn

    const liquidityPools = {} as any
    const publicKeys = [] as any

    LIQUIDITY_POOLS.forEach((pool) => {
      const {
        poolCoinTokenAccount,
        poolPcTokenAccount,
        ammOpenOrders,
        ammId,
        coin,
        pc,
        lp,
      } = pool

      publicKeys.push(
        new PublicKey(poolCoinTokenAccount),
        new PublicKey(poolPcTokenAccount),
        new PublicKey(ammOpenOrders),
        new PublicKey(ammId),
        new PublicKey(lp.mintAddress)
      )

      const poolInfo = cloneDeep(pool)

      poolInfo.coin.balance = new TokenAmount(0, coin.decimals)
      poolInfo.pc.balance = new TokenAmount(0, pc.decimals)

      liquidityPools[lp.mintAddress] = poolInfo
    })

    getMultipleAccounts(conn, publicKeys, commitment).then((multipleInfo) => {
      multipleInfo.forEach((info) => {
        if (info) {
          const address = info.publicKey.toBase58()
          const data = Buffer.from(info.account.data)

          const { key, lpMintAddress } = getAddressForWhat(address)

          if (key && lpMintAddress) {
            const poolInfo = liquidityPools[lpMintAddress]

            switch (key) {
              // 获取池子未挂单的余额
              case 'poolCoinTokenAccount': {
                const parsed = TOKEN_ACCOUNT_LAYOUT.decode(data)

                poolInfo.coin.balance.wei = poolInfo.coin.balance.wei.plus(
                  parsed.amount.toNumber()
                )

                break
              }
              case 'poolPcTokenAccount': {
                const parsed = TOKEN_ACCOUNT_LAYOUT.decode(data)

                poolInfo.pc.balance.wei = poolInfo.pc.balance.wei.plus(
                  parsed.amount.toNumber()
                )

                break
              }
              // 获取池子挂单的余额 open orders
              case 'ammOpenOrders': {
                const OPEN_ORDERS_LAYOUT = OpenOrders.getLayout(
                  new PublicKey(poolInfo.serumProgramId)
                )
                const parsed = OPEN_ORDERS_LAYOUT.decode(data)

                const { baseTokenTotal, quoteTokenTotal } = parsed
                poolInfo.coin.balance.wei = poolInfo.coin.balance.wei.plus(
                  baseTokenTotal.toNumber()
                )
                poolInfo.pc.balance.wei = poolInfo.pc.balance.wei.plus(
                  quoteTokenTotal.toNumber()
                )

                break
              }
              // 获取池子信息 (利润金额等等)
              case 'ammId': {
                const parsed = AMM_INFO_LAYOUT.decode(data)

                const { needTakePnlCoin, needTakePnlPc } = parsed
                poolInfo.coin.balance.wei = poolInfo.coin.balance.wei.minus(
                  needTakePnlCoin.toNumber()
                )
                poolInfo.pc.balance.wei = poolInfo.pc.balance.wei.minus(
                  needTakePnlPc.toNumber()
                )

                break
              }
              // getLpSupply
              case 'lpMintAddress': {
                const parsed = MINT_LAYOUT.decode(data)

                poolInfo.lp.totalSupply = new TokenAmount(
                  parsed.supply.toNumber(),
                  poolInfo.lp.decimals
                )

                break
              }
            }
          }
        }
      })

      commit('setInfos', liquidityPools)
      commit('setInitialized')
      commit('setQuoting', false)
      logger('Liquidity pool quote updated')
    })
  },
}
