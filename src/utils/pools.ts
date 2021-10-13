import { cloneDeep } from 'lodash-es'

// @ts-ignore
import SERUM_MARKETS from '@project-serum/serum/lib/markets.json'

import {
  LIQUIDITY_POOL_PROGRAM_ID_V2,
  LIQUIDITY_POOL_PROGRAM_ID_V3,
  LIQUIDITY_POOL_PROGRAM_ID_V4,
  SERUM_PROGRAM_ID_V2,
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
        pool.version === 4 &&
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
            pool.version === 4
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
  version = [3, 4]
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
  version = [4]
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

export function canWrap(fromMintAddress: string, toMintAddress: string): boolean {
  return fromMintAddress === TOKENS.WUSDT.mintAddress && toMintAddress === TOKENS.USDT.mintAddress
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

export function isOfficialMarket(marketAddress: string) {
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
    name: 'RAY-WUSDT',
    coin: { ...TOKENS.RAY },
    pc: { ...TOKENS.WUSDT },
    lp: { ...LP_TOKENS['RAY-WUSDT'] },

    version: 2,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V2,

    ammId: '4GygMmZgSoyfM3DEBpA8HvB8pooKWnTp232bKA17ptMG',
    ammAuthority: 'E8ddPSxjVUdW8wa5rs3gbscqoXQF1o7sJrkUMFU18zMS',
    ammOpenOrders: 'Ht7CkowEPZ5yHQpQQhzhgnN8W7Dq3Gw96Z3Ph8f3tVpY',
    ammTargetOrders: '3FGv6AuhfsxPBsPz4dXRA629W7UF2rW3NjHaihxUNcrB',
    ammQuantities: 'EwL1kwav5Z9dGrppUvusjPA4iJ4gVFsD3kGc5gCyAmMt',
    poolCoinTokenAccount: 'G2zmxUhRGn12fuePJy9QsmJKem6XCRnmAEkf8G6xcRTj',
    poolPcTokenAccount: 'H617sH2JNjMqPhRxsu43C8vDYfjZrFuoMEKdJyMu7V3t',
    poolWithdrawQueue: '2QiXRE5yAfTbTUT9BCfmkahmPPhsmWRox1V88iaJppEX',
    poolTempLpTokenAccount: '5ujWtJVhwzy8P3DJBYwLo4StxiFhJy5q6xHnMx7yrPPb',
    serumProgramId: SERUM_PROGRAM_ID_V2,
    serumMarket: 'HZyhLoyAnfQ72irTdqPdWo2oFL9zzXaBmAqN72iF3sdX',
    serumCoinVaultAccount: '56KzKfd9LvsY4QuMZcGxcGCd78ZBFQ7JcyMFwgqpXH12',
    serumPcVaultAccount: 'GLntTfM7RHeg5RuAuXcudT4NV7d4BGPrEFq7mmMxn29E',
    serumVaultSigner: '6FYUBnwRVxxYCv1kpad4FaFLJAzLYuevFWmpVp7hViTn',
    official: true
  },
  {
    name: 'RAY-SOL',
    coin: { ...TOKENS.RAY },
    pc: { ...NATIVE_SOL },
    lp: { ...LP_TOKENS['RAY-SOL'] },

    version: 2,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V2,

    ammId: '5Ytcen7ZQRWA8Dt4EGyVJngyqDL36ZKAGSTVKxbDGZPN',
    ammAuthority: '6LUFae1Ap44GVT9Dhw7NEqibFGSFxijdx4kzKVARsSuL',
    ammOpenOrders: '4JGNm7gSaZguaNJExYsFsL91x4GPtPyHpU7nrb5Jjygh',
    ammTargetOrders: '3rqYVkU3HkSj8XB9c2Y9e1LLPL6BjtNKr187qma6peCc',
    ammQuantities: 'BMTLKbmwzsKRxzL45eKgb5or8spaStLZxvycrTGGAhdK',
    poolCoinTokenAccount: 'CJukFFmH9FZ98uzFkUNgqRn8xUmSBTUETEDUMxZXk6p8',
    poolPcTokenAccount: 'DoZyq9uo3W4WWBZJvPCvfB5cCBFvjU9oq3DdYjNgJNRX',
    poolWithdrawQueue: '9FY699Gpyq4CcL8KFS4rEP76dAR3GQchQnUw7Xg1yaew',
    poolTempLpTokenAccount: 'A1BMmYPBXudTXzQExpqy1LrqEkKuoasfwCLjwigiSfRh',
    serumProgramId: SERUM_PROGRAM_ID_V2,
    serumMarket: 'HTSoy7NCK98pYAkVV6M6n9CTziqVL6z7caS3iWFjfM4G',
    serumCoinVaultAccount: '6dDDqzNsLx8u2Prk384Rs1jUxFPFQsKHne5oQxnf4kog',
    serumPcVaultAccount: 'AzxRBcig9mGTfdbUgEdKq48eiNZ2M4ynwQQH4Pvxbcy2',
    serumVaultSigner: 'FhTczYTxkXMyofPMDQFJGHxjcnPrjrEGQMexob4BVwXD',
    official: true
  },
  {
    name: 'LINK-WUSDT',
    coin: { ...TOKENS.LINK },
    pc: { ...TOKENS.WUSDT },
    lp: { ...LP_TOKENS['LINK-WUSDT'] },

    version: 2,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V2,

    ammId: 'Avkh3hMrjRRdGbm7EAmeXaJ1wWrbcwGWDGEroKq5wHJ8',
    ammAuthority: 'v1uTXS1hrW2DJkKPcQ3Dm7WwhYbGm7LhHoRE29QrHsJ',
    ammOpenOrders: 'HD7VPeJL2Sgict6oBPhb2s3DXvS9uieQmuw7KzhrfD3j',
    ammTargetOrders: 'DQ7un7pYeWWcBrt1mpucasb2CaepJQJ3Z3axM3PJ4pJ4',
    ammQuantities: '5KDL4Mtufuhe6Yof9nSPVjXgXgMFMHCXqKETzzbrsGzY',
    poolCoinTokenAccount: '7r5YjMLMnmoYkD1bkyYq374yiTBG9XwBHMwi5ZVDptre',
    poolPcTokenAccount: '6vMeQvJcC3VEGvtZ2TDXcShZerevxkqfW43yjX14vmSz',
    poolWithdrawQueue: '3tgn1n9wMGfryZu37skcMhUuwbNYFWTT5hurWGijikXZ',
    poolTempLpTokenAccount: 'EL8G5U28xw9djiEb9AZiEtBUtUdA5YtvaAHJu5hxipCK',
    serumProgramId: SERUM_PROGRAM_ID_V2,
    serumMarket: 'hBswhpNyz4m5nt4KwtCA7jYXvh7VmyZ4TuuPmpaKQb1',
    serumCoinVaultAccount: '8ZP84HpFb5k4paAgDGgXaMtne537LDFaxEWP89WKBPD1',
    serumPcVaultAccount: 'E3X7J1vyogGKZSySEo3WTS9GzipyTGVd5KKiXeFy1YHu',
    serumVaultSigner: '7bwfaV98FDNtWvgPMo7wY3nE7cE8tKfXkFAVzCxtkw6w',
    official: true
  },
  {
    name: 'ETH-WUSDT',
    coin: { ...TOKENS.ETH },
    pc: { ...TOKENS.WUSDT },
    lp: { ...LP_TOKENS['ETH-WUSDT'] },

    version: 2,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V2,

    ammId: '7PGNXqdhrpQoVS5uQs9gjT1zfY6MUzEeYHopRnryj7rm',
    ammAuthority: 'BFCEvcoD1xY1HK4psbC5wYXVXEvmgwg4wKggk89u1NWw',
    ammOpenOrders: '3QaSNxMuA9zEXazLdD2oJq7jUCfShgtvdaepuq1uJFnS',
    ammTargetOrders: '2exvd2T7yFYhBpi67XSrCVChVwMu23g653ELEnjvv8uu',
    ammQuantities: 'BtwQvRXNudUrazbJNhazajSZXEXbrf51ddBrmnje27Li',
    poolCoinTokenAccount: 'Gej1jXVRMdDKWSxmEZ78KJp5jruGJfR9dV3beedXe3BG',
    poolPcTokenAccount: 'FUDEbQKfMTfAaKS3dGdPEacfcC9bRpa5gmmDW8KNoUKp',
    poolWithdrawQueue: '4q3qXQsQSvzNE1fSyEh249vHGttKfQPJWM7A3AtffEX5',
    poolTempLpTokenAccount: '8i2cZ1UCAjVac6Z76GvQeRqZMKgMyuoZQeNSsjdtEgHG',
    serumProgramId: SERUM_PROGRAM_ID_V2,
    serumMarket: '5abZGhrELnUnfM9ZUnvK6XJPoBU5eShZwfFPkdhAC7o',
    serumCoinVaultAccount: 'Gwna45N1JGLmUMGhFVP1ELz8szVSajp12RgPqCbk46n7',
    serumPcVaultAccount: '8uqjWjNQiZvoieaGSoCRkGZExrqMpaYJL5huknCEHBcP',
    serumVaultSigner: '4fgnxw343cfYgcNgWvan8H6j6pNBskBmGX4XMbhxtFbi',
    official: true
  },
  {
    name: 'RAY-USDC',
    coin: { ...TOKENS.RAY },
    pc: { ...TOKENS.USDC },
    lp: { ...LP_TOKENS['RAY-USDC'] },

    version: 2,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V2,

    ammId: 'G2PVNAKAp17xtruKiMwT1S2GWNxptWZfqK6oYrFWCXWX',
    ammAuthority: '2XTg6m9wpuUyPNhHbi8DCGfyo58bpqmAmbujEEpUykSo',
    ammOpenOrders: 'HuGmmcqH6ULntUdfaCVrx4uzuhHME55Dczt793EweoTZ',
    ammTargetOrders: 'B3UeQ7SK9U9a5vP8fDtZ5gfDv6KRFSsNtawpoH7fziNW',
    ammQuantities: 'LEgCPaQhYv9YSnKXvHtc6HixwxdXe9mmvLCuTTxW2Yn',
    poolCoinTokenAccount: 'CvcqJtGdS9C1jKKFzgCi5p8qsnR5BZCohWvYMBJXcnJ8',
    poolPcTokenAccount: 'AiYm8jzb2WB4HTTFTHX1XCS7uVSQM5XWnMsure5sMeQY',
    poolWithdrawQueue: 'rYqeTgbeQvrDxeCg4kjqHA1X6rfjjLQvQTJeYLAgXq7',
    poolTempLpTokenAccount: '4om345FvSd9dqwFpy1SVmPFY9KzeUk8WmKiMzTbQxCQf',
    serumProgramId: SERUM_PROGRAM_ID_V2,
    serumMarket: 'Bgz8EEMBjejAGSn6FdtKJkSGtvg4cuJUuRwaCBp28S3U',
    serumCoinVaultAccount: 'BuMsEd7Ub6MtCCh1eT8pvL6zcBPbiifa1idVWa1BeE2R',
    serumPcVaultAccount: 'G7i7ZKx7rfMXGreLYzvR3ZZERgaGK7646nAgi8yjE8iN',
    serumVaultSigner: 'Aj6H2siiKsnAdAS5YVwuJPdXrHaLodsSyKs7ZiEtEZQN',
    official: true
  },
  {
    name: 'RAY-SRM',
    coin: { ...TOKENS.RAY },
    pc: { ...TOKENS.SRM },
    lp: { ...LP_TOKENS['RAY-SRM'] },

    version: 2,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V2,

    ammId: '3Y5dpV9DtwkhewxXpiVRscFeQR2dvsHovXQonkKbuDwB',
    ammAuthority: '7iND8ysb6fGUy8tx4C8AS51wbjvRjBxxSoaaL7t1yWXX',
    ammOpenOrders: '4QXs3bK3nyauMYutJjD8qGunFphAw944SsRdSD7n8oUj',
    ammTargetOrders: '5oaHFj1aqz9xLxYwByddXiUfbSwRZ3gmSJsgBF4no7Xx',
    ammQuantities: 'His9VQDWu55QdDUFu7tp5CpiCB1fMs6EDk5oC4uTaS4G',
    poolCoinTokenAccount: '5fHS778vozoDDYzzJz2xYG39whTzGGW6bF71GVxRyMXi',
    poolPcTokenAccount: 'CzVe191iLM2E31DBW7isXpZBPtcufRRsaxNRc8uShcEs',
    poolWithdrawQueue: 'BGmJSiCR7uuahrajWv1RgBJrbUjcQHREFfewqZPhf346',
    poolTempLpTokenAccount: '5aMZAZdab2iS62rfqPYd15AkQ7Y5zSSfz7WxHjV9ZRPw',
    serumProgramId: SERUM_PROGRAM_ID_V2,
    serumMarket: 'HSGuveQDXtvYR432xjpKPgHfzWQxnb3T8FNuAAvaBbsU',
    serumCoinVaultAccount: '6wXCSGvFvWLVoiRaXJheHoXec4LiJhiCWnxmQbYc9kv5',
    serumPcVaultAccount: 'G8KH5rE5EqeTpnLjTTNgKhVp47yRHCN28wH27vYFkWCR',
    serumVaultSigner: 'EXZnYg9QCzujDwm621N286d4KLAZiMwpUv64GdECcxbm',
    official: true
  },
  // v3
  {
    name: 'RAY-WUSDT',
    coin: { ...TOKENS.RAY },
    pc: { ...TOKENS.WUSDT },
    lp: { ...LP_TOKENS['RAY-WUSDT-V3'] },

    version: 3,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V3,

    ammId: 'FEAkBF4GhYKrYbxMa7tFcujvzxKrueC7xHT2NdyC9vxm',
    ammAuthority: 'CgvoNxNc93c91zYkPTAkBsYxjcAn8bRsnLM5ZxNKUpDj',
    ammOpenOrders: '2nzyzD5sdDKkP5pN5V5HGDmacpQJPEkMHqA1vopuRupY',
    ammTargetOrders: 'BYCxxFuPB6MjLmpBoA7XMXHKk87LP1V62HPFh5BaobBd',
    ammQuantities: 'H8P2YR1MTFgcRKnGHYWk6Aitqf72aXCN3ZKM29mRQqqe',
    poolCoinTokenAccount: 'DTQTBTSy3tiy7kZZWgaczWxs9snnTVTi8DBYBzjaVwbj',
    poolPcTokenAccount: 'Bk2G4zhjB7VmRsaBwh2ijPwq6tavMHALEq4guogxsosT',
    poolWithdrawQueue: '9JnsD9Pm8YQhMMAKBV7RgPcdVnRTuwJW5PXdWx7T2K8C',
    poolTempLpTokenAccount: 'FfNM2Szi8xKWj3SUAjYpsHKuyQsd9NuW8ARkMqyNYPiJ',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'C4z32zw9WKaGPhNuU54ohzrV4CE1Uau3cFx6T8RLjxYC',
    serumCoinVaultAccount: '6hCHQufQsxsHDkHYNmw79WvfsAGXvomdZnkzWN7MYz8f',
    serumPcVaultAccount: '7qM644QyBzMvqLLiEYhJksyPzwUpuQj44EodLb1va8aG',
    serumVaultSigner: '2hzqYES4AcwVkuMdNsNNqi1jqjfKSyL2BNus4kimVXNk',
    official: true
  },
  {
    name: 'RAY-USDC',
    coin: { ...TOKENS.RAY },
    pc: { ...TOKENS.USDC },
    lp: { ...LP_TOKENS['RAY-USDC-V3'] },

    version: 3,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V3,

    ammId: '5NMFfbccSpLdre6anA8P8vVy35n2a52AJiNPpQn8tJnE',
    ammAuthority: 'Bjhs6Mrvxr34WAKLog2tiU77VMvwNZcrJ1g8UyGoic3e',
    ammOpenOrders: '3Xq4vBd5EWs45v9YwG1Mpfr8Xjng23pDovVUbnAaPce9',
    ammTargetOrders: '7ccgnj4dTuVTaQCwbECDc3GrKrQpuGNA4cETiSNo2cCN',
    ammQuantities: '6ifgXdNx8zKd4bseuya6FEKb49VWx1dDvVTC8f7kc361',
    poolCoinTokenAccount: 'DujWhSxnwqFd3TrLfScyUhJ3FdoaHrmoiVE6kU4ETQyL',
    poolPcTokenAccount: 'D6F5CDaLDCHHWfE8kMLbMNAFULXLfM572AGDx2a6KeXc',
    poolWithdrawQueue: '76QQPxNT422AL8w5RhssRFQ3gUGy7Y23YxV9BRWqs44Q',
    poolTempLpTokenAccount: '2Q9PevhtVioNFyFFrbkzcGxn1QmzFph5Cpdy1FKe3nYJ',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '2xiv8A5xrJ7RnGdxXB42uFEkYHJjszEhaJyKKt4WaLep',
    serumCoinVaultAccount: 'GGcdamvNDYFhAXr93DWyJ8QmwawUHLCyRqWL3KngtLRa',
    serumPcVaultAccount: '22jHt5WmosAykp3LPGSAKgY45p7VGh4DFWSwp21SWBVe',
    serumVaultSigner: 'FmhXe9uG6zun49p222xt3nG1rBAkWvzVz7dxERQ6ouGw',
    official: true
  },
  {
    name: 'RAY-SRM',
    coin: { ...TOKENS.RAY },
    pc: { ...TOKENS.SRM },
    lp: { ...LP_TOKENS['RAY-SRM-V3'] },

    version: 3,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V3,

    ammId: 'EGhB6FdyHtJPbPMRoBC8eeUVnVh2iRgnQ9HZBKAw46Uy',
    ammAuthority: '3gSVizZA2BFsWAfW4j1wBSQiQE9Xn3Ds518jPGve31se',
    ammOpenOrders: '6CVRtzecMaPZ1pdfT2ZzJ1qf89yuFsD7MKYGwvjYsy6w',
    ammTargetOrders: 'CZYbET8zweaWtWLnFJnt5nouCE9snQxFi7zrTCGYycL1',
    ammQuantities: '3NGwJe5bueAgLp6fMrY5HV2rpHF9xh3HhH97S6LrMLPo',
    poolCoinTokenAccount: 'Eg6sR9H28cFaek5DVdgxxDcRKKbS85XvCFEzzkdmYNhq',
    poolPcTokenAccount: '8g2nHtayS2JnRxaAY5ugsYC8CwiZutQrNWA9j2oH8UVM',
    poolWithdrawQueue: '7Yc1P9nyev1uoLtLJu15o5vQugvfXoHcde6x2mm1HeED',
    poolTempLpTokenAccount: '5WHmdyH7CgiezSGcD9PVMYth9hMEWETV1M64zmZ9UT5o',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'Cm4MmknScg7qbKqytb1mM92xgDxv3TNXos4tKbBqTDy7',
    serumCoinVaultAccount: '5QDTh4Bpz4wruWMfayMSjUxRgDvMzvS2ifkarhYtjS1B',
    serumPcVaultAccount: '76CofnHCvo5wEKtxNWfLa2jLDz4quwwSHFMne6BWWqx',
    serumVaultSigner: 'AorjCaSV1L6NGcaFZXEyUrmbSqY3GdB3YXbQnrh85v6F',
    official: true
  },
  {
    name: 'RAY-SOL',
    coin: { ...TOKENS.RAY },
    pc: { ...NATIVE_SOL },
    lp: { ...LP_TOKENS['RAY-SOL-V3'] },

    version: 3,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V3,

    ammId: 'HeRUVkQyPuJAPFXUkTaJaWzimBopWbJ54q5DCMuPpBY4',
    ammAuthority: '63Cw8omVwSQGDPP5nff3a9DakvL8ruaqqEpbQ4uDwPYf',
    ammOpenOrders: 'JQEY8R9frhxuvcsewGfgkCVdGWztpHLx4P9zmTAsZFM',
    ammTargetOrders: '7mdd7oqHqULV1Yxaaf5GW52FKFbJz78sZj9ePcfmL5Fi',
    ammQuantities: 'HHU2THd3tocaYagZh826KCvLDv7QNWLGKjaJKmtdtTQM',
    poolCoinTokenAccount: 'Fy6SnHwAkxoGMhUH2cLu2biqAnHmaAwFDDww9k6gq5ws',
    poolPcTokenAccount: 'GoRindEPofTJ3axsonTnbyf7cFwdFdG1A3MG9ENyBZsn',
    poolWithdrawQueue: '3bUwc23vXP9L6XBjVCvG9Mruuu7GRkcfmyXuaH6HdmW2',
    poolTempLpTokenAccount: '9dALTRnKoLmfMn3hPyQoizmSJ5CZSLMLdJy1XMocwXMU',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'C6tp2RVZnxBPFbnAsfTjis8BN9tycESAT4SgDQgbbrsA',
    serumCoinVaultAccount: '6U6U59zmFWrPSzm9sLX7kVkaK78Kz7XJYkrhP1DjF3uF',
    serumPcVaultAccount: '4YEx21yeUAZxUL9Fs7YU9Gm3u45GWoPFs8vcJiHga2eQ',
    serumVaultSigner: '7SdieGqwPJo5rMmSQM9JmntSEMoimM4dQn7NkGbNFcrd',
    official: true
  },
  {
    name: 'RAY-ETH',
    coin: { ...TOKENS.RAY },
    pc: { ...TOKENS.ETH },
    lp: { ...LP_TOKENS['RAY-ETH-V3'] },

    version: 3,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V3,

    ammId: 'FrDSSYXGcrJc7ZwY5KMfTmzDfrzjvqdxmSinJFwxLr14',
    ammAuthority: '5Wbe7MYpw8y9iroZKVN8b3fLZNeBUbRKetQwULicDpw2',
    ammOpenOrders: 'ugyjEMZLumc1M5c7MNXayMYmxpnuMRYiT4aPwfNb6bq',
    ammTargetOrders: '2M6cT1GvGTiovTj7bRsZBeLMeJzjYoDTHNiTRVJqRFeM',
    ammQuantities: '5YcH7AwHNLdDJd2K6YmZAxqqvGYjgE59NaYAh3pkgVd7',
    poolCoinTokenAccount: 'ENjXaFNDiLTh44Gs89ZtfUH2i5MGLLkfYbSY7TmP4Du3',
    poolPcTokenAccount: '9uzWJD2WqJYSmB6UHSyPMskFGoP5L6hB7FxqUdYP4Esm',
    poolWithdrawQueue: 'BkrxkmYs1JViXbiBJfnwgns75CJd9yHcqUkFXB8Bz7oB',
    poolTempLpTokenAccount: 'CKZ7NMunTef18yKHuizRoNZedzTdDEFwYRUgB3dFDcrd',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '6jx6aoNFbmorwyncVP5V5ESKfuFc9oUYebob1iF6tgN4',
    serumCoinVaultAccount: 'EVVtYo4AeCbmn2dYS1UnhtfjpzCXCcN26G1HmuHwMo7w',
    serumPcVaultAccount: '6ZT6KwvjLnJLpFdVfiRD9ifVUo4gv4MUie7VvPTuk69v',
    serumVaultSigner: 'HXbRDLcX2FyqWJY95apnsTgBoRHyp7SWYXcMYod6EBrQ',
    official: true
  },
  // v4
  {
    name: 'FIDA-RAY',
    coin: { ...TOKENS.FIDA },
    pc: { ...TOKENS.RAY },
    lp: { ...LP_TOKENS['FIDA-RAY-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '2dRNngAm729NzLbb1pzgHtfHvPqR4XHFmFyYK78EfEeX',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'DUVSNpoCNyGDP9ef9gJC5Dg53khxTyM1pQrKVetmaW8R',
    ammTargetOrders: '89HcsFvCQaUdorVF712EhNhecvVM7Dk6XAdPbaykB3q2',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '6YeEo7ZTRHotXd89JTBJKRXERBjv3N3ofgsgJ4FoAa39',
    poolPcTokenAccount: 'DDNURcWy3CU3CpkCnDoGXwQAeCg1mp2CC8WqvwHp5Fdt',
    poolWithdrawQueue: 'H8gZ2f4hp6LfaszDN5uHAeDwZ1qJ4M4s2A59i7nMFFkN',
    poolTempLpTokenAccount: 'Bp7LNZH44vecbv69kY35bjmsTjboGbEKy62p7iRT8az',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '9wH4Krv8Vim3op3JAu5NGZQdGxU8HLGAHZh3K77CemxC',
    serumBids: 'E2FEkqPVcQZgRaE7KabcHGbpNkpycnvVZMan2MPNGKeM',
    serumAsks: '5TXqn1N2kpCWWV4AcXtFYJw8WqLrXP62qenxiSfhxJiD',
    serumEventQueue: '58qMcacA2Qk4Tc4Rut3Lnao91JvvWJJ26f5kojKnMRen',
    serumCoinVaultAccount: 'A2SMhqA1kMTudVeAeWdzCaYYeG6Dts19iEZd4ZQQAcUm',
    serumPcVaultAccount: 'GhpccNwfein8qP6uhWnP4vuRva1iLivuQQHUTM7tW58r',
    serumVaultSigner: 'F7VdEoWQGmdFK35SD21wAbDWtnkVpcrxM3DPVnmG8Q3i',
    official: true
  },
  {
    name: 'OXY-RAY',
    coin: { ...TOKENS.OXY },
    pc: { ...TOKENS.RAY },
    lp: { ...LP_TOKENS['OXY-RAY-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'B5ZguAWAGC3GXVtJZVfoMtzvEvDnDKBPCevsUKMy4DTZ',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'FVb13WU1W1vFouhRXZWVZWGkQdK5jo35EnaCrMzFqzyd',
    ammTargetOrders: 'FYPP5v8SLHPPcivgBJPE9FgrN6o2QVMB627n3XcZ8rCS',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '6ttf7G7FR9GWqxiyCLFNaBTvwYzTLPdbbrNcRvShaqtS',
    poolPcTokenAccount: '8orrvb6rHB776KbQmszcxPH44cZHdCTYC1fr2a3oHufC',
    poolWithdrawQueue: '4Q9bNJsWreAGhkwhKYL7ApyhEBuwNxiPkcEQNmUjQGHZ',
    poolTempLpTokenAccount: 'E12sRQvEHArCULaJu8xppoJKQgJsuDuwPVJZJRrUKYFu',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'HcVjkXmvA1815Es3pSiibsRaFw8r9Gy7BhyzZX83Zhjx',
    serumBids: 'DaGRz2TAdcVcPwPmYF5JJ7d7kPWvLN68vuBTTMwnoM3T',
    serumAsks: '3ZRtPBQVcjCpVmCt4xPPeJJiUnDDbrc5jommVHGsDLnT',
    serumEventQueue: 'C5SGEXUCmN1LxmxapPn2XaHX1FF7fAuQG5Wu4yuu8VK6',
    serumCoinVaultAccount: 'FcDWM8eKUEny2wxopDMrZqgmPr3Tmoen9Dckh3MoVX9N',
    serumPcVaultAccount: '9ya4Hv4XdzntjiLwxpgqnX8eP4MtFf8YWEssF6C5Pqhq',
    serumVaultSigner: 'Bf9MhS6hwAGSWVJ4uLWKSU6fqPAEroRsHX6ithEjGXiG',
    official: true
  },
  {
    name: 'MAPS-RAY',
    coin: { ...TOKENS.MAPS },
    pc: { ...TOKENS.RAY },
    lp: { ...LP_TOKENS['MAPS-RAY-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '5VyLSjUvaRxsubirbvbfJMbrKZRx1b7JZzuCAfyqgimf',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'HViBtwESRNKLZY7qLQxP68b5vLdUQa1XMAKz19LbSHjx',
    ammTargetOrders: '8Cwm1Z75hQdUpFUxCuoWmWBLcAaZvKMAn2xKeuotC4eC',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '6rYv6kLfhAVKZw1xN2S9NWNgp8EfUVvYKi1Hgzd5x9XE',
    poolPcTokenAccount: '8HfvN4VyAQjX6MhziRxMg5LjbMh9Fw889yf3sDgrXakw',
    poolWithdrawQueue: 'HnzkiYgZg22ZaQGdeTHiCgJaoW138CLqCb8tr6QJFkU4',
    poolTempLpTokenAccount: 'DnTQwA9PdwLSibsiQFZ35yJJDNJfG9fNbHspPmb8v8TQ',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '7Q4hee42y8ZGguqKmwLhpFNqVTjeVNNBqhx8nt32VF85',
    serumBids: 'J9ZmfF71eMMzisvaYW12EK87UaopZ4hgND2nr61YwmKw',
    serumAsks: '9ah4Mewrh841gmfaX1v1wCByHU3rbCuUmWUgt2TBAfnb',
    serumEventQueue: 'EtimVRtnRUAfv9tXVAHpGCGvtYezcpmzbkwZLuwWAYqe',
    serumCoinVaultAccount: '2zriJ5sVApLD9TC9PxbXK41AkVCQBaRreeXtGx7AGE41',
    serumPcVaultAccount: '2qAKnjzokKR4sL6Xtp1nZYKXTmsraXW9CL3HuBZx3qpA',
    serumVaultSigner: 'CH76NgZMpUJ8QQqVNpjyCSpQmZBNZLXW6a5vDHj3aUUC',
    official: true
  },
  {
    name: 'KIN-RAY',
    coin: { ...TOKENS.KIN },
    pc: { ...TOKENS.RAY },
    lp: { ...LP_TOKENS['KIN-RAY-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '6kmMMacvoCKBkBrqssLEdFuEZu2wqtLdNQxh9VjtzfwT',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'DiP4F6FTR5jiTar8fwuwRVuYop5wYRqy2EjbiKTXPrHw',
    ammTargetOrders: '2ak4VVyS19sVESvvBuPZRMAhvY4vVCZCxeELYAybA7wk',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 's7LP6qptF1wufA9neYhekmVPqhav8Ak85AV5ip5h8wK',
    poolPcTokenAccount: '9Q1Xs1s8tCirX3Ky3qo9UjvSqSoGinZvWaUMFXY5r2HF',
    poolWithdrawQueue: 'DeHaCJ8KL5uwBGenkUwa39JyhacxPDqDqHAp5HLqgd1i',
    poolTempLpTokenAccount: 'T2acWsGDQ4ZRXs4WXVi7vCeH4TxzgjcL6s14xFNuT26',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'Fcxy8qYgs8MZqiLx2pijjay6LHsSUqXW47pwMGysa3i9',
    serumBids: 'HKWdSptDBeXTURKpQQ2AGPmT2B9LGNBVteq44UzDxKBh',
    serumAsks: '2ceQrRfuNWL8kR2fockPo7C31uDeTyXTs4EyA28FD2kg',
    serumEventQueue: 'GwnDyxFnHSnzDdu8dom3vydtTpSu443oZPKepXww5zNB',
    serumCoinVaultAccount: '2sCJ5YZtwEbpXiw7HSXVx8Qot8hwyCpXNEkswZCssi2J',
    serumPcVaultAccount: 'H6B59E77WZt4JLfaXdZQBKdATRcWaKy5N6Ki1ZRo1Mcv',
    serumVaultSigner: '5V7FCcvmGtqkMJXHiTSeo61MS5LSMUFK1Esr5kn46cEv',
    official: true
  },
  {
    name: 'RAY-USDT',
    coin: { ...TOKENS.RAY },
    pc: { ...TOKENS.USDT },
    lp: { ...LP_TOKENS['RAY-USDT-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'DVa7Qmb5ct9RCpaU7UTpSaf3GVMYz17vNVU67XpdCRut',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '7UF3m8hDGZ6bNnHzaT2YHrhp7A7n9qFfBj6QEpHPv5S8',
    ammTargetOrders: '3K2uLkKwVVPvZuMhcQAPLF8hw95somMeNwJS7vgWYrsJ',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '3wqhzSB9avepM9xMteiZnbJw75zmTBDVmPFLTQAGcSMN',
    poolPcTokenAccount: '5GtSbKJEPaoumrDzNj4kGkgZtfDyUceKaHrPziazALC1',
    poolWithdrawQueue: '8VuvrSWfQP8vdbuMAP9AkfgLxU9hbRR6BmTJ8Gfas9aK',
    poolTempLpTokenAccount: 'FBzqDD1cBgkZ1h6tiZNFpkh4sZyg6AG8K5P9DSuJoS5F',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'teE55QrL4a4QSfydR9dnHF97jgCfptpuigbb53Lo95g',
    serumBids: 'AvKStCiY8LTp3oDFrMkiHHxxhxk4sQUWnGVcetm4kRpy',
    serumAsks: 'Hj9kckvMX96mQokfMBzNCYEYMLEBYKQ9WwSc1GxasW11',
    serumEventQueue: '58KcficuUqPDcMittSddhT8LzsPJoH46YP4uURoMo5EB',
    serumCoinVaultAccount: '2kVNVEgHicvfwiyhT2T51YiQGMPFWLMSp8qXc1hHzkpU',
    serumPcVaultAccount: '5AXZV7XfR7Ctr6yjQ9m9dbgycKeUXWnWqHwBTZT6mqC7',
    serumVaultSigner: 'HzWpBN6ucpsA9wcfmhLAFYqEUmHjE9n2cGHwunG5avpL',
    official: true
  },
  {
    name: 'SOL-USDC',
    coin: { ...NATIVE_SOL },
    pc: { ...TOKENS.USDC },
    lp: { ...LP_TOKENS['SOL-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'HRk9CMrpq7Jn9sh7mzxE8CChHG8dneX9p475QKz4Fsfc',
    ammTargetOrders: 'CZza3Ej4Mc58MnxWA385itCC9jCo3L1D7zc3LKy1bZMR',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'DQyrAcCrDXQ7NeoqGgDCZwBvWDcYmFCjSb9JtteuvPpz',
    poolPcTokenAccount: 'HLmqeL62xR1QoZ1HKKbXRrdN1p3phKpxRMb2VVopvBBz',
    poolWithdrawQueue: 'G7xeGGLevkRwB5f44QNgQtrPKBdMfkT6ZZwpS9xcC97n',
    poolTempLpTokenAccount: 'Awpt6N7ZYPBa4vG4BQNFhFxDj4sxExAA9rpBAoBw2uok',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '9wFFyRfZBsuAha4YcuxcXLKwMxJR43S7fPfQLusDBzvT',
    serumBids: '14ivtgssEBoBjuZJtSAPKYgpUK7DmnSwuPMqJoVTSgKJ',
    serumAsks: 'CEQdAFKdycHugujQg9k2wbmxjcpdYZyVLfV9WerTnafJ',
    serumEventQueue: '5KKsLVU6TcbVDK4BS6K1DGDxnh4Q9xjYJ8XaDCG5t8ht',
    serumCoinVaultAccount: '36c6YqAwyGKQG66XEp2dJc5JqjaBNv7sVghEtJv4c7u6',
    serumPcVaultAccount: '8CFo8bL8mZQK8abbFyypFMwEDd8tVJjHTTojMLgQTUSZ',
    serumVaultSigner: 'F8Vyqk3unwxkXukZFQeYyGmFfTG3CAX4v24iyrjEYBJV',
    official: true
  },
  {
    name: 'YFI-USDC',
    coin: { ...TOKENS.YFI },
    pc: { ...TOKENS.USDC },
    lp: { ...LP_TOKENS['YFI-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '83xxjVczDseaCzd7D61BRo7LcP7cMXut5n7thhB4rL4d',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'DdBAps8e64hpjdWqAAHTThcVFz8mQ6WU2h6s1Kjgb9vk',
    ammTargetOrders: '8BFicQN1AKaVbf1KNoUieULun1bvpdMxsyjrgC15acM6',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'HhhqmQvx2GMQ6SRQh6nZ1A4C5KjCFLQ6yga1ZXDzRJ92',
    poolPcTokenAccount: '4J4Y6qkF9yzxz1EsZYTSqviMz3Lo1VHx9ViCUoJph167',
    poolWithdrawQueue: 'FPkMHzDo46vzy1eW9FuQFz7TdAp1MNCkZFgKxrHiuh3W',
    poolTempLpTokenAccount: 'DuTzisr6Z2D37yTyY9E4jPMCxhQk3HCNxaL1zKqvwRjR',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '7qcCo8jqepnjjvB5swP4Afsr3keVBs6gNpBTNubd1Kr2',
    serumBids: '8L8kU4H9Ah3fgbczYKFU9WUR1HgAghso1kKwWAPrmLfS',
    serumAsks: '4M9kDzMGsNHT3k31i54wf2ceeApvx3224pLbhDvnoj2s',
    serumEventQueue: '6wKPYgydqNrmcXwbfPeNwkzXmjKMgkUhQcGoGYrm9fS4',
    serumCoinVaultAccount: '2N59Aig7wqhfffAUjMit7T9tk4FmSRzmByMD7mncTesq',
    serumPcVaultAccount: 'FcDTYePeh2KJts4nroCghgceiJmSBRgq2Xd3PfpernZm',
    serumVaultSigner: 'HDdQQNNf9EoCGWhWUgkQHRJVbG3huDXs2z6Fcow3grCr',
    official: true
  },
  {
    name: 'SRM-USDC',
    coin: { ...TOKENS.SRM },
    pc: { ...TOKENS.USDC },
    lp: { ...LP_TOKENS['SRM-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '8tzS7SkUZyHPQY7gLqsMCXZ5EDCgjESUHcB17tiR1h3Z',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'GJwrRrNeeQKY2eGzuXGc3KBrBftYbidCYhmA6AZj2Zur',
    ammTargetOrders: '26LLpo8rscCpMxyAnJsqhqESPnzjMGiFdmXA4eF2Jrk5',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'zuLDJ5SEe76L3bpFp2Sm9qTTe5vpJL3gdQFT5At5xXG',
    poolPcTokenAccount: '4usvfgPDwXBX2ySX11ubTvJ3pvJHbGEW2ytpDGCSv5cw',
    poolWithdrawQueue: '7c1VbXTB7Xqx5eQQeUxAu5o6GHPq3P1ByhDsnRRUWYxB',
    poolTempLpTokenAccount: '2sozAi6zXDUCCkpgG3usphzeCDm4e2jTFngbm5atSdC9',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'ByRys5tuUWDgL73G8JBAEfkdFf8JWBzPBDHsBVQ5vbQA',
    serumBids: 'AuL9JzRJ55MdqzubK4EutJgAumtkuFcRVuPUvTX39pN8',
    serumAsks: '8Lx9U9wdE3afdqih1mCAXy3unJDfzSaXFqAvoLMjhwoD',
    serumEventQueue: '6o44a9xdzKKDNY7Ff2Qb129mktWbsCT4vKJcg2uk41uy',
    serumCoinVaultAccount: 'Ecfy8et9Mft9Dkavnuh4mzHMa2KWYUbBTA5oDZNoWu84',
    serumPcVaultAccount: 'hUgoKy5wjeFbZrXDW4ecr42T4F5Z1Tos31g68s5EHbP',
    serumVaultSigner: 'GVV4ZT9pccwy9d17STafFDuiSqFbXuRTdvKQ1zJX6ttX',
    official: true
  },
  {
    name: 'FTT-USDC',
    coin: { ...TOKENS.FTT },
    pc: { ...TOKENS.USDC },
    lp: { ...LP_TOKENS['FTT-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '4C2Mz1bVqe42QDDTyJ4HFCFFGsH5YDzo91Cen5w5NGun',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '23WS5XY3srvBtnP6hXK64HAsXTuj1kT7dd7srjrJUNTR',
    ammTargetOrders: 'CYbPm6BCkMyX8NnnS7AoCUkpxHVwYyxvjQWwZLsrFcLR',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '4TaBaR1ZgHNuQM3QNHnjJdAT4Sws9cz46MtVWVebg7Ax',
    poolPcTokenAccount: '7eDiHvsfcZf1VFC2sUDJwr5EMMr66TpQ2nmAreUjoASV',
    poolWithdrawQueue: '36Aa83kffwBuEP7AqNU1w5c9oB9kLxmR4FMfadXfjNbJ',
    poolTempLpTokenAccount: '8hdJm5bvgXVtb5LA18QgGeKxnXBcp3cYKwRz8vb3fV44',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '2Pbh1CvRVku1TgewMfycemghf6sU9EyuFDcNXqvRmSxc',
    serumBids: '9HTDV2r7cQBUKL3fgcJZCUfmJsKA9qCP7nZAXyoyaQou',
    serumAsks: 'EpnUJCMCQNZi45nCBoNs6Bugy67Kj3bCSTLYPfz6jkYH',
    serumEventQueue: '2XHxua6ZaPKpCGUNvSvTwc9teJBmexp8iMWCLu4mtzGb',
    serumCoinVaultAccount: '4LXjM6rptNvhBZTcWk4AL49oF4oA8AH7D4CV6z7tmpX3',
    serumPcVaultAccount: '2ycZAqQ3YNPfBZnKTbz2FqPiV7fmTQpzF95vjMUekP5z',
    serumVaultSigner: 'B5b9ddFHrjndUieLAKkyzB1xmq8sNqGGZPmbyYWPzCyu',
    official: true
  },
  {
    name: 'BTC-USDC',
    coin: { ...TOKENS.BTC },
    pc: { ...TOKENS.USDC },
    lp: { ...LP_TOKENS['BTC-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '6kbC5epG18DF2DwPEW34tBy5pGFS7pEGALR3v5MGxgc5',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'L6A7qW935i2HgaiaRx6xNGCGQfFr4myFU51dUSnCshd',
    ammTargetOrders: '6DGjaczWfFthTYW7oBk3MXP2mMwrYq86PA3ki5YF6hLg',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'HWTaEDR6BpWjmyeUyfGZjeppLnH7s8o225Saar7FYDt5',
    poolPcTokenAccount: '7iGcnvoLAxthsXY3AFSgkTDoqnLiuti5fyPNm2VwZ3Wz',
    poolWithdrawQueue: '8g6jrVU7E7eghT3FQa7uPbwHUHwHHLVCEjBh94pA1NVk',
    poolTempLpTokenAccount: '2Nhg2RBqHBx7R74VSEAbfSF8Kmi1x3HxyzCu3oFgpRJJ',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'A8YFbxQYFVqKZaoYJLLUVcQiWP7G2MeEgW5wsAQgMvFw',
    serumBids: '6wLt7CX1zZdFpa6uGJJpZfzWvG6W9rxXjquJDYiFwf9K',
    serumAsks: '6EyVXMMA58Nf6MScqeLpw1jS12RCpry23u9VMfy8b65Y',
    serumEventQueue: '6NQqaa48SnBBJZt9HyVPngcZFW81JfDv9EjRX2M4WkbP',
    serumCoinVaultAccount: 'GZ1YSupuUq9kB28kX9t1j9qCpN67AMMwn4Q72BzeSpfR',
    serumPcVaultAccount: '7sP9fug8rqZFLbXoEj8DETF81KasaRA1fr6jQb6ScKc5',
    serumVaultSigner: 'GBWgHXLf1fX4J1p5fAkQoEbnjpgjxUtr4mrVgtj9wW8a',
    official: true
  },
  {
    name: 'SUSHI-USDC',
    coin: { ...TOKENS.SUSHI },
    pc: { ...TOKENS.USDC },
    lp: { ...LP_TOKENS['SUSHI-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '5dHEPTgvscKkAc54R77xUeGdgShdG9Mf6gJ9bwBqyb3V',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '7a8WXaxsvDV9CjSxgSpJG8LZgdxmSps1ehvtgQj2qt4j',
    ammTargetOrders: '9f5b3uy3hQutS6pka2GxcSoKjvKaTcB1ivkj1GK43UAV',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'B8vMKgzKHkapzdDu1jW76ALFvVYzHGGKhR5Afz3A4mZd',
    poolPcTokenAccount: 'Hsxi4jvmszcMaWfU3tk98fQa9pVXtRktfKvKJ7rKBQYi',
    poolWithdrawQueue: 'AgEspvUPUuaTqyJTjZMCAW3zTuxQBSaU17GhLJoc6Jad',
    poolTempLpTokenAccount: 'BHLDqVcYUrAwv8RvDUQ76BQDQzvb2yftFN8UccpA2stx',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'A1Q9iJDVVS8Wsswr9ajeZugmj64bQVCYLZQLra2TMBMo',
    serumBids: 'J8JVRuBojWcHFRGosQKRdDtzxwux8fy2dwfk42Z3dCaf',
    serumAsks: '6DScSyKZKBi9cXhD3mRkTkpsxrhw6HABFxebsteCP1zU',
    serumEventQueue: 'Hvpz2Cv2LgWUfTtdfjpnefYrjQuaw8gGjKoDAeGxzrwE',
    serumCoinVaultAccount: 'BJfPQ2iKTJknyWo2wtCVEpRGWVt8sgpvmSQVNwLioQrk',
    serumPcVaultAccount: '2UN8qfXzoUDAxZMX1KqKut93frkt5hFREL8xcw6Hgtsg',
    serumVaultSigner: 'uWhVkK44yR6V5XywVom4oWzDQACSPYHhNjkwXprtUij',
    official: true
  },
  {
    name: 'TOMO-USDC',
    coin: { ...TOKENS.TOMO },
    pc: { ...TOKENS.USDC },
    lp: { ...LP_TOKENS['TOMO-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '8mBJC9qdPNDyrpAbrdwGbBpEAjPqwtvZQVmbnKFXXY2P',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'H11WJQWj51KyYU5gdrnsXvpaYZM6ZLGULV93VbTmvaBL',
    ammTargetOrders: '5E9x2QRpTM2oTtwb62C4rDYR8nJZxN8NFhAtnr2uYFKt',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '5swtuQhJQFid8uMd3DsegoxFKXVS8WoiiB3t9Pos9UHj',
    poolPcTokenAccount: 'Eqbux46eaW4aZiuy6VUX6z7MJ2TsszeSA7TPnpdw3jVf',
    poolWithdrawQueue: 'Hwtv6M9iTJc8SH49WjQx5rbRwzAryGm8f1NSQDmnY2iq',
    poolTempLpTokenAccount: '7YXJQ4rM59A69ow3M21MKbWEEKHbNeZQ1XFESVnbwEPx',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '8BdpjpSD5n3nk8DQLqPUyTZvVqFu6kcff5bzUX5dqDpy',
    serumBids: 'DriSFYDLxWCEHcnFVaxKu2NrsWGB2htWhD1wkp39qxwU',
    serumAsks: 'jd3YYp9WqjzyPxhBvj4ixa4DY3bCG1b74VquM4oCUbH',
    serumEventQueue: 'J82jqHzNAzVYs9ZV3zuRgzRKuu1nGDFMrzJwdxvipjXk',
    serumCoinVaultAccount: '9tQtmWT3LCbVEoHFK5WK93wmDXv4us5s7NRYhficg9ih',
    serumPcVaultAccount: 'HRFqUnxuegNbAf2auxqRwECyDijkVGDw25BCJkf5ohM5',
    serumVaultSigner: '7i7rf8LANeECyi8TAwwLTyvfiVUo4x12iJtKeeA6eG53',
    official: true
  },
  {
    name: 'LINK-USDC',
    coin: { ...TOKENS.LINK },
    pc: { ...TOKENS.USDC },
    lp: { ...LP_TOKENS['LINK-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'Hr8i6MAm4W5Lwb2fB2CD44A2t3Ag3gGc1rmd6amrWsWC',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'G4WdXwbczwDSs6iQmYt1F3sHDhfL6aD2uBkbAoMaaTt4',
    ammTargetOrders: 'Hf3g2Q63UPSLFSCKZBPJvjVVZxVr83rXm1xWR7yC6spn',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '2ueuL35kQShG1ebZz3Cov4ug9Ex6xVXx4Fc4ZKvxFqMz',
    poolPcTokenAccount: '66JxeTwodpafkYLPYYAFoVoTh6ukNYoHvtwMMSzSPBCb',
    poolWithdrawQueue: 'AgVo29AiDosdiXysfwMj8bF2AyD1Nvmn971x8PLwaNAA',
    poolTempLpTokenAccount: '58EPUPaefpjDxUppc4oyDeDGc9n7sUo7vapinKXigbd',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '3hwH1txjJVS8qv588tWrjHfRxdqNjBykM1kMcit484up',
    serumBids: 'GhmGNpJhGDz6zhmJ2kskmETbX9SGxhstRsmUejMXC24t',
    serumAsks: '83KiGivH1w4SiSK9YoN9WZrTSmtwveuCUd1nuZ9AFd2V',
    serumEventQueue: '9ZZ8eGhTEYK3uBNaFWSYo6ugLD6UVvudxpFXff7XSrmx',
    serumCoinVaultAccount: '9BswoEnX3SN7YUnRujZa5ygiL8AXVHXE4xqp8USX4QSY',
    serumPcVaultAccount: '9TibPFxakkdogUYizRhj9Av92fxuY2HxS3nrmme81Sma',
    serumVaultSigner: '8zqs77myZg6wkPjbh9YdSKtNmfPh4FJTzeo9R39mbjCm',
    official: true
  },
  {
    name: 'ETH-USDC',
    coin: { ...TOKENS.ETH },
    pc: { ...TOKENS.USDC },
    lp: { ...LP_TOKENS['ETH-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'AoPebtuJC4f2RweZSxcVCcdeTgaEXY64Uho8b5HdPxAR',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '7PwhFjfFaYp7w9N8k2do5Yz7c1G5ebp3YyJRhV4pkUJW',
    ammTargetOrders: 'BV2ucC7miDqsmABSkXGzsibCVWBp7gGPcvkhevDSTyZ1',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'EHT99uYfAnVxWHPLUMJRTyhD4AyQZDDknKMEssHDtor5',
    poolPcTokenAccount: '58tgdkogRoMsrXZJubnFPsFmNp5mpByEmE1fF6FTNvDL',
    poolWithdrawQueue: '9qPsKm82ZFacGn4ipV1DH85k7efP21Zbxrxbxm5v3GPb',
    poolTempLpTokenAccount: '2WtX2ow4h5FK1vb8VjwpJ3hmwmYKfJfa1hy1rcDBohBT',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '4tSvZvnbyzHXLMTiFonMyxZoHmFqau1XArcRCVHLZ5gX',
    serumBids: '8tFaNpFPWJ8i7inhKSfAcSestudiFqJ2wHyvtTfsBZZU',
    serumAsks: '2po4TC8qiTgPsqcnbf6uMZRMVnPBzVwqqYfHP15QqREU',
    serumEventQueue: 'Eac7hqpaZxiBtG4MdyKpsgzcoVN6eMe9tAbsdZRYH4us',
    serumCoinVaultAccount: '7Nw66LmJB6YzHsgEGQ8oDSSsJ4YzUkEVAvysQuQw7tC4',
    serumPcVaultAccount: 'EsDTx47jjFACkBhy48Go2W7AQPk4UxtT4765f3tpK21a',
    serumVaultSigner: 'C5v68qSzDdGeRcs556YoEMJNsp8JiYEiEhw2hVUR8Z8y',
    official: true
  },
  {
    name: 'xCOPE-USDC',
    coin: { ...TOKENS.xCOPE },
    pc: { ...TOKENS.USDC },
    lp: { ...LP_TOKENS['xCOPE-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '3mYsmBQLB8EZSjRwtWjPbbE8LiM1oCCtNZZKiVBKsePa',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '4tN7g8KbPt5bU9YDpeAsUNs2FY4G6GRvajTwCCHXt9Lk',
    ammTargetOrders: 'Fe5ZjyEhnB7mCgFhRkSLWNgvtkrut4iRzk1ydfJxwA9b',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'Guw4ErphtZQRC1foic6WweDSvA9AfuqJHKDXDcbrWH4f',
    poolPcTokenAccount: '86WgydpDUFRWa9aHzd9JgcKBELPJZVrkZ3uwxiiC3w2V',
    poolWithdrawQueue: 'Gvmc1zR72pdgoWSzNBqMyNoVHe78nxKgd7FSCE422Lcp',
    poolTempLpTokenAccount: '6FpDRYsKds3WkiCLjqpDzNBHWZP2Bz6CK9dZryBLKB9D',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '7MpMwArporUHEGW7quUpkPZp5L5cHPs9eKUfKCdaPHq2',
    serumBids: '5SZ6xDgLzp3QbzkqT68BBAB7orCezSsV5Gb9eAk84zdY',
    serumAsks: 'Gwt93Xzp8aFrP8YFV8YSuHmYbkrGURBVVHnE6AqDT4Hp',
    serumEventQueue: 'Ea4bQ4wBJ5MXAwTG1hKzEv1zry5WnGY2G58YR8hcZTk3',
    serumCoinVaultAccount: '6LtcYXZVb7zfQG33F5dCDKZ29hyQaUh6BBhWjdHp8moy',
    serumPcVaultAccount: 'FCqm5xfy8ZvMxifVFfSz9Gxv1CTRABVMyLXuJrWvzAq7',
    serumVaultSigner: 'XoGZnpfyqj539wneBe8xUQyD282mwy5AMUaChz12JCH',
    official: true
  },
  {
    name: 'SOL-USDT',
    coin: { ...NATIVE_SOL },
    pc: { ...TOKENS.USDT },
    lp: { ...LP_TOKENS['SOL-USDT-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '7XawhbbxtsRcQA8KTkHT9f9nc6d69UwqCDh6U5EEbEmX',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '4NJVwEAoudfSvU5kdxKm5DsQe4AAqG6XxpZcNdQVinS4',
    ammTargetOrders: '9x4knb3nuNAzxsV7YFuGLgnYqKArGemY54r2vFExM1dp',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '876Z9waBygfzUrwwKFfnRcc7cfY4EQf6Kz1w7GRgbVYW',
    poolPcTokenAccount: 'CB86HtaqpXbNWbq67L18y5x2RhqoJ6smb7xHUcyWdQAQ',
    poolWithdrawQueue: '52AfgxYPTGruUA9XyE8eF46hdR6gMQiA6ShVoMMsC6jQ',
    poolTempLpTokenAccount: '2JKZRQc92TaH3fgTcUZyxfD7k7V7BMqhF24eussPtkwh',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'HWHvQhFmJB3NUcu1aihKmrKegfVxBEHzwVX6yZCKEsi1',
    serumBids: '2juozaawVqhQHfYZ9HNcs66sPatFHSHeKG5LsTbrS2Dn',
    serumAsks: 'ANXcuziKhxusxtthGxPxywY7FLRtmmCwFWDmU5eBDLdH',
    serumEventQueue: 'GR363LDmwe25NZQMGtD2uvsiX66FzYByeQLcNFr596FK',
    serumCoinVaultAccount: '29cTsXahEoEBwbHwVc59jToybFpagbBMV6Lh45pWEmiK',
    serumPcVaultAccount: 'EJwyNJJPbHH4pboWQf1NxegoypuY48umbfkhyfPew4E',
    serumVaultSigner: 'CzZAjoEqA6sjqtaiZiPqDkmxG6UuZWxwRWCenbBMc8Xz',
    official: true
  },
  {
    name: 'YFI-USDT',
    coin: { ...TOKENS.YFI },
    pc: { ...TOKENS.USDT },
    lp: { ...LP_TOKENS['YFI-USDT-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '81PmLJ8j2P8CC5EJAAhWGYA4HgJvoKs4Y94ALZF2uKKG',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'pxedkTHh23HBYoarBPKML3xWh96EaNzKLW3oXvHHCw5',
    ammTargetOrders: 'GUMQZC9SAqynDvoV12sRUzACF8GzLpC5fUtRuzwCbU9S',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'GwY3weBBK4dQFwC96tHAoAQq4pSfMYmMZ4m6Njqq7Wbk',
    poolPcTokenAccount: 'Bs3DatsVrDujvjpV1JUVmVgNrPkaVwvp6WtuHz4z1QE6',
    poolWithdrawQueue: '2JJPww9oCvBxTdZaiB2H69Jx4dKWctCEuvbLtFfNCqHd',
    poolTempLpTokenAccount: 'B46wMQncJ2Ugp2NwWDxK6Qd4Q9T24NK3naNVdyVYxbug',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '3Xg9Q4VtZhD4bVYJbTfgGWFV5zjE3U7ztSHa938zizte',
    serumBids: '7FN1TgMmjQ8iwTdmJZAiwdTM3MddvxmgiF2J4GVHUtQ1',
    serumAsks: '5nudyjGUfjwVYCk1MzzuBeXcj9k59g9mruAUXrsQfcrR',
    serumEventQueue: '4AMp4qKTwE7RwExstg7Pk4JZwJGeRMnjkFmf52tqCHJN',
    serumCoinVaultAccount: '5KgKdCWVyWi9YJ6GipzozhWxAvnbQPpUtaxuMXXEn3Zs',
    serumPcVaultAccount: '29CnTKiFKwGPFfLBXDXGRX6ywGz3ToZfqZuLkoa33dbE',
    serumVaultSigner: '6LRcCMsRoGsye95Ck5oSyNqHJW8kk2iXt9z9YQyi9JkV',
    official: true
  },
  {
    name: 'SRM-USDT',
    coin: { ...TOKENS.SRM },
    pc: { ...TOKENS.USDT },
    lp: { ...LP_TOKENS['SRM-USDT-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'af8HJg2ffWoKJ6vKvkWJUJ9iWbRR83WgXs8HPs26WGr',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '8E2GLzSgLmzWdpdXjjEaHbPXRXsA5CFehg6FP6N39q2e',
    ammTargetOrders: '8R5TVxXvRfCaYvT493FWAJyLt8rVssUHYVGbGupAbYaQ',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'D6b4Loa4LoidUor2ffouE5BTMt6tLP6MtkNrsfBWG2C3',
    poolPcTokenAccount: '4gNeJniq6yqEygFmbAJa82TQjH1j3Fczm4bdeBHhwGJ1',
    poolWithdrawQueue: 'D3JQytXAydpHKUPChDe8JXdmvYRRV4EpnrxsqzMHNjFp',
    poolTempLpTokenAccount: '2dYW9SoJb51YNneQG7AywSB75jmzZa2R8rzzW7gT61h1',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'AtNnsY1AyRERWJ8xCskfz38YdvruWVJQUVXgScC1iPb',
    serumBids: 'EE2CYFBSoMvcUR9mkEF6tt8kBFhW9zcuFmYqRM9GmqYb',
    serumAsks: 'nkNzrV3ZtkWCft6ykeNGXXCbNSemqcauYKiZdf5JcKQ',
    serumEventQueue: '2i34Kriz23ZaQaJK6FVhzkfLhQj8DSqdQTmMwz4FF9Cf',
    serumCoinVaultAccount: 'GxPFMyeb7BUnu2mtGV2Zvorjwt8gxHqwL3r2kVDe6rZ8',
    serumPcVaultAccount: '149gvUQZeip4u8bGra5yyN11btUDahDVHrixzknfKFrL',
    serumVaultSigner: '4yWr7H2p8rt11QnXb2yxQF3zxSdcToReu5qSndWFEJw',
    official: true
  },
  {
    name: 'FTT-USDT',
    coin: { ...TOKENS.FTT },
    pc: { ...TOKENS.USDT },
    lp: { ...LP_TOKENS['FTT-USDT-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '4fgubfZVL6L8tc5x1j65S14P2Tnxr1YayKtKavQV5MBo',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'BSDKUy73wuGskKDVgzNGLL2k7hzDEwj237nZZ3Ch3bwz',
    ammTargetOrders: '4j1JaKap2s4XrkJeMDaMabfEDsQm9ykeUgJ9CWa9w4JU',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'HHTXo4Q8HFWMSDKnPJWCe1Y5UmYPFNZ6hU4mc8km7Zf4',
    poolPcTokenAccount: '5rbAHV9ufT11XRR5LcvMVsuA5FcpBozLKj91z372wpZR',
    poolWithdrawQueue: 'AMU4FFUUahWfaUA6WWzTWNNuiXoNDEgNNsZjFLWhvB8f',
    poolTempLpTokenAccount: 'FUVUCrKB6c7x9uVn1zK8qxbVwb6rNLqA2W17TM9Bhvta',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'Hr3wzG8mZXNHV7TuL6YqtgfVUesCqMxGYCEyP3otywZE',
    serumBids: '3k5bWdYn9thQmqrye2gSobzFBYTyYosx3bKvMJRcfTTN',
    serumAsks: 'DPW1r1p2uyfQxVC7vx3xVQcVvyUeiS2vhAnveQiXs9AT',
    serumEventQueue: '9zMcCfjdHH2Z7iCBtVdkmf9qXUN6y7AhbuWhRMu2DmcV',
    serumCoinVaultAccount: 'H1VJqo3piiadyVAUQW6yfZq4an8pgDFvAdqHJkRXMDbq',
    serumPcVaultAccount: '9SQ4Sjsszt59X3aLwRrTqa5SLxonEdXk5jF7KUfAxc8Z',
    serumVaultSigner: 'CgV9LcnAukrgDZmqhUwcNQ31z4KEjZEz4DHUSE4bRaVg',
    official: true
  },
  {
    name: 'BTC-USDT',
    coin: { ...TOKENS.BTC },
    pc: { ...TOKENS.USDT },
    lp: { ...LP_TOKENS['BTC-USDT-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'AMMwkf57c7ZsbbDCXvBit9zFehMr1xRn8ZzaT1iDF18o',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'G5rZ4Qfv5SxpJegVng5FuZftDrJkzLkxQUNjEXuoczX5',
    ammTargetOrders: 'DMEasFJLDw27MLkTBFqSX2duvV5GV6LzwtoVqVfBqeGR',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '7KwCHoQ9nqTnGea4XrcfLUr1pwEWp2maGBHWFqBTeoKW',
    poolPcTokenAccount: 'HwbXe9YJVez3BKK22jBH1i64YeX2fSKaYny5jrcPDxAk',
    poolWithdrawQueue: '3XUXNx72jcaXB3N56UjrtWwxv99ivqUwLAdkagvop4HF',
    poolTempLpTokenAccount: '8rZSQ23HWfZ1P6qd9ZL4ywTgRYtRZDd3xW3aK1hY7pkR',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'C1EuT9VokAKLiW7i2ASnZUvxDoKuKkCpDDeNxAptuNe4',
    serumBids: '2e2bd5NtEGs6pb758QHUArNxt6X9TTC5abuE1Tao6fhS',
    serumAsks: 'F1tDtTDNzusig3kJwhKwGWspSu8z2nRwNXFWc6wJowjM',
    serumEventQueue: 'FERWWtsZoSLcHVpfDnEBnUqHv4757kTUUZhLKBCbNfpS',
    serumCoinVaultAccount: 'DSf7hGudcxhhegMpZA1UtSiW4RqKgyEex9mqQECWwRgZ',
    serumPcVaultAccount: 'BD8QnhY2T96h6KwyJoCT9abMcPBkiaFuBNK9h6FUNX2M',
    serumVaultSigner: 'EPzuCsSzHwhYWn2j69HQPKWuWz6wuv4ANZiVigLGMBoD',
    official: true
  },
  {
    name: 'SUSHI-USDT',
    coin: { ...TOKENS.SUSHI },
    pc: { ...TOKENS.USDT },
    lp: { ...LP_TOKENS['SUSHI-USDT-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'DWvhPYVogsEKEsehHApUtjhP1UFtApkAPFJqFh2HPmWz',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'ARZWhFKLtqubNWdotvqeiTTpmBw4XfrySNtY4485Zmq',
    ammTargetOrders: 'J8f8p2x3wPTbpaqJydxTY5CvxtiB8HrMdW1DouaEVvRx',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'C77d7jRkxu3WyzL7K2UZZPdWXPzsFrmzLG4uHrsZhGTz',
    poolPcTokenAccount: 'BtweN6cYHBntMJiRY2gGB2u4oZFsbapjLz7QJeV3KWF1',
    poolWithdrawQueue: '6WsofMBNdHWacgButviYgn8CCTGyjW19H13vYntkzBzp',
    poolTempLpTokenAccount: 'CgaVy8TjkUdxFhi4h3RdszmPtf6MPUyfquqAWUwAnim7',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '6DgQRTpJTnAYBSShngAVZZDq7j9ogRN1GfSQ3cq9tubW',
    serumBids: '7U3FPNGvcDkmfnD4u5jKVd2AKwc66RFBZ8GnyjzeNfML',
    serumAsks: '3Zx74FxHwttDuYxeqHzMijitrf25FhSzeoWBT9VeCrVj',
    serumEventQueue: '9PqaWBQ6gSZDZsztbWTnXp6LfrS2TUfVfPTSnf8tbgkE',
    serumCoinVaultAccount: '5LmHe3x8VwGzWZ6rooARZJNMo6AaN1P73478AuhBUjUr',
    serumPcVaultAccount: 'iLCNUheHbq3bE1868XwWXs8enoTvjFnwpnmLFmBQGi3',
    serumVaultSigner: '9GN4139oezNfddWhcAc3c8Ke5aU4cwzcxL8cLkqE37Yy',
    official: true
  },
  {
    name: 'TOMO-USDT',
    coin: { ...TOKENS.TOMO },
    pc: { ...TOKENS.USDT },
    lp: { ...LP_TOKENS['TOMO-USDT-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'GjrXcSvwzGrz1RwKYGVWdbZyXzyotgichSHB95moDmf8',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '6As7AcwxnvawiY4mKnVTYqjTSRe9Uu2yW5hhJB97Ur6y',
    ammTargetOrders: 'BPU6CpQ9RVrftpofrXD3Gui5iNXpbiNiCm9ecQUahgH6',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '8Ev8a9a8ZQi2xHYa7fwkYqzrmMrwbnUf6D9z762zAWcF',
    poolPcTokenAccount: 'DriE8fPjPcTf7jzzyMqnQYqBPAVQPNS6bjZ4EABEJPUd',
    poolWithdrawQueue: 'CR4AmK8geX2e1VLdFKgC2raxMwB4JsVUKXd3mBGkv4YW',
    poolTempLpTokenAccount: 'GLXgb5oGNHQAVr2t68sET3NGPBtDitE5cQaMG3zgc7D8',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'GnKPri4thaGipzTbp8hhSGSrHgG4F8MFiZVrbRn16iG2',
    serumBids: '7C1XnffUgQVnfRTUPBPxQQT1QKsHwnQ7ogAWmmJqbW9L',
    serumAsks: 'Hbd8HWXcZDPUUHYXJLH4vn9t1SfQZ83fqf4jQN65QpYL',
    serumEventQueue: '5AB3QbR7Ck5qsn21fM5zBzxVUnyougXroWHeR33bscwH',
    serumCoinVaultAccount: 'P6qAvA6s7DHzzH4i74CUFAzx5bM4Yj3xk5TKmF7eWdb',
    serumPcVaultAccount: '8zFodcf4pKcRBq7Zhdg4tQeB76op7kSjPC2haPjPkDEm',
    serumVaultSigner: 'ECTnLdZEaxUiCwyjKcts3CoMfT4kj3CNfVCd9B18hRim',
    official: true
  },
  {
    name: 'LINK-USDT',
    coin: { ...TOKENS.LINK },
    pc: { ...TOKENS.USDT },
    lp: { ...LP_TOKENS['LINK-USDT-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'E9EvurfzdSQaqCFBUaD4MgV93htuRQ93sghm922Pik88',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'CQ9roBWWPV5efTeZHoqgzJJvTSeVNMca6rteaenNwqF6',
    ammTargetOrders: 'DVXgN8m2f8Ggs8zddLZyQdsh49jeUGnLq66s4Lhfd1uj',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'BKNf6HxSz9tCmeZts4ABHpYuXwP2wfKf4uRycwdTm3Jh',
    poolPcTokenAccount: '5Uzq3c6rnedxMF7t7s7PJVQkxxZE7YXGFPJUToyhdebY',
    poolWithdrawQueue: 'Hj5vcVZCm6JXtkmCa1MPjteoxzkWQCmHQutXxofj2sy6',
    poolTempLpTokenAccount: '7WhsN9LGSeGxhZPT4E4rczauDvhmfquAKHQUESAXYS3k',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '3yEZ9ZpXSQapmKjLAGKZEzUNA1rcupJtsDp5mPBWmGZR',
    serumBids: '9fkA2oJQ7BKP5n2WxdLkY7mDA1mzBrGZ9osqVhvdBkH7',
    serumAsks: 'G8c3xQURJk1oukLqJd3W4SJykmRq4wq3GrSWJwWipECH',
    serumEventQueue: '4MDEwZYKXuvEdQ58yMsE2zwXLG973aYp4EFvoaUSDMP2',
    serumCoinVaultAccount: 'EmS34LncbTGs4yU4GM9bESRYMCFL3JBW6mnAeKB4UtEb',
    serumPcVaultAccount: 'AseZZ8ZRqyvkZMMGAAG8dAqM9XFf2xGX2tWWbko7a4hC',
    serumVaultSigner: 'FezSC2d6sXEcJ9ah8nYxHC18nh4FZzc4u7ZTtRSrk6Nd',
    official: true
  },
  {
    name: 'ETH-USDT',
    coin: { ...TOKENS.ETH },
    pc: { ...TOKENS.USDT },
    lp: { ...LP_TOKENS['ETH-USDT-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'He3iAEV5rYjv6Xf7PxKro19eVrC3QAcdic5CF2D2obPt',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '8x4uasC632WSrk3wgwoCWHy7MK7Xo2WKAe9vV93tj5se',
    ammTargetOrders: 'G1eji3rrfRFfvHUbPEEbvnjmJ4eEyXeiJBVbMTUPfKL1',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'DZZwxvJakqbraXTbjRW3QoGbW5GK4R5nmyrrGrFMKWgh',
    poolPcTokenAccount: 'HoGPb5Rp44TyR1EpM5pjQQyFUdgteeuzuMHtimGkAVHo',
    poolWithdrawQueue: 'EispXkJcfh2PZA2fSXWsAanEGq1GHXzRRtu1DuqADQsL',
    poolTempLpTokenAccount: '9SrcJk8TB4JvutZcA4tMvvkdnxCXda8Gtepre7jcCaQr',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '7dLVkUfBVfCGkFhSXDCq1ukM9usathSgS716t643iFGF',
    serumBids: 'J8a3dcUkMwrE5kxN86gsL1Mwrg63RnGdvWsPbgdFqC6X',
    serumAsks: 'F6oqP13HNZho3bhwuxTmic4w5iNgTdn89HdihMUNR24i',
    serumEventQueue: 'CRjXyfAxboMfCAmsvBw7pdvkfBY7XyGxB7CBTuDkm67v',
    serumCoinVaultAccount: '2CZ9JbDYPux5obFXb9sefwKyG6cyteNBSzbstYQ3iZxE',
    serumPcVaultAccount: 'D2f4NG1NC1yeBM2SgRe5YUF91w3M4naumGQMWjGtxiiE',
    serumVaultSigner: 'CVVGPFejAj3A75qPy2116iJFma7zGEuL8DgnxhwUaFBF',
    official: true
  },
  {
    name: 'YFI-SRM',
    coin: { ...TOKENS.YFI },
    pc: { ...TOKENS.SRM },
    lp: { ...LP_TOKENS['YFI-SRM-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'GDVhJmDTdSExwHeMT5RvUBUNKLwwXNKhH8ndm1tpTv6B',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '5k2VpDkhbvypWvg9erQTZu4KsKjVLe1VAo3K71THrNM8',
    ammTargetOrders: '4dhnWeEq5aeqDFkEa5CKwS2TYrUmTZs7drFBAS656f6e',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '8FufHk1xV2j9RpVztnt9vuw9KJ89rpR7FMT1HTfsqyPH',
    poolPcTokenAccount: 'FTuzfUyp6fhLMQ5kUdAkBWd9BjY114DfjkrVocAFKwkQ',
    poolWithdrawQueue: 'A266ybcveVZYraGgEKWb9JqVWVp9Tsxa9hTudzvTQJgY',
    poolTempLpTokenAccount: 'BXHfb8E4KNVnAVvz1eyVS12QqpvBUimtCnnNiBuoMrRa',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '6xC1ia74NbGZdBkySTw93wdxN4Sh2VfULtXh1utPaJDJ',
    serumBids: 'EmfyNgr2t1mz6QJoGfs7ytLPpnT3A4kmZj2huGBFHtpr',
    serumAsks: 'HQhD6ZoNfCjvUTfsE8KS46PLC8rpeyBYy1tY4FPgEbpQ',
    serumEventQueue: '4QGAwMgfi5PrMUoHvoSbGQV168kuRMURBK4pwGfSV7nC',
    serumCoinVaultAccount: 'GzZCBp3Z3fYHZW9b4WusfQhp7p4rZXeSNahCpn8HBD9',
    serumPcVaultAccount: 'ANK9Lpi4pUe9SxPvcKvd82jkG6AoKvvgo5kN8BCXukfA',
    serumVaultSigner: '9VAdxQgKNLkHgtQ4fkDetwwTKZG8xVaKeUFQwBVG7c7a',
    official: true
  },
  {
    name: 'FTT-SRM',
    coin: { ...TOKENS.FTT },
    pc: { ...TOKENS.SRM },
    lp: { ...LP_TOKENS['FTT-SRM-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '21r2zeCacmm5YvbGoPZh9ZoGREuodhcbQHaP5tZmzY14',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'CimwwQH1h2MKbFbodHHByMq8MreFuJznMGVXxYKMpyiB',
    ammTargetOrders: 'Fewh6hVTfeduAnbqwNuUx2Cu7uTyJTALP76hjpWCvRoV',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'Atc9Prscs9RLmDEpsCQzFgCqzkscAtTck5ZSZGV9s7hE',
    poolPcTokenAccount: '31ZJVJMap4WpPbzaScPwg5MGRUDjatP2kXVsSgf12yVZ',
    poolWithdrawQueue: 'yAZD46BC1Bti2X5FEjveobueuyevi7jFV5ew6DH8Thz',
    poolTempLpTokenAccount: '7Ro1o6Vbh3Ech2zeozNDicRP1gZfHAWcRnxvrzdnLfYi',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'CDvQqnMrt9rmjAxGGE6GTPUdzLpEhgNuNZ1tWAvPsF3W',
    serumBids: '9NfJWy5QNqRDGmNARphS9kJyYtR6nkkWcFyJRLbgECtd',
    serumAsks: '9VEVBJZHVv6N2MzAzNLiCwN2MAdt5GDScCtpE4zkzDFW',
    serumEventQueue: 'CbnLQT9Jwo3RHpWBnsPisAybSN4CBuwj4fcF1S9qJchV',
    serumCoinVaultAccount: '8qTUSDRxJ65sGKEUu746xJdCquoP38AqKsQo6ZruSSBk',
    serumPcVaultAccount: 'ALe3hiZR35cCjcrzbJi1vKEhNftdVQjwkt4S8rbPZogq',
    serumVaultSigner: 'CAAeuJAgnP368num8bCv6VMWCqMZ4pTANCcGTAMAJtm2',
    official: true
  },
  {
    name: 'BTC-SRM',
    coin: { ...TOKENS.BTC },
    pc: { ...TOKENS.SRM },
    lp: { ...LP_TOKENS['BTC-SRM-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'DvxLb4NnQUYq1gErk35HVt9g8kxjNbviJfiZX1wqraMv',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '3CGxjymeKv5wvpVg9unUgbrGUESmeqfJUJkPjVeRuMvT',
    ammTargetOrders: 'C8YiDYrk4rfC6sgK93zM3YpGj7SDpGuRbos7DHStSssT',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '5jV7XQ1JnfUg7RvEShyAdV7Gzn1xS54j163x8ZBSzxuh',
    poolPcTokenAccount: 'HSKY5r6iqCpC4nWzCGP2oWMQdGEQsx69eBm33PrmZqhg',
    poolWithdrawQueue: '5faTQUz7gmasinkinA7BkC6HsG8hUrD9iukaohF2fuHZ',
    poolTempLpTokenAccount: '9QutovnPtwN9pPxsTdaEWBSCT7iTKc3hwMfF4QJHDXRz',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'HfsedaWauvDaLPm6rwgMc6D5QRmhr8siqGtS6tf2wthU',
    serumBids: 'GMM36fgidwYvXCAxQhpT1XkGoZ46g1wMc44hY8ds3P8u',
    serumAsks: 'BFDQ4WGcEftURk6nrwtQ1GzYdPYj8fx3iBjeJVt6S3jQ',
    serumEventQueue: '94ER3KZeDrYSG8TytGJ56rZK9zM8oz1H8dJ2LP1gHn2s',
    serumCoinVaultAccount: '3ABvHYBeWrpgP82jvHh5TVwid1AjDj9rei7zfY8xh2wz',
    serumPcVaultAccount: 'CSpdPdzzbaNWgwhPRTZ4TNoYS6Vco2w1s7jvqUsYQBzf',
    serumVaultSigner: '9o8LaPeTMJBoYyoUVNm6ju6c5rwfphhYReQsp1vTTyRg',
    official: true
  },
  {
    name: 'SUSHI-SRM',
    coin: { ...TOKENS.SUSHI },
    pc: { ...TOKENS.SRM },
    lp: { ...LP_TOKENS['SUSHI-SRM-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'BLVjPTgzyfiKSgDujTNKKNzW2GXx7HhdMxgr2LQ2g83s',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'Efpi6e4ckqtfaED9gRmadN3RtiTXDtGPrp1szsh7sj7C',
    ammTargetOrders: 'BZUFGpRWEsYzpVfLrFpdE7E9fzGhrySQE1TrsX92qWAC',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'BjWKHZxVMQykmGGmkhA1m9QQycJTeQFs51kyfP1zQvzv',
    poolPcTokenAccount: 'EnWaAD7WAyznuRjg9PqRr2vVaXqQpTje2fBWyFFEvr37',
    poolWithdrawQueue: 'GbEc9D11VhEHCDsqcSZ5vPVfnzV7BCS6eTquoVvhSaNz',
    poolTempLpTokenAccount: 'AQ4YUkqPSbP8JpnCWEAkYNUWm6AjUSnPucKhVN8ypuiB',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'FGYAizUhNEC9GBmj3UyxdiRWmGjR3TfzMq2dznwYnjtH',
    serumBids: 'J9weS4eF3DcSMLttazndEwVtjsqfRf6vBg1FNhdYrKiW',
    serumAsks: '4TCPXw9UBcPfSVtaArzydHvgAXfDbq28iZVjHidbM9rp',
    serumEventQueue: '2eJU3EygyV4SWGAH1g5F57CxtaTj4nL36apaRtnEZ9zH',
    serumCoinVaultAccount: 'BSoAoNFKzK65TjcUpY5JZHBvZVMiYnkdo9upy3mLSTpq',
    serumPcVaultAccount: '8U9azb65o1dJuMs7je987i7hKxJfPZnbNRNeH5beJfo7',
    serumVaultSigner: 'HZtDGZsz2fdXF75H8tyB8skp5a4rvoawgxwXqHTGEdvU',
    official: true
  },
  {
    name: 'TOMO-SRM',
    coin: { ...TOKENS.TOMO },
    pc: { ...TOKENS.SRM },
    lp: { ...LP_TOKENS['TOMO-SRM-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'DkMAuUCQHC6BNgVnjtM5ZTKm1T8MsriQ6bL3Umi6NBtG',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '34eRiATmb9Ktv1QTDzzckyaFhj4KpC2y94TJXXd34erL',
    ammTargetOrders: 'CK2vFsmS2CEZ2Hi6Vf9px8p5DSpoyXST9rkFHwbbHirU',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '8BjTHZccnRNZKZpAxsdXx5BEQ4Kpxd9pQLNgeMqMiTZL',
    poolPcTokenAccount: 'DxcJXkGo8BUmsky51LuKi4Vs1zW48fHrCXEY6BKuY3TY',
    poolWithdrawQueue: 'AoP3EXWypUheq9ZURDBpf8Jd1ijRuhUCQg1uiM5zFpB5',
    poolTempLpTokenAccount: '9go7YtJ6QdG3mWgVhwRcQAfmwPruJk5MmsjyTn2HJisK',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '7jBrpiq3w2ywzzb54K9SoosZKy7nhuSQK9XrsgSMogFH',
    serumBids: 'ECdZLJGwcN6fXY9BjiSVNrWssKdWejW9uv8Zs6GkkxBG',
    serumAsks: 'J5NN79kpFzGdxj8MGvis3NsGYcrvcdYHNXLtGGn9au5E',
    serumEventQueue: '7FrdprBxpDyM7P1AkeMtEJ75Q6UK6ZE92zgqGg5F4Gxb',
    serumCoinVaultAccount: '8W65Bwb83MYKHf82phS9xPUDsR6RpZbAXnSELxsBb3HH',
    serumPcVaultAccount: '5rjDHBsjFv3Z3Dxr5RMj98vj6LA5DNEwZGDM8wyUF1Hy',
    serumVaultSigner: 'EJfMPPTvTKtgj7PUaM17bp2Gbye9CdKjZ5yqonPyY4rB',
    official: true
  },
  {
    name: 'LINK-SRM',
    coin: { ...TOKENS.LINK },
    pc: { ...TOKENS.SRM },
    lp: { ...LP_TOKENS['LINK-SRM-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '796pvggjoDCPUtUSVFSCLqPRyes5YPvRiu4zFWX582wf',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '3bZB7mZ5hRNZfrJx6BL5C4GhP4nT14rEAGVPXL34hrZg',
    ammTargetOrders: 'Ha4yLJU1UrZi8MqCMu2pLK3xXREG1GW1bjjqTsjQnC3c',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '5eTUmVN3kXqBeKHUA2kWU19jB7kFN3wpejWvWYcw6dBa',
    poolPcTokenAccount: '4BsmBxNQtuKgBTNjci8tWd2NqPxXBs2JY38X26epSHYy',
    poolWithdrawQueue: '2jn4FQ2CtYwXDgCcLbNrGUzKFeB5PpPbnMr2x2z2wz3V',
    poolTempLpTokenAccount: '7SxKHHATjgEgfxnLrtKaSU77s2ABqD8BoEr6W6dFMS3a',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'FafaYTnhDbLAFsr5qkD2ZwapRxaPrEn99z59UG4zqRmZ',
    serumBids: 'HyKmFiuoWZo7STLjvJJ66YR4V1wauAorCPUaxnnB6umk',
    serumAsks: '8qjKdvjmBPZWjxP3nWjwFCcsrAspCN5EyTD3WfgKbFj4',
    serumEventQueue: 'FWZB7PJLwg7WdgoVBRrkvz2A4S7ZctKnoGj1yCSxqs9G',
    serumCoinVaultAccount: '8J7iJ4uidHscVnNGsEgiEPJsUqrfteN7ifMscB9h4dAq',
    serumPcVaultAccount: 'Bw7SrqDqvAXHi2yphAniH3uBw9N7J6vVi7jMH9B2KYWM',
    serumVaultSigner: 'CvP4Jk6AYBV6Kch6w6FjwuMqHAugQqVrqCNp1eZmGihB',
    official: true
  },
  {
    name: 'ETH-SRM',
    coin: { ...TOKENS.ETH },
    pc: { ...TOKENS.SRM },
    lp: { ...LP_TOKENS['ETH-SRM-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '3XwxHcbyqcd1xkdczaPv3TNCZsevELD4Zux3pu4sF2D8',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'FBfaqV1RRacEi27E3dm8yLcxpbWYx4BzMXG4zMNx7ZdS',
    ammTargetOrders: 'B1gQ6FHLxmBzznDKn8Rj1ZokcJtdSWjkCoXdQLRhz8NS',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'CsFFjzC1hmpqimExTj8g4kregUxGnGrEWX9Jhne172uU',
    poolPcTokenAccount: 'ACg55oVWt1a4ZVxnFVCRDEMz1JAeGY13snXufdQAp4pX',
    poolWithdrawQueue: 'C6MRGfZ13tstxjcWuLqUseUikidsAjgk7zBEYqM6cFb4',
    poolTempLpTokenAccount: 'EVRzNkPU9UAzBf8XhJYD84U7petDZnSMVaaa9mtBQaM6',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '3Dpu2kXk87mF9Ls9caWCHqyBiv9gK3PwQkSvnrHZDrmi',
    serumBids: 'HBVsrbKLEf1aaUy9oKFkQZVDtgTf54T9H8FQdcGbF7EH',
    serumAsks: '5T3zDaT1XvfEb9jKcgpFyQRze9qWKNTE1iSE5aboxYZy',
    serumEventQueue: '3w11TRux1gX7nqaGUMGpPH9ocDBPudeLTw6k1uhsLo2k',
    serumCoinVaultAccount: '58jqhCZ11r6ZvATqdGfDXPk7LmiR9HS3jQt7kuoBx5CH',
    serumPcVaultAccount: '9NLpT5aZtbbauvEVVFsHqigv2ekTEPK1kojoMMCw6Hhx',
    serumVaultSigner: 'EC5JsbaQVp8tM59TqkQBk4Yv7bzLQq3TrzpepjGr9Ecg',
    official: true
  },
  {
    name: 'SRM-SOL',
    coin: { ...TOKENS.SRM },
    pc: { ...NATIVE_SOL },
    lp: { ...LP_TOKENS['SRM-SOL-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'EvWJC2mnmu9C9aQrsJLXw8FhUcwBzFEUQsP1E5Y6a5N7',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '9ot4bg8aT2FRKfiRrM2fSPHEr7M1ihBqm1iT4771McqR',
    ammTargetOrders: 'AfzGtG3XnMixxJTx2rwoWLXKVaWoFMhsMeYo929BrUBY',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'BCNYwsnz3yXvi4mY5e9w2RmZvwUW3pefzYQ4tsoNdDhp',
    poolPcTokenAccount: '7BXPSUXeBVqJGyxW3yvkNxnJjYHuC8mnhyFCDp2abAs6',
    poolWithdrawQueue: 'HYo9FfBpm8NCpR8qYMGYFZNqzKkXDRFACLxu8PXCCDc4',
    poolTempLpTokenAccount: 'AskrcNfMDKT5c65AYeuEBW6mfMXfT3SG4nDCDRAyEnad',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'jyei9Fpj2GtHLDDGgcuhDacxYLLiSyxU4TY7KxB2xai',
    serumBids: '4ZTJfhgKPizbkFXNvTRNLEncqg85yJ6pyT7NVHBAgvGw',
    serumAsks: '7hLgwZhHD1MRNyiF1qfAjfkMzwvP3VxQMLLTJmKSp4Y3',
    serumEventQueue: 'nyZdeD16L5GxJq7Pso8R6KFfLA8R9v7c5A2qNaGWR44',
    serumCoinVaultAccount: 'EhAJTsW745jiWjViB7Q4xXcgKf6tMF7RcMX9cbTuXVBk',
    serumPcVaultAccount: 'HFSNnAxfhDt4DnmY9yVs2HNFnEMaDJ7RxMVNB9Y5Hgjr',
    serumVaultSigner: '6vBhv2L33KVJvAQeiaW3JEZLrJU7TtGaqcwPdrhytYWG',
    official: true
  },
  {
    name: 'STEP-USDC',
    coin: { ...TOKENS.STEP },
    pc: { ...TOKENS.USDC },
    lp: { ...LP_TOKENS['STEP-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '4Sx1NLrQiK4b9FdLKe2DhQ9FHvRzJhzKN3LoD6BrEPnf',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'EXgME2sUuzBxEc2wuyoSZ8FZNZMC3ChhZgFZRAW3nCQG',
    ammTargetOrders: '78bwAGKJjaiPQqmwKmbj4fhrRTLAdzwqNwpFdpTzrhk1',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '8Gf8Cc6yrxtfUZqM2vf2kg5uR9bGPfCHfzdYRVBAJSJj',
    poolPcTokenAccount: 'ApLc86fHjVbGbU9QFzNPNuWM5VYckZM92q6sgJN1SGYn',
    poolWithdrawQueue: '5bzBcB7cnJYGYvGPFxKcZETn6sGAyBbXgFhUbefbagYh',
    poolTempLpTokenAccount: 'CpfWKDYNYfvgk42tqR8HEHUWohGSJjASXfRBm3yaKJre',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '97qCB4cAVSTthvJu3eNoEx6AY6DLuRDtCoPm5Tdyg77S',
    serumBids: '5Xdpf7CMGFDkJj1smcVQAAZG6GY9gqAns18QLKbPZKsw',
    serumAsks: '6Tqwg8nrKJrcqsr4zR9wJuPv3iXsHAMN65FxwJ3RMH8S',
    serumEventQueue: '5frw4m8pEZHorTKVzmMzvf8xLUrj65vN7wA57KzaZFK3',
    serumCoinVaultAccount: 'CVNye3Xr9Jv26c8TVqZZHq4F43BhoWWfmrzyp1M9YA67',
    serumPcVaultAccount: 'AnGbReAhCDFkR83nB8mXTDX5dQJFB8Pwicu6pGMfCLjt',
    serumVaultSigner: 'FbwU5U1Doj2PSKRJi7pnCny4dFPPJURwALkFhHwdHaMW',
    official: true
  },
  {
    name: 'MEDIA-USDC',
    coin: { ...TOKENS.MEDIA },
    pc: { ...TOKENS.USDC },
    lp: { ...LP_TOKENS['MEDIA-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '94CQopiGxxUXf2avyMZhAFaBdNatd62ttYGoTVQBRGdi',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'EdS5vqjihxRbRujPkqqzHYwBqcTP9QPbrBc9CDtnBDwo',
    ammTargetOrders: '6Rfew8qvNp97PVN14C9Wg8ybqRdF9HUEUhuqqZBWcAUW',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '7zfTWDFmMi3Tzbbd3FZ2vZDdBm1w7whiZq1DrCxAHwMj',
    poolPcTokenAccount: 'FWUnfg1hHuanU8LxJv31TAfEWSvuWWffeMmHpcZ9BYVr',
    poolWithdrawQueue: 'F7MUnGrShtQqSvi9DoWyBNRo7FUpRiYPsS9aw77auhiS',
    poolTempLpTokenAccount: '7oX2VcPYwEV6EUUyMUoTKVVxAPAvGQZcGiGzotX43wNM',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'FfiqqvJcVL7oCCu8WQUMHLUC2dnHQPAPjTdSzsERFWjb',
    serumBids: 'GmqbTDL5QSAhWL7UsE8MriTHSnodWM1HyGR8Cn8GzZV5',
    serumAsks: 'CrTBp7ThkRRYJBL4tprke2VbKYj2wSxJp3Q1LDoHcQwP',
    serumEventQueue: 'HomZxFZNGmH2XedBavMsrXgLnWFpMLT95QV8nCYtKszd',
    serumCoinVaultAccount: 'D8ToFvpVWmNnfJzjHuumRJ4eoJc39hsWWcLtFZQpzQTt',
    serumPcVaultAccount: '6RSpnBYaegSKisXaJxeP36mkdVPe9SP3p2kDERz8Ahhi',
    serumVaultSigner: 'Cz2m3hW2Vcb8oEFz12uoWcdq8mKb9D1N7RTyXpigoFXU',
    official: true
  },
  {
    name: 'ROPE-USDC',
    coin: { ...TOKENS.ROPE },
    pc: { ...TOKENS.USDC },
    lp: { ...LP_TOKENS['ROPE-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'BuS4ScFcZjEBixF1ceCTiXs4rqt4WDfXLoth7VcM2Eoj',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'ASkE1yKPBei2aUxKHrLRptB2gpC3a6oTSxafMikoHYTG',
    ammTargetOrders: '5isDwR41fBJocfmcrcfwRtTnmSf7CdssdpsmBy2N2Eym',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '3mS8mb1vDrD45v4zoxbSdrvbyVM1pBLM31cYLT2RfS2U',
    poolPcTokenAccount: 'BWfzmvvXhQ5V8ZWDMC4u82sEWgc6HyRLnq6nauwrtz5x',
    poolWithdrawQueue: '9T1cwwE5zZr3D2Rim8e5xnJoPJ9yKbTXvaRoxeVoqffo',
    poolTempLpTokenAccount: 'FTFx4Vg6hgKLZMLBUvazvPbM7AzDe5GpfeBZexe2S6WJ',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '4Sg1g8U2ZuGnGYxAhc6MmX9MX7yZbrrraPkCQ9MdCPtF',
    serumBids: 'BDYAnAUSoBTtX7c8TKHeqmSy7U91V2pDg8ojvLs2fnCb',
    serumAsks: 'Bdm3R8X7Vt1FpTruE9SQVESSd3BjAyFhcobPwAoK2LSw',
    serumEventQueue: 'HVzqLTfcZKVC2PanNpyt8jVRJfDW8M5LgDs5NVVDa4G3',
    serumCoinVaultAccount: 'F8PdvS5QFhSqgVdUFo6ivXdXC4nDEiKGc4XU97ZhCKgH',
    serumPcVaultAccount: '61zxdnLpgnFgdk9Jom5f6d6cZ6cTbwnC6QqmJag1N9jB',
    serumVaultSigner: 'rCFXUwdmQvRK9jtnCip3SdDm1cLn8nB6HHgEHngzfjQ',
    official: true
  },
  {
    name: 'MER-USDC',
    coin: { ...TOKENS.MER },
    pc: { ...TOKENS.USDC },
    lp: { ...LP_TOKENS['MER-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'BkfGDk676QFtTiGxn7TtEpHayJZRr6LgNk9uTV2MH4bR',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'FNwXaqyYNKNwJ8Qc39VGzuGnPcNTCVKExrgUKTLCcSzU',
    ammTargetOrders: 'DKgXbNmsm1uCJ2eyh6xcnTe1G6YUav8RgzaxrbkG4xxe',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '6XZ1hoJQZARtyA17mXkfnKSHWK2RvocC3UDNsY7f4Lf6',
    poolPcTokenAccount: 'F4opwQUoVhVRaf3CpMuCPpWNcB9k3AXvMMsfQh52pa66',
    poolWithdrawQueue: '8mqpqWGL7W2xh8B1s6XDZJsmPuo5zRedcM5sF55hhEKo',
    poolTempLpTokenAccount: '9ex6kCZsLR4ZbMCN4TcCuFzkw8YhiC9sdsJPavsrqCws',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'G4LcexdCzzJUKZfqyVDQFzpkjhB1JoCNL8Kooxi9nJz5',
    serumBids: 'DVjhW8nLFWrpRwzaEi1fgJHJ5heMKddssrqE3AsGMCHp',
    serumAsks: 'CY2gjuWxUFGcgeCy3UiureS3kmjgDSRF59AQH6TENtfC',
    serumEventQueue: '8w4n3fcajhgN8TF74j42ehWvbVJnck5cewpjwhRQpyyc',
    serumCoinVaultAccount: '4ctYuY4ZvCVRvF22QDw8LzUis9yrnupoLQNXxmZy1BGm',
    serumPcVaultAccount: 'DovDds7NEzFn493DJ2yKBRgqsYgDXg6z38pUGXe1AAWQ',
    serumVaultSigner: 'BUDJ4F1ZknbZiwHb6xHEsH6o1LuW394DE8wKT8CoAYNF',
    official: true
  },
  {
    name: 'COPE-USDC',
    coin: { ...TOKENS.COPE },
    pc: { ...TOKENS.USDC },
    lp: { ...LP_TOKENS['COPE-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'DiWxV1SPXPNJRCt5Ao1mJRAxjw97hJVyj8qGzZwFbAFb',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'jg8ayFZLH2cEUJULUirWy7wNggN1eyRnTMt6EjbJUun',
    ammTargetOrders: '8pE4fzFzRT6aje7B3hYHXrZakeEqNF2kFmJtxkrxUK9b',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'FhjBg8vpVgsiW9oCUxujqoWWSPSRvnWNXucEF1G1F39Z',
    poolPcTokenAccount: 'Dv95skm7AUr33x1p2Bu5EgvE3usB1TxgZoxjBe2rpfm6',
    poolWithdrawQueue: '4An6jy1JocXGUjayXqVTx1jvs79o8LgsRk3VvmRgXxaq',
    poolTempLpTokenAccount: '57hiWKd47VHVD7y8BenqnakSdgQNBvyUrkSpf9BDP6UQ',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '6fc7v3PmjZG9Lk2XTot6BywGyYLkBQuzuFKd4FpCsPxk',
    serumBids: 'FLjCjU5wLUsqF6FeYJaH5JtTTFSTZzTCingxN1uyr9zn',
    serumAsks: '7TcstD7AdWqjuFoRVK24zFv66v1qyMYDNDT1V5RNWKRz',
    serumEventQueue: '2dQ1Spgc7rGSuE1t3Fb9RL7zvGc7F7pH9XwJ46u3QiJr',
    serumCoinVaultAccount: '2ShBow4Bof4dkLjx8VTRjLXXvUydiBNF7bHzDaxPjpKq',
    serumPcVaultAccount: 'EFdqJhawpCReiK2DcrbbUUWWc6cd8mqgZm5MSbQ3TR33',
    serumVaultSigner: 'A6q5h5Wx9iqeoVsvYWA7xofUcKx6XUPPab8BTVrW91Bs',
    official: true
  },
  {
    name: 'ALEPH-USDC',
    coin: { ...TOKENS.ALEPH },
    pc: { ...TOKENS.USDC },
    lp: { ...LP_TOKENS['ALEPH-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'GDHXjn9wF2zxW35DBkCegWQdoTfFBC9LXt7D5ovJxQ5B',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'AtUeUK7MZayoDktjrRSJAFsyPiPwPsbAeTsunM5pSnnK',
    ammTargetOrders: 'FMYSGYEL1CPYz8cpgAor5jV2HqeEQRDLMEggoz6wAiFV',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'BT3QMKHrha4fhqpisnYKaPDsv42XeHU2Aovhdu5Bazru',
    poolPcTokenAccount: '9L4tXPyuwuLhmtmX4yaRTK6TB7tYFNHupeENoCdPceq',
    poolWithdrawQueue: '4nRbmEUp7DQroG71jXv6cJjrhnh91ePdPhzmBSjinwB8',
    poolTempLpTokenAccount: '9JdpGvmo6aPZYf4hkiZNUjceXgd2RtR1fJgvjuoAuhsM',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'GcoKtAmTy5QyuijXSmJKBtFdt99e6Buza18Js7j9AJ6e',
    serumBids: 'HmpcmzzajDvhFSXb4pmJo5mb23zW8Cj9FEeB3hVT78jV',
    serumAsks: '8sfGm6jsFTAcb4oLuqMKr1xNEBd5CXuNPAKZEdbeezA',
    serumEventQueue: '99Cd6D9QnFfTdKpcwtoF3zAZdQAuZQi5NsPMERresj1r',
    serumCoinVaultAccount: 'EBRqW7DaUGFBHRbfgRagpSf9jTSS3yp9MAi3RvabdBGz',
    serumPcVaultAccount: '9QTMfdkgPWqLriB9J7FcYvroUEqfw6zW2VCi1dAabdUt',
    serumVaultSigner: 'HKt6xFufxTBBs719WQPbro9t1DfDxffurxFhTPntMgoe',
    official: true
  },
  {
    name: 'TULIP-USDC',
    coin: { ...TOKENS.TULIP },
    pc: { ...TOKENS.USDC },
    lp: { ...LP_TOKENS['TULIP-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '96hPvuJ3SRT82m7BAc7G1AUVPVcoj8DABAa5gT7wjgzX',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '6GtSWZfdUFtT47RPk2oSxoB6RbNkp9aM6yP77jB4XmZB',
    ammTargetOrders: '9mB928abAihkhqM6AKLMW4cZkHBXFn2TmcxEKhTqs6Yr',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 's9Xp7GV1jGvixdSfY6wPgivsTd3c4TzjW1eJGyojwV4',
    poolPcTokenAccount: 'wcyW58QFNfppgm4Wi7cKhSftdVNfpLdn67YvvCNMWrt',
    poolWithdrawQueue: '59NA3khShyZk4dhDjFN564nScNdEi3UR4wrCnLN6rRgX',
    poolTempLpTokenAccount: '71oLQgsHknJVHGJDCaBVUnb6udGepK7kwkHXGy47u2i4',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '8GufnKq7YnXKhnB3WNhgy5PzU9uvHbaaRrZWQK6ixPxW',
    serumBids: '69W6zLetZ7FgXPXgHRp4i4wNd422tXeZzDuBzdkjgoBW',
    serumAsks: '42RcphsKYsVWDhaqJRETmx74RHXtHJDjZLFeeDrEL2F9',
    serumEventQueue: 'ExbLY71YpFaAGKuHjJKXSsWLA8hf1hGLoUYHNtzvbpGJ',
    serumCoinVaultAccount: '6qH3FNTSGKw34SEEj7GXbQ6kMQXHwuyGsAAeV5hLPhJc',
    serumPcVaultAccount: '6AdJbeH76BBSJ34DeQ6LLdauF6W8fZRrMKEfLt3YcMcT',
    serumVaultSigner: '5uJEd4wfVH84HyFEBf5chfJMTTPHBddXi1S7GmBE6x14',
    official: true
  },
  {
    name: 'WOO-USDC',
    coin: { ...TOKENS.WOO },
    pc: { ...TOKENS.USDC },
    lp: { ...LP_TOKENS['WOO-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'DSkXJYPZqJ3yHQECyVyh3xiE3HBrt7ARmepwNDA9rREn',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '6WHHLn8ia2eHZnPFPDwBKaW2nt7vTRNsvrbgzS55gVwi',
    ammTargetOrders: 'HuSyM774u2zhjbG8rQYCrALBHhK7yVWgUP36rNEtfTs2',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'HeMxCh5SozqLth4QPpU1cbEw29ueqFUKSYP6369GX1HV',
    poolPcTokenAccount: 'J3jwx9wsRAq1sBu5tSsKpA4ixQVzLiLyRKdxkjMcRenv',
    poolWithdrawQueue: 'FRSDrhT8Q28yZ3dGhVwNoAbzWawsE3qgmAAEwxTNtE6y',
    poolTempLpTokenAccount: 'GP8hM7HRSjcsQfTbvHKNAWnwhqdn2Nxthb4UJiKXkfJC',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '2Ux1EYeWsxywPKouRCNiALCZ1y3m563Tc4hq1kQganiq',
    serumBids: '34oLSEmDGyH4NyP84mUXCHbpW9JvG5anNd3iPaCF55zE',
    serumAsks: 'Lp7h84DcAmWqhDbJ6LpvVX9m45GJQfpvMbWPTg4qtkF',
    serumEventQueue: '8Y7MaACCFcTdjcUSLsGkxqxMLDaJDPSZtT5R1kuUL1Hk',
    serumCoinVaultAccount: '54vv5QSZkmHpQzpvUmpS5ZreDwmbuXPdbGp9ybzgcsTM',
    serumPcVaultAccount: '7PL69dV89XXJg9V6wzzdu9p2ymhVwBWqp82sUzWvjnp2',
    serumVaultSigner: 'CTcvsPoWroF2e2iiZWe6ztBwNQHiDyAVCs8EbQ5Annig',
    official: true
  },
  {
    name: 'SNY-USDC',
    coin: { ...TOKENS.SNY },
    pc: { ...TOKENS.USDC },
    lp: { ...LP_TOKENS['SNY-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '5TgJXpv6H3KJhHCuP7KoDLSCmi8sM8nABizP7CmYAKm1',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '2Nr82a2ZxqsQYwBbpeLWQedy1s9kAi2U2AbeuMKjgFzw',
    ammTargetOrders: 'Cts3uDVAgUSaXAHMEfLPnQWF4W5TpGdiB7WhYDAaQbSy',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'FaUYbopmMVdNRe3rLnqGPBA2KB96nLHudKaEgAUcvHXn',
    poolPcTokenAccount: '9YiW8N9QdEsAdTQN8asjebwwEmDXAHRnb1E3nvz64vjg',
    poolWithdrawQueue: 'HpWzYHXNeQkmW9oxFjHFozyy6sVxetqJBZdhNSTwcNid',
    poolTempLpTokenAccount: '7QAVG74PVZntmFqvnGYwYySRBjB13HSeSNABwMPtfAPR',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'DPfj2jYwPaezkCmUNm5SSYfkrkz8WFqwGLcxDDUsN3gA',
    serumBids: 'CFFoYkeUJaAEh6kQyVEbAgkWfABnH7c8Lynr2hk8ycJT',
    serumAsks: 'AVQEVeftGzTV6Yj2jEPFGgWHyTYs5uyT3ZFFyTaLgTAP',
    serumEventQueue: 'H6UE5r8zMsaHW9fha6Xm7bsWrYbyaL8WbBjhbqbZYPQM',
    serumCoinVaultAccount: 'CddTJJj2tDWUk6Kteh3KSBJJh4HvkoWMXcQjZuXaaAzP',
    serumPcVaultAccount: 'BGr1LWgHKaekkmScogSU1SYSRUaJBBPFeBAEBvuwf7CE',
    serumVaultSigner: '3APrMUDUQ16iEsL4vTaovTf5fPXAEwtXmWXvD9xQVPaB',
    official: true
  },
  {
    name: 'BOP-RAY',
    coin: { ...TOKENS.BOP },
    pc: { ...TOKENS.RAY },
    lp: { ...LP_TOKENS['BOP-RAY-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'SJmR8rJgzzCi4sPjGnrNsqY4akQb3jn5nsxZBhyEifC',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '8pt8zWa9hsRSsiCJtVWnApXGBkmzSubjqf9sbgkbj9LS',
    ammTargetOrders: 'Gg6gGVaokrVMJWtgDbamPwVG8PBN3VbgHLFghfSn3JxY',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'B345z8QcC2WvCwKjeTveLHAuEghumw2qH2xPxAbW7Awd',
    poolPcTokenAccount: 'EPFPMhTRNA6f7J1NzEZ1rkWyhfexZBr9VX3MAn3C6Ce4',
    poolWithdrawQueue: 'E8PcDA6vn9WHRsrMYZvKy2D2CxTB28Bp2cKAYcu16JH9',
    poolTempLpTokenAccount: '47GcR2477mHukyTte1LpDShs4RUmkcF2rejJvisRFALB',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '6Fcw8aEs7oP7YeuMrM2JgAQUotYxa4WHKHWdLLXssA3R',
    serumBids: '3CNgQ6KpTQYKX9s1CSy5y16ZtnXqYfcTHikmHjEjXKJm',
    serumAsks: '7VxSfKDL7i3FmpJLnK4v7YgidNa1t7SCo84FY7YinQyA',
    serumEventQueue: '9ote3YanmgQgL6vPBUGJVZyFsp6HDJNviTw7ghxzMDLT',
    serumCoinVaultAccount: 'CTv9hnW3nbANzJ2yyzmyMCoUxv5s95ndxcBbLzV39z3w',
    serumPcVaultAccount: 'GXFttVfXbH7rU6GJnBVs3LyyuiPU8a6sW2tv5K5ZGEAQ',
    serumVaultSigner: '5JEwQ7hM1qFCBwJkZ2JyjkoJ99ojJXRx2bFjLcFobDvC',
    official: true
  },
  {
    name: 'SLRS-USDC',
    coin: { ...TOKENS.SLRS },
    pc: { ...TOKENS.USDC },
    lp: { ...LP_TOKENS['SLRS-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '7XXKU8oGDbeGrkPyK5yHKzdsrMJtB7J2TMugjbrXEhB5',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '3wNRVMaot3R2piZkzmKsAqewcZ5ABktqrJZrc4Vz3uWs',
    ammTargetOrders: 'BwSmQF7nxRqzzVdfaynxM98dNbXFi94cemDDtxMfV3SB',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '6vjnbp6vhw4RxNqN3e2tfE3VnkbCx8RCLt8RBmHZvuoC',
    poolPcTokenAccount: '2anKifuiizorX69zWQddupMqawGfk3TMPGZs4t7ZZk43',
    poolWithdrawQueue: 'Fh5WTfP9jCbkLPzsspCs4WCSPGqE5GYE8v7kqFXijMSA',
    poolTempLpTokenAccount: '9oiniKrJ7r1cHw97gv4XPxTFS9i61vSa7PkpRcm8qGeK',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '2Gx3UfV831BAh8uQv1FKSPKS9yajfeeD8GJ4ZNb2o2YP',
    serumBids: '6kMW5vafM4mWZJdBNpH4EsVjFSuSTUokx5meYoVY8GTw',
    serumAsks: 'D5asu2BVatxtgGFugwmNubdknAsLSJDZcqRHvkaS8UBd',
    serumEventQueue: '66Go3JcjNJaDHHvJyaFaV8rh8GAciLzvM8WzN7fRE3HM',
    serumCoinVaultAccount: '6B527pfkvbvbLRDgjASLGygdaQ1fFLwmmqyFCgTacsKH',
    serumPcVaultAccount: 'Bsa11vdveUhSouxAXSYCE4yXToUP58N9EEeM1P8qbtp3',
    serumVaultSigner: 'CjiJdQ9a7dnjTKfVPZ2fwn31NtgJA1kRU55pwDE8HHrM',
    official: true
  },
  {
    name: 'SAMO-RAY',
    coin: { ...TOKENS.SAMO },
    pc: { ...TOKENS.RAY },
    lp: { ...LP_TOKENS['SAMO-RAY-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'EyDgEU9BdG7m6ZK4bYERxbN4NCJ129WzPtv23dBkfsLg',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '45TD9SmkGoq4hBxBnsQQD2V7pyWK53HkEXz7uNNHpezG',
    ammTargetOrders: 'Ave8ozwW9iBGL4SpK1tM1RfrQi8CsLUFj4UGdFkWRPRp',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '9RFqA8EbTTqH3ct1fTGiGgqFAg2hziUdtyGgg1w69LJP',
    poolPcTokenAccount: 'ArAyYYib2X8BTcURYNXKhfoUww2DWkzk67PRPGVpFAuJ',
    poolWithdrawQueue: 'ASeXk7dri8jz466wCtkCVUYheHFEznX55EMuGivL5WPL',
    poolTempLpTokenAccount: '2pu8zUYpwa9UEPvKkQvZHQUbbTdMg6N2mXi2Vv4DaEJV',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'AAfgwhNU5LMjHojes1SFmENNjihQBDKdDDT1jog4NV8w',
    serumBids: 'AYEeLrFWhGDRgX9L428SqBU56iVzDSyP3A6Db4VekcjE',
    serumAsks: 'CctHQdpAtxugQNFU7PA4ebb2T5K1ZkwDTvoFrsYrxifY',
    serumEventQueue: 'CFtHmFydRBtw1qsoPZ4LufbdX39LKT9Aw5HzUib9JpiL',
    serumCoinVaultAccount: 'BpHuL7HNTJDDGiw4ELpnYQdhTNNgZ53ennhtkQjGawGS',
    serumPcVaultAccount: 'BzsbZPiwLMJHhSFNVdtGqi9MWKhYijgq34Z6YjYkQJUr',
    serumVaultSigner: 'F2f14Nw7kqBeGwgFymm7sEPcZrKWWN56hvN5yx2vc6sE',
    official: true
  },
  {
    name: 'renBTC-USDC',
    coin: { ...TOKENS.renBTC },
    pc: { ...TOKENS.USDC },
    lp: { ...LP_TOKENS['renBTC-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '61JtCkTQKSeBU8ztEScByZiBhS6KAHSXfQduVyA4s1h7',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'AtFR9ub2dbNJJod7gPL81F7gRxVtpcR1n4GczqgasqX2',
    ammTargetOrders: 'ZVmcXezubm6FXvS8Wtvah66vqZRW6NKD17tea7FcGsB',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '2cA595zqm12sRtsiNvV6AqD8WDYYiJoLwEYNQ1FZG2ep',
    poolPcTokenAccount: 'Fxn92YfcVsd9diz32YtKixqmuezgLeSWqd1gypFL5qe',
    poolWithdrawQueue: 'ioR3UfTLnz6t9Bzbcu7TPmw1xYQRwXCgGqcpvzRmCQx',
    poolTempLpTokenAccount: '8VEBvPwhBwu9D4e4Zei6X31ZBs5udL5epJHp935LVMv1',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '74Ciu5yRzhe8TFTHvQuEVbFZJrbnCMRoohBK33NNiPtv',
    serumBids: 'B1xjpD5EEVtLWnWioHc7pCJLj1WVGyKdyMV1NzY4q5pa',
    serumAsks: '6NZf4f6dxxv83Bdfiyf1R1vMFo5QP8BLB862qrVkmhuS',
    serumEventQueue: '7RbmehbSunJLpg7N6kaCX5SenR1N79xHN8jKnuvXoEHC',
    serumCoinVaultAccount: 'EqnX836tGG4PYSBPgzzQecbTP47AZQRVfcy4RqQW8F3D',
    serumPcVaultAccount: '7yiA6p6BXxZwcm38St3vTzyGNEmZjw8x7Ko2nyTfvVx3',
    serumVaultSigner: '9aZNHmGZrNnB3fKmBj5B9oD7moA1nFviZqNUSkx2tctg',
    official: true
  },
  {
    name: 'renDOGE-USDC',
    coin: { ...TOKENS.renDOGE },
    pc: { ...TOKENS.USDC },
    lp: { ...LP_TOKENS['renDOGE-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '34oD4akb2DeNcCw1smKHPsD3iqQQQWmNy3cY81nz7HP8',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '92QStSTSQHYFg2ZxJjxWETwiS3zYsKnJm9BznJ8JDvrh',
    ammTargetOrders: 'EHjwgEneTm6DZWGbictuSxf7NfcirEjyYdzYaSyNkhT1',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'EgNtpEoLCiSJx8TtVLWUBpXhUWmqzBrymgweihtmnd83',
    poolPcTokenAccount: 'HZHCa82ezeYegyQWtsWW3vznpoiRaa3ewtxYvm5X6tTz',
    poolWithdrawQueue: 'FbWCd9uQfAD5M62Pyceff5S2WFeN9Z5rL6azysGdhais',
    poolTempLpTokenAccount: 'H12qWVeehVN6CQGfwCnSH2LxcHJ9we33U6gPmiViueu5',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '5FpKCWYXgHWZ9CdDMHjwxAfqxJLdw2PRXuAmtECkzADk',
    serumBids: 'EdXd7dZLfkjz4k38VoP8d8ij7UJdrnZ3EoR9RHr5ThqX',
    serumAsks: 'DuGkNca9NtZByzAxQsbt5yPFNF8pyv2PqB2sjSbBGEWi',
    serumEventQueue: 'AeRsgcjxerNiMK1wpPyt7TSkH9Ps1mTr9Ac1bbWvYhdp',
    serumCoinVaultAccount: '5UbUbaVLXnZq1eibQSUxdsk6Lp38bgdTjbjQPssXGgwW',
    serumPcVaultAccount: '4KMsmK7gPdKMAKmEcHqtBB5EhNnWVRd71v3a5uBwhQ2T',
    serumVaultSigner: 'Gwe1pE3rV4LLviNZqrEFPAeLchwvHrftBUQsnJtEkpSa',
    official: true
  },
  {
    name: 'RAY-USDC',
    coin: { ...TOKENS.RAY },
    pc: { ...TOKENS.USDC },
    lp: { ...LP_TOKENS['RAY-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '6UmmUiYoBjSrhakAobJw8BvkmJtDVxaeBtbt7rxWo1mg',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'J8u8nTHYtvudyqwLrXZboziN95LpaHFHpd97Jm5vtbkW',
    ammTargetOrders: '3cji8XW5uhtsA757vELVFAeJpskyHwbnTSceMFY5GjVT',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'FdmKUE4UMiJYFK5ogCngHzShuVKrFXBamPWcewDr31th',
    poolPcTokenAccount: 'Eqrhxd7bDUCH3MepKmdVkgwazXRzY6iHhEoBpY7yAohk',
    poolWithdrawQueue: 'ERiPLHrxvjsoMuaWDWSTLdCMzRkQSo8SkLBLYEmSokyr',
    poolTempLpTokenAccount: 'D1V5GMf3N26owUFcbz2qR5N4G81qPKQvS2Vc4SM73XGB',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '2xiv8A5xrJ7RnGdxXB42uFEkYHJjszEhaJyKKt4WaLep',
    serumBids: 'Hf84mYadE1VqSvVWAvCWc9wqLXak4RwXiPb4A91EAUn5',
    serumAsks: 'DC1HsWWRCXVg3wk2NndS5LTbce3axwUwUZH1RgnV4oDN',
    serumEventQueue: 'H9dZt8kvz1Fe5FyRisb77KcYTaN8LEbuVAfJSnAaEABz',
    serumCoinVaultAccount: 'GGcdamvNDYFhAXr93DWyJ8QmwawUHLCyRqWL3KngtLRa',
    serumPcVaultAccount: '22jHt5WmosAykp3LPGSAKgY45p7VGh4DFWSwp21SWBVe',
    serumVaultSigner: 'FmhXe9uG6zun49p222xt3nG1rBAkWvzVz7dxERQ6ouGw',
    official: true
  },
  {
    name: 'RAY-SRM',
    coin: { ...TOKENS.RAY },
    pc: { ...TOKENS.SRM },
    lp: { ...LP_TOKENS['RAY-SRM-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'GaqgfieVmnmY4ZsZHHA6L5RSVzCGL3sKx4UgHBaYNy8m',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '7XWbMpdyGM5Aesaedh6V653wPYpEswA864sBvodGgWDp',
    ammTargetOrders: '9u8bbHv7DnEbVRXmptz3LxrJsryY1xHqGvXLpgm9s5Ng',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '3FqQ8p72N85USJStyttaohu1EBsTsEZQ9tVqwcPWcuSz',
    poolPcTokenAccount: '384kWWf2Km56EReGvmtCKVo1BBmmt2SwiEizjhwpCmrN',
    poolWithdrawQueue: '58z15NsT3JJyfywFbdYzn2GVeDDC444WHyUrssZ5tCm7',
    poolTempLpTokenAccount: '8jqpuijsM2ne5dkwLyjQxa9oCbYEjM6bE1uBaFXmC3TE',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'Cm4MmknScg7qbKqytb1mM92xgDxv3TNXos4tKbBqTDy7',
    serumBids: 'G65a5G6xHpc9zV8tGhVSKJtz7AcAJ8Q3hbMqnDJQgMkz',
    serumAsks: '7bKEjcZEqVAWsiRGDnxXvTnNwhZLt2SH6cHi5hpcg5de',
    serumEventQueue: '4afBYfMNsNpLQxFFt72atZsSF4erfU28XvugpX6ugvr1',
    serumCoinVaultAccount: '5QDTh4Bpz4wruWMfayMSjUxRgDvMzvS2ifkarhYtjS1B',
    serumPcVaultAccount: '76CofnHCvo5wEKtxNWfLa2jLDz4quwwSHFMne6BWWqx',
    serumVaultSigner: 'AorjCaSV1L6NGcaFZXEyUrmbSqY3GdB3YXbQnrh85v6F',
    official: true
  },
  {
    name: 'RAY-ETH',
    coin: { ...TOKENS.RAY },
    pc: { ...TOKENS.ETH },
    lp: { ...LP_TOKENS['RAY-ETH-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '8iQFhWyceGREsWnLM8NkG9GC8DvZunGZyMzuyUScgkMK',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '7iztHknuo7FAXVrrpAjsHBEEjRTaNH4b3hecVApQnSwN',
    ammTargetOrders: 'JChSqhn6yyEWqD95t8UR5DaZZtEZ1RGGjdwgMc8S6UUt',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'G3Szi8fUqxfZjZoNx17kQbxeMTyXt2ieRvju4f3eJt9j',
    poolPcTokenAccount: '7MgaPPNa7ySdu5XV7ik29Xoav4qcDk4wznXZ2Muq9MnT',
    poolWithdrawQueue: 'C9aijsE3tLbVyYaXXHi45qneDL5jfyN8befuJh8zzpou',
    poolTempLpTokenAccount: '3CDnyBsNnexdvfvo6ASde5Q4e72jzMQFHRRkSQr49vEG',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '6jx6aoNFbmorwyncVP5V5ESKfuFc9oUYebob1iF6tgN4',
    serumBids: 'Hdvh4ZGL9MkiQApNqfZtdmd4jM6Sz8e9akCUuxxkYhb8',
    serumAsks: '7vWmTv9Mh8XbAxcduEqed2dLtro4N7hFroqch6mMxYKM',
    serumEventQueue: 'EgcugBBSwM2FxqLQx5S6zAiU9x9qRS8qMVRMDFFU4Zty',
    serumCoinVaultAccount: 'EVVtYo4AeCbmn2dYS1UnhtfjpzCXCcN26G1HmuHwMo7w',
    serumPcVaultAccount: '6ZT6KwvjLnJLpFdVfiRD9ifVUo4gv4MUie7VvPTuk69v',
    serumVaultSigner: 'HXbRDLcX2FyqWJY95apnsTgBoRHyp7SWYXcMYod6EBrQ',
    official: true
  },
  {
    name: 'RAY-SOL',
    coin: { ...TOKENS.RAY },
    pc: { ...NATIVE_SOL },
    lp: { ...LP_TOKENS['RAY-SOL-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'AVs9TA4nWDzfPJE9gGVNJMVhcQy3V9PGazuz33BfG2RA',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '6Su6Ea97dBxecd5W92KcVvv6SzCurE2BXGgFe9LNGMpE',
    ammTargetOrders: '5hATcCfvhVwAjNExvrg8rRkXmYyksHhVajWLa46iRsmE',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'Em6rHi68trYgBFyJ5261A2nhwuQWfLcirgzZZYoRcrkX',
    poolPcTokenAccount: '3mEFzHsJyu2Cpjrz6zPmTzP7uoLFj9SbbecGVzzkL1mJ',
    poolWithdrawQueue: 'FSHqX232PHE4ev9Dpdzrg9h2Tn1byChnX4tuoPUyjjdV',
    poolTempLpTokenAccount: '87CCkBfthmyqwPuCDwFmyqKWJfjYqPFhm5btkNyoALYZ',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'C6tp2RVZnxBPFbnAsfTjis8BN9tycESAT4SgDQgbbrsA',
    serumBids: 'C1nEbACFaHMUiKAUsXVYPWZsuxunJeBkqXHPFr8QgSj9',
    serumAsks: '4DNBdnTw6wmrK4NmdSTTxs1kEz47yjqLGuoqsMeHvkMF',
    serumEventQueue: '4HGvdannxvmAhszVVig9auH6HsqVH17qoavDiNcnm9nj',
    serumCoinVaultAccount: '6U6U59zmFWrPSzm9sLX7kVkaK78Kz7XJYkrhP1DjF3uF',
    serumPcVaultAccount: '4YEx21yeUAZxUL9Fs7YU9Gm3u45GWoPFs8vcJiHga2eQ',
    serumVaultSigner: '7SdieGqwPJo5rMmSQM9JmntSEMoimM4dQn7NkGbNFcrd',
    official: true
  },
  {
    name: 'DXL-USDC',
    coin: { ...TOKENS.DXL },
    pc: { ...TOKENS.USDC },
    lp: { ...LP_TOKENS['DXL-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'asdEJnE7osjgnSyQkSZJ3e5YezbmXuDQPiyeyiBxoUm',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '4zuyAKT81y9mSSrjq8sN872zwgcD5ncQGyCXwRJDn6tC',
    ammTargetOrders: 'H2GMj87upPeBQT3ywzqudJodwyTFpPmwuwtiZ7DQB8Md',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'FHAqAqqdyZFaxUTCg19hH9pRfKKChwNekFrY428NVPtT',
    poolPcTokenAccount: '7jzwUCSq1R1QX72PKRDjZ4xgUm6Q6iiLW9BY8tnj8wkc',
    poolWithdrawQueue: '3WBnh4HbddG6sMvv6s1GALVLPq6xfwVat3WqufZKKFXa',
    poolTempLpTokenAccount: '9DRSmvcrXC7AtNrhf9tgfBuwT4q5hXyWaAybe5yfRU7q',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'DYfigimKWc5VhavR4moPBibx9sMcWYVSjVdWvPztBPTa',
    serumBids: '2Z6Do29oGtze6dnVMXAVw8mkRxFpLGc8uS2RjfrWoCyy',
    serumAsks: 'FosLnuNKUKqfqYviAPdp1doC3dKpXQXvAeRGM5xAoUCJ',
    serumEventQueue: 'EW5QgqGUZ7dSmXLXiuWB8AAsjSjpb8kaaoxAUqK1DWyg',
    serumCoinVaultAccount: '9ZaKDVrjCaPRZTqnuteGc8iBmJhdaGVf8JV2HBT67wbX',
    serumPcVaultAccount: '5Y65XyuJemmRU7G1AQQTvWKSge8WDVYhb2knd7htJHoh',
    serumVaultSigner: 'y6FHXgMwWvvpoiox6Ut6mUAUHgbJMXNJnXQm7MQkEdE',
    official: true
  },
  {
    name: 'LIKE-USDC',
    coin: { ...TOKENS.LIKE },
    pc: { ...TOKENS.USDC },
    lp: { ...LP_TOKENS['LIKE-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'GmaDNMWsTYWjaXVBjJTHNmCWAKU6cn5hhtWWYEZt4odo',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'Crn5beRFeyj4Xw13E2wdJ9YkkLLEZzKYmtTV4LFDx3MN',
    ammTargetOrders: '7XjS6MrvBRi9JeFWBMAYPaKhKgR3b7xnVdYDBkFb4CXR',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '8LoHX6f6bMdQVs4mThoH2KwX2dQDSkqVFADi4ZjDQv9T',
    poolPcTokenAccount: '2Fwm8M8vuPXEXxvKz98VdawDxsK9W8uRuJyJhvtRdhid',
    poolWithdrawQueue: 'CW9zJ2JbBekkdd5SdvPapPcbziR8d1UHBzW7nNn1W3ga',
    poolTempLpTokenAccount: 'FVHsnC1nhwMcrAzFwcK4dgUtDdYFM1VrTJ8Rp8Mb1LkY',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '3WptgZZu34aiDrLMUiPntTYZGNZ72yT1yxHYxSdbTArX',
    serumBids: 'GzHpnQSfS7KdqLKgiEEP7pkYnwEBz9zaE7De2CjmCrNV',
    serumAsks: 'FpEBAT9qP1so4ASUTiEWxyXH2SJvgoBYUiZ1AbPimcS7',
    serumEventQueue: 'CUMDMV9KtE22RUZECUNHxiq7FmUiRusyKa1rHUJfRptq',
    serumCoinVaultAccount: 'Dd9F1fugQj2xtduyNvFS5TtxP9vKnuxVMcrPsHFnLyqp',
    serumPcVaultAccount: 'BnXXu8kLUXrwg3MpcVRVPLZw9bpX2mLd95qtCMnSUtu7',
    serumVaultSigner: 'MKCHeoqNGWU8TJBkdF1M76nMUteJCwuBRUJfCtR3iV7',
    official: true
  },
  {
    name: 'mSOL-USDC',
    coin: { ...TOKENS.mSOL },
    pc: { ...TOKENS.USDC },
    lp: { ...LP_TOKENS['mSOL-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'ZfvDXXUhZDzDVsapffUyXHj9ByCoPjP4thL6YXcZ9ix',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '4zoatXFjMSirW2niUNhekxqeEZujjC1oioKCEJQMLeWF',
    ammTargetOrders: 'Kq9Vgb8ntBzZy5doEER2p4Zpt8SqW2GqJgY5BgWRjDn',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '8JUjWjAyXTMB4ZXcV7nk3p6Gg1fWAAoSck7xekuyADKL',
    poolPcTokenAccount: 'DaXyxj42ZDrp3mjrL9pYjPNyBp5P8A2f37am4Kd4EyrK',
    poolWithdrawQueue: 'CfjpUvQAoU4hadb9nReTCAqBFFP7MpJyBW97ezbiWgsQ',
    poolTempLpTokenAccount: '3EdqPYv3hLJFXC3U9LH7yA7HX6Z7gRxT7vGQQJrxScDH',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '6oGsL2puUgySccKzn9XA9afqF217LfxP5ocq4B3LWsjy',
    serumBids: '8qyWhEcpuvEsdCmY1kvEnkTfgGeWHmi73Mta5jgWDTuT',
    serumAsks: 'PPnJy6No31U45SVSjWTr45R8Q73X6bNHfxdFqr2vMq3',
    serumEventQueue: 'BC8Tdzz7rwvuYkJWKnPnyguva27PQP5DTxosHVQrEzg9',
    serumCoinVaultAccount: '2y3BtF5oRBpLwdoaGjLkfmT3FY3YbZCKPbA9zvvx8Pz7',
    serumPcVaultAccount: '6w5hF2hceQRZbaxjPJutiWSPAFWDkp3YbY2Aq3RpCSKe',
    serumVaultSigner: '9dEVMESKXcMQNndoPc5ji9iTeDJ9GfToboy8prkZeT96',
    official: true
  },
  {
    name: 'mSOL-SOL',
    coin: { ...TOKENS.mSOL },
    pc: { ...NATIVE_SOL },
    lp: { ...LP_TOKENS['mSOL-SOL-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'EGyhb2uLAsRUbRx9dNFBjMVYnFaASWMvD6RE1aEf2LxL',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '6c1u1cNEELKPmuH352WPNNEPdfTyVPHsei39DUPemC42',
    ammTargetOrders: 'CLuMpSesLPqdxewQTxfiLdifQfDfRsxkFhPgiChmdGfk',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '85SxT7AdDQvJg6pZLoDf7vPiuXLj5UYZLVVNWD1NjnFK',
    poolPcTokenAccount: 'BtGUR6y7uwJ6UGXNMcY3gCLm7dM3WaBdmgtKVgGnE1TJ',
    poolWithdrawQueue: '7vvoHxA6di9EvzJKL6bmojbZnH3YaRXu2LitufrQhM21',
    poolTempLpTokenAccount: 'ACn8TZ27fQ85kgdPKUfkETB4dS5JPFoq53z7uCgtHDai',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '5cLrMai1DsLRYc1Nio9qMTicsWtvzjzZfJPXyAoF4t1Z',
    serumBids: 'JAABQk3n6S8W85LC6RpqTvGgP9wJFb8kfqir6kUhBXkQ',
    serumAsks: 'psFs3Dm7quZZn3BhvrT1LdWCVtbMqxXanU7ZYdHULj6',
    serumEventQueue: '4bmSJJCrx3dehFQ8kXAE1c4L9kfP8DyHow4tFw6aRJZe',
    serumCoinVaultAccount: '2qmHPJn3URkrboLiJkQ5tBB4bmYWdb6MyhQzZ6ms7wf9',
    serumPcVaultAccount: 'A6eEM36Vpyti2PoHK8h8Dqk5zu7YTaSRTQb7XXL8tcrV',
    serumVaultSigner: 'EHMK3DdPiPBd9aBjeRU4aZjD7z568rmwHCSAAxRooPq6',
    official: true
  },
  {
    name: 'MER-PAI',
    coin: { ...TOKENS.MER },
    pc: { ...TOKENS.PAI },
    lp: { ...LP_TOKENS['MER-PAI-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '6GUF8Qb5FWmifzYpRdKomFNbSQAsLShhT45GbTGg34VJ',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'Gh3w9pfjwbZX2FVrMy6PzUQG5rhihKduGCB7UaPGUTZw',
    ammTargetOrders: '37k5Xe8Sej1TrjrGsR2HyRR1EjYECV1HcS3Xh6Jnxggi',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'ApnMY7ahxTMssU1dzxYEfMcag1aSa5s4Axje3nqnnrXH',
    poolPcTokenAccount: 'BuQxGhmS82ZhczEGbUyi9R7TjxczXTMRoD4nQ4GvqxCf',
    poolWithdrawQueue: 'CrvN8Zi4c6BHVFc3mAB8CZSZRftY73WtpBH2Zade9MKZ',
    poolTempLpTokenAccount: '5W9V96yUqk95zUYawoCfEittj4VT4Nbv8NVjevJ4kN78',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'FtxAV7xEo6DLtTszffjZrqXknAE4wpTSfN6fBHW4iZpE',
    serumBids: 'Hi6bo1sodi7X2GrpeVpk5mKKG42Ga8n4Gi3Fxr2WK6rg',
    serumAsks: '75a4ASjShTXZPdxNzm4RoSEVydLBFfDa1V81Wcf7Xw59',
    serumEventQueue: '7WDqc3MAApvgDskQBDKVVPmya3Src228sAk8Lag8ovph',
    serumCoinVaultAccount: '2Duueu4HUnv6e4qUqdM4DKECM9X3XggBsXp5eLYuSLXe',
    serumPcVaultAccount: '3GEqHH6VAnyqrgG9jRB4Qy9PMTYJmSBvg7u3LtBWHEWD',
    serumVaultSigner: '7cBPvLMQvf1X5rzLMNKrx7TY5M186rTR49yJNHNSp81s',
    official: true
  },
  {
    name: 'PORT-USDC',
    coin: { ...TOKENS.PORT },
    pc: { ...TOKENS.USDC },
    lp: { ...LP_TOKENS['PORT-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '6nJes56KF999Q8VtQTrgWEHJGAfGMuJktGb8x2uWff2u',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'ENfqr7WFKJy9VRwfDkgL4HvMM6GU7pHyowzZsZwx8P39',
    ammTargetOrders: '9wjp6tFY1XNH6KhdCHeDgeUsNLVjTwxA3iC9k5aun2NW',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'GGurDvQctUDgcegSYZetkNGytcWEfLes6yXzYruhLuLP',
    poolPcTokenAccount: '3FmHEQRHaKMS4vA41eYTVmfxX9ErxdAScS2tvgWvNHSz',
    poolWithdrawQueue: 'ETie1oDMcoTD8jzrseAcvTqZYyyoWxR92LH15nA6Lfub',
    poolTempLpTokenAccount: 'GEJfHTwURq89KcM1RgvFZRweb4f7H8NAsmyMg2kTPBEs',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '8x8jf7ikJwgP9UthadtiGFgfFuyyyYPHL3obJAuxFWko',
    serumBids: '9Y24T3co7Cc7cGbG2mFc9n3LQonAWgtayqfLz3p28JPa',
    serumAsks: '8uQcJBapCnxy3tNEB8tfmssUvqYWvuCsSHYtdNFbFFjm',
    serumEventQueue: '8ptDxtRLWXAKYQYRoRXpKmrJje31p8dsDsxeZHEksqtV',
    serumCoinVaultAccount: '8rNKJFsd9yuGx7xTTm9sb23JLJuWJ29zTSTznGFpUBZB',
    serumPcVaultAccount: '5Vs1UWLxZHHRW6yRYEEK3vpzE5HbQ8BFm27PnAaDjqgb',
    serumVaultSigner: '63ZaXnSj7SxWLFEcjmK79fyGokJxhR3UEXomN7q7Po25',
    official: true
  },
  {
    name: 'MNGO-USDC',
    coin: { ...TOKENS.MNGO },
    pc: { ...TOKENS.USDC },
    lp: { ...LP_TOKENS['MNGO-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '34tFULRrRwh4bMcBLPtJaNqqe5pVgGZACi5sR8Xz95KC',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '58G7RrYRntVvVj9rVgDwGhAJoWhMWHNyDCoMydYUwSR6',
    ammTargetOrders: '2qBcjDqDywhB7Kgb1VYq8K5svJh37BB8oC5kBE4VqA7q',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '91fMidHL8Yr8KRcu4Zu2RPRRg1FbXxZ7DV43rAyKRLjn',
    poolPcTokenAccount: '93oFfbcayY2WkcR6d9AyqPcRC121dXmWarFJkwPErRRE',
    poolWithdrawQueue: 'FhnSdMoRPj75bLs6yzaDPFfiuucUZhVDiyM78WEhaKJo',
    poolTempLpTokenAccount: 'FZAwAb6UxNiwDTbQZ3bPKYA4PkbYpurh8YpAH8G424Lv',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '3d4rzwpy9iGdCZvgxcu7B1YocYffVLsQXPXkBZKt2zLc',
    serumBids: '3nAdH9wTEhPoW4e2s8K2cXfn4jZH8FBCkUqtzWpsZaGb',
    serumAsks: 'HxbWm3iabHEFeHG9LVGYycTwn7aJVYYHbpQyhZhAYnfn',
    serumEventQueue: 'H1VVmwbM96BiBJq46zubSBm6VBhfM2FUhLVUqKGh1ee9',
    serumCoinVaultAccount: '7Ex7id4G37HynuiCAv5hTYM4BnPB9y4NU85QcaNWZy3G',
    serumPcVaultAccount: '9UB1NhGeDuV1apHdtK5LeAEjP7kZFH8vVYGdh2yGFRi8',
    serumVaultSigner: 'BFkxdUwW17eANhfs1xNmBqEcegb4EStQxVb5VaMS2dq6',
    official: true
  },
  {
    name: 'ATLAS-USDC',
    coin: { ...TOKENS.ATLAS },
    pc: { ...TOKENS.USDC },
    lp: { ...LP_TOKENS['ATLAS-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '2bnZ1edbvK3CK3LTNZ5jH9anvXYCmzPR4W2HQ6Ngsv5K',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'EzYB1U93e8E1KGJdUzmnwgNBFMP9E1XAuyosmiPGLAvD',
    ammTargetOrders: 'DVxJDo3E9zfGgvSkC2DYS5fsv5AyXA7gXpcs1fHFrP3y',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'FpFV46UVvRtcrRvYtKYgJpJtP1tZkvssjhrLUfoj8Cvo',
    poolPcTokenAccount: 'GzwX68f1ZF4dKnAJ58RdET8sPvvnYktbDEHmjoGw7Umk',
    poolWithdrawQueue: '26SuCukyzbYo5kzeufaSoMjRPStAwqfVzTXb4QGynTit',
    poolTempLpTokenAccount: 'HcoA8ucDBjEUVMjvURaS9CZgdEUbq8jRieGabq48mCL8',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'Di66GTLsV64JgCCYGVcY21RZ173BHkjJVgPyezNN7P1K',
    serumBids: '2UabAccF1AFPcNqv9D46JgyGnErnaYAJuCwyaT5dCkHc',
    serumAsks: '9umNLTbks7S51TEB8XF4jeCxwyq3qmdHrFDMFB8cT1gv',
    serumEventQueue: 'EYU32k5waRUxF521k2KFSuhEj11HQvg4MbQ9tFXuixLi',
    serumCoinVaultAccount: '22a8dDQwHmmnW4M4WuSXHC9NdQAufZ2V8at3EtPzBqFj',
    serumPcVaultAccount: '5Wu76Qx7EoiR79zVVV49cZDYZ5csZaKFiHKYtCjF9FNU',
    serumVaultSigner: 'FiyZW6n5VE64Yubn2PUFAxbmB2FZXhYce74LzJUhqSZg',
    official: true
  },
  {
    name: 'POLIS-USDC',
    coin: { ...TOKENS.POLIS },
    pc: { ...TOKENS.USDC },
    lp: { ...LP_TOKENS['POLIS-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '9xyCzsHi1wUWva7t5Z8eAvZDRmUCVhRrbaFfm3VbU4Mf',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '12A4SGay36i2cSwA4JSdvg7rWSmCz8JzhsoDqMM8Yns7',
    ammTargetOrders: '6bszsB6zxw2YowrEm26XYhh57HKQEVMRx5YMvPSSVQNh',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '7HgvC7GdmUt7kMivdLMovLStW25avFsW9GDXgNr525Uy',
    poolPcTokenAccount: '9FknRLGpWBqYg7fXQaBDyWWdu1v2RwUM6zRV6CiPjWBD',
    poolWithdrawQueue: '6uN62R1i31QVoy9cmQAeDrfLccMZDjQ2gmwv2D4iBTJT',
    poolTempLpTokenAccount: 'FJV66MrqZW8VYGmTuAupstwYtqfF6ULLPP9voYtnc8DS',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'HxFLKUAmAMLz1jtT3hbvCMELwH5H9tpM2QugP8sKyfhW',
    serumBids: 'Bc5wovapX1tRjZfyZVpsGH73Gq5LGN4ANsj8kaEhfY7c',
    serumAsks: '4EHg2ANFFEKLFkpLxgiyinJ1UDWsG2p8rVoAjFfjMDKc',
    serumEventQueue: 'qeQC4u5vpo5QMC17V5UMkQfK67vu3DHtBYVT1hFSGCK',
    serumCoinVaultAccount: '5XQ7xYE3ujVA21HGbvFGVG4pLgqVHSfR9anz2EfmZ3nA',
    serumPcVaultAccount: 'ArUDWPwzGQFfa7t7nSdkp1Dj6tYA3icXEq8K7goz9WoG',
    serumVaultSigner: 'FHX9fPAUVA1MxPme28f4eeVH81QVRHDWofa2V6FUJaiR',
    official: true
  },
  {
    name: 'ATLAS-RAY',
    coin: { ...TOKENS.ATLAS },
    pc: { ...TOKENS.RAY },
    lp: { ...LP_TOKENS['ATLAS-RAY-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'F73euqPynBwrgcZn3fNSEneSnYasDQohPM5aZazW9hp2',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '2CbuxnkjsBvaQoAubc5MAmbeZSMn36z8sZnfMvZWH1vb',
    ammTargetOrders: '6GZrucFa9hAQW7yHiPt3oZj9GkL6oBipngyY1Hw3zMx',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '33UaaUmmySzxK7q3yhmQiXMrW1tQrwqojyD6ZEFgM6FZ',
    poolPcTokenAccount: '9SYRTwYE5UV2cxEuRz8iiJcV8gMbMnJUYFC8zgDAsUwB',
    poolWithdrawQueue: '6bznLHPLPA3axnRfjh3sFzkxeMUQDLWhDuaHzjGL1EE6',
    poolTempLpTokenAccount: 'FnmoaJqFYHotLTG2Ur84jSUmVUACVWrBvBvRHdPzhqvb',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'Bn7n597jMxU4KjBPUo3QwJhbqr5145cHy31p6EPwPHwL',
    serumBids: '9zAgdk4Na8fBKLiTWzsqZwgYQETuHBDjPe2GYqHy17L',
    serumAsks: 'Fv6MY3w7PP7A54cuPQHevQNuwekGy8yksXWioBsyVd42',
    serumEventQueue: '75iVJf9QKovBdsvgxcCFfwn2N4QyxEXyKxQdBvZTdzjr',
    serumCoinVaultAccount: '9tBagdm862GCoxZNFvXv7HFjLUFmypxPYxfiT3j9S3h3',
    serumPcVaultAccount: '4oc1kGhKByyxRnh3oXupjTn5P6JwWPnoxwvLxjZzi2vE',
    serumVaultSigner: 'EK2TjcyoXzUweNJnJupQf6sZK8756mvBJeGBvi6y18Cq',
    official: true
  },
  {
    name: 'POLIS-RAY',
    coin: { ...TOKENS.POLIS },
    pc: { ...TOKENS.RAY },
    lp: { ...LP_TOKENS['POLIS-RAY-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '5tho4By9RsqTF1rbm9Akiepik3kZBT7ffUzGg8bL1mD',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'UBa61sKev8gr19nqVyN3BZbW2jG7eAGjbjeZvpU4wu8',
    ammTargetOrders: 'FgMtC8pDrSQJUovmnrDiRWgLGVrVSq9kui98re6uRz5i',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'Ah9T12tzwnTXWrWVWzLmCrwCEmVHS7HMdWKG4qLUDzJP',
    poolPcTokenAccount: 'J7kjQkrpafcLjL7cCpmMamxLAFnCkGApLTC2QrbHe2NQ',
    poolWithdrawQueue: 'EgZgi8skDug7YecbFuCFxXx3SPFPhbGSVrGiNzLHErkj',
    poolTempLpTokenAccount: 'TYw7qQDt6sqpwUFSRfNBaLHEA1SUxbEWtmZxtZQhojk',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '3UP5PuGN6db7NhWf4Q76FLnR4AguVFN14GvgDbDj1u7h',
    serumBids: '4tAuffNhWeF2MDWjMDgrRoR8X8Jg3BLvUAaerXzLsFpG',
    serumAsks: '9W133475h1LZ2ZzY7aJtbJajLDSCn5hNnKcsu6gXgE2G',
    serumEventQueue: '5DX4tJ8jZt91XzM7JUUPhu6CL4o6UDGnfjLJZtkmEfVT',
    serumCoinVaultAccount: 'pLD9GMk4LACBXDJAWJSgbT1batbHgunBVyy8BaVBazG',
    serumPcVaultAccount: 'Ah3JVyTAGLbH63XPWDDnJUwV1xYwHhFX2J81CDHomkLk',
    serumVaultSigner: '5RqVkFy8hUbYDR81ucZhF6rAwpgYJngLJLSynMTeC4vM',
    official: true
  },
  {
    name: 'ALEPH-RAY',
    coin: { ...TOKENS.ALEPH },
    pc: { ...TOKENS.RAY },
    lp: { ...LP_TOKENS['ALEPH-RAY-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '8Fr3wxZXLtiSozqms5nF4XXGHNSNqcMC6K6MvRqEfk4a',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'GrTQQTca8U7QpNiThwHfiQuFVihvSkkNPchhkKr7PMy',
    ammTargetOrders: '7WCvFBFN3fjU5hKJjPF2rHLAyXfzGCEqJ8qbqKLBaGTv',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '4WzdFwdKaXLQdFn9i84asMxdr6Fmhmh3qd6uC2xjBXwd',
    poolPcTokenAccount: 'yFWn8ji7zq24UDg1mMqP1mA3vWyUdkjARQUPZCS5iCf',
    poolWithdrawQueue: 'J9QSrJtasvLydL5dgbfv55eqBoADM9z91kVi5hpxk36Y',
    poolTempLpTokenAccount: 'fGohyeWwAGqGdjQsHrE4c6GoTC1xHmyiAxJsgz2uZZ9',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '4qATPNrEGqE4yFJhXXWtppzJj5evmUaZ5LJspjL6TRoU',
    serumBids: '84wPUTporXrCAceD753fXdiysry7WNkpiJH5HwhV5PwC',
    serumAsks: 'BDcmopZQkPoxkk1BLAeh4zR3oWeDFUXTkrD2fJgh8xYu',
    serumEventQueue: '4PiUj2EFVq8YNjMd8zWCUe7dV2prLEJCucapjzTeiShv',
    serumCoinVaultAccount: '7dCAQbfwtDFtLwNgoB2WahCubPhFjZRGjfVYJajcF6qJ',
    serumPcVaultAccount: '2DsQ33R4GqqBkmxPdFyBy7WYAzyWYm6BNPqKtENAKXuY',
    serumVaultSigner: 'DDyP6zj3GTK3hTRyjPuaEL9yyqgfdstRMMKCkn939pkp',
    official: true
  },
  {
    name: 'TULIP-RAY',
    coin: { ...TOKENS.TULIP },
    pc: { ...TOKENS.RAY },
    lp: { ...LP_TOKENS['TULIP-RAY-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'Dm1Q15216uRARmQTbo6VfnyEGVzRvLTm4TfCWWX4MF3F',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '2x6JvLToztTWoiYAXFvLw9R8Ump3aDcuiRPBY9ZuzoRL',
    ammTargetOrders: 'GZzyFjERxn9CqS5jXq1o2J3zmSNmhPMzn7U4aMJ82wL',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '96VnEN3nhvyb6hLSyP6BGsvSFdTJycQtTr574Kavrje8',
    poolPcTokenAccount: 'FhnZ1j8C8d7aXecxQXEGpRycoH6uJ1Fpncj4Sm33J2iS',
    poolWithdrawQueue: 'ELX79G4JU2YQrykozCvaRnhU2dBFmxNpSrJD3BoRoxfE',
    poolTempLpTokenAccount: 'BagZFcJSYZzQn3iS37sPFDPiaKsfUwo8YD98XsEMKrsd',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'GXde1EjpxVV5fzhHJcZqdLmsA3zmaChGFstZMjWsgKW7',
    serumBids: '2ty8Nq6brwkp74n6EtJkD8msgBnc3fRiavNGrE5d7yE3',
    serumAsks: 'GzztpwBixtLW1vqZwtNZH7FvyGJcRmLvCZTffCW2ZoS2',
    serumEventQueue: '4EgxxtAL5zsc1GCR243EU2vpbYpSvsawyfznVuRYbGHm',
    serumCoinVaultAccount: 'JD1MfYD2SXiY1j6p3H6DifpG6RAe8cAtmNNLdRAdB1aT',
    serumPcVaultAccount: 'UtkM2zbygo9tig18DQJDdRjHSKQiMf5uSuDTR2kf7ov',
    serumVaultSigner: '3yRCDVhumspJgYJnNhyJaXTjRn5jiMqdbQ13rTyHHQgQ',
    official: true
  },
  {
    name: 'SLRS-RAY',
    coin: { ...TOKENS.SLRS },
    pc: { ...TOKENS.RAY },
    lp: { ...LP_TOKENS['SLRS-RAY-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'J3CoGcJqHquUdSgS7qAwdGbp3so4EpLX8eVDdGuauvi',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'FhtXN2pPZ8JMxGcLKSfRJtGsorSCXBKJyw3n7SsEc1aR',
    ammTargetOrders: '2hdnnbsAu7pCf6nX5fDKPAdThLZmmWFQ7Kcq2cdShPGW',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '8QWf745UQeyMyM1qAAsCeb73jTvQvpm2diVgjNvHgbVX',
    poolPcTokenAccount: '5TsxBaazJ7Zdx4x4Zd2zC7TY98EVSwGY7hnioS2omkx1',
    poolWithdrawQueue: '6w9z1TGNkMU2qBHj5wzfaoqCLn7cPLKvPa23qeffsn9U',
    poolTempLpTokenAccount: '39VEjufVUfdASteaQstBT25zQuLUha8ZrqYQfcDdJ47A',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'BkJVRQZ7PjfwevMKsyjjpGZ4j6sBu9j5QTUmKuTLZNrq',
    serumBids: '8KouZyh14hmqurZZd1YRpwZ9pMVkWWHPnKTsETSYUuQQ',
    serumAsks: 'NBpY6i9KbWx2V5sS3iP54KYYaHg8aVB6WB43ibVFUPo',
    serumEventQueue: 'BMZfHb6CkiYwdgfVkAiiy4SWf6PHuRPFZyZWQNw1uDZx',
    serumCoinVaultAccount: 'F71huJuAGZ8Q9xVxQueLQ8vDQD6Nq8MkJJsyM2S937sy',
    serumPcVaultAccount: 'AbmAd3LgTowBANXnCNPLctxL7PReirJv5VcizvQ3mfah',
    serumVaultSigner: 'E91Pu1z4q4Nr5mGSVcwyDzzbQC3LdDBzmFyLoXfXfg17',
    official: true
  },
  {
    name: 'MER-RAY',
    coin: { ...TOKENS.MER },
    pc: { ...TOKENS.RAY },
    lp: { ...LP_TOKENS['MER-RAY-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'BKLCqnuk4qc5iHWuJuewMxuvsNZXuTBSUyRT5ftnRb6H',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'qDqpetCPbbV2n8bgcy4urhDcKYkUNVoEn7xaCQSDzKv',
    ammTargetOrders: '7KU9VPAZ8BMXA29gadnpssgtcoo4Tm1LYnc6Sn5HefcL',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'rmnAGzEwFnim88JLhqj66B86QLJL6cgm3tPDfGiKqZf',
    poolPcTokenAccount: '4Lm4c4NqNyobLGULtHRtgoG4hbX7ytuGQFFcdip4jvBb',
    poolWithdrawQueue: '9qwtjaEnTCHFf6GuTNxPf85hFzJVNJAAXJnWNFi4DmkX',
    poolTempLpTokenAccount: 'H9uyyChWbaXCmNmQu3g4fqKF5xsa7YVZiMvGcsVrCcNn',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '75yk6hSTuX6n6PoPRxEbXapJbbXj4ynw3gKgub7vRdUf',
    serumBids: '56zkA91Mad1HBJpiq8baMi9XhvvnTRNyd6m8hzeu5arh',
    serumAsks: 'BgovKK4YP6ZgLUHsnXeUym1BH5BSjUxDuinTk6shPuzd',
    serumEventQueue: '5NVyybcVeC8wqjgBj3ZxaX3RauWa2iqvdXkUYPJnistu',
    serumCoinVaultAccount: 'EaFu94rusrGHjJWhuuUbKWW2AJizDGbpWJXJa4cxmLCP',
    serumPcVaultAccount: 'ApZdrWpBu2uLkYAeVLneWnDhVrbR6TjhjbBR78kpg5r2',
    serumVaultSigner: 'FCf82FB2TFAfH4YEDkBJtEeSkTK1EQFc27d1iSnvXMjk',
    official: true
  },
  {
    name: 'MEDIA-RAY',
    coin: { ...TOKENS.MEDIA },
    pc: { ...TOKENS.RAY },
    lp: { ...LP_TOKENS['MEDIA-RAY-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '5ZPBHzMr19iQjBaDgFDYGAx2bxaQ3TzWmSS7zAGrHtQJ',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'HhAqmp3r8gaKo9P1ybaEXpwjq5MfmkfD6sRVD4EYs1tU',
    ammTargetOrders: '3Dwo6BD7H2GQMyxoh5nXdmAK7dWfqPMUj3PcrJVqUuEp',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'FGskpuYNgqgHU4kHSibgqDkYCCZhxAtpQxZNqFaKfBDK',
    poolPcTokenAccount: '7AiT1Re8Z8m8eLdy5HWRqWvx6pBZMytdWQ3wL8zCrSNp',
    poolWithdrawQueue: '7reJT6i8tnFjf5vbvmRLw6ikZZxs6ZJ8bsEx4iCU22ot',
    poolTempLpTokenAccount: '6LmFCURzNyEsNpF4fgMDyGPX1xoNAnm2oVcrYJJQGv9Y',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '2STXADodK1iZhGh54g3QNrq2Ap4TMwrAzV3Ja14UXut9',
    serumBids: 'FKgbQ8Sdv9d44SMrtLMy58EmP3V59fvjse2UUQ8mNCxd',
    serumAsks: 'CNcZwNeBA1QVL1Kzq3n166RSvUocLrKNs4nzTGXgVPuE',
    serumEventQueue: 'FwHwAcBc54zm8XjtNxvaZG1t84shzYs68z3BAsKZdoE',
    serumCoinVaultAccount: 'Ea7ECm7a3ECLnvJJMpZS9QrWbYnb8LkqVvWCXtmFVzWX',
    serumPcVaultAccount: '54a18egZToocQ2yeCstCrtYZLAj3z82qfLG4Ed1quThb',
    serumVaultSigner: 'F1XJJ2fkPiiYg1hWnDD6phMfDd8Sr8XwM6GKFeAZpTmr',
    official: true
  },
  {
    name: 'SNY-RAY',
    coin: { ...TOKENS.SNY },
    pc: { ...TOKENS.RAY },
    lp: { ...LP_TOKENS['SNY-RAY-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'Am9FpX73ctZ3HzohcRdyCCv84iT7nugevqLjY5yTSUQP',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'BFxUhqhrUWqMMazhef1dwDGXDo1LkQYV2YAgMfY81Evo',
    ammTargetOrders: 'AKp1o6Nxe224Z8z4tFzyFKdCRoJDFpCen1xHyGXfyxKu',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'BjJMnG8c4zMHHZrvxP6ydKYGPkvXL5fF9gC38rtAu2Sx',
    poolPcTokenAccount: '7dwpWj95qzPoBFCL7qzgoj9zhjmNNoDyncbyJEYiRfv7',
    poolWithdrawQueue: '6g5sTJtMw1r9vx4RP5YkN3ZJpSssh7eH8QdVK986xLS2',
    poolTempLpTokenAccount: '9tHcrwFdxNNzosaTkqrejHNXkr2HasKSwczimjBh2F8Z',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'HFAsygpAgFq3f9YQ932ptoEsEdBP2ELJSAK5eYAJrg4K',
    serumBids: '6A6njiM3ByNbopETpEfbqsQci3NZecTzheg2YACVFXjc',
    serumAsks: '8YvHQkUCB7HxCAu3muytUTbEXuDGmroVcnwbkXydzyEH',
    serumEventQueue: '8syFMq2kMQV9beCJ9Y5T9TARgUii6aND5MDgDEAAGF73',
    serumCoinVaultAccount: 'F1LcTLXQhFf9ymAHnxFNovSdZttZiVjRBoqQxyPAEipj',
    serumPcVaultAccount: '64UEnruJCyjKUz8vdgZh3FwWwd53oSMY9Knd5dt5oVuK',
    serumVaultSigner: '3enyrrweGCtkVDvaiAkSo2d2tF7B899tWHGSDfEGKtNs',
    official: true
  },
  {
    name: 'LIKE-RAY',
    coin: { ...TOKENS.LIKE },
    pc: { ...TOKENS.RAY },
    lp: { ...LP_TOKENS['LIKE-RAY-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'DGSnfcE1kw4uDC6jgrsZ3s5CMfsWKN7JNjDNasHdvKfq',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '4hgUQQevH5BauWE1CGGsfsDZbnCUrjd6YsRHB2gQjRUb',
    ammTargetOrders: 'AD3TRMfAuTJXTdxsvJ3E9p6YK3GyNAGDSk4DX26mtmFC',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'HXmwydLeUB7JaLWhoPFkDLazQJwUuWCBi3M28p7WfwL7',
    poolPcTokenAccount: 'BDbjkVrTezpirdkk24MfXprJrAi3WXazr4L6DHT5buXi',
    poolWithdrawQueue: 'FFKXu8Q3kaQjnuZsicVyUQNNBwRRLFAT86WqDN8Yz2UV',
    poolTempLpTokenAccount: 'FJguakQVbJmhjVGrzakNGQo5WCm5HG1Uk23X6x75WtZz',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'E4ohEJNB86RkKoveYtQZuDX1GzbxE2xrbdjJ7EddCc5T',
    serumBids: '7vhuHsR1VxAGN4DD5EywRnW9nb7cX3VHcyrAKL1AAJ4v',
    serumAsks: 'KXrJ3YVBvSGpCRETy3M2ronxM55PU8xBmQ2wCWVzhpY',
    serumEventQueue: 'EMTQJ2v3dn4ndnV7UwZTiGTmSNPsVSCgdSN6w5QvCv2M',
    serumCoinVaultAccount: 'EENxPU4YaXqTLBgd5jHBHigpH74MZNq9WxcLaKVsVSvq',
    serumPcVaultAccount: '5c9DtqqCvj5du96cgUCSt2GZp8sreE7uV1Defmb615na',
    serumVaultSigner: 'GWnLv7RwJhceF3YNqawMyEJqg6WgZc6XtT7Bi6prjkyC',
    official: true
  },
  {
    name: 'COPE-RAY',
    coin: { ...TOKENS.COPE },
    pc: { ...TOKENS.RAY },
    lp: { ...LP_TOKENS['COPE-RAY-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '8hvVAhShYLPThcxrxwMNAWmgRCSjtxygj11EGHp2WHz8',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'HMwERnf6t8JTR8qnrQDDGxGL2PeBgpzzmQBJQgvXL3NS',
    ammTargetOrders: '9y7m8jaURWcehBkMt6ebgQ92mqaJzZfxW51wBv6dtGR8',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'CVCDGPwGmxHyt1HwfJgCYbskEXPTvKxZfR6nkZexFQi5',
    poolPcTokenAccount: 'DyHnyEW4MQ1J28JrqvY7AdMq6Djr3TjvczgsokQxj6YB',
    poolWithdrawQueue: 'PPCMh17bDnu6sZKhipEfXf4ASK4sTpHkWrEX3SBNKRV',
    poolTempLpTokenAccount: 'HReYRwCxu4qEjzkyjsdf67DyEUsWn1Tqf7eisvM3J7ro',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '6y9WTFJRYoqKXQQZftFxzLdnBYStvqrDmLwTFAUarudt',
    serumBids: 'Afj14X2pCvbgVzWFAXRC4XBS3B71hZFXiTpVaFEohdCe',
    serumAsks: 'GmZTkEYABdUej3QXXZSf8aeZ1UxLB2WaQ4dhVihKZPB8',
    serumEventQueue: '3PveQeVGVfaa4LpTjhuRtm1Xe3Y9q7iW7YQeGJZYKtc4',
    serumCoinVaultAccount: '9mQ22KCPTyFkJ4dp16Fhpd1pFrVmonS6SMa9L8nM6nLn',
    serumPcVaultAccount: 'BKGiYU9So4XMYYuYiV2d68kcR2wwLogKbi3rmg8ci4xt',
    serumVaultSigner: 'k5mhBL7yqEtAQs1WtUGdMT9eLLZkjambTd1Y4MyGouf',
    official: true
  },
  {
    name: 'ETH-SOL',
    coin: { ...TOKENS.ETH },
    pc: { ...NATIVE_SOL },
    lp: { ...LP_TOKENS['ETH-SOL-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '9Hm8QX7ZhE9uB8L2arChmmagZZBtBmnzBbpfxzkQp85D',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'GwFM8qoBwusXVbcdfreKV9q86vqdudnVtvhYfJWgtgB',
    ammTargetOrders: 'FQp9HzJKEFfiDSnV6qyQNoz8cEKsWHnV3yFqWrT1ThgN',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '59STNbqDpY1sj6m95jBPRiFwjtigtivHqQeJRUofWY2a',
    poolPcTokenAccount: 'HXz1MFnu9ANWfCBesnrzMZMPoFbUyyqPDKT67sqgT4rk',
    poolWithdrawQueue: 'GrLKNkFVyAdV1wXoBFYxMSSPJ3BNekggiZJERrPSnAE2',
    poolTempLpTokenAccount: 'AtQQZJUBrXs8nBKCHy4L2WovuEEVf7QnVWwgRdVbnKd4',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'HkLEttvwk2b4QDAHzNcVtxsvBG35L1gmYY4pecF9LrFe',
    serumBids: 'B38zSRMdSHYxnbsWCgY4GvSy4aRytkhqR5qVjaHsNXdA',
    serumAsks: 'E4hWT9G64hLDMY7VrGXfJ5cuU8jRzJsUYAi8fqep6Sqy',
    serumEventQueue: 'Bdy9encMZ7UpbEbdCgh5qDq8qQn4D31tFR45Bdas3f5y',
    serumCoinVaultAccount: 'HMPki4uRhncFhMHpLAacHCDAU4QazjgFTsB8SQgh6bMY',
    serumPcVaultAccount: 'BeWaZ85mTxmrYfS3J9E1jQQ5tKgDRA6qmTpksKnGeNps',
    serumVaultSigner: 'GPNCigFBsjNhXu3cbmU1uxfbGVuxCA8bJN4bobwDjuTm',
    official: true
  },
  {
    name: 'stSOL-USDC',
    coin: { ...TOKENS.stSOL },
    pc: { ...TOKENS.USDC },
    lp: { ...LP_TOKENS['stSOL-USDC-V4'] },
    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '6a1CsrpeZubDjEJE9s1CMVheB6HWM5d7m1cj2jkhyXhj',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '28NQqHxrqMYMQ67aWyn9AzZ1F16PYd4zvLpiiKnEZpsD',
    ammTargetOrders: 'B8nmqinHQjyqAnMWNiqSzs1Jb8VbMpX5k9VUMnDp1gUA',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'DD6oh3HRCvMzqHkGeUW3za4pLgWNPJdV6aNYW3gVjXXi',
    poolPcTokenAccount: '6KR4qkJN91LGko2gdizheri8LMtCwsJrhtsQt6QPwCi5',
    poolWithdrawQueue: '5i9pTTk9x7r8fx8mJMBCEN85URVLAnkLzZXKyoutUJhU',
    poolTempLpTokenAccount: 'GiuNbiBirwsBp9GuxGYgNUMMKGM6Qf6wqgnxbJFHTYFa',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '5F7LGsP1LPtaRV7vVKgxwNYX4Vf22xvuzyXjyar7jJqp',
    serumBids: 'HjJSzUbis6VhBZLCbSFN1YtvWLLdxutb7WEvymCLrBJt',
    serumAsks: '9e37wf6QUqe2s4J6UUNsuv6REQkwTxd47hXhDanm1adp',
    serumEventQueue: 'CQY7LwdZJrfLRZcmEzUYp34XJbxhnxgF4UXmLKqJPLCk',
    serumCoinVaultAccount: '4gqecEySZu6SEgCNhBJm7cEn2TFqCMsMNoiyski5vMTD',
    serumPcVaultAccount: '6FketuhRzyTpevhgjz4fFgd5GL9fHeBeRsq9uJvu8h9m',
    serumVaultSigner: 'x1vRSsrhXkSn7xzJfu9mYP2i19SPqG1gjyj3vUWhim1',
    official: true
  },
  {
    name: 'GRAPE-USDC',
    coin: { ...TOKENS.GRAPE },
    pc: { ...TOKENS.USDC },
    lp: { ...LP_TOKENS['GRAPE-USDC-V4'] },
    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'vVXfY15WdPsCmLvbiP4hWWECPFeAvPTuPNq3Q4BXfhy',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'A7RFkvmDFN4Qev8XgGAqSr5W75sNhhtCY3ZcGHZiDDo1',
    ammTargetOrders: 'HRiPQyFJfzF7WgC4g2cFbxuKgqn1vKVRjTCuZTNGim36',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'BKqBnj1TLpW4UEBbZn6aVoPLLBHDB6NTEL5nFNRqX7e7',
    poolPcTokenAccount: 'AN7XxHrrcFL7629WySWVA2Tq9inczxkbE6YqgZ31rDnG',
    poolWithdrawQueue: '29WgH1suwTnhL4JUwDMUQQpUzypet8PHEh8jQpZtiDBK',
    poolTempLpTokenAccount: '3XCGBJpfHV5VYkz92nqzRtHahTiHXjYzVs4PargSpYwS',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '72aW3Sgp1hMTXUiCq8aJ39DX2Jr7sZgumAvdLrLuCMLe',
    serumBids: 'F3PQsAGiFf8fSySjUGgP3NQdAGSnioAThncyfd26GKZ3',
    serumAsks: '6KyB4XprAw7Mgp1YMMsxRGx8T59Y5Lcu6s1FcwFrXy3i',
    serumEventQueue: 'Due4ZmGX2u7an9DPMvk3uX3sXYgngRatP1XmwzEgk1tT',
    serumCoinVaultAccount: '8FMjC6yopBVYTXcYSGdFgoh6AFpwTdkJAGXxBeoV8xSq',
    serumPcVaultAccount: '5vgxuCqMn7DUt6Le6EGhdMzZjPQrtD1x4TD9zGw3mPte',
    serumVaultSigner: 'FCZkJzztVTx6qKVec25jA3m4XjeGBH1iukGdDqDBHPvG',
    official: true
  },
  {
    name: 'LARIX-USDC',
    coin: { ...TOKENS.LARIX },
    pc: { ...TOKENS.USDC },
    lp: { ...LP_TOKENS['LARIX-USDC-V4'] },
    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
    ammId: 'A21ui9aYTSs3CbkscaY6irEMQx3Z59dLrRuZQTt2hJwQ',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '3eCx9tQqnPUUCgCwoF5pXJBBQSTHKsNtZ46YRzDxkMJf',
    ammTargetOrders: 'rdoSiCqvxNdnzuZNUZnsXGQpwkB1jNPctiS194UtK7z',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'HUW3Nsvjad7jdexKu9PUbrq5G7XYykD9us25JnqxphTA',
    poolPcTokenAccount: '4jBvRQSz5UDRwZH8vE6zqgqm1wpvALdNYAndteSQaSih',
    poolWithdrawQueue: 'Dt8fAfftoVcFicC8uHgKpWtdJHA8e4xCPeoVRCfounDy',
    poolTempLpTokenAccount: 'FQ3XFCQAEjK1U235pgaB9nRPU1fkQaLjKQiWYYNzB5Fr',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'DE6EjZoMrC5a3Pbdk8eCMGEY9deeeHECuGFmEuUpXWZm',
    serumBids: '2ngvymBN8J3EmGsVyrPHhESbF8RoBBaLdA4HBAQBTcv9',
    serumAsks: 'BZpcoVeBbBytjY6vRxoufiZYB3Te4iMxrpcZykvvdH6A',
    serumEventQueue: '2sZhugKekfxcfYueUNWNsyHuaYmZ2rXsKACVQHMrgFqw',
    serumCoinVaultAccount: 'JDEsHM4igV84vbH3DhZKvxSTHtswcNQqVHH9RDq1ySzB',
    serumPcVaultAccount: 'GKU4WhnfYXKGeYxZ3bDuBDNrBGupAnnh1Qhn91eyTcu7',
    serumVaultSigner: '4fGoqGi6jR78dU9TRdL5LvBUPjwnoUCBwxNjfFxcLaCw',
    official: true
  },
  {
    name: 'RIN-USDC',
    coin: { ...TOKENS.RIN },
    pc: { ...TOKENS.USDC },
    lp: { ...LP_TOKENS['RIN-USDC-V4'] },
    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
    ammId: '7qZJTK5NatxQJRTxZvHi3gRu4cZZsKr8ZPzs7BA5JMTC',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '21yKxhKmJSvUWpL3doX5QwjXKXuzm3oxCG7k5Kima6hu',
    ammTargetOrders: 'DaN1UZZ1ExraQi1Ghz8YS3pKaZG44PASbNiApysiRSRg',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '7NMCVudgyHKwVXA62Rv2cFrucQiNYE9b5MMvn4cVtCPW',
    poolPcTokenAccount: '4d9Q2ekDzHqX51Nu9EZHZ96PhGjLSpVosa5Nci7BbwLe',
    poolWithdrawQueue: 'DjHe1Sj7fouU5gJEiFz7C4Vd5TtvApEAxWr5EVhTuEps',
    poolTempLpTokenAccount: 'EpKgUgtmTL425M9ENLqbjupm5funsPdhVr37hB8hJiuy',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '7gZNLDbWE73ueAoHuAeFoSu7JqmorwCLpNTBXHtYSFTa',
    serumBids: '4mSS9iidPrVmMV9D7CNJia5zza2apmBLe3SmYW8SNPFR',
    serumAsks: '7ovw7s6Ta1EQY4PsMu1MvnHfUNyEDADacmc4Rd5m34UD',
    serumEventQueue: '2h7YS1nRQqc86jGKQLT29xnfBk9xVQrzXx9yiB21P5gK',
    serumCoinVaultAccount: '5JCpfGbNdFhXWxMFR4xefBfLEd2qxYgovEggS6wxtmQe',
    serumPcVaultAccount: 'FQfVJz7STBGMheiAAuZdF8ndyvbJhJZWJvpKhFKqSqYh',
    serumVaultSigner: 'DFoStusQdrMbHms9Sce3tiRwSHAnaPLEtXCaFAnrhSy3',
    official: true
  },
  {
    name: 'APEX-USDC',
    coin: { ...TOKENS.APEX },
    pc: { ...TOKENS.USDC },
    lp: { ...LP_TOKENS['APEX-USDC-V4'] },
    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
    ammId: '43UHp4TuwQ7BYsaULN1qfpktmg7GWs9GpR8TDb8ovu9c',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '5SrvK4rUdhRAekLxYnDb552x1DzQP4F42mydUcxMMNJD',
    ammTargetOrders: '8W9P9rDx5a8C234jWLaUT7x4RGUGscXx2oCpS3eMfGUo',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '3tMBycaDewfj2trk1HP1ZSRb4YEJQs6k7nFAk4jTrRtN',
    poolPcTokenAccount: 'DRDqm7rLuGnkh9RU1H2aaaJihRSU2Yg3WhropTWmcpWW',
    poolWithdrawQueue: 'HA1wfa31ogn6eMY6174gNVf9LGjfjAhBdMaYtCkWBLhx',
    poolTempLpTokenAccount: 'BPJ6HpvGBpQ5TUezSv3NzicANEq8Grma6QmPV1gXKnx8',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'GX26tyJyDxiFj5oaKvNB9npAHNgdoV9ZYHs5ijs5yG2U',
    serumBids: '3N3tX1CLNCsnEffqhNBkiQxo34VJBPE7dbYUWsy4M6UD',
    serumAsks: 'BLCo9efr528yH73zJU47FCDKzvsJAYFGdYkPgHb8yWxJ',
    serumEventQueue: '3St3PhenFusFH1Guo7WQhNeNSfwDNpJQScDJ1EhRcLai',
    serumCoinVaultAccount: 'CEGcRVzSbX5hGpsKsPX8zhTMm8N4xJSTH1VFEcWXRUmE',
    serumPcVaultAccount: '7Q1TDhNbhpN9KN3vCRk7WhPi2EaETSCkXpsTdaDppvAx',
    serumVaultSigner: 'GprUwgGyqBiEC5e6ivxgpUf7uhpS17n7WRiU7HDV3VGk',
    official: true
  },
  {
    name: 'mSOL-RAY',
    coin: { ...TOKENS.mSOL },
    pc: { ...TOKENS.RAY },
    lp: { ...LP_TOKENS['mSOL-RAY-V4'] },
    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
    ammId: '6gpZ9JkLoYvpA5cwdyPZFsDw6tkbPyyXM5FqRqHxMCny',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'HDsF9Mp9w3Pc8ZqQJw3NBvtC795NuWENPmTed1YVz5a3',
    ammTargetOrders: '68g1uhKVVLFG1Aua1BKtCx3uiwPixue1qqbKDJAc32Uo',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'BusJVbHEkJeYRpHkqCrt85d1LALS1EVcKRjqRFZtBSty',
    poolPcTokenAccount: 'GM1CjxKixFkKpakxx5Lg9u3zYjXAK2Gr2pzoy1G88Td5',
    poolWithdrawQueue: 'GDZx8SZSYsRKc1WfWfbqR9JaTdBEwHwAMcJuYk2rBm74',
    poolTempLpTokenAccount: 'EdLjP9p2AA7zKWwRPxKx8SKFCJ9awfSxnsPgURX6HuuJ',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'HVFpsSP4QsC8gFfsFWwYcdmvt3FepDRB6xdFK2pSQtMr',
    serumBids: '7ZCucutxHFwJjfUmxD1Pae8vYg9HB1WQ6DhRkueNyJqF',
    serumAsks: '6cM5rqTHhngGtifjK7pUwved3CdHKZgFj7nnP3LsP325',
    serumEventQueue: 'Gucy2LXDFjWBZEFX4gyrqr6xEb2AWRf4VVgqX33ZXkWu',
    serumCoinVaultAccount: 'GPksxJSxy5pEigdtSLBBZuRQEuGPJRT2ah3J1HwMeKm5',
    serumPcVaultAccount: 'TACxu78UJHz2Vzg2HwGa2w9mvLw2mY5mL7Q3ho9W6J9',
    serumVaultSigner: 'FD6U73ZW2YkD9R8cbDT6KSamVodYqWJBtS3ZcPeU7X29',
    official: true
  },
  {
    name: 'MNDE-mSOL',
    coin: { ...TOKENS.MNDE },
    pc: { ...TOKENS.mSOL },
    lp: { ...LP_TOKENS['MNDE-mSOL-V4'] },
    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
    ammId: '2kPA9XUuHUifcCYTnjSuN7ZrC3ma8EKPrtzUhC86zj3m',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'G3qeShDT2w3Y9XnJbk5TZsx1qbxkBLFmRsnNVLMnkNZb',
    ammTargetOrders: 'DfMpzNeT4XHs2xtN74j5q94QfqPSJbng5BgGyyyChsVm',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'F1zwWuPfYLZfLykDYUqu43A74TUsv8mHuWL6BUrwVhL7',
    poolPcTokenAccount: 'TuT7ftAgCQGsETei4Q4nMBwp2QLcDwKnixAEgFSBuao',
    poolWithdrawQueue: '5FoP78mNninxP5VbSHN3LfsBBbqMNqiucANGQungGJLV',
    poolTempLpTokenAccount: '2UbzfMCHjSERpMo9C3BAq5NUhVF9sx39ruJ1zu8Gf4Lu',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'AVxdeGgihchiKrhWne5xyUJj7bV2ohACkQFXMAtpMetx',
    serumBids: '9YBjtad6ZxR7hxNXyTjRRPnPgS7geiBMHbBp4BqHsgV2',
    serumAsks: '8UZpvreCr8bprUwstHMPb1pe5jQY82N9fJ1XLa3oKMXg',
    serumEventQueue: '3eeXmsg8byQEC6Q18NE7MSgSbnAJkxz8KNPbW2zfKyfY',
    serumCoinVaultAccount: 'aj1igzDQNRg18h9yFGvNqMPBfCGGWLDvKDp2NdYh92C',
    serumPcVaultAccount: '3QjiyDAny7ZrwPohN8TecXL4jBwGWoSUe7hzTiX35Pza',
    serumVaultSigner: '6Ysd8CE6KwC7KQYpPD9Ax8B77z3bWRnHt1SVrBM8AYC9',
    official: true
  },
  {
    name: 'LARIX-RAY',
    coin: { ...TOKENS.LARIX },
    pc: { ...TOKENS.RAY },
    lp: { ...LP_TOKENS['LARIX-RAY-V4'] },
    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
    ammId: 'EBqQdu9rGe6j3WGJQSyTvDjUMWcRd6uLcxSS4TbFT31t',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'MpAAS4U2fQnQRhTc1dAZEzLuQ9G4q6qRSUKwTJbYynJ',
    ammTargetOrders: 'A1w44YMFKvVXFnXYTrz7EVfSgjHdZfE67g59HdhE1Yfh',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '6Sq11euWaw2Hpd6bXMZccJLZpPcVgs3nhV7P5396jE7e',
    poolPcTokenAccount: '12iyJhJgr9AeJrL6q6jAN63zU3YgpPV98CR87c6JGoH4',
    poolWithdrawQueue: 'BD3rgKtrnxdi45UpCHEMrtBtSA2NRcpP9zrah1CWN35a',
    poolTempLpTokenAccount: 'Hc3pK8xppE3NxexxjAz4sxs3ZKwGjKfo7Lpth3FdGeQ6',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '5GH4F2Z9adqkEP8FtR4sJqvrVgBuUSrWoQAa7bVCdB44',
    serumBids: '8JdtK95nRc3sHkDdFdtMWvJ9fXFY67LMo74RiHTh8f3a',
    serumAsks: '99ScAmHwokD3Zs5assDwQHxunZe1Fz1N9GL9L1YUbvgr',
    serumEventQueue: 'feXvc7XGRDETboXZiCMShmSKvsTnZtxrKoBkjJMCkNf',
    serumCoinVaultAccount: '5uUh8pUvYzEjPtofPbappZBswKieWtLW7d32yuDNC6tw',
    serumPcVaultAccount: '6eRt1RkQokKk5gmVmJ85gY42xirTMXQ1QDLXiDmbXs4b',
    serumVaultSigner: '4pwBSrGHpVn1qXjzDC2Tm8nFG8mxR9y2qudFjAQ8cVQy',
    official: true
  },
  {
    name: 'LIQ-USDC',
    coin: { ...TOKENS.LIQ },
    pc: { ...TOKENS.USDC },
    lp: { ...LP_TOKENS['LIQ-USDC-V4'] },
    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
    ammId: '33dWwj33J3NUzoTmkMAUq1VdXZL89qezxkdaHdN88vK2',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'H4zMatEWC1cgzpJd4Ckw29M7FD6h6gpVYMs8ATkVYsee',
    ammTargetOrders: 'Gz9e8TUgQg2XwPvJs5CwijFyYgRL43LiB3CeWNTkkcsu',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'GGQU74M6ikrn8Cj7qywpmj6qdx2nKJLXGb34MbtPChoh',
    poolPcTokenAccount: 'DHoRYvCnFfL53zpq6ZbdHj9wdbtYpK4ip9ieFkk1TyLw',
    poolWithdrawQueue: '6gsvjkgSsxWtQRxYQ6J8uZPPhpgyoM6HwBJDpp2DzPon',
    poolTempLpTokenAccount: '7y59c7yGzLJGS8HmERaZgnbkgpKeAaAKSML3Jnsz4r4f',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'D7p7PebNjpkH6VNHJhmiDFNmpz9XE7UaTv9RouxJMrwb',
    serumBids: 'HNrzaujyABxtAcGyAqCJNcbfiJT4SLHGHuwBkVH4Zmiz',
    serumAsks: 'Fm2BPhsTnozBGLhFzd5iKfoBjKRWDEoCGC78xBEJg5P',
    serumEventQueue: 'CXhqNRvzdgrG8TRHjzUiymQFS7NNL8nGMyUvrQT3XPnu',
    serumCoinVaultAccount: 'GuivK7Kd7aiJT9gTnhDskqUpbUD5Yur3f2NyygvwhA9B',
    serumPcVaultAccount: 'ZKoVkBhZ9DJvuCMLvuPvZnhFTCQFAoF1BmVZZ1SqgPg',
    serumVaultSigner: 'GfX8cR4p9BWr47RknXetRvmHdCnbd1qRhi59kyibq6V4',
    official: true
  },
  {
    name: 'WAG-USDC',
    coin: { ...TOKENS.WAG },
    pc: { ...TOKENS.USDC },
    lp: { ...LP_TOKENS['WAG-USDC-V4'] },
    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
    ammId: 'FEFzBbbEK8yDigqyJPgJKMR5X1xZARC25QTCskvudjuK',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '8PAAfUWoVsSotWUGrL6CJCT2sApMpE2hn8DGWXq4y9Gs',
    ammTargetOrders: 'BFtdbsu9Tq8mup8osWretDzTbWF71WuzRBHtm7G6PVpS',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'AZPsv6tY1HQjmeps2sMje5ysNtPKsfbtxj5Qw3jcya1a',
    poolPcTokenAccount: '9D6JfNjyi6dXBYGErxmXmezkauPJdHW4KjMr2RGyD86Y',
    poolWithdrawQueue: '6i1US4rvtqxPUTwqq6ax381zVgry44rX3oG7gD7VJAef',
    poolTempLpTokenAccount: 'F6MrQn7qPTbDmp7ZGQkJ3ztB1uzBtVoc7iNcR6CyqCBM',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'BHqcTEDhCoZgvXcsSbwnTuzPdxv1HPs6Kz4AnPpNrGuq',
    serumBids: 'F61FtHm4R4F1gszB3FuwDPvXeSPQwNmHTofoYCnrV4FY',
    serumAsks: '5tYcHCW3ZZK4TMUSYiTi4dEE7iefyQ9dE17XDDAmDf92',
    serumEventQueue: 'C5gcq3kmmXJ6ADWvH3Pc8bpiBQCL5cx4ypRwPg5xxFFx',
    serumCoinVaultAccount: '6sF1TAJjfrNucAqaQFRrMD78z2RinTGeyo4KsXPbwiqh',
    serumPcVaultAccount: '5iXoDYXGnMxEwL65XTJHWdr6Z2UD5qq47ZijW24VSSSQ',
    serumVaultSigner: 'BuRLkxJffwznEsxXEqmXZJdLh4vQ1BRXc41sT6BtPV4X',
    official: true
  }
]
