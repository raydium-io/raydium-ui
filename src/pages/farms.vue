<template>
  <div class="container">
    <div class="page-head fs-container">
      <span class="title">Farms</span>
      <div class="buttons">
        <Tooltip placement="bottomRight">
          <template slot="title">
            <span>Quote auto refresh countdown</span>
          </template>
          <Progress type="circle" :width="20" :stroke-width="10" :percent="30" :show-info="false" />
        </Tooltip>
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        <Collapse expand-icon-position="right">
          <CollapsePanel v-for="farm in farms" :key="farm.lp.mintAddress" :header="farm.lp.name"> </CollapsePanel>
        </Collapse>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { Tooltip, Progress, Collapse } from 'ant-design-vue'

import { FarmInfo } from '@/utils/farms'

const CollapsePanel = Collapse.Panel

export default Vue.extend({
  components: {
    Tooltip,
    Progress,
    Collapse,
    CollapsePanel
  },

  data() {
    return {
      farms: [] as any
    }
  },

  computed: {
    ...mapState(['wallet', 'farm'])
  },

  watch: {
    // 监听池子状态变动
    'farm.infos': {
      handler(newInfos: any) {
        this.updateFarms(newInfos)
      },
      deep: true
    }
  },

  mounted() {
    this.updateFarms(this.farm.infos)
  },

  methods: {
    updateFarms(farmInfos: FarmInfo) {
      const farms: any = []

      for (const [mintAddress, farmInfo] of Object.entries(farmInfos)) {
        const { lp } = farmInfo
        console.log(mintAddress, farmInfo)

        farms.push({
          lp
        })
      }

      this.farms = farms
    }
  }
})
</script>

<style lang="less" scoped>
.container {
  max-width: 1200px;

  .card {
    .card-body {
      padding: 0;

      .ant-collapse {
        border: 0;

        .ant-collapse-item {
          border-bottom: 0;
        }

        .ant-collapse-item:not(:last-child) {
          border-bottom: 1px solid #d9d9d9;
        }
      }
    }
  }
}
</style>

<style lang="less">
.ant-collapse-header {
  padding: 24px 32px !important;
}
</style>
