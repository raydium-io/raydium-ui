<template>
  <div class="pool container">
    <div class="page-head fs-container">
      <span class="title">Top Pools</span>
      <div class="buttons">
        <Tooltip placement="bottomRight">
          <template slot="title">
            <span>
              Displayed data will auto-refresh after
              {{ autoRefreshTime - countdown }} seconds. Click this circle to update manually.
            </span>
          </template>
          <Progress
            type="circle"
            :width="20"
            :stroke-width="10"
            :percent="(100 / autoRefreshTime) * countdown"
            :show-info="false"
            :class="loading ? 'disabled' : ''"
            @click="flush"
          />
        </Tooltip>
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        <div style="text-align: center">
          <RadioGroup v-model="poolType" style="display: inline-block; width: 70%; margin: 0 auto">
            <RadioButton class="radioButtonStyle" value="RaydiumPools"> Raydium Pools </RadioButton>
            <RadioButton class="radioButtonStyle" value="PermissionlessPools"> Permissionless Pools </RadioButton>
          </RadioGroup>
        </div>
        <Table :columns="columns" :data-source="poolsShow" :pagination="false" row-key="lp_mint">
          <span slot="name" slot-scope="text, row" class="lp-icons">
            {{ void (pool = getPoolByLpMintAddress(text)) }}
            <div class="icons">
              <CoinIcon :mint-address="pool ? getPoolByLpMintAddress(text).lp.coin.mintAddress : ''" />
              <CoinIcon :mint-address="pool ? getPoolByLpMintAddress(text).lp.pc.mintAddress : ''" />
            </div>
            <NuxtLink v-if="row.amm_id && pool" :to="`/liquidity/?ammId=${row.amm_id}`">
              {{ pool.name }}
            </NuxtLink>
            <NuxtLink
              v-else-if="pool"
              :to="`/liquidity/?from=${pool.lp.coin.mintAddress}&to=${pool.lp.pc.mintAddress}`"
            >
              {{ pool.name }}
            </NuxtLink>
            <span v-else>{{ text }}</span>
          </span>
          <span slot="liquidity" slot-scope="text"> ${{ new TokenAmount(text, 2, false).format() }} </span>
          <span slot="volume_24h" slot-scope="text"> ${{ new TokenAmount(text, 2, false).format() }} </span>
          <span slot="volume_7d" slot-scope="text"> ${{ new TokenAmount(text, 2, false).format() }} </span>
          <span slot="fee_24h" slot-scope="text"> ${{ new TokenAmount(text, 2, false).format() }} </span>
          <span slot="apy" slot-scope="text"> {{ new TokenAmount(text, 2, false).format() }}% </span>
        </Table>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'nuxt-property-decorator'
import { Table, Radio, Progress, Tooltip } from 'ant-design-vue'

import { getPoolByLpMintAddress } from '@/utils/pools'
import { TokenAmount } from '@/utils/safe-math'

const RadioGroup = Radio.Group
const RadioButton = Radio.Button
@Component({
  head: {
    title: 'Raydium Pools'
  },

  components: {
    Table,
    RadioGroup,
    RadioButton,
    Progress,
    Tooltip
  },

  async asyncData({ $api }) {
    const pools = await $api.getPairs()
    return { pools }
  }
})
export default class Pools extends Vue {
  columns = [
    {
      title: 'Name',
      dataIndex: 'lp_mint',
      key: 'lp_mint',
      scopedSlots: { customRender: 'name' }
    },
    {
      title: 'Liquidity',
      dataIndex: 'liquidity',
      key: 'liquidity',
      scopedSlots: { customRender: 'liquidity' },
      defaultSortOrder: 'descend',
      sorter: (a: any, b: any) => a.liquidity - b.liquidity
    },
    {
      title: 'Volume (24hrs)',
      dataIndex: 'volume_24h',
      key: 'volume_24h',
      scopedSlots: { customRender: 'volume_24h' },
      sorter: (a: any, b: any) => a.volume_24h - b.volume_24h
    },
    {
      title: 'Volume (7d)',
      dataIndex: 'volume_7d',
      key: 'volume_7d',
      scopedSlots: { customRender: 'volume_7d' },
      sorter: (a: any, b: any) => a.volume_7d - b.volume_7d
    },
    {
      title: 'Fees (24hr)',
      dataIndex: 'fee_24h',
      key: 'fee_24h',
      scopedSlots: { customRender: 'fee_24h' },
      sorter: (a: any, b: any) => a.fee_24h - b.fee_24h
    },
    {
      title: '1y Fees / Liquidity',
      dataIndex: 'apy',
      key: 'apy',
      scopedSlots: { customRender: 'apy' },
      sorter: (a: any, b: any) => a.apy - b.apy
    }
  ]

  pools: any = []
  poolsShow: any = []
  poolType: string = 'RaydiumPools'

  autoRefreshTime: number = 60
  countdown: number = 0
  timer: any = null
  loading: boolean = false

  get liquidity() {
    return this.$accessor.liquidity
  }

  @Watch('$accessor.liquidity.initialized', { immediate: true, deep: true })
  refreshThePage() {
    this.showPool()
  }

  @Watch('$accessor.liquidity.info', { immediate: true, deep: true })
  async onLiquidityChanged() {
    this.pools = await this.$api.getPairs()
    this.showPool()
  }

  @Watch('poolType')
  onPoolTypeChanged() {
    this.showPool()
  }

  showPool() {
    const pool = []
    for (const item of this.pools) {
      if (
        (this.poolType === 'RaydiumPools' && (item.official === undefined || item.official)) ||
        (this.poolType !== 'RaydiumPools' && item.official !== undefined && !item.official)
      ) {
        if (!item.name.includes('unknown')) {
          pool.push(item)
        }
      }
    }
    this.poolsShow = pool
  }

  mounted() {
    this.setTimer()
  }

  setTimer() {
    this.timer = setInterval(async () => {
      if (!this.loading) {
        if (this.countdown < this.autoRefreshTime) {
          this.countdown += 1

          if (this.countdown === this.autoRefreshTime) {
            await this.flush()
          }
        }
      }
    }, 1000)
  }

  async flush() {
    this.loading = true
    this.pools = await this.$api.getPairs()
    this.showPool()
    this.loading = false
    this.countdown = 0
  }

  getPoolByLpMintAddress = getPoolByLpMintAddress
  TokenAmount = TokenAmount
}
</script>

<style lang="less" scoped>
.container {
  max-width: 1200px;

  h6 {
    margin-bottom: 0;
  }

  .action {
    display: grid;
    grid-gap: 4px;
  }

  .lp-icons {
    .icons {
      margin-right: 8px;
    }
  }
}
.radioButtonStyle {
  width: 50%;
  text-align: center;
}
.card-body {
  padding-top: 25px;
}
</style>

<style lang="less">
::-webkit-scrollbar {
  display: none; /* Chrome Safari */
}
.pool {
  .card-body {
    overflow-x: scroll;
    scrollbar-width: none;
    -ms-overflow-style: none;
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
