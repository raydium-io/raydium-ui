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
    <div class="card">
      <div class="card-body">
        <CoinInput label="From"></CoinInput>
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
export default class Swap extends Vue {}
</script>

<style lang="less">
.container {
  max-width: 400px;
}
</style>
