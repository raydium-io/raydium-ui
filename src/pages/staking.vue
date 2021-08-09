<template>
  <div class="staking container">
    <div class="page-head fs-container">
      <span class="title">Staking</span>
      <div class="buttons">
        <Tooltip v-if="farm.initialized" placement="bottomRight">
          <template slot="title">
            <span>
              Displayed data will auto-refresh after
              {{ farm.autoRefreshTime - farm.countdown }} seconds. Click this circle to update manually.
            </span>
          </template>
          <Progress
            type="circle"
            :width="20"
            :stroke-width="10"
            :percent="(100 / farm.autoRefreshTime) * farm.countdown"
            :show-info="false"
            :class="farm.loading ? 'disabled' : ''"
            @click="
              () => {
                $accessor.farm.requestInfos()
                $accessor.wallet.getTokenAccounts()
              }
            "
          />
        </Tooltip>
      </div>
    </div>

    <CoinModal
      v-if="stakeModalOpening"
      title="Stake RAY"
      :coin="lp"
      :loading="staking"
      @onOk="stake"
      @onCancel="cancelStake"
    />
    <CoinModal
      v-if="unstakeModalOpening"
      title="Unstake RAY"
      :coin="lp"
      :loading="unstaking"
      @onOk="unstake"
      @onCancel="cancelUnstake"
    />

    <div v-if="farm.initialized" class="card">
      <div class="card-body">
        <Collapse expand-icon-position="right">
          <CollapsePanel v-for="farm in farms" :key="farm.farmInfo.poolId">
            <Row slot="header" class="farm-head" :gutter="0">
              <Col class="lp-icons" :span="8">
                <div class="icons">
                  <CoinIcon :mint-address="farm.farmInfo.lp.mintAddress" />
                </div>
                {{ farm.farmInfo.lp.symbol }}
              </Col>
              <Col class="state" :span="isMobile ? 8 : 4">
                <div class="title">{{ isMobile ? 'Reward' : 'Pending Reward' }}</div>
                <div class="value">{{ farm.userInfo.pendingReward.format() }}</div>
              </Col>
              <Col v-if="!isMobile" class="state" :span="4">
                <div class="title">Staked</div>
                <div class="value">
                  {{ farm.userInfo.depositBalance.format() }}
                </div>
              </Col>
              <Col class="state" :span="isMobile ? 8 : 4">
                <div class="title">Apr</div>
                <div class="value">{{ farm.farmInfo.apr }}%</div>
              </Col>
              <Col v-if="!isMobile" class="state" :span="4">
                <div class="title">Liquidity</div>
                <div class="value">{{ farm.farmInfo.lp.balance.format() }}</div>
              </Col>
            </Row>

            <Row :class="isMobile ? 'is-mobile' : ''" :gutter="16">
              <Col :span="isMobile ? 24 : 12">
                <div class="harvest">
                  <div class="title">Pending {{ farm.farmInfo.reward.symbol }} Reward</div>
                  <div class="pending fs-container">
                    <div class="reward">
                      <div class="token">{{ farm.userInfo.pendingReward.format() }}</div>
                    </div>
                    <Button
                      size="large"
                      ghost
                      :disabled="!wallet.connected || harvesting || farm.userInfo.pendingReward.isNullOrZero()"
                      :loading="harvesting"
                      @click="harvest(farm.farmInfo)"
                    >
                      Harvest
                    </Button>
                  </div>
                </div>
              </Col>

              <Col :span="isMobile ? 24 : 12">
                <div class="start">
                  <div class="title">Start staking</div>
                  <Button v-if="!wallet.connected" size="large" ghost @click="$accessor.wallet.openModal">
                    Connect Wallet
                  </Button>
                  <div v-else class="fs-container">
                    <Button
                      v-if="!farm.userInfo.depositBalance.isNullOrZero()"
                      class="unstake"
                      size="large"
                      ghost
                      @click="openUnstakeModal(farm.farmInfo, farm.farmInfo.lp, farm.userInfo.depositBalance)"
                    >
                      <Icon type="minus" />
                    </Button>
                    <Button size="large" ghost @click="openStakeModal(farm.farmInfo, farm.farmInfo.lp)">
                      Stake {{ farm.farmInfo.lp.symbol }}
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>
          </CollapsePanel>
        </Collapse>
      </div>
    </div>

    <div v-else class="fc-container">
      <Spin :spinning="true">
        <Icon slot="indicator" type="loading" style="font-size: 24px" spin />
      </Spin>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { Tooltip, Progress, Collapse, Spin, Icon, Row, Col, Button } from 'ant-design-vue'

import { get, cloneDeep } from 'lodash-es'
import { TokenAmount } from '@/utils/safe-math'
import { FarmInfo } from '@/utils/farms'
import { deposit, withdraw } from '@/utils/stake'
import { getUnixTs } from '@/utils'
import { getBigNumber } from '@/utils/layouts'

const CollapsePanel = Collapse.Panel

export default Vue.extend({
  components: {
    Tooltip,
    Progress,
    Collapse,
    CollapsePanel,
    Spin,
    Icon,
    Row,
    Col,
    Button
  },

  data() {
    return {
      isMobile: false,

      farms: [] as any,

      lp: null,
      farmInfo: null as any,
      harvesting: false,
      stakeModalOpening: false,
      staking: false,
      unstakeModalOpening: false,
      unstaking: false
    }
  },

  head: {
    title: 'Raydium Staking'
  },

  computed: {
    ...mapState(['app', 'wallet', 'farm', 'url', 'price', 'liquidity'])
  },

  watch: {
    'wallet.tokenAccounts': {
      handler(newTokenAccounts: any) {
        this.updateCurrentLp(newTokenAccounts)
      },
      deep: true
    },

    'farm.infos': {
      handler() {
        this.updateFarms()
      },
      deep: true
    },

    'farm.stakeAccounts': {
      handler() {
        this.updateFarms()
      },
      deep: true
    }
  },

  mounted() {
    this.updateFarms()
  },

  methods: {
    TokenAmount,

    updateFarms() {
      const farms: any = []

      for (const [poolId, farmInfo] of Object.entries(this.farm.infos)) {
        // @ts-ignore
        if (farmInfo.isStake) {
          let userInfo = get(this.farm.stakeAccounts, poolId)
          // @ts-ignore
          const { rewardPerShareNet, rewardPerBlock } = farmInfo.poolInfo
          // @ts-ignore
          const { reward, lp } = farmInfo

          const rewardPerBlockAmount = new TokenAmount(getBigNumber(rewardPerBlock), reward.decimals)
          const rewardPerBlockAmountTotalValue =
            getBigNumber(rewardPerBlockAmount.toEther()) * 2 * 60 * 60 * 24 * 365 * get(this.price.prices, lp.symbol)

          const liquidityItemValue = get(this.price.prices, lp.symbol)

          const apr = (
            (rewardPerBlockAmountTotalValue / (getBigNumber(lp.balance.toEther()) * liquidityItemValue)) *
            100
          ).toFixed(2)
          const newFarmInfo = cloneDeep(farmInfo)
          // @ts-ignore
          newFarmInfo.apr = apr

          if (userInfo) {
            userInfo = cloneDeep(userInfo)

            const { rewardDebt, depositBalance } = userInfo

            const pendingReward = depositBalance.wei
              .multipliedBy(getBigNumber(rewardPerShareNet))
              .dividedBy(1e9)
              .minus(rewardDebt.wei)

            userInfo.pendingReward = new TokenAmount(pendingReward, rewardDebt.decimals)
          } else {
            userInfo = {
              // @ts-ignore
              depositBalance: new TokenAmount(0, farmInfo.lp.decimals),
              // @ts-ignore
              pendingReward: new TokenAmount(0, farmInfo.reward.decimals)
            }
          }

          farms.push({
            userInfo,
            farmInfo: newFarmInfo
          })
        }
      }

      this.farms = farms
    },

    updateCurrentLp(newTokenAccounts: any) {
      if (this.lp) {
        const coin = cloneDeep(this.lp)
        // @ts-ignore
        const lpBalance = get(newTokenAccounts, `${this.lp.mintAddress}.balance`)
        // @ts-ignore
        coin.balance = lpBalance

        this.lp = coin
      }
    },

    openStakeModal(poolInfo: FarmInfo, lp: any) {
      const coin = cloneDeep(lp)
      const lpBalance = get(this.wallet.tokenAccounts, `${lp.mintAddress}.balance`)
      coin.balance = lpBalance

      this.lp = coin
      this.farmInfo = cloneDeep(poolInfo)
      this.stakeModalOpening = true
    },

    stake(amount: string) {
      this.staking = true

      const conn = this.$web3
      const wallet = (this as any).$wallet

      const lpAccount = get(this.wallet.tokenAccounts, `${this.farmInfo.lp.mintAddress}.tokenAccountAddress`)
      const rewardAccount = get(this.wallet.tokenAccounts, `${this.farmInfo.reward.mintAddress}.tokenAccountAddress`)
      const infoAccount = get(this.farm.stakeAccounts, `${this.farmInfo.poolId}.stakeAccountAddress`)

      const key = getUnixTs().toString()
      this.$notify.info({
        key,
        message: 'Making transaction...',
        description: '',
        duration: 0
      })

      deposit(conn, wallet, this.farmInfo, lpAccount, rewardAccount, infoAccount, amount)
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

          const description = `Stake ${amount} ${this.farmInfo.lp.symbol}`
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
          this.staking = false
          this.cancelStake()
        })
    },

    cancelStake() {
      this.lp = null
      this.farmInfo = null
      this.stakeModalOpening = false
    },

    openUnstakeModal(poolInfo: FarmInfo, lp: any, lpBalance: any) {
      const coin = cloneDeep(lp)
      coin.balance = lpBalance

      this.lp = coin
      this.farmInfo = cloneDeep(poolInfo)
      this.unstakeModalOpening = true
    },

    unstake(amount: string) {
      this.unstaking = true

      const conn = this.$web3
      const wallet = (this as any).$wallet

      const lpAccount = get(this.wallet.tokenAccounts, `${this.farmInfo.lp.mintAddress}.tokenAccountAddress`)
      const rewardAccount = get(this.wallet.tokenAccounts, `${this.farmInfo.reward.mintAddress}.tokenAccountAddress`)
      const infoAccount = get(this.farm.stakeAccounts, `${this.farmInfo.poolId}.stakeAccountAddress`)

      const key = getUnixTs().toString()
      this.$notify.info({
        key,
        message: 'Making transaction...',
        description: '',
        duration: 0
      })

      withdraw(conn, wallet, this.farmInfo, lpAccount, rewardAccount, infoAccount, amount)
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

          const description = `Unstake ${amount} ${this.farmInfo.lp.symbol}`
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
          this.cancelUnstake()
        })
    },

    cancelUnstake() {
      this.lp = null
      this.farmInfo = null
      this.unstakeModalOpening = false
    },

    harvest(farmInfo: FarmInfo) {
      this.harvesting = true

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

      deposit(conn, wallet, farmInfo, lpAccount, rewardAccount, infoAccount, '0')
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

          const description = `Harvest ${farmInfo.reward.symbol}`
          this.$accessor.transaction.sub({ txid, description })
        })
        .catch((error) => {
          this.$notify.error({
            key,
            message: 'Harvest failed',
            description: error.message
          })
        })
        .finally(() => {
          this.harvesting = false
        })
    }
  }
})
</script>

<style lang="less" scoped>
.staking.container {
  max-width: 1200px;

  .card {
    .card-body {
      padding: 0;

      .ant-collapse {
        border: 0;

        .ant-collapse-item {
          border-bottom: 0;
        }

        .ant-collapse-item:not(:last-child) {
          border-bottom: 1px solid #d9d9d9;
        }
      }
    }
  }

  .harvest {
    .reward {
      .token {
        font-weight: 600;
        font-size: 20px;
      }

      .value {
        font-size: 12px;
      }
    }

    button {
      padding: 0 30px;
    }
  }

  .start {
    .unstake {
      width: 48px;
      margin-right: 10px;
    }

    button {
      width: 100%;
    }
  }

  .harvest,
  .start {
    padding: 16px;
    border: 2px solid #1c274f;
    border-radius: 4px;

    .title {
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    button {
      height: 48px;
    }
  }

  .farm-head {
    display: flex;
    align-items: center;

    .lp-icons {
      .icons {
        margin-right: 8px;
      }
    }

    .state {
      display: flex;
      flex-direction: column;
      text-align: left;

      .title {
        font-size: 12px;
        text-transform: uppercase;
      }

      .value {
        font-size: 16px;
        line-height: 24px;
      }
    }
  }

  .is-mobile {
    .harvest {
      margin-bottom: 16px;
    }
  }
}
</style>

<style lang="less">
::-webkit-scrollbar {
  display: none; /* Chrome Safari */
}
.staking {
  .card-body {
    overflow-x: scroll;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .ant-collapse-header {
    padding: 24px 32px !important;
  }

  .ant-collapse-content {
    border-top: 1px solid #1c274f;
  }
}
</style>
