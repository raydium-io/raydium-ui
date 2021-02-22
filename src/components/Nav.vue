<template>
  <Menu mode="horizontal">
    <MenuItem key="trading">
      <a :href="url.trading" target="_blank" rel="noopener noreferrer">
        Trading
      </a>
    </MenuItem>
    <MenuItem key="swap">Swap</MenuItem>
    <MenuItem key="liquidity">Liquidity</MenuItem>
    <MenuItem key="staking">Staking</MenuItem>
    <MenuItem key="farms">Farms</MenuItem>
  </Menu>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'

import { Menu } from 'ant-design-vue'

const MenuItem = Menu.Item

export default Vue.extend({
  components: {
    Menu,
    MenuItem,
  },

  data() {
    return {}
  },

  computed: mapState(['url']),
})
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
