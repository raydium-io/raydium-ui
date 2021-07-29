<template>
  <Layout>
    <Head />
    <Setting />

    <Content>
      <div v-if="['swap', 'liquidity', 'farms'].includes(pageName) && showFlag" class="fc-container">
        <Alert type="warning" message="IMPORTANT" show-icon closable>
          <div slot="description">
            You have liquidity in a legacy pool. RAY-SOL, RAY-SRM, RAY-USDC and RAY-ETH pools are upgrading from the V3
            AMM contract to V4. As a result, liquidity in legacy V3 pools must migrate to new pools.
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
import { get, cloneDeep } from 'lodash-es'
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
  showFlag: boolean = false
  farms = [] as any

  @Watch('$route', { immediate: true, deep: true })
  onRouteChanged() {
    this.updateShow()
  }

  @Watch('$accessor.farm.farmInfo', { immediate: true, deep: true })
  onFarmChanged() {
    this.updateShow()
  }

  get farm() {
    return this.$accessor.farm
  }

  mounted() {
    this.updateShow()
  }

  updateShow() {
    this.pageName = this.$route.name ?? ''
    this.updateFarms()

    let showFlag: boolean = false
    for (const farm of this.farms) {
      if (farm.farmInfo.version === 3 && farm.farmInfo.legacy) {
        showFlag = true
      }
    }
    this.showFlag = showFlag
  }

  updateFarms() {
    const farms: any = []

    for (const [poolId, farmInfo] of Object.entries(this.farm.infos)) {
      // @ts-ignore
      if (!farmInfo.isStake) {
        let userInfo = get(this.farm.stakeAccounts, poolId)

        if (userInfo) {
          userInfo = cloneDeep(userInfo)

          const { depositBalance } = userInfo

          if (!depositBalance.isNullOrZero()) {
            farms.push({
              farmInfo,
              depositBalance
            })
          }
        }
      }
    }

    this.farms = farms
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
