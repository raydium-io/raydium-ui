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

    <div v-if="farm.initialized" class="card">
      <div class="card-body">
        <Collapse expand-icon-position="right">
          <CollapsePanel v-for="farm in farms" :key="farm.poolId">
            <Row slot="header" class="farm-head" :gutter="0">
              <Col class="lp-icons" :span="8">
                <div class="icons">
                  {{ void ((names = farm.lp.symbol.split('-')), (coinSymbol = names[0]), (pcSymbol = names[1])) }}
                  <img :src="importIcon(`/coins/${coinSymbol.toLowerCase()}.png`)" />
                  <img :src="importIcon(`/coins/${pcSymbol.toLowerCase()}.png`)" />
                </div>
                {{ farm.lp.name }}
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
                <div class="value">{{ farm.lp.balance.format() }}</div>
              </Col>
            </Row>

            <Row :gutter="48">
              <Col :span="4">
                Add
                <NuxtLink :to="`/liquidity?from=${farm.lp.coin.mintAddress}&to=${farm.lp.pc.mintAddress}`">
                  {{ farm.lp.name }}
                </NuxtLink>
              </Col>

              <Col :span="10">
                <div class="harvest">
                  <div class="title">Pending {{ farm.reward.symbol }} Reward</div>
                  <div class="pending fs-container">
                    <div class="reward">
                      <div class="token">{{ farm.userInfo.pendingReward.format() }}</div>
                      <div class="value">0</div>
                    </div>
                    <Button size="large" ghost :disabled="farm.userInfo.pendingReward.wei.isZero()"> Harvest </Button>
                  </div>
                </div>
              </Col>

              <Col :span="10">
                <div class="start">
                  <div class="title">Start farming</div>
                  <Button v-if="!wallet.connected" size="large" ghost @click="$store.dispatch('wallet/openModal')">
                    Connect Wallet
                  </Button>
                  <Button v-else size="large" ghost>Harvest</Button>
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
import importIcon from '@/utils/import-icon'
import { TokenAmount } from '@/utils/safe-math'

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
      farms: [] as any
    }
  },

  computed: {
    ...mapState(['wallet', 'farm'])
  },

  watch: {
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
        const { lp, reward, isStake, poolInfo } = farmInfo

        if (!isStake) {
          let userInfo = get(this.farm.stakeAccounts, poolId)

          const { rewardPerShareNet } = poolInfo

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
              depositBalance: new TokenAmount(0, lp.decimals),
              pendingReward: new TokenAmount(0, reward.decimals)
            }
          }

          farms.push({
            poolId,
            lp,
            reward,
            userInfo
          })
        }
      }

      this.farms = farms
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
  }

  .start {
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
      padding: 0 30px;
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
  .ant-collapse-header {
    padding: 24px 32px !important;
  }

  .ant-collapse-content {
    border-top: 1px solid #1c274f;
  }
}
</style>
