<template>
  <Layout>
    <Head />
    <Setting />

    <Content>
      <div class="fc-container">
        <Alert type="warning" message="IMPORTANT" show-icon closable>
          <div slot="description">
            Raydium has upgraded to Serum DEX3. Liquidity in legacy pools is migrating to new pools and rewards for
            legacy farms will gradually decline. To simplify the process, use the
            <NuxtLink to="/migrate">migration tool</NuxtLink>.
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
    ></div>
    <Foot />
  </Layout>
</template>

<script lang="ts">
import Vue from 'vue'

import { Layout, Alert } from 'ant-design-vue'
import Setting from '@/components/Setting.vue'

const { Content } = Layout

export default Vue.extend({
  components: {
    Layout,
    Content,
    Setting,
    Alert
  }
})
</script>

<style lang="less">
.ant-layout-content {
  min-height: calc(100vh - 64px - 82px);
}

.ant-alert-warning {
  width: 500px;
  margin-top: 30px;
  background-color: transparent;
  border: 1px solid #85858d;

  .anticon-close {
    color: #fff;
  }
}
// footer {
//   width: 100%;
//   height: 100px;
//   position: absolute;
//   bottom: 0;
//   left: 0;
//   background: #333;
// }
</style>
