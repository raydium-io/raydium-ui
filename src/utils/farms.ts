import { LP_TOKENS, TOKENS, TokenInfo } from '@/utils/tokens'

import { STAKE_PROGRAM_ID, STAKE_PROGRAM_ID_V4, STAKE_PROGRAM_ID_V5 } from '@/utils/ids'
import { cloneDeep } from 'lodash-es'

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

export const FARMS: FarmInfo[] = [
  // v3
  {
    name: 'RAY-WUSDT',
    lp: { ...LP_TOKENS['RAY-WUSDT-V3'] },
    reward: { ...TOKENS.RAY },
    isStake: false,

    fusion: false,
    legacy: true,
    dual: false,
    version: 3,
    programId: STAKE_PROGRAM_ID,

    poolId: '6d3vDYvk6VFVacEAGA1NDyxkQPRiNxXQRkeKpTPMJwe4',
    poolAuthority: 'EcPc2KUDFMyPNAVPE6PsMkzneBFKNqRjUhfhyM2da9go',
    poolLpTokenAccount: 'Gx4kLpTirc3Lr3GEYojYt1zUmsCcWajjBZTFVA3tzyDg', // lp vault
    poolRewardTokenAccount: 'J144vsbPdLa9V6JpvGFH63bQw8QhQckUNe48YjPKwcZo' // reward vault
  },
  {
    name: 'RAY-USDT',
    lp: { ...LP_TOKENS['RAY-USDT-V4'] },
    reward: { ...TOKENS.RAY },
    isStake: false,

    fusion: false,
    legacy: false,
    dual: false,
    version: 3,
    programId: STAKE_PROGRAM_ID,

    poolId: 'AvbVWpBi2e4C9HPmZgShGdPoNydG4Yw8GJvG9HUcLgce',
    poolAuthority: '8JYVFy3pYsPSpPRsqf43KSJFnJzn83nnRLQgG88XKB8q',
    poolLpTokenAccount: '4u4AnMBHXehdpP5tbD6qzB5Q4iZmvKKR5aUr2gavG7aw', // lp vault
    poolRewardTokenAccount: 'HCHNuGzkqSnw9TbwpPv1gTnoqnqYepcojHw9DAToBrUj' // reward vault
  },
  // v2
  {
    name: 'RAY-WUSDT',
    lp: { ...LP_TOKENS['RAY-WUSDT'] },
    reward: { ...TOKENS.RAY },
    isStake: false,

    fusion: false,
    legacy: true,
    dual: false,
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

    fusion: false,
    legacy: true,
    dual: false,
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

    fusion: false,
    legacy: true,
    dual: false,
    version: 2,
    programId: STAKE_PROGRAM_ID,

    poolId: 'GLQwyMF1txnAdEnoYuPTPsWdXqUuxgTMsWEV38njk48C',
    poolAuthority: '5ddsMftKDoaT5qHnHKnfkGCexJhiaNz1E4mMagy6qMku',
    poolLpTokenAccount: 'HFYPGyBW5hsQnrtQntg4d6Gzyg6iaehVTAVNqQ6f5f28', // lp vault
    poolRewardTokenAccount: 'ETwFtP1dYCbvbARNPfKuJFxoGFDTTsqB6j3pRquPE7Fq' // reward vault
  },
  // v3 farm
  {
    name: 'RAY-USDC',
    lp: { ...LP_TOKENS['RAY-USDC-V3'] },
    reward: { ...TOKENS.RAY },
    isStake: false,

    fusion: false,
    legacy: false,
    dual: false,
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

    fusion: false,
    legacy: false,
    dual: false,
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

    fusion: false,
    legacy: false,
    dual: false,
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

    fusion: false,
    legacy: false,
    dual: false,
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

    fusion: false,
    legacy: false,
    dual: false,
    version: 2,
    programId: STAKE_PROGRAM_ID,

    poolId: '4EwbZo8BZXP5313z5A2H11MRBP15M5n6YxfmkjXESKAW',
    poolAuthority: '4qD717qKoj3Sm8YfHMSR7tSKjWn5An817nArA6nGdcUR',
    poolLpTokenAccount: '8tnpAECxAT9nHBqR1Ba494Ar5dQMPGhL31MmPJz1zZvY', // lp vault
    poolRewardTokenAccount: 'BihEG2r7hYax6EherbRmuLLrySBuSXx4PYGd9gAsktKY' // reward vault
  },
  // Reward double
  {
    name: 'FIDA-RAY',
    lp: { ...LP_TOKENS['FIDA-RAY-V4'] },
    reward: { ...TOKENS.RAY },
    rewardB: { ...TOKENS.FIDA },
    isStake: false,

    fusion: true,
    legacy: false,
    dual: true,
    version: 4,
    programId: STAKE_PROGRAM_ID_V4,

    poolId: '8rAdapvcC5vYNLXzChMgt56s6HCQGE6Lbo469g3WRTUh',
    poolAuthority: 'EcCKf3mgPtL6dNNAVG4gQQtLkAoTAUdf5vzFukkrviWq',
    poolLpTokenAccount: 'H6kzwNNg9zbgC1YBjvCN4BdebtA4NusvgUhUSDZoz8rP', // lp vault
    poolRewardTokenAccount: '7vnPTB2HAXFUAV5iiVZTNHgAnVYjgXcdumbbqfeK6ugp', // reward vault A
    poolRewardTokenAccountB: 'EGHdQm9KGLz6nw7W4rK13DyAMMJcGP9RpzCJaXiq75kQ' // reward vault B
  },
  {
    name: 'OXY-RAY',
    lp: { ...LP_TOKENS['OXY-RAY-V4'] },
    reward: { ...TOKENS.RAY },
    rewardB: { ...TOKENS.OXY },
    isStake: false,

    fusion: true,
    legacy: false,
    dual: true,
    version: 4,
    programId: STAKE_PROGRAM_ID_V4,

    poolId: '7Hug9fKfTrasG3hHonXTfSnvv37mDeyoBHbVwyDjw693',
    poolAuthority: 'CcD7KXVhjoeFpbkXeBgPpZChafEfTZ4zJL47LqmKdqwz',
    poolLpTokenAccount: 'GtXoFnVRATaasBP6sroNaC54uLQfVAwGXsfKzgFqNiUc', // lp vault
    poolRewardTokenAccount: 'GKC7BcGs1515CQx6hiK562u29dFQxBw8HWwJUxqi7xf1', // reward vault A
    poolRewardTokenAccountB: 'DXDjRiC7EUUh9cj93tgBtX2jRkmnwtCMEAQD9GrYK2f6' // reward vault B
  },
  {
    name: 'MAPS-RAY',
    lp: { ...LP_TOKENS['MAPS-RAY-V4'] },
    reward: { ...TOKENS.RAY },
    rewardB: { ...TOKENS.MAPS },
    isStake: false,

    fusion: true,
    legacy: false,
    dual: true,
    version: 4,
    programId: STAKE_PROGRAM_ID_V4,

    poolId: 'Chb6atEWGmH2NitCqrCEMHB8uKWYQiiVaBnmJQDudm87',
    poolAuthority: 'BcmgQZXCDPCduv3reT8LDQNqvGeGMZtFhBxyLYdrnCjE',
    poolLpTokenAccount: '5uaBAwu1Sff58KNKGTwfacsjsrMU3wg6jtGtMWwiZd5B', // lp vault
    poolRewardTokenAccount: '4LVikvk3gZEHaTUNh7L8bsx5By6NNnkqpKfcdJTWTD7Z', // reward vault A
    poolRewardTokenAccountB: '3UWGpEe2NLD9oWPW1zdXGZRCvJxkNSC2puUWooNEugdS' // reward vault B
  },
  {
    // legacy
    name: 'KIN-RAY',
    lp: { ...LP_TOKENS['KIN-RAY-V4'] },
    reward: { ...TOKENS.RAY },
    rewardB: { ...TOKENS.KIN },
    isStake: false,

    fusion: true,
    legacy: true,
    dual: true,
    version: 4,
    programId: STAKE_PROGRAM_ID_V4,

    poolId: '7RFY9eMaD3nsV7EBTzVzuKBr4X4cLuDh3JaoWZTcGiJK',
    poolAuthority: 'q42hNDzfBDQ1WzKjxkueEtBzX1VPJ2hnikJXFjSYC91',
    poolLpTokenAccount: 'DgCSAJiicdEggHJxM7Vs2j59yM5wMJMCGzUHALiVDhtX', // lp vault
    poolRewardTokenAccount: '3BGPPWYJMSFaWmq21x8Feqvgsii1fVmJiivRuPJSgXe1', // reward vault A
    poolRewardTokenAccountB: '5uX6ceRRxDRrcARddFkypCZV5MXz5KUQDr7Zf9ZnSSLf' // reward vault B
  },
  {
    name: 'KIN-RAY',
    lp: { ...LP_TOKENS['KIN-RAY-V4'] },
    reward: { ...TOKENS.RAY },
    rewardB: { ...TOKENS.KIN },
    isStake: false,

    fusion: true,
    legacy: false,
    dual: true,
    version: 5,
    programId: STAKE_PROGRAM_ID_V5,

    poolId: 'FgApVk6mASrkuWNxmsFvsaAYkFKqdiwMTvYZK36A2DaC',
    poolAuthority: '7kEx8qnkZPkRXV6f4ztf27zYjCACBHY3PUMfuiYJsoML',
    poolLpTokenAccount: '7fgDjhZn9GqRZbbCregr9tpkbWSKjibdCsJNBYbLhLir', // lp vault
    poolRewardTokenAccount: '5XZjRyEo8Wr2CtSE5bpoKioThT9czK1dUebbK87Lqkaa', // reward vault A
    poolRewardTokenAccountB: '8jGJ3ST1j9eemfC6N2qQevtUdwxT7TpXW1NmvWyvLLVs' // reward vault B
  },
  {
    name: 'COPE-USDC',
    lp: { ...LP_TOKENS['COPE-USDC-V4'] },
    reward: { ...TOKENS.RAY },
    rewardB: { ...TOKENS.COPE },
    isStake: false,

    fusion: true,
    legacy: false,
    dual: false,
    version: 5,
    programId: STAKE_PROGRAM_ID_V5,

    poolId: 'XnRBbNMf6YcWvC1u2vBXXuMcagmRBRLu1y84mpqnKwW',
    poolAuthority: 'AnYvA5H7oBeA1otnWHSu8ud3waFsEmfUbdAoM1VzdVvt',
    poolLpTokenAccount: '6tXWzm8nLVtNtvqDH8bZNfUwpSjEcKZoJFpcV4hC5rLD', // lp vault
    poolRewardTokenAccount: '8GoDpozsDk3U3J36vvPiq3YpnA6MeJb1QPVJFiupe2wR', // reward vault A
    poolRewardTokenAccountB: '7niS4ngxgZ3oynHwH82PnwJXicTnY3fo9Vubi1PnjzJq' // reward vault B
  },
  {
    name: 'STEP-USDC',
    lp: { ...LP_TOKENS['STEP-USDC-V4'] },
    reward: { ...TOKENS.RAY },
    rewardB: { ...TOKENS.STEP },
    isStake: false,

    fusion: true,
    legacy: false,
    dual: false,
    version: 5,
    programId: STAKE_PROGRAM_ID_V5,

    poolId: '8xhjCzfzVcP79jE7jXR2xtNaSL6aJYoDRLVT9FMjpRTC',
    poolAuthority: '6wRMPrHKFzj3qB4j5yj4y9mDF89fZ6w7gD1cEzCJwT9B',
    poolLpTokenAccount: 'CP3wdgdSygYGLJMjKfbJMiANnYuAxXHPiLTtB124tzVX', // lp vault
    poolRewardTokenAccount: '3zSiR4XrrRPhsom2hh9iigYZZ7uCpMucfJnZRgREgH8j', // reward vault A
    poolRewardTokenAccountB: '4n3vRUk3wdtbGWgMFSaxUcnGLKwa2wiWVhqw7kv9JDVS' // reward vault B
  },
  {
    name: 'MEDIA-USDC',
    lp: { ...LP_TOKENS['MEDIA-USDC-V4'] },
    reward: { ...TOKENS.RAY },
    rewardB: { ...TOKENS.MEDIA },
    isStake: false,

    fusion: true,
    legacy: false,
    dual: false,
    version: 5,
    programId: STAKE_PROGRAM_ID_V5,

    poolId: 'Ef1gD9JMzWF6PNw2uc4744zouh57GyWAeVTjHHbQ2nsu',
    poolAuthority: '3dhU2g3MSHK3LwjuE1VsEJCsNeWKyBJUMHt4EUXepTjs',
    poolLpTokenAccount: 'DGjRtqsjeubLCLPD3yH8fj1d7TnrD3jKBpwa1UbVk7E6', // lp vault
    poolRewardTokenAccount: 'Uen8f9Rn42i8sDTK5vEttrnX9AUwXV3yf6DFU63mKDb', // reward vault A
    poolRewardTokenAccountB: 'Ek6n7Myojb6pSpQuqk5AyS7KXQdXkJyZT7ki9baYCxds' // reward vault B
  }
]

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
