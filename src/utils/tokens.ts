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
      'Solrise Finance is a fully decentralized and non-custodial protocol for investment funds on Solana. What this means in practice is that anyone can open a fund, and anyone can invest in it.\n\nSolrise’s platform allows fund managers from all across the globe — weWether they are well-established and looking for a new channel, or ambitious rookies with something to prove — to open a fund, with performance kept completely transparent.\n\nExisting decentralized fund management platforms on Ethereum are suffering from brutally high transaction fees. With Solrise, you can create, enter, and exit funds all for under $0.01.',
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
  GENE: {
    symbol: 'GENE',
    name: 'Genopets',
    mintAddress: 'GENEtH5amGSi8kHAtQoezp1XEXwZJ8vcuePYnXdKrMYz',
    decimals: 9,

    detailLink: 'https://raydium.medium.com/genopets-is-launching-on-acceleraytor-a4cba0b9f78b',
    details:
      'Genopets is the world’s first Free-to-Play, Move-to-Earn NFT game that makes it fun and rewarding to live an active lifestyle. Build on Solana, Genopets integrates your daily activity in real life with blockchain Play-to-Earn economics so you can turn your real-life actions into expansive gameplay and earn crypto while doing it.',
    docs: {
      website: 'https://www.genopets.me/'
      // whitepaper: ''
    },
    socials: {
      Discord: 'https://discord.gg/genopets',
      Medium: 'https://medium.com/@genopets',
      Twitter: 'https://twitter.com/genopets'
    },
    tags: ['raydium']
  },
  DFL: {
    symbol: 'DFL',
    name: 'DeFi Land',
    mintAddress: 'DFL1zNkaGPWm1BqAVqRjCZvHmwTFrEaJtbzJWgseoNJh',
    decimals: 9,

    detailLink: 'https://raydium.medium.com/defi-land-is-launching-on-acceleraytor-8aa06caecc3c',
    details:
      'DeFi Land is a multi-chain agriculture simulation web game created to gamify decentralized finance. The game will have all the features that traditional platforms have, but it will be gathered all in one place. DeFi Land gamifies decentralized finance by turning investment activities into games.',
    docs: {
      website: 'https://defiland.app/'
      // whitepaper: ''
    },
    socials: {
      Discord: 'https://discord.gg/defiland',
      Medium: 'https://defiland.medium.com/',
      Twitter: 'https://twitter.com/DeFi_Land',
      Telegram: 'https://t.me/defiland_official'
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
  },
  AURY: {
    symbol: 'AURY',
    name: 'AURY',
    mintAddress: 'AURYydfxJib1ZkTir1Jn1J9ECYUtjb6rKQVmtYaixWPP',
    decimals: 9,
    tags: ['raydium']
  },
  SYP: {
    symbol: 'SYP',
    name: 'SYP',
    mintAddress: 'FnKE9n6aGjQoNWRBZXy4RW6LZVao7qwBonUbiD7edUmZ',
    decimals: 9,
    tags: ['raydium']
  },
  WOOF: {
    symbol: 'WOOF',
    name: 'WOOF',
    mintAddress: '9nEqaUcb16sQ3Tn1psbkWqyhPdLmfHWjKGymREjsAgTE',
    decimals: 6,
    tags: ['raydium']
  },
  ORCA: {
    symbol: 'ORCA',
    name: 'ORCA',
    mintAddress: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE',
    decimals: 6,
    tags: ['raydium']
  },
  SLND: {
    symbol: 'SLND',
    name: 'SLND',
    mintAddress: 'SLNDpmoWTVADgEdndyvWzroNL7zSi1dF9PC3xHGtPwp',
    decimals: 6,
    tags: ['raydium']
  },
  weWETH: {
    symbol: 'weWETH',
    name: 'weWETH',
    mintAddress: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs',
    decimals: 8,
    tags: ['raydium']
  },
  weUNI: {
    symbol: 'weUNI',
    name: 'weUNI',
    mintAddress: '8FU95xFJhUUkyyCLU13HSzDLs7oC4QZdXQHL6SCeab36',
    decimals: 8,
    tags: ['raydium']
  },
  weSUSHI: {
    symbol: 'weSUSHI',
    name: 'weSUSHI',
    mintAddress: 'ChVzxWRmrTeSgwd3Ui3UumcN8KX7VK3WaD4KGeSKpypj',
    decimals: 8,
    tags: ['raydium']
  },
  GOFX: {
    symbol: 'GOFX',
    name: 'GOFX',
    mintAddress: 'GFX1ZjR2P15tmrSwow6FjyDYcEkoFb4p4gJCpLBjaxHD',
    decimals: 9,
    tags: ['raydium']
  },
  IN: {
    symbol: 'IN',
    name: 'IN',
    mintAddress: 'inL8PMVd6iiW3RCBJnr5AsrRN6nqr4BTrcNuQWQSkvY',
    decimals: 9,
    tags: ['raydium']
  },
  weDYDX: {
    symbol: 'weDYDX',
    name: 'weDYDX',
    mintAddress: '4Hx6Bj56eGyw8EJrrheM6LBQAvVYRikYCWsALeTrwyRU',
    decimals: 8,
    tags: ['raydium']
  },
  STARS: {
    symbol: 'STARS',
    name: 'STARS',
    mintAddress: 'HCgybxq5Upy8Mccihrp7EsmwwFqYZtrHrsmsKwtGXLgW',
    decimals: 6,
    tags: ['raydium']
  },
  weAXS: {
    symbol: 'weAXS',
    name: 'weAXS',
    mintAddress: 'HysWcbHiYY9888pHbaqhwLYZQeZrcQMXKQWRqS7zcPK5',
    decimals: 8,
    tags: ['raydium']
  },
  weSHIB: {
    symbol: 'weSHIB',
    name: 'weSHIB',
    mintAddress: 'CiKu4eHsVrc1eueVQeHn7qhXTcVu95gSQmBpX4utjL9z',
    decimals: 8,
    tags: ['raydium']
  },
  OXS: {
    symbol: 'OXS',
    name: 'OXS',
    mintAddress: '4TGxgCSJQx2GQk9oHZ8dC5m3JNXTYZHjXumKAW3vLnNx',
    decimals: 9,
    tags: ['raydium']
  },
  CWAR: {
    symbol: 'CWAR',
    name: 'CWAR',
    mintAddress: 'HfYFjMKNZygfMC8LsQ8LtpPsPxEJoXJx4M6tqi75Hajo',
    decimals: 9,
    tags: ['raydium']
  },
  UPS: {
    symbol: 'UPS',
    name: 'UPS',
    mintAddress: 'EwJN2GqUGXXzYmoAciwuABtorHczTA5LqbukKXV1viH7',
    decimals: 6,
    tags: ['raydium']
  },
  weSAND: {
    symbol: 'weSAND',
    name: 'weSAND',
    mintAddress: '49c7WuCZkQgc3M4qH8WuEUNXfgwupZf1xqWkDQ7gjRGt',
    decimals: 8,
    tags: ['raydium']
  },
  weMANA: {
    symbol: 'weMANA',
    name: 'weMANA',
    mintAddress: '7dgHoN8wBZCc5wbnQ2C47TDnBMAxG4Q5L3KjP67z8kNi',
    decimals: 8,
    tags: ['raydium']
  },
  CAVE: {
    symbol: 'CAVE',
    name: 'CAVE',
    mintAddress: '4SZjjNABoqhbd4hnapbvoEPEqT8mnNkfbEoAwALf1V8t',
    decimals: 6,
    tags: ['raydium']
  },
  JSOL: {
    symbol: 'JSOL',
    name: 'JSOL',
    mintAddress: '7Q2afV64in6N6SeZsAAB81TJzwDoD6zpqmHkzi9Dcavn',
    decimals: 9,
    tags: ['raydium']
  },
  APT: {
    symbol: 'APT',
    name: 'APT',
    mintAddress: 'APTtJyaRX5yGTsJU522N4VYWg3vCvSb65eam5GrPT5Rt',
    decimals: 6,
    tags: ['raydium']
  },
  SONAR: {
    symbol: 'SONAR',
    name: 'SONAR',
    mintAddress: 'sonarX4VtVkQemriJeLm6CKeW3GDMyiBnnAEMw1MRAE',
    decimals: 9,
    tags: ['raydium']
  },
  SHILL: {
    symbol: 'SHILL',
    name: 'SHILL',
    mintAddress: '6cVgJUqo4nmvQpbgrDZwyfd6RwWw5bfnCamS3M9N1fd',
    decimals: 6,
    tags: ['raydium']
  },
  TTT: {
    symbol: 'TTT',
    name: 'TabTrader',
    mintAddress: 'FNFKRV3V8DtA3gVJN6UshMiLGYA8izxFwkNWmJbFjmRj',
    decimals: 6,

    detailLink: 'https://raydium.medium.com/tabtrader-is-launching-on-acceleraytor-bc570b6a9628',
    details:
      'TabTrader is a trading terminal that supports 34 exchanges with over 12,000 instruments, a variety of analytical tools, and a convenient interface. It’s a quick-access application allowing you to track your exchange accounts, trade, analyze charts, and get instantly notified on price changes, all within one unified interface. The app has a rating of 4.7 on the Apple App Store (with over 52,000 ratings) and a rating of 4.5 on the Google Play Store (with over 55,000 ratings).',
    docs: {
      website: 'https://tab-trader.com/'
      // whitepaper: ''
    },
    socials: {
      Twitter: 'https://twitter.com/tabtraderpro',
      Telegram: 'https://t.me/tabtrader_en'
    },
    tags: ['raydium']
  },
  BOKU: {
    symbol: 'BOKU',
    name: 'BOKU',
    mintAddress: 'CN7qFa5iYkHz99PTctvT4xXUHnxwjQ5MHxCuTJtPN5uS',
    decimals: 9,
    tags: ['raydium']
  },
  MIMO: {
    symbol: 'MIMO',
    name: 'MIMO',
    mintAddress: '9TE7ebz1dsFo1uQ2T4oYAKSm39Y6fWuHrd6Uk6XaiD16',
    decimals: 9,
    tags: ['raydium']
  },
  wbWBNB: {
    symbol: 'wbWBNB',
    name: 'wbWBNB',
    mintAddress: '9gP2kCy3wA1ctvYWQk75guqXuHfrEomqydHLtcTCqiLa',
    decimals: 8,
    tags: ['raydium']
  },
  wePEOPLE: {
    symbol: 'wePEOPLE',
    name: 'wePEOPLE',
    mintAddress: 'CobcsUrt3p91FwvULYKorQejgsm5HoQdv5T8RUZ6PnLA',
    decimals: 8,
    tags: ['raydium']
  },
  XTAG: {
    symbol: 'XTAG',
    name: 'XTAG',
    mintAddress: '5gs8nf4wojB5EXgDUWNLwXpknzgV2YWDhveAeBZpVLbp',
    decimals: 6,
    tags: ['raydium']
  },
  KKO: {
    symbol: 'KKO',
    name: 'KKO',
    mintAddress: 'kiNeKo77w1WBEzFFCXrTDRWGRWGP8yHvKC9rX6dqjQh',
    decimals: 9,
    tags: ['raydium']
  },
  VI: {
    symbol: 'VI',
    name: 'VI',
    mintAddress: '7zBWymxbZt7PVHQzfi3i85frc1YRiQc23K7bh3gos8ZC',
    decimals: 9,
    tags: ['raydium']
  },
  SOLC: {
    symbol: 'SOLC',
    name: 'SOLC',
    mintAddress: 'Bx1fDtvTN6NvE4kjdPHQXtmGSg582bZx9fGy4DQNMmAT',
    decimals: 9,
    tags: ['raydium']
  },
  STR: {
    symbol: 'STR',
    name: 'STR',
    mintAddress: '9zoqdwEBKWEi9G5Ze8BSkdmppxGgVv1Kw4LuigDiNr9m',
    decimals: 9,
    tags: ['raydium']
  },
  SPWN: {
    symbol: 'SPWN',
    name: 'SPWN',
    mintAddress: '5U9QqCPhqXAJcEv9uyzFJd5zhN93vuPk1aNNkXnUfPnt',
    decimals: 9,
    tags: ['raydium']
  },
  ISOLA: {
    symbol: 'ISOLA',
    name: 'ISOLA',
    mintAddress: '333iHoRM2Awhf9uVZtSyTfU8AekdGrgQePZsKMFPgKmS',
    decimals: 6,
    tags: ['raydium']
  },
  RUN: {
    symbol: 'RUN',
    name: 'RUN',
    mintAddress: '6F9XriABHfWhit6zmMUYAQBSy6XK5VF1cHXuW5LDpRtC',
    decimals: 9,

    detailLink: 'https://raydium.medium.com/runnode-is-launching-on-acceleraytor-3ff7326864b0',
    details:
      'RunNode is a bridge from web 2.0 to 3.0 and powers the infrastructure of Solana through its RPC protocol. With a quick onboarding application to get an RPC endpoint in under 30 seconds, any project can launch, build and scale its Solana dApp — now.',
    docs: {
      website: 'https://runnode.com/'
      // whitepaper: ''
    },
    socials: {
      Twitter: 'https://twitter.com/RunNode',
      Telegram: 'https://t.me/runnode',
      Discord: 'https://discord.gg/V2f74X8Zrt'
    },

    tags: ['raydium']
  },
  REAL: {
    symbol: 'REAL',
    name: 'REAL',
    mintAddress: 'AD27ov5fVU2XzwsbvnFvb1JpCBaCB5dRXrczV9CqSVGb',
    decimals: 9,

    detailLink: 'https://raydium.medium.com/realy-is-launching-on-acceleraytor-b6d6a63d69d8',
    details:
      'Realy Metaverse will be the 1st Live-to-Earn metaverse on Solana. Developed via Unreal Engine, Realy is a virtual city with AAA graphics that seamlessly integrates virtual and reality.',
    docs: {
      website: 'https://realy.pro/'
      // whitepaper: ''
    },
    socials: {
      Twitter: 'https://twitter.com/RealyOfficial',
      Telegram: 'https://t.me/realyofficial',
      Discord: 'https://discord.gg/realy'
    },

    tags: ['raydium']
  },
  CRWNY: {
    symbol: 'CRWNY',
    name: 'CRWNY',
    mintAddress: 'CRWNYkqdgvhGGae9CKfNka58j6QQkaD5bLhKXvUYqnc1',
    decimals: 6,
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
    name: 'RAY-USDC V2 LP',
    coin: { ...TOKENS.RAY },
    pc: { ...TOKENS.USDC },

    mintAddress: 'FgmBnsF5Qrnv8X9bomQfEtQTQjNNiBCWRKGpzPnE5BDg',
    decimals: TOKENS.RAY.decimals
  },
  'RAY-SRM': {
    symbol: 'RAY-SRM',
    name: 'RAY-SRM V2 LP',
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
    name: 'RAY-USDC V3 LP',
    coin: { ...TOKENS.RAY },
    pc: { ...TOKENS.USDC },

    mintAddress: 'BZFGfXMrjG2sS7QT2eiCDEevPFnkYYF7kzJpWfYxPbcx',
    decimals: TOKENS.RAY.decimals
  },
  'RAY-SRM-V3': {
    symbol: 'RAY-SRM',
    name: 'RAY-SRM V3 LP',
    coin: { ...TOKENS.RAY },
    pc: { ...TOKENS.SRM },

    mintAddress: 'DSX5E21RE9FB9hM8Nh8xcXQfPK6SzRaJiywemHBSsfup',
    decimals: TOKENS.RAY.decimals
  },
  'RAY-SOL-V3': {
    symbol: 'RAY-SOL',
    name: 'RAY-SOL V3 LP',
    coin: { ...TOKENS.RAY },
    pc: { ...NATIVE_SOL },

    mintAddress: 'F5PPQHGcznZ2FxD9JaxJMXaf7XkaFFJ6zzTBcW8osQjw',
    decimals: TOKENS.RAY.decimals
  },
  'RAY-ETH-V3': {
    symbol: 'RAY-ETH',
    name: 'RAY-ETH V3 LP',
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
  },
  'SAMO-RAY-V4': {
    symbol: 'SAMO-RAY',
    name: 'SAMO-RAY LP',
    coin: { ...TOKENS.SAMO },
    pc: { ...TOKENS.RAY },

    mintAddress: 'HwzkXyX8B45LsaHXwY8su92NoRBS5GQC32HzjQRDqPnr',
    decimals: TOKENS.SAMO.decimals
  },
  'renBTC-USDC-V4': {
    symbol: 'renBTC-USDC',
    name: 'renBTC-USDC LP',
    coin: { ...TOKENS.renBTC },
    pc: { ...TOKENS.USDC },

    mintAddress: 'CTEpsih91ZLo5gunvryLpJ3pzMjmt5jbS6AnSQrzYw7V',
    decimals: TOKENS.renBTC.decimals
  },
  'renDOGE-USDC-V4': {
    symbol: 'renDOGE-USDC',
    name: 'renDOGE-USDC LP',
    coin: { ...TOKENS.renDOGE },
    pc: { ...TOKENS.USDC },

    mintAddress: 'Hb8KnZNKvRxu7pgMRWJgoMSMcepfvNiBFFDDrdf9o3wA',
    decimals: TOKENS.renDOGE.decimals
  },
  'RAY-USDC-V4': {
    symbol: 'RAY-USDC',
    name: 'RAY-USDC LP',
    coin: { ...TOKENS.RAY },
    pc: { ...TOKENS.USDC },

    mintAddress: 'FbC6K13MzHvN42bXrtGaWsvZY9fxrackRSZcBGfjPc7m',
    decimals: TOKENS.RAY.decimals
  },
  'RAY-SRM-V4': {
    symbol: 'RAY-SRM',
    name: 'RAY-SRM LP',
    coin: { ...TOKENS.RAY },
    pc: { ...TOKENS.SRM },

    mintAddress: '7P5Thr9Egi2rvMmEuQkLn8x8e8Qro7u2U7yLD2tU2Hbe',
    decimals: TOKENS.RAY.decimals
  },
  'RAY-ETH-V4': {
    symbol: 'RAY-ETH',
    name: 'RAY-ETH LP',
    coin: { ...TOKENS.RAY },
    pc: { ...TOKENS.ETH },

    mintAddress: 'mjQH33MqZv5aKAbKHi8dG3g3qXeRQqq1GFcXceZkNSr',
    decimals: TOKENS.RAY.decimals
  },
  'RAY-SOL-V4': {
    symbol: 'RAY-SOL',
    name: 'RAY-SOL LP',
    coin: { ...TOKENS.RAY },
    pc: { ...NATIVE_SOL },

    mintAddress: '89ZKE4aoyfLBe2RuV6jM3JGNhaV18Nxh8eNtjRcndBip',
    decimals: TOKENS.RAY.decimals
  },
  'DXL-USDC-V4': {
    symbol: 'DXL-USDC',
    name: 'DXL-USDC LP',
    coin: { ...TOKENS.DXL },
    pc: { ...TOKENS.USDC },

    mintAddress: '4HFaSvfgskipvrzT1exoVKsUZ174JyExEsA8bDfsAdY5',
    decimals: TOKENS.DXL.decimals
  },
  'LIKE-USDC-V4': {
    symbol: 'LIKE-USDC',
    name: 'LIKE-USDC LP',
    coin: { ...TOKENS.LIKE },
    pc: { ...TOKENS.USDC },

    mintAddress: 'cjZmbt8sJgaoyWYUttomAu5LJYU44ZrcKTbzTSEPDVw',
    decimals: TOKENS.LIKE.decimals
  },
  'mSOL-USDC-V4': {
    symbol: 'mSOL-USDC',
    name: 'mSOL-USDC LP',
    coin: { ...TOKENS.mSOL },
    pc: { ...TOKENS.USDC },

    mintAddress: '4xTpJ4p76bAeggXoYywpCCNKfJspbuRzZ79R7pRhbqSf',
    decimals: TOKENS.mSOL.decimals
  },
  'mSOL-SOL-V4': {
    symbol: 'mSOL-SOL',
    name: 'mSOL-SOL LP',
    coin: { ...TOKENS.mSOL },
    pc: { ...NATIVE_SOL },

    mintAddress: '5ijRoAHVgd5T5CNtK5KDRUBZ7Bffb69nktMj5n6ks6m4',
    decimals: TOKENS.mSOL.decimals
  },
  'MER-PAI-V4': {
    symbol: 'MER-PAI',
    name: 'MER-PAI LP',
    coin: { ...TOKENS.MER },
    pc: { ...TOKENS.PAI },

    mintAddress: 'DU5RT2D9EviaSmX6Ta8MZwMm85HwSEqGMRdqUiuCGfmD',
    decimals: TOKENS.MER.decimals
  },
  'PORT-USDC-V4': {
    symbol: 'PORT-USDC',
    name: 'PORT-USDC LP',
    coin: { ...TOKENS.PORT },
    pc: { ...TOKENS.USDC },

    mintAddress: '9tmNtbUCrLS15qC4tEfr5NNeqcqpZ4uiGgi2vS5CLQBS',
    decimals: TOKENS.PORT.decimals
  },
  'MNGO-USDC-V4': {
    symbol: 'MNGO-USDC',
    name: 'MNGO-USDC LP',
    coin: { ...TOKENS.MNGO },
    pc: { ...TOKENS.USDC },

    mintAddress: 'DkiqCQ792n743xjWQVCbBUaVtkdiuvQeYndM53ReWnCC',
    decimals: TOKENS.MNGO.decimals
  },
  'ATLAS-USDC-V4': {
    symbol: 'ATLAS-USDC',
    name: 'ATLAS-USDC LP',
    coin: { ...TOKENS.ATLAS },
    pc: { ...TOKENS.USDC },

    mintAddress: '9shGU9f1EsxAbiR567MYZ78WUiS6ZNCYbHe53WUULQ7n',
    decimals: TOKENS.ATLAS.decimals
  },
  'POLIS-USDC-V4': {
    symbol: 'POLIS-USDC',
    name: 'POLIS-USDC LP',
    coin: { ...TOKENS.POLIS },
    pc: { ...TOKENS.USDC },

    mintAddress: '8MbKSBpyXs8fVneKgt71jfHrn5SWtX8n4wMLpiVfF9So',
    decimals: TOKENS.POLIS.decimals
  },
  'ATLAS-RAY-V4': {
    symbol: 'ATLAS-RAY',
    name: 'ATLAS-RAY LP',
    coin: { ...TOKENS.ATLAS },
    pc: { ...TOKENS.RAY },

    mintAddress: '418MFhkaYQtbn529wmjLLqL6uKxDz7j4eZBaV1cobkyd',
    decimals: TOKENS.ATLAS.decimals
  },
  'POLIS-RAY-V4': {
    symbol: 'POLIS-RAY',
    name: 'POLIS-RAY LP',
    coin: { ...TOKENS.POLIS },
    pc: { ...TOKENS.RAY },

    mintAddress: '9ysGKUH6WqzjQEUT4dxqYCUaFNVK9QFEa24pGzjFq8xg',
    decimals: TOKENS.POLIS.decimals
  },
  'ALEPH-RAY-V4': {
    symbol: 'ALEPH-RAY',
    name: 'ALEPH-RAY LP',
    coin: { ...TOKENS.ALEPH },
    pc: { ...TOKENS.RAY },

    mintAddress: 'n76skjqv4LirhdLok2zJELXNLdRpYDgVJQuQFbamscy',
    decimals: TOKENS.ALEPH.decimals
  },
  'TULIP-RAY-V4': {
    symbol: 'TULIP-RAY',
    name: 'TULIP-RAY LP',
    coin: { ...TOKENS.TULIP },
    pc: { ...TOKENS.RAY },

    mintAddress: '3AZTviji5qduMG2s4FfWGR3SSQmNUCyx8ao6UKCPg3oJ',
    decimals: TOKENS.TULIP.decimals
  },
  'SLRS-RAY-V4': {
    symbol: 'SLRS-RAY',
    name: 'SLRS-RAY LP',
    coin: { ...TOKENS.SLRS },
    pc: { ...TOKENS.RAY },

    mintAddress: '2pk78vsKT3jfJAcN2zbpMUnrR57SZrxHqaZYyFgp92mM',
    decimals: TOKENS.SLRS.decimals
  },
  'MER-RAY-V4': {
    symbol: 'MER-RAY',
    name: 'MER-RAY LP',
    coin: { ...TOKENS.MER },
    pc: { ...TOKENS.RAY },

    mintAddress: '214hxy3AbKoaEKgqcg2aC1cP5R67cGGAyDEg5GDwC7Ub',
    decimals: TOKENS.MER.decimals
  },
  'MEDIA-RAY-V4': {
    symbol: 'MEDIA-RAY',
    name: 'MEDIA-RAY LP',
    coin: { ...TOKENS.MEDIA },
    pc: { ...TOKENS.RAY },

    mintAddress: '9Aseg5A1JD1yCiFFdDaNNxCiJ7XzrpZFmcEmLjXFdPaH',
    decimals: TOKENS.MEDIA.decimals
  },
  'SNY-RAY-V4': {
    symbol: 'SNY-RAY',
    name: 'SNY-RAY LP',
    coin: { ...TOKENS.SNY },
    pc: { ...TOKENS.RAY },

    mintAddress: '2k4quTuuLUxrSEhFH99qcoZzvgvVEc3b5sz3xz3qstfS',
    decimals: TOKENS.SNY.decimals
  },
  'LIKE-RAY-V4': {
    symbol: 'LIKE-RAY',
    name: 'LIKE-RAY LP',
    coin: { ...TOKENS.LIKE },
    pc: { ...TOKENS.RAY },

    mintAddress: '7xqDycbFSCpUpzkYapFeyPJWPwEpV7zdWbYf2MVHTNjv',
    decimals: TOKENS.LIKE.decimals
  },
  'COPE-RAY-V4': {
    symbol: 'COPE-RAY',
    name: 'COPE-RAY LP',
    coin: { ...TOKENS.COPE },
    pc: { ...TOKENS.RAY },

    mintAddress: 'A7GCVHA8NSsbdFscHdoNU41tL1TRKNmCH4K94CgcLK9F',
    decimals: TOKENS.COPE.decimals
  },
  'ETH-SOL-V4': {
    symbol: 'ETH-SOL',
    name: 'ETH-SOL LP',
    coin: { ...TOKENS.ETH },
    pc: { ...NATIVE_SOL },

    mintAddress: 'GKfgC86iJoMjwAtcyiLu6nWnjggqUXsDQihXkP14fDez',
    decimals: TOKENS.ETH.decimals
  },
  'stSOL-USDC-V4': {
    symbol: 'stSOL-USDC',
    name: 'stSOL-USDC LP',
    coin: { ...TOKENS.stSOL },
    pc: { ...TOKENS.USDC },

    mintAddress: 'HDUJMwYZkjUZre63xUeDhdCi8c6LgUDiBqxmP3QC3VPX',
    decimals: TOKENS.stSOL.decimals
  },
  'GRAPE-USDC-V4': {
    symbol: 'GRAPE-USDC',
    name: 'GRAPE-USDC LP',
    coin: { ...TOKENS.GRAPE },
    pc: { ...TOKENS.USDC },

    mintAddress: 'A8ZYmnZ1vwxUa4wpJVUaJgegsuTEz5TKy5CiJXffvmpt',
    decimals: TOKENS.GRAPE.decimals
  },
  'LARIX-USDC-V4': {
    symbol: 'LARIX-USDC',
    name: 'LARIX-USDC LP',
    coin: { ...TOKENS.LARIX },
    pc: { ...TOKENS.USDC },

    mintAddress: '7yieit4YsNsZ9CAK8H5ZEMvvk35kPEHHeXwp6naoWU9V',
    decimals: TOKENS.LARIX.decimals
  },
  'RIN-USDC-V4': {
    symbol: 'RIN-USDC',
    name: 'RIN-USDC LP',
    coin: { ...TOKENS.RIN },
    pc: { ...TOKENS.USDC },

    mintAddress: 'GfCWfrZez7BDmCSEeMERVDVUaaM2TEreyYUgb2cpuS3w',
    decimals: TOKENS.RIN.decimals
  },
  'APEX-USDC-V4': {
    symbol: 'APEX-USDC',
    name: 'APEX-USDC LP',
    coin: { ...TOKENS.APEX },
    pc: { ...TOKENS.USDC },

    mintAddress: '444cVqYyDxJNo6FqiMb9qQWFUd7tYzFRdDuJRFrSAGnU',
    decimals: TOKENS.APEX.decimals
  },
  'mSOL-RAY-V4': {
    symbol: 'mSOL-RAY',
    name: 'mSOL-RAY LP',
    coin: { ...TOKENS.mSOL },
    pc: { ...TOKENS.RAY },

    mintAddress: 'De2EHBAdkgfc72DpShqDGG42cV3iDWh8wvvZdPsiEcqP',
    decimals: TOKENS.mSOL.decimals
  },
  'MNDE-mSOL-V4': {
    symbol: 'MNDE-mSOL',
    name: 'MNDE-mSOL LP',
    coin: { ...TOKENS.MNDE },
    pc: { ...TOKENS.mSOL },

    mintAddress: '4bh8XCzTHSbqbWN8o1Jn4ueBdz1LvJFoEasN6K6CQ8Ny',
    decimals: TOKENS.MNDE.decimals
  },
  'LARIX-RAY-V4': {
    symbol: 'LARIX-RAY',
    name: 'LARIX-RAY LP',
    coin: { ...TOKENS.LARIX },
    pc: { ...TOKENS.RAY },

    mintAddress: 'ZRDfSLgWGeaYSmhdPvFNKQQhDcYdZQaue2N8YDmHX4q',
    decimals: TOKENS.LARIX.decimals
  },
  'LIQ-USDC-V4': {
    symbol: 'LIQ-USDC',
    name: 'LIQ-USDC LP',
    coin: { ...TOKENS.LIQ },
    pc: { ...TOKENS.USDC },

    mintAddress: 'GWpD3eTfhJB5KDCcnE85dBQrjAk2CsrgDF9b52R9CrjV',
    decimals: TOKENS.LIQ.decimals
  },
  'WAG-USDC-V4': {
    symbol: 'WAG-USDC',
    name: 'WAG-USDC LP',
    coin: { ...TOKENS.WAG },
    pc: { ...TOKENS.USDC },

    mintAddress: '4yykyPugitUVRewNPXXCviRvxGfsfsRMoP32z3b6FmUC',
    decimals: TOKENS.WAG.decimals
  },
  'ETH-mSOL-V4': {
    symbol: 'ETH-mSOL',
    name: 'ETH-mSOL LP',
    coin: { ...TOKENS.ETH },
    pc: { ...TOKENS.mSOL },

    mintAddress: 'HYv3grQfi8QbV7nG7EFgNK1aJSrsJ7HynXJKJVPLL2Uh',
    decimals: TOKENS.ETH.decimals
  },
  'mSOL-USDT-V4': {
    symbol: 'mSOL-USDT',
    name: 'mSOL-USDT LP',
    coin: { ...TOKENS.mSOL },
    pc: { ...TOKENS.USDT },

    mintAddress: '69NCmEW9mGpiWLjAcAWHq51k4ionJZmzgRfRT3wQaCCf',
    decimals: TOKENS.mSOL.decimals
  },
  'BTC-mSOL-V4': {
    symbol: 'BTC-mSOL',
    name: 'BTC-mSOL LP',
    coin: { ...TOKENS.BTC },
    pc: { ...TOKENS.mSOL },

    mintAddress: '92bcERNtUmuaJ6mwLSxYHZYSph37jdKxRdoYNxpcYNPp',
    decimals: TOKENS.BTC.decimals
  },
  'SLIM-SOL-V4': {
    symbol: 'SLIM-SOL',
    name: 'SLIM-SOL LP',
    coin: { ...TOKENS.SLIM },
    pc: { ...NATIVE_SOL },

    mintAddress: '9X4EK8E59VAVi6ChnNvvd39m6Yg9RtkBbAPq1mDVJT57',
    decimals: TOKENS.SLIM.decimals
  },
  'AURY-USDC-V4': {
    symbol: 'AURY-USDC',
    name: 'AURY-USDC LP',
    coin: { ...TOKENS.AURY },
    pc: { ...TOKENS.USDC },

    mintAddress: 'Gub5dvTy4nzP82qpmpNkBxmRqjtqRddBTBqHSdNcf2oS',
    decimals: TOKENS.AURY.decimals
  },
  'PRT-SOL-V4': {
    symbol: 'PRT-SOL',
    name: 'PRT-SOL LP',
    coin: { ...TOKENS.PRT },
    pc: { ...NATIVE_SOL },

    mintAddress: 'EcJ8Wgwt1AzSPiDpVr6aaSur8TKAsNTPmmzRACeqT68Z',
    decimals: TOKENS.PRT.decimals
  },
  'LIQ-RAY-V4': {
    symbol: 'LIQ-RAY',
    name: 'LIQ-RAY LP',
    coin: { ...TOKENS.LIQ },
    pc: { ...TOKENS.RAY },

    mintAddress: '49YUsDrThJosHSagCn1F59Uc9NRxbr9thVrZikUnQDXy',
    decimals: TOKENS.LIQ.decimals
  },
  'SYP-SOL-V4': {
    symbol: 'SYP-SOL',
    name: 'SYP-SOL LP',
    coin: { ...TOKENS.SYP },
    pc: { ...NATIVE_SOL },

    mintAddress: 'KHV6dfj2bDntzJ9z1S26cDfqWfUZdJRFmteLR6LxHwW',
    decimals: TOKENS.SYP.decimals
  },
  'SYP-RAY-V4': {
    symbol: 'SYP-RAY',
    name: 'SYP-RAY LP',
    coin: { ...TOKENS.SYP },
    pc: { ...TOKENS.RAY },

    mintAddress: 'FT2KZqxxM8F2h9pZtTF4PyjK88bM4YbuBzd7ZPwQ5wMB',
    decimals: TOKENS.SYP.decimals
  },
  'SYP-USDC-V4': {
    symbol: 'SYP-USDC',
    name: 'SYP-USDC LP',
    coin: { ...TOKENS.SYP },
    pc: { ...TOKENS.USDC },

    mintAddress: '2xJGuLAivAR1WkARRA6zP1v4jaA9jV2Qis8JfMNvrVyZ',
    decimals: TOKENS.SYP.decimals
  },
  'FAB-USDC-V4': {
    symbol: 'FAB-USDC',
    name: 'FAB-USDC LP',
    coin: { ...TOKENS.FAB },
    pc: { ...TOKENS.USDC },

    mintAddress: '5rTCvZq6BcApsC3VV1EEUuTJfaVd8uYhcGjwTy1By6P8',
    decimals: TOKENS.FAB.decimals
  },
  'WOOF-RAY-V4': {
    symbol: 'WOOF-RAY',
    name: 'WOOF-RAY LP',
    coin: { ...TOKENS.WOOF },
    pc: { ...TOKENS.RAY },

    mintAddress: 'H2FAnazDaGFutcmnrwDxhmdncR1Bd7GG4mhPCSUiamDX',
    decimals: TOKENS.WOOF.decimals
  },
  'WOOF-USDC-V4': {
    symbol: 'WOOF-USDC',
    name: 'WOOF-USDC LP',
    coin: { ...TOKENS.WOOF },
    pc: { ...TOKENS.USDC },

    mintAddress: 'EFSu5TMc1ijRevaYCxUkS7uGvbhsymDHEaTK3UVdNE3q',
    decimals: TOKENS.WOOF.decimals
  },
  'SLND-USDC-V4': {
    symbol: 'SLND-USDC',
    name: 'SLND-USDC LP',
    coin: { ...TOKENS.SLND },
    pc: { ...TOKENS.USDC },

    mintAddress: 'EunE9uDh2cGsyJcsGuGKc6wte7kBn8iye2gzC4w2ePHn',
    decimals: TOKENS.SLND.decimals
  },
  'FRKT-SOL-V4': {
    symbol: 'FRKT-SOL',
    name: 'FRKT-SOL LP',
    coin: { ...TOKENS.FRKT },
    pc: { ...NATIVE_SOL },

    mintAddress: 'HYUKXgpjaxMXHttyrFYtv3z2rdhZ1U9QDH8zEc8BooQC',
    decimals: TOKENS.FRKT.decimals
  },
  'weWETH-SOL-V4': {
    symbol: 'weWETH-SOL',
    name: 'weWETH-SOL LP',
    coin: { ...TOKENS.weWETH },
    pc: { ...NATIVE_SOL },

    mintAddress: '3hbozt2Por7bcrGod8N7kEeJNMocFFjCJrQR16TQGBrE',
    decimals: TOKENS.weWETH.decimals
  },
  'weWETH-USDC-V4': {
    symbol: 'weWETH-USDC',
    name: 'weWETH-USDC LP',
    coin: { ...TOKENS.weWETH },
    pc: { ...TOKENS.USDC },

    mintAddress: '3529SBnMCDW3S3xQ52aABbRHo7PcHvpQA4no8J12L5eK',
    decimals: TOKENS.weWETH.decimals
  },
  'weUNI-USDC-V4': {
    symbol: 'weUNI-USDC',
    name: 'weUNI-USDC LP',
    coin: { ...TOKENS.weUNI },
    pc: { ...TOKENS.USDC },

    mintAddress: 'EEC4QnT41py39QaYnzQnoYQEtDUDNa6Se8SBDgfPSN2a',
    decimals: TOKENS.weUNI.decimals
  },
  'weSUSHI-USDC-V4': {
    symbol: 'weSUSHI-USDC',
    name: 'weSUSHI-USDC LP',
    coin: { ...TOKENS.weSUSHI },
    pc: { ...TOKENS.USDC },

    mintAddress: '3wVrtQZsiDNp5yTPyfEzQHPU6iuJoMmpnWg6CTt4V8sR',
    decimals: TOKENS.weSUSHI.decimals
  },
  'CYS-USDC-V4': {
    symbol: 'CYS-USDC',
    name: 'CYS-USDC LP',
    coin: { ...TOKENS.CYS },
    pc: { ...TOKENS.USDC },

    mintAddress: 'GfV3QDzzdVUwCNSdfn6PjhmyJvjw18tn51RingWZYwk3',
    decimals: TOKENS.CYS.decimals
  },
  'SAMO-USDC-V4': {
    symbol: 'SAMO-USDC',
    name: 'SAMO-USDC LP',
    coin: { ...TOKENS.SAMO },
    pc: { ...TOKENS.USDC },

    mintAddress: 'B2PjGEP3vPf1999fUD14pYdxvSDRVBk43hxB2rgthwEY',
    decimals: TOKENS.SAMO.decimals
  },
  'ABR-USDC-V4': {
    symbol: 'ABR-USDC',
    name: 'ABR-USDC LP',
    coin: { ...TOKENS.ABR },
    pc: { ...TOKENS.USDC },

    mintAddress: 'ECHfxkf5zjjZFTX95QfFahNyzG7feyEKcfTdjsdrMSGU',
    decimals: TOKENS.ABR.decimals
  },
  'IN-USDC-V4': {
    symbol: 'IN-USDC',
    name: 'IN-USDC LP',
    coin: { ...TOKENS.IN },
    pc: { ...TOKENS.USDC },

    mintAddress: 'GbmJtVgg9fRmmmjKUYGMZeSt8wZ47cDDXasg5Y3iF4kz',
    decimals: TOKENS.IN.decimals
  },
  'weDYDX-USDC-V4': {
    symbol: 'weDYDX-USDC',
    name: 'weDYDX-USDC LP',
    coin: { ...TOKENS.weDYDX },
    pc: { ...TOKENS.USDC },

    mintAddress: 'BjkkMZnnzmgLqzGErzDbkk15ozv48iVKQuunpeM2Hqnk',
    decimals: TOKENS.weDYDX.decimals
  },
  'STARS-USDC-V4': {
    symbol: 'STARS-USDC',
    name: 'STARS-USDC LP',
    coin: { ...TOKENS.STARS },
    pc: { ...TOKENS.USDC },

    mintAddress: 'FJ68q7NChhETcGVdinMbM2FF1Cy79dpmUi6HC83K55Hv',
    decimals: TOKENS.STARS.decimals
  },
  'weAXS-USDC-V4': {
    symbol: 'weAXS-USDC',
    name: 'weAXS-USDC LP',
    coin: { ...TOKENS.weAXS },
    pc: { ...TOKENS.USDC },

    mintAddress: '6PSoJQ7myQ1BJtbQC6oiWR8HSecQGyoWsPYTZRJo2ci3',
    decimals: TOKENS.weAXS.decimals
  },
  'weSHIB-USDC-V4': {
    symbol: 'weSHIB-USDC',
    name: 'weSHIB-USDC LP',
    coin: { ...TOKENS.weSHIB },
    pc: { ...TOKENS.USDC },

    mintAddress: 'AcjX5pmTMGSgxkdxc3r82r6WMKBvS6eQXXFz5ck5KKUa',
    decimals: TOKENS.weSHIB.decimals
  },
  'SBR-USDC-V4': {
    symbol: 'SBR-USDC',
    name: 'SBR-USDC LP',
    coin: { ...TOKENS.SBR },
    pc: { ...TOKENS.USDC },

    mintAddress: '9FC8xTFRbgTpuZZYAYnZLxgnQ8r7FwfSBM1SWvGwgF7s',
    decimals: TOKENS.SBR.decimals
  },
  'OXS-USDC-V4': {
    symbol: 'OXS-USDC',
    name: 'OXS-USDC LP',
    coin: { ...TOKENS.OXS },
    pc: { ...TOKENS.USDC },

    mintAddress: 'et9pdjWm97rbmsJoN183GkFV5qzTGru79GE1Zhe7NTU',
    decimals: TOKENS.OXS.decimals
  },
  'CWAR-USDC-V4': {
    symbol: 'CWAR-USDC',
    name: 'CWAR-USDC LP',
    coin: { ...TOKENS.CWAR },
    pc: { ...TOKENS.USDC },

    mintAddress: 'HjR23bxn2gtRDB2P1Tm3DLepAPPZgazsWJpLG9wqjnYR',
    decimals: TOKENS.CWAR.decimals
  },
  'UPS-USDC-V4': {
    symbol: 'UPS-USDC',
    name: 'UPS-USDC LP',
    coin: { ...TOKENS.UPS },
    pc: { ...TOKENS.USDC },

    mintAddress: '9hSUZdREEsbaYaKY4FouvXr7xyAqtpdHRDoYCb6Mb28a',
    decimals: TOKENS.UPS.decimals
  },
  'weSAND-USDC-V4': {
    symbol: 'weSAND-USDC',
    name: 'weSAND-USDC LP',
    coin: { ...TOKENS.weSAND },
    pc: { ...TOKENS.USDC },

    mintAddress: '3dADrQa7utyiCsaFeVk9r7oebW1WheowhKo5soBYKBVT',
    decimals: TOKENS.weSAND.decimals
  },
  'weMANA-USDC-V4': {
    symbol: 'weMANA-USDC',
    name: 'weMANA-USDC LP',
    coin: { ...TOKENS.weMANA },
    pc: { ...TOKENS.USDC },

    mintAddress: 'HpUkVAPRJ5zNRuJ1ZwMXEhbMHL3gSuPb2QuSER9YUd3a',
    decimals: TOKENS.weMANA.decimals
  },
  'CAVE-USDC-V4': {
    symbol: 'CAVE-USDC',
    name: 'CAVE-USDC LP',
    coin: { ...TOKENS.CAVE },
    pc: { ...TOKENS.USDC },

    mintAddress: '5Gba1k3fU7Vh7UtAiBmie9vhQNNq1JfEwgn1DPGZ7NKQ',
    decimals: TOKENS.CAVE.decimals
  },
  'GENE-USDC-V4': {
    symbol: 'GENE-USDC',
    name: 'GENE-USDC LP',
    coin: { ...TOKENS.GENE },
    pc: { ...TOKENS.USDC },

    mintAddress: '7GKvfHEXenNiWYbJBKae89mdaMPr5gGMYwZmyC8gBNVG',
    decimals: TOKENS.GENE.decimals
  },
  'GENE-RAY-V4': {
    symbol: 'GENE-RAY',
    name: 'GENE-RAY LP',
    coin: { ...TOKENS.GENE },
    pc: { ...TOKENS.RAY },

    mintAddress: '3HzXnc1qZ8mGqun18Ck3KA616XnZNqF1RWbgYE2nGRMA',
    decimals: TOKENS.GENE.decimals
  },
  'APT-USDC-V4': {
    symbol: 'APT-USDC',
    name: 'APT-USDC LP',
    coin: { ...TOKENS.APT },
    pc: { ...TOKENS.USDC },

    mintAddress: 'Hk8mDAJFq4E9kF3DtNgPFwzbo5kbeiusNFJgWmo3LoQ5',
    decimals: TOKENS.APT.decimals
  },
  'GOFX-USDC-V4': {
    symbol: 'GOFX-USDC',
    name: 'GOFX-USDC LP',
    coin: { ...TOKENS.GOFX },
    pc: { ...TOKENS.USDC },

    mintAddress: '4svqAwrLPGRDCQuuieYTmtLXF75wiahjeK2rEN9tY1YL',
    decimals: TOKENS.GOFX.decimals
  },
  'SONAR-USDC-V4': {
    symbol: 'SONAR-USDC',
    name: 'SONAR-USDC LP',
    coin: { ...TOKENS.SONAR },
    pc: { ...TOKENS.USDC },

    mintAddress: '2tAcfqJ1YYjpGLqwh76kyNt9VaNFDd4fJySfH6SmWfKt',
    decimals: TOKENS.SONAR.decimals
  },
  'JSOL-SOL-V4': {
    symbol: 'JSOL-SOL',
    name: 'JSOL-SOL LP',
    coin: { ...TOKENS.JSOL },
    pc: { ...NATIVE_SOL },

    mintAddress: '61z37rpHsU6d3Fq5sUjJ85K6tXGzkoYKDAG3kPJQNDRo',
    decimals: TOKENS.JSOL.decimals
  },
  'JSOL-USDC-V4': {
    symbol: 'JSOL-USDC',
    name: 'JSOL-USDC LP',
    coin: { ...TOKENS.JSOL },
    pc: { ...TOKENS.USDC },

    mintAddress: '3JZqf2VPNxj1kDZQsfzC7myM6spsGQbGuFv1gVfdYosN',
    decimals: TOKENS.JSOL.decimals
  },
  'SHILL-USDC-V4': {
    symbol: 'SHILL-USDC',
    name: 'SHILL-USDC LP',
    coin: { ...TOKENS.SHILL },
    pc: { ...TOKENS.USDC },

    mintAddress: 'CnUhYBtQEbSBZ76bgxAouVCTCb8rofZzwerVF5z5LREJ',
    decimals: TOKENS.SHILL.decimals
  },
  'DFL-USDC-V4': {
    symbol: 'DFL-USDC',
    name: 'DFL-USDC LP',
    coin: { ...TOKENS.DFL },
    pc: { ...TOKENS.USDC },

    mintAddress: 'Fffijd6UVJdQeLVXhenS8YcsnMUdWJqpbBeH42LFkXgS',
    decimals: TOKENS.DFL.decimals
  },
  'BOKU-USDC-V4': {
    symbol: 'BOKU-USDC',
    name: 'BOKU-USDC LP',
    coin: { ...TOKENS.BOKU },
    pc: { ...TOKENS.USDC },

    mintAddress: '8jjQn5Yagb6Nm2WGAxPW1bcGqrTWpg5adf6QukXEarcP',
    decimals: TOKENS.BOKU.decimals
  },
  'MIMO-SOL-V4': {
    symbol: 'MIMO-SOL',
    name: 'MIMO-SOL LP',
    coin: { ...TOKENS.MIMO },
    pc: { ...NATIVE_SOL },

    mintAddress: 'HUJ1opSk8AiPfDT47r7n4hTiK2EXgrR3Msy7T8q1BywS',
    decimals: TOKENS.MIMO.decimals
  },
  'wbWBNB-USDC-V4': {
    symbol: 'wbWBNB-USDC',
    name: 'wbWBNB-USDC LP',
    coin: { ...TOKENS.wbWBNB },
    pc: { ...TOKENS.USDC },

    mintAddress: 'FEsEfEJJSfiMQcshUgZ5UigfytfGRQ3z5puyF6DXDp9C',
    decimals: TOKENS.wbWBNB.decimals
  },
  'wePEOPLE-USDC-V4': {
    symbol: 'wePEOPLE-USDC',
    name: 'wePEOPLE-USDC LP',
    coin: { ...TOKENS.wePEOPLE },
    pc: { ...TOKENS.USDC },

    mintAddress: '3e5ZCKi4etorpV4pv1fSckP5iJD67xcUkx3RtFCZhbzD',
    decimals: TOKENS.wePEOPLE.decimals
  },
  'ISOLA-USDT-V4': {
    symbol: 'ISOLA-USDT',
    name: 'ISOLA-USDT LP',
    coin: { ...TOKENS.ISOLA },
    pc: { ...TOKENS.USDT },

    mintAddress: 'H8s1wQsZpRK61pyLF3XwyQc6E8vNUnwRDhy3TBDCDENQ',
    decimals: TOKENS.ISOLA.decimals
  },
  'SPWN-USDC-V4': {
    symbol: 'SPWN-USDC',
    name: 'SPWN-USDC LP',
    coin: { ...TOKENS.SPWN },
    pc: { ...TOKENS.USDC },

    mintAddress: 'B5uyCAQcX6nAjZypLgiivbEKabSptgUb8JK9tkaSnqdW',
    decimals: TOKENS.SPWN.decimals
  },
  'STR-USDC-V4': {
    symbol: 'STR-USDC',
    name: 'STR-USDC LP',
    coin: { ...TOKENS.STR },
    pc: { ...TOKENS.USDC },

    mintAddress: '8uDVKmVwNmbXHDB7rNKqtpcT9VAsFHTJ5pPYxjyoBbNg',
    decimals: TOKENS.STR.decimals
  },
  'SOLC-USDT-V4': {
    symbol: 'SOLC-USDT',
    name: 'SOLC-USDT LP',
    coin: { ...TOKENS.SOLC },
    pc: { ...TOKENS.USDT },

    mintAddress: '2g9JzTWycLzK4KEBBHsponAtZRee2ii63bRrJ8tefEyt',
    decimals: TOKENS.SOLC.decimals
  },
  'VI-USDC-V4': {
    symbol: 'VI-USDC',
    name: 'VI-USDC LP',
    coin: { ...TOKENS.VI },
    pc: { ...TOKENS.USDC },

    mintAddress: '3MwHyHCRfVqtH3ABFtdKXdY9dwemr9GGxQFaBkeq6NjY',
    decimals: TOKENS.VI.decimals
  },
  'KKO-USDC-V4': {
    symbol: 'KKO-USDC',
    name: 'KKO-USDC LP',
    coin: { ...TOKENS.KKO },
    pc: { ...TOKENS.USDC },

    mintAddress: '7xr1Doc1NiMWbUg99YVFqQSLfYXNzo6YvacXUsSgBMNW',
    decimals: TOKENS.KKO.decimals
  },
  'XTAG-USDC-V4': {
    symbol: 'XTAG-USDC',
    name: 'XTAG-USDC LP',
    coin: { ...TOKENS.XTAG },
    pc: { ...TOKENS.USDC },

    mintAddress: 'GCEQbLg4ik5YJ4CMcbtuVqEc4sjLdSGy34rFk1CtGjdg',
    decimals: TOKENS.XTAG.decimals
  },
  'TTT-USDC-V4': {
    symbol: 'TTT-USDC',
    name: 'TTT-USDC LP',
    coin: { ...TOKENS.TTT },
    pc: { ...TOKENS.USDC },

    mintAddress: '84fmrerHGohoRf4iLPDQ1KG4CjSjCRksYWGzjWfCRM8a',
    decimals: TOKENS.TTT.decimals
  },
  'RUN-USDC-V4': {
    symbol: 'RUN-USDC',
    name: 'RUN-USDC LP',
    coin: { ...TOKENS.RUN },
    pc: { ...TOKENS.USDC },

    mintAddress: 'CjTLvvKSQdEujcSzeZRYgk4w1DpuXBbMppLHaxZyz11Y',
    decimals: TOKENS.RUN.decimals
  },
  'CRWNY-USDC-V4': {
    symbol: 'CRWNY-USDC',
    name: 'CRWNY-USDC LP',
    coin: { ...TOKENS.CRWNY },
    pc: { ...TOKENS.USDC },

    mintAddress: 'H3D9Gyi4frRLW6bS9vBthDVDJyzyRJ6XhhpP6PJGWaDC',
    decimals: TOKENS.CRWNY.decimals
  },
  'CRWNY-RAY-V4': {
    symbol: 'CRWNY-RAY',
    name: 'CRWNY-RAY LP',
    coin: { ...TOKENS.CRWNY },
    pc: { ...TOKENS.RAY },

    mintAddress: '5Cz9wGStNjiUg81q8t6sJJeckuT2C14CYSfyQbtYirSX',
    decimals: TOKENS.CRWNY.decimals
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

const notUseSolanaPicMint: string[] = [TOKENS.TTT.mintAddress]

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
      if (picToken && !notUseSolanaPicMint.includes(itemToken.address)) {
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
