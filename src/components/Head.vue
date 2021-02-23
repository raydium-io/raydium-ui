<template>
  <Header class="header fs-container">
    <img class="logo" src="@/assets/icons/logo-text.svg" />

    <Nav />

    <Wallet />
  </Header>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

import { Layout } from 'ant-design-vue'

const { Header } = Layout

@Component({
  components: {
    Header,
  },
})
export default class Head extends Vue {}
</script>

<style lang="less" scoped>
.header {
  border-bottom: 2px solid #1c274f;

  .logo {
    height: 35px;
  }
}
</style>
