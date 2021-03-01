export interface TokenInfo {
  symbol?: string
  name: string
  mintAddress: string
  decimals: number
  totalSupply?: number

  referrer?: string

  tokenAccountAddress?: string
  balance?: number
  uiBalance?: number
}

/**
 * Get token use symbol

 * @param {string} symbol

 * @returns {TokenInfo | null} tokenInfo
 */
export function getTokenBySymbol(symbol: string): TokenInfo | null {
  if (symbol === 'SOL') {
    return NATIVE_SOL
  }

  let token = TOKENS[symbol]

  if (token) {
    token.symbol = symbol
  } else {
    token = null
  }

  return token
}

/**
 * Get token use mint addresses

 * @param {string} mintAddress

 * @returns {TokenInfo | null} tokenInfo
 */
export function getTokenByMintAddress(mintAddress: string): TokenInfo | null {
  if (mintAddress === NATIVE_SOL.mintAddress) {
    return NATIVE_SOL
  }

  let token = null

  for (const symbol of Object.keys(TOKENS)) {
    const info = TOKENS[symbol]

    if (info.mintAddress === mintAddress) {
      token = info
      token.symbol = symbol
    }
  }

  return token
}

interface Tokens {
  [key: string]: any
  [index: number]: any
}

export const NATIVE_SOL: TokenInfo = {
  symbol: 'SOL',
  name: 'Native Solana',
  mintAddress: '11111111111111111111111111111111',
  decimals: 9,
}

export const TOKENS: Tokens = {
  WSOL: {
    mintAddress: 'So11111111111111111111111111111111111111112',
    name: 'Wrapped Solana',
    decimals: 9,
    referrer: 'HrY9PEaTvVrCwzjNqHdPqEB4KMQec8k7cttdrCsBdGbM',
  },
  BTC: {
    mintAddress: '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E',
    name: 'Wrapped Bitcoin',
    decimals: 6,
    referrer: 'GZpS8cY8Nt8HuqxzJh6PXTdSxc38vFUjBmi7eEUkkQtG',
  },
  ETH: {
    mintAddress: '2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk',
    name: 'Wrapped Ethereum',
    decimals: 6,
    referrer: '2Vi3SmRWTnK3H1hM7419ncU4cwwgnP3jf2CcG4uagqit',
  },
  USDC: {
    mintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    name: 'USDC',
    decimals: 6,
    referrer: 'HAvKWceWNm8Pwp1YERjZhaCg3XjK1KocPN332mtofg9z',
  },
  YFI: {
    mintAddress: '3JSf5tPeuscJGtaCp5giEiDhv51gQ4v3zWg8DGgyLfAB',
    name: 'Wrapped YFI',
    decimals: 6,
    referrer: 'DZjgzKfYzZBBSTo5vytMYvGdNF933DvuX8TftDMrThrb',
  },
  LINK: {
    mintAddress: 'CWE8jPTUYhdCTZYWPTe1o5DFqfdjzWKc9WKz6rSjQUdG',
    name: 'Wrapped Chainlink',
    decimals: 6,
    referrer: 'DRSKKsYZaPEFkRgGywo7KWBGZikf71R9aDr8tjtpr41V',
  },
  XRP: {
    mintAddress: 'Ga2AXHpfAF6mv2ekZwcsJFqu7wB4NV331qNH7fW9Nst8',
    name: 'Wrapped XRP',
    decimals: 6,
    referrer: '6NeHPXG142tAE2Ej3gHgT2N66i1KH6PFR6PBZw6RyrwH',
  },
  USDT: {
    mintAddress: 'BQcdHdAQW1hczDbBi9hiegXAR7A98Q9jx3X3iBBBDiq4',
    name: 'Wrapped USDT',
    decimals: 6,
    referrer: 'GdFfrjHgRS2y3bF1cjYr6XJ5zstNBbEqKetMffn6ouVy',
  },
  SUSHI: {
    mintAddress: 'AR1Mtgh7zAtxuxGd2XPovXPVjcSdY3i4rQYisNadjfKy',
    name: 'Wrapped SUSHI',
    decimals: 6,
    referrer: '59QxHeHgb28tDc3gStnrW8FNKC9qWuRmRZHBaAqCerJX',
  },
  ALEPH: {
    mintAddress: 'CsZ5LZkDS7h9TDKjrbL7VAwQZ9nsRu8vJLhRYfmGaN8K',
    name: 'Wrapped ALEPH',
    decimals: 6,
    referrer: '8FKAKrenJMDd7V6cxnM5BsymHTjqxgodtHbLwZReMnWW',
  },
  SXP: {
    mintAddress: 'SF3oTvfWzEP3DTwGSvUXRrGTvr75pdZNnBLAH9bzMuX',
    name: 'Wrapped SXP',
    decimals: 6,
    referrer: '97Vyotr284UM2Fyq9gbfQ3azMYtgf7cjnsf8pN1PFfY9',
  },
  HGET: {
    mintAddress: 'BtZQfWqDGbk9Wf2rXEiWyQBdBY1etnUUn6zEphvVS7yN',
    name: 'Wrapped HGET',
    decimals: 6,
    referrer: 'AGY2wy1ANzLM2jJLSkVxPUYAY5iAYXYsLMQkoQsAhucj',
  },
  CREAM: {
    mintAddress: '5Fu5UUgbjpUvdBveb3a1JTNirL8rXtiYeSMWvKjtUNQv',
    name: 'Wrapped CREAM',
    decimals: 6,
    referrer: '7WPzEiozJ69MQe8bfbss1t2unR6bHR4S7FimiUVRgu7P',
  },
  UBXT: {
    mintAddress: '873KLxCbz7s9Kc4ZzgYRtNmhfkQrhfyWGZJBmyCbC3ei',
    name: 'Wrapped UBXT',
    decimals: 6,
    referrer: '9aocFzNkSVj9TCS6cJk2uYyuzEpXPWT7xoBBF9JcZ879',
  },
  HNT: {
    mintAddress: 'HqB7uswoVg4suaQiDP3wjxob1G5WdZ144zhdStwMCq7e',
    name: 'Wrapped HNT',
    decimals: 6,
    referrer: 'B61oHrGCFh8P75Z2cRDiw2nbEwbMyhVfZhMWiwxU2qCV',
  },
  FRONT: {
    mintAddress: '9S4t2NEAiJVMvPdRYKVrfJpBafPBLtvbvyS3DecojQHw',
    name: 'Wrapped FRONT',
    decimals: 6,
    referrer: 'FnasnCc7c43hd2nanSmRjh9Sf9Cgz6aEvNj6wpDznS5h',
  },
  AKRO: {
    mintAddress: '6WNVCuxCGJzNjmMZoKyhZJwvJ5tYpsLyAtagzYASqBoF',
    name: 'Wrapped AKRO',
    decimals: 6,
    referrer: 'FihBmWJbiLSEvq4QZpPPdjokdMgxqq6pESZ7oMkE1qJH',
  },
  HXRO: {
    mintAddress: 'DJafV9qemGp7mLMEn5wrfqaFwxsbLgUsGVS16zKRk9kc',
    name: 'Wrapped HXRO',
    decimals: 6,
    referrer: '4NgrGZDRCzyqiwYvKPEePTKfQXtWzKmSDBoZJjRw6wNC',
  },
  UNI: {
    mintAddress: 'DEhAasscXF4kEGxFgJ3bq4PpVGp5wyUxMRvn6TzGVHaw',
    name: 'Wrapped UNI',
    decimals: 6,
    referrer: '4ntxDv95ajBbXfZyGy3UhcQDx8xmH1yJ6eKvuNNH466x',
  },
  SRM: {
    mintAddress: 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt',
    name: 'Serum',
    decimals: 6,
    referrer: 'AZgyihMGNBHxMAj1AZSbfh16YXE4zq7e6pXQTSHwbTaN',
  },
  FTT: {
    mintAddress: 'AGFEad2et2ZJif9jaGpdMixQqvW5i81aBdvKe7PHNfz3',
    name: 'Wrapped FTT',
    decimals: 6,
    referrer: 'CafpgSh8KGL2GPTjdXfctD3vXngNZDJ3Q92FTfV71Hmt',
  },
  MSRM: {
    mintAddress: 'MSRMcoVyrFxnSgo5uXwone5SKcGhT1KEJMFEkMEWf9L',
    name: 'MegaSerum',
    decimals: 0,
    referrer: 'Ge5q9x8gDUNYqqLA1MdnCzWNJGsbj3M15Yxse2cDbw9z',
  },
  WUSDC: {
    mintAddress: 'BXXkv6z8ykpG1yuvUDPgh732wzVHB69RnB9YgSYh3itW',
    name: 'Wrapped USDC',
    decimals: 6,
  },
  TOMO: {
    mintAddress: 'GXMvfY2jpQctDqZ9RoU3oWPhufKiCcFEfchvYumtX7jd',
    name: 'Wrapped TOMO',
    decimals: 6,
    referrer: '9fexfN3eZomF5gfenG5L9ydbKRQkPhq6x74rb5iLrvXP',
  },
  KARMA: {
    mintAddress: 'EcqExpGNFBve2i1cMJUTR4bPXj4ZoqmDD2rTkeCcaTFX',
    name: 'Wrapped KARMA',
    decimals: 4,
  },
  LUA: {
    mintAddress: 'EqWCKXfs3x47uVosDpTRgFniThL9Y8iCztJaapxbEaVX',
    name: 'Wrapped LUA',
    decimals: 6,
    referrer: 'HuZwNApjVFuFSDgrwZA8GP2JD7WMby4qt6rkWDnaMo7j',
  },
  MATH: {
    mintAddress: 'GeDS162t9yGJuLEHPWXXGrb1zwkzinCgRwnT8vHYjKza',
    name: 'Wrapped MATH',
    decimals: 6,
    referrer: 'C9K1M8sJX8WMdsnFT7DuzdiHHunEj79EsLuz4DixQYGm',
  },
  KEEP: {
    mintAddress: 'GUohe4DJUA5FKPWo3joiPgsB7yzer7LpDmt1Vhzy3Zht',
    name: 'Wrapped KEEP',
    decimals: 6,
  },
  SWAG: {
    mintAddress: '9F9fNTT6qwjsu4X4yWYKZpsbw5qT7o6yR2i57JF2jagy',
    name: 'Wrapped SWAG',
    decimals: 6,
  },
  FIDA: {
    mintAddress: 'EchesyfXePKdLtoiZSL8pBe8Myagyy8ZRqsACNCFGnvp',
    name: 'Bonfida',
    decimals: 6,
    referrer: 'AeAsG75UmyPDB271c6NHonHxXAPXfkvhcf2xjfJhReS8',
  },
  KIN: {
    mintAddress: 'kinXdEcpDQeHPEuQnqmUgtYykqKGVFq6CeVX5iAHJq6',
    name: 'KIN',
    decimals: 5,
    referrer: 'AevFXmApVxN2yk1iemSxXc6Wy7Z1udUEfST11kuYKmr9',
  },
  MAPS: {
    mintAddress: 'MAPS41MDahZ9QdKXhVa4dWB9RuyfV4XqhyAZ8XcYepb',
    name: 'MAPS',
    decimals: 6,
  },
  RAY: {
    mintAddress: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
    name: 'Raydium',
    decimals: 6,
    referrer: 'EzKxGKPF9wF5uKDzCMQnkHmqaBhHiS22372pCLvxfmtQ',
  },
}

export const LP_TOKENS: Tokens = {
  'RAY-USDT': {
    mintAddress: 'CzPDyvotTcxNqtPne32yUiEVQ6jk42HZi1Y3hUu7qf7f',
    name: 'RAY-USDT LP',
    decimals: 6,
  },
  'RAY-SOL': {
    mintAddress: '134Cct3CSdRCbYgq5SkwmHgfwjJ7EM5cG9PzqffWqECx',
    name: 'RAY-SOL LP',
    decimals: 6,
  },
  'LINK-USDT': {
    mintAddress: 'EVDmwajM5U73PD34bYPugwiA4Eqqbrej4mLXXv15Z5qR',
    name: 'LINK-USDT LP',
    decimals: 6,
  },
  'ETH-USDT': {
    mintAddress: 'KY4XvwHy7JPzbWYAbk23jQvEb4qWJ8aCqYWREmk1Q7K',
    name: 'ETH-USDT LP',
    decimals: 6,
  },
  'RAY-USDC': {
    mintAddress: 'FgmBnsF5Qrnv8X9bomQfEtQTQjNNiBCWRKGpzPnE5BDg',
    name: 'RAY-USDC LP',
    decimals: 6,
  },
  'RAY-SRM': {
    mintAddress: '5QXBMXuCL7zfAk39jEVVEvcrz1AvBGgT9wAhLLHLyyUJ',
    name: 'RAY-SRM LP',
    decimals: 6,
  },
}
