<template>
  <Modal title="Select a token" :visible="show" :footer="null" @cancel="close">
    <div class="select-token">
      <Input size="large" placeholder="Search name or paste mint address" />
      <div class="sort fs-container">
        <span class="title">Token name</span>
        <Icon type="arrow-down" />
      </div>
      <div class="token-list"></div>
    </div>
  </Modal>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

import { Input, Modal, Icon } from 'ant-design-vue'

import importIcon from '@/utils/import-icon'

// fix: Failed to resolve directive: ant-portal
Vue.use(Modal)

const CoinSelectProps = Vue.extend({
  props: {
    show: {
      type: Boolean,
      // required: true,
      default: false,
    },
    close: {
      type: Function,
      required: true,
    },
  },
})

@Component({
  components: {
    Input,
    Modal,
    Icon,
  },

  methods: {
    importIcon,
  },
})
export default class CoinSelect extends CoinSelectProps {}
</script>

<style lang="less" scoped>
.select-token {
  display: grid;
  grid-auto-rows: auto;
  row-gap: 14px;

  .sort {
    .title {
      font-size: 14px;
      line-height: 36px;
      font-weight: 400;
    }
  }
}
</style>
