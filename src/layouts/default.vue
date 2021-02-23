<template>
  <Layout>
    <Head />

    <Content>
      <Nuxt />
    </Content>
  </Layout>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

import { Layout } from 'ant-design-vue'

const { Content } = Layout

@Component({
  components: {
    Layout,
    Content,
  },
})
export default class DefaultLayout extends Vue {}
</script>

<style lang="less">
.ant-layout-content {
  min-height: calc(100vh - 64px);
}
</style>
