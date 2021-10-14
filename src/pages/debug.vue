<template>
  <div class="debug container">
    <Button v-if="!wallet.connected" ghost @click="$accessor.wallet.openModal"> Connect wallet </Button>
    <div v-else class="debug-section">
      <div class="debug-header">
        Unwrap WSOL
        <div class="debug-card">
          <Button ghost @click="unwrap">Unwrap WSOL</Button>
        </div>
      </div>
      <div class="debug-header">
        Token Accounts
        <div class="debug-card">
          <Button ghost @click="getTokenAccounts">Fetch token accounts</Button>
          <table>
            <thead>
              <tr>
                <th class="address">Account Address</th>
                <th class="balance">Balance</th>
                <th style="text-align: right">Token Mint</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tokenAccount in tokenAccounts" :key="tokenAccount.pubkey.toBase58()">
                {{
                  void ((address = tokenAccount.pubkey.toBase58()), (info = tokenAccount.account.data.parsed.info))
                }}
                <td class="flex">
                  <span>{{ address }}</span>
                </td>
                <td class="balance">{{ info.tokenAmount.uiAmount }}</td>
                <td class="token flex">
                  <span>{{ info.mint }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="debug-header">
        All Farms
        <div class="debug-card">
          <div v-for="(pool, poolId) in farm.infos" :key="poolId" class="debug-card">
            {{
              void ((lp = pool.lp),
              (reward = pool.reward),
              (rewardB = pool.rewardB || {}),
              (userInfo = farm.stakeAccounts[poolId] || {}),
              (userLpAccount = wallet.tokenAccounts[lp.mintAddress] || {}),
              (lpPrice = lp.coin && lp.pc ? prices[lp.coin.symbol] + prices[lp.pc.symbol] : prices[lp.symbol]))
            }}
            <table>
              <tbody>
                <tr>
                  <td>
                    <div>Pool: {{ pool.name }}</div>
                    <div>Pool id: {{ poolId }}</div>
                    <div>Pool version: {{ pool.version }}</div>
                    <div>Pool program id: {{ pool.programId }}</div>
                    <div>LP name: {{ lp.name }}</div>
                    <div>LP Mint: {{ lp.mintAddress }}</div>
                  </td>
                  <td class="balance">
                    <div>Is stake: {{ pool.isStake }}</div>
                    <div>Is fusion: {{ pool.fusion }}</div>
                    <div>Is legacy: {{ pool.legacy }}</div>
                    <div>Is dual: {{ pool.dual }}</div>
                  </td>
                  <td>
                    <div>LP Price ≈ ${{ lpPrice }}</div>
                    <div>LP deposited ≈ {{ lp.balance.format() }}</div>
                    <div>Reward A: {{ reward.symbol }}</div>
                    <div>Reward B: {{ rewardB.symbol }}</div>
                    <div>Your deposited: {{ userInfo.depositBalance ? userInfo.depositBalance.format() : 0 }}</div>
                    <div>Your LP balance: {{ userLpAccount.balance ? userLpAccount.balance.format() : 0 }}</div>
                    <Input :ref="`input-${poolId}`" size="small" />
                    <Button size="small" ghost @click="stake(pool)">Stake</Button>
                    <Button size="small" ghost @click="unstake(pool)">Untake</Button>
                    <div>
                      <Button size="small" type="danger" ghost @click="emergencyWithdraw(pool)">
                        Emergency withdraw all LP and wipe all rewards
                      </Button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'

import { Button, Input } from 'ant-design-vue'

import { get as safeGet } from 'lodash-es'
import { closeAccount } from '@project-serum/serum/lib/token-instructions'
import { Account, PublicKey, Transaction, AccountInfo, ParsedAccountData } from '@solana/web3.js'

import { TOKENS } from '@/utils/tokens'
import { sendTransaction } from '@/utils/web3'
import { getUnixTs } from '@/utils'
import { TOKEN_PROGRAM_ID } from '@/utils/ids'
import { depositV4, withdrawV4, deposit, withdraw, emergencyWithdrawV4 } from '@/utils/stake'

@Component({
  head: {
    title: 'Raydium Debug'
  },
  components: {
    Button,
    Input
  }
})
export default class Debug extends Vue {
  tokenAccounts: {
    pubkey: PublicKey
    account: AccountInfo<ParsedAccountData>
  }[] = []

  get wallet() {
    return this.$accessor.wallet
  }

  get farm() {
    return this.$accessor.farm
  }

  get url() {
    return this.$accessor.url
  }

  get prices() {
    return this.$accessor.price.prices
  }

  unwrap() {
    const key = getUnixTs().toString()
    this.$notify.info({
      key,
      message: 'Making transaction...',
      description: '',
      duration: 0
    })

    this.unwrapWsol()
      .then((txid) => {
        this.$notify.info({
          key,
          message: 'Transaction has been sent',
          description: (h: any) =>
            h('div', [
              'Confirmation is in progress.  Check your transaction on ',
              h('a', { attrs: { href: `${this.url.explorer}/tx/${txid}`, target: '_blank' } }, 'here')
            ])
        })

        const description = `Unwrap WSOL`
        this.$accessor.transaction.sub({ txid, description })
      })
      .catch((error) => {
        this.$notify.error({
          key,
          message: 'Unwrap WSOL failed',
          description: error.message
        })
      })
  }

  async unwrapWsol() {
    const wsolMint = TOKENS.WSOL.mintAddress
    const tokenAccount = safeGet(this.wallet.tokenAccounts, `${wsolMint}.tokenAccountAddress`)

    if (!tokenAccount) throw new Error('No any WSOL account')

    const connection = this.$web3
    const wallet = this.$wallet

    const transaction = new Transaction()
    const signers: Account[] = []

    const owner = wallet?.publicKey

    transaction.add(
      closeAccount({
        source: new PublicKey(tokenAccount),
        destination: owner,
        owner
      })
    )

    return await sendTransaction(connection, wallet, transaction, signers)
  }

  async getTokenAccounts() {
    this.tokenAccounts = []

    if (this.$wallet?.publicKey) {
      const { value } = await this.$web3.getParsedTokenAccountsByOwner(this.$wallet.publicKey, {
        programId: TOKEN_PROGRAM_ID
      })
      this.tokenAccounts = value
    }
  }

  stake(poolInfo: any) {
    const input = this.$refs[`input-${poolInfo.poolId}`]
    // @ts-ignore
    const amount = input[0].$refs.input.value

    const conn = this.$web3
    const wallet = (this as any).$wallet

    const lpAccount = safeGet(this.wallet.tokenAccounts, `${poolInfo.lp.mintAddress}.tokenAccountAddress`)
    const rewardAccount = safeGet(this.wallet.tokenAccounts, `${poolInfo.reward.mintAddress}.tokenAccountAddress`)
    const rewardAccountB = safeGet(this.wallet.tokenAccounts, `${poolInfo.rewardB?.mintAddress}.tokenAccountAddress`)
    const infoAccount = safeGet(this.farm.stakeAccounts, `${poolInfo.poolId}.stakeAccountAddress`)
    const isFusion = Boolean(poolInfo.fusion)

    const key = getUnixTs().toString()
    this.$notify.info({
      key,
      message: 'Making transaction...',
      description: '',
      duration: 0
    })
    const depositPromise = isFusion
      ? depositV4(conn, wallet, poolInfo, lpAccount, rewardAccount, rewardAccountB, infoAccount, amount)
      : deposit(conn, wallet, poolInfo, lpAccount, rewardAccount, infoAccount, amount)

    depositPromise
      .then((txid) => {
        this.$notify.info({
          key,
          message: 'Transaction has been sent',
          description: (h: any) =>
            h('div', [
              'Confirmation is in progress.  Check your transaction on ',
              h('a', { attrs: { href: `${this.url.explorer}/tx/${txid}`, target: '_blank' } }, 'here')
            ])
        })

        const description = `Stake ${amount} ${poolInfo.lp.name}`
        this.$accessor.transaction.sub({ txid, description })
      })
      .catch((error) => {
        this.$notify.error({
          key,
          message: 'Stake failed',
          description: error.message
        })
      })
  }

  unstake(poolInfo: any) {
    const input = this.$refs[`input-${poolInfo.poolId}`]
    // @ts-ignore
    const amount = input[0].$refs.input.value

    const conn = this.$web3
    const wallet = (this as any).$wallet

    const lpAccount = safeGet(this.wallet.tokenAccounts, `${poolInfo.lp.mintAddress}.tokenAccountAddress`)
    const rewardAccount = safeGet(this.wallet.tokenAccounts, `${poolInfo.reward.mintAddress}.tokenAccountAddress`)
    const rewardAccountB = safeGet(this.wallet.tokenAccounts, `${poolInfo.rewardB?.mintAddress}.tokenAccountAddress`)
    const infoAccount = safeGet(this.farm.stakeAccounts, `${poolInfo.poolId}.stakeAccountAddress`)
    const isFusion = Boolean(poolInfo.fusion)

    const key = getUnixTs().toString()
    this.$notify.info({
      key,
      message: 'Making transaction...',
      description: '',
      duration: 0
    })
    const withdrawPromise = isFusion
      ? withdrawV4(conn, wallet, poolInfo, lpAccount, rewardAccount, rewardAccountB, infoAccount, amount)
      : withdraw(conn, wallet, poolInfo, lpAccount, rewardAccount, infoAccount, amount)

    withdrawPromise
      .then((txid) => {
        this.$notify.info({
          key,
          message: 'Transaction has been sent',
          description: (h: any) =>
            h('div', [
              'Confirmation is in progress.  Check your transaction on ',
              h('a', { attrs: { href: `${this.url.explorer}/tx/${txid}`, target: '_blank' } }, 'here')
            ])
        })

        const description = `Unstake ${amount} ${poolInfo.lp.name}`
        this.$accessor.transaction.sub({ txid, description })
      })
      .catch((error) => {
        this.$notify.error({
          key,
          message: 'Stake failed',
          description: error.message
        })
      })
  }

  emergencyWithdraw(poolInfo: any) {
    const conn = this.$web3
    const wallet = (this as any).$wallet

    const lpAccount = safeGet(this.wallet.tokenAccounts, `${poolInfo.lp.mintAddress}.tokenAccountAddress`)
    const infoAccount = safeGet(this.farm.stakeAccounts, `${poolInfo.poolId}.stakeAccountAddress`)

    const key = getUnixTs().toString()
    this.$notify.info({
      key,
      message: 'Making transaction...',
      description: '',
      duration: 0
    })

    emergencyWithdrawV4(conn, wallet, poolInfo, lpAccount, infoAccount)
      .then((txid) => {
        this.$notify.info({
          key,
          message: 'Transaction has been sent',
          description: (h: any) =>
            h('div', [
              'Confirmation is in progress.  Check your transaction on ',
              h('a', { attrs: { href: `${this.url.explorer}/tx/${txid}`, target: '_blank' } }, 'here')
            ])
        })

        const description = `Emergency withdraw all LP and wipe all rewards`
        this.$accessor.transaction.sub({ txid, description })
      })
      .catch((error) => {
        this.$notify.error({
          key,
          message: 'Stake failed',
          description: error.message
        })
      })
  }
}
</script>

<style lang="less" sxcoped>
.debug {
  max-width: 1200px !important;
}

.debug-header {
  font-size: 16px;
  margin-bottom: 5px;
}

.debug-section {
  margin: 15px;
  padding: 10px;
  border: 1px solid #c0c0c0;
  border-radius: 5px;
}

.debug-card {
  margin: 10px 5px;
  padding: 10px;
  border: 1px solid #c0c0c0;
  border-radius: 5px;

  table {
    width: 100%;

    .balance {
      text-align: center;
    }

    .token {
      justify-content: flex-end;
    }
  }
}
</style>
