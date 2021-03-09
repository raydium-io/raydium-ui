<template>
  <Footer :class="app.isMobile ? 'mobile' : 'pc'">
    <div class="logo" v-if="!app.isMobile">
      <a href="/"><img src="@/assets/icons/logo-text.svg" /></a>
    </div>
    <div class="link_menu">
      <a :href="link_url.home"><span>Home</span></a>
      <img class="logo" src="@/assets/icons/round.svg" v-if="!app.isMobile" />
      <a :href="link_url.app"><span>App</span></a>
      <img class="logo" src="@/assets/icons/round.svg" v-if="!app.isMobile" />
      <a :href="link_url.info"><span>Info</span></a>
    </div>
    <div class="icon_list">
      <a :href="link_url.twitter" target="_blank" style="margin-left: 10px"
        ><img src="@/assets/icons/twitter.svg" width="20" height="20"
      /></a>
      <a :href="link_url.discord" target="_blank" style="margin-left: 10px"
        ><img src="@/assets/icons/discord.png" width="20" height="20"
      /></a>
      <a :href="link_url.telegram" target="_blank" style="margin-left: 10px"
        ><img src="@/assets/icons/telegram.svg" width="20" height="20"
      /></a>
      <a :href="link_url.medium" target="_blank" style="margin-left: 10px"
        ><img src="@/assets/icons/medium.svg" width="20" height="20"
      /></a>
    </div>
    <div class="logo" v-if="app.isMobile">
      <a href="/"><img src="@/assets/icons/logo-text.svg" /></a>
    </div>
  </Footer>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'

import { Layout } from 'ant-design-vue'

const { Footer } = Layout

export default Vue.extend({
  components: {
    Footer
  },

  data() {
    return {
      navOpened: false,
      link_url: {
        home: '/',
        app: '/swap',
        info: '/info',
        twitter: 'https://twitter.com/RaydiumProtocol',
        discord: 'https://discord.com/invite/6EvFwvCfpx',
        telegram: 'https://t.me/raydiumprotocol',
        medium: 'https://raydium.medium.com/'
      }
    }
  },

  computed: {
    ...mapState(['app'])
  },

  mounted() {
    this.$store.dispatch('app/queryIsMobile')
  }
})
</script>

<style lang="less" scoped>
.mobile {
  .link_menu {
    span {
      display: inline-block;
      width: 100%;
      text-align: center;
      font-size: 14px;
      color: #84879c;
      padding-top: 16px;
    }
  }
  .icon_list {
    text-align: center;
    margin: 48px 0;
  }
  .logo {
    text-align: center;
    margin-bottom: 50px;
  }
}
.pc {
  display: flex;
  justify-content: space-between;
  .link_menu {
    a {
      display: inline-block;
      width: 100px;
      text-align: center;
      font-size: 14px;
      color: #84879c;

      &:hover {
        color: #fff;
      }
    }
  }
}
</style>
