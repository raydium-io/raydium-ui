<template>
  <Header class="header fs-container">
    <img class="logo" src="@/assets/icons/logo-text.svg" />

    <Nav />

    <Wallet />
  </Header>
</template>

<script lang="ts">
import Vue from 'vue'

import { Layout } from 'ant-design-vue'

const { Header } = Layout

export default Vue.extend({
  components: {
    Header,
  },
})
</script>

<style lang="less" scoped>
.header {
  border-bottom: 2px solid #1c274f;

  .logo {
    height: 35px;
  }
}
</style>
