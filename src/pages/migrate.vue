<template>
  <div class="container">
    <div class="page-head fs-container">
      <span class="title">Migration</span>
    </div>

    <div class="card">
      <div class="card-body">
        <p>
          Raydium is upgrading from Serum DEX2 to DEX3. As part of the upgrade, liquidity in legacy DEX2 pools must
          migrate to new pools. This tool simplifies the process. For more info click
          <a href="https://raydium.gitbook.io/raydium/updates/upgrading-to-serum-dex3" target="_blank">here</a>.
        </p>

        <Button v-if="!wallet.connected" size="large" ghost @click="$store.dispatch('wallet/openModal')">
          Connect Wallet
        </Button>
        <div v-else>
          <Steps direction="vertical" progress-dot :current="farms.length === 0 ? (liquids.length === 0 ? 3 : 2) : 1">
            <Step>
              <div slot="title">Unstake</div>
              <div slot="description" class="action">
                All staked LP tokens will be unstaked from legacy pools

                <h6 v-for="farm in farms" :key="farm.farmInfo.poolId">
                  {{ farm.depositBalance.format() }} {{ farm.farmInfo.lp.name }}
                </h6>

                <Button ghost :loading="unstaking" :disabled="farms.length === 0" @click="unstake">Unstake all</Button>
              </div>
            </Step>
            <Step>
              <div slot="title">Remove liquidity</div>
              <div slot="description" class="action">
                Remove liquidity for all legacy LP tokens

                <h6 v-for="liquid in liquids" :key="liquid.poolInfo.name" class="fs-container">
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
              <div slot="title">Add liquidity to new pools</div>
              <div slot="description" class="action">
                Continue earning RAY by adding liquidity to new pools, then staking LP tokens.

                <Button ghost @click="$router.replace({ path: '/liquidity' })">Go to DEX3 liquidity</Button>
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
      farms: [] as any,
      liquids: [] as any,

      unstaking: false,
      removing: false
    }
  },

  computed: {
    ...mapState(['wallet', 'liquidity', 'farm', 'url'])
  },

  watch: {
    // 监听钱包信息
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
    updateFarms() {
      const farms: any = []

      for (const [poolId, farmInfo] of Object.entries(this.farm.infos)) {
        // @ts-ignore
        if (!farmInfo.isStake && farmInfo.version === 2) {
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

    unstake() {
      this.unstaking = true

      const conn = (this as any).$conn
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

      const key = getUnixTs()
      ;(this as any).$notify.info({
        key,
        message: 'Making transaction...',
        duration: 0
      })

      unstakeAll(conn, wallet, farms)
        .then((txid) => {
          ;(this as any).$notify.info({
            key,
            message: 'Transaction has been sent',
            description: (h: any) =>
              h('div', [
                'Confirmation is in progress.  Check your transaction on ',
                h('a', { attrs: { href: `${this.url.explorer}${txid}`, target: '_blank' } }, 'here')
              ])
          })

          const description = `Unstake all LP tokens`
          this.$store.dispatch('transaction/sub', { txid, description })
        })
        .catch((error) => {
          ;(this as any).$notify.error({
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

        if (poolInfo && poolInfo.version === 2) {
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

      const conn = (this as any).$conn
      const wallet = (this as any).$wallet

      const lpAccount = get(this.wallet.tokenAccounts, `${poolInfo.lp.mintAddress}.tokenAccountAddress`)
      const fromCoinAccount = get(this.wallet.tokenAccounts, `${poolInfo.coin.mintAddress}.tokenAccountAddress`)
      const toCoinAccount = get(this.wallet.tokenAccounts, `${poolInfo.pc.mintAddress}.tokenAccountAddress`)

      const key = getUnixTs()
      ;(this as any).$notify.info({
        key,
        message: 'Making transaction...',
        duration: 0
      })

      removeLiquidity(conn, wallet, poolInfo, lpAccount, fromCoinAccount, toCoinAccount, lpBalance.fixed())
        .then((txid) => {
          ;(this as any).$notify.info({
            key,
            message: 'Transaction has been sent',
            description: (h: any) =>
              h('div', [
                'Confirmation is in progress.  Check your transaction on ',
                h('a', { attrs: { href: `${this.url.explorer}${txid}`, target: '_blank' } }, 'here')
              ])
          })

          const description = `Remove liquidity for ${lpBalance.format()} ${poolInfo.lp.name}`
          this.$store.dispatch('transaction/sub', { txid, description })
        })
        .catch((error) => {
          ;(this as any).$notify.error({
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
