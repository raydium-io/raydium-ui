import {
  LIQUIDITY_POOL_PROGRAM_ID_V2,
  LIQUIDITY_POOL_PROGRAM_ID_V3,
  LIQUIDITY_POOL_PROGRAM_ID_V4,
  SERUM_PROGRAM_ID_V2,
  SERUM_PROGRAM_ID_V3
} from './ids'
import { LP_TOKENS, NATIVE_SOL, TOKENS, TokenInfo } from './tokens'
// @ts-ignore
import SERUM_MARKETS from '@project-serum/serum/lib/markets.json'
import { cloneDeep } from 'lodash-es'

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
  version = [3, 4]
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
  }
  // {
  //   name: 'SRM-USDT',
  // coin: { ...TOKENS.SRM },
  // pc: { ...TOKENS.USDT },
  // lp: { ...LP_TOKENS['SRM-USDT-V4'] },

  //   version: 4,
  //   programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

  //   ammId: '',
  //   ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
  //   ammOpenOrders: '',
  //   ammTargetOrders: '',
  //   // no need
  //   ammQuantities: NATIVE_SOL.mintAddress,
  //   poolCoinTokenAccount: '',
  //   poolPcTokenAccount: '',
  //   poolWithdrawQueue: '',
  //   poolTempLpTokenAccount: '',
  //   serumProgramId: SERUM_PROGRAM_ID_V3,
  //   serumMarket: '',
  //   serumBids: '',
  //   serumAsks: '',
  //   serumEventQueue: '',
  //   serumCoinVaultAccount: '',
  //   serumPcVaultAccount: '',
  //   serumVaultSigner: ''
  // }
]
