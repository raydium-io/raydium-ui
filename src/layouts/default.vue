<template>
  <Layout>
    <Head />
    <Setting />

    <Content>
      <div class="fc-container">
        <Alert type="warning" message="IMPORTANT" show-icon closable>
          <div slot="description">
            IMPORTANT: Raydium has upgraded to Serum DEX3. Liquidity in legacy pools is migrating to new pools and
            rewards for legacy farms will gradually decline. To simplify the process, use the
            <NuxtLink to="/migrate">migration tool</NuxtLink>.
          </div>
        </Alert>
      </div>
      <Nuxt />
    </Content>
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
  min-height: calc(100vh - 64px);
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
</style>
