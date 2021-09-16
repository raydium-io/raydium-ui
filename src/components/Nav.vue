<template>
  <Menu
    v-model="currentRoute"
    :mode="isMobile ? 'inline' : 'horizontal'"
    :theme="isMobile ? 'dark' : 'light'"
    @click="changeRoute"
  >
    <MenuItem v-for="(extra, name) in navs" :key="name">
      <a v-if="extra" :href="url[name]" target="_blank">
        {{ name.replace('-', ' ') }}
      </a>
      <span v-else> {{ name.replace('-', ' ') }} </span>
    </MenuItem>
  </Menu>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'

import { Menu } from 'ant-design-vue'

const MenuItem = Menu.Item

@Component({
  components: {
    Menu,
    MenuItem
  }
})
export default class Nav extends Vue {
  navs = {
    trading: true,
    swap: false,
    liquidity: false,
    pools: false,
    farms: false,
    staking: false,
    acceleRaytor: false,
    dropZone: true,
    migrate: false
    // info: false
  }

  get isMobile() {
    return this.$accessor.isMobile
  }

  get url() {
    return this.$accessor.url
  }

  get currentRoute() {
    return [this.$accessor.route.name]
  }

  set currentRoute(route) {}

  changeRoute({ key }: { key: string }): void {
    const { from, to, ammId } = this.$route.query
    if (['swap', 'liquidity'].includes(key) && (ammId || (from && to))) {
      if (ammId) {
        this.$router.push({
          path: `/${key}/`,
          query: {
            ammId
          }
        })
      } else if (from && to) {
        this.$router.push({
          path: `/${key}/`,
          query: {
            from,
            to
          }
        })
      } else {
        this.$router.push({ path: `/${key}/` })
      }
    } else if (!(this as any).navs[key]) {
      this.$router.push({ path: `/${key}/` })
    }

    // to close menu on mobile mode
    this.$emit('onSelect')
  }
}
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

@media (max-width: 1020px) {
  .ant-menu-item {
    padding: 0 12px;
  }
}
</style>
