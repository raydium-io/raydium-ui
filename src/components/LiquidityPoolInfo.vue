<template>
  <div v-if="initialized && poolInfo" class="pool-info">
    {{ void ((coin = poolInfo.coin), (pc = poolInfo.pc), (lp = poolInfo.lp)) }}
    <div class="price-base fc-container">
      <span v-if="coinBasePrice">
        1 {{ coin.symbol }} ≈
        {{ getPrice(poolInfo).toFixed(pc.decimals) }}
        {{ pc.symbol }}
      </span>
      <span v-else>
        1 {{ pc.symbol }} ≈
        {{ getPrice(poolInfo, false).toFixed(coin.decimals) }}
        {{ coin.symbol }}
      </span>
      <Icon type="swap" @click="() => (coinBasePrice = !coinBasePrice)" />
    </div>

    <div class="fs-container">
      <span class="name">Pool liquidity</span>
      <div class="info">
        <span>
          {{ coin.balance.format() }}
          {{ coin.symbol }}
        </span>
        <span>
          {{ pc.balance.format() }}
          {{ pc.symbol }}
        </span>
      </div>
    </div>

    <div class="fs-container">
      <span class="name">LP supply</span>
      <span>
        {{ lp.totalSupply.format() }}
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Icon } from 'ant-design-vue'
import { getPrice } from '@/utils/liquidity'

export default Vue.extend({
  components: {
    Icon
  },

  props: {
    initialized: {
      type: Boolean,
      default: false
    },
    poolInfo: {
      type: [Object || null],
      default: null
    }
  },

  data() {
    return {
      coinBasePrice: true
    }
  },

  methods: {
    getPrice
  }
})
</script>

<style lang="less" scoped>
@import '../styles/variables';

.pool-info {
  display: grid;
  grid-auto-rows: auto;
  row-gap: 8px;
  padding: 0 12px;
  font-size: 12px;
  line-height: 20px;

  .name {
    opacity: 0.75;
  }

  .info {
    display: grid;
    text-align: right;
  }

  .price-base {
    line-height: 24px;

    .anticon-swap {
      margin-left: 10px;
      padding: 5px;
      border-radius: 50%;
      background: #000829;
    }
  }
}
</style>
