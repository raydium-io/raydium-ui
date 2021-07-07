import { TokenAmount } from '@/utils/safe-math'
import { cloneDeep } from 'lodash-es'

export interface TokenInfo {
  symbol: string
  name: string

  mintAddress: string
  decimals: number
  totalSupply?: TokenAmount

  referrer?: string

  details?: string
  docs?: object
  socials?: object

  tokenAccountAddress?: string
  balance?: TokenAmount
  tags: string[]
}

/**
 * Get token use symbol

 * @param {string} symbol

 * @returns {TokenInfo | null} tokenInfo
 */
export function getTokenBySymbol(symbol: string): TokenInfo | null {
  if (symbol === 'SOL') {
    return cloneDeep(NATIVE_SOL)
  }

  let token = cloneDeep(TOKENS[symbol])

  if (!token) {
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
    return cloneDeep(NATIVE_SOL)
  }
  const token = Object.values(TOKENS).find((item) => item.mintAddress === mintAddress)
  return token ? cloneDeep(token) : null
}

export interface Tokens {
  [key: string]: any
  [index: number]: any
}

export const TOKENS_TAGS: { [key: string]: { mustShow: boolean; show: boolean; outName: string } } = {
  raydium: { mustShow: true, show: true, outName: 'Raydium Default List' },
  userAdd: { mustShow: true, show: true, outName: 'User Added Tokens' },
  solana: { mustShow: false, show: false, outName: 'Solana Token List' },
  unofficial: { mustShow: false, show: false, outName: 'Permissionless Pool Tokens' }
}

export const NATIVE_SOL: TokenInfo = {
  symbol: 'SOL',
  name: 'Native Solana',
  mintAddress: '11111111111111111111111111111111',
  decimals: 9,
  tags: ['raydium']
}

export const TOKENS: Tokens = {
  WSOL: {
    symbol: 'WSOL',
    name: 'Wrapped Solana',
    mintAddress: 'So11111111111111111111111111111111111111112',
    decimals: 9,
    referrer: 'HTcarLHe7WRxBQCWvhVB8AP56pnEtJUV2jDGvcpY3xo5',
    tags: ['raydium']
  },
  BTC: {
    symbol: 'BTC',
    name: 'Wrapped Bitcoin',
    mintAddress: '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E',
    decimals: 6,
    referrer: 'GZpS8cY8Nt8HuqxzJh6PXTdSxc38vFUjBmi7eEUkkQtG',
    tags: ['raydium']
  },
  ETH: {
    symbol: 'ETH',
    name: 'Wrapped Ethereum',
    mintAddress: '2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk',
    decimals: 6,
    referrer: 'CXPTcSxxh4AT38gtv3SPbLS7oZVgXzLbMb83o4ziXjjN',
    tags: ['raydium']
  },
  USDT: {
    symbol: 'USDT',
    name: 'USDT',
    mintAddress: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    decimals: 6,
    referrer: '8DwwDNagph8SdwMUdcXS5L9YAyutTyDJmK6cTKrmNFk3',
    tags: ['raydium']
  },
  WUSDT: {
    symbol: 'WUSDT',
    name: 'Wrapped USDT',
    mintAddress: 'BQcdHdAQW1hczDbBi9hiegXAR7A98Q9jx3X3iBBBDiq4',
    decimals: 6,
    referrer: 'CA98hYunCLKgBuD6N8MJSgq1GbW9CXdksLf5mw736tS3',
    tags: ['raydium']
  },
  USDC: {
    symbol: 'USDC',
    name: 'USDC',
    mintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    decimals: 6,
    referrer: '92vdtNjEg6Zth3UU1MgPgTVFjSEzTHx66aCdqWdcRkrg',
    tags: ['raydium']
  },
  WUSDC: {
    symbol: 'WUSDC',
    name: 'Wrapped USDC',
    mintAddress: 'BXXkv6z8ykpG1yuvUDPgh732wzVHB69RnB9YgSYh3itW',
    decimals: 6,
    tags: ['raydium']
  },
  YFI: {
    symbol: 'YFI',
    name: 'Wrapped YFI',
    mintAddress: '3JSf5tPeuscJGtaCp5giEiDhv51gQ4v3zWg8DGgyLfAB',
    decimals: 6,
    referrer: 'DZjgzKfYzZBBSTo5vytMYvGdNF933DvuX8TftDMrThrb',
    tags: ['raydium']
  },
  LINK: {
    symbol: 'LINK',
    name: 'Wrapped Chainlink',
    mintAddress: 'CWE8jPTUYhdCTZYWPTe1o5DFqfdjzWKc9WKz6rSjQUdG',
    decimals: 6,
    referrer: 'DRSKKsYZaPEFkRgGywo7KWBGZikf71R9aDr8tjtpr41V',
    tags: ['raydium']
  },
  XRP: {
    symbol: 'XRP',
    name: 'Wrapped XRP',
    mintAddress: 'Ga2AXHpfAF6mv2ekZwcsJFqu7wB4NV331qNH7fW9Nst8',
    decimals: 6,
    referrer: '6NeHPXG142tAE2Ej3gHgT2N66i1KH6PFR6PBZw6RyrwH',
    tags: ['raydium']
  },
  SUSHI: {
    symbol: 'SUSHI',
    name: 'Wrapped SUSHI',
    mintAddress: 'AR1Mtgh7zAtxuxGd2XPovXPVjcSdY3i4rQYisNadjfKy',
    decimals: 6,
    referrer: '59QxHeHgb28tDc3gStnrW8FNKC9qWuRmRZHBaAqCerJX',
    tags: ['raydium']
  },
  ALEPH: {
    symbol: 'ALEPH',
    name: 'Wrapped ALEPH',
    mintAddress: 'CsZ5LZkDS7h9TDKjrbL7VAwQZ9nsRu8vJLhRYfmGaN8K',
    decimals: 6,
    referrer: '8FKAKrenJMDd7V6cxnM5BsymHTjqxgodtHbLwZReMnWW',
    tags: ['raydium']
  },
  SXP: {
    symbol: 'SXP',
    name: 'Wrapped SXP',
    mintAddress: 'SF3oTvfWzEP3DTwGSvUXRrGTvr75pdZNnBLAH9bzMuX',
    decimals: 6,
    referrer: '97Vyotr284UM2Fyq9gbfQ3azMYtgf7cjnsf8pN1PFfY9',
    tags: ['raydium']
  },
  HGET: {
    symbol: 'HGET',
    name: 'Wrapped HGET',
    mintAddress: 'BtZQfWqDGbk9Wf2rXEiWyQBdBY1etnUUn6zEphvVS7yN',
    decimals: 6,
    referrer: 'AGY2wy1ANzLM2jJLSkVxPUYAY5iAYXYsLMQkoQsAhucj',
    tags: ['raydium']
  },
  CREAM: {
    symbol: 'CREAM',
    name: 'Wrapped CREAM',
    mintAddress: '5Fu5UUgbjpUvdBveb3a1JTNirL8rXtiYeSMWvKjtUNQv',
    decimals: 6,
    referrer: '7WPzEiozJ69MQe8bfbss1t2unR6bHR4S7FimiUVRgu7P',
    tags: ['raydium']
  },
  UBXT: {
    symbol: 'UBXT',
    name: 'Wrapped UBXT',
    mintAddress: '873KLxCbz7s9Kc4ZzgYRtNmhfkQrhfyWGZJBmyCbC3ei',
    decimals: 6,
    referrer: '9aocFzNkSVj9TCS6cJk2uYyuzEpXPWT7xoBBF9JcZ879',
    tags: ['raydium']
  },
  HNT: {
    symbol: 'HNT',
    name: 'Wrapped HNT',
    mintAddress: 'HqB7uswoVg4suaQiDP3wjxob1G5WdZ144zhdStwMCq7e',
    decimals: 6,
    referrer: 'B61oHrGCFh8P75Z2cRDiw2nbEwbMyhVfZhMWiwxU2qCV',
    tags: ['raydium']
  },
  FRONT: {
    symbol: 'FRONT',
    name: 'Wrapped FRONT',
    mintAddress: '9S4t2NEAiJVMvPdRYKVrfJpBafPBLtvbvyS3DecojQHw',
    decimals: 6,
    referrer: 'FnasnCc7c43hd2nanSmRjh9Sf9Cgz6aEvNj6wpDznS5h',
    tags: ['raydium']
  },
  AKRO: {
    symbol: 'AKRO',
    name: 'Wrapped AKRO',
    mintAddress: '6WNVCuxCGJzNjmMZoKyhZJwvJ5tYpsLyAtagzYASqBoF',
    decimals: 6,
    referrer: 'FihBmWJbiLSEvq4QZpPPdjokdMgxqq6pESZ7oMkE1qJH',
    tags: ['raydium']
  },
  HXRO: {
    symbol: 'HXRO',
    name: 'Wrapped HXRO',
    mintAddress: 'DJafV9qemGp7mLMEn5wrfqaFwxsbLgUsGVS16zKRk9kc',
    decimals: 6,
    referrer: '4NgrGZDRCzyqiwYvKPEePTKfQXtWzKmSDBoZJjRw6wNC',
    tags: ['raydium']
  },
  UNI: {
    symbol: 'UNI',
    name: 'Wrapped UNI',
    mintAddress: 'DEhAasscXF4kEGxFgJ3bq4PpVGp5wyUxMRvn6TzGVHaw',
    decimals: 6,
    referrer: '4ntxDv95ajBbXfZyGy3UhcQDx8xmH1yJ6eKvuNNH466x',
    tags: ['raydium']
  },
  SRM: {
    symbol: 'SRM',
    name: 'Serum',
    mintAddress: 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt',
    decimals: 6,
    referrer: 'HYxa4Ea1dz7ya17Cx18rEGUA1WbCvKjXjFKrnu8CwugH',
    tags: ['raydium']
  },
  FTT: {
    symbol: 'FTT',
    name: 'Wrapped FTT',
    mintAddress: 'AGFEad2et2ZJif9jaGpdMixQqvW5i81aBdvKe7PHNfz3',
    decimals: 6,
    referrer: 'CafpgSh8KGL2GPTjdXfctD3vXngNZDJ3Q92FTfV71Hmt',
    tags: ['raydium']
  },
  MSRM: {
    symbol: 'MSRM',
    name: 'MegaSerum',
    mintAddress: 'MSRMcoVyrFxnSgo5uXwone5SKcGhT1KEJMFEkMEWf9L',
    decimals: 0,
    referrer: 'Ge5q9x8gDUNYqqLA1MdnCzWNJGsbj3M15Yxse2cDbw9z',
    tags: ['raydium']
  },
  TOMO: {
    symbol: 'TOMO',
    name: 'Wrapped TOMO',
    mintAddress: 'GXMvfY2jpQctDqZ9RoU3oWPhufKiCcFEfchvYumtX7jd',
    decimals: 6,
    referrer: '9fexfN3eZomF5gfenG5L9ydbKRQkPhq6x74rb5iLrvXP',
    tags: ['raydium']
  },
  KARMA: {
    symbol: 'KARMA',
    name: 'Wrapped KARMA',
    mintAddress: 'EcqExpGNFBve2i1cMJUTR4bPXj4ZoqmDD2rTkeCcaTFX',
    decimals: 4,
    tags: ['raydium']
  },
  LUA: {
    symbol: 'LUA',
    name: 'Wrapped LUA',
    mintAddress: 'EqWCKXfs3x47uVosDpTRgFniThL9Y8iCztJaapxbEaVX',
    decimals: 6,
    referrer: 'HuZwNApjVFuFSDgrwZA8GP2JD7WMby4qt6rkWDnaMo7j',
    tags: ['raydium']
  },
  MATH: {
    symbol: 'MATH',
    name: 'Wrapped MATH',
    mintAddress: 'GeDS162t9yGJuLEHPWXXGrb1zwkzinCgRwnT8vHYjKza',
    decimals: 6,
    referrer: 'C9K1M8sJX8WMdsnFT7DuzdiHHunEj79EsLuz4DixQYGm',
    tags: ['raydium']
  },
  KEEP: {
    symbol: 'KEEP',
    name: 'Wrapped KEEP',
    mintAddress: 'GUohe4DJUA5FKPWo3joiPgsB7yzer7LpDmt1Vhzy3Zht',
    decimals: 6,
    tags: ['raydium']
  },
  SWAG: {
    symbol: 'SWAG',
    name: 'Wrapped SWAG',
    mintAddress: '9F9fNTT6qwjsu4X4yWYKZpsbw5qT7o6yR2i57JF2jagy',
    decimals: 6,
    tags: ['raydium']
  },
  FIDA: {
    symbol: 'FIDA',
    name: 'Bonfida',
    mintAddress: 'EchesyfXePKdLtoiZSL8pBe8Myagyy8ZRqsACNCFGnvp',
    decimals: 6,
    referrer: 'AeAsG75UmyPDB271c6NHonHxXAPXfkvhcf2xjfJhReS8',
    tags: ['raydium']
  },
  KIN: {
    symbol: 'KIN',
    name: 'KIN',
    mintAddress: 'kinXdEcpDQeHPEuQnqmUgtYykqKGVFq6CeVX5iAHJq6',
    decimals: 5,
    referrer: 'AevFXmApVxN2yk1iemSxXc6Wy7Z1udUEfST11kuYKmr9',
    tags: ['raydium']
  },
  MAPS: {
    symbol: 'MAPS',
    name: 'MAPS',
    mintAddress: 'MAPS41MDahZ9QdKXhVa4dWB9RuyfV4XqhyAZ8XcYepb',
    decimals: 6,
    tags: ['raydium']
  },
  OXY: {
    symbol: 'OXY',
    name: 'OXY',
    mintAddress: 'z3dn17yLaGMKffVogeFHQ9zWVcXgqgf3PQnDsNs2g6M',
    decimals: 6,
    tags: ['raydium']
  },
  RAY: {
    symbol: 'RAY',
    name: 'Raydium',
    mintAddress: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
    decimals: 6,
    referrer: '33XpMmMQRf6tSPpmYyzpwU4uXpZHkFwCZsusD9dMYkjy',
    tags: ['raydium']
  },
  xCOPE: {
    symbol: 'xCOPE',
    name: 'xCOPE',
    mintAddress: '3K6rftdAaQYMPunrtNRHgnK2UAtjm2JwyT2oCiTDouYE',
    decimals: 0,
    referrer: '8DTehuES4tfnd2SrqcjN52XofxWXGjiLZRgM12U9pB6f',
    tags: ['raydium']
  },
  COPE: {
    symbol: 'COPE',
    name: 'COPE',
    mintAddress: '8HGyAAB1yoM1ttS7pXjHMa3dukTFGQggnFFH3hJZgzQh',
    decimals: 6,
    referrer: 'G7UYwWhkmgeL57SUKFF45K663V9TdXZw6Ho6ZLQ7p4p',
    tags: ['raydium']
  },
  STEP: {
    symbol: 'STEP',
    name: 'STEP',
    mintAddress: 'StepAscQoEioFxxWGnh2sLBDFp9d8rvKz2Yp39iDpyT',
    decimals: 9,
    referrer: 'EFQVX1S6dFroDDhJDAnMTX4fCfjt4fJXHdk1eEtJ2uRY',
    tags: ['raydium']
  },
  MEDIA: {
    symbol: 'MEDIA',
    name: 'MEDIA',
    mintAddress: 'ETAtLmCmsoiEEKfNrHKJ2kYy3MoABhU6NQvpSfij5tDs',
    decimals: 6,
    referrer: 'AYnaG3AidNWFzjq9U3BJSsQ9DShE8g7FszriBDtRFvsx',

    details:
      'Media Network is a new protocol that bypasses traditional CDN providers’ centralized approach for a self-governed and open source solution where everyone can participate. Media Network creates a distributed bandwidth market that enables service providers such as media platforms to hire resources from the network and dynamically come and go as the demand for last-mile data delivery shifts. It allows anyone to organically serve content without introducing any trust assumptions or pre-authentication requirements. Participants earn MEDIA rewards for their bandwidth contributions, a fixed supply SPL token minted on Solana’s Blockchain.',
    docs: {
      website: 'https://media.network/',
      whitepaper: 'https://media.network/whitepaper.pdf'
    },
    socials: {
      Twitter: 'https://twitter.com/Media_FDN',
      Telegram: 'https://t.me/Media_FDN',
      Medium: 'https://mediafoundation.medium.com/'
    },
    tags: ['raydium']
  },
  ROPE: {
    symbol: 'ROPE',
    name: 'ROPE',
    mintAddress: '8PMHT4swUMtBzgHnh5U564N5sjPSiUz2cjEQzFnnP1Fo',
    decimals: 9,
    referrer: '5sGVVniBSPLTwRHDETShovq7STRH2rJwbvdvvH3NcVTF',
    tags: ['raydium']
  },
  MER: {
    symbol: 'MER',
    name: 'Mercurial',
    mintAddress: 'MERt85fc5boKw3BW1eYdxonEuJNvXbiMbs6hvheau5K',
    decimals: 6,
    referrer: '36F4ryvqaNW2yKQsAry4ZHCZ3j7tz3gtEz7NEwv7pSRu',

    details:
      'Mercurial Finance\nMercurial is building DeFi’s first dynamic vaults for stable assets on Solana, providing the technical tools for users to easily deposit, swap and mint stable assets.\n\nInnovations\nMercurial will be introducing several key new technical innovations, including on-chain algorithms to regulate the flow of assets and dynamic fees that tap on the market and price data to assist LPs in optimizing performance. We will also be developing a unique pricing curve that will be the first to combine high efficiency, multi-token support, and generalizability for all types of token sets.\n\nMaximizing Capital Utlilization\nMercurial vaults will dynamically utilize assets for a wide range of use cases, like low slippage swaps, lending, flash loans, and external third-party decentralized protocols. To increase pegged assets availability on Solana, we will allow the creation of synthetics, like mUSD or mBTC, which can be added to our vaults to improve liquidity for other stables and facilitate interaction with other third-party decentralized protocols.\n\nStarting with a vault for the most common stables, for example, USDC, USDT, wUSDC, and wDAI, we will be facilitating low slippage swaps with dynamic fees. Features will be added as key technical and ecosystem pieces become available on Solana, i.e. inter-program composability, price oracles, etc.\n\nMER\nThe MER token will be used to accrue value for the holder via fees from swaps, commission from yield farms, and as collateral for synthetic stables like mUSD. MER will also be intrinsically linked to the governance and growth of Mercurial, playing a crucial role in regulating the system across governance, insurance, and bootstrapping.',
    docs: {
      website: 'https://www.mercurial.finance/',
      whitepaper: 'https://www.mercurial.finance/Mercurial-Lite-Paper-v1.pdf'
    },
    socials: {
      Twitter: 'https://twitter.com/MercurialFi',
      Telegram: 'https://t.me/MercurialFi',
      Medium: 'https://mercurialfi.medium.com/'
    },
    tags: ['raydium']
  },
  TULIP: {
    symbol: 'TULIP',
    name: 'TULIP',
    mintAddress: 'TuLipcqtGVXP9XR62wM8WWCm6a9vhLs7T1uoWBk6FDs',
    decimals: 6,
    referrer: 'Bcw1TvX8jUj6CtY2a7GU2THeYVAudvmT8yzRypVMVsSH',
    tags: ['raydium']
  },
  SNY: {
    symbol: 'SNY',
    name: 'SNY',
    mintAddress: '4dmKkXNHdgYsXqBHCuMikNQWwVomZURhYvkkX5c4pQ7y',
    decimals: 6,
    referrer: 'G7gyaTNn2hgjF67SWs4Ee9PEaFU2xadhtXL8HmkJ2cNL',

    detailLink: 'https://raydium.medium.com/synthetify-launching-on-acceleraytor-3755b4903f88',
    details:
      'Synthetify is a decentralized protocol that allows for the creation and exchange of synthetic assets that closely track the price of underlying assets. Synthetify’s synthetics adhere to the SPL token standard, allowing them to be easily integrated with DeFi applications across the Solana ecosystem.\n\nSynthetify leverages Solana to enable a fast, cheap and intuitive trading experience for users of the platform while staying fully decentralized thanks to an infrastructure that relies on smart contracts and blockchain oracles.\n\nThe Synthetify Token (SNY) gives the ability to participate in the protocol through staking. Stakers receive a pro rata share of fees generated by the exchange as well as additional rewards. SNY acts as a collateral token for all synthetic assets created on the platform and each token will have voting power on future governance proposals.',
    docs: {
      website: 'https://synthetify.io/',
      whitepaper: 'https://resources.synthetify.io/synthetify-whitepaper.pdf'
    },
    socials: {
      Twitter: 'https://twitter.com/synthetify',
      Telegram: 'https://t.me/synthetify',
      Medium: 'https://synthetify.medium.com/'
    },
    tags: ['raydium']
  },
  SLRS: {
    symbol: 'SLRS',
    name: 'SLRS',
    mintAddress: 'SLRSSpSLUTP7okbCUBYStWCo1vUgyt775faPqz8HUMr',
    decimals: 6,
    referrer: 'AmqeHgTdm6kBzy5ewZFKuMAfbynZmhve1GQxbJzQFLbP',

    detailLink: 'https://raydium.medium.com/solrise-is-launching-on-acceleraytor-c2c980362037',
    details:
      'Solrise Finance is a fully decentralized and non-custodial protocol for investment funds on Solana. What this means in practice is that anyone can open a fund, and anyone can invest in it.\n\nSolrise’s platform allows fund managers from all across the globe — whether they are well-established and looking for a new channel, or ambitious rookies with something to prove — to open a fund, with performance kept completely transparent.\n\nExisting decentralized fund management platforms on Ethereum are suffering from brutally high transaction fees. With Solrise, you can create, enter, and exit funds all for under $0.01.',
    docs: {
      website: 'https://solrise.finance/',
      docs: 'https://docs.solrise.finance/'
    },
    socials: {
      Twitter: 'https://twitter.com/SolriseFinance',
      Telegram: 'https://t.me/solrisefinance',
      Medium: 'https://blog.solrise.finance/'
    },
    tags: ['raydium']
  },
  WOO: {
    symbol: 'WOO',
    name: 'Wootrade Network',
    mintAddress: 'E5rk3nmgLUuKUiS94gg4bpWwWwyjCMtddsAXkTFLtHEy',
    decimals: 6,
    referrer: '7UbeAZxpza5zN3QawQ5KsUo88zXvohUncYB9Zk5QCiim',
    tags: ['raydium']
  },
  BOP: {
    symbol: 'BOP',
    name: 'Boring Protocol',
    mintAddress: 'BLwTnYKqf7u4qjgZrrsKeNs2EzWkMLqVCu6j8iHyrNA3',
    decimals: 8,
    referrer: 'FWxBZmNsvNckx8DnaL2NuyMtiQmT1x529WwV4e1UWiGk',
    tags: ['raydium']
  }
}

export const LP_TOKENS: Tokens = {
  'RAY-WUSDT': {
    symbol: 'RAY-WUSDT',
    name: 'RAY-WUSDT V2 LP',
    coin: { ...TOKENS.RAY },
    pc: { ...TOKENS.WUSDT },

    mintAddress: 'CzPDyvotTcxNqtPne32yUiEVQ6jk42HZi1Y3hUu7qf7f',
    decimals: TOKENS.RAY.decimals
  },
  'RAY-SOL': {
    symbol: 'RAY-SOL',
    name: 'RAY-SOL LP',
    coin: { ...TOKENS.RAY },
    pc: { ...NATIVE_SOL },

    mintAddress: '134Cct3CSdRCbYgq5SkwmHgfwjJ7EM5cG9PzqffWqECx',
    decimals: TOKENS.RAY.decimals
  },
  'LINK-WUSDT': {
    symbol: 'LINK-WUSDT',
    name: 'LINK-WUSDT LP',
    coin: { ...TOKENS.LINK },
    pc: { ...TOKENS.WUSDT },

    mintAddress: 'EVDmwajM5U73PD34bYPugwiA4Eqqbrej4mLXXv15Z5qR',
    decimals: TOKENS.LINK.decimals
  },
  'ETH-WUSDT': {
    symbol: 'ETH-WUSDT',
    name: 'ETH-WUSDT LP',
    coin: { ...TOKENS.ETH },
    pc: { ...TOKENS.WUSDT },

    mintAddress: 'KY4XvwHy7JPzbWYAbk23jQvEb4qWJ8aCqYWREmk1Q7K',
    decimals: TOKENS.ETH.decimals
  },
  'RAY-USDC': {
    symbol: 'RAY-USDC',
    name: 'RAY-USDC LP',
    coin: { ...TOKENS.RAY },
    pc: { ...TOKENS.USDC },

    mintAddress: 'FgmBnsF5Qrnv8X9bomQfEtQTQjNNiBCWRKGpzPnE5BDg',
    decimals: TOKENS.RAY.decimals
  },
  'RAY-SRM': {
    symbol: 'RAY-SRM',
    name: 'RAY-SRM LP',
    coin: { ...TOKENS.RAY },
    pc: { ...TOKENS.SRM },

    mintAddress: '5QXBMXuCL7zfAk39jEVVEvcrz1AvBGgT9wAhLLHLyyUJ',
    decimals: TOKENS.RAY.decimals
  },
  // v3
  'RAY-WUSDT-V3': {
    symbol: 'RAY-WUSDT',
    name: 'RAY-WUSDT V3 LP',
    coin: { ...TOKENS.RAY },
    pc: { ...TOKENS.WUSDT },

    mintAddress: 'FdhKXYjCou2jQfgKWcNY7jb8F2DPLU1teTTTRfLBD2v1',
    decimals: TOKENS.RAY.decimals
  },
  'RAY-USDC-V3': {
    symbol: 'RAY-USDC',
    name: 'RAY-USDC LP',
    coin: { ...TOKENS.RAY },
    pc: { ...TOKENS.USDC },

    mintAddress: 'BZFGfXMrjG2sS7QT2eiCDEevPFnkYYF7kzJpWfYxPbcx',
    decimals: TOKENS.RAY.decimals
  },
  'RAY-SRM-V3': {
    symbol: 'RAY-SRM',
    name: 'RAY-SRM LP',
    coin: { ...TOKENS.RAY },
    pc: { ...TOKENS.SRM },

    mintAddress: 'DSX5E21RE9FB9hM8Nh8xcXQfPK6SzRaJiywemHBSsfup',
    decimals: TOKENS.RAY.decimals
  },
  'RAY-SOL-V3': {
    symbol: 'RAY-SOL',
    name: 'RAY-SOL LP',
    coin: { ...TOKENS.RAY },
    pc: { ...NATIVE_SOL },

    mintAddress: 'F5PPQHGcznZ2FxD9JaxJMXaf7XkaFFJ6zzTBcW8osQjw',
    decimals: TOKENS.RAY.decimals
  },
  'RAY-ETH-V3': {
    symbol: 'RAY-ETH',
    name: 'RAY-ETH LP',
    coin: { ...TOKENS.RAY },
    pc: { ...TOKENS.ETH },

    mintAddress: '8Q6MKy5Yxb9vG1mWzppMtMb2nrhNuCRNUkJTeiE3fuwD',
    decimals: TOKENS.RAY.decimals
  },
  // v4
  'FIDA-RAY-V4': {
    symbol: 'FIDA-RAY',
    name: 'FIDA-RAY LP',
    coin: { ...TOKENS.FIDA },
    pc: { ...TOKENS.RAY },

    mintAddress: 'DsBuznXRTmzvEdb36Dx3aVLVo1XmH7r1PRZUFugLPTFv',
    decimals: TOKENS.FIDA.decimals
  },
  'OXY-RAY-V4': {
    symbol: 'OXY-RAY',
    name: 'OXY-RAY LP',
    coin: { ...TOKENS.OXY },
    pc: { ...TOKENS.RAY },

    mintAddress: 'FwaX9W7iThTZH5MFeasxdLpxTVxRcM7ZHieTCnYog8Yb',
    decimals: TOKENS.OXY.decimals
  },
  'MAPS-RAY-V4': {
    symbol: 'MAPS-RAY',
    name: 'MAPS-RAY LP',
    coin: { ...TOKENS.MAPS },
    pc: { ...TOKENS.RAY },

    mintAddress: 'CcKK8srfVdTSsFGV3VLBb2YDbzF4T4NM2C3UEjC39RLP',
    decimals: TOKENS.MAPS.decimals
  },
  'KIN-RAY-V4': {
    symbol: 'KIN-RAY',
    name: 'KIN-RAY LP',
    coin: { ...TOKENS.KIN },
    pc: { ...TOKENS.RAY },

    mintAddress: 'CHT8sft3h3gpLYbCcZ9o27mT5s3Z6VifBVbUiDvprHPW',
    decimals: 6
  },
  'RAY-USDT-V4': {
    symbol: 'RAY-USDT',
    name: 'RAY-USDT LP',
    coin: { ...TOKENS.RAY },
    pc: { ...TOKENS.USDT },

    mintAddress: 'C3sT1R3nsw4AVdepvLTLKr5Gvszr7jufyBWUCvy4TUvT',
    decimals: TOKENS.RAY.decimals
  },
  'SOL-USDC-V4': {
    symbol: 'SOL-USDC',
    name: 'SOL-USDC LP',
    coin: { ...NATIVE_SOL },
    pc: { ...TOKENS.USDC },

    mintAddress: '8HoQnePLqPj4M7PUDzfw8e3Ymdwgc7NLGnaTUapubyvu',
    decimals: NATIVE_SOL.decimals
  },
  'YFI-USDC-V4': {
    symbol: 'YFI-USDC',
    name: 'YFI-USDC LP',
    coin: { ...TOKENS.YFI },
    pc: { ...TOKENS.USDC },

    mintAddress: '865j7iMmRRycSYUXzJ33ZcvLiX9JHvaLidasCyUyKaRE',
    decimals: TOKENS.YFI.decimals
  },
  'SRM-USDC-V4': {
    symbol: 'SRM-USDC',
    name: 'SRM-USDC LP',
    coin: { ...TOKENS.SRM },
    pc: { ...TOKENS.USDC },

    mintAddress: '9XnZd82j34KxNLgQfz29jGbYdxsYznTWRpvZE3SRE7JG',
    decimals: TOKENS.SRM.decimals
  },
  'FTT-USDC-V4': {
    symbol: 'FTT-USDC',
    name: 'FTT-USDC LP',
    coin: { ...TOKENS.FTT },
    pc: { ...TOKENS.USDC },

    mintAddress: '75dCoKfUHLUuZ4qEh46ovsxfgWhB4icc3SintzWRedT9',
    decimals: TOKENS.FTT.decimals
  },
  'BTC-USDC-V4': {
    symbol: 'BTC-USDC',
    name: 'BTC-USDC LP',
    coin: { ...TOKENS.BTC },
    pc: { ...TOKENS.USDC },

    mintAddress: '2hMdRdVWZqetQsaHG8kQjdZinEMBz75vsoWTCob1ijXu',
    decimals: TOKENS.BTC.decimals
  },
  'SUSHI-USDC-V4': {
    symbol: 'SUSHI-USDC',
    name: 'SUSHI-USDC LP',
    coin: { ...TOKENS.SUSHI },
    pc: { ...TOKENS.USDC },

    mintAddress: '2QVjeR9d2PbSf8em8NE8zWd8RYHjFtucDUdDgdbDD2h2',
    decimals: TOKENS.SUSHI.decimals
  },
  'TOMO-USDC-V4': {
    symbol: 'TOMO-USDC',
    name: 'TOMO-USDC LP',
    coin: { ...TOKENS.TOMO },
    pc: { ...TOKENS.USDC },

    mintAddress: 'CHyUpQFeW456zcr5XEh4RZiibH8Dzocs6Wbgz9aWpXnQ',
    decimals: TOKENS.TOMO.decimals
  },
  'LINK-USDC-V4': {
    symbol: 'LINK-USDC',
    name: 'LINK-USDC LP',
    coin: { ...TOKENS.LINK },
    pc: { ...TOKENS.USDC },

    mintAddress: 'BqjoYjqKrXtfBKXeaWeAT5sYCy7wsAYf3XjgDWsHSBRs',
    decimals: TOKENS.LINK.decimals
  },
  'ETH-USDC-V4': {
    symbol: 'ETH-USDC',
    name: 'ETH-USDC LP',
    coin: { ...TOKENS.ETH },
    pc: { ...TOKENS.USDC },

    mintAddress: '13PoKid6cZop4sj2GfoBeujnGfthUbTERdE5tpLCDLEY',
    decimals: TOKENS.ETH.decimals
  },
  'xCOPE-USDC-V4': {
    symbol: 'xCOPE-USDC',
    name: 'xCOPE-USDC LP',
    coin: { ...TOKENS.xCOPE },
    pc: { ...TOKENS.USDC },

    mintAddress: '2Vyyeuyd15Gp8aH6uKE72c4hxc8TVSLibxDP9vzspQWG',
    decimals: TOKENS.xCOPE.decimals
  },
  'SOL-USDT-V4': {
    symbol: 'SOL-USDT',
    name: 'SOL-USDT LP',
    coin: { ...NATIVE_SOL },
    pc: { ...TOKENS.USDT },

    mintAddress: 'Epm4KfTj4DMrvqn6Bwg2Tr2N8vhQuNbuK8bESFp4k33K',
    decimals: NATIVE_SOL.decimals
  },
  'YFI-USDT-V4': {
    symbol: 'YFI-USDT',
    name: 'YFI-USDT LP',
    coin: { ...TOKENS.YFI },
    pc: { ...TOKENS.USDT },

    mintAddress: 'FA1i7fej1pAbQbnY8NbyYUsTrWcasTyipKreDgy1Mgku',
    decimals: TOKENS.YFI.decimals
  },
  'SRM-USDT-V4': {
    symbol: 'SRM-USDT',
    name: 'SRM-USDT LP',
    coin: { ...TOKENS.SRM },
    pc: { ...TOKENS.USDT },

    mintAddress: 'HYSAu42BFejBS77jZAZdNAWa3iVcbSRJSzp3wtqCbWwv',
    decimals: TOKENS.SRM.decimals
  },
  'FTT-USDT-V4': {
    symbol: 'FTT-USDT',
    name: 'FTT-USDT LP',
    coin: { ...TOKENS.FTT },
    pc: { ...TOKENS.USDT },

    mintAddress: '2cTCiUnect5Lap2sk19xLby7aajNDYseFhC9Pigou11z',
    decimals: TOKENS.FTT.decimals
  },
  'BTC-USDT-V4': {
    symbol: 'BTC-USDT',
    name: 'BTC-USDT LP',
    coin: { ...TOKENS.BTC },
    pc: { ...TOKENS.USDT },

    mintAddress: 'DgGuvR9GSHimopo3Gc7gfkbKamLKrdyzWkq5yqA6LqYS',
    decimals: TOKENS.BTC.decimals
  },
  'SUSHI-USDT-V4': {
    symbol: 'SUSHI-USDT',
    name: 'SUSHI-USDT LP',
    coin: { ...TOKENS.SUSHI },
    pc: { ...TOKENS.USDT },

    mintAddress: 'Ba26poEYDy6P2o95AJUsewXgZ8DM9BCsmnU9hmC9i4Ki',
    decimals: TOKENS.SUSHI.decimals
  },
  'TOMO-USDT-V4': {
    symbol: 'TOMO-USDT',
    name: 'TOMO-USDT LP',
    coin: { ...TOKENS.TOMO },
    pc: { ...TOKENS.USDT },

    mintAddress: 'D3iGro1vn6PWJXo9QAPj3dfta6dKkHHnmiiym2EfsAmi',
    decimals: TOKENS.TOMO.decimals
  },
  'LINK-USDT-V4': {
    symbol: 'LINK-USDT',
    name: 'LINK-USDT LP',
    coin: { ...TOKENS.LINK },
    pc: { ...TOKENS.USDT },

    mintAddress: 'Dr12Sgt9gkY8WU5tRkgZf1TkVWJbvjYuPAhR3aDCwiiX',
    decimals: TOKENS.LINK.decimals
  },
  'ETH-USDT-V4': {
    symbol: 'ETH-USDT',
    name: 'ETH-USDT LP',
    coin: { ...TOKENS.ETH },
    pc: { ...TOKENS.USDT },

    mintAddress: 'nPrB78ETY8661fUgohpuVusNCZnedYCgghzRJzxWnVb',
    decimals: TOKENS.ETH.decimals
  },
  'YFI-SRM-V4': {
    symbol: 'YFI-SRM',
    name: 'YFI-SRM LP',
    coin: { ...TOKENS.YFI },
    pc: { ...TOKENS.SRM },

    mintAddress: 'EGJht91R7dKpCj8wzALkjmNdUUUcQgodqWCYweyKcRcV',
    decimals: TOKENS.YFI.decimals
  },
  'FTT-SRM-V4': {
    symbol: 'FTT-SRM',
    name: 'FTT-SRM LP',
    coin: { ...TOKENS.FTT },
    pc: { ...TOKENS.SRM },

    mintAddress: 'AsDuPg9MgPtt3jfoyctUCUgsvwqAN6RZPftqoeiPDefM',
    decimals: TOKENS.FTT.decimals
  },
  'BTC-SRM-V4': {
    symbol: 'BTC-SRM',
    name: 'BTC-SRM LP',
    coin: { ...TOKENS.BTC },
    pc: { ...TOKENS.SRM },

    mintAddress: 'AGHQxXb3GSzeiLTcLtXMS2D5GGDZxsB2fZYZxSB5weqB',
    decimals: TOKENS.BTC.decimals
  },
  'SUSHI-SRM-V4': {
    symbol: 'SUSHI-SRM',
    name: 'SUSHI-SRM LP',
    coin: { ...TOKENS.SUSHI },
    pc: { ...TOKENS.SRM },

    mintAddress: '3HYhUnUdV67j1vn8fu7ExuVGy5dJozHEyWvqEstDbWwE',
    decimals: TOKENS.SUSHI.decimals
  },
  'TOMO-SRM-V4': {
    symbol: 'TOMO-SRM',
    name: 'TOMO-SRM LP',
    coin: { ...TOKENS.TOMO },
    pc: { ...TOKENS.SRM },

    mintAddress: 'GgH9RnKrQpaMQeqmdbMvs5oo1A24hERQ9wuY2pSkeG7x',
    decimals: TOKENS.TOMO.decimals
  },
  'LINK-SRM-V4': {
    symbol: 'LINK-SRM',
    name: 'LINK-SRM LP',
    coin: { ...TOKENS.LINK },
    pc: { ...TOKENS.SRM },

    mintAddress: 'GXN6yJv12o18skTmJXaeFXZVY1iqR18CHsmCT8VVCmDD',
    decimals: TOKENS.LINK.decimals
  },
  'ETH-SRM-V4': {
    symbol: 'ETH-SRM',
    name: 'ETH-SRM LP',
    coin: { ...TOKENS.ETH },
    pc: { ...TOKENS.SRM },

    mintAddress: '9VoY3VERETuc2FoadMSYYizF26mJinY514ZpEzkHMtwG',
    decimals: TOKENS.ETH.decimals
  },
  'SRM-SOL-V4': {
    symbol: 'SRM-SOL',
    name: 'SRM-SOL LP',
    coin: { ...TOKENS.SRM },
    pc: { ...NATIVE_SOL },

    mintAddress: 'AKJHspCwDhABucCxNLXUSfEzb7Ny62RqFtC9uNjJi4fq',
    decimals: TOKENS.SRM.decimals
  },
  'STEP-USDC-V4': {
    symbol: 'STEP-USDC',
    name: 'STEP-USDC LP',
    coin: { ...TOKENS.STEP },
    pc: { ...TOKENS.USDC },

    mintAddress: '3k8BDobgihmk72jVmXYLE168bxxQUhqqyESW4dQVktqC',
    decimals: TOKENS.STEP.decimals
  },
  'MEDIA-USDC-V4': {
    symbol: 'MEDIA-USDC',
    name: 'MEDIA-USDC LP',
    coin: { ...TOKENS.MEDIA },
    pc: { ...TOKENS.USDC },

    mintAddress: 'A5zanvgtioZGiJMdEyaKN4XQmJsp1p7uVxaq2696REvQ',
    decimals: TOKENS.MEDIA.decimals
  },
  'ROPE-USDC-V4': {
    symbol: 'ROPE-USDC',
    name: 'ROPE-USDC LP',
    coin: { ...TOKENS.ROPE },
    pc: { ...TOKENS.USDC },

    mintAddress: 'Cq4HyW5xia37tKejPF2XfZeXQoPYW6KfbPvxvw5eRoUE',
    decimals: TOKENS.ROPE.decimals
  },
  'MER-USDC-V4': {
    symbol: 'MER-USDC',
    name: 'MER-USDC LP',
    coin: { ...TOKENS.MER },
    pc: { ...TOKENS.USDC },

    mintAddress: '3H9NxvaZoxMZZDZcbBDdWMKbrfNj7PCF5sbRwDr7SdDW',
    decimals: TOKENS.MER.decimals
  },
  'COPE-USDC-V4': {
    symbol: 'COPE-USDC',
    name: 'COPE-USDC LP',
    coin: { ...TOKENS.COPE },
    pc: { ...TOKENS.USDC },

    mintAddress: 'Cz1kUvHw98imKkrqqu95GQB9h1frY8RikxPojMwWKGXf',
    decimals: TOKENS.COPE.decimals
  },
  'ALEPH-USDC-V4': {
    symbol: 'ALEPH-USDC',
    name: 'ALEPH-USDC LP',
    coin: { ...TOKENS.ALEPH },
    pc: { ...TOKENS.USDC },

    mintAddress: 'iUDasAP2nXm5wvTukAHEKSdSXn8vQkRtaiShs9ceGB7',
    decimals: TOKENS.ALEPH.decimals
  },
  'TULIP-USDC-V4': {
    symbol: 'TULIP-USDC',
    name: 'TULIP-USDC LP',
    coin: { ...TOKENS.TULIP },
    pc: { ...TOKENS.USDC },

    mintAddress: '2doeZGLJyACtaG9DCUyqMLtswesfje1hjNA11hMdj6YU',
    decimals: TOKENS.TULIP.decimals
  },
  'WOO-USDC-V4': {
    symbol: 'WOO-USDC',
    name: 'WOO-USDC LP',
    coin: { ...TOKENS.WOO },
    pc: { ...TOKENS.USDC },

    mintAddress: '7cu42ao8Jgrd5A3y3bNQsCxq5poyGZNmTydkGfJYQfzh',
    decimals: TOKENS.WOO.decimals
  },
  'SNY-USDC-V4': {
    symbol: 'SNY-USDC',
    name: 'SNY-USDC LP',
    coin: { ...TOKENS.SNY },
    pc: { ...TOKENS.USDC },

    mintAddress: 'G8qcfeFqxwbCqpxv5LpLWxUCd1PyMB5nWb5e5YyxLMKg',
    decimals: TOKENS.SNY.decimals
  },
  'BOP-RAY-V4': {
    symbol: 'BOP-RAY',
    name: 'BOP-RAY LP',
    coin: { ...TOKENS.BOP },
    pc: { ...TOKENS.RAY },

    mintAddress: '9nQPYJvysyfnXhQ6nkK5V7sZG26hmDgusfdNQijRk5LD',
    decimals: TOKENS.BOP.decimals
  },
  'SLRS-USDC-V4': {
    symbol: 'SLRS-USDC',
    name: 'SLRS-USDC LP',
    coin: { ...TOKENS.SLRS },
    pc: { ...TOKENS.USDC },

    mintAddress: '2Xxbm1hdv5wPeen5ponDSMT3VqhGMTQ7mH9stNXm9shU',
    decimals: TOKENS.SLRS.decimals
  }
}

function addUserLocalCoinMint() {
  const localMintStr = window.localStorage.user_add_coin_mint
  const localMintList = (localMintStr ?? '').split('---')
  if (localMintList.length % 3 !== 0) {
    window.localStorage.removeItem('user_add_coin_mint')
  } else {
    for (let index = 0; index < Math.floor(localMintList.length / 3); index += 1) {
      const name = localMintList[index * 3 + 0]
      const mintAddress = localMintList[index * 3 + 1]
      const decimals = localMintList[index * 3 + 2]
      if (!Object.values(TOKENS).find((item) => item.mintAddress === mintAddress)) {
        TOKENS[name + mintAddress + 'unofficialUserAdd'] = {
          name,
          symbol: name,
          decimals: parseInt(decimals),
          mintAddress,
          tags: ['userAdd']
        }
      } else if (
        !Object.values(TOKENS)
          .find((item) => item.mintAddress === mintAddress)
          .tags.includes('userAdd')
      ) {
        TOKENS[name].tags.push('userAdd')
      }
    }
  }
}

function addTokensSolana() {
  fetch('https://raw.githubusercontent.com/solana-labs/token-list/main/src/tokens/solana.tokenlist.json')
    .then(function (response) {
      return response.json()
    })
    .then(function (myJson) {
      const tokens = myJson.tokens
      tokens.forEach((itemToken: any) => {
        if (itemToken.tags && itemToken.tags.includes('lp-token')) {
          return
        }
        if (!Object.values(TOKENS).find((item) => item.mintAddress === itemToken.address)) {
          TOKENS[itemToken.symbol + itemToken.address + 'solana'] = {
            symbol: itemToken.symbol,
            name: itemToken.name,
            mintAddress: itemToken.address,
            decimals: itemToken.decimals,
            picUrl: itemToken.logoURI,
            tags: ['solana']
          }
        } else {
          const token = Object.values(TOKENS).find((item) => item.mintAddress === itemToken.address)
          if (token.symbol !== itemToken.symbol && !token.tags.includes('raydium')) {
            token.symbol = itemToken.symbol
            token.name = itemToken.name
            token.decimals = itemToken.decimals
            token.tags.push('solana')
          }
          const picToken = Object.values(TOKENS).find((item) => item.mintAddress === itemToken.address)
          if (picToken) {
            picToken.picUrl = itemToken.logoURI
          }
        }
      })

      if (window.localStorage.addSolanaCoin) {
        window.localStorage.addSolanaCoin.split('---').forEach((itemMint: string) => {
          if (itemMint === NATIVE_SOL.mintAddress) NATIVE_SOL.tags.push('userAdd')
          else
            Object.keys(TOKENS).forEach((item) => {
              if (TOKENS[item].mintAddress === itemMint) {
                TOKENS[item].tags.push('userAdd')
              }
            })
        })
      }
    })
}

function updateTokenTagsChange() {
  const userSelectSource = window.localStorage.userSelectSource ?? ''
  const userSelectSourceList: string[] = userSelectSource.split('---')
  for (const itemSource of userSelectSourceList) {
    if (TOKENS_TAGS[itemSource] && !TOKENS_TAGS[itemSource].mustShow) {
      TOKENS_TAGS[itemSource].show = true
    }
  }
}

addUserLocalCoinMint()
addTokensSolana()
updateTokenTagsChange()
