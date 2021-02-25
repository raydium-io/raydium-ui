<template>
  <div class="container">
    <div class="page-head fs-container">
      <span class="title">Swap</span>
      <div class="buttons">
        <Tooltip placement="bottom" trigger="click">
          <template slot="title">
            <span>Address</span>
          </template>
          <Icon type="info-circle" />
        </Tooltip>
        <Icon type="setting" />
      </div>
    </div>
    <CoinSelect :show="coinSelectShow" :close="closeCoinSelect"></CoinSelect>
    <div class="card">
      <div class="card-body">
        <CoinInput label="From" :open-coin-select="openCoinSelect"></CoinInput>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

import { Icon, Tooltip } from 'ant-design-vue'

@Component({
  components: {
    Icon,
    Tooltip,
  },
})
export default class Swap extends Vue {
  coinSelectShow = false

  openCoinSelect() {
    this.coinSelectShow = true
  }

  closeCoinSelect() {
    this.coinSelectShow = false
  }
}
</script>

<style lang="less">
.container {
  max-width: 400px;
}
</style>
