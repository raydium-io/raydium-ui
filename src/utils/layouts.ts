import { bool, publicKey, struct, u32, u64, u8 } from '@project-serum/borsh'

// https://github.com/solana-labs/solana-program-library/blob/master/token/js/client/token.js#L210
export const ACCOUNT_LAYOUT = struct([
  publicKey('mint'),
  publicKey('owner'),
  u64('amount'),
  u32('delegateOption'),
  publicKey('delegate'),
  u8('state'),
  u32('isNativeOption'),
  u64('isNative'),
  u64('delegatedAmount'),
  u32('closeAuthorityOption'),
  publicKey('closeAuthority')
])

export const MINT_LAYOUT = struct([
  u32('mintAuthorityOption'),
  publicKey('mintAuthority'),
  u64('supply'),
  u8('decimals'),
  bool('initialized'),
  u32('freezeAuthorityOption'),
  publicKey('freezeAuthority')
])

export function getBigNumber(num: any) {
  return num === undefined || num === null ? 0 : parseFloat(num.toString())
}
