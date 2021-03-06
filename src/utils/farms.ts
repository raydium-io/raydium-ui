import { LP_TOKENS, TOKENS, TokenInfo } from '@/utils/tokens'

import { STAKE_PROGRAM_ID } from '@/utils/ids'
import { cloneDeep } from 'lodash-es'

export interface FarmInfo {
  name: string
  lp: TokenInfo
  reward: TokenInfo
  isStake: boolean

  version: number
  programId: string

  poolId: string
  poolAuthority: string

  poolLpTokenAccount: string
  poolRewardTokenAccount: string

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

// 获取某个地址是哪个池子的哪个 key
export function getAddressForWhat(address: string) {
  // 不能用 forEach
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

export const FARMS: FarmInfo[] = [
  {
    name: 'RAY-USDT',
    lp: { ...LP_TOKENS['RAY-USDT'] },
    reward: { ...TOKENS.RAY },
    isStake: false,

    version: 2,
    programId: STAKE_PROGRAM_ID,

    poolId: '5w3itB5PVAPAiPFpBcMyGZJWukmcuRtwFRkQJF3WzHdj',
    poolAuthority: '4qgEHMtCAA4Z3rY4C1ihz9JHETHFhQVqj81Q1qyB83WP',
    poolLpTokenAccount: 'n1gotGPqeUxJnA4yE7QCCsNG8AVqQ1HuATkAhAfVMVV', // lp vault
    poolRewardTokenAccount: 'h8uQ293dPdJd7qFRFE1pvMbpFmxrtD64QaxUWwis4Wv' // reward vault
  },
  {
    name: 'RAY-USDC',
    lp: { ...LP_TOKENS['RAY-USDC'] },
    reward: { ...TOKENS.RAY },
    isStake: false,

    version: 2,
    programId: STAKE_PROGRAM_ID,

    poolId: '3j7qWosyu3cVNgbwdWRxEf4SxJKNWoWqgpAEn4RLpMrR',
    poolAuthority: 'BZhcMxjRy9oXSgghLN52uhsML5ooXS377yTJhkw96bYX',
    poolLpTokenAccount: '6qsk4PmATtiu132YJuUgVt4zekbTYV3xRZWxoc1rAg9U', // lp vault
    poolRewardTokenAccount: 'Aucgi2G2ufXTGGYf2ng3ZyQXLu6RH6ioL1R7mGfhUcbQ' // reward vault
  },
  {
    name: 'RAY-SRM',
    lp: { ...LP_TOKENS['RAY-SRM'] },
    reward: { ...TOKENS.RAY },
    isStake: false,

    version: 2,
    programId: STAKE_PROGRAM_ID,

    poolId: 'GLQwyMF1txnAdEnoYuPTPsWdXqUuxgTMsWEV38njk48C',
    poolAuthority: '5ddsMftKDoaT5qHnHKnfkGCexJhiaNz1E4mMagy6qMku',
    poolLpTokenAccount: 'HFYPGyBW5hsQnrtQntg4d6Gzyg6iaehVTAVNqQ6f5f28', // lp vault
    poolRewardTokenAccount: 'ETwFtP1dYCbvbARNPfKuJFxoGFDTTsqB6j3pRquPE7Fq' // reward vault
  },
  // v3 farm
  {
    name: 'RAY-USDT',
    lp: { ...LP_TOKENS['RAY-USDT-V3'] },
    reward: { ...TOKENS.RAY },
    isStake: false,

    version: 3,
    programId: STAKE_PROGRAM_ID,

    poolId: '6d3vDYvk6VFVacEAGA1NDyxkQPRiNxXQRkeKpTPMJwe4',
    poolAuthority: 'EcPc2KUDFMyPNAVPE6PsMkzneBFKNqRjUhfhyM2da9go',
    poolLpTokenAccount: 'Gx4kLpTirc3Lr3GEYojYt1zUmsCcWajjBZTFVA3tzyDg', // lp vault
    poolRewardTokenAccount: 'J144vsbPdLa9V6JpvGFH63bQw8QhQckUNe48YjPKwcZo' // reward vault
  },
  {
    name: 'RAY-USDC',
    lp: { ...LP_TOKENS['RAY-USDC-V3'] },
    reward: { ...TOKENS.RAY },
    isStake: false,

    version: 3,
    programId: STAKE_PROGRAM_ID,

    poolId: '8nEWqxeDNZ2yo1izbPzY4nwR55isBZRaQk7CM8ntwUwR',
    poolAuthority: '6vQGZLsHgpJdqh1ER7q2q6mjZ43QwzhtTofTzb2sUhNh',
    poolLpTokenAccount: '77ujS15hjUfFZkM8QAw4HMLvMGZg95Gcm6ixjA1bnk3M', // lp vault
    poolRewardTokenAccount: '3ejmkn5HpXR9KdVWkai1Ngo87sQSUyKXrx8wSakipkno' // reward vault
  },
  {
    name: 'RAY-SRM',
    lp: { ...LP_TOKENS['RAY-SRM-V3'] },
    reward: { ...TOKENS.RAY },
    isStake: false,

    version: 3,
    programId: STAKE_PROGRAM_ID,

    poolId: 'HwEgvS79S53yzYUTRHShU6EuNmhR3WTX5tTZPUzBmwky',
    poolAuthority: '9B3XWm89zX7NwaBB8VmT5mrWvxVpd9eyfQMeqkuLkcCF',
    poolLpTokenAccount: 'F4zXXzqkyT1GP5CVdEgC7qTcDfR8ox5Akm6RCbBdBsRp', // lp vault
    poolRewardTokenAccount: 'FW7omPaCCvgBgUFKwvwU2jf1w1wJGjDrJqurr3SeXn14' // reward vault
  },
  {
    name: 'RAY-SOL',
    lp: { ...LP_TOKENS['RAY-SOL-V3'] },
    reward: { ...TOKENS.RAY },
    isStake: false,

    version: 3,
    programId: STAKE_PROGRAM_ID,

    poolId: 'ECqG3sxwJiq9TTYsRBd7fPGsBKYF4fyogo6Df7c13qdJ',
    poolAuthority: '4Wf4om12g9xzEeeD139ffCuXn4W2huMcXziiSAzf7Nig',
    poolLpTokenAccount: '9kWnkQtMAW2bzKeLQsTdan1rEoypDHaAVnZRcoBPDBfQ', // lp vault
    poolRewardTokenAccount: '8z4kQbgQFe4zXE4NSozWJTJV14gD4evNq4CKn5ryB6S3' // reward vault
  },
  {
    name: 'RAY-ETH',
    lp: { ...LP_TOKENS['RAY-ETH-V3'] },
    reward: { ...TOKENS.RAY },
    isStake: false,

    version: 3,
    programId: STAKE_PROGRAM_ID,

    poolId: 'CYKDTwojSLVFEShB3tcTTfMjtBxUNtYfCTM4PiMFGkio',
    poolAuthority: 'Azmucec2jdgWagFkbnqmwYcsrtKPf1v1kcM95v6s1zxu',
    poolLpTokenAccount: 'EncPBQhpc5KLmcgRD2PutQz7wBBNQkVN2s8jjFWEw9no', // lp vault
    poolRewardTokenAccount: '8q8BHw7fP7mitLrb2jzw78qcSEgCvM7GTB5PzbSQobUt' // reward vault
  },
  // stake
  {
    name: 'RAY',
    lp: { ...TOKENS.RAY },
    reward: { ...TOKENS.RAY },
    isStake: true,

    version: 2,
    programId: STAKE_PROGRAM_ID,

    poolId: '4EwbZo8BZXP5313z5A2H11MRBP15M5n6YxfmkjXESKAW',
    poolAuthority: '4qD717qKoj3Sm8YfHMSR7tSKjWn5An817nArA6nGdcUR',
    poolLpTokenAccount: '8tnpAECxAT9nHBqR1Ba494Ar5dQMPGhL31MmPJz1zZvY', // lp vault
    poolRewardTokenAccount: 'BihEG2r7hYax6EherbRmuLLrySBuSXx4PYGd9gAsktKY' // reward vault
  }
]
