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
    ammAuthority: 'DhVpojXMTbZMuTaCgiiaFU7U8GvEEhnYo4G9BUdiEYGh',
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
  },
  {
    name: 'ETH-USDC',
    coin: { ...TOKENS.ETH },
    pc: { ...TOKENS.USDC },
    lp: { ...LP_TOKENS['ETH-USDC-V4'] },
    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
    ammId: '7DpTVfnPK8X4oQt215doZ23evnxUXRXBDX1g5sHBXyDr',
    ammAuthority: 'DhVpojXMTbZMuTaCgiiaFU7U8GvEEhnYo4G9BUdiEYGh',
    ammOpenOrders: '5BfNH4BvStTwGrvcQwYMKaEDidPHkm3daFfrkVSfupup',
    ammTargetOrders: '8x39Zo8FU8eaC7cbNEgRHw4Ycp4qc9MSr3CebbrBRAhL',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '2RF2cAAACsvft5g6SZU6yPidBQ8RptExAt3DXAhnyUvq',
    poolPcTokenAccount: '7D35qDSvfgcmVaMgZt4HH8R1ruDog5d2ZTS79Jgpa7yQ',
    poolWithdrawQueue: 'Bq2Ser7U5zrBvgUEPqn4T1dZL73pNVsq6y6Bvr4mPmkP',
    poolTempLpTokenAccount: 'E2k2ADWbM9DWZXSweeGZbqFVGw7taMJtDn6BdgPmUwH5',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'BkAraCyL9TTLbeMY3L1VWrPcv32DvSi5QDDQjik1J6Ac',
    serumBids: 'ETf3PZi9VaBsfpMU5e3SAn4SMjkaM6tyrn2Td9N2kSRx',
    serumAsks: '3pfYeG2GKSh8SSZJEEwjYqgaHwYkq5vvSDET2M33nQAf',
    serumEventQueue: 'F43gimmdvBPQoGA4eDxt2N2ooiYWHvQ8pEATrtsArKuC',
    serumCoinVaultAccount: 'AXBJBqj9m9bxLxjyDtfqt19WWna7jijDawjgRDFXXfB3',
    serumPcVaultAccount: 'Dh8w8pwvfQM5zYW1PzEFQNip8vwYVHYuZo53hFPRWTs6',
    serumVaultSigner: 'Cxs1KorP4Dwqbn1R9FgZyQ4pT51woNnkg2GxyQgZ3ude',
    official: true
  },
  {
    name: 'WSOL-USDC',
    coin: { ...TOKENS.WSOL },
    pc: { ...TOKENS.USDC },
    lp: { ...LP_TOKENS['WSOL-USDC-V4'] },
    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
    ammId: '384zMi9MbUKVUfkUdrnuMfWBwJR9gadSxYimuXeJ9DaJ',
    ammAuthority: 'DhVpojXMTbZMuTaCgiiaFU7U8GvEEhnYo4G9BUdiEYGh',
    ammOpenOrders: '2jRDSk3NonYr79KbPjQL9nwzAqwiFu8e5BKjUkpwM5mL',
    ammTargetOrders: '9qAqNs1KCmnR35kQnTZYMNjXWpzj5Ds8vGnFGptt7BHo',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'v77vV7yh5LuEKabKdNWhM8X5wpDhuPidjp7eucbHGfy',
    poolPcTokenAccount: 'CYv6PtaGV2D2gj6pD9io1PjJbUrcE7gyBmDethawZmMm',
    poolWithdrawQueue: '74XearZM2yiRJtYujkf2wgL1wXojp9mEefDJfrULUaPk',
    poolTempLpTokenAccount: '6P2ui2BoYQvciTEUzuz3CCv7Wwzof7WESoMSi4zhvPW2',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '5xWpt56U1NCuHoAEtpLeUrQcxDkEpNfScjfLFaRzLPgR',
    serumBids: '8ezpneRznTJNZWFSLeQvtPCagpsUVWA7djLSzqp3Hx4p',
    serumAsks: '8gJhxSwbLJkDQbqgzbJ6mDvJYnEVWB6NHWEN9oZZkwz7',
    serumEventQueue: '48be6VKEq86awgUjfvbKDmEzXr4WNR7hzDxfF6ZPptmd',
    serumCoinVaultAccount: 'EfwvntttcP253P1g8Jqo18Rywyb33deGe69Txn5LSgwQ',
    serumPcVaultAccount: 'HGsnYZr6yodSHXHNKdtprooS9XP4h19hrzXfgJLuA3MB',
    serumVaultSigner: '21YuRgN6iHgsucfXT6Yzo2dV7dzuAdz2vxExahY3MueT',
    official: true
  }
]
