<template>
  <Menu
    v-model="currentRoute"
    :mode="app.isMobile ? 'inline' : 'horizontal'"
    :theme="app.isMobile ? 'dark' : 'light'"
    @click="changeRoute"
  >
    <MenuItem v-for="(extra, name) in navs" :key="name">
      <a v-if="extra" :href="url[name]" target="_blank" rel="noopener noreferrer">
        {{ name }}
      </a>
      <span v-else> {{ name }} </span>
    </MenuItem>
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
    MenuItem
  },

  data() {
    return {
      navs: {
        trading: true,
        swap: false,
        liquidity: false,
        pools: false,
        farms: false,
        fusion: false,
        staking: false,
        migrate: false
        // info: false
      }
    }
  },

  computed: {
    ...mapState(['app', 'url']),
    currentRoute: {
      get() {
        return [this.$store.state.route.name]
      },
      set() {}
    }
  },

  methods: {
    changeRoute({ key }: { key: string }): void {
      if (!(this as any).navs[key]) {
        this.$router.push(`/${key}/`)
      }

      this.$emit('onSelect')
    }
  }
})
</script>

<style lang="less">
@import '../styles/variables';

.ant-menu {
  text-transform: capitalize;
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
  border-bottom: 2px solid @menu-dark-item-active-bg;
}
</style>
