<template>
  <div class="auto-farm container">
    <div class="page-head fs-container">
      <span class="title">Auto Farm (beta)</span>
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
            @click="updateAll"
          />
        </Tooltip>
      </div>
    </div>
    <div class="description">
      <div>
        <span>This experimental feature does auto harvesting & staking and all the steps in between.</span>
        <br />
        <h3>Steps:</h3>
        <ol>
          <li>Harvest Pool</li>
          <li>Provide Liquidity</li>
          <li>Stake LP</li>
        </ol>
        <p>
          Just hit the "Auto Farm" button to execute everything for you. You just need to confirm the TXs in your wallet
          as usual.
        </p>
        <p>
          <i>This page will not swap anything automatically, you need to swap manually, to avoid any unwanted swaps.</i>
        </p>
      </div>
    </div>

    <CoinModal
      v-if="stakeModalOpening"
      title="Stake LP"
      :coin="lp"
      :loading="staking"
      :set-max-on-init="true"
      @onOk="stake"
      @onCancel="cancelStake"
    />

    <div v-if="farm.initialized">
      <div class="card">
        <div class="card-body">
          <Collapse expand-icon-position="right">
            <CollapsePanel
              v-for="farm in farms"
              v-show="!farm.farmInfo.legacy && !farm.userInfo.pendingRewardB.isNullOrZero()"
              :key="farm.farmInfo.poolId"
            >
              <Row slot="header" class="farm-head" :class="isMobile ? 'is-mobile' : ''" :gutter="0">
                <Col class="lp-icons" :span="isMobile ? 12 : 8">
                  <div class="icons">
                    <img :src="importIcon(`/coins/${farm.farmInfo.lp.coin.symbol.toLowerCase()}.png`)" />
                    <img :src="importIcon(`/coins/${farm.farmInfo.lp.pc.symbol.toLowerCase()}.png`)" />
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
                <Col :span="isMobile ? 24 : 6">
                  <div class="harvest">
                    <div class="title">Pending Rewards</div>
                    <div class="pending">
                      <div class="reward">
                        <div v-if="farm.farmInfo.dual" class="token">
                          {{ farm.userInfo.pendingReward.format() }} {{ farm.farmInfo.reward.symbol }}
                        </div>
                        <div class="token">
                          {{ farm.userInfo.pendingRewardB.format() }} {{ farm.farmInfo.rewardB.symbol }}
                        </div>
                      </div>
                      <br />
                      <Button
                        size="large"
                        ghost
                        block
                        :disabled="
                          !wallet.connected ||
                          harvesting ||
                          (farm.userInfo.pendingReward.isNullOrZero() && farm.userInfo.pendingRewardB.isNullOrZero())
                        "
                        :loading="harvesting"
                        @click="harvest(farm.farmInfo)"
                      >
                        Auto Farm
                      </Button>
                    </div>
                  </div>
                </Col>

                <Col :span="isMobile ? 24 : 9">
                  <Swap
                    :from-coin-mint-address="farm.farmInfo.lp.coin.mintAddress"
                    :to-coin-mint-address="farm.farmInfo.lp.pc.mintAddress"
                  />
                </Col>

                <Col :span="isMobile ? 24 : 9">
                  <LiquidityProvider
                    :from-coin-mint-address="farm.farmInfo.lp.coin.mintAddress"
                    :to-coin-mint-address="farm.farmInfo.lp.pc.mintAddress"
                    should-set-max-on-init
                    :trigger-lower-balance-coin-to-max="
                      triggerLowerBalanceCoinToMax[
                        `${farm.farmInfo.lp.coin.mintAddress}_${farm.farmInfo.lp.pc.mintAddress}`
                      ]
                    "
                    :trigger-supply-l-p="
                      triggerSupplyLP[`${farm.farmInfo.lp.coin.mintAddress}_${farm.farmInfo.lp.pc.mintAddress}`]
                    "
                    @onError="onLiquidityProvidingError"
                    @onLiquidityAdded="onLiquidityAdded"
                  />

                  <br />

                  <div class="start">
                    <div class="title">Start farming</div>
                    <div>LP: {{ getUserBalanceByFarmInfo(farm.farmInfo).fixed() }}</div>
                    <br />
                    <div class="fs-container">
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
    </div>

    <div v-else class="fc-container">
      <Spin :spinning="true">
        <Icon slot="indicator" type="loading" style="font-size: 24px" spin />
      </Spin>
    </div>

    <div v-if="!wallet.connected">
      <br />
      <Button ghost @click="$accessor.wallet.openModal">
        <Icon type="wallet" />
        Connect Wallet
      </Button>
    </div>

    <div class="history">
      <div class="title">TX History</div>
      <div v-for="(tx, index) in reverseHistory" :key="index">
        <span>Status: {{ tx.s }} | {{ new Date(tx.t).toISOString() }}</span>
        |
        <a :href="`${url.explorer}/tx/${index}`" target="_blank">{{ tx.d }}</a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapGetters, mapState } from 'vuex'
import { Button, Col, Collapse, Icon, Progress, Row, Spin, Tooltip } from 'ant-design-vue'
import LiquidityProvider from '@/components/LiquidityProvider.vue'
import Swap from '@/components/Swap.vue'

import { cloneDeep, get } from 'lodash-es'
import importIcon from '@/utils/import-icon'
import { isNullOrZero, TokenAmount } from '@/utils/safe-math'
import { FarmInfo } from '@/utils/farms'
import { depositV4 } from '@/utils/stake'
import { getUnixTs, sleep } from '@/utils'
import logger from '@/utils/logger'

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
    Button,
    LiquidityProvider,
    Swap
  },

  data() {
    return {
      isMobile: false,

      farms: [] as { farmInfo: FarmInfo; userInfo: any }[],

      lp: null as any,
      farmInfo: null as any,
      harvesting: false,
      stakeModalOpening: false,
      staking: false,
      unstakeModalOpening: false,
      unstaking: false,

      triggerLowerBalanceCoinToMax: {} as any,
      triggerSupplyLP: {} as any
    }
  },

  head: {
    title: 'Raydium Auto Farm'
  },

  computed: {
    ...mapState(['wallet', 'farm', 'url', 'price', 'liquidity', 'transaction']),
    ...mapGetters('transaction', ['reverseHistory'])
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
    importIcon,
    TokenAmount,

    updateFarms() {
      const farms: any = []

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

    changeTriggerLowerBalanceCoinToMax(farmInfo: FarmInfo) {
      const lpCoinMintAddress = farmInfo.lp.coin && farmInfo.lp.coin.mintAddress
      const lpPcMintAddress = farmInfo.lp.pc && farmInfo.lp.pc.mintAddress
      if (!this.triggerLowerBalanceCoinToMax[`${lpCoinMintAddress}_${lpPcMintAddress}`]) {
        this.triggerLowerBalanceCoinToMax[`${lpCoinMintAddress}_${lpPcMintAddress}`] = true
      } else {
        this.triggerLowerBalanceCoinToMax[`${lpCoinMintAddress}_${lpPcMintAddress}`] = !this
          .triggerLowerBalanceCoinToMax[`${lpCoinMintAddress}_${lpPcMintAddress}`]
      }
    },

    changeTriggerSupplyLP(farmInfo: FarmInfo) {
      const lpCoinMintAddress = farmInfo.lp.coin && farmInfo.lp.coin.mintAddress
      const lpPcMintAddress = farmInfo.lp.pc && farmInfo.lp.pc.mintAddress
      if (!this.triggerSupplyLP[`${lpCoinMintAddress}_${lpPcMintAddress}`]) {
        this.triggerSupplyLP[`${lpCoinMintAddress}_${lpPcMintAddress}`] = true
      } else {
        this.triggerSupplyLP[`${lpCoinMintAddress}_${lpPcMintAddress}`] = !this.triggerSupplyLP[
          `${lpCoinMintAddress}_${lpPcMintAddress}`
        ]
      }
    },

    getUserBalanceByFarmInfo(farmInfo: FarmInfo): TokenAmount {
      return get(this.wallet.tokenAccounts, `${farmInfo.lp.mintAddress}.balance`) || new TokenAmount(0)
    },

    openStakeModal(farmInfo: FarmInfo, lp: any) {
      const coin = cloneDeep(lp)
      const lpBalance = this.getUserBalanceByFarmInfo(farmInfo)
      coin.balance = lpBalance

      this.lp = coin
      this.farmInfo = cloneDeep(farmInfo)

      this.stakeModalOpening = true
    },

    stake(amount: string) {
      this.staking = true

      // logger('stake', amount, JSON.stringify(this.farmInfo))

      const conn = this.$web3
      const wallet = (this as any).$wallet

      const lpAccount = get(this.wallet.tokenAccounts, `${this.farmInfo.lp.mintAddress}.tokenAccountAddress`)
      const rewardAccount = get(this.wallet.tokenAccounts, `${this.farmInfo.reward.mintAddress}.tokenAccountAddress`)
      const rewardAccountB = get(this.wallet.tokenAccounts, `${this.farmInfo.rewardB.mintAddress}.tokenAccountAddress`)
      const infoAccount = get(this.farm.stakeAccounts, `${this.farmInfo.poolId}.stakeAccountAddress`)

      const key = getUnixTs().toString()
      this.$notify.info({
        key,
        message: 'Making stake transaction...',
        description: '',
        duration: 0
      })

      logger(
        'stake',
        JSON.stringify({ farmInfo: this.farmInfo, lpAccount, rewardAccount, rewardAccountB, infoAccount, amount })
      )

      depositV4(conn, wallet, this.farmInfo, lpAccount, rewardAccount, rewardAccountB, infoAccount, amount)
        .then(async (txid) => {
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
          await this.$accessor.transaction.sub({ txid, description })
        })
        .catch((error) => {
          this.$notify.error({
            key,
            message: 'Stake failed',
            description: error.message,
            duration: 0
          })
        })
        .finally(async () => {
          this.staking = false
          this.harvesting = false
          this.cancelStake()

          await this.updateAll()
        })
    },

    async updateAll(): Promise<void> {
      // update wallet
      await this.$accessor.wallet.getTokenAccounts()
      await this.$accessor.farm.requestInfos()
      await sleep(1000)
      // update liquidity max
      this.farms.forEach((farm: { farmInfo: FarmInfo }) => {
        this.changeTriggerLowerBalanceCoinToMax(farm.farmInfo)
      })
    },

    cancelStake() {
      this.lp = null
      this.farmInfo = null
      this.stakeModalOpening = false
    },

    harvest(farmInfo: FarmInfo) {
      // logger('harvest farmInfo', JSON.stringify(farmInfo, null, 2))

      this.farmInfo = cloneDeep(farmInfo)

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
        message: 'Making harvest transaction...',
        description: '',
        duration: 0
      })

      depositV4(conn, wallet, farmInfo, lpAccount, rewardAccount, rewardAccountB, infoAccount, '0')
        .then(async (txid) => {
          this.$notify.info({
            key,
            message: 'Transaction has been sent',
            description: (h: any) =>
              h('div', [
                'Confirmation is in progress.  Check your transaction on ',
                h('a', { attrs: { href: `${this.url.explorer}/tx/${txid}`, target: '_blank' } }, 'here')
              ]),
            duration: 10
          })
          // @ts-ignore
          const description = `Harvest ${farmInfo.reward.symbol} and ${farmInfo.rewardB.symbol} from ${farmInfo.lp.name}`
          await this.$accessor.transaction.sub({ txid, description })
          // wait till confirmed ^

          await sleep(1000)

          // trigger supply LP
          this.changeTriggerSupplyLP(farmInfo)
        })
        .catch((error) => {
          logger('harvest error', error)
          this.$notify.error({
            key,
            message: 'Harvest failed',
            description: error.message,
            duration: 0
          })
        })
        .finally(() => {
          this.harvesting = false
        })
    },

    onLiquidityProvidingError(error: Error) {
      logger('onLiquidityProvidingError', error)
      this.$notify.error({
        key: getUnixTs().toString(),
        message: 'Auto Farm failed',
        description: error.message || error.toString(),
        duration: 0
      })
      this.harvesting = false
    },

    async onLiquidityAdded(tx: {
      txid: string
      description: string
      fromCoinAmount: string
      fromCoinSymbol: string
      toCoinAmount: string
      toCoinSymbol: string
      farmInfo: FarmInfo
    }) {
      // logger('onLiquidityAdded', JSON.stringify(tx, null, 2))
      await sleep(1500)

      // update wallet
      await this.updateAll()

      // the farmInfo provided by LiqudityProvider has no rewards* in it, so we look it up here
      const farmInfo = this.findFarmInfoByMintAddress(tx.farmInfo.lp.mintAddress)

      if (!farmInfo) {
        this.$notify.error({
          key: getUnixTs().toString(),
          message: 'Stake not possible',
          description: 'Farm not found: ' + tx.farmInfo.lp.name,
          duration: 0
        })
        return
      }

      // logger('found farm info', JSON.stringify(farmInfo))

      this.openStakeModal(farmInfo, farmInfo.lp)

      await sleep(1000)

      if (!this.lp || isNullOrZero(this.lp.balance.fixed())) {
        this.$notify.error({
          key: getUnixTs().toString(),
          message: 'Stake not possible',
          description: 'No LP tokens in your account',
          duration: 0
        })
        return
      }

      this.stake(this.lp.balance.fixed())
    },

    findFarmInfoByMintAddress(mintAddress: string): FarmInfo | undefined {
      // important: exclude legacy farms
      const farm = this.farms.find(
        (farm: { farmInfo: FarmInfo }) => !farm.farmInfo.legacy && farm.farmInfo.lp.mintAddress === mintAddress
      )
      return farm && farm.farmInfo
    }
  }
})
</script>

<style lang="less" scoped>
.auto-farm.container {
  max-width: 1200px;

  .page-head {
    margin-bottom: 20px;
  }

  .description {
    margin-bottom: 20px;
  }

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
        //font-weight: 600;
        //font-size: 20px;
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

  .history {
    margin-top: 40px;

    .title {
      font-size: 20px;
      margin-bottom: 10px;
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
</style>

<style lang="less">
.auto-farm {
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
</style>
