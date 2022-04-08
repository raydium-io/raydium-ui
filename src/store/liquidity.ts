import { cloneDeep } from 'lodash-es'
import { actionTree, getterTree, mutationTree } from 'typed-vuex'

import { OpenOrders } from '@project-serum/serum'
// import { _MARKET_STATE_LAYOUT_V2 } from '@project-serum/serum/lib/market'
// eslint-disable-next-line import/named
import { PublicKey } from '@solana/web3.js'
// import { LIQUIDITY_POOL_PROGRAM_ID_V4, SERUM_PROGRAM_ID_V3 } from '@/utils/ids'
import { ACCOUNT_LAYOUT, getBigNumber, MINT_LAYOUT } from '@/utils/layouts'
import {
  AMM_INFO_LAYOUT,
  AMM_INFO_LAYOUT_STABLE,
  AMM_INFO_LAYOUT_V3,
  AMM_INFO_LAYOUT_V4
  // getLpMintListDecimals
} from '@/utils/liquidity'
import logger from '@/utils/logger'
import { LIQUIDITY_POOLS, LiquidityPoolInfo } from '@/utils/pools'
import { TokenAmount } from '@/utils/safe-math'
import { LP_TOKENS, NATIVE_SOL, TOKENS } from '@/utils/tokens'
import {
  commitment,
  // createAmmAuthority,
  // getFilteredProgramAccountsAmmOrMarketCache,
  getMultipleAccounts
} from '@/utils/web3'
import { formatLayout } from '@/utils/stable'

const AUTO_REFRESH_TIME = 60

// fake
// const BLACK_LIST: string[] = [
//   'DHgHX6eqZQTcRY5xixV5sM68NZBpJLLvnM9riG7i5FHz',
//   '5uN8CdpKxKFTkobBnqdv8bx6c7coGNSJgWX6AJLnyKxW'
// ]

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

interface tokenItemApi {
  [mint: string]: {
    symbol: string
    decimals: number
    icon: string
  }
}
interface tokenApi {
  official: tokenItemApi
  unOfficial: tokenItemApi
  blacklist: string[]
}

async function updateToken(axios: any) {
  const tokens: tokenApi = await axios.get('https://api.raydium.io/v1/main/token')
  for (const itemTokenMint of Object.keys(tokens.official)) {
    const itemToken = tokens.official[itemTokenMint]
    const knownTokenInfo = Object.entries(TOKENS).find((item) => item[1].mintAddress === itemTokenMint)
    if (knownTokenInfo) {
      if (!knownTokenInfo[1].tags.includes('raydium')) {
        TOKENS[knownTokenInfo[0]].tags.push('raydium')
      }
      TOKENS[knownTokenInfo[0]].picUrl = tokens.official[itemTokenMint].icon
      TOKENS[knownTokenInfo[0]].symbol = tokens.official[itemTokenMint].symbol
    } else {
      TOKENS[itemTokenMint] = {
        symbol: itemToken.symbol,
        name: itemToken.symbol,
        mintAddress: itemTokenMint,
        decimals: itemToken.decimals,
        tags: ['raydium'],
        picUrl: itemToken.icon
      }
    }
  }

  for (const itemTokenMint of Object.keys(tokens.unOfficial)) {
    const itemToken = tokens.unOfficial[itemTokenMint]
    const knownTokenInfo = Object.entries(TOKENS).find((item) => item[1].mintAddress === itemTokenMint)
    if (knownTokenInfo) {
      if (!knownTokenInfo[1].tags.includes('solana')) {
        TOKENS[knownTokenInfo[0]].tags.push('solana')
      }
      TOKENS[knownTokenInfo[0]].picUrl = tokens.unOfficial[itemTokenMint].icon
      TOKENS[knownTokenInfo[0]].symbol = tokens.unOfficial[itemTokenMint].symbol
    } else {
      TOKENS[itemTokenMint] = {
        symbol: itemToken.symbol,
        name: itemToken.symbol,
        mintAddress: itemTokenMint,
        decimals: itemToken.decimals,
        tags: ['solana'],
        picUrl: itemToken.icon
      }
    }
  }
}

interface liquidityItemApi {
  coin: string
  pc: string
  lp: string
  coinDecimals: number
  pcDecimals: number
  version: number
  programId: string
  ammAuthority: string
  ammOpenOrders: string
  ammTargetOrders: string
  modelDataAccount: string
  poolCoinTokenAccount: string
  poolPcTokenAccount: string
  poolWithdrawQueue: string
  poolTempLpTokenAccount: string
  serumProgramId: string
  serumMarket: string
  serumBids: string
  serumAsks: string
  serumEventQueue: string
  serumCoinVaultAccount: string
  serumPcVaultAccount: string
  serumVaultSigner: string
}
interface liquidityApi {
  official: { [poolId: string]: liquidityItemApi }
  unOfficial: { [poolId: string]: liquidityItemApi }
}

function checkLiquidity(poolInfos: { [poolId: string]: liquidityItemApi }, official: boolean) {
  for (const [poolId, poolInfo] of Object.entries(poolInfos)) {
    let coinTokenInfo =
      TOKENS[poolInfo.coin] ?? Object.values(TOKENS).find((item) => item.mintAddress === poolInfo.coin)
    let pcTokenInfo = TOKENS[poolInfo.pc] ?? Object.values(TOKENS).find((item) => item.mintAddress === poolInfo.pc)
    if (poolInfo.coin === TOKENS.WSOL.mintAddress) {
      coinTokenInfo = { ...NATIVE_SOL }
    } else if (coinTokenInfo === undefined) {
      coinTokenInfo = {
        symbol: 'unknown',
        name: 'unknown',
        mintAddress: poolInfo.coin,
        decimals: poolInfo.coinDecimals,
        cache: true,
        tags: []
      }
      TOKENS[poolInfo.coin] = { ...coinTokenInfo }
    }
    if (poolInfo.pc === TOKENS.WSOL.mintAddress) {
      pcTokenInfo = { ...NATIVE_SOL }
    } else if (pcTokenInfo === undefined) {
      pcTokenInfo = {
        symbol: 'unknown',
        name: 'unknown',
        mintAddress: poolInfo.pc,
        decimals: poolInfo.pcDecimals,
        cache: true,
        tags: []
      }
      TOKENS[poolInfo.pc] = { ...pcTokenInfo }
    }

    let lp = LP_TOKENS[poolInfo.lp] ?? Object.values(LP_TOKENS).find((item) => item.mintAddress === poolInfo.lp)
    if (lp === undefined) {
      lp = {
        symbol: `${coinTokenInfo.symbol}-${pcTokenInfo.symbol}`,
        name: `${coinTokenInfo.symbol}-${pcTokenInfo.symbol} LP`,
        coin: { ...coinTokenInfo },
        pc: { ...pcTokenInfo },

        mintAddress: poolInfo.lp,
        decimals: coinTokenInfo.decimals
      }
      LP_TOKENS[poolInfo.lp] = lp
    }

    const itemLiquidity = {
      name: `${coinTokenInfo.symbol}-${pcTokenInfo.symbol}`,
      coin: coinTokenInfo,
      pc: pcTokenInfo,
      lp,
      version: poolInfo.version,
      programId: poolInfo.programId,
      ammId: poolId,
      ammAuthority: poolInfo.ammAuthority,
      ammOpenOrders: poolInfo.ammOpenOrders,
      ammTargetOrders: poolInfo.ammTargetOrders,
      ammQuantities: NATIVE_SOL.mintAddress,
      poolCoinTokenAccount: poolInfo.poolCoinTokenAccount,
      poolPcTokenAccount: poolInfo.poolPcTokenAccount,
      poolWithdrawQueue: poolInfo.poolWithdrawQueue,
      poolTempLpTokenAccount: poolInfo.poolTempLpTokenAccount,
      serumProgramId: poolInfo.serumProgramId,
      serumMarket: poolInfo.serumMarket,
      serumBids: poolInfo.serumBids,
      serumAsks: poolInfo.serumAsks,
      serumEventQueue: poolInfo.serumEventQueue,
      serumCoinVaultAccount: poolInfo.serumCoinVaultAccount,
      serumPcVaultAccount: poolInfo.serumPcVaultAccount,
      serumVaultSigner: poolInfo.serumVaultSigner,
      official
    }

    if (!LIQUIDITY_POOLS.find((item) => item.ammId === poolId)) {
      LIQUIDITY_POOLS.push(itemLiquidity)
    } else {
      for (let itemIndex = 0; itemIndex < LIQUIDITY_POOLS.length; itemIndex += 1) {
        if (
          LIQUIDITY_POOLS[itemIndex].ammId === itemLiquidity.ammId &&
          LIQUIDITY_POOLS[itemIndex].name !== itemLiquidity.name &&
          LIQUIDITY_POOLS[itemIndex].official !== itemLiquidity.official
        ) {
          LIQUIDITY_POOLS[itemIndex] = itemLiquidity
        }
      }
    }
  }
}

export const actions = actionTree(
  { state, getters, mutations },
  {
    async requestInfos({ commit }) {
      commit('setLoading', true)

      const conn = this.$web3

      await updateToken(this.$axios)

      const liquidityApiInfo: liquidityApi = await this.$axios.get('https://api.raydium.io/v1/main/liquidity')
      checkLiquidity(liquidityApiInfo.official, true)
      checkLiquidity(liquidityApiInfo.unOfficial, false)

      const liquidityPools: { [lp: string]: LiquidityPoolInfo } = {}
      const publicKeys: PublicKey[] = []

      const tempKey: { [key: string]: { key: string; lpMintAddress: string; version: number } } = {}

      LIQUIDITY_POOLS.forEach((pool) => {
        const { poolCoinTokenAccount, poolPcTokenAccount, ammOpenOrders, ammId, coin, pc, lp } = pool

        publicKeys.push(
          new PublicKey(poolCoinTokenAccount),
          new PublicKey(poolPcTokenAccount),
          new PublicKey(ammOpenOrders),
          new PublicKey(ammId),
          new PublicKey(lp.mintAddress)
        )
        tempKey[poolCoinTokenAccount] = {
          key: 'poolCoinTokenAccount',
          lpMintAddress: lp.mintAddress,
          version: pool.version
        }
        tempKey[poolPcTokenAccount] = {
          key: 'poolPcTokenAccount',
          lpMintAddress: lp.mintAddress,
          version: pool.version
        }
        tempKey[ammOpenOrders] = { key: 'ammOpenOrders', lpMintAddress: lp.mintAddress, version: pool.version }
        tempKey[ammId] = { key: 'ammId', lpMintAddress: lp.mintAddress, version: pool.version }
        tempKey[lp.mintAddress] = { key: 'lpMintAddress', lpMintAddress: lp.mintAddress, version: pool.version }

        const poolInfo = cloneDeep(pool)

        poolInfo.coin.balance = new TokenAmount(0, coin.decimals)
        poolInfo.pc.balance = new TokenAmount(0, pc.decimals)

        liquidityPools[lp.mintAddress] = poolInfo
      })

      const multipleInfo = await getMultipleAccounts(conn, publicKeys, commitment)

      const modelAccount: { [account: string]: string[] } = {}
      multipleInfo.forEach((info) => {
        if (info) {
          const address = info.publicKey.toBase58()
          const data = Buffer.from(info.account.data)

          const { key, lpMintAddress, version } = tempKey[address]

          if (key && lpMintAddress) {
            const poolInfo: any = liquidityPools[lpMintAddress]

            switch (key) {
              case 'poolCoinTokenAccount': {
                const parsed = ACCOUNT_LAYOUT.decode(data)
                // quick fix: Number can only safely store up to 53 bits
                poolInfo.coin.balance.wei = poolInfo.coin.balance.wei.plus(getBigNumber(parsed.amount))

                break
              }
              case 'poolPcTokenAccount': {
                const parsed = ACCOUNT_LAYOUT.decode(data)

                poolInfo.pc.balance.wei = poolInfo.pc.balance.wei.plus(getBigNumber(parsed.amount))

                break
              }
              case 'ammOpenOrders': {
                const OPEN_ORDERS_LAYOUT = OpenOrders.getLayout(new PublicKey(poolInfo.serumProgramId))
                const parsed = OPEN_ORDERS_LAYOUT.decode(data)

                const { baseTokenTotal, quoteTokenTotal } = parsed
                poolInfo.coin.balance.wei = poolInfo.coin.balance.wei.plus(getBigNumber(baseTokenTotal))
                poolInfo.pc.balance.wei = poolInfo.pc.balance.wei.plus(getBigNumber(quoteTokenTotal))

                break
              }
              case 'ammId': {
                let parsed
                if (version === 2) {
                  parsed = AMM_INFO_LAYOUT.decode(data)
                } else if (version === 3) {
                  parsed = AMM_INFO_LAYOUT_V3.decode(data)
                } else {
                  if (version === 5) {
                    parsed = AMM_INFO_LAYOUT_STABLE.decode(data)

                    if (modelAccount[parsed.modelDataAccount.toString()] === undefined)
                      modelAccount[parsed.modelDataAccount.toString()] = []
                    modelAccount[parsed.modelDataAccount.toString()].push(lpMintAddress)
                  } else {
                    parsed = AMM_INFO_LAYOUT_V4.decode(data)
                    if (getBigNumber(parsed.status) === 7) {
                      poolInfo.poolOpenTime = getBigNumber(parsed.poolOpenTime)
                    }
                  }

                  const { swapFeeNumerator, swapFeeDenominator } = parsed
                  poolInfo.fees = {
                    swapFeeNumerator: getBigNumber(swapFeeNumerator),
                    swapFeeDenominator: getBigNumber(swapFeeDenominator)
                  }
                }

                const { status, needTakePnlCoin, needTakePnlPc } = parsed
                poolInfo.status = getBigNumber(status)
                poolInfo.coin.balance.wei = poolInfo.coin.balance.wei.minus(getBigNumber(needTakePnlCoin))
                poolInfo.pc.balance.wei = poolInfo.pc.balance.wei.minus(getBigNumber(needTakePnlPc))

                break
              }
              // getLpSupply
              case 'lpMintAddress': {
                const parsed = MINT_LAYOUT.decode(data)

                poolInfo.lp.totalSupply = new TokenAmount(getBigNumber(parsed.supply), poolInfo.lp.decimals)

                break
              }
            }
          }
        }
      })

      for (const [item, lpMintList] of Object.entries(modelAccount)) {
        const localData = window.localStorage.getItem('cache:' + item)
        if (localData === null) continue
        try {
          const localD = JSON.parse(localData)
          if (localD.flushTime < new Date().getTime() - 3600 * 24 * 1000) continue

          for (const itemLp of lpMintList) {
            console.log('local model data', itemLp)
            liquidityPools[itemLp].modelData = localD.result
          }
          delete modelAccount[item]
        } catch (e) {
          console.log('local model data error', item)
        }
      }
      if (Object.keys(modelAccount).length > 0) {
        const modelAccountData = await getMultipleAccounts(
          conn,
          Object.keys(modelAccount).map((item) => new PublicKey(item))
        )
        for (const item of modelAccountData) {
          if (item === null) continue
          const lpMintList = modelAccount[item.publicKey.toString()]
          const data = formatLayout(item.account.data)
          window.localStorage.setItem(
            'cache:' + item.publicKey.toString(),
            JSON.stringify({ flushTime: new Date().getTime(), result: data })
          )
          for (const itemLp of lpMintList) {
            console.log('update model data', itemLp)
            liquidityPools[itemLp].modelData = data
          }
        }
      }

      commit('setInfos', liquidityPools)
      logger('Liquidity pool infomations updated')

      commit('setInitialized')
      commit('setLoading', false)
    }
  }
)
