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
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'

import { Button } from 'ant-design-vue'

import { get as safeGet } from 'lodash-es'
import { closeAccount } from '@project-serum/serum/lib/token-instructions'
import { Account, PublicKey, Transaction, AccountInfo, ParsedAccountData } from '@solana/web3.js'

import { TOKENS } from '@/utils/tokens'
import { sendTransaction } from '@/utils/web3'
import { getUnixTs } from '@/utils'
import { TOKEN_PROGRAM_ID } from '@/utils/ids'

@Component({
  head: {
    title: 'Raydium Debug'
  },
  components: {
    Button
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

  get url() {
    return this.$accessor.url
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
