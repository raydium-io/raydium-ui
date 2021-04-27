<template>
  <div class="accele-raytor-project container">
    <Row>
      <Col :span="16" class="preview">
        <div class="fs-container">
          <div class="fc-container">
            <img :src="importIcon(`/coins/${pool.base.symbol.toLowerCase()}.png`)" />
            <span class="symbol">{{ pool.base.symbol }}</span>
          </div>
          <div>
            <span class="access">
              <span v-if="pool.info.isRayPool" class="ray">
                <span>RAY Pool</span>
              </span>
              <span v-else class="community"><span>Community Pool</span></span>
            </span>
            <span class="status">
              <span v-if="pool.info.endTime < getUnixTs() / 1000" class="closed"> Closed </span>
              <span v-else-if="pool.info.startTime < getUnixTs() / 1000" class="open"> Open </span>
              <span v-else class="upcoming"> Upcoming </span>
            </span>
          </div>
        </div>
        <hr />
        <div class="fs-container">
          <div class="state">
            <span class="value"> {{ 50000 * pool.info.price }} {{ pool.quote.symbol }} </span>
            <span class="desc"> Total raise </span>
          </div>
          <div class="state">
            <span class="value"> {{ pool.info.price }} {{ pool.quote.symbol }} </span>
            <span class="desc"> Per {{ pool.base.symbol }} </span>
          </div>
          <div class="state">
            <span class="value"> {{ pool.info.minDepositLimit / 1e6 }} {{ pool.quote.symbol }}</span>
            <span class="desc"> Min. purchase limit </span>
          </div>
          <div class="state">
            <span class="value"> {{ pool.info.isRayPool ? 600 : 450 }} {{ pool.quote.symbol }}</span>
            <span class="desc"> Max. purchase limit </span>
          </div>
        </div>
        <Progress :percent="0" />
        <hr />
        <div class="fs-container">
          <div class="state">
            <span class="value"> 0 {{ pool.quote.symbol }} </span>
            <span class="desc"> Your deposit </span>
          </div>
          <div class="state">
            <span class="value"> 0 % </span>
            <span class="desc"> Your share </span>
          </div>
          <div class="state">
            <span class="value"> 0 {{ pool.base.symbol }} </span>
            <span class="desc"> Your allocation </span>
          </div>
        </div>
      </Col>
    </Row>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'

import { Row, Col, Progress } from 'ant-design-vue'

import { getUnixTs } from '@/utils'
import importIcon from '@/utils/import-icon'

@Component({
  head: {
    title: 'Raydium AcceleRaytor'
  },

  components: {
    Row,
    Col,
    Progress
  },

  async asyncData({ $accessor, params, error }) {
    if (!$accessor.ido.initialized) {
      await $accessor.ido.requestInfos()
    }
    const { id } = params
    const pool = $accessor.ido.pools.find((pool) => pool.idoId === id)

    if (pool) {
      return { pool }
    } else {
      error({ statusCode: 404, message: 'Project not found' })
    }
  }
})
export default class AcceleRaytor extends Vue {
  getUnixTs = getUnixTs
  importIcon = importIcon
}
</script>

<style lang="less" scoped>
.accele-raytor-project.container {
  max-width: 1200px;
}

hr {
  margin: 20px 0;
  border: 1px solid rgba(55, 114, 255, 0.2);
}

.preview {
  padding: 40px;
  background: #0f1429;
  border-radius: 32px 0 0 32px;

  img {
    width: 48px;
    height: 48px;
  }

  .symbol {
    margin-left: 16px;
    font-weight: 600;
    font-size: 24px;
    line-height: 34px;
  }

  .access {
    .community,
    .ray {
      padding: 5px 1px;
      border-radius: 16px;

      span {
        padding: 4px 14px;
        border-radius: 16px;
      }
    }

    .community {
      background: #364371;
    }

    .ray {
      background: linear-gradient(245.22deg, #c200fb 7.97%, #3772ff 49.17%, #3773fe 49.17%, #5ac4be 92.1%);

      span {
        background: #1c274f;
        opacity: 0.9;
      }
    }
  }

  .status {
    margin-left: 16px;

    .upcoming {
      padding: 4px 14px;
      border-radius: 16px;
      background: rgba(90, 196, 190, 0.2);
      border: 1px solid #5ac4be;
    }
  }

  .state {
    display: flex;
    flex-direction: column;

    .value {
      font-weight: 600;
      font-size: 16px;
      line-height: 22px;
    }

    .desc {
      color: rgba(241, 241, 242, 0.75);
      font-size: 12px;
      line-height: 22px;
    }
  }
}

.purchase {
  padding: 40px;
  background: linear-gradient(221.5deg, rgba(194, 0, 251, 0.1) 16.15%, rgba(194, 0, 251, 0) 84.46%),
    radial-gradient(
      53.22% 53.22% at 93.67% 75.22%,
      rgba(194, 0, 251, 0.1) 0%,
      rgba(90, 196, 190, 0.1) 55.21%,
      rgba(55, 114, 255, 0.1) 100%
    ),
    #131a35;
  border-radius: 0 32px 32px 0;

  .title {
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
  }

  .coin-input {
    padding: 16px;
    border: 1px solid rgba(241, 241, 242, 0.75);
    border-radius: 4px;

    .label {
      font-size: 12px;
      line-height: 20px;
      color: #f1f1f2;
      opacity: 0.5;
    }
  }
}
</style>

<style lang="less">
.ant-progress {
  margin-top: 20px;
}

.ant-progress-text {
  color: #f1f1f2;
}
</style>
