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
            @click="
              () => {
                flush()
                $accessor.wallet.getTokenAccounts()
              }
            "
          />
        </Tooltip>
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        <div class="pool-filters">
          <Input v-model="searchName" size="large" class="input-search" placeholder="Search by token symbol">
            <Icon slot="prefix" type="search" />
          </Input>
          <!-- <RadioGroup v-model="poolType">
            <RadioButton class="radioButtonStyle" value="RaydiumPools"> Raydium Pools </RadioButton>
            <RadioButton class="radioButtonStyle" value="PermissionlessPools"> Permissionless Pools </RadioButton>
          </RadioGroup> -->
        </div>
        <Table
          :loading="loading"
          :columns="columns"
          :data-source="poolsShow"
          :pagination="false"
          row-key="lp_mint"
          style="max-height: 80vh; overflow-y: auto"
          class="show-table"
        >
          <span slot="name" slot-scope="text, row" class="lp-icons">
            <div class="icons">
              <CoinIcon :mint-address="row.pair_id ? row.pair_id.split('-')[0] : ''" />
              <CoinIcon :mint-address="row.pair_id ? row.pair_id.split('-')[1] : ''" />
            </div>
            <NuxtLink :to="`/liquidity/?ammId=${row.amm_id}`">
              {{ row.name }}
              <Tooltip v-if="row.liquidity < 100000" placement="right">
                <template slot="title"
                  >This pool has relatively low liquidity. Always check the quoted price and that the pool has
                  sufficient liquidity before trading.</template
                >
                <Icon type="exclamation-circle" />
              </Tooltip>
            </NuxtLink>
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
import { Table, Radio, Progress, Tooltip, Button, Input, Icon } from 'ant-design-vue'

import { TokenAmount } from '@/utils/safe-math'
import { PairData } from '@/types/api'

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
    Tooltip,
    Button,
    Input,
    Icon
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

  pools: PairData[] = []
  poolsShow: any = []

  autoRefreshTime: number = 60
  countdown: number = 0
  timer: any = null
  loading: boolean = false

  searchName = ''

  get liquidity() {
    return this.$accessor.liquidity
  }

  get isMobile() {
    return this.$accessor.isMobile
  }

  @Watch('searchName')
  onSearchNameChanged() {
    this.showPool()
  }

  async showPool(firstLoading = false) {
    let pools: PairData[]
    try {
      if (firstLoading) this.loading = true
      pools = await this.$api.getPairs()
      this.pools = pools
    } catch (e) {
      pools = this.pools
    } finally {
      this.loading = false
    }

    const pool = []
    for (const item of pools) {
      if (
        !item.name.includes('unknown') &&
        item.liquidity > 0 &&
        (this.searchName === '' || item.name.toLowerCase().includes(this.searchName.toLowerCase().trim()))
      ) {
        pool.push(item)
      }
    }
    this.poolsShow = pool
  }

  mounted() {
    this.setTimer()
    this.showPool(true)
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
    await this.showPool()
    this.countdown = 0
  }

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
  display: block;
  .pool-filters {
    text-align: center;
    .input-search {
      width: 100%;
      display: inline-block;
    }

    .ant-radio-group {
      display: inline-block;
      width: 40%;
      margin-left: 5%;
    }
  }

  /deep/ .ant-table-body {
    overflow-x: scroll;
  }
}

@media (max-width: 1000px) {
  .card-body .pool-filters {
    .input-search {
      display: block;
      width: auto;
    }
    .ant-radio-button-wrapper {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .ant-radio-group {
      display: block;
      width: auto;
      margin-left: 0;
      margin-top: 1em;
    }
  }
}
</style>

<style lang="less">
.card-body .ant-table-placeholder {
  background: transparent;
}
.card-body .ant-empty-description {
  color: #fff;
}

.card-body .ant-table-fixed-header .ant-table-content .ant-table-scroll .ant-table-body {
  background: transparent;
}
.card-body .show-table::-webkit-scrollbar {
  display: unset;
}
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
.search-btn {
  background: transparent !important;
  border: none !important;
}
.input-search .ant-input {
  height: 32.01px !important;
}
</style>
