<template>
  <div class="container">
    <div class="page-head fs-container">
      <span class="title">Top Pools</span>
    </div>

    <div class="card">
      <div class="card-body">
        <Table :columns="columns" :data-source="pools" :pagination="false" row-key="lp_mint">
          <span slot="name" slot-scope="text" class="lp-icons">
            {{ void (pool = getPoolByLpMintAddress(text)) }}
            <div class="icons">
              <img :src="importIcon(`/coins/${pool.lp.coin.symbol.toLowerCase()}.png`)" />
              <img :src="importIcon(`/coins/${pool.lp.pc.symbol.toLowerCase()}.png`)" />
            </div>
            <NuxtLink :to="`/liquidity/?from=${pool.lp.coin.mintAddress}&to=${pool.lp.pc.mintAddress}`">
              {{ pool.name }}
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
import { Vue, Component } from 'nuxt-property-decorator'
import { Table } from 'ant-design-vue'

import importIcon from '@/utils/import-icon'
import { getPoolByLpMintAddress } from '@/utils/pools'
import { TokenAmount } from '@/utils/safe-math'

@Component({
  head: {
    title: 'Raydium Pools'
  },

  components: {
    Table
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

  getPoolByLpMintAddress = getPoolByLpMintAddress
  importIcon = importIcon
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
</style>

<style lang="less">
.ant-table-thead > tr > th.ant-table-column-sort {
  background: transparent;
}
</style>
