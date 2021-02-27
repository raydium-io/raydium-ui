<template>
  <Layout>
    <Head />
    <Setting />

    <Content>
      <Nuxt />
    </Content>
  </Layout>
</template>

<script lang="ts">
import Vue from 'vue'

import { Layout } from 'ant-design-vue'
import Setting from '@/components/Setting.vue'

const { Content } = Layout

export default Vue.extend({
  components: {
    Layout,
    Content,
    Setting,
  },
})
</script>

<style lang="less">
.ant-layout-content {
  min-height: calc(100vh - 64px);
}
</style>
