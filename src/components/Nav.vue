<template>
  <Menu v-model="currentRoute" mode="horizontal" @click="changeRoute">
    <MenuItem v-for="(extra, name) in navs" :key="name">
      <a
        v-if="extra"
        :href="url[name]"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ name }}
      </a>
      <span v-else> {{ name }} </span>
    </MenuItem>
  </Menu>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

import { mapState } from 'vuex'

import { Menu } from 'ant-design-vue'

const MenuItem = Menu.Item

@Component({
  components: {
    Menu,
    MenuItem,
  },

  computed: {
    ...mapState(['url']),
    currentRoute: {
      get() {
        return [this.$store.state.route.name]
      },
      set() {},
    },
  },
})
export default class Index extends Vue {
  navs: any = {
    trading: true,
    swap: false,
    liquidity: false,
    staking: false,
    farms: false,
  }

  changeRoute({ key }: { key: string }): void {
    if (!this.navs[key]) {
      this.$router.push(`/${key}`)
    }
  }
}
</script>

<style lang="less">
@import '../styles/variables';

.ant-menu {
  text-transform: uppercase;
}

.ant-menu-horizontal {
  line-height: 62px;
  border-bottom: none;
}

.ant-menu-horizontal > .ant-menu-item:hover,
.ant-menu-horizontal > .ant-menu-submenu:hover,
.ant-menu-horizontal > .ant-menu-item-active,
.ant-menu-horizontal > .ant-menu-submenu-active,
.ant-menu-horizontal > .ant-menu-item-open,
.ant-menu-horizontal > .ant-menu-submenu-open,
.ant-menu-horizontal > .ant-menu-item-selected,
.ant-menu-horizontal > .ant-menu-submenu-selected {
  border-bottom: 2px solid #6a49fe;
}
</style>
