<template>
  <div v-if="liquidityPool && liquidityPool.hasQuote" class="pool-info">
    <div class="price-base fc-container">
      <span v-if="coinBasePrice">
        1 {{ liquidityPool.poolInfo.coin.symbol }} ≈
        {{
          liquidityPool.getPrice().toFixed(liquidityPool.poolInfo.pc.decimals)
        }}
        {{ liquidityPool.poolInfo.pc.symbol }}
      </span>
      <span v-else>
        1 {{ liquidityPool.poolInfo.pc.symbol }} ≈
        {{
          liquidityPool
            .getPrice(false)
            .toFixed(liquidityPool.poolInfo.coin.decimals)
        }}
        {{ liquidityPool.poolInfo.coin.symbol }}
      </span>
      <Icon type="swap" @click="() => (coinBasePrice = !coinBasePrice)" />
    </div>

    <div class="fs-container">
      <span class="name">Pool liquidity</span>
      <div class="info">
        <span>
          {{
            liquidityPool.poolInfo.coin.uiBalance.toFormat(
              liquidityPool.poolInfo.coin.decimals
            )
          }}
          {{ liquidityPool.poolInfo.coin.symbol }}
        </span>
        <span>
          {{
            liquidityPool.poolInfo.pc.uiBalance.toFormat(
              liquidityPool.poolInfo.pc.decimals
            )
          }}
          {{ liquidityPool.poolInfo.pc.symbol }}
        </span>
      </div>
    </div>

    <div class="fs-container">
      <span class="name">LP supply</span>
      <span>
        {{
          liquidityPool.poolInfo.lp.uiTotalSupply.toFormat(
            liquidityPool.poolInfo.lp.decimals
          )
        }}
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Icon } from 'ant-design-vue'

import Liquidity from '@/utils/liquidity'

export default Vue.extend({
  components: {
    Icon,
  },

  props: {
    liquidityPool: {
      type: [Liquidity || null],
      default: null,
    },
  },

  data() {
    return {
      // coin 为基准货币
      coinBasePrice: true,
    }
  },
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
