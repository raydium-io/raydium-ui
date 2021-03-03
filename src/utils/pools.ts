import { LIQUIDITY_POOL_PROGRAM_ID_V2, SERUM_PROGRAM_ID_V2 } from './ids'
import { LP_TOKENS, NATIVE_SOL, TOKENS, TokenInfo } from './tokens'

import { cloneDeep } from 'lodash-es'

export interface LiquidityPoolInfo {
  name: string
  coin: TokenInfo
  pc: TokenInfo
  lp: TokenInfo

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
  serumCoinVaultAccount: string
  serumPcVaultAccount: string
  serumVaultSigner: string

  nonce: number
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
      (pool.coin.mintAddress === coinMintAddress &&
        pool.pc.mintAddress === pcMintAddress) ||
      (pool.coin.mintAddress === pcMintAddress &&
        pool.pc.mintAddress === coinMintAddress)
  )

  if (pool) {
    return cloneDeep(pool)
  }

  return pool
}

export function getLpMintByTokenMintAddresses(
  coinMintAddress: string,
  pcMintAddress: string
): string | null {
  const pool = LIQUIDITY_POOLS.find(
    (pool) =>
      (pool.coin.mintAddress === coinMintAddress &&
        pool.pc.mintAddress === pcMintAddress) ||
      (pool.coin.mintAddress === pcMintAddress &&
        pool.pc.mintAddress === coinMintAddress)
  )

  if (pool) {
    return pool.lp.mintAddress
  }

  return null
}

export function getPoolByLpMintAddress(
  lpMintAddress: string
): LiquidityPoolInfo | undefined {
  const pool = LIQUIDITY_POOLS.find(
    (pool) => pool.lp.mintAddress === lpMintAddress
  )

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
          return { key: 'lpMintAddress', lpMintAddress: pool.lp.mintAddress }
        }
      } else if (value === address) {
        return { key, lpMintAddress: pool.lp.mintAddress }
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
    nonce: 255,
  },
  {
    name: 'RAY-SOL',
    coin: { ...TOKENS.RAY },
    pc: { ...NATIVE_SOL },
    lp: { ...LP_TOKENS['RAY-SOL'] },

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
    nonce: 255,
  },
  {
    name: 'LINK-USDT',
    coin: { ...TOKENS.LINK },
    pc: { ...TOKENS.USDT },
    lp: { ...LP_TOKENS['LINK-USDT'] },

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
    nonce: 255,
  },
  {
    name: 'ETH-USDT',
    coin: { ...TOKENS.ETH },
    pc: { ...TOKENS.USDT },
    lp: { ...LP_TOKENS['ETH-USDT'] },

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
    nonce: 255,
  },
  {
    name: 'RAY-USDC',
    coin: { ...TOKENS.RAY },
    pc: { ...TOKENS.USDC },
    lp: { ...LP_TOKENS['RAY-USDC'] },

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
    nonce: 255,
  },
  {
    name: 'RAY-SRM',
    coin: { ...TOKENS.RAY },
    pc: { ...TOKENS.SRM },
    lp: { ...LP_TOKENS['RAY-SRM'] },

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
    nonce: 255,
  },
]
