<template>
  <div class="fusion container">
    <div class="page-head fs-container">
      <span class="title"> Fusion Pools </span>
      <div class="buttons">
        <span>
          <RadioGroup v-model="poolType" style="display: inline-block; margin: 0 auto; padding-right: 30px">
            <RadioButton class="radioButtonStyle" :value="true"> Active </RadioButton>
            <RadioButton class="radioButtonStyle" :value="false"> Ended </RadioButton>
          </RadioGroup>
        </span>
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
            @click="$accessor.farm.requestInfos"
          />
        </Tooltip>
      </div>
    </div>

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

    <div v-if="farm.initialized">
      <div class="card">
        <div class="card-body" style="background: #000829">
          <Collapse expand-icon-position="right">
            <CollapsePanel
              v-for="farm in farms"
              v-show="
                !farm.farmInfo.legacy &&
                ((!endedFarmsPoolId.includes(farm.farmInfo.poolId) && poolType) ||
                  (endedFarmsPoolId.includes(farm.farmInfo.poolId) && !poolType))
              "
              :key="farm.farmInfo.poolId"
            >
              <Row slot="header" class="farm-head" :class="isMobile ? 'is-mobile' : ''" :gutter="0">
                <Col class="lp-icons" :span="isMobile ? 12 : 8">
                  <div class="icons">
                    <CoinIcon :mint-address="farm.farmInfo.lp.coin.mintAddress" />
                    <CoinIcon :mint-address="farm.farmInfo.lp.pc.mintAddress" />
                  </div>
                  {{ isMobile ? farm.farmInfo.lp.symbol : farm.farmInfo.lp.name }}

                  <span v-if="farm.farmInfo.dual" class="tag">DUAL YIELD</span>
                </Col>
                <Col class="state" :span="isMobile ? 6 : 4">
                  <div class="title">{{ isMobile ? 'Reward' : 'Pending Reward' }}</div>
                  <div class="value">
                    <div v-if="farm.farmInfo.dual">
                      {{ farm.userInfo.pendingReward.format() }} {{ farm.farmInfo.reward.symbol }}
                    </div>
                    <div>{{ farm.userInfo.pendingRewardB.format() }} {{ farm.farmInfo.rewardB.symbol }}</div>
                  </div>
                </Col>
                <Col v-if="!isMobile" class="state" :span="4">
                  <div class="title">Staked</div>
                  <div class="value">
                    {{ farm.userInfo.depositBalance.format() }}
                  </div>
                </Col>
                <Col class="state" :span="isMobile ? 6 : 4">
                  <div class="title">Total Apr {{ farm.farmInfo.aprTotal }}%</div>
                  <div class="value">
                    <div v-if="farm.farmInfo.dual">{{ farm.farmInfo.reward.symbol }} {{ farm.farmInfo.apr }}%</div>
                    <div>{{ farm.farmInfo.rewardB.symbol }} {{ farm.farmInfo.aprB }}%</div>
                  </div>
                </Col>
                <Col v-if="!isMobile" class="state" :span="4">
                  <div class="title">Liquidity</div>
                  <div class="value">
                    ${{
                      Math.round(farm.farmInfo.liquidityUsdValue)
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    }}
                  </div>
                </Col>
              </Row>

              <Row :class="isMobile ? 'is-mobile' : ''" :gutter="48">
                <Col :span="isMobile ? 24 : 4">
                  <p>Add liquidity:</p>
                  <NuxtLink
                    :to="`/liquidity/?from=${farm.farmInfo.lp.coin.mintAddress}&to=${farm.farmInfo.lp.pc.mintAddress}`"
                  >
                    {{ farm.farmInfo.lp.name }}
                  </NuxtLink>
                </Col>

                <Col :span="isMobile ? 24 : 10">
                  <div class="harvest">
                    <div class="title">Pending Rewards</div>
                    <div class="pending fs-container">
                      <div class="reward">
                        <div v-if="farm.farmInfo.dual" class="token">
                          {{ farm.userInfo.pendingReward.format() }} {{ farm.farmInfo.reward.symbol }}
                        </div>
                        <div class="token">
                          {{ farm.userInfo.pendingRewardB.format() }} {{ farm.farmInfo.rewardB.symbol }}
                        </div>
                      </div>
                      <Button
                        size="large"
                        ghost
                        :disabled="
                          !wallet.connected ||
                          harvesting ||
                          (farm.userInfo.pendingReward.isNullOrZero() && farm.userInfo.pendingRewardB.isNullOrZero())
                        "
                        :loading="harvesting"
                        @click="harvest(farm.farmInfo)"
                      >
                        Harvest
                      </Button>
                    </div>
                  </div>
                </Col>

                <Col :span="isMobile ? 24 : 10">
                  <div class="start">
                    <div class="title">Start farming</div>
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
        <span class="title">Legacy</span>
        <div class="buttons"></div>
      </div>

      <div class="card">
        <div class="card-body">
          <template v-for="farm in farms">
            <Row
              v-if="farm.farmInfo.legacy"
              :key="farm.farmInfo.poolId"
              class="farm-head"
              :class="isMobile ? 'is-mobile' : ''"
              :gutter="0"
            >
              <Col class="lp-icons" :span="isMobile ? 12 : 8">
                <div class="icons">
                  <CoinIcon :mint-address="farm.farmInfo.lp.coin.mintAddress" />
                  <CoinIcon :mint-address="farm.farmInfo.lp.pc.mintAddress" />
                </div>
                {{ isMobile ? farm.farmInfo.lp.symbol : farm.farmInfo.lp.name }}
              </Col>
              <Col v-if="!isMobile" class="state" :span="4">
                <div class="title">{{ isMobile ? 'Reward' : 'Pending Reward' }}</div>
                <div class="value">
                  <div>{{ farm.userInfo.pendingReward.format() }} {{ farm.farmInfo.reward.symbol }}</div>
                  <div>{{ farm.userInfo.pendingRewardB.format() }} {{ farm.farmInfo.rewardB.symbol }}</div>
                </div>
              </Col>
              <Col v-if="!isMobile" class="state" :span="4">
                <div class="title">Staked</div>
                <div class="value">
                  {{ farm.userInfo.depositBalance.format() }}
                </div>
              </Col>
              <Col v-if="!isMobile" class="state" :span="4">
                <div class="title">Total Apr {{ farm.farmInfo.aprTotal }}%</div>
                <div class="value">
                  <div>{{ farm.farmInfo.reward.symbol }} {{ farm.farmInfo.apr }}%</div>
                  <div>{{ farm.farmInfo.rewardB.symbol }} {{ farm.farmInfo.aprB }}%</div>
                </div>
              </Col>
              <Col class="fc-container" :span="isMobile ? 12 : 4">
                <Button v-if="!wallet.connected" ghost @click="$accessor.wallet.openModal"> Connect Wallet </Button>
                <Button
                  v-else
                  ghost
                  @click="openUnstakeModal(farm.farmInfo, farm.farmInfo.lp, farm.userInfo.depositBalance)"
                >
                  Unstake & Harvest
                </Button>
              </Col>
            </Row>
          </template>
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
import { Tooltip, Progress, Collapse, Spin, Icon, Row, Col, Button, Radio } from 'ant-design-vue'

import { get, cloneDeep } from 'lodash-es'
import { TokenAmount } from '@/utils/safe-math'
import { FarmInfo } from '@/utils/farms'
import { depositV4, withdrawV4 } from '@/utils/stake'
import { getUnixTs } from '@/utils'

const CollapsePanel = Collapse.Panel

const RadioGroup = Radio.Group
const RadioButton = Radio.Button

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
    Button,
    RadioGroup,
    RadioButton
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
      unstaking: false,
      poolType: true,
      endedFarmsPoolId: [] as string[]
    }
  },

  head: {
    title: 'Raydium Fusion'
  },

  computed: {
    ...mapState(['wallet', 'farm', 'url', 'price', 'liquidity'])
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
      const endedFarmsPoolId: string[] = []

      for (const [poolId, farmInfo] of Object.entries(this.farm.infos)) {
        // @ts-ignore
        if (!farmInfo.isStake && [4, 5].includes(farmInfo.version) && farmInfo.fusion) {
          let userInfo = get(this.farm.stakeAccounts, poolId)
          // @ts-ignore
          const { perShare, perBlock, perShareB, perBlockB } = farmInfo.poolInfo
          // @ts-ignore
          const { reward, rewardB, lp } = farmInfo

          const newFarmInfo = cloneDeep(farmInfo)

          if (reward && rewardB && lp) {
            const rewardPerBlockAmount = new TokenAmount(perBlock.toNumber(), reward.decimals)
            const rewardBPerBlockAmount = new TokenAmount(perBlockB.toNumber(), rewardB.decimals)
            const liquidityItem = get(this.liquidity.infos, lp.mintAddress)

            const rewardPerBlockAmountTotalValue =
              rewardPerBlockAmount.toEther().toNumber() *
              2 *
              60 *
              60 *
              24 *
              365 *
              this.price.prices[reward.symbol as string]
            const rewardBPerBlockAmountTotalValue =
              rewardBPerBlockAmount.toEther().toNumber() *
              2 *
              60 *
              60 *
              24 *
              365 *
              this.price.prices[rewardB.symbol as string]

            const liquidityCoinValue =
              (liquidityItem?.coin.balance as TokenAmount).toEther().toNumber() *
              this.price.prices[liquidityItem?.coin.symbol as string]
            const liquidityPcValue =
              (liquidityItem?.pc.balance as TokenAmount).toEther().toNumber() *
              this.price.prices[liquidityItem?.pc.symbol as string]

            const liquidityTotalValue = liquidityPcValue + liquidityCoinValue
            const liquidityTotalSupply = (liquidityItem?.lp.totalSupply as TokenAmount).toEther().toNumber()
            const liquidityItemValue = liquidityTotalValue / liquidityTotalSupply

            const liquidityUsdValue = lp.balance.toEther().toNumber() * liquidityItemValue
            const apr = ((rewardPerBlockAmountTotalValue / liquidityUsdValue) * 100).toFixed(2)
            const aprB = ((rewardBPerBlockAmountTotalValue / liquidityUsdValue) * 100).toFixed(2)
            const aprTotal = (
              (rewardPerBlockAmountTotalValue / liquidityUsdValue) * 100 +
              (rewardBPerBlockAmountTotalValue / liquidityUsdValue) * 100
            ).toFixed(2)

            // @ts-ignore
            newFarmInfo.apr = apr
            // @ts-ignore
            newFarmInfo.aprB = aprB
            // @ts-ignore
            newFarmInfo.aprTotal = aprTotal
            // @ts-ignore
            newFarmInfo.liquidityUsdValue = liquidityUsdValue
            if (
              rewardPerBlockAmount.toEther().toString() === '0' &&
              rewardBPerBlockAmount.toEther().toString() === '0'
            ) {
              endedFarmsPoolId.push(poolId)
            }
          }

          if (userInfo) {
            userInfo = cloneDeep(userInfo)

            const { rewardDebt, rewardDebtB, depositBalance } = userInfo

            let d = 0
            // @ts-ignore
            if (newFarmInfo.version === 5) {
              d = 1e15
            } else {
              d = 1e9
            }
            const pendingReward = depositBalance.wei
              .multipliedBy(perShare.toNumber())
              .dividedBy(d)
              .minus(rewardDebt.wei)
            const pendingRewardB = depositBalance.wei
              .multipliedBy(parseInt(perShareB.toString()))
              .dividedBy(d)
              .minus(rewardDebtB.wei)

            userInfo.pendingReward = new TokenAmount(pendingReward, rewardDebt.decimals)
            userInfo.pendingRewardB = new TokenAmount(pendingRewardB, rewardDebtB.decimals)
          } else {
            userInfo = {
              // @ts-ignore
              depositBalance: new TokenAmount(0, farmInfo.lp.decimals),
              // @ts-ignore
              pendingReward: new TokenAmount(0, farmInfo.reward.decimals),
              // @ts-ignore
              pendingRewardB: new TokenAmount(0, farmInfo.rewardB.decimals)
            }
          }

          farms.push({
            userInfo,
            farmInfo: newFarmInfo
          })
        }
      }

      this.farms = farms
      this.endedFarmsPoolId = endedFarmsPoolId
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
      const rewardAccountB = get(this.wallet.tokenAccounts, `${this.farmInfo.rewardB.mintAddress}.tokenAccountAddress`)
      const infoAccount = get(this.farm.stakeAccounts, `${this.farmInfo.poolId}.stakeAccountAddress`)

      const key = getUnixTs().toString()
      this.$notify.info({
        key,
        message: 'Making transaction...',
        description: '',
        duration: 0
      })

      depositV4(conn, wallet, this.farmInfo, lpAccount, rewardAccount, rewardAccountB, infoAccount, amount)
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

          const description = `Stake ${amount} ${this.farmInfo.lp.name}`
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
          this.stakeModalOpening = false
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
      const rewardAccountB = get(this.wallet.tokenAccounts, `${this.farmInfo.rewardB.mintAddress}.tokenAccountAddress`)
      const infoAccount = get(this.farm.stakeAccounts, `${this.farmInfo.poolId}.stakeAccountAddress`)

      const key = getUnixTs().toString()
      this.$notify.info({
        key,
        message: 'Making transaction...',
        description: '',
        duration: 0
      })

      withdrawV4(conn, wallet, this.farmInfo, lpAccount, rewardAccount, rewardAccountB, infoAccount, amount)
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

          const description = `Unstake ${amount} ${this.farmInfo.lp.name}`
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
          this.unstakeModalOpening = false
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
      // @ts-ignore
      const rewardAccountB = get(this.wallet.tokenAccounts, `${farmInfo.rewardB.mintAddress}.tokenAccountAddress`)
      const infoAccount = get(this.farm.stakeAccounts, `${farmInfo.poolId}.stakeAccountAddress`)

      const key = getUnixTs().toString()
      this.$notify.info({
        key,
        message: 'Making transaction...',
        description: '',
        duration: 0
      })

      depositV4(conn, wallet, farmInfo, lpAccount, rewardAccount, rewardAccountB, infoAccount, '0')
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
          // @ts-ignore
          const description = `Harvest ${farmInfo.reward.symbol} and ${farmInfo.rewardB.symbol} from ${farmInfo.lp.name}`
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
::-webkit-scrollbar {
  display: none; /* Chrome Safari */
}
.pool-filter {
  padding-bottom: 5px;
  margin-left: 10px;
  border: 1px solid #ccc;
}
.pool-filter-select {
  background: rgb(37, 41, 97);
  color: #fff;
  padding-top: 10px;
  padding-bottom: 5px;
  height: 37px;
  font-weight: bold;
  border: 1px solid #ccc;
}
.pool-filter-unselect {
  background: transparent;
  border: transparent;
  padding-top: 10px;
  padding-bottom: 5px;
  height: 37px;
  font-weight: bold;
  color: #ccc;
}
.pool-filter-select:hover {
  color: #fff;
}
.pool-filter-unselect:hover {
  color: #ccc;
}

.fusion.container {
  max-width: 1200px;

  .card {
    .card-body {
      padding: 0;
      overflow-x: scroll;
      background: #131a35;
      scrollbar-width: none;
      -ms-overflow-style: none;

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
      .tag {
        margin-left: 8px;
        padding: 0 7px;
        font-size: 10px;
        color: #c200fb;
        border: 1px solid #c200fb;
        border-radius: 4px;
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

  .farm-head.is-mobile {
    padding: 24px 16px !important;
  }

  .is-mobile {
    .harvest,
    .start {
      margin-top: 16px;
    }
  }

  p {
    margin-bottom: 0;
  }
}
.radioButtonStyle {
  width: 50%;
  text-align: center;
}
</style>

<style lang="less">
.fusion {
  .farm-head {
    padding: 24px 32px !important;
  }

  .ant-collapse-header {
    padding: 0 !important;

    .farm-head {
      padding: 24px 32px !important;
    }
  }

  .ant-collapse-content {
    border-top: 1px solid #1c274f;
  }
}

.ant-alert-warning {
  width: 500px;
  margin-top: 30px;
  background-color: transparent;
  border: 1px solid #85858d;

  .anticon-close {
    color: #fff;
  }
}

.ant-table-thead > tr > th.ant-table-column-sort {
  background: transparent;
}
.ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled) {
  color: #fff;
  background: #1c274f;
  border: 1px solid #d9d9d9;
  box-shadow: none;
  border-left-width: 0;
}
.ant-radio-button-wrapper {
  color: #aaa;
  background: transparent;
  // border: 1px solid #d9d9d9;
}
.ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled):hover {
  border: 1px solid #d9d9d9;
  box-shadow: none;
}
.ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled):first-child {
  border: 1px solid #d9d9d9;
}
</style>
