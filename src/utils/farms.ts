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

export const FARMS: FarmInfo[] = [
  // v3 farm
  {
    name: 'RAY-USDC',
    lp: { ...LP_TOKENS['RAY-USDC-V3'] },
    reward: { ...TOKENS.RAY },
    isStake: false,

    fusion: false,
    legacy: true,
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
    legacy: true,
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
    legacy: true,
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
    legacy: true,
    dual: false,
    version: 3,
    programId: STAKE_PROGRAM_ID,

    poolId: 'CYKDTwojSLVFEShB3tcTTfMjtBxUNtYfCTM4PiMFGkio',
    poolAuthority: 'Azmucec2jdgWagFkbnqmwYcsrtKPf1v1kcM95v6s1zxu',
    poolLpTokenAccount: 'EncPBQhpc5KLmcgRD2PutQz7wBBNQkVN2s8jjFWEw9no', // lp vault
    poolRewardTokenAccount: '8q8BHw7fP7mitLrb2jzw78qcSEgCvM7GTB5PzbSQobUt' // reward vault
  },
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
    name: 'xCOPE-USDC',
    lp: { ...LP_TOKENS['xCOPE-USDC-V4'] },
    reward: { ...TOKENS.RAY },
    rewardB: { ...TOKENS.xCOPE },
    isStake: false,

    fusion: true,
    legacy: true,
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

    poolId: 'AxVvbT9fDFEkmdLwKUJRY5HsG2RXAZbe1dRAgJ2bDDwg',
    poolAuthority: '3n1Vdmqu1MBUpBYMpYbpJAVFv4MeNMEa82waruLy7BDu',
    poolLpTokenAccount: 'BHLzrd5MgQy4NgmUsn542yXRZWkz1iV5bfWg8s8D4tVL', // lp vault
    poolRewardTokenAccount: '7nGY6xHCUR2MxJnHT1qvArRUEnpo2DsGGf6Pdu3tt9gv', // reward vault A
    poolRewardTokenAccountB: '6ezx1EivkxsJcZLYhSJFLc3nUs25iyubf8PPyRNEX3pL' // reward vault B
  },
  {
    name: 'MER-USDC',
    lp: { ...LP_TOKENS['MER-USDC-V4'] },
    reward: { ...TOKENS.RAY },
    rewardB: { ...TOKENS.MER },
    isStake: false,

    fusion: true,
    legacy: false,
    dual: false,
    version: 5,
    programId: STAKE_PROGRAM_ID_V5,

    poolId: 'D4pYuD4tbir9KBsb7Kr63v9e86JY2UoUZeFK9eHKQFZM',
    poolAuthority: '2T46saTyTYeEFWyesRzLWj6y1ha9ngwcyWyGNn9q4zu4',
    poolLpTokenAccount: 'EV3wsqiMiNcBmo2mFkUuCtib36NpBCsC2vfkW3By1sSu', // lp vault
    poolRewardTokenAccount: '5gEH5Uq2QrqiEhdZ8YFAMY1HoYnKMiuu71f6BC25UXee', // reward vault A
    poolRewardTokenAccountB: 'FTP4hnN5GPtPYvkrscTkKWYVVQ56hV3f4wGgpEXgrDUD' // reward vault B
  },
  {
    name: 'ROPE-USDC',
    lp: { ...LP_TOKENS['ROPE-USDC-V4'] },
    reward: { ...TOKENS.RAY },
    rewardB: { ...TOKENS.ROPE },
    isStake: false,

    fusion: true,
    legacy: false,
    dual: false,
    version: 5,
    programId: STAKE_PROGRAM_ID_V5,

    poolId: 'BLy8KuRck5bcJkQdMDLSZnL1Ka4heAZSGiwTJfEfY727',
    poolAuthority: '8xPzoFPHKWZHWmwKaxFUyVBf2V13HMbCrMDgaCZCLjgx',
    poolLpTokenAccount: 'DiebAVak6cub1Mn3yhhvgSvGhkAP1JTtyRGoAei4wrWE', // lp vault
    poolRewardTokenAccount: '4F9FaFewwsSF8Bsxukyj9NiEdPFQQ38dNKEDpZugYfdi', // reward vault A
    poolRewardTokenAccountB: '4tvLbnZEPZLuDf636DHEzrUxW8bDoZ5XyfVwk7ppDhbC' // reward vault B
  },
  {
    name: 'ALEPH-USDC',
    lp: { ...LP_TOKENS['ALEPH-USDC-V4'] },
    reward: { ...TOKENS.RAY },
    rewardB: { ...TOKENS.ALEPH },
    isStake: false,

    fusion: true,
    legacy: false,
    dual: false,
    version: 5,
    programId: STAKE_PROGRAM_ID_V5,

    poolId: 'JAP8SFagJBm6vt2LoFGNeSJ1hKDZ2p3yXb3CvBx11How',
    poolAuthority: 'DVtR63sAnJPM9wdt1hYBqA5GTyFzjfcfdLTfsSzV85Ss',
    poolLpTokenAccount: 'feCzxSvVX4EboJV4cubjqoPTK41noaHUanz8ZNJmiBp', // lp vault
    poolRewardTokenAccount: '4mAhgUY8XGMY4743wuzVbLw7d5bqqTaxME8jmbC2YfH4', // reward vault A
    poolRewardTokenAccountB: '3sGDa8ir8GrkKbnBH6HP63JaYSs7nskmmVHpF2vuzaZr' // reward vault B
  },
  {
    name: 'TULIP-USDC',
    lp: { ...LP_TOKENS['TULIP-USDC-V4'] },
    reward: { ...TOKENS.RAY },
    rewardB: { ...TOKENS.TULIP },
    isStake: false,

    fusion: true,
    legacy: false,
    dual: false,
    version: 5,
    programId: STAKE_PROGRAM_ID_V5,

    poolId: '7U8Z6TWQMtsMcHV2htALnF9VQonnD1MrVm17YtmGEGEw',
    poolAuthority: '9ZVNLEiBZ2u23P7rEJf5sXY7TZK723cmVs46pBRSbRnU',
    poolLpTokenAccount: 'B6xn6doS3Qfy1LJLbdcJa5MpJ4po2bgut1rKFvmmq6Ut', // lp vault
    poolRewardTokenAccount: 'GtPTgCr6nXiogRCWqGvLa8P6dJgZpHfAX3KxGMpxnGMJ', // reward vault A
    poolRewardTokenAccountB: '8qgijAifBGx2EAJ7zKAzk6z7dVpcDV9eHvTBwofmdTP5' // reward vault B
  },
  {
    name: 'SNY-USDC',
    lp: { ...LP_TOKENS['SNY-USDC-V4'] },
    reward: { ...TOKENS.RAY },
    rewardB: { ...TOKENS.SNY },
    isStake: false,

    fusion: true,
    legacy: false,
    dual: false,
    version: 5,
    programId: STAKE_PROGRAM_ID_V5,

    poolId: '31QSh1TwgoA9GbvkgfEEwKEm11t8CR4KiQr6WCyJr7EN',
    poolAuthority: 'BbebocNt4ySwkufrY1X3wRG8PVefCRLFR2E2TGzZPkne',
    poolLpTokenAccount: '2t1qozn7xtWjuCqnnTx4PaKikajN2AQK3CVH6A5JqagY', // lp vault
    poolRewardTokenAccount: 'GXZq2zNPZ9odPWAPinxXK8B7cMaAN9CpbcaLicksJsbt', // reward vault A
    poolRewardTokenAccountB: 'DdSL2stD9UXfY2nj9MKrNPx8QTro1GGAY6rsBd9kJXMX' // reward vault B
  },
  {
    name: 'BOP-RAY',
    lp: { ...LP_TOKENS['BOP-RAY-V4'] },
    reward: { ...TOKENS.RAY },
    rewardB: { ...TOKENS.BOP },
    isStake: false,

    fusion: true,
    legacy: false,
    dual: false,
    version: 5,
    programId: STAKE_PROGRAM_ID_V5,

    poolId: 'EEe8b72w5q6T86nYRNJdFcY25tznPzrd1jGjuxZ7f9mX',
    poolAuthority: '7d99wJT2nRjWe2eKF7FpzMFb7934KoRhLP7pp2bjRm9m',
    poolLpTokenAccount: 'FWMHgA5iUxz3zMYf7jRJk8Z9ebWNWpvd7358rGCPFr7M', // lp vault
    poolRewardTokenAccount: 'DhvRSrQUio8LpCJH4uFCvvK4MEYVrBA6xaj1hu9jVxZn', // reward vault A
    poolRewardTokenAccountB: '3c6552swYV5nBTKTCWfKURjN1uGjtceanfb3vRbHNXpN' // reward vault B
  },
  {
    name: 'SLRS-USDC',
    lp: { ...LP_TOKENS['SLRS-USDC-V4'] },
    reward: { ...TOKENS.RAY },
    rewardB: { ...TOKENS.SLRS },
    isStake: false,

    fusion: true,
    legacy: false,
    dual: false,
    version: 5,
    programId: STAKE_PROGRAM_ID_V5,

    poolId: '5PVVwSqwzkCvuiKEZwWkM35ApBnoWqF8XopsVZjPwA8z',
    poolAuthority: '7jNUxDiLLyke8ECShavvPPQz4D1abj4aCZwQfZ3TCTAX',
    poolLpTokenAccount: 'HTr2pYDBQZP13YTzLdsPzmh6e4hsNeqoGy3B777ejqTT', // lp vault
    poolRewardTokenAccount: 'Ef1tQ2E2Fe92xPVpQGzZFHmT7g7dh2hzVfWYVJJQPdbu', // reward vault A
    poolRewardTokenAccountB: 'Ffmv9Ximzk8D9oKwHkkgdq9cVxv5P5Y9LxEJdu1N1jSJ' // reward vault B
  },
  {
    name: 'SAMO-RAY',
    lp: { ...LP_TOKENS['SAMO-RAY-V4'] },
    reward: { ...TOKENS.RAY },
    rewardB: { ...TOKENS.SAMO },
    isStake: false,

    fusion: true,
    legacy: false,
    dual: false,
    version: 5,
    programId: STAKE_PROGRAM_ID_V5,

    poolId: 'Bw932pURVJRYjEJwRZGWjfUNpeyz18kjMNdb833eMxoj',
    poolAuthority: 'FzTbGLdzgWCRkq8hbS8tLf5HjfU7JzUbtRmTkjGQB9Vz',
    poolLpTokenAccount: 'GUVKfYMiGEyp41CUw2j2NsoQJ5zDQ3Q6uSdApM8W46Ba', // lp vault
    poolRewardTokenAccount: 'J99YW5wnfgBJcG17BgSbp1S8RNJ39JAb7kg9RGHyb3Hq', // reward vault A
    poolRewardTokenAccountB: 'GhctEMRSwvdZF7aFeCLdK9X1sAAeGVPjr12iVLjQNvhy' // reward vault B
  },
  {
    name: 'LIKE-USDC',
    lp: { ...LP_TOKENS['LIKE-USDC-V4'] },
    reward: { ...TOKENS.RAY },
    rewardB: { ...TOKENS.LIKE },
    isStake: false,

    fusion: true,
    legacy: false,
    dual: false,
    version: 5,
    programId: STAKE_PROGRAM_ID_V5,

    poolId: 'BRM5bdX2mjmFGg2RAent1Whd61o9asQD16BXsC6QvEni',
    poolAuthority: '9rThpjxEgNR5xi2z2QgXenS2RwRrrN1GqrudegT32Ygy',
    poolLpTokenAccount: 'FzVu8n4UCf3o1KH4X8khM9KgKA96dJQdQMPtLvmbHyNi', // lp vault
    poolRewardTokenAccount: '3G1cbktUU79CT3zskP16VYmEhwVQq2RYxVWV7fcjmkTX', // reward vault A
    poolRewardTokenAccountB: '2Ks41qfN2GZffbd1cqrNGuXJYJbShHhz6aHQvq8SaYYr' // reward vault B
  },
  {
    name: 'RAY-SOL',
    lp: { ...LP_TOKENS['RAY-SOL-V4'] },
    reward: { ...TOKENS.RAY },
    isStake: false,

    fusion: false,
    legacy: false,
    dual: false,
    version: 3,
    programId: STAKE_PROGRAM_ID,

    poolId: 'HUDr9BDaAGqi37xbQHzxCyXvfMCKPTPNF8g9c9bPu1Fu',
    poolAuthority: '9VbmvaaPeNAke2MAL3h2Fw82VubH1tBCzwBzaWybGKiG',
    poolLpTokenAccount: 'A4xQv2BQPB1WxsjiCC7tcMH7zUq255uCBkevFj8qSCyJ', // lp vault
    poolRewardTokenAccount: '6zA5RAQYgazm4dniS8AigjGFtRi4xneqjL7ehrSqCmhr' // reward vault A
  },
  {
    name: 'RAY-USDC',
    lp: { ...LP_TOKENS['RAY-USDC-V4'] },
    reward: { ...TOKENS.RAY },
    isStake: false,

    fusion: false,
    legacy: false,
    dual: false,
    version: 3,
    programId: STAKE_PROGRAM_ID,

    poolId: 'CHYrUBX2RKX8iBg7gYTkccoGNBzP44LdaazMHCLcdEgS',
    poolAuthority: '5KQFnDd33J5NaMC9hQ64P5XzaaSz8Pt7NBCkZFYn1po',
    poolLpTokenAccount: 'BNnXLFGva3K8ACruAc1gaP49NCbLkyE6xWhGV4G2HLrs', // lp vault
    poolRewardTokenAccount: 'DpRueBHHhrQNvrjZX7CwGitJDJ8eZc3AHcyFMG4LqCQR' // reward vault A
  },
  {
    name: 'RAY-ETH',
    lp: { ...LP_TOKENS['RAY-ETH-V4'] },
    reward: { ...TOKENS.RAY },
    isStake: false,

    fusion: false,
    legacy: false,
    dual: false,
    version: 3,
    programId: STAKE_PROGRAM_ID,

    poolId: 'B6fbnZZ7sbKHR18ffEDD5Nncgp54iKN1GbCgjTRdqhS1',
    poolAuthority: '6amoZ7YBbsz3uUUbkeEH4vDTNwjvgjxTiu6nGi9z1JGe',
    poolLpTokenAccount: 'BjAfXpHTHz2kipraNddS6WwQvGGtbvyobn7MxLEEYfrH', // lp vault
    poolRewardTokenAccount: '7YfTgYQFGEJ4kb8jCF8cBrrUwEFskLin3EbvE1crqiQh' // reward vault A
  },
  {
    name: 'RAY-SRM',
    lp: { ...LP_TOKENS['RAY-SRM-V4'] },
    reward: { ...TOKENS.RAY },
    isStake: false,

    fusion: false,
    legacy: false,
    dual: false,
    version: 3,
    programId: STAKE_PROGRAM_ID,

    poolId: '5DFbcYNLLy5SJiBpCCDzNSs7cWCsUbYnCkLXzcPQiKnR',
    poolAuthority: 'DdFXxCbn5vpxPRaGmurmefCTTSUa5XZ9Kh6Noc4bvrU9',
    poolLpTokenAccount: '792c58UHPPuLJcYZ6nawcD5F5NQXGbBos9ZGczTrLSdb', // lp vault
    poolRewardTokenAccount: '5ihtMmeTAx3kdf459Yt3bqos5zDe4WBBcSZSB6ooNxLt' // reward vault A
  },
  {
    name: 'MNGO-USDC',
    lp: { ...LP_TOKENS['MNGO-USDC-V4'] },
    reward: { ...TOKENS.RAY },
    rewardB: { ...TOKENS.MNGO },
    isStake: false,

    fusion: true,
    legacy: false,
    dual: false,
    version: 5,
    programId: STAKE_PROGRAM_ID_V5,

    poolId: 'GzEDEkHSFFfxKMu3Toww1nrEjtbQGJKRPNRK1Pfd59Zn',
    poolAuthority: '9AMvw1TUJ9gX1kUAvcmHt2ZjokBLepXQbN8EJxBVZu2s',
    poolLpTokenAccount: 'gjrMLKsNwXYzJnX9DT8Lc7HeC1AT52jQKtDkPiRRuEP', // lp vault
    poolRewardTokenAccount: '4czqUC2ebdvqxPXfRniknLk7Cr2TosTabQSRnUeFia9v', // reward vault A
    poolRewardTokenAccountB: '6K1AE1wnTNaMgcAgQPvrTbnWEHB7nW6uTtv7ZbXWgMtn' // reward vault B
  },
  {
    name: 'COPE-RAY',
    lp: { ...LP_TOKENS['COPE-RAY-V4'] },
    reward: { ...TOKENS.RAY },
    rewardB: { ...TOKENS.COPE },
    isStake: false,

    fusion: true,
    legacy: false,
    dual: true,
    version: 5,
    programId: STAKE_PROGRAM_ID_V5,

    poolId: 'CM9XTJfXEHceGPXhmXxheR87Ng9CZ4jiBoTVQHhs9DVN',
    poolAuthority: 'AWYeNgCErUafmBU2TtZgzNwixpKd3BxRTmvYDw7U1jgN',
    poolLpTokenAccount: 'FLqRe3W9Lp59uNgzkACsXpEZkWUxBBstMtUyGSzqFhXD', // lp vault
    poolRewardTokenAccount: 'Ex23TUPEarZepXdHgjm7LVy35HDWY2VgeKao5kjYRZGE', // reward vault A
    poolRewardTokenAccountB: 'JDjSMCSK9s9dDsiiXeT3HVaX48k7WewyKBoMPax3TZxL' // reward vault B
  },
  {
    name: 'LIKE-RAY',
    lp: { ...LP_TOKENS['LIKE-RAY-V4'] },
    reward: { ...TOKENS.RAY },
    rewardB: { ...TOKENS.LIKE },
    isStake: false,

    fusion: true,
    legacy: false,
    dual: true,
    version: 5,
    programId: STAKE_PROGRAM_ID_V5,

    poolId: 'AMcVWK66iexwwCHn8drxywdNr2UgH3vmRzLXQFdErGmL',
    poolAuthority: '32yVBkvq29AmXKu1A3xUtgHrMGFnLvxF18fhd4JLKfJs',
    poolLpTokenAccount: '6f72fpk4WDeqpTJZ4dLSvAacfwmCAfEk7RtuPQ5oyNd7', // lp vault
    poolRewardTokenAccount: '4oPdHXXdRmjtKMLCcK8rtp3vMmq9y9LJ6W83mqrqMjCt', // reward vault A
    poolRewardTokenAccountB: 'E49fLhK6Wv43FySZB1xybPghzK2cjr9hgfpcmcVSLeYm' // reward vault B
  },
  {
    name: 'MEDIA-RAY',
    lp: { ...LP_TOKENS['MEDIA-RAY-V4'] },
    reward: { ...TOKENS.RAY },
    rewardB: { ...TOKENS.MEDIA },
    isStake: false,

    fusion: true,
    legacy: false,
    dual: true,
    version: 5,
    programId: STAKE_PROGRAM_ID_V5,

    poolId: 'DJfvL6srBht8XFMWYuuKHYGainqvwXyA5icVsDne3pwN',
    poolAuthority: '69PxTdPaRSofBJkwT9mYW14cPUEe7fU2AYEDvt3q5Fkt',
    poolLpTokenAccount: '3Kaibb6xYpKjFejtkgH8tBrMWShWzwBd7WfcGygZ4Vcw', // lp vault
    poolRewardTokenAccount: '28kE8Erc2uFThiUr8RifoUEc9Kv8V54To6DJLgCuJEPp', // reward vault A
    poolRewardTokenAccountB: '3kofbYH2hPefwHSgMburaGN5XmJx7sD94jo5CsMCXzLE' // reward vault B
  },
  {
    name: 'MER-RAY',
    lp: { ...LP_TOKENS['MER-RAY-V4'] },
    reward: { ...TOKENS.RAY },
    rewardB: { ...TOKENS.MER },
    isStake: false,

    fusion: true,
    legacy: false,
    dual: true,
    version: 5,
    programId: STAKE_PROGRAM_ID_V5,

    poolId: '21xhrT4j8QnaBvj3QjhP5kZu8sXJMCE7hzHKGtWEkdKr',
    poolAuthority: '6GrjogDgJ56mPcNu1nFw7MVLMALoNzd6RsZiXrQAuTvh',
    poolLpTokenAccount: 'Ee4zr6okPiyG6ia8kZfPwoNRDtNsrn4YfPc7MMmTqufR', // lp vault
    poolRewardTokenAccount: 'FnSG5cBXyEqo3DxKrcjhj7wo8un3HrxABQrxfA5uKWsg', // reward vault A
    poolRewardTokenAccountB: '8yL9QK96Ag3NnvqZmcaupb7c4NeP5hJXraGS3jCzMzT' // reward vault B
  },
  {
    name: 'SLRS-RAY',
    lp: { ...LP_TOKENS['SLRS-RAY-V4'] },
    reward: { ...TOKENS.RAY },
    rewardB: { ...TOKENS.SLRS },
    isStake: false,

    fusion: true,
    legacy: false,
    dual: true,
    version: 5,
    programId: STAKE_PROGRAM_ID_V5,

    poolId: 'J61AnYYSwjtJ4wDqEqqWSBuZbiR2SDDrtF7FFobutM6a',
    poolAuthority: 'BHGHqkJomVD5tKNMZFajA1PZEJaZW5Yywyp6UAcvf1Wq',
    poolLpTokenAccount: 'H8NEHvqm43DxWbMfvLMvUqoKrjG4B4EJXEYBz2DYhRHd', // lp vault
    poolRewardTokenAccount: '5g1ox4cwcfNFsqPiGH2zhsHYpaBf6rkigL6YR5ZBQA5k', // reward vault A
    poolRewardTokenAccountB: '95b2zMqRGsovcR69XXfRPcvLdyvLCH5M5nd4z27yC8Q1' // reward vault B
  },
  {
    name: 'SNY-RAY',
    lp: { ...LP_TOKENS['SNY-RAY-V4'] },
    reward: { ...TOKENS.RAY },
    rewardB: { ...TOKENS.SNY },
    isStake: false,

    fusion: true,
    legacy: false,
    dual: true,
    version: 5,
    programId: STAKE_PROGRAM_ID_V5,

    poolId: 'JEC3P83x2GEijYDwXiksuh5H6YrQt5xW6MC2GDKkMoe',
    poolAuthority: '9qwnkx2gRMLVoYkJVkyH2Yza5e5E7LoZEpx9jZ9r3CBY',
    poolLpTokenAccount: '7JrCLqrhH9kb78St4dAncBYE9VhZdB4P1tFAdxwzDrH5', // lp vault
    poolRewardTokenAccount: 'HmovkXKsso8xHwPYmMYF5bmP5CCwCtReQVb8ETTSSoyN', // reward vault A
    poolRewardTokenAccountB: 'GXJSX1JNjjAK6jEEjujvzhCjMeVnZmpJ5fng3daynCnY' // reward vault B
  },
  {
    name: 'TULIP-RAY',
    lp: { ...LP_TOKENS['TULIP-RAY-V4'] },
    reward: { ...TOKENS.RAY },
    rewardB: { ...TOKENS.TULIP },
    isStake: false,

    fusion: true,
    legacy: false,
    dual: true,
    version: 5,
    programId: STAKE_PROGRAM_ID_V5,

    poolId: 'BmbG9hv5PazcW3rYWvatA6HpNPkozEdkWBiU64pZxuwr',
    poolAuthority: '956MvcyRBPMZ6waK3bdD4dn3XfaganoKed1NUQ9NaFAg',
    poolLpTokenAccount: 'HMgHKCLetHYDUJZEXKRJCiSeQs4Udwy6MNXHoLruMctH', // lp vault
    poolRewardTokenAccount: '5ih22SsrffDjygZHF8ADyJa4TNKQZqANg7dXyBJN9V8P', // reward vault A
    poolRewardTokenAccountB: '3zK56FmEqeH93BuH5K7JY9ZaEfFMdo3YjAasFikCmDB1' // reward vault B
  },
  {
    name: 'ALEPH-RAY',
    lp: { ...LP_TOKENS['ALEPH-RAY-V4'] },
    reward: { ...TOKENS.RAY },
    rewardB: { ...TOKENS.ALEPH },
    isStake: false,

    fusion: true,
    legacy: false,
    dual: true,
    version: 5,
    programId: STAKE_PROGRAM_ID_V5,

    poolId: '4wvZ9SwWaHKTpshQbCSKQoPosZp9KGwUzuQdESi39qPn',
    poolAuthority: 'G3tniqor4UrtE29UQLGcBBuk4ScvonDpXiPSDTK3RioJ',
    poolLpTokenAccount: 'Fx32reDAB5MyJJwr8CjCM1fNgFsmnjhaxjC9pJswpUok', // lp vault
    poolRewardTokenAccount: '34gWdzwgj1zWQG4iwSbTeUDbQkoR8DXzLFQJsSpPDXLa', // reward vault A
    poolRewardTokenAccountB: 'Gm4v69FCZ33HZsHAgtdezAUJK6n5fQ3zHpTZxAAzeyoJ' // reward vault B
  },
  {
    name: 'RAY-SRM',
    lp: { ...LP_TOKENS['RAY-SRM-V4'] },
    reward: { ...TOKENS.RAY },
    rewardB: { ...TOKENS.SRM },
    isStake: false,

    fusion: true,
    legacy: false,
    dual: true,
    version: 5,
    programId: STAKE_PROGRAM_ID_V5,

    poolId: 'BnYoq5y2MoH4TsBHeEZrEPowhwebHxQq7nJW1vTjPTWu',
    poolAuthority: '8JMnGryLkzSYdnTUPGRgxHoAmP5soH8L8TRre91Gjgni',
    poolLpTokenAccount: '6tuhozgcTA25fq5Lp11QX9HsG8MVspUjtcn7EgYP1cs5', // lp vault
    poolRewardTokenAccount: 'ED6Ak5wnnegeVz6jWMzGEEnFQ7HY55uPdxR8Ha6hk7gz', // reward vault A
    poolRewardTokenAccountB: 'G4zqVtnHSK9Sp3SVdiQ5K56m46BdAoE2uQqpgVsmRG9d' // reward vault B
  },
  {
    name: 'ATLAS-USDC',
    lp: { ...LP_TOKENS['ATLAS-USDC-V4'] },
    reward: { ...TOKENS.RAY },
    rewardB: { ...TOKENS.ATLAS },
    isStake: false,

    fusion: true,
    legacy: false,
    dual: false,
    version: 5,
    programId: STAKE_PROGRAM_ID_V5,

    poolId: '93wRz2LeQ3TJoair827VTng62MjCzYDgJjG9Q5GmQ3Pd',
    poolAuthority: '4yrRmmckKKGsPbCSFFupGqZrJhAFxQ4hN2DMC9Bh2pHo',
    poolLpTokenAccount: 'HmE21hdD32ZjDnR5DvuNz7uS5q4bWbqf8jV2shx8kXmA', // lp vault
    poolRewardTokenAccount: '9iQsupP7JagNLkp1bvdWWGVkzsLFfHUwDbh9KZPoXbw5', // reward vault A
    poolRewardTokenAccountB: '5oQU1hU6qggyT4CU2AMPcWTcZdSRZeQBy7How5WuEp7A' // reward vault B
  },
  {
    name: 'POLIS-USDC',
    lp: { ...LP_TOKENS['POLIS-USDC-V4'] },
    reward: { ...TOKENS.RAY },
    rewardB: { ...TOKENS.POLIS },
    isStake: false,

    fusion: true,
    legacy: false,
    dual: false,
    version: 5,
    programId: STAKE_PROGRAM_ID_V5,

    poolId: '7qcihXTsRW5wS5BgK7iuD84W43ECByoJP45R3hu2r6mF',
    poolAuthority: '3MAzzKcBPJ2ykDHX1CBHzUJafy41FaTaLymg8z6SgX2Q',
    poolLpTokenAccount: 'FwLD6rHMwm5H6edDPuGjxdBMk3u38frsnytTkPmVZVP3', // lp vault
    poolRewardTokenAccount: 'AWQr1eX2RZiMadfeEpgPEQJBJq88f7dPLK3nqriKCPJp', // reward vault A
    poolRewardTokenAccountB: 'DfofnRgWFPHVaxaLGSdXvFGhr4TRwjdwQQvgkjNNkJfZ' // reward vault B
  },
  {
    name: 'ATLAS-RAY',
    lp: { ...LP_TOKENS['ATLAS-RAY-V4'] },
    reward: { ...TOKENS.RAY },
    rewardB: { ...TOKENS.ATLAS },
    isStake: false,

    fusion: true,
    legacy: false,
    dual: true,
    version: 5,
    programId: STAKE_PROGRAM_ID_V5,

    poolId: 'BHHhNLdJn69K1XPJcpcw4MBY3TPetpLxhj8s4K4ydsDV',
    poolAuthority: 'DjYd34HtSwwAGfTfK13onUyq975akjzfW2abaK5YTRaS',
    poolLpTokenAccount: '5RPJHt2V4baK7gY1E99xCRBtEzScuNEVPr9vA9PapLhs', // lp vault
    poolRewardTokenAccount: 'AQwjpEoLwnHYnsdSnzwRpSkTSeLDNYZ6tv6odVGzXJvZ', // reward vault A
    poolRewardTokenAccountB: 'DBXQnchh5zQuiEfaE8JBPTre8G1mksVTsHXoSqRPfA3r' // reward vault B
  },
  {
    name: 'POLIS-RAY',
    lp: { ...LP_TOKENS['POLIS-RAY-V4'] },
    reward: { ...TOKENS.RAY },
    rewardB: { ...TOKENS.POLIS },
    isStake: false,

    fusion: true,
    legacy: false,
    dual: true,
    version: 5,
    programId: STAKE_PROGRAM_ID_V5,

    poolId: 'HHm8Pgnzc56fTUYkicPv4DqGYp5fcPZFV1V1uhixSrMk',
    poolAuthority: 'GHPg6z7HYx1bsdK4W9WpdmV8BcjpPBBsRGMmj9dAD3yq',
    poolLpTokenAccount: '4wGbaNEGeGjqqgW5S9AAWvQL3LwWZioH1JWMZFBdPFge', // lp vault
    poolRewardTokenAccount: '4xrr44aG4kkgqQPZhBre93vg5fFY2htkkEEmTQjx5hiG', // reward vault A
    poolRewardTokenAccountB: 'EanBQNubTJs2fNgeosUcESCfBnvk6bci391U5SH4Kzoo' // reward vault B
  },
  {
    name: 'GRAPE-USDC',
    lp: { ...LP_TOKENS['GRAPE-USDC-V4'] },
    reward: { ...TOKENS.RAY },
    rewardB: { ...TOKENS.GRAPE },
    isStake: false,

    fusion: true,
    legacy: false,
    dual: false,
    version: 5,
    programId: STAKE_PROGRAM_ID_V5,

    poolId: '8GBa1cK1NxevoxiRNK6YW9tWuo2xftcA3as9Cu4nhFL7',
    poolAuthority: 'Gab4kPHmj5Hqn1KWEDsKt6Ta8jPtpc53oCPULszMNtyj',
    poolLpTokenAccount: 'eoVzVdFEkKPKY3djJ47RZjvNr5oujYY25uxXwNvrsfg', // lp vault
    poolRewardTokenAccount: 'AYoDAc5ndfts4Aw6vzH7XUB2GsXamj72aunzBcBCnz2f', // reward vault A
    poolRewardTokenAccountB: '5i2qZN5UH4UyF3t6HNeC1bXeXhWBZy1pwpCjLDG7AdJJ' // reward vault B
  },
  {
    name: 'LARIX-USDC',
    lp: { ...LP_TOKENS['LARIX-USDC-V4'] },
    reward: { ...TOKENS.RAY },
    rewardB: { ...TOKENS.LARIX },
    isStake: false,

    fusion: true,
    legacy: false,
    dual: false,
    version: 5,
    programId: STAKE_PROGRAM_ID_V5,

    poolId: 'HzxveT6pUMwYByqnScvTbpUv4avzkUDrDpS9D7DToEry',
    poolAuthority: 'sCDx3LzV8jPFX1VuRQDAGNKVfiCvhvrv3tJijaXzhXw',
    poolLpTokenAccount: '6PpGF8xRLwpDdVMQHQoBhrrXuUh5Gs4dCMs1DPanpjHM', // lp vault
    poolRewardTokenAccount: '7tPiMrZB6kct1xNWLtG1jJqJYUJaG8548bEaJsb5HdXq', // reward vault A
    poolRewardTokenAccountB: 'DXo3ffHBd69c9tV4wWBtFhc95UZMfYJehGnk3ViifSQ3' // reward vault B
  }
  // {
  //   name: 'stSOL-USDC',
  //   lp: { ...LP_TOKENS['stSOL-USDC-V4'] },
  //   reward: { ...TOKENS.RAY },
  //   rewardB: { ...TOKENS.stSOL },
  //   isStake: false,

  //   fusion: true,
  //   legacy: false,
  //   dual: false,
  //   version: 5,
  //   programId: STAKE_PROGRAM_ID_V5,

  //   poolId: '5gzQgxaKAU13SZeffmjjE2y9HwMJ42FxQkqJhJ5nqHeh',
  //   poolAuthority: 'DKSSeokFtU7cHKMdgNcZ72JETgf9Q3PqcGsk6hnzKxT4',
  //   poolLpTokenAccount: 'CoUQ1tcRkEyxbCHfLkjxgUtYVhrRbsdeMKT7zB2iCZg5', // lp vault
  //   poolRewardTokenAccount: '5fnav2gjLUjPCwHEnm2vMVmsDV3V8sfjj7MwfeUdgdtM', // reward vault A
  //   poolRewardTokenAccountB: '8geEcDpFkXqR2UEE2LVcYCzsD9cyGwJSu8Q56uqr1xs6' // reward vault B
  // }
].sort((a, b) => (a.fusion === true && b.fusion === false ? 1 : -1))

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
