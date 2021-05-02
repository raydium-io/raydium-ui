<template>
  <div class="debug container">
    <Button v-if="!wallet.connected" ghost @click="$accessor.wallet.openModal"> Connect wallet </Button>
    <div v-else>
      <Button ghost @click="unwrap">Unwrap WSOL</Button>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'

import { Button } from 'ant-design-vue'

import { get as safeGet } from 'lodash-es'
import { closeAccount } from '@project-serum/serum/lib/token-instructions'
import { Account, PublicKey, Transaction } from '@solana/web3.js'

import { TOKENS } from '@/utils/tokens'
import { sendTransaction } from '@/utils/web3'
import { getUnixTs } from '@/utils'

@Component({
  head: {
    title: 'Raydium Debug'
  },
  components: {
    Button
  }
})
export default class Debug extends Vue {
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
}
</script>
