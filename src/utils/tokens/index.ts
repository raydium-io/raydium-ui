import DEVNET_TOKENS from './devnet'
import MAINNET_TOKENS from './mainnet'
import TESTNET_TOKENS from './testnet'

export interface TokenInfo {
  symbol?: string
  name: string
  mintAddress: string
  decimals: number
  referrer?: string
  balance?: number
}

interface Tokens {
  [key: string]: any
  [index: number]: any
}

export const TOKENS: Tokens = {
  'mainnet-beta': MAINNET_TOKENS,
  devnet: DEVNET_TOKENS,
  testnet: TESTNET_TOKENS,
}

/**
 * Get token use symbol

 * @param {string} symbol
 * @param {string} [env='mainnet-beta']

 * @returns {TokenInfo | null} tokenInfo
 */
export function getTokenBySymbol(
  symbol: string,
  env = 'mainnet-beta'
): TokenInfo | null {
  let token = TOKENS[env][symbol]

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
 * @param {string} [env='mainnet-beta']

 * @returns {TokenInfo | null} tokenInfo
 */
export function getTokenByMintAddress(
  mintAddress: string,
  env = 'mainnet-beta'
): TokenInfo | null {
  let token = null

  for (const symbol of Object.keys(TOKENS[env])) {
    const info = TOKENS[env][symbol]

    if (info.mintAddress === mintAddress) {
      token = info
      token.symbol = symbol
    }
  }

  return token
}
