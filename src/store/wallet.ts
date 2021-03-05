import { AccountInfo, Connection, ParsedAccountData, PublicKey } from '@solana/web3.js'
import { STAKE_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@/utils/ids'

import { NATIVE_SOL } from '@/utils/tokens'
import { TokenAmount } from '@/utils/safe-math'
import { USER_STAKE_INFO_ACCOUNT_LAYOUT } from '@/utils/stake'
import { cloneDeep } from 'lodash-es'
import { getFarmByPoolId } from '@/utils/farms'
import { getFilteredProgramAccounts } from '@/utils/web3'
import logger from '@/utils/logger'

const AUTO_REFRESH_TIME = 60

export const state = () => ({
  modalShow: false,

  connected: false,
  address: '',
  // endpoint: 'https://api.mainnet-beta.solana.com',
  endpoint: 'https://solana-api.projectserum.com',

  loading: false,
  tokenAccounts: {},
  stakeAccounts: {},
  // 自动刷新倒计时
  autoRefreshTime: AUTO_REFRESH_TIME,
  countdown: 0,
  lastSubBlock: 0
})

export const mutations = {
  setModal(state: any, show: boolean) {
    state.modalShow = show
  },

  connected(state: any, address: any) {
    state.connected = true
    state.address = address
  },

  disconnected(state: any) {
    state.connected = false
    state.address = ''
  },

  setLoading(state: any, loading: boolean) {
    if (loading) {
      state.countdown = AUTO_REFRESH_TIME
    }

    state.loading = loading

    if (!loading) {
      state.countdown = 0
    }
  },

  setTokenAccounts(state: any, tokenAccounts: any) {
    state.tokenAccounts = cloneDeep(tokenAccounts)
  },

  setStakeAccounts(state: any, stakeAccounts: any) {
    state.stakeAccounts = cloneDeep(stakeAccounts)
  },

  setCountdown(state: any, countdown: number) {
    state.countdown = countdown
  },

  setLastSubBlock(state: any, lastSubBlock: number) {
    state.lastSubBlock = lastSubBlock
  }
}

export const actions = {
  openModal({ commit }: { commit: any }) {
    commit('setModal', true)
  },

  closeModal({ commit }: { commit: any }) {
    // 不延时切换会闪
    return new Promise((resolve) => {
      commit('setModal', false)
      setTimeout(() => {
        resolve(true)
      }, 500)
    })
  },

  getTokenAccounts({ commit }: { commit: any }) {
    const conn: Connection = (this as any)._vm.$conn
    const wallet = (this as any)._vm.$wallet

    commit('setLoading', true)
    conn
      .getParsedTokenAccountsByOwner(
        wallet.publicKey,
        {
          programId: TOKEN_PROGRAM_ID
        },
        'confirmed'
      )
      .then(async (parsedTokenAccounts: any) => {
        const tokenAccounts: any = {}

        parsedTokenAccounts.value.forEach(
          (tokenAccountInfo: { pubkey: PublicKey; account: AccountInfo<ParsedAccountData> }) => {
            const tokenAccountAddress = tokenAccountInfo.pubkey.toBase58()
            const parsedInfo = tokenAccountInfo.account.data.parsed.info
            const mintAddress = parsedInfo.mint
            const balance = new TokenAmount(parsedInfo.tokenAmount.amount, parsedInfo.tokenAmount.decimals)

            // 如果同一 mint 有多个账户
            if (Object.prototype.hasOwnProperty.call(tokenAccounts, mintAddress)) {
              // 且老账户没余额
              if (tokenAccounts[mintAddress].balance === 0) {
                tokenAccounts[mintAddress] = {
                  tokenAccountAddress,
                  balance
                }
              }
            } else {
              tokenAccounts[mintAddress] = {
                tokenAccountAddress,
                balance
              }
            }
          }
        )

        // 获取原生 SOL 余额
        const solBalance = await conn.getBalance(wallet.publicKey, 'confirmed')
        tokenAccounts[NATIVE_SOL.mintAddress] = {
          tokenAccountAddress: wallet.publicKey.toBase58(),
          balance: new TokenAmount(solBalance, NATIVE_SOL.decimals)
        }

        // 获取 stake user info account
        const stakeFilters = [
          {
            memcmp: {
              offset: 40,
              bytes: wallet.publicKey.toBase58()
            }
          },
          {
            dataSize: USER_STAKE_INFO_ACCOUNT_LAYOUT.span
          }
        ]
        getFilteredProgramAccounts(conn, new PublicKey(STAKE_PROGRAM_ID), stakeFilters).then((stakeAccountInfos) => {
          const stakeAccounts: any = {}

          stakeAccountInfos.forEach((stakeAccountInfo) => {
            const stakeAccountAddress = stakeAccountInfo.publicKey.toBase58()
            const { data } = stakeAccountInfo.accountInfo

            const userStakeInfo = USER_STAKE_INFO_ACCOUNT_LAYOUT.decode(data)

            const poolId = userStakeInfo.poolId.toBase58()
            const depositBalance = userStakeInfo.depositBalance.toNumber()
            const rewardDebt = userStakeInfo.rewardDebt.toNumber()

            const farm = getFarmByPoolId(poolId)

            if (farm) {
              stakeAccounts[poolId] = {
                depositBalance: new TokenAmount(depositBalance, farm.lp.decimals),
                rewardDebt: new TokenAmount(rewardDebt, farm.reward.decimals),
                stakeAccountAddress
              }
            }
          })

          commit('setStakeAccounts', stakeAccounts)
          logger('User StakeAccounts updated')
        })

        commit('setTokenAccounts', tokenAccounts)
        logger('Wallet TokenAccounts updated')
      })
      .finally(() => {
        commit('setLoading', false)
      })
  }
}
