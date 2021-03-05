<template>
  <div class="container">
    <div class="page-head fs-container">
      <span class="title">Migration</span>
    </div>

    <div class="card">
      <div class="card-body">
        <p>Migrate your v2 LP tokens for v3.</p>

        <Button v-if="!wallet.connected" size="large" ghost @click="$store.dispatch('wallet/openModal')">
          Connect Wallet
        </Button>
        <div v-else>
          <Steps direction="vertical" progress-dot :current="farms.length === 0 ? (liquids.length === 0 ? 3 : 2) : 1">
            <Step>
              <div slot="title">Unstake</div>
              <div slot="description" class="action">
                Your's all LP tokens will unstake from farms

                <h6 v-for="farm in farms" :key="farm.farmInfo.poolId">
                  {{ farm.depositBalance.format() }} {{ farm.farmInfo.lp.name }}
                </h6>

                <Button ghost :loading="unstaking" :disabled="farms.length === 0" @click="unstake">Unstake all</Button>
              </div>
            </Step>
            <Step>
              <div slot="title">Remove liquidity</div>
              <div slot="description" class="action">
                Remove liquidity for all LP tokens

                <h6 v-for="liquid in liquids" :key="liquid.poolInfo.name">
                  {{ liquid.userLpBalance.format() }} {{ liquid.poolInfo.lp.name }}
                </h6>

                <Button ghost :loading="removeing" :disabled="liquids.length === 0" @click="remove">
                  Remove all liquidity
                </Button>
              </div>
            </Step>
            <Step>
              <div slot="title">Add liquidity (Optional)</div>
              <div slot="description" class="action">
                Earn RAY by staking v3 LP tokens in the new liquidity pools.

                <Button ghost>Go to V3 Liquidity</Button>
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
import { unstakeAll, removeAll } from '@/utils/migrate'
import { getUnixTs } from '@/utils'

const { Step } = Steps

export default Vue.extend({
  components: {
    Button,
    Steps,
    Step
  },

  computed: {
    ...mapState(['wallet', 'liquidity', 'farm', 'url'])
  },

  data() {
    return {
      farms: [] as any,
      liquids: [] as any,

      unstaking: false,
      removeing: false
    }
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

    remove() {
      this.removeing = true

      const conn = (this as any).$conn
      const wallet = (this as any).$wallet

      const liquids = [] as any
      this.liquids.forEach((liquid: any) => {
        const { poolInfo, userLpBalance } = liquid

        const lpAccount = get(this.wallet.tokenAccounts, `${poolInfo.lp.mintAddress}.tokenAccountAddress`)
        const fromCoinAccount = get(this.wallet.tokenAccounts, `${poolInfo.coin.mintAddress}.tokenAccountAddress`)
        const toCoinAccount = get(this.wallet.tokenAccounts, `${poolInfo.pc.mintAddress}.tokenAccountAddress`)

        liquids.push({
          poolInfo,
          lpAccount,
          fromCoinAccount,
          toCoinAccount,
          amount: userLpBalance
        })
      })

      const key = getUnixTs()
      ;(this as any).$notify.info({
        key,
        message: 'Making transaction...',
        duration: 0
      })

      removeAll(conn, wallet, liquids)
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

          const description = `Remove all liquidity`
          this.$store.dispatch('transaction/sub', { txid, description })
        })
        .catch((error) => {
          ;(this as any).$notify.error({
            key,
            message: 'Remove all liquidity failed',
            description: error.message
          })
        })
        .finally(() => {
          this.removeing = false
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

.ant-steps-item-title,
.ant-steps-item-description {
  color: #f1f1f2 !important;
}
</style>
