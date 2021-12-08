<template>
  <div class="farm container">
    <div class="page-head fs-container">
      <span class="title">Farms</span>
    </div>
    <Row class="controls" :gutter="16">
      <Col :span="isMobile ? 24 : 18">
        <RadioGroup v-model="tab" :class="`radio-button-group ${isMobile ? 'is-mobile' : ''}`">
          <RadioButton :class="`radioButtonStyle bigger ${isMobile ? 'is-mobile' : ''}`" value="All Farms">
            All
          </RadioButton>
          <RadioButton :class="`radioButtonStyle bigger ${isMobile ? 'is-mobile' : ''}`" value="Raydium Farms">
            Raydium
          </RadioButton>
          <RadioButton :class="`radioButtonStyle bigger ${isMobile ? 'is-mobile' : ''}`" value="Fusion Farms">
            Fusion
          </RadioButton>
        </RadioGroup>
      </Col>

      <Col :class="`end-refresh ${isMobile ? 'is-mobile' : ''}`" :span="isMobile ? 12 : 6">
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
      </Col>
    </Row>

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
        <div class="card-body">
          <div class="title-part">
            <div v-if="tab === 'All Farms'" class="title-text">
              <h2 class="main-title">All Farms</h2>
              <div class="main-description">Stake your LP tokens and earn token rewards</div>
            </div>
            <div v-else-if="tab === 'Raydium Farms'" class="title-text">
              <h2 class="main-title">Raydium Farms</h2>
              <div class="main-description">Stake your LP tokens and earn RAY token rewards</div>
            </div>
            <div v-else-if="tab === 'Fusion Farms'" class="title-text">
              <h2 class="main-title">Fusion Farms</h2>
              <div class="main-description">Stake your LP tokens and earn project token rewards</div>
            </div>

            <div class="toggle">
              <label class="label">Staked Only</label>
              <Toggle v-model="onlyStaked" />
            </div>

            <Input v-model="searchText" class="search-input" placeholder="Search by token symbol">
              <Icon slot="prefix" type="search" />
            </Input>

            <span>
              <RadioGroup v-model="poolType" style="display: inline-block; margin: 8px auto">
                <RadioButton class="radioButtonStyle" :value="true"> Active </RadioButton>
                <RadioButton class="radioButtonStyle" :value="false"> Ended </RadioButton>
              </RadioGroup>
            </span>
          </div>
          <Collapse v-model="showCollapse" expand-icon-position="right">
            <CollapsePanel
              v-for="farm in farms.filter(isInSearch).filter(isInTab).filter(canShowByStaked)"
              v-show="
                ((!endedFarmsPoolId.includes(farm.farmInfo.poolId) ||
                  endedFarmsPoolIdWhiteList.includes(farm.farmInfo.poolId)) &&
                  !farm.farmInfo.legacy &&
                  poolType) ||
                (((endedFarmsPoolId.includes(farm.farmInfo.poolId) &&
                  !endedFarmsPoolIdWhiteList.includes(farm.farmInfo.poolId)) ||
                  farm.farmInfo.legacy) &&
                  !poolType)
              "
              :key="farm.farmInfo.poolId"
              :show-arrow="poolType"
            >
              <Row slot="header" class="farm-head" :class="isMobile ? 'is-mobile' : ''" :gutter="0">
                <Col class="lp-icons" :span="isMobile ? 12 : 8">
                  <div class="icons">
                    <CoinIcon :mint-address="farm.farmInfo.lp.coin.mintAddress" />
                    <CoinIcon :mint-address="farm.farmInfo.lp.pc.mintAddress" />
                  </div>
                  {{ isMobile ? farm.farmInfo.lp.symbol : farm.farmInfo.lp.name }}
                  <span v-if="farm.farmInfo.dual" class="dual-tag">DUAL YIELD</span>
                </Col>
                <Col class="state" :span="isMobile ? 6 : 5">
                  <div class="title">{{ isMobile ? 'Reward' : 'Pending Reward' }}</div>
                  <div v-if="farm.farmInfo.fusion" class="value">
                    <div v-if="farm.farmInfo.dual">
                      {{
                        farm.userInfo.pendingReward.format().includes('-') ? 0 : farm.userInfo.pendingReward.format()
                      }}
                      {{ farm.farmInfo.reward.symbol }}
                    </div>
                    <div>
                      {{
                        farm.userInfo.pendingRewardB.format().includes('-') ? 0 : farm.userInfo.pendingRewardB.format()
                      }}
                      {{ farm.farmInfo.rewardB.symbol }}
                    </div>
                  </div>
                  <div v-else class="value">
                    {{ farm.userInfo.pendingReward.format().includes('-') ? 0 : farm.userInfo.pendingReward.format() }}
                    {{ farm.farmInfo.reward.symbol }}
                  </div>
                </Col>
                <Col class="state" :span="isMobile ? 6 : 5">
                  <div class="title">
                    <div>Total Apr</div>
                    <Tooltip>
                      <template slot="title">
                        <div v-if="farm.farmInfo.fusion" class="state" :span="isMobile ? 6 : 5">
                          <div v-if="farm.farmInfo.fees" class="value-s">FEES {{ farm.farmInfo.fees }}%</div>
                          <div class="value-s">
                            <div v-if="farm.farmInfo.dual">
                              {{ farm.farmInfo.reward.symbol }} {{ farm.farmInfo.apr }}%
                            </div>
                            <div>{{ farm.farmInfo.rewardB.symbol }} {{ farm.farmInfo.aprB }}%</div>
                          </div>
                        </div>
                        <div v-else class="state" :span="isMobile ? 6 : 5">
                          <div v-if="farm.farmInfo.fees" class="value-s">FEES {{ farm.farmInfo.fees }}%</div>
                          <div class="value-s">RAY {{ farm.farmInfo.apr }}%</div>
                        </div>
                      </template>
                      <Icon type="question-circle" />
                    </Tooltip>
                  </div>
                  <div class="value">
                    <div v-if="farm.farmInfo.fusion">
                      {{
                        (
                          parseFloat(farm.farmInfo.aprTotal ? farm.farmInfo.aprTotal : 0) +
                          parseFloat(farm.farmInfo.fees ? farm.farmInfo.fees : 0)
                        ).toFixed(2)
                      }}%
                    </div>
                    <div v-else>{{ (parseFloat(farm.farmInfo.fees) + parseFloat(farm.farmInfo.apr)).toFixed(2) }}%</div>
                  </div>
                </Col>
                <Col v-if="!isMobile && poolType" class="state" :span="6">
                  <div class="title">TVL</div>
                  <div class="value">
                    ${{
                      Math.round(farm.farmInfo.liquidityUsdValue)
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    }}
                  </div>
                </Col>
                <Col v-if="!isMobile && !poolType" class="state" :span="4">
                  <Button v-if="!wallet.connected" size="large" ghost @click.stop="$accessor.wallet.openModal">
                    Connect Wallet
                  </Button>
                  <div v-else class="fs-container">
                    <Button
                      :disabled="!wallet.connected || farm.userInfo.depositBalance.isNullOrZero()"
                      size="large"
                      ghost
                      @click.stop="openUnstakeModal(farm.farmInfo, farm.farmInfo.lp, farm.userInfo.depositBalance)"
                    >
                      Harvest & Unstake
                    </Button>
                  </div>
                </Col>
              </Row>

              <Row v-if="poolType" :class="isMobile ? 'is-mobile' : ''" :gutter="48">
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
                      <div v-if="farm.farmInfo.fusion" class="reward">
                        <div v-if="farm.farmInfo.dual" class="token">
                          {{ farm.userInfo.pendingReward.format() }} {{ farm.farmInfo.reward.symbol }}
                        </div>
                        <div class="token">
                          {{ farm.userInfo.pendingRewardB.format() }} {{ farm.farmInfo.rewardB.symbol }}
                        </div>
                      </div>
                      <div v-else class="reward">
                        <div class="token">{{ farm.userInfo.pendingReward.format() }}</div>
                      </div>
                      <Button
                        size="large"
                        ghost
                        :disabled="
                          !wallet.connected ||
                          harvesting ||
                          (farm.farmInfo.fusion
                            ? farm.userInfo.pendingReward.isNullOrZero() && farm.userInfo.pendingRewardB.isNullOrZero()
                            : farm.userInfo.pendingReward.isNullOrZero())
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
                    <template v-if="!wallet.connected">
                      <div class="title">Start farming</div>
                      <Button v-if="!wallet.connected" size="large" ghost @click="$accessor.wallet.openModal">
                        Connect Wallet
                      </Button>
                    </template>
                    <template v-else-if="farm.userInfo.depositBalance.isNullOrZero()">
                      <div class="title">Start farming</div>
                      <Button size="large" ghost @click="openStakeModal(farm.farmInfo, farm.farmInfo.lp)">
                        Stake LP
                      </Button>
                    </template>
                    <template v-else>
                      <div class="title">Your Staked LP</div>
                      <div class="fs-container">
                        <span style="margin-right: auto">
                          {{ farm.userInfo.depositBalance.format() }} <br />(${{
                            (farm.userInfo.depositBalance.toEther() * farm.farmInfo.liquidityItemValue)
                              .toFixed(2)
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                          }})</span
                        >
                        <Button
                          class="unstake"
                          size="large"
                          ghost
                          @click="openUnstakeModal(farm.farmInfo, farm.farmInfo.lp, farm.userInfo.depositBalance)"
                        >
                          <Icon type="minus" />
                        </Button>
                        <Button
                          size="large"
                          style="width: 180px"
                          ghost
                          @click="openStakeModal(farm.farmInfo, farm.farmInfo.lp)"
                        >
                          Stake LP
                        </Button>
                      </div>
                    </template>
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
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import {
  Tooltip,
  Progress,
  Collapse,
  Spin,
  Icon,
  Row,
  Col,
  Button,
  Radio,
  Input,
  Switch as Toggle
} from 'ant-design-vue'

import { get, cloneDeep } from 'lodash-es'
import { TokenAmount } from '@/utils/safe-math'
import { FarmInfo } from '@/utils/farms'
import { depositV4, depositV5, withdrawV4, withdrawV5, deposit, withdraw } from '@/utils/stake'
import { getUnixTs } from '@/utils'
import { getBigNumber } from '@/utils/layouts'

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
    RadioButton,
    Input,
    Toggle
  },

  data() {
    return {
      tab: 'All Farms' as 'All Farms' | 'Raydium Farms' | 'Fusion Farms',
      searchText: '',
      onlyStaked: false,

      farms: [] as any,

      lp: null,
      farmInfo: null as any,
      harvesting: false,
      stakeModalOpening: false,
      staking: false,
      unstakeModalOpening: false,
      unstaking: false,
      poolType: true,
      endedFarmsPoolId: [] as string[],
      endedFarmsPoolIdWhiteList: [
        'BYmeWrwA4ixvJhNrxWzQsA3Fsz6EtUDJTo39WYZ6o1FS',
        '6VNF4rF7ESUohzNeRf3aTg61dyFjbab749RGUHCTDFQL'
      ] as string[],
      showCollapse: [] as any[]
    }
  },

  head: {
    title: 'Raydium Farm'
  },

  computed: {
    ...mapState(['app', 'wallet', 'farm', 'url', 'price', 'liquidity', 'isMobile'])
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
    },
    showCollapse: {
      handler() {
        if (!this.poolType && this.showCollapse.length > 0) {
          this.showCollapse.splice(0, this.showCollapse.length)
        }
      },
      deep: true
    }
  },

  mounted() {
    this.updateFarms()
  },

  methods: {
    TokenAmount,

    async updateFarms() {
      const farms: any[] = []
      const endedFarmsPoolId: string[] = []
      const pools = await this.$api.getPairs()

      for (const [poolId, farmInfo] of Object.entries(this.farm.infos)) {
        const isFusion = Boolean((farmInfo as any).fusion)
        // @ts-ignore
        if (!farmInfo.isStake) {
          let userInfo = get(this.farm.stakeAccounts, poolId)
          // @ts-ignore
          const { rewardPerShareNet, rewardPerBlock, perShare, perBlock, perShareB, perBlockB } = farmInfo.poolInfo
          // @ts-ignore
          const { reward, rewardB, lp } = farmInfo

          // @ts-ignore
          const poolsLp = pools.find((item) => item.lp_mint === lp.mintAddress)

          const newFarmInfo = cloneDeep(farmInfo)

          if (poolsLp) {
            // @ts-ignore
            newFarmInfo.fees = poolsLp.apy
          }

          // for fusion
          if (isFusion && reward && rewardB && lp) {
            const rewardPerBlockAmount = new TokenAmount(getBigNumber(perBlock), reward.decimals)
            const rewardBPerBlockAmount = new TokenAmount(getBigNumber(perBlockB), rewardB.decimals)
            const liquidityItem = get(this.liquidity.infos, lp.mintAddress)

            const rewardPerBlockAmountTotalValue =
              getBigNumber(rewardPerBlockAmount.toEther()) *
              2 *
              60 *
              60 *
              24 *
              365 *
              this.price.prices[reward.symbol as string]
            const rewardBPerBlockAmountTotalValue =
              getBigNumber(rewardBPerBlockAmount.toEther()) *
              2 *
              60 *
              60 *
              24 *
              365 *
              this.price.prices[rewardB.symbol as string]

            const liquidityCoinValue =
              getBigNumber((liquidityItem?.coin.balance as TokenAmount).toEther()) *
              this.price.prices[liquidityItem?.coin.symbol as string]
            const liquidityPcValue =
              getBigNumber((liquidityItem?.pc.balance as TokenAmount).toEther()) *
              this.price.prices[liquidityItem?.pc.symbol as string]

            const liquidityTotalValue = liquidityPcValue + liquidityCoinValue
            const liquidityTotalSupply = getBigNumber((liquidityItem?.lp.totalSupply as TokenAmount).toEther())
            const liquidityItemValue = liquidityTotalValue / liquidityTotalSupply

            const liquidityUsdValue = getBigNumber(lp.balance.toEther()) * liquidityItemValue
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
            // @ts-ignore
            newFarmInfo.liquidityItemValue = liquidityItemValue
            if (
              rewardPerBlockAmount.toEther().toString() === '0' &&
              rewardBPerBlockAmount.toEther().toString() === '0'
            ) {
              endedFarmsPoolId.push(poolId)
            }
          } else if (!isFusion && reward && lp) {
            const rewardPerBlockAmount = new TokenAmount(getBigNumber(rewardPerBlock), reward.decimals)
            const liquidityItem = get(this.liquidity.infos, lp.mintAddress)

            const rewardPerBlockAmountTotalValue =
              getBigNumber(rewardPerBlockAmount.toEther()) *
              2 *
              60 *
              60 *
              24 *
              365 *
              this.price.prices[reward.symbol as string]

            const liquidityCoinValue =
              getBigNumber((liquidityItem?.coin.balance as TokenAmount).toEther()) *
              this.price.prices[liquidityItem?.coin.symbol as string]
            const liquidityPcValue =
              getBigNumber((liquidityItem?.pc.balance as TokenAmount).toEther()) *
              this.price.prices[liquidityItem?.pc.symbol as string]

            const liquidityTotalValue = liquidityPcValue + liquidityCoinValue
            const liquidityTotalSupply = getBigNumber((liquidityItem?.lp.totalSupply as TokenAmount).toEther())
            const liquidityItemValue = liquidityTotalValue / liquidityTotalSupply

            const liquidityUsdValue = getBigNumber(lp.balance.toEther()) * liquidityItemValue
            const apr = ((rewardPerBlockAmountTotalValue / liquidityUsdValue) * 100).toFixed(2)

            // @ts-ignore
            newFarmInfo.apr = apr
            // @ts-ignore
            newFarmInfo.liquidityUsdValue = liquidityUsdValue
            // @ts-ignore
            newFarmInfo.liquidityItemValue = liquidityItemValue

            if (rewardPerBlockAmount.toEther().toString() === '0') {
              endedFarmsPoolId.push(poolId)
            }
          }
          if (isFusion) {
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
                .multipliedBy(getBigNumber(perShare))
                .dividedBy(d)
                .minus(rewardDebt.wei)
              const pendingRewardB = depositBalance.wei
                .multipliedBy(getBigNumber(perShareB))
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
                pendingRewardB: new TokenAmount(0, farmInfo.rewardB?.decimals)
              }
            }
          }
          if (!isFusion) {
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
      const rewardAccountB = get(this.wallet.tokenAccounts, `${this.farmInfo.rewardB?.mintAddress}.tokenAccountAddress`)
      const infoAccount = get(this.farm.stakeAccounts, `${this.farmInfo.poolId}.stakeAccountAddress`)
      const auxiliaryAccounts = get(this.farm.auxiliaryStakeAccounts, `${this.farmInfo.poolId}`) || []

      const key = getUnixTs().toString()
      this.$notify.info({
        key,
        message: 'Making transaction...',
        description: '',
        duration: 0
      })

      const depositPromise =
        this.farmInfo.version === 5
          ? depositV5(
              conn,
              wallet,
              this.farmInfo,
              lpAccount,
              rewardAccount,
              rewardAccountB,
              infoAccount,
              auxiliaryAccounts,
              amount
            )
          : this.farmInfo.version === 4
          ? depositV4(conn, wallet, this.farmInfo, lpAccount, rewardAccount, rewardAccountB, infoAccount, amount)
          : deposit(conn, wallet, this.farmInfo, lpAccount, rewardAccount, infoAccount, amount)

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
      const rewardAccountB = get(this.wallet.tokenAccounts, `${this.farmInfo.rewardB?.mintAddress}.tokenAccountAddress`)
      const infoAccount = get(this.farm.stakeAccounts, `${this.farmInfo.poolId}.stakeAccountAddress`)
      const auxiliaryAccounts = get(this.farm.auxiliaryStakeAccounts, `${this.farmInfo.poolId}`) || []

      const key = getUnixTs().toString()
      this.$notify.info({
        key,
        message: 'Making transaction...',
        description: '',
        duration: 0
      })

      const withdrawPromise =
        this.farmInfo.version === 5
          ? withdrawV5(
              conn,
              wallet,
              this.farmInfo,
              lpAccount,
              rewardAccount,
              rewardAccountB,
              infoAccount,
              auxiliaryAccounts,
              amount
            )
          : this.farmInfo.version === 4
          ? withdrawV4(conn, wallet, this.farmInfo, lpAccount, rewardAccount, rewardAccountB, infoAccount, amount)
          : withdraw(conn, wallet, this.farmInfo, lpAccount, rewardAccount, infoAccount, amount)

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
      const rewardAccountB = get(this.wallet.tokenAccounts, `${farmInfo.rewardB?.mintAddress}.tokenAccountAddress`)
      const infoAccount = get(this.farm.stakeAccounts, `${farmInfo.poolId}.stakeAccountAddress`)
      const isFusion = Boolean(farmInfo.fusion)
      const auxiliaryAccounts = get(this.farm.auxiliaryStakeAccounts, `${farmInfo.poolId}`) || []

      const key = getUnixTs().toString()
      this.$notify.info({
        key,
        message: 'Making transaction...',
        description: '',
        duration: 0
      })

      const depositPromise =
        farmInfo.version === 5
          ? depositV5(
              conn,
              wallet,
              farmInfo,
              lpAccount,
              rewardAccount,
              rewardAccountB,
              infoAccount,
              auxiliaryAccounts,
              '0'
            )
          : farmInfo.version === 4
          ? depositV4(conn, wallet, farmInfo, lpAccount, rewardAccount, rewardAccountB, infoAccount, '0')
          : deposit(conn, wallet, farmInfo, lpAccount, rewardAccount, infoAccount, '0')

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
          // @ts-ignore
          const description = isFusion
            ? `Harvest ${farmInfo.reward.symbol} and ${farmInfo.rewardB ? farmInfo.rewardB.symbol : ''} from ${
                farmInfo.lp.name
              }`
            : `Harvest ${farmInfo.reward.symbol} from ${farmInfo.lp.name}`
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
    },
    isInSearch({ farmInfo: { name } }: { farmInfo: FarmInfo }) {
      if (!this.searchText) return true
      const loweredSearchText = this.searchText.toLowerCase()
      const loweredFarmName = name.toLowerCase()
      return loweredFarmName.includes(loweredSearchText)
      // return [...loweredSearchText].every((char) => loweredFarmName.includes(char))
    },
    isInTab({ farmInfo: { fusion } }: { farmInfo: FarmInfo }) {
      if (this.tab === 'All Farms') return true
      if (this.tab === 'Raydium Farms' && !fusion) return true
      if (this.tab === 'Fusion Farms' && fusion) return true
      return false
    },
    canShowByStaked({ userInfo: { depositBalance } }: { userInfo: { depositBalance: any } }) {
      if (!this.onlyStaked) return true
      return !depositBalance.isNullOrZero()
    }
  }
})
</script>

<style lang="less" scoped>
::-webkit-scrollbar {
  display: none; /* Chrome Safari */
}
.card-body {
  padding: 0;
  margin: 0;
}
.farm.container {
  max-width: 1200px;

  .controls {
    .end-refresh {
      justify-content: flex-end;
      display: flex;
      align-items: center;
      margin-bottom: 16px;
      &.is-mobile {
        justify-content: flex-start;
      }
    }
    .radio-button-group {
      width: 480px;
      margin-right: auto;
      margin-bottom: 16px;
      &.is-mobile {
        width: 100%;
      }
    }
  }

  .card {
    .card-body {
      padding: 0;
      overflow-x: scroll;
      scrollbar-width: none;
      -ms-overflow-style: none;

      .title-part {
        display: flex;
        flex-wrap: wrap;
        row-gap: 8px;
        align-items: center;
        padding: 16px 24px;

        .title-text {
          margin-right: auto;
        }

        .toggle {
          display: flex;
          align-items: center;
          margin-right: 14px;
          .label {
            white-space: nowrap;
            margin-right: 8px;
            opacity: 0.8;
          }
        }

        .search-input {
          width: 248px;
          margin-right: 16px;
        }
      }

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
      .dual-tag {
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
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .value {
        font-size: 16px;
        line-height: 24px;
      }

      .value-s {
        font-size: 12px;
        line-height: 24px;
      }

      .title-s {
        font-size: 16px;
        text-transform: uppercase;
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

  &.bigger {
    height: 42px;
    line-height: 40px;
    width: 33.3333%;
    font-size: 1.2em;
    &.is-mobile {
      font-size: 1.1em;
      height: 34px;
      line-height: 32px;
    }
  }
}
</style>

<style lang="less">
.farm {
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
.ant-collapse-content > .ant-collapse-content-box {
  padding-left: 32px;
}
</style>
