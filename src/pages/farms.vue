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
          <CollapsePanel v-for="farmInfo in farms" :key="farmInfo.poolId">
            <div slot="header" class="farm-head">
              <div class="icons">
                <img :src="importIcon(`/coins/${farmInfo.lp.coin.symbol.toLowerCase()}.png`)" />
                <img :src="importIcon(`/coins/${farmInfo.lp.pc.symbol.toLowerCase()}.png`)" />
              </div>
              <div class="lp-icons">
                {{ farmInfo.lp.name }}
              </div>

              <div class="state">
                <div class="title">Staked</div>
                <div class="value">{{ farmInfo.user ? farmInfo.user.depositBalance.format() : '0' }}</div>
              </div>
              <div class="state">
                <div class="title">Pending Reward</div>
                <div class="value">{{ farmInfo.user ? farmInfo.user.rewardDebt.format() : '0' }}</div>
              </div>
              <div class="state">
                <div class="title">Apr</div>
                <div class="value"></div>
              </div>
              <div class="state">
                <div class="title">Liquidity</div>
                <div class="value">{{ farmInfo.lp.balance.format() }}</div>
              </div>
            </div>
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
import { Tooltip, Progress, Collapse, Spin, Icon } from 'ant-design-vue'

import { get } from 'lodash-es'
import importIcon from '@/utils/import-icon'

const CollapsePanel = Collapse.Panel

export default Vue.extend({
  components: {
    Tooltip,
    Progress,
    Collapse,
    CollapsePanel,
    Spin,
    Icon
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
    'wallet.stakeAccounts': {
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

    updateFarms() {
      const farms: any = []

      for (const [poolId, farmInfo] of Object.entries(this.farm.infos)) {
        const { lp, reward } = farmInfo

        const user = get(this.wallet.stakeAccounts, poolId)

        farms.push({
          poolId,
          lp,
          reward,
          user
        })
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

  .farm-head {
    display: grid;
    grid-template-columns: auto auto auto auto auto;
    gap: 16px;

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
}
</style>
