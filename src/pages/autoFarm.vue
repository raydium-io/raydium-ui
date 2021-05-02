<template>
  <div class="auto-farm container">
    <div class="page-head fs-container">
      <span class="title">Auto Farm</span>
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
            @click="$accessor.farm.requestInfos"
          />
        </Tooltip>
      </div>
    </div>
    <div class="description">
      <div>
        <span>This experimental feature does auto harvest and stakes and all the steps in between.</span>
        <br />
        <h3>Steps:</h3>
        <ol>
          <li>Harvest Pool</li>
          <li>Provide Liquidity (if not possible, it swaps half of harvested coins to USDC)</li>
          <li>Stake LP</li>
        </ol>
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
import { mapState, mapGetters } from 'vuex'
import { Tooltip, Progress, Collapse, Spin, Icon, Row, Col, Button } from 'ant-design-vue'

import { get, cloneDeep } from 'lodash-es'
import importIcon from '@/utils/import-icon'
import { TokenAmount } from '@/utils/safe-math'
import { FarmInfo } from '@/utils/farms'
import { depositV4, withdrawV4 } from '@/utils/stake'
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

    openStakeModal(poolInfo: FarmInfo, lp: any) {
      const coin = cloneDeep(lp)
      const lpBalance = get(this.wallet.tokenAccounts, `${lp.mintAddress}.balance`)
      coin.balance = lpBalance

      this.lp = coin
      this.farmInfo = cloneDeep(poolInfo)

      this.stakeModalOpening = true

      console.log('open stake', JSON.stringify({ lp: this.lp, farmInfo: this.farmInfo }))
      // const stakeStep = {
      //   lp: {
      //     symbol: 'STEP-USDC',
      //     name: 'STEP-USDC LP',
      //     coin: {
      //       symbol: 'STEP',
      //       name: 'STEP',
      //       mintAddress: 'StepAscQoEioFxxWGnh2sLBDFp9d8rvKz2Yp39iDpyT',
      //       decimals: 9,
      //       referrer: 'EFQVX1S6dFroDDhJDAnMTX4fCfjt4fJXHdk1eEtJ2uRY'
      //     },
      //     pc: {
      //       symbol: 'USDC',
      //       name: 'USDC',
      //       mintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      //       decimals: 6,
      //       referrer: '92vdtNjEg6Zth3UU1MgPgTVFjSEzTHx66aCdqWdcRkrg'
      //     },
      //     mintAddress: '3k8BDobgihmk72jVmXYLE168bxxQUhqqyESW4dQVktqC',
      //     decimals: 9,
      //     balance: { decimals: 9, _decimals: '1000000000', wei: '2045701204' }
      //   },
      //   farmInfo: {
      //     name: 'STEP-USDC',
      //     lp: {
      //       symbol: 'STEP-USDC',
      //       name: 'STEP-USDC LP',
      //       coin: {
      //         symbol: 'STEP',
      //         name: 'STEP',
      //         mintAddress: 'StepAscQoEioFxxWGnh2sLBDFp9d8rvKz2Yp39iDpyT',
      //         decimals: 9,
      //         referrer: 'EFQVX1S6dFroDDhJDAnMTX4fCfjt4fJXHdk1eEtJ2uRY'
      //       },
      //       pc: {
      //         symbol: 'USDC',
      //         name: 'USDC',
      //         mintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      //         decimals: 6,
      //         referrer: '92vdtNjEg6Zth3UU1MgPgTVFjSEzTHx66aCdqWdcRkrg'
      //       },
      //       mintAddress: '3k8BDobgihmk72jVmXYLE168bxxQUhqqyESW4dQVktqC',
      //       decimals: 9,
      //       balance: { decimals: 9, _decimals: '1000000000', wei: '2842818943106092' }
      //     },
      //     reward: {
      //       symbol: 'RAY',
      //       name: 'Raydium',
      //       mintAddress: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
      //       decimals: 6,
      //       referrer: '33XpMmMQRf6tSPpmYyzpwU4uXpZHkFwCZsusD9dMYkjy'
      //     },
      //     rewardB: {
      //       symbol: 'STEP',
      //       name: 'STEP',
      //       mintAddress: 'StepAscQoEioFxxWGnh2sLBDFp9d8rvKz2Yp39iDpyT',
      //       decimals: 9,
      //       referrer: 'EFQVX1S6dFroDDhJDAnMTX4fCfjt4fJXHdk1eEtJ2uRY'
      //     },
      //     isStake: false,
      //     fusion: true,
      //     legacy: false,
      //     dual: false,
      //     version: 5,
      //     programId: '9KEPoZmtHUrBbhWN1v1KWLMkkvwY6WLtAVUCPRtRjP4z',
      //     poolId: '8xhjCzfzVcP79jE7jXR2xtNaSL6aJYoDRLVT9FMjpRTC',
      //     poolAuthority: '6wRMPrHKFzj3qB4j5yj4y9mDF89fZ6w7gD1cEzCJwT9B',
      //     poolLpTokenAccount: 'CP3wdgdSygYGLJMjKfbJMiANnYuAxXHPiLTtB124tzVX',
      //     poolRewardTokenAccount: '3zSiR4XrrRPhsom2hh9iigYZZ7uCpMucfJnZRgREgH8j',
      //     poolRewardTokenAccountB: '4n3vRUk3wdtbGWgMFSaxUcnGLKwa2wiWVhqw7kv9JDVS',
      //     poolInfo: {
      //       state: '01',
      //       nonce: 'fd',
      //       poolLpTokenAccount: { _bn: 'a916a9134c3de34fe71cef076bec7fed14e5cbdbdbf1ff045790a549126b1a42' },
      //       poolRewardTokenAccount: { _bn: '2c6e8e1069021df378559c3788f05c4f7377780225a71e283d8163a84e4326a8' },
      //       totalReward: '00',
      //       perShare: '00',
      //       perBlock: '00',
      //       option: 1,
      //       poolRewardTokenAccountB: { _bn: '381d80035eb387038431725737f4355544ee866bc700d66c5e12a959d11e7529' },
      //       totalRewardB: '1decacc0565e93',
      //       perShareB: '1351aa41daf9fc',
      //       perBlockB: '01b1536580',
      //       lastBlock: '048ede15',
      //       owner: { _bn: 'df025f0c43896dfbd2cb18fa779e41a16b10b1f34d8222911d8bf5aba66ebd23' }
      //     },
      //     apr: '0.00',
      //     aprB: '1709.55',
      //     aprTotal: '1709.55',
      //     liquidityUsdValue: 181474253.29443642
      //   }
      // }
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
        })
    },

    cancelUnstake() {
      this.lp = null
      this.farmInfo = null
      this.unstakeModalOpening = false
    },

    harvest(farmInfo: FarmInfo) {
      console.log('farmInfo', JSON.stringify(farmInfo))

      // const kinRayHarvest = {
      //   name: 'KIN-RAY',
      //   lp: {
      //     symbol: 'KIN-RAY',
      //     name: 'KIN-RAY LP',
      //     coin: {
      //       symbol: 'KIN',
      //       name: 'KIN',
      //       mintAddress: 'kinXdEcpDQeHPEuQnqmUgtYykqKGVFq6CeVX5iAHJq6',
      //       decimals: 5,
      //       referrer: 'AevFXmApVxN2yk1iemSxXc6Wy7Z1udUEfST11kuYKmr9'
      //     },
      //     pc: {
      //       symbol: 'RAY',
      //       name: 'Raydium',
      //       mintAddress: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
      //       decimals: 6,
      //       referrer: '33XpMmMQRf6tSPpmYyzpwU4uXpZHkFwCZsusD9dMYkjy'
      //     },
      //     mintAddress: 'CHT8sft3h3gpLYbCcZ9o27mT5s3Z6VifBVbUiDvprHPW',
      //     decimals: 6,
      //     balance: { decimals: 6, _decimals: '1000000', wei: '3302479924487778' }
      //   },
      //   reward: {
      //     symbol: 'RAY',
      //     name: 'Raydium',
      //     mintAddress: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
      //     decimals: 6,
      //     referrer: '33XpMmMQRf6tSPpmYyzpwU4uXpZHkFwCZsusD9dMYkjy'
      //   },
      //   rewardB: {
      //     symbol: 'KIN',
      //     name: 'KIN',
      //     mintAddress: 'kinXdEcpDQeHPEuQnqmUgtYykqKGVFq6CeVX5iAHJq6',
      //     decimals: 5,
      //     referrer: 'AevFXmApVxN2yk1iemSxXc6Wy7Z1udUEfST11kuYKmr9'
      //   },
      //   isStake: false,
      //   fusion: true,
      //   legacy: false,
      //   dual: true,
      //   version: 5,
      //   programId: '9KEPoZmtHUrBbhWN1v1KWLMkkvwY6WLtAVUCPRtRjP4z',
      //   poolId: 'FgApVk6mASrkuWNxmsFvsaAYkFKqdiwMTvYZK36A2DaC',
      //   poolAuthority: '7kEx8qnkZPkRXV6f4ztf27zYjCACBHY3PUMfuiYJsoML',
      //   poolLpTokenAccount: '7fgDjhZn9GqRZbbCregr9tpkbWSKjibdCsJNBYbLhLir',
      //   poolRewardTokenAccount: '5XZjRyEo8Wr2CtSE5bpoKioThT9czK1dUebbK87Lqkaa',
      //   poolRewardTokenAccountB: '8jGJ3ST1j9eemfC6N2qQevtUdwxT7TpXW1NmvWyvLLVs',
      //   poolInfo: {
      //     state: '01',
      //     nonce: 'fd',
      //     poolLpTokenAccount: { _bn: '630e89bc9da17a1d101cb246e4138e7683bbe55e6796bbe3c5af68bea35a2a97' },
      //     poolRewardTokenAccount: { _bn: '43432e81fff19629b3475875fb1fbb8a68d0895eea640ace84c86d89b69608d7' },
      //     totalReward: '0b6d9779ca',
      //     perShare: '06ac29f42d',
      //     perBlock: '1f40',
      //     option: 1,
      //     poolRewardTokenAccountB: { _bn: '72d57ec8dead90b580d6a31fe6840105faadded377dc0f7815f212fe5a15b83e' },
      //     totalRewardB: '01be7b99fb7870',
      //     perShareB: 'a01845f4368e',
      //     perBlockB: '04c4b400',
      //     lastBlock: '048ed1bb',
      //     owner: { _bn: 'df025f0c43896dfbd2cb18fa779e41a16b10b1f34d8222911d8bf5aba66ebd23' }
      //   },
      //   apr: '71.23',
      //   aprB: '128.02',
      //   aprTotal: '199.25',
      //   liquidityUsdValue: 10129148.577409675
      // }

      // const stepHarvest = {
      //   name: 'STEP-USDC',
      //   lp: {
      //     symbol: 'STEP-USDC',
      //     name: 'STEP-USDC LP',
      //     coin: {
      //       symbol: 'STEP',
      //       name: 'STEP',
      //       mintAddress: 'StepAscQoEioFxxWGnh2sLBDFp9d8rvKz2Yp39iDpyT',
      //       decimals: 9,
      //       referrer: 'EFQVX1S6dFroDDhJDAnMTX4fCfjt4fJXHdk1eEtJ2uRY'
      //     },
      //     pc: {
      //       symbol: 'USDC',
      //       name: 'USDC',
      //       mintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      //       decimals: 6,
      //       referrer: '92vdtNjEg6Zth3UU1MgPgTVFjSEzTHx66aCdqWdcRkrg'
      //     },
      //     mintAddress: '3k8BDobgihmk72jVmXYLE168bxxQUhqqyESW4dQVktqC',
      //     decimals: 9,
      //     balance: { decimals: 9, _decimals: '1000000000', wei: '2840028876147307' }
      //   },
      //   reward: {
      //     symbol: 'RAY',
      //     name: 'Raydium',
      //     mintAddress: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
      //     decimals: 6,
      //     referrer: '33XpMmMQRf6tSPpmYyzpwU4uXpZHkFwCZsusD9dMYkjy'
      //   },
      //   rewardB: {
      //     symbol: 'STEP',
      //     name: 'STEP',
      //     mintAddress: 'StepAscQoEioFxxWGnh2sLBDFp9d8rvKz2Yp39iDpyT',
      //     decimals: 9,
      //     referrer: 'EFQVX1S6dFroDDhJDAnMTX4fCfjt4fJXHdk1eEtJ2uRY'
      //   },
      //   isStake: false,
      //   fusion: true,
      //   legacy: false,
      //   dual: false,
      //   version: 5,
      //   programId: '9KEPoZmtHUrBbhWN1v1KWLMkkvwY6WLtAVUCPRtRjP4z',
      //   poolId: '8xhjCzfzVcP79jE7jXR2xtNaSL6aJYoDRLVT9FMjpRTC',
      //   poolAuthority: '6wRMPrHKFzj3qB4j5yj4y9mDF89fZ6w7gD1cEzCJwT9B',
      //   poolLpTokenAccount: 'CP3wdgdSygYGLJMjKfbJMiANnYuAxXHPiLTtB124tzVX',
      //   poolRewardTokenAccount: '3zSiR4XrrRPhsom2hh9iigYZZ7uCpMucfJnZRgREgH8j',
      //   poolRewardTokenAccountB: '4n3vRUk3wdtbGWgMFSaxUcnGLKwa2wiWVhqw7kv9JDVS',
      //   poolInfo: {
      //     state: '01',
      //     nonce: 'fd',
      //     poolLpTokenAccount: { _bn: 'a916a9134c3de34fe71cef076bec7fed14e5cbdbdbf1ff045790a549126b1a42' },
      //     poolRewardTokenAccount: { _bn: '2c6e8e1069021df378559c3788f05c4f7377780225a71e283d8163a84e4326a8' },
      //     totalReward: '00',
      //     perShare: '00',
      //     perBlock: '00',
      //     option: 1,
      //     poolRewardTokenAccountB: { _bn: '381d80035eb387038431725737f4355544ee866bc700d66c5e12a959d11e7529' },
      //     totalRewardB: '1de31ed49a7313',
      //     perShareB: '134e4da988bdb3',
      //     perBlockB: '01b1536580',
      //     lastBlock: '048ed870',
      //     owner: { _bn: 'df025f0c43896dfbd2cb18fa779e41a16b10b1f34d8222911d8bf5aba66ebd23' }
      //   },
      //   apr: '0.00',
      //   aprB: '1716.21',
      //   aprTotal: '1716.21',
      //   liquidityUsdValue: 181823791.58565214
      // }

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
              ]),
            duration: 10
          })
          // @ts-ignore
          const description = `Harvest ${farmInfo.reward.symbol} and ${farmInfo.rewardB.symbol} from ${farmInfo.lp.name}`
          this.$accessor.transaction.sub({ txid, description })
          // TODO wait till confirmed ^

          // TODO provide liquidity
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

  .history {
    margin-top: 20px;

    .title {
      font-size: 20px;
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
