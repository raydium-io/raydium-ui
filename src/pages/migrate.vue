<template>
  <div class="container">
    <div class="page-head fs-container">
      <span class="title">WUSDT Migration</span>
    </div>

    <div class="card">
      <div class="card-body">
        <p>
          Native SPL USDT has launched on Solana. As a result, SPL Wrapped USDT (WUSDT) liquidity in the RAY-WUSDT pool
          must migrate to a new RAY-USDT pool. This tool simplifies the process.
        </p>

        <Button v-if="!wallet.connected" size="large" ghost @click="$accessor.wallet.openModal">
          Connect Wallet
        </Button>
        <div v-else>
          <Steps direction="vertical" progress-dot :current="4">
            <Step>
              <div slot="title">Create USDT account</div>
              <div slot="description" class="action">
                <Button
                  ghost
                  :loading="creating"
                  :disabled="creating || get(wallet.tokenAccounts, `${TOKENS.USDT.mintAddress}`)"
                  @click="createUsdtAccount"
                >
                  Create USDT Account
                </Button>
              </div>
            </Step>
            <Step>
              <div slot="title">Unstake</div>
              <div slot="description" class="action">
                Staked LP tokens will be unstaked from legacy RAY-WUSDT pools

                <template
                  v-for="farm in farms.filter((f) => f.farmInfo.version === 3 && f.farmInfo.lp.pc.symbol === 'WUSDT')"
                >
                  <Button
                    :key="farm.farmInfo.lp.name"
                    ghost
                    :loading="unstaking"
                    :disabled="unstaking"
                    @click="unstakeWUSDT(farm.farmInfo, farm.depositBalance.fixed())"
                  >
                    Unstake
                    {{ farm.depositBalance.format() }}
                    {{ farm.farmInfo.lp.name }}
                  </Button>
                </template>
              </div>
            </Step>
            <Step>
              <div slot="title">Remove liquidity</div>
              <div slot="description" class="action">
                Remove liquidity from legacy RAY-WUSDT pools

                <h6
                  v-for="liquid in liquids.filter((l) => l.poolInfo.version === 3)"
                  :key="liquid.poolInfo.name"
                  class="fs-container"
                >
                  <span> {{ liquid.userLpBalance.format() }} {{ liquid.poolInfo.lp.name }} </span>

                  <Button
                    ghost
                    :loading="removing"
                    :disabled="liquids.length === 0"
                    @click="remove(liquid.poolInfo, liquid.userLpBalance)"
                  >
                    Remove liquidity
                  </Button>
                </h6>
              </div>
            </Step>
            <Step>
              <div slot="title">Unwrap</div>
              <div slot="description" class="action">
                Convert WUSDT to USDT. Converting takes time to process, please give it a couple minutes.

                <h6 v-if="wallet.connected && wallet.tokenAccounts[TOKENS.WUSDT.mintAddress]" class="fs-container">
                  <span>WUSDT Balance</span>
                  <span>USDT Balance</span>
                </h6>
                <h6
                  v-if="wallet.connected && get(wallet.tokenAccounts, `${TOKENS.WUSDT.mintAddress}`)"
                  class="fs-container"
                >
                  <span v-if="!get(wallet.tokenAccounts, `${TOKENS.WUSDT.mintAddress}`)">
                    {{ get(wallet.tokenAccounts, `${TOKENS.WUSDT.mintAddress}`).balance.format() }}
                  </span>
                  <span v-else>0</span>
                  <span v-if="!get(wallet.tokenAccounts, `${TOKENS.USDT.mintAddress}`)"> No USDT account yet </span>
                  <span v-else>
                    {{ get(wallet.tokenAccounts, `${TOKENS.USDT.mintAddress}`).balance.format() }}
                  </span>
                </h6>

                <Button
                  v-if="wallet.connected && wallet.tokenAccounts[TOKENS.WUSDT.mintAddress]"
                  ghost
                  :loading="unwraping"
                  :disabled="unwraping || wallet.tokenAccounts[TOKENS.WUSDT.mintAddress].balance.wei.toNumber() === 0"
                  @click="unwrapWUSDT(wallet.tokenAccounts[TOKENS.WUSDT.mintAddress].balance.fixed())"
                >
                  Unwrap all WUSDT
                </Button>
              </div>
            </Step>
            <Step>
              <div slot="title">Add liquidity to new RAY-USDT pool</div>
              <div slot="description" class="action">
                Continue earning RAY by adding liquidity to new pools, then staking LP tokens

                <Button
                  ghost
                  @click="
                    $router.push({
                      path: '/liquidity/',
                      query: {
                        from: TOKENS.RAY.mintAddress,
                        to: TOKENS.USDT.mintAddress
                      }
                    })
                  "
                >
                  Add liquidity
                </Button>
              </div>
            </Step>
          </Steps>
        </div>
      </div>
    </div>

    <div class="page-head fs-container">
      <span class="title">DEX2 to DEX3 Migration</span>
    </div>

    <div class="card">
      <div class="card-body">
        <p>
          Raydium is upgrading from Serum DEX2 to DEX3. As part of the upgrade, liquidity in legacy DEX2 pools must
          migrate to new pools. This tool simplifies the process. For more info click
          <a href="https://raydium.gitbook.io/raydium/updates/upgrading-to-serum-dex3" target="_blank">here</a>.
        </p>

        <Button v-if="!wallet.connected" size="large" ghost @click="$accessor.wallet.openModal">
          Connect Wallet
        </Button>
        <div v-else>
          <Steps direction="vertical" progress-dot :current="3">
            <Step>
              <div slot="title">Unstake</div>
              <div slot="description" class="action">
                All staked LP tokens will be unstaked from legacy pools

                <template v-for="farm in farms">
                  <h6 v-if="farm.farmInfo.version === 2" :key="farm.farmInfo.poolId">
                    {{ farm.depositBalance.format() }} {{ farm.farmInfo.lp.name }}
                  </h6>
                </template>

                <Button
                  ghost
                  :loading="unstaking"
                  :disabled="farms.filter((f) => f.farmInfo.version === 2).length === 0"
                  @click="unstake"
                >
                  Unstake all
                </Button>
              </div>
            </Step>
            <Step>
              <div slot="title">Remove liquidity</div>
              <div slot="description" class="action">
                Remove liquidity for all legacy LP tokens

                <template v-for="liquid in liquids">
                  <h6 v-if="liquid.poolInfo.version === 2" :key="liquid.poolInfo.name" class="fs-container">
                    <span> {{ liquid.userLpBalance.format() }} {{ liquid.poolInfo.lp.name }} </span>

                    <Button
                      ghost
                      :loading="removing"
                      :disabled="liquids.filter((l) => l.poolInfo.version === 2).length === 0"
                      @click="remove(liquid.poolInfo, liquid.userLpBalance)"
                    >
                      Remove liquidity
                    </Button>
                  </h6>
                </template>
              </div>
            </Step>
            <Step>
              <div slot="title">Add liquidity to new pools</div>
              <div slot="description" class="action">
                Continue earning RAY by adding liquidity to new pools, then staking LP tokens.

                <Button ghost @click="$router.push({ path: '/liquidity/' })">Go to DEX3 liquidity</Button>
              </div>
            </Step>
          </Steps>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { Button, Steps } from 'ant-design-vue'

import { get, cloneDeep } from 'lodash-es'
import { unstakeAll } from '@/utils/migrate'
import { createTokenAccount, wrap } from '@/utils/swap'
import { withdraw } from '@/utils/stake'
import { TOKENS } from '@/utils/tokens'
import { removeLiquidity } from '@/utils/liquidity'
import { getUnixTs } from '@/utils'

const { Step } = Steps

export default Vue.extend({
  components: {
    Button,
    Steps,
    Step
  },

  data() {
    return {
      TOKENS,
      farms: [] as any,
      liquids: [] as any,

      creating: false,
      unstaking: false,
      removing: false,
      unwraping: false
    }
  },

  head: {
    title: 'Raydium Migrate'
  },

  computed: {
    ...mapState(['wallet', 'liquidity', 'farm', 'url'])
  },

  watch: {
    'farm.stakeAccounts': {
      handler() {
        this.updateFarms()
      },
      deep: true
    },
    'wallet.tokenAccounts': {
      handler() {
        this.updateLiquids()
      },
      deep: true
    }
  },

  mounted() {
    this.updateFarms()

    this.updateLiquids()
  },

  methods: {
    get,

    updateFarms() {
      const farms: any = []

      for (const [poolId, farmInfo] of Object.entries(this.farm.infos)) {
        // @ts-ignore
        if (!farmInfo.isStake) {
          let userInfo = get(this.farm.stakeAccounts, poolId)

          if (userInfo) {
            userInfo = cloneDeep(userInfo)

            const { depositBalance } = userInfo

            if (!depositBalance.isNullOrZero()) {
              farms.push({
                farmInfo,
                depositBalance
              })
            }
          }
        }
      }

      this.farms = farms
    },

    createUsdtAccount() {
      this.creating = true

      const conn = this.$web3
      const wallet = (this as any).$wallet

      const key = getUnixTs().toString()
      this.$notify.info({
        key,
        message: 'Making transaction...',
        description: '',
        duration: 0
      })

      createTokenAccount(conn, wallet, TOKENS.USDT.mintAddress)
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

          const description = `Create USDT account`
          this.$accessor.transaction.sub({ txid, description })
        })
        .catch((error) => {
          this.$notify.error({
            key,
            message: 'Create USDT account failed',
            description: error.message
          })
        })
        .finally(() => {
          this.creating = false
        })
    },

    unstakeWUSDT(farmInfo: any, amount: string) {
      this.unstaking = true

      const conn = this.$web3
      const wallet = (this as any).$wallet

      const lpAccount = get(this.wallet.tokenAccounts, `${farmInfo.lp.mintAddress}.tokenAccountAddress`)
      const rewardAccount = get(this.wallet.tokenAccounts, `${farmInfo.reward.mintAddress}.tokenAccountAddress`)
      const infoAccount = get(this.farm.stakeAccounts, `${farmInfo.poolId}.stakeAccountAddress`)

      const key = getUnixTs().toString()
      this.$notify.info({
        key,
        message: 'Making transaction...',
        description: '',
        duration: 0
      })

      withdraw(conn, wallet, farmInfo, lpAccount, rewardAccount, infoAccount, amount)
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

          const description = `Unstake ${amount} ${farmInfo.lp.name}`
          this.$accessor.transaction.sub({ txid, description })
        })
        .catch((error) => {
          this.$notify.error({
            key,
            message: 'Stake failed',
            description: error.message
          })
        })
        .finally(() => {
          this.unstaking = false
        })
    },

    unwrapWUSDT(amount: string) {
      this.unwraping = true

      const conn = this.$web3
      const wallet = (this as any).$wallet

      const wusdtAccount = get(this.wallet.tokenAccounts, `${TOKENS.WUSDT.mintAddress}.tokenAccountAddress`)
      const usdtAccount = get(this.wallet.tokenAccounts, `${TOKENS.USDT.mintAddress}.tokenAccountAddress`)

      const key = getUnixTs().toString()
      this.$notify.info({
        key,
        message: 'Making transaction...',
        description: '',
        duration: 0
      })

      wrap(
        this.$axios,
        conn,
        wallet,
        TOKENS.WUSDT.mintAddress,
        TOKENS.USDT.mintAddress,
        wusdtAccount,
        usdtAccount,
        amount
      )
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

          const description = `Unwrap ${amount} WUSDT`
          this.$accessor.transaction.sub({ txid, description })
        })
        .catch((error) => {
          this.$notify.error({
            key,
            message: 'Unwrap failed',
            description: error.message
          })
        })
        .finally(() => {
          this.unwraping = false
        })
    },

    unstake() {
      this.unstaking = true

      const conn = this.$web3
      const wallet = (this as any).$wallet

      const farms = [] as any
      this.farms.forEach((farm: any) => {
        const { farmInfo, depositBalance } = farm

        const lpAccount = get(this.wallet.tokenAccounts, `${farmInfo.lp.mintAddress}.tokenAccountAddress`)
        const rewardAccount = get(this.wallet.tokenAccounts, `${farmInfo.reward.mintAddress}.tokenAccountAddress`)
        const infoAccount = get(this.farm.stakeAccounts, `${farmInfo.poolId}.stakeAccountAddress`)

        farms.push({
          farmInfo,
          lpAccount,
          rewardAccount,
          infoAccount,
          amount: depositBalance
        })
      })

      const key = getUnixTs().toString()
      this.$notify.info({
        key,
        message: 'Making transaction...',
        description: '',
        duration: 0
      })

      unstakeAll(conn, wallet, farms)
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

          const description = `Unstake all LP tokens`
          this.$accessor.transaction.sub({ txid, description })
        })
        .catch((error) => {
          this.$notify.error({
            key,
            message: 'Unstake all LP tokens failed',
            description: error.message
          })
        })
        .finally(() => {
          this.unstaking = false
        })
    },

    updateLiquids() {
      const liquids = [] as any

      for (const [mintAddress, tokenAccount] of Object.entries(this.wallet.tokenAccounts)) {
        const poolInfo = get(this.liquidity.infos, mintAddress)

        if (poolInfo) {
          const userLpBalance = cloneDeep((tokenAccount as any).balance)

          if (!userLpBalance.isNullOrZero()) {
            liquids.push({
              poolInfo,
              userLpBalance
            })
          }
        }
      }

      this.liquids = liquids
    },

    remove(poolInfo: any, lpBalance: any) {
      this.removing = true

      const conn = this.$web3
      const wallet = (this as any).$wallet

      const lpAccount = get(this.wallet.tokenAccounts, `${poolInfo.lp.mintAddress}.tokenAccountAddress`)
      const fromCoinAccount = get(this.wallet.tokenAccounts, `${poolInfo.coin.mintAddress}.tokenAccountAddress`)
      const toCoinAccount = get(this.wallet.tokenAccounts, `${poolInfo.pc.mintAddress}.tokenAccountAddress`)

      const key = getUnixTs().toString()
      this.$notify.info({
        key,
        message: 'Making transaction...',
        description: '',
        duration: 0
      })

      removeLiquidity(conn, wallet, poolInfo, lpAccount, fromCoinAccount, toCoinAccount, lpBalance.fixed())
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

          const description = `Remove liquidity for ${lpBalance.format()} ${poolInfo.lp.name}`
          this.$accessor.transaction.sub({ txid, description })
        })
        .catch((error) => {
          this.$notify.error({
            key,
            message: 'Remove liquidity failed',
            description: error.message
          })
        })
        .finally(() => {
          this.removing = false
        })
    }
  }
})
</script>

<style lang="less" scoped>
.container {
  max-width: 450px;

  h6 {
    margin-bottom: 0;
  }

  .action {
    display: grid;
    grid-gap: 4px;
  }
}
</style>

<style lang="less">
.ant-steps-item-content {
  width: auto !important;
}

.ant-steps-item-title {
  color: #f1f1f2 !important;
}

.ant-steps-item-description {
  color: #85858d !important;
}
</style>
