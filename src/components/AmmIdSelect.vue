<template>
  <Modal
    title="Confirm the AMM ID of the pool you wish to trade"
    :visible="show"
    :footer="null"
    :mask-closable="false"
    :closable="false"
    @cancel="$emit('onClose')"
  >
    <div class="select-token">
      <div class="sort fs-container">
        <span class="title">AMM ID</span>
      </div>

      <div class="token-list">
        <div
          v-for="liquidity in liquidityList"
          :key="liquidity.ammId"
          class="token-info"
          @click="$emit('onSelect', liquidity)"
        >
          <div>
            <span
              >{{ liquidity.ammId
              }}<span style="color: red">{{ !liquidity.official ? ' (Permissionless)' : '(Official)' }}</span></span
            >
          </div>

          <div class="fs-container">
            Pool liquidity:
            {{ liquidity.coin.balance ? liquidity.coin.balance.toEther() : 0 }}
            {{ liquidity.coin.symbol }},
            {{ liquidity.pc.balance ? liquidity.pc.balance.toEther() : 0 }}
            {{ liquidity.pc.symbol }}
          </div>
        </div>
      </div>
      <Button v-if="userClose" size="large" ghost @click="$emit('onSelect', undefined)">Cancel</Button>
    </div>
  </Modal>
</template>

<script lang="ts">
import Vue from 'vue'
import { Modal, Button } from 'ant-design-vue'

Vue.use(Modal)

export default Vue.extend({
  components: {
    Modal,
    Button
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    liquidityList: {
      // type: List,
      default: []
    },
    userClose: {
      type: Boolean,
      default: false
    }
  }
})
</script>

<style lang="less" scoped>
@import '../styles/variables';

.select-token {
  display: grid;
  grid-auto-rows: auto;
  row-gap: 14px;

  .token-list {
    max-height: 60vh;
    padding-right: 10px;
    overflow: auto;
    direction: ltr;
    will-change: transform;

    .token-info {
      width: 100%;
      justify-content: space-between;
      padding: 4px 0;
      cursor: pointer;
      opacity: 1;
      height: 70px;
      &:hover,
      &:active {
        background: rgb(107, 128, 185);
      }
    }

    .token-info[disabled] {
      cursor: not-allowed;
      // pointer-events: none;
      opacity: 0.5;
    }
  }
}
</style>
