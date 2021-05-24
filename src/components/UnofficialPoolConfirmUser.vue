<template>
  <Modal
    title="This is a Permissionless Pool"
    :visible="true"
    :footer="null"
    @cancel="$emit('onClose')"
    :maskClosable="false"
    :closable="false"
  >
    <div class="select-token">
      Anyone can create an SPL token on Solana, which may include fake versions of existing tokens or tokens that claim
      to represent projects that do not have a token. Take extra caution to confirm token addresses are for the token
      you want to trade.
      <br /><br />
      Always check the quoted price and that the pool has sufficient liqudity before trading.
      <label style="color: red"
        ><input type="checkbox" v-model="userCheckUnofficial" style="margin-right: 10px" />I understand</label
      >
      <label style="color: red"
        ><input type="checkbox" v-model="userCheckUnofficialAll" style="margin-right: 10px" />Do not warn again for this
        pool</label
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
import { Modal } from 'ant-design-vue'
import { Button } from 'ant-design-vue'

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
