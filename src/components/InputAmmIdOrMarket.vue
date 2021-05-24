<template>
  <Modal title="Search for an existing pool" :visible="true" :footer="null" @cancel="$emit('onClose')">
    <div class="select-token">
      <input v-model="keyword" placeholder=" Input AMM ID or Serum Market ID" />
      <div>
        <div style="width: 40%; float: right">
          <Button
            size="large"
            style="width: 100%"
            ghost
            @click="$emit('onInput', keyword.replace(/(^\s*)|(\s*$)/g, ''))"
            >Confirm</Button
          >
        </div>
        <div style="width: 40%; float: left">
          <Button size="large" style="width: 100%" ghost @click="$emit('onClose')">Cancel</Button>
        </div>
        <div style="clear: both"></div>
      </div>
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

  data() {
    return {
      keyword: ''
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

  input {
    padding: 16px;
    border: 1px solid @primary-color;
    border-radius: 4px;
    background-color: transparent;
    font-size: 18px;
    color: @text-color;

    &:active,
    &:focus,
    &:hover {
      outline: 0;
    }
  }

  .sort {
    .title {
      font-size: 14px;
      line-height: 36px;
      font-weight: 400;
    }
  }

  .token-list {
    max-height: 50vh;
    padding-right: 10px;
    overflow: auto;
    direction: ltr;
    will-change: transform;

    .token-info {
      display: grid;
      justify-content: space-between;
      align-items: center;
      height: 56px;
      padding: 4px 0;
      gap: 16px;
      grid-template-columns: auto minmax(auto, 1fr) auto minmax(0, 72px);
      cursor: pointer;
      opacity: 1;

      img {
        border-radius: 50%;
        height: 24px;
        width: 24px;
      }

      .balance {
        justify-self: flex-end;
        width: fit-content;

        div {
          white-space: nowrap;
          overflow: hidden;
          max-width: 5rem;
          text-overflow: ellipsis;
        }
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
