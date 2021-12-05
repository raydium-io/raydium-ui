import { cloneDeep } from 'lodash-es'

// @ts-ignore
import SERUM_MARKETS from '@project-serum/serum/lib/markets.json'

import {
  LIQUIDITY_POOL_PROGRAM_ID_V4,
  SERUM_PROGRAM_ID_V3
} from './ids'
import { LP_TOKENS, NATIVE_SOL, TokenInfo, TOKENS } from './tokens'

export interface LiquidityPoolInfo {
  name: string
  coin: TokenInfo
  pc: TokenInfo
  lp: TokenInfo

  version: number
  programId: string

  ammId: string
  ammAuthority: string
  ammOpenOrders: string
  ammTargetOrders: string
  ammQuantities: string

  poolCoinTokenAccount: string
  poolPcTokenAccount: string
  poolWithdrawQueue: string
  poolTempLpTokenAccount: string

  serumProgramId: string
  serumMarket: string
  serumBids?: string
  serumAsks?: string
  serumEventQueue?: string
  serumCoinVaultAccount: string
  serumPcVaultAccount: string
  serumVaultSigner: string

  official: boolean

  status?: number
  currentK?: number
}

/**
 * Get pool use two mint addresses

 * @param {string} coinMintAddress
 * @param {string} pcMintAddress

 * @returns {LiquidityPoolInfo | undefined} poolInfo
 */
export function getPoolByTokenMintAddresses(
  coinMintAddress: string,
  pcMintAddress: string
): LiquidityPoolInfo | undefined {
  const pool = LIQUIDITY_POOLS.find(
    (pool) =>
      (pool.coin.mintAddress === coinMintAddress && pool.pc.mintAddress === pcMintAddress) ||
      (pool.coin.mintAddress === pcMintAddress && pool.pc.mintAddress === coinMintAddress)
  )

  if (pool) {
    return cloneDeep(pool)
  }

  return pool
}

export function getPoolListByTokenMintAddresses(
  coinMintAddress: string,
  pcMintAddress: string,
  ammIdOrMarket: string | undefined
): LiquidityPoolInfo[] {
  const pool = LIQUIDITY_POOLS.filter((pool) => {
    if (coinMintAddress && pcMintAddress) {
      if (
        ((pool.coin.mintAddress === coinMintAddress && pool.pc.mintAddress === pcMintAddress) ||
          (pool.coin.mintAddress === pcMintAddress && pool.pc.mintAddress === coinMintAddress)) &&
        [4, 5].includes(pool.version) &&
        pool.official
      ) {
        return !(ammIdOrMarket !== undefined && pool.ammId !== ammIdOrMarket && pool.serumMarket !== ammIdOrMarket)
      }
    } else {
      return !(ammIdOrMarket !== undefined && pool.ammId !== ammIdOrMarket && pool.serumMarket !== ammIdOrMarket)
    }
    return false
  })
  if (pool.length > 0) {
    return cloneDeep(pool)
  } else {
    return cloneDeep(
      LIQUIDITY_POOLS.filter((pool) => {
        if (coinMintAddress && pcMintAddress) {
          if (
            ((pool.coin.mintAddress === coinMintAddress && pool.pc.mintAddress === pcMintAddress) ||
              (pool.coin.mintAddress === pcMintAddress && pool.pc.mintAddress === coinMintAddress)) &&
            [4, 5].includes(pool.version)
          ) {
            return !(ammIdOrMarket !== undefined && pool.ammId !== ammIdOrMarket && pool.serumMarket !== ammIdOrMarket)
          }
        } else {
          return !(ammIdOrMarket !== undefined && pool.ammId !== ammIdOrMarket && pool.serumMarket !== ammIdOrMarket)
        }
        return false
      })
    )
  }
}

export function getLpMintByTokenMintAddresses(
  coinMintAddress: string,
  pcMintAddress: string,
  version = [3, 4, 5]
): string | null {
  const pool = LIQUIDITY_POOLS.find(
    (pool) =>
      ((pool.coin.mintAddress === coinMintAddress && pool.pc.mintAddress === pcMintAddress) ||
        (pool.coin.mintAddress === pcMintAddress && pool.pc.mintAddress === coinMintAddress)) &&
      version.includes(pool.version)
  )

  if (pool) {
    return pool.lp.mintAddress
  }

  return null
}

export function getLpListByTokenMintAddresses(
  coinMintAddress: string,
  pcMintAddress: string,
  ammIdOrMarket: string | undefined,
  version = [4, 5]
): LiquidityPoolInfo[] {
  const pool = LIQUIDITY_POOLS.filter((pool) => {
    if (coinMintAddress && pcMintAddress) {
      if (
        ((pool.coin.mintAddress === coinMintAddress && pool.pc.mintAddress === pcMintAddress) ||
          (pool.coin.mintAddress === pcMintAddress && pool.pc.mintAddress === coinMintAddress)) &&
        version.includes(pool.version) &&
        pool.official
      ) {
        return !(ammIdOrMarket !== undefined && pool.ammId !== ammIdOrMarket && pool.serumMarket !== ammIdOrMarket)
      }
    } else {
      return !(ammIdOrMarket !== undefined && pool.ammId !== ammIdOrMarket && pool.serumMarket !== ammIdOrMarket)
    }
    return false
  })
  if (pool.length > 0) {
    return pool
  } else {
    return LIQUIDITY_POOLS.filter((pool) => {
      if (coinMintAddress && pcMintAddress) {
        if (
          ((pool.coin.mintAddress === coinMintAddress && pool.pc.mintAddress === pcMintAddress) ||
            (pool.coin.mintAddress === pcMintAddress && pool.pc.mintAddress === coinMintAddress)) &&
          version.includes(pool.version)
        ) {
          return !(ammIdOrMarket !== undefined && pool.ammId !== ammIdOrMarket && pool.serumMarket !== ammIdOrMarket)
        }
      } else {
        return !(ammIdOrMarket !== undefined && pool.ammId !== ammIdOrMarket && pool.serumMarket !== ammIdOrMarket)
      }
      return false
    })
  }
}

export function getPoolByLpMintAddress(lpMintAddress: string): LiquidityPoolInfo | undefined {
  const pool = LIQUIDITY_POOLS.find((pool) => pool.lp.mintAddress === lpMintAddress)

  if (pool) {
    return cloneDeep(pool)
  }

  return pool
}

export function getAddressForWhat(address: string) {
  for (const pool of LIQUIDITY_POOLS) {
    for (const [key, value] of Object.entries(pool)) {
      if (key === 'lp') {
        if (value.mintAddress === address) {
          return { key: 'lpMintAddress', lpMintAddress: pool.lp.mintAddress, version: pool.version }
        }
      } else if (value === address) {
        return { key, lpMintAddress: pool.lp.mintAddress, version: pool.version }
      }
    }
  }

  return {}
}

export function isOfficalMarket(marketAddress: string) {
  for (const market of SERUM_MARKETS) {
    if (market.address === marketAddress && !market.deprecated) {
      return true
    }
  }

  for (const pool of LIQUIDITY_POOLS) {
    if (pool.serumMarket === marketAddress && pool.official === true) {
      return true
    }
  }

  return false
}

export const LIQUIDITY_POOLS: LiquidityPoolInfo[] = [
  {
    name: 'BTC-USDC',
    coin: { ...TOKENS.BTC },
    pc: { ...TOKENS.USDC },
    lp: { ...LP_TOKENS['BTC-USDC-V4'] },
    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
    ammId: '88CJ7Zqe6RdBSHetEkruSNRpSGibexoGWKo2Jf8pPPf6',
    ammAuthority: 'HggGrUeg4ReGvpPMLJMFKV69NTXL1r4wQ9Pk9Ljutwyv',
    ammOpenOrders: 'AiyGzGf6bN5ozTNK69d3KrHS9hvQuZD6wZqU2ejBgZ1Q',
    ammTargetOrders: '71h5own84dbX5TD4CworR7GBJYgZ2nVrjgK7u56ZiJum',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'Fq8nURZFto3bTPaKqmDqbBAFfArwYvfVuFKVoFyZZVD6',
    poolPcTokenAccount: 'BvuamxaDy5VKnoCshtFmbFNviWbu2VzW2Gecuf12meUA',
    poolWithdrawQueue: '2gzLc4rNHR8kdxMfYGtu8RAUfzx4yt8BQKjSHi33UfMm',
    poolTempLpTokenAccount: 'BFj4YocjRu7iektWiZynM8W3U51HMZiCcJVJSZYDw2Hc',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'DW83EpHFywBxCHmyARxwj3nzxJd7MUdSeznmrdzZKNZB',
    serumBids: 'PuDcnQDEpoR3WwVAi8PqnHJxHbVEwiusM4PnyHEykFT',
    serumAsks: '998DHpQmViDq67vMFKYYXgaHs3CJ5YHEBQSoiwxCjsCW',
    serumEventQueue: 'CQxwLPMoqAwi5wcfkULzF6Fwh7cf4Aiz8tR6DY4NNCN1',
    serumCoinVaultAccount: '7X9oKH5LbvzYeXzEMwBssbkP2wJNxhAGDGZmDAQyNv4m',
    serumPcVaultAccount: 'Ex3pFp17g3NNgstLRR5mQYcSDMcak19zKG61C5JtW5Wj',
    serumVaultSigner: 'EY6yYbSyDTT7S5zrm94H8usLBRR4NE8YJ4hQJDmnxwUR',
    official: true
  }
]
