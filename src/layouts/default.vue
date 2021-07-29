<template>
  <Layout>
    <Head />
    <Setting />

    <Content>
      <div v-if="['swap', 'liquidity', 'farms'].includes(pageName)" class="fc-container">
        <Alert type="warning" message="IMPORTANT" show-icon closable>
          <div slot="description">
            RAY-SOL, RAY-SRM, RAY-USDC and RAY-ETH pools are upgrading from the V3 AMM contract to V4. As a result,
            liquidity in legacy V3 pools must migrate to new pools.
            <NuxtLink to="/migrate/">This migration tool</NuxtLink>
            simplifies the process. For full info,
            <a href="https://raydium.gitbook.io/raydium/updates/v4-migration" target="_blank">click here</a>.
          </div>
        </Alert>
      </div>
      <Nuxt />
    </Content>
    <div
      style="
        height: 1px;
        background: linear-gradient(90deg, rgba(90, 196, 190, 0) 0%, #3772ff 50%, rgba(194, 0, 251, 0) 100%);
      "
    />
    <Foot />
  </Layout>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'nuxt-property-decorator'

import { Layout, Alert } from 'ant-design-vue'
import Setting from '@/components/Setting.vue'

const { Content } = Layout

@Component({
  components: {
    Layout,
    Content,
    Setting,
    Alert
  }
})
export default class Default extends Vue {
  pageName: string = ''

  @Watch('$route')
  onRouteChanged() {
    this.pageName = this.$route.name ?? ''
  }

  mounted() {
    this.pageName = this.$route.name ?? ''
  }
}
</script>

<style lang="less">
.ant-layout-content {
  min-height: calc(100vh - 64px - 82px);
}

// footer {
//   width: 100%;
//   height: 100px;
//   position: absolute;
//   bottom: 0;
//   left: 0;
//   background: #333;
// }
.ant-alert-warning {
  width: 500px;
  margin-top: 30px;
  background-color: transparent;
  border: 1px solid #85858d;

  .anticon-close {
    color: #fff;
  }
}
</style>
