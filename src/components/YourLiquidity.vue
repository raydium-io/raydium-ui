<template>
  <div class="card">
    <div class="card-body">
      <Collapse
        v-for="liquidity in liquids"
        :key="liquidity.mintAddress"
        expand-icon-position="right"
      >
        <CollapsePanel class="liquidity-info" :header="liquidity.name">
          <div class="fs-container">
            <div>Pooled:</div>
            <div>1</div>
          </div>
          <div class="fs-container">
            <div>Pooled:</div>
            <div>1</div>
          </div>
          <div class="fs-container">
            <div>Your pool tokens:</div>
            <div>{{ liquidity.uiBalance }}</div>
          </div>
          <div class="fs-container">
            <div>Your pool share:</div>
            <div>%</div>
          </div>
          <Row :gutter="32" class="actions">
            <Col :span="12">
              <Button ghost> Add </Button>
            </Col>
            <Col :span="12">
              <Button ghost> Remove </Button>
            </Col>
          </Row>
        </CollapsePanel>
      </Collapse>
      <span>
        If you staked your LP tokens in a farm, unstake them to see them here.
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { Collapse, Row, Col } from 'ant-design-vue'

import { getPoolByLpMintAddress } from '@/utils/pools'

const CollapsePanel = Collapse.Panel

export default Vue.extend({
  components: {
    Collapse,
    CollapsePanel,
    Row,
    Col,
  },

  data() {
    return {
      loading: false,
      liquids: [] as any,
    }
  },

  computed: {
    ...mapState(['wallet']),
  },

  watch: {
    'wallet.tokenAccounts': {
      handler(newTokenAccounts: any) {
        this.updateLiquids(newTokenAccounts)
      },
      deep: true,
    },
  },

  mounted() {
    this.updateLiquids(this.wallet.tokenAccounts)
  },

  methods: {
    updateLiquids(tokenAccounts: any) {
      let liquids = []

      for (const [mintAddress, tokenAccount] of Object.entries(tokenAccounts)) {
        const liquidityPool = getPoolByLpMintAddress(mintAddress)

        if (liquidityPool) {
          // @ts-ignore
          liquids.push({ ...liquidityPool, ...tokenAccount })
        }
      }

      liquids = liquids.filter((liquidity) => liquidity.uiBalance !== 0)

      this.liquids = liquids
    },
  },
})
</script>

<style lang="less">
@import '../styles/variables';

.liquidity-info {
  .ant-collapse-content-box {
    display: grid;
    grid-auto-rows: auto;
    row-gap: 8px;
    font-size: 16px;
    line-height: 24px;

    .actions {
      margin-top: 10px;

      button {
        width: 100%;
      }
    }
  }
}
</style>
