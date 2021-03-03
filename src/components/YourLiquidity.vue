<template>
  <div class="card">
    <div class="card-body">
      <div v-if="!wallet.connected" class="fc-container">
        <Button size="large" ghost @click="$store.dispatch('wallet/openModal')">
          Unlock Wallet
        </Button>
      </div>
      <Spin v-else :spinning="wallet.loading">
        <Icon slot="indicator" type="loading" style="font-size: 24px" spin />

        <Collapse
          v-for="liquidity in liquids"
          :key="liquidity.mintAddress"
          expand-icon-position="right"
        >
          <CollapsePanel class="liquidity-info" :header="liquidity.pool.name">
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
              <div>{{ liquidity.user.balance.format() }}</div>
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
      </Spin>
      <span>
        If you staked your LP tokens in a farm, unstake them to see them here.
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { Button, Collapse, Row, Col, Spin, Icon } from 'ant-design-vue'

import Liquidity from '@/utils/liquidity'

const CollapsePanel = Collapse.Panel

export default Vue.extend({
  components: {
    Button,
    Collapse,
    CollapsePanel,
    Row,
    Col,
    Spin,
    Icon,
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
        const liquidityPool = Liquidity.getByLpMintAddress(mintAddress)

        if (liquidityPool) {
          // @ts-ignore
          liquids.push({
            ...{ pool: liquidityPool },
            ...{ user: tokenAccount },
          })
        }
      }

      liquids = liquids.filter(
        // @ts-ignore
        (liquidity) => !liquidity.user.balance.wei.isZero()
      )

      this.liquids = liquids
    },
  },
})
</script>

<style lang="less">
@import '../styles/variables';
.ant-spin-container {
  display: grid;
  grid-auto-rows: auto;
  row-gap: 12px;

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
}
</style>
