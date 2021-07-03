import { getterTree, mutationTree, actionTree } from 'typed-vuex'

import { ACCOUNT_LAYOUT, MINT_LAYOUT } from '@/utils/layouts'
import { AMM_INFO_LAYOUT, AMM_INFO_LAYOUT_V3, AMM_INFO_LAYOUT_V4, getLpMintListDecimals } from '@/utils/liquidity'
import { LIQUIDITY_POOLS, getAddressForWhat, LiquidityPoolInfo } from '@/utils/pools'
import { commitment, createAmmAuthority, getFilteredProgramAccounts, getMultipleAccounts } from '@/utils/web3'

import { OpenOrders } from '@project-serum/serum'
import { PublicKey } from '@solana/web3.js'
import { TokenAmount } from '@/utils/safe-math'
import { cloneDeep } from 'lodash-es'
import logger from '@/utils/logger'
import { LIQUIDITY_POOL_PROGRAM_ID_V4, SERUM_PROGRAM_ID_V3 } from '@/utils/ids'
import { _MARKET_STATE_LAYOUT_V2 } from '@project-serum/serum/lib/market'
import { LP_TOKENS, NATIVE_SOL, TOKENS } from '@/utils/tokens'

const AUTO_REFRESH_TIME = 60

export const state = () => ({
  initialized: false,
  loading: false,

  autoRefreshTime: AUTO_REFRESH_TIME,
  countdown: 0,
  lastSubBlock: 0,

  infos: {}
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

      const ammAll = await getFilteredProgramAccounts(conn, new PublicKey(LIQUIDITY_POOL_PROGRAM_ID_V4), [
        {
          dataSize: AMM_INFO_LAYOUT_V4.span
        }
      ])
      const marketAll = await getFilteredProgramAccounts(conn, new PublicKey(SERUM_PROGRAM_ID_V3), [
        {
          dataSize: _MARKET_STATE_LAYOUT_V2.span
        }
      ])
      const marketToLayout: { [name: string]: any } = {}
      marketAll.forEach((item) => {
        marketToLayout[item.publicKey.toString()] = _MARKET_STATE_LAYOUT_V2.decode(item.accountInfo.data)
      })

      const lpMintAddressList: string[] = []
      ammAll.forEach((item) => {
        const ammLayout = AMM_INFO_LAYOUT_V4.decode(Buffer.from(item.accountInfo.data))
        if (
          ammLayout.pcMintAddress.toString() === ammLayout.serumMarket.toString() ||
          ammLayout.lpMintAddress.toString() === '11111111111111111111111111111111'
        ) {
          return
        }
        lpMintAddressList.push(ammLayout.lpMintAddress.toString())
      })
      const lpMintListDecimls = await getLpMintListDecimals(conn, lpMintAddressList)

      for (let indexAmmInfo = 0; indexAmmInfo < ammAll.length; indexAmmInfo += 1) {
        const ammInfo = AMM_INFO_LAYOUT_V4.decode(Buffer.from(ammAll[indexAmmInfo].accountInfo.data))
        if (
          !Object.keys(lpMintListDecimls).includes(ammInfo.lpMintAddress.toString()) ||
          ammInfo.pcMintAddress.toString() === ammInfo.serumMarket.toString() ||
          ammInfo.lpMintAddress.toString() === '11111111111111111111111111111111' ||
          !Object.keys(marketToLayout).includes(ammInfo.serumMarket.toString())
        ) {
          continue
        }
        const fromCoin =
          ammInfo.coinMintAddress.toString() === TOKENS.WSOL.mintAddress
            ? NATIVE_SOL.mintAddress
            : ammInfo.coinMintAddress.toString()
        const toCoin =
          ammInfo.pcMintAddress.toString() === TOKENS.WSOL.mintAddress
            ? NATIVE_SOL.mintAddress
            : ammInfo.pcMintAddress.toString()
        let coin = Object.values(TOKENS).find((item) => item.mintAddress === fromCoin)
        if (!coin) {
          TOKENS[`unknow-${ammInfo.coinMintAddress.toString()}`] = {
            symbol: 'unknown',
            name: 'unknown',
            mintAddress: ammInfo.coinMintAddress.toString(),
            decimals: ammInfo.coinDecimals.toNumber(),
            cache: true,
            tags: []
          }
          coin = TOKENS[`unknow-${ammInfo.coinMintAddress.toString()}`]
        }
        if (!coin.tags.includes('unofficial')) {
          coin.tags.push('unofficial')
        }

        let pc = Object.values(TOKENS).find((item) => item.mintAddress === toCoin)
        if (!pc) {
          TOKENS[`unknow-${ammInfo.pcMintAddress.toString()}`] = {
            symbol: 'unknown',
            name: 'unknown',
            mintAddress: ammInfo.pcMintAddress.toString(),
            decimals: ammInfo.pcDecimals.toNumber(),
            cache: true,
            tags: []
          }
          pc = TOKENS[`unknow-${ammInfo.pcMintAddress.toString()}`]
        }
        if (!pc.tags.includes('unofficial')) {
          pc.tags.push('unofficial')
        }

        if (coin.mintAddress === TOKENS.WSOL.mintAddress) {
          coin.symbol = 'SOL'
          coin.name = 'SOL'
          coin.mintAddress = '11111111111111111111111111111111'
        }
        if (pc.mintAddress === TOKENS.WSOL.mintAddress) {
          pc.symbol = 'SOL'
          pc.name = 'SOL'
          pc.mintAddress = '11111111111111111111111111111111'
        }
        const lp = Object.values(LP_TOKENS).find((item) => item.mintAddress === ammInfo.lpMintAddress) ?? {
          symbol: `${coin.symbol}-${pc.symbol}`,
          name: `${coin.symbol}-${pc.symbol}`,
          coin,
          pc,
          mintAddress: ammInfo.lpMintAddress.toString(),
          decimals: lpMintListDecimls[ammInfo.lpMintAddress]
        }

        const { publicKey } = await createAmmAuthority(new PublicKey(LIQUIDITY_POOL_PROGRAM_ID_V4))

        const market = marketToLayout[ammInfo.serumMarket]

        const serumVaultSigner = await PublicKey.createProgramAddress(
          [ammInfo.serumMarket.toBuffer(), market.vaultSignerNonce.toArrayLike(Buffer, 'le', 8)],
          new PublicKey(SERUM_PROGRAM_ID_V3)
        )

        const itemLiquidity: LiquidityPoolInfo = {
          name: `${coin.symbol}-${pc.symbol}`,
          coin,
          pc,
          lp,
          version: 4,
          programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
          ammId: ammAll[indexAmmInfo].publicKey.toString(),
          ammAuthority: publicKey.toString(),
          ammOpenOrders: ammInfo.ammOpenOrders.toString(),
          ammTargetOrders: ammInfo.ammTargetOrders.toString(),
          ammQuantities: NATIVE_SOL.mintAddress,
          poolCoinTokenAccount: ammInfo.poolCoinTokenAccount.toString(),
          poolPcTokenAccount: ammInfo.poolPcTokenAccount.toString(),
          poolWithdrawQueue: ammInfo.poolWithdrawQueue.toString(),
          poolTempLpTokenAccount: ammInfo.poolTempLpTokenAccount.toString(),
          serumProgramId: SERUM_PROGRAM_ID_V3,
          serumMarket: ammInfo.serumMarket.toString(),
          serumBids: market.bids.toString(),
          serumAsks: market.asks.toString(),
          serumEventQueue: market.eventQueue.toString(),
          serumCoinVaultAccount: market.baseVault.toString(),
          serumPcVaultAccount: market.quoteVault.toString(),
          serumVaultSigner: serumVaultSigner.toString(),
          official: false
        }
        if (!LIQUIDITY_POOLS.find((item) => item.ammId === itemLiquidity.ammId)) {
          LIQUIDITY_POOLS.push(itemLiquidity)
        } else {
          for (let itemIndex = 0; itemIndex < LIQUIDITY_POOLS.length; itemIndex += 1) {
            if (
              LIQUIDITY_POOLS[itemIndex].ammId === itemLiquidity.ammId &&
              LIQUIDITY_POOLS[itemIndex].name !== itemLiquidity.name &&
              !LIQUIDITY_POOLS[itemIndex].official
            ) {
              LIQUIDITY_POOLS[itemIndex] = itemLiquidity
            }
          }
        }
      }

      const liquidityPools = {} as any
      const publicKeys = [] as any

      LIQUIDITY_POOLS.forEach((pool) => {
        const { poolCoinTokenAccount, poolPcTokenAccount, ammOpenOrders, ammId, coin, pc, lp } = pool

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

      const multipleInfo = await getMultipleAccounts(conn, publicKeys, commitment)

      multipleInfo.forEach((info) => {
        if (info) {
          const address = info.publicKey.toBase58()
          const data = Buffer.from(info.account.data)

          const { key, lpMintAddress, version } = getAddressForWhat(address)

          if (key && lpMintAddress) {
            const poolInfo = liquidityPools[lpMintAddress]

            switch (key) {
              case 'poolCoinTokenAccount': {
                const parsed = ACCOUNT_LAYOUT.decode(data)
                // quick fix: Number can only safely store up to 53 bits
                poolInfo.coin.balance.wei = poolInfo.coin.balance.wei.plus(parsed.amount.toString())

                break
              }
              case 'poolPcTokenAccount': {
                const parsed = ACCOUNT_LAYOUT.decode(data)

                poolInfo.pc.balance.wei = poolInfo.pc.balance.wei.plus(parsed.amount.toNumber())

                break
              }
              case 'ammOpenOrders': {
                const OPEN_ORDERS_LAYOUT = OpenOrders.getLayout(new PublicKey(poolInfo.serumProgramId))
                const parsed = OPEN_ORDERS_LAYOUT.decode(data)

                const { baseTokenTotal, quoteTokenTotal } = parsed
                poolInfo.coin.balance.wei = poolInfo.coin.balance.wei.plus(baseTokenTotal.toString())
                poolInfo.pc.balance.wei = poolInfo.pc.balance.wei.plus(quoteTokenTotal.toString())

                break
              }
              case 'ammId': {
                let parsed
                if (version === 2) {
                  parsed = AMM_INFO_LAYOUT.decode(data)
                } else if (version === 3) {
                  parsed = AMM_INFO_LAYOUT_V3.decode(data)
                } else {
                  parsed = AMM_INFO_LAYOUT_V4.decode(data)

                  const { swapFeeNumerator, swapFeeDenominator } = parsed
                  poolInfo.fees = {
                    swapFeeNumerator: swapFeeNumerator.toNumber(),
                    swapFeeDenominator: swapFeeDenominator.toNumber()
                  }
                }

                const { status, needTakePnlCoin, needTakePnlPc } = parsed
                poolInfo.status = status.toNumber()
                poolInfo.coin.balance.wei = poolInfo.coin.balance.wei.minus(needTakePnlCoin.toNumber())
                poolInfo.pc.balance.wei = poolInfo.pc.balance.wei.minus(needTakePnlPc.toNumber())

                break
              }
              // getLpSupply
              case 'lpMintAddress': {
                const parsed = MINT_LAYOUT.decode(data)

                poolInfo.lp.totalSupply = new TokenAmount(parsed.supply.toString(), poolInfo.lp.decimals)

                break
              }
            }
          }
        }
      })

      commit('setInfos', liquidityPools)
      logger('Liquidity pool infomations updated')

      commit('setInitialized')
      commit('setLoading', false)
    }
  }
)
