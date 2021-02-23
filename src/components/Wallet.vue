<template>
  <div>
    <Button v-if="!wallet.connected" ghost @click="openModal">
      CONNECT WALLET
    </Button>

    <Modal
      title="Connect to a wallet"
      :visible="showModal"
      :footer="null"
      @cancel="closeModal"
    >
      1
    </Modal>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

import { mapState } from 'vuex'

import { Button, Modal } from 'ant-design-vue'

// fix: Failed to resolve directive: ant-portal
Vue.use(Modal)

@Component({
  components: {
    Button,
    Modal,
  },

  computed: {
    ...mapState(['wallet']),
  },
})
export default class Wallet extends Vue {
  showModal = false

  openModal() {
    this.showModal = true
  }

  closeModal() {
    this.showModal = false
  }
}
</script>
