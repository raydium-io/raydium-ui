<template>
  <Modal
    class="modal-title"
    title="Confirm Token"
    :visible="true"
    :footer="null"
    :closable="false"
    :mask-closable="false"
    @cancel="$emit('onClose')"
  >
    <div class="select-token">
      This token does not appear on the default token list. Take extra caution to confirm token addresses and that the
      minimum amount of tokens received for your trade is acceptable.
      <br />
      <label style="color: red"
        ><input v-model="userCheckUnofficial" type="checkbox" style="margin-right: 10px" />I understand</label
      >
      <label style="color: red"
        ><input v-model="userCheckUnofficialAll" type="checkbox" style="margin-right: 10px" />Add to user token list and
        do not warn again</label
      >
      <span>
        <Button style="width: 45%; margin-right: 8%" size="large" ghost @click="$emit('onSelect', false)">Cancel</Button
        ><Button
          style="width: 45%"
          :disabled="!userCheckUnofficial"
          size="large"
          ghost
          @click="$emit('onSelect', userCheckUnofficial, userCheckUnofficialAll)"
          >Confirm</Button
        ></span
      >
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
  data() {
    return {
      userCheckUnofficial: false,
      userCheckUnofficialAll: false
    }
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
