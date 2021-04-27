import { IDO_PROGRAM_ID } from './ids'
import { TOKENS, TokenInfo } from './tokens'

// @ts-ignore
import { struct } from 'buffer-layout'
import { publicKey, u64 } from '@project-serum/borsh'
import { cloneDeep } from 'lodash-es'
import { PublicKey } from '@solana/web3.js'

export interface IdoPoolInfo {
  startTime: number
  endTime: number
  price: number
  minDepositLimit: number
  maxDepositLimit: number

  stakePoolId: PublicKey

  isRayPool: boolean
}

export interface IdoPool {
  base: TokenInfo
  quote: TokenInfo

  version: number
  programId: string

  idoId: string

  info?: IdoPoolInfo
}

export const IDO_POOLS: IdoPool[] = [
  {
    base: { ...TOKENS.MEDIA },
    quote: { ...TOKENS.USDC },

    version: 1,
    programId: IDO_PROGRAM_ID,

    idoId: '3phgXrkHbMmVLUbUvXPXsnot9WxkdyvVEyiA8odyWY8s'
  },
  {
    base: { ...TOKENS.MEDIA },
    quote: { ...TOKENS.USDC },

    version: 1,
    programId: IDO_PROGRAM_ID,

    idoId: 'EFnvwDxehFLycdUp6DiwcyBTz88qcZFP3KUDfmPU4Fdc'
  }
]

export function getIdoPoolById(idoId: string) {
  const pool = IDO_POOLS.find((pool) => pool.idoId === idoId)

  if (pool) {
    return cloneDeep(pool)
  }

  return pool
}

export const IDO_POOL_INFO_LAYOUT = struct([
  u64('status'),
  u64('nonce'),
  u64('startTime'),
  u64('endTime'),
  u64('startWithdrawTime'),
  u64('numerator'),
  u64('denominator'),
  u64('quoteTokenDeposited'),
  u64('baseTokenSupply'),
  u64('minDepositLimit'),
  u64('maxDepositLimit'),
  u64('minStakeLimit'),
  publicKey('quoteTokenMint'),
  publicKey('baseTokenMint'),
  publicKey('quoteTokenVault'),
  publicKey('baseTokenVault'),
  publicKey('stakePoolId'),
  publicKey('stakeProgramId'),
  publicKey('checkProgramId'),
  publicKey('idoOwner')
])

export const IDO_USER_INFO_LAYOUT = struct([
  u64('state'),
  publicKey('idoPoolId'),
  publicKey('owner'),
  publicKey('quoteTokenDeposited')
])
