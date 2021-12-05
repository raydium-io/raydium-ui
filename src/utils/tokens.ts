import { cloneDeep } from 'lodash-es'

import { TokenAmount } from '@/utils/safe-math'

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

export function getTokenSymbolByMint(mint: string) {
  if (mint === NATIVE_SOL.mintAddress) {
    return NATIVE_SOL.symbol
  }

  const token = Object.values({ ...TOKENS, ...LP_TOKENS }).find((item) => item.mintAddress === mint)

  if (token) {
    return token.symbol
  }
  return 'UNKNOWN'
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
    mintAddress: '3UNBZ6o52WTWwjac2kPUb4FyodhU1vFkRJheu1Sh2TvU',
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
    mintAddress: '8FRFC6MoGGkMFQwngccyu69VnYbzykGeez7ignHVAFSN',
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
  },
  SAMO: {
    symbol: 'SAMO',
    name: 'Samoyed Coin',
    mintAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    decimals: 9,
    referrer: 'FnMDNFL9t8EpbADSU3hLWBtx7SuwRBB6NM84U3PzSkUu',
    tags: ['raydium']
  },
  renBTC: {
    symbol: 'renBTC',
    name: 'renBTC',
    mintAddress: 'CDJWUqTcYTVAKXAVXoQZFes5JUFc7owSeq7eMQcDSbo5',
    decimals: 8,
    referrer: '7rr64uygy3o5RKVeNv12JGDUFMXVdr2YHvA3NTxzbZT6',
    tags: ['raydium']
  },
  renDOGE: {
    symbol: 'renDOGE',
    name: 'renDOGE',
    mintAddress: 'ArUkYE2XDKzqy77PRRGjo4wREWwqk6RXTfM9NeqzPvjU',
    decimals: 8,
    referrer: 'J5g7uvJRGnpRyLnRQjFs1MqMkiTVgjxVJCXocu4B4BcZ',
    tags: ['raydium']
  },
  LIKE: {
    symbol: 'LIKE',
    name: 'LIKE',
    mintAddress: '3bRTivrVsitbmCTGtqwp7hxXPsybkjn4XLNtPsHqa3zR',
    decimals: 9,
    referrer: '2rnVeVGfM88XqyNyBzGWEb7JViYKqncFzjWq5h1ujS9A',

    detailLink: 'https://raydium.medium.com/only1-is-launching-on-acceleraytor-41ecb89dcc4e',
    details:
      'Only1 is the first NFT-powered social platform built on the Solana blockchain. Mixing social media, an NFT marketplace, a scalable blockchain, and the native token — $LIKE, Only1 offers fans a unique way of connecting with the creators they love.\n\nBy using the Only1 platform, fans will have the ability to invest, access, and earn from the limited edition contents created by the world’s largest influencers/celebrities, all powered by NFTs.',
    docs: {
      website: 'https://only1.io/',
      whitepaper: 'https://only1.io/pitch-deck.pdf'
    },
    socials: {
      Twitter: 'https://twitter.com/only1nft',
      Telegram: 'https://t.me/only1nft',
      Medium: 'https://medium.com/@only1nft',
      Discord: 'https://discord.gg/sUu7KZwNCB'
    },
    tags: ['raydium']
  },
  DXL: {
    symbol: 'DXL',
    name: 'DXL',
    mintAddress: 'GsNzxJfFn6zQdJGeYsupJWzUAm57Ba7335mfhWvFiE9Z',
    decimals: 6,
    referrer: 'HF7mhT9YgD5CULAFDYQmhnUMi1FnNbKeBFCy9SZDh2XE',
    tags: ['raydium']
  },
  mSOL: {
    symbol: 'mSOL',
    name: 'Marinade staked SOL (mSOL)',
    mintAddress: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
    decimals: 9,
    referrer: '7h5bckf8P29RdviNoKjDyH3Ky3uwdrBiPgYuSCD4asV5',
    tags: ['raydium']
  },
  PAI: {
    symbol: 'PAI',
    name: 'PAI (Parrot)',
    mintAddress: 'Ea5SjE2Y6yvCeW5dYTn7PYMuW5ikXkvbGdcmSnXeaLjS',
    decimals: 6,
    referrer: '54X98LAxRR2j1KMBBXkbYyUaAWi1iKW9G1Y4TnTJVY2e',
    tags: ['raydium']
  },
  PORT: {
    symbol: 'PORT',
    name: 'PORT',
    mintAddress: 'PoRTjZMPXb9T7dyU7tpLEZRQj7e6ssfAE62j2oQuc6y',
    decimals: 6,
    referrer: '5Ve8q9fb7R2DhdqGV4o1RVy7xxo4D6ifQfbxGiASdxEH',
    tags: ['raydium']
  },
  MNGO: {
    symbol: 'MNGO',
    name: 'Mango',
    mintAddress: 'MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac',
    decimals: 6,
    referrer: 'CijuvE6qDpxZ5WqdEQEe7mS11fXEKiiHc7RR8wRiGzjY',
    tags: ['raydium']
  },
  CRP: {
    symbol: 'CRP',
    name: 'CRP',
    mintAddress: 'DubwWZNWiNGMMeeQHPnMATNj77YZPZSAz2WVR5WjLJqz',
    decimals: 9,
    referrer: 'FKocyVJptELTbnkUkDRmT7y6hUem2JYrqHoph9uyvQXt',
    tags: ['raydium']
  },
  ATLAS: {
    symbol: 'ATLAS',
    name: 'ATLAS',
    mintAddress: 'ATLASXmbPQxBUYbxPsV97usA3fPQYEqzQBUHgiFCUsXx',
    decimals: 8,
    referrer: '9t9mzbkMtLdazj1D9JycS15Geb1KVtcDt4XyAkpM72Ee',

    detailLink: 'https://raydium.medium.com/star-atlas-is-launching-on-acceleraytor-fa35cfe3291f',
    details:
      'POLIS is the primary governance token of Star Atlas.\n\nStar Atlas is a grand strategy game that combines space exploration, territorial conquest, and political domination. In the distant future, players can join one of three galactic factions to directly influence the course of the metaverse and earn real-world income for their contributions.\n\nThe Star Atlas offers a unique gaming experience by combining block chain mechanics with traditional game mechanics. All assets in the metaverse are directly owned by players, and can be traded on the marketplace or exchanged on other cryptocurrency networks.',
    docs: {
      website: 'https://staratlas.com/',
      whitepaper: 'https://staratlas.com/files/star-atlas-white-paper.pdf'
    },
    socials: {
      Twitter: 'https://twitter.com/staratlas',
      Telegram: 'https://t.me/staratlasgame',
      Medium: 'https://medium.com/star-atlas',
      Discord: 'https://discord.gg/staratlas',
      Twitch: 'https://www.twitch.tv/staratlasgame',
      Youtube: 'https://www.youtube.com/channel/UCt-y8Npwje5KDG5MSZ0a9Jw/videos'
    },
    tags: ['raydium']
  },
  POLIS: {
    symbol: 'POLIS',
    name: 'POLIS',
    mintAddress: 'poLisWXnNRwC6oBu1vHiuKQzFjGL4XDSu4g9qjz9qVk',
    decimals: 8,
    referrer: 'CQ7HWCeSSp3tAfWzqH7ZEzgnTBr5Tvz1No3Y1xbiWzBm',

    detailLink: 'https://raydium.medium.com/star-atlas-is-launching-on-acceleraytor-fa35cfe3291f',
    details:
      'POLIS is the primary governance token of Star Atlas.\n\nStar Atlas is a grand strategy game that combines space exploration, territorial conquest, and political domination. In the distant future, players can join one of three galactic factions to directly influence the course of the metaverse and earn real-world income for their contributions.\n\nThe Star Atlas offers a unique gaming experience by combining block chain mechanics with traditional game mechanics. All assets in the metaverse are directly owned by players, and can be traded on the marketplace or exchanged on other cryptocurrency networks.',
    docs: {
      website: 'https://staratlas.com/',
      whitepaper: 'https://staratlas.com/files/star-atlas-white-paper.pdf'
    },
    socials: {
      Twitter: 'https://twitter.com/staratlas',
      Telegram: 'https://t.me/staratlasgame',
      Medium: 'https://medium.com/star-atlas',
      Discord: 'https://discord.gg/staratlas',
      Twitch: 'https://www.twitch.tv/staratlasgame',
      Youtube: 'https://www.youtube.com/channel/UCt-y8Npwje5KDG5MSZ0a9Jw/videos'
    },
    tags: ['raydium']
  },
  GRAPE: {
    symbol: 'GRAPE',
    name: 'GRAPE',
    mintAddress: '8upjSpvjcdpuzhfR1zriwg5NXkwDruejqNE9WNbPRtyA',
    decimals: 6,
    referrer: 'M4nDMB9krXbaNFPVu1DjrBTfqPUHbKEQLZSSDNH2JrL',

    detailLink: 'https://raydium.medium.com/grape-protocol-launching-on-acceleraytor-547f58c12937',
    details:
      'The GRAPE “Great Ape” community is a token-based membership community focused on accelerating the growth and adoption of Solana. GRAPE token holders at different tiers are rewarded with exclusive benefits and monthly emissions of GRAPE. You can find more details on the GRAPE membership tiers and benefits here.\n\nThe GRAPE toolset creates a framework for decentralized and tokenized communities to better organize and coordinate their activities, unlocking a whole new world of possibility for these dynamic groups. The GRAPE roadmap includes modules for DAO Management, non-custodial tipping, escrow, and event planning to be deployed in the next 6 months.\n\nGRAPE protocol’s first tool, Grape Access, creates a Dynamic Balance-Based Membership solution by connecting members’ social accounts to cryptographic keys. All Solana tokens are supported by Multi-Coin configurations, which grants users permission and access rights based on SPL tokens, token pairs, and LP tokens in their wallet.',
    docs: {
      website: 'https://grapes.network/'
      // whitepaper: '' // TODO
    },
    socials: {
      Discord: 'https://discord.com/invite/greatape',
      Medium: 'https://medium.com/great-ape',
      Twitter: 'https://twitter.com/grapeprotocol',
      Twitch: 'https://www.twitch.tv/whalesfriend'
    },
    tags: ['raydium']
  },
  CHEEMS: {
    symbol: 'CHEEMS',
    name: 'CHEEMS',
    mintAddress: '3FoUAsGDbvTD6YZ4wVKJgTB76onJUKz7GPEBNiR5b8wc',
    decimals: 4,
    referrer: '',
    tags: ['raydium']
  },
  stSOL: {
    symbol: 'stSOL',
    name: 'stSOL',
    mintAddress: '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj',
    decimals: 9,
    referrer: '8Mq4Tugv1fcT4gb1wf5ChdEFmdqNGKxFVCnM9TVe44vD',
    tags: ['raydium']
  },
  LARIX: {
    symbol: 'LARIX',
    name: 'LARIX',
    mintAddress: 'Lrxqnh6ZHKbGy3dcrCED43nsoLkM1LTzU2jRfWe8qUC',
    decimals: 6,
    referrer: 'DReKowvoxxEDdi5jnxBWJLTV73D9oHSt9uNMuSCk9cLk',
    tags: ['raydium']
  },
  RIN: {
    symbol: 'RIN',
    name: 'RIN',
    mintAddress: 'E5ndSkaB17Dm7CsD22dvcjfrYSDLCxFcMd6z8ddCk5wp',
    decimals: 9,
    tags: ['raydium']
  },
  APEX: {
    symbol: 'APEX',
    name: 'APEX',
    mintAddress: '51tMb3zBKDiQhNwGqpgwbavaGH54mk8fXFzxTc1xnasg',
    decimals: 9,
    tags: ['raydium']
  },
  MNDE: {
    symbol: 'MNDE',
    name: 'MNDE',
    mintAddress: 'MNDEFzGvMt87ueuHvVU9VcTqsAP5b3fTGPsHuuPA5ey',
    decimals: 9,
    tags: ['raydium']
  },
  LIQ: {
    symbol: 'LIQ',
    name: 'LIQ',
    mintAddress: '4wjPQJ6PrkC4dHhYghwJzGBVP78DkBzA2U3kHoFNBuhj',
    decimals: 6,
    tags: ['raydium']
  },
  WAG: {
    symbol: 'WAG',
    name: 'WAG',
    mintAddress: '5tN42n9vMi6ubp67Uy4NnmM5DMZYN8aS8GeB3bEDHr6E',
    decimals: 9,
    tags: ['raydium']
  },
  wLDO: {
    symbol: 'wLDO',
    name: 'wLDO',
    mintAddress: 'HZRCwxP2Vq9PCpPXooayhJ2bxTpo5xfpQrwB1svh332p',
    decimals: 8,
    tags: ['raydium']
  },
  SLIM: {
    symbol: 'SLIM',
    name: 'SLIM',
    mintAddress: 'xxxxa1sKNGwFtw2kFn8XauW9xq8hBZ5kVtcSesTT9fW',
    decimals: 6,
    tags: ['raydium']
  },
  PRT: {
    symbol: 'PRT',
    name: 'PRT',
    mintAddress: 'PRT88RkA4Kg5z7pKnezeNH4mafTvtQdfFgpQTGRjz44',
    decimals: 6,
    tags: ['raydium']
  },
  SBR: {
    symbol: 'SBR',
    name: 'SBR',
    mintAddress: 'Saber2gLauYim4Mvftnrasomsv6NvAuncvMEZwcLpD1',
    decimals: 6,
    tags: ['raydium']
  },
  FAB: {
    symbol: 'FAB',
    name: 'FAB',
    mintAddress: 'EdAhkbj5nF9sRM7XN7ewuW8C9XEUMs8P7cnoQ57SYE96',
    decimals: 9,
    tags: ['raydium']
  },
  ABR: {
    symbol: 'ABR',
    name: 'ABR',
    mintAddress: 'a11bdAAuV8iB2fu7X6AxAvDTo1QZ8FXB3kk5eecdasp',
    decimals: 9,
    tags: ['raydium']
  },
  IVN: {
    symbol: 'IVN',
    name: 'IVN',
    mintAddress: 'iVNcrNE9BRZBC9Aqf753iZiZfbszeAVUoikgT9yvr2a',
    decimals: 6,
    tags: ['raydium']
  },
  CYS: {
    symbol: 'CYS',
    name: 'CYS',
    mintAddress: 'BRLsMczKuaR5w9vSubF4j8HwEGGprVAyyVgS4EX7DKEg',
    decimals: 6,
    tags: ['raydium']
  },
  FRKT: {
    symbol: 'FRKT',
    name: 'FRKT',
    mintAddress: 'ErGB9xa24Szxbk1M28u2Tx8rKPqzL6BroNkkzk5rG4zj',
    decimals: 8,
    tags: ['raydium']
  }
}

export const LP_TOKENS: Tokens = {
  'BTC-USDC-V4': {
    symbol: 'BTC-USDC',
    name: 'BTC-USDC LP',
    coin: { ...TOKENS.BTC },
    pc: { ...TOKENS.USDC },

    mintAddress: 'B97YZwx1QFbeb931jfNxhdgR7719CRujiDFv1mszXFvD',
    decimals: TOKENS.BTC.decimals
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
        Object.values(TOKENS)
          .find((item) => item.mintAddress === mintAddress)
          .tags.push('userAdd')
      }
    }
  }
}

function addTokensSolana() {
  fetch('https://api.raydium.io/cache/solana-token-list')
    .then(async (response) => {
      addTokensSolanaFunc((await response.json()).tokens)
    })
    .catch(() => {
      fetch('https://raw.githubusercontent.com/solana-labs/token-list/main/src/tokens/solana.tokenlist.json')
        .then(function (response) {
          return response.json()
        })
        .then(function (myJson) {
          addTokensSolanaFunc(myJson.tokens)
        })
    })
}

function addTokensSolanaFunc(tokens: any[]) {
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
