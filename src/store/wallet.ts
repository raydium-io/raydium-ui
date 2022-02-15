import { getterTree, mutationTree, actionTree } from 'typed-vuex'

import { PublicKey, AccountInfo, ParsedAccountData } from '@solana/web3.js'

import { NATIVE_SOL } from '@/utils/tokens'
import { TOKEN_PROGRAM_ID } from '@/utils/ids'
import { TokenAmount } from '@/utils/safe-math'
import { cloneDeep } from 'lodash-es'
import logger from '@/utils/logger'
import { findAssociatedTokenAddress } from '@/utils/web3'

const AUTO_REFRESH_TIME = 60

const noATAMint = [
  '98zVciBJZA6wvMM8b7RghZSSgDXGCkSXEPreTz3QxtAx',
  'AyPMGuWw4nt2wJSUa6sFk3cvftbGVy6rFccHRgkttVtx',
  'CZ6op9z4Xeid8TCbDQ5fmSyTj5M9HtPBJFjBugY8XsH1',
  '3vdq6mKD9m8HW8aaUepxnqLvVRsh2QChHUuNY8AYA82g',
  'FmKr3PRDcSH1tkbEoRWxGmqPjpnCF5M6t57AwiGXF7rS',
  '9Ycm3goqLZbT1CnPszNtM9DdfnhT8JhqZokSfvghy68o',
  '6xiJRaiYm8AFRg5bvoQy2AF4LM1X1jQtqxEDZAAYU4jB',
  '5mLxak4bqu5NYheebvUgfNroSCRUjr6joe7yKx8WHTDt',
  'AWbsDBHKGmjzJujwrmETG5tBjLf4jGjmopxjWTKc1252',
  '2h8oKSoDXZpjLGWqMEX1uhFLWrCd4F79vRWDnnQkqPor',
  '6MXp7K7LE83aqTfqfg1tRsX2PdksBQZx6THCXmimEuVY'
]

export const state = () => ({
  initialized: false,
  loading: false,
  modalShow: false,

  autoRefreshTime: AUTO_REFRESH_TIME,
  countdown: 0,
  lastSubBlock: 0,

  connected: false,
  address: '',

  tokenAccounts: {},
  auxiliaryTokenAccounts: [] as Array<{ pubkey: PublicKey; account: AccountInfo<ParsedAccountData> }>
})

export const getters = getterTree(state, {})

export const mutations = mutationTree(state, {
  setModal(state, show: boolean) {
    state.modalShow = show
  },

  setConnected(state, address: string) {
    state.connected = true
    state.address = address
  },

  setDisconnected(state) {
    state.connected = false
    state.address = ''
  },

  setInitialized(state) {
    state.initialized = true
  },

  setLoading(state, loading: boolean) {
    if (loading) {
      state.countdown = AUTO_REFRESH_TIME
    }

    state.loading = loading

    if (!loading) {
      state.countdown = 0
    }
  },

  setTokenAccounts(state, tokenAccounts: any) {
    state.tokenAccounts = cloneDeep(tokenAccounts)
  },

  setAuxiliaryTokenAccounts(
    state,
    auxiliaryTokenAccounts: Array<{ pubkey: PublicKey; account: AccountInfo<ParsedAccountData> }>
  ) {
    state.auxiliaryTokenAccounts = cloneDeep(auxiliaryTokenAccounts)
  },

  setCountdown(state, countdown: number) {
    state.countdown = countdown
  },

  setLastSubBlock(state, lastSubBlock: number) {
    state.lastSubBlock = lastSubBlock
  }
})

export const actions = actionTree(
  { state, getters, mutations },
  {
    openModal({ commit }) {
      commit('setModal', true)
    },

    closeModal({ commit }) {
      return new Promise((resolve) => {
        commit('setModal', false)
        setTimeout(() => {
          resolve(true)
        }, 500)
      })
    },

    getTokenAccounts({ commit }) {
      const conn = this.$web3
      const wallet = (this as any)._vm.$wallet

      if (wallet && wallet.connected) {
        commit('setLoading', true)

        conn
          .getParsedTokenAccountsByOwner(
            wallet.publicKey,
            {
              programId: TOKEN_PROGRAM_ID
            },
            'confirmed'
          )
          .then(async (parsedTokenAccounts) => {
            const tokenAccounts: any = {}
            const auxiliaryTokenAccounts: Array<{ pubkey: PublicKey; account: AccountInfo<ParsedAccountData> }> = []

            for (const tokenAccountInfo of parsedTokenAccounts.value) {
              const tokenAccountPubkey = tokenAccountInfo.pubkey
              const tokenAccountAddress = tokenAccountPubkey.toBase58()
              const parsedInfo = tokenAccountInfo.account.data.parsed.info
              const mintAddress = parsedInfo.mint
              const balance = new TokenAmount(parsedInfo.tokenAmount.amount, parsedInfo.tokenAmount.decimals)

              const ata = await findAssociatedTokenAddress(wallet.publicKey, new PublicKey(mintAddress))

              if (ata.equals(tokenAccountPubkey)) {
                tokenAccounts[mintAddress] = {
                  tokenAccountAddress,
                  balance
                }
              } else if (parsedInfo.tokenAmount.uiAmount > 0) {
                if (!noATAMint.includes(tokenAccountAddress)) {
                  auxiliaryTokenAccounts.push(tokenAccountInfo)
                }
              }
            }

            const solBalance = await conn.getBalance(wallet.publicKey, 'confirmed')
            tokenAccounts[NATIVE_SOL.mintAddress] = {
              tokenAccountAddress: wallet.publicKey.toBase58(),
              balance: new TokenAmount(solBalance, NATIVE_SOL.decimals)
            }

            commit('setAuxiliaryTokenAccounts', auxiliaryTokenAccounts)
            commit('setTokenAccounts', tokenAccounts)
            logger('Wallet TokenAccounts updated')
          })
          .catch()
          .finally(() => {
            commit('setInitialized')
            commit('setLoading', false)
          })
      }
    }
  }
)
