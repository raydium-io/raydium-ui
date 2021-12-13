<template>
  <Modal
    class="modal-title"
    title="Confirm To Amount Change"
    :visible="true"
    :footer="null"
    :closable="false"
    :mask-closable="false"
  >
    <div class="select-token">
      balabala -- new balance {{ confirmAmount }} -- old balance {{ confirmAmountOld }}
      <div style="text-align: center">
        <Button
          style="width: 45%"
          size="large"
          ghost
          @click="
            () => {
              $emit('onClose')
            }
          "
          >Confirm And Swap</Button
        >
      </div>
    </div>
  </Modal>
</template>

<script lang="ts">
import Vue from 'vue'
import { Button, Modal } from 'ant-design-vue'

Vue.use(Modal)

export default Vue.extend({
  components: {
    Modal,
    Button
  },

  props: {
    confirmAmount: {
      type: String,
      default: ''
    },
    confirmAmountOld: {
      type: String,
      default: ''
    }
  },

  data() {
    return {}
  }
})
</script>

<style>
.modal-title .ant-modal-title {
  font-size: 22px !important;
  text-align: center !important;
}
</style>
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
      justify-content: space-between;
      padding: 4px 0;
      cursor: pointer;
      opacity: 1;
      height: 70px;
    }

    .token-info[disabled] {
      cursor: not-allowed;
      // pointer-events: none;
      opacity: 0.5;
    }
  }
}
</style>
