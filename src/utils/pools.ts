import {
  LIQUIDITY_POOL_PROGRAM_ID_V2,
  LIQUIDITY_POOL_PROGRAM_ID_V3,
  LIQUIDITY_POOL_PROGRAM_ID_V4,
  SERUM_PROGRAM_ID_V2,
  SERUM_PROGRAM_ID_V3
} from './ids'
import { LP_TOKENS, NATIVE_SOL, TOKENS, TokenInfo } from './tokens'

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

export function getLpMintByTokenMintAddresses(
  coinMintAddress: string,
  pcMintAddress: string,
  version = 3
): string | null {
  const pool = LIQUIDITY_POOLS.find(
    (pool) =>
      ((pool.coin.mintAddress === coinMintAddress && pool.pc.mintAddress === pcMintAddress) ||
        (pool.coin.mintAddress === pcMintAddress && pool.pc.mintAddress === coinMintAddress)) &&
      pool.version === version
  )

  if (pool) {
    return pool.lp.mintAddress
  }

  return null
}

export function getPoolByLpMintAddress(lpMintAddress: string): LiquidityPoolInfo | undefined {
  const pool = LIQUIDITY_POOLS.find((pool) => pool.lp.mintAddress === lpMintAddress)

  if (pool) {
    return cloneDeep(pool)
  }

  return pool
}

// 获取某个地址是哪个池子的哪个 key
export function getAddressForWhat(address: string) {
  // 不能用 forEach
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

export const LIQUIDITY_POOLS: LiquidityPoolInfo[] = [
  {
    name: 'RAY-USDT',
    coin: { ...TOKENS.RAY },
    pc: { ...TOKENS.USDT },
    lp: { ...LP_TOKENS['RAY-USDT'] },

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
    serumVaultSigner: '6FYUBnwRVxxYCv1kpad4FaFLJAzLYuevFWmpVp7hViTn'
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
    serumVaultSigner: 'FhTczYTxkXMyofPMDQFJGHxjcnPrjrEGQMexob4BVwXD'
  },
  {
    name: 'LINK-USDT',
    coin: { ...TOKENS.LINK },
    pc: { ...TOKENS.USDT },
    lp: { ...LP_TOKENS['LINK-USDT'] },

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
    serumVaultSigner: '7bwfaV98FDNtWvgPMo7wY3nE7cE8tKfXkFAVzCxtkw6w'
  },
  {
    name: 'ETH-USDT',
    coin: { ...TOKENS.ETH },
    pc: { ...TOKENS.USDT },
    lp: { ...LP_TOKENS['ETH-USDT'] },

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
    serumVaultSigner: '4fgnxw343cfYgcNgWvan8H6j6pNBskBmGX4XMbhxtFbi'
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
    serumVaultSigner: 'Aj6H2siiKsnAdAS5YVwuJPdXrHaLodsSyKs7ZiEtEZQN'
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
    serumVaultSigner: 'EXZnYg9QCzujDwm621N286d4KLAZiMwpUv64GdECcxbm'
  },
  // v3
  {
    name: 'RAY-USDT',
    coin: { ...TOKENS.RAY },
    pc: { ...TOKENS.USDT },
    lp: { ...LP_TOKENS['RAY-USDT-V3'] },

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
    serumVaultSigner: '2hzqYES4AcwVkuMdNsNNqi1jqjfKSyL2BNus4kimVXNk'
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
    serumVaultSigner: 'FmhXe9uG6zun49p222xt3nG1rBAkWvzVz7dxERQ6ouGw'
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
    serumVaultSigner: 'AorjCaSV1L6NGcaFZXEyUrmbSqY3GdB3YXbQnrh85v6F'
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
    serumVaultSigner: '7SdieGqwPJo5rMmSQM9JmntSEMoimM4dQn7NkGbNFcrd'
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
    serumVaultSigner: 'HXbRDLcX2FyqWJY95apnsTgBoRHyp7SWYXcMYod6EBrQ'
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
    ammQuantities: '',
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
    serumVaultSigner: 'F7VdEoWQGmdFK35SD21wAbDWtnkVpcrxM3DPVnmG8Q3i'
  }
]
