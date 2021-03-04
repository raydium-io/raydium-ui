import { LP_TOKENS, TOKENS, TokenInfo } from '@/utils/tokens'

import { STAKE_PROGRAM_ID } from '@/utils/ids'
import { cloneDeep } from 'lodash-es'

export interface FarmInfo {
  name: string
  lp: TokenInfo
  reward: TokenInfo

  programId: string

  poolId: string
  poolAuthority: string

  poolLpTokenAccount: string
  poolRewardTokenAccount: string

  nonce: number

  poolInfo?: object
  userInfo?: object
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

// 获取某个地址是哪个池子的哪个 key
export function getAddressForWhat(address: string) {
  // 不能用 forEach
  for (const farm of FARMS) {
    for (const [key, value] of Object.entries(farm)) {
      if (key === 'lp') {
        if (value.mintAddress === address) {
          return { key: 'lpMintAddress', lpMintAddress: farm.lp.mintAddress }
        }
      } else if (key === 'reward') {
        if (value.mintAddress === address) {
          return { key: 'rewardMintAddress', lpMintAddress: farm.lp.mintAddress }
        }
      } else if (value === address) {
        return { key, lpMintAddress: farm.lp.mintAddress }
      }
    }
  }

  return {}
}

export const FARMS: FarmInfo[] = [
  {
    name: 'RAY-USDT',
    lp: { ...LP_TOKENS['RAY-USDT'] },
    reward: { ...TOKENS.RAY },

    programId: STAKE_PROGRAM_ID,

    poolId: '5w3itB5PVAPAiPFpBcMyGZJWukmcuRtwFRkQJF3WzHdj',
    poolAuthority: '4qgEHMtCAA4Z3rY4C1ihz9JHETHFhQVqj81Q1qyB83WP',

    poolLpTokenAccount: 'n1gotGPqeUxJnA4yE7QCCsNG8AVqQ1HuATkAhAfVMVV', // lp vault

    poolRewardTokenAccount: 'h8uQ293dPdJd7qFRFE1pvMbpFmxrtD64QaxUWwis4Wv', // reward vault

    nonce: 250
  },
  {
    name: 'RAY-USDC',
    lp: { ...LP_TOKENS['RAY-USDC'] },
    reward: { ...TOKENS.RAY },

    programId: STAKE_PROGRAM_ID,

    poolId: '3j7qWosyu3cVNgbwdWRxEf4SxJKNWoWqgpAEn4RLpMrR',
    poolAuthority: 'BZhcMxjRy9oXSgghLN52uhsML5ooXS377yTJhkw96bYX',

    poolLpTokenAccount: '6qsk4PmATtiu132YJuUgVt4zekbTYV3xRZWxoc1rAg9U', // lp vault

    poolRewardTokenAccount: 'Aucgi2G2ufXTGGYf2ng3ZyQXLu6RH6ioL1R7mGfhUcbQ', // reward vault

    nonce: 252
  },
  {
    name: 'RAY-SRM',
    lp: { ...LP_TOKENS['RAY-SRM'] },
    reward: { ...TOKENS.RAY },

    programId: STAKE_PROGRAM_ID,

    poolId: 'GLQwyMF1txnAdEnoYuPTPsWdXqUuxgTMsWEV38njk48C',
    poolAuthority: '5ddsMftKDoaT5qHnHKnfkGCexJhiaNz1E4mMagy6qMku',
    poolLpTokenAccount: 'HFYPGyBW5hsQnrtQntg4d6Gzyg6iaehVTAVNqQ6f5f28', // lp vault

    poolRewardTokenAccount: 'ETwFtP1dYCbvbARNPfKuJFxoGFDTTsqB6j3pRquPE7Fq', // reward vault

    nonce: 255
  },
  {
    name: 'RAY-SOL',
    lp: { ...LP_TOKENS['RAY-SOL'] },
    reward: { ...TOKENS.RAY },

    programId: STAKE_PROGRAM_ID,

    poolId: '7aH1yGBfa4ezP2sx3N8xmMin5jhzPain7pCgJLRM1DFP',
    poolAuthority: 'FHbV9ACEjbTqNkfJokWqsLLCLCdD4V44W4RyLezX2tRk',

    poolLpTokenAccount: '9tXm2wCZiV2dHYvkyWZMfJm4Konhf7RxX2pHYD2kcTYV', // lp vault

    poolRewardTokenAccount: 'Gbr1WCU7pAgQiSqKCuhwEgG3yiXfAhMhNDNTe58z1gN3', // reward vault

    nonce: 254
  }
]
