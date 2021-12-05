import { cloneDeep } from 'lodash-es'

import { STAKE_PROGRAM_ID, STAKE_PROGRAM_ID_V4, STAKE_PROGRAM_ID_V5 } from '@/utils/ids'
import { LP_TOKENS, TokenInfo, TOKENS } from '@/utils/tokens'

export interface FarmInfo {
  name: string
  lp: TokenInfo
  reward: TokenInfo
  rewardB?: TokenInfo
  isStake: boolean

  fusion: boolean
  legacy: boolean
  dual: boolean
  version: number
  programId: string

  poolId: string
  poolAuthority: string

  poolLpTokenAccount: string
  poolRewardTokenAccount: string
  poolRewardTokenAccountB?: string

  user?: object
}

export function getFarmByLpMintAddress(lpMintAddress: string): FarmInfo | undefined {
  const farm = FARMS.find((farm) => farm.lp.mintAddress === lpMintAddress)

  if (farm) {
    return cloneDeep(farm)
  }

  return farm
}

export function getFarmByRewardMintAddress(lpMintAddress: string): FarmInfo | undefined {
  const farm = FARMS.find((farm) => farm.reward.mintAddress === lpMintAddress)

  if (farm) {
    return cloneDeep(farm)
  }

  return farm
}

export function getFarmByPoolId(poolId: string): FarmInfo | undefined {
  const farm = FARMS.find((farm) => farm.poolId === poolId)

  if (farm) {
    return cloneDeep(farm)
  }

  return farm
}

export function getAddressForWhat(address: string) {
  // dont use forEach
  for (const farm of FARMS) {
    for (const [key, value] of Object.entries(farm)) {
      // if (key === 'lp') {
      //   if (value.mintAddress === address) {
      //     return { key: 'poolId', poolId: farm.poolId }
      //   }
      // } else if (key === 'reward') {
      //   if (value.mintAddress === address) {
      //     return { key: 'rewardMintAddress', poolId: farm.poolId }
      //   }
      // } else

      if (value === address) {
        return { key, poolId: farm.poolId }
      }
    }
  }

  return {}
}

export const FARMS: FarmInfo[] = []

// for solana.tokenlist.json
// for (const [key, value] of Object.entries(LP_TOKENS)) {
//   const kk = key.split('-')
//   let version = 'V2 '
//   if (kk.length > 2) {
//     version = kk[2] + ' '
//   }

//   const { symbol, mintAddress, decimals } = value

//   let islegacy = false
//   let isfusion = false
//   for (const farm of FARMS) {
//     const { lp, legacy, fusion } = farm
//     if (lp.mintAddress === mintAddress && legacy === true) {
//       islegacy = true
//     } else if (lp.mintAddress === mintAddress && fusion === true) {
//       isfusion = true
//     }
//   }

//   console.log(
//     JSON.stringify({
//       chainId: 101,
//       address: mintAddress,
//       symbol,
//       name: `Raydium ${islegacy ? 'Legacy ' : ''}${isfusion ? 'Fusion ' : ''}LP Token ${version}(${symbol})`,
//       decimals,
//       logoURI:
//         'https://cdn.jsdelivr.net/gh/solana-labs/token-list/assets/mainnet/RVKd61ztZW9GUwhRbbLoYVRE5Xf1B2tVscKqwZqXgEr/logo.png',
//       tags: ['lp-token'],
//       extensions: {
//         website: 'https://raydium.io/'
//       }
//     })
//   )
// }
