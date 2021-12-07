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
    mintAddress: 'Cu84KB3tDL6SbFgToHMLYVDJJXdJjenNzSKikeAvzmkA',
    decimals: 6,
    referrer: 'CXPTcSxxh4AT38gtv3SPbLS7oZVgXzLbMb83o4ziXjjN',
    tags: ['raydium']
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    mintAddress: '8FRFC6MoGGkMFQwngccyu69VnYbzykGeez7ignHVAFSN',
    decimals: 6,
    referrer: 'CXPTcSxxh4AT38gtv3SPbLS7oZVgXzLbMb83o4ziXjjN',
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
  },
  'ETH-USDC-V4': {
    symbol: 'ETH-USDC',
    name: 'ETH-USDC LP',
    coin: { ...TOKENS.ETH },
    pc: { ...TOKENS.USDC },

    mintAddress: 'C3BXR57eCWpvTw6VigvQxMvq8xzdoL4a1xEkJtZiGV3p',
    decimals: TOKENS.ETH.decimals
  },
  'WSOL-USDC-V4': {
    symbol: 'WSOL-USDC',
    name: 'WSOL-USDC LP',
    coin: { ...TOKENS.WSOL },
    pc: { ...TOKENS.USDC },

    mintAddress: '62WBthbtnyuLBk7c8VrX5gztbSJGWaa8ScQurEJUCmp6',
    decimals: TOKENS.WSOL.decimals
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
