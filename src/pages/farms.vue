<template>
  <div class="farm container">
    <div class="page-head fs-container">
      <span class="title">Farms</span>
      <div class="buttons">
        <Tooltip v-if="farm.initialized" placement="bottomRight">
          <template slot="title">
            <span>
              Quote auto refresh countdown after
              {{ farm.autoRefreshTime - farm.countdown }} seconds, you can click to update manually
            </span>
            <br />
            <span> Automatically refreshes when the current pool had changed </span>
          </template>
          <Progress
            type="circle"
            :width="20"
            :stroke-width="10"
            :percent="(100 / farm.autoRefreshTime) * farm.countdown"
            :show-info="false"
            :class="farm.loading ? 'disabled' : ''"
            @click="$store.dispatch('farm/requestInfos')"
          />
        </Tooltip>
      </div>
    </div>

    <div v-if="farm.initialized">
      <div class="card">
        <div class="card-body">
          <Collapse expand-icon-position="right">
            <CollapsePanel v-for="farm in farms" v-show="farm.farmInfo.version === 3" :key="farm.farmInfo.poolId">
              <Row slot="header" class="farm-head" :gutter="0">
                <Col class="lp-icons" :span="8">
                  <div class="icons">
                    <img :src="importIcon(`/coins/${farm.farmInfo.lp.coin.symbol.toLowerCase()}.png`)" />
                    <img :src="importIcon(`/coins/${farm.farmInfo.lp.pc.symbol.toLowerCase()}.png`)" />
                  </div>
                  {{ farm.farmInfo.lp.name }}
                </Col>
                <Col class="state" :span="4">
                  <div class="title">Pending Reward</div>
                  <div class="value">{{ farm.userInfo.pendingReward.format() }}</div>
                </Col>
                <Col class="state" :span="4">
                  <div class="title">Staked</div>
                  <div class="value">
                    {{ farm.userInfo.depositBalance.format() }}
                  </div>
                </Col>
                <Col class="state" :span="4">
                  <div class="title">Apy</div>
                  <div class="value"></div>
                </Col>
                <Col class="state" :span="4">
                  <div class="title">Liquidity</div>
                  <div class="value">{{ farm.farmInfo.lp.balance.format() }}</div>
                </Col>
              </Row>

              <Row :gutter="48">
                <Col :span="4">
                  Add
                  <NuxtLink
                    :to="`/liquidity?from=${farm.farmInfo.lp.coin.mintAddress}&to=${farm.farmInfo.lp.pc.mintAddress}`"
                  >
                    {{ farm.farmInfo.lp.name }}
                  </NuxtLink>
                </Col>

                <Col :span="10">
                  <div class="harvest">
                    <div class="title">Pending {{ farm.farmInfo.reward.symbol }} Reward</div>
                    <div class="pending fs-container">
                      <div class="reward">
                        <div class="token">{{ farm.userInfo.pendingReward.format() }}</div>
                        <div class="value">0</div>
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

                <CoinModal
                  v-if="stakeModalOpening"
                  title="Stake LP"
                  :coin="lp"
                  :loading="staking"
                  @onOk="stake"
                  @onCancel="cancelStake"
                />
                <CoinModal
                  v-if="unstakeModalOpening"
                  title="Unstake LP"
                  :coin="lp"
                  :loading="unstaking"
                  @onOk="unstake"
                  @onCancel="cancelUnstake"
                />
                <Col :span="10">
                  <div class="start">
                    <div class="title">Start farming</div>
                    <Button v-if="!wallet.connected" size="large" ghost @click="$store.dispatch('wallet/openModal')">
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
                        Stake LP
                      </Button>
                    </div>
                  </div>
                </Col>
              </Row>
            </CollapsePanel>
          </Collapse>
        </div>
      </div>

      <div class="page-head fs-container">
        <span class="title">Legacy Farms</span>
        <div class="buttons"></div>
      </div>

      <div class="card">
        <div class="card-body">
          <div v-for="farm in farms" :key="farm.farmInfo.poolId" :showArrow="false">
            <template v-if="farm.farmInfo.version === 2">
              <Row class="farm-head" :gutter="0">
                <Col class="lp-icons" :span="8">
                  <div class="icons">
                    <img :src="importIcon(`/coins/${farm.farmInfo.lp.coin.symbol.toLowerCase()}.png`)" />
                    <img :src="importIcon(`/coins/${farm.farmInfo.lp.pc.symbol.toLowerCase()}.png`)" />
                  </div>
                  {{ farm.farmInfo.lp.name }}
                </Col>
                <Col class="state" :span="4">
                  <div class="title">Pending Reward</div>
                  <div class="value">{{ farm.userInfo.pendingReward.format() }}</div>
                </Col>
                <Col class="state" :span="4">
                  <div class="title">Staked</div>
                  <div class="value">
                    {{ farm.userInfo.depositBalance.format() }}
                  </div>
                </Col>
                <Col class="state" :span="4">
                  <div class="title">Apy</div>
                  <div class="value"></div>
                </Col>
                <Col class="fc-container">
                  <Button v-if="!wallet.connected" ghost @click="$store.dispatch('wallet/openModal')">
                    Connect Wallet
                  </Button>
                  <Button v-else ghost @click="$router.replace({ path: '/migrate' })"> Unstake & Migrate </Button>
                </Col>
              </Row>
            </template>
          </div>
        </div>
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
import importIcon from '@/utils/import-icon'
import { TokenAmount } from '@/utils/safe-math'
import { FarmInfo } from '@/utils/farms'
import { deposit, withdraw } from '@/utils/stake'
import { getUnixTs } from '@/utils'

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

  computed: {
    ...mapState(['wallet', 'farm', 'url'])
  },

  watch: {
    'wallet.tokenAccounts': {
      handler(newTokenAccounts: any) {
        // 更新正在操作的 lp 余额
        this.updateCurrentLp(newTokenAccounts)
      },
      deep: true
    },
    // 监听池子状态变动
    'farm.infos': {
      handler() {
        this.updateFarms()
      },
      deep: true
    },
    // 监听钱包信息
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
    importIcon,
    TokenAmount,

    updateFarms() {
      const farms: any = []

      for (const [poolId, farmInfo] of Object.entries(this.farm.infos)) {
        // @ts-ignore
        if (!farmInfo.isStake) {
          let userInfo = get(this.farm.stakeAccounts, poolId)
          // @ts-ignore
          const { rewardPerShareNet } = farmInfo.poolInfo

          if (userInfo) {
            userInfo = cloneDeep(userInfo)

            const { rewardDebt, depositBalance } = userInfo

            const pendingReward = depositBalance.wei
              .multipliedBy(rewardPerShareNet.toNumber())
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
            farmInfo
          })
        }
      }

      this.farms = farms
    },

    // 更新正在移除流动性的币种余额
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

      const conn = (this as any).$conn
      const wallet = (this as any).$wallet

      const lpAccount = get(this.wallet.tokenAccounts, `${this.farmInfo.lp.mintAddress}.tokenAccountAddress`)
      const rewardAccount = get(this.wallet.tokenAccounts, `${this.farmInfo.reward.mintAddress}.tokenAccountAddress`)
      const infoAccount = get(this.farm.stakeAccounts, `${this.farmInfo.poolId}.stakeAccountAddress`)

      const key = getUnixTs()
      ;(this as any).$notify.info({
        key,
        message: 'Making transaction...',
        duration: 0
      })

      deposit(conn, wallet, this.farmInfo, lpAccount, rewardAccount, infoAccount, amount)
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

          const description = `Stake ${amount} ${this.farmInfo.lp.name}`
          this.$store.dispatch('transaction/sub', { txid, description })
        })
        .catch((error) => {
          ;(this as any).$notify.error({
            key,
            message: 'Stake failed',
            description: error.message
          })
        })
        .finally(() => {
          this.staking = false
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

      const conn = (this as any).$conn
      const wallet = (this as any).$wallet

      const lpAccount = get(this.wallet.tokenAccounts, `${this.farmInfo.lp.mintAddress}.tokenAccountAddress`)
      const rewardAccount = get(this.wallet.tokenAccounts, `${this.farmInfo.reward.mintAddress}.tokenAccountAddress`)
      const infoAccount = get(this.farm.stakeAccounts, `${this.farmInfo.poolId}.stakeAccountAddress`)

      const key = getUnixTs()
      ;(this as any).$notify.info({
        key,
        message: 'Making transaction...',
        duration: 0
      })

      withdraw(conn, wallet, this.farmInfo, lpAccount, rewardAccount, infoAccount, amount)
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

          const description = `Unstake ${amount} ${this.farmInfo.lp.name}`
          this.$store.dispatch('transaction/sub', { txid, description })
        })
        .catch((error) => {
          ;(this as any).$notify.error({
            key,
            message: 'Stake failed',
            description: error.message
          })
        })
        .finally(() => {
          this.unstaking = false
        })
    },

    cancelUnstake() {
      this.lp = null
      this.farmInfo = null
      this.unstakeModalOpening = false
    },

    harvest(farmInfo: FarmInfo) {
      this.harvesting = true

      const conn = (this as any).$conn
      const wallet = (this as any).$wallet

      const lpAccount = get(this.wallet.tokenAccounts, `${farmInfo.lp.mintAddress}.tokenAccountAddress`)
      const rewardAccount = get(this.wallet.tokenAccounts, `${farmInfo.reward.mintAddress}.tokenAccountAddress`)
      const infoAccount = get(this.farm.stakeAccounts, `${farmInfo.poolId}.stakeAccountAddress`)

      const key = getUnixTs()
      ;(this as any).$notify.info({
        key,
        message: 'Making transaction...',
        duration: 0
      })

      deposit(conn, wallet, farmInfo, lpAccount, rewardAccount, infoAccount, '0')
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

          const description = `Harvest ${farmInfo.reward.symbol} from ${farmInfo.lp.name}`
          this.$store.dispatch('transaction/sub', { txid, description })
        })
        .catch((error) => {
          ;(this as any).$notify.error({
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
.farm.container {
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
}
</style>

<style lang="less">
.farm {
  .ant-collapse-header,
  .farm-head {
    padding: 24px 32px !important;
  }

  .ant-collapse-content {
    border-top: 1px solid #1c274f;
  }
}
</style>
