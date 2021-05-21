<template>
  <Header class="header fs-container" :class="isMobile ? 'mobile' : ''">
    <NuxtLink to="/"><img class="logo" src="@/assets/icons/logo-text.svg" /></NuxtLink>

    <div v-if="isMobile ? (navOpened ? true : false) : true" :class="isMobile ? 'mobile-nav' : ''">
      <Nav @onSelect="() => (navOpened = false)" />
    </div>

    <div class="fs-container">
      <Wallet />
      <div
        v-if="isMobile"
        class="nav-button"
        :class="navOpened ? 'opened' : ''"
        @click="() => (navOpened = !navOpened)"
      >
        <span />
        <span />
        <span />
        <span />
      </div>
    </div>
  </Header>
</template>

<script lang="ts">
import Vue from 'vue'

import { Layout } from 'ant-design-vue'

const { Header } = Layout

export default Vue.extend({
  components: {
    Header
  },

  data() {
    return {
      navOpened: false
    }
  },

  computed: {
    isMobile() {
      return this.$accessor.isMobile
    }
  }
})
</script>

<style lang="less" scoped>
@import '../styles/variables';

.header {
  border-bottom: 2px solid @modal-header-bg;

  .logo {
    height: 35px;
  }

  .mobile-nav {
    position: absolute;
    width: 100vw;
    max-width: 100%;
    top: 64px;
    left: 0;
    text-align: center;
    z-index: 99;
  }

  .nav-button {
    display: inline-block;
    vertical-align: middle;
    margin-left: 16px;
    width: 24px;
    height: 20px;
    position: relative;
    transform: rotate(0deg);
    transition: 0.5s ease-in-out;
    cursor: pointer;

    span {
      background-color: #fff;
      display: block;
      position: absolute;
      height: 3px;
      width: 100%;
      border-radius: 3px;
      opacity: 1;
      left: 0;
      transform: rotate(0deg);
      transition: 0.25s ease-in-out;
    }

    span:first-child {
      top: 0;
      transform-origin: left top;
    }

    span:nth-child(2),
    span:nth-child(3) {
      top: 50%;
      transform: translateY(-50%);
      transform-origin: center center;
    }

    span:nth-child(4) {
      bottom: 0;
      transform-origin: left bottom;
    }
  }

  .nav-button.opened {
    span:first-child {
      width: 0%;
      left: 50%;
    }

    span:nth-child(2) {
      transform: rotate(45deg);
    }

    span:nth-child(3) {
      transform: rotate(-45deg);
    }

    span:nth-child(4) {
      width: 0%;
      left: 50%;
    }
  }
}

.header.mobile {
  padding: 0 20px;
}
</style>
