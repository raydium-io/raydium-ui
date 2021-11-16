<template>
  <div class="winner-list container">
    <h2 class="tip">(Use <code>ctrl F</code> to search the first 6 digets of your wallet)</h2>
    <div class="note">Rewards have already been sent to winning addresses</div>
    <div class="card">
      <div class="card-body winner-list-gird">
        <h2 class="title">First 4,000</h2>
        <div v-for="item in winnerList['4000 winner list']" :key="item.owner" class="reward-item">
          <label>Address</label>
          <div class="owner">{{ item.owner }}</div>
          <label>Reward</label>
          <div class="reward">${{ item.reward }}</div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-body winner-list-gird">
        <h2 class="title">Lucky Draw Pool</h2>
        <div v-for="item in winnerList['lucky list']" :key="item.owner" class="reward-item">
          <label>Address</label>
          <div class="owner">{{ item.owner }}</div>
          <label>Reward</label>
          <div class="reward">${{ item.reward }}</div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-body winner-list-gird">
        <h2 class="title">Top 5</h2>
        <div v-for="item in winnerList['top 5']" :key="item.owner" class="reward-item">
          <label>Address</label>
          <div class="owner">{{ item.owner }}</div>
          <label>Reward</label>
          <div class="reward">${{ item.reward }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
/**
 * @file it is a winner-list panel for airdrop activity. **useless** now.
 */
import { Vue, Component } from 'nuxt-property-decorator'
import { Table, Progress, Tooltip, Button, Input, Icon } from 'ant-design-vue'

const getWinnerList = () => import('static/winner-list.json' as any).then((m) => m.default || m)

@Component({
  head: {
    title: 'winner list'
  },

  components: {
    Table,
    Progress,
    Tooltip,
    Button,
    Input,
    Icon
  },

  async asyncData() {
    const winnerList = await getWinnerList()

    return { winnerList }
  }
})
export default class WinnerList extends Vue {}
</script>

<style lang="less" scoped>
.tip {
  margin: 48px auto;
  text-align: center;
  font-size: 36px;
}
.note {
  text-align: center;
}

.container {
  max-width: 1200px;

  .lp-icons {
    .icons {
      margin-right: 8px;
    }
  }
}
.card {
  margin-top: 40px;
}
.card-body.winner-list-gird {
  padding-top: 25px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  .title {
    grid-column: ~'1 / -1';
    text-align: center;
  }
  .reward-item {
    padding: 8px;
    background-color: rgba(255, 255, 255, 0.027);
    display: grid;
    justify-items: center;
    label {
      font-size: 0.8em;
      opacity: 0.6;
      margin-top: 8px;
    }
    .owner,
    .reward {
      font-size: 18px;
    }
  }
}
</style>

<style lang="less">
::-webkit-scrollbar {
  display: none; /* Chrome Safari */
}
.pool {
  .card-body {
    overflow-x: scroll;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
}

.ant-table-thead > tr > th.ant-table-column-sort {
  background: transparent;
}
.ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled) {
  color: #fff;
  background: #1c274f;
  border: 1px solid #d9d9d9;
  box-shadow: none;
  border-left-width: 0;
}
.ant-radio-button-wrapper {
  color: #aaa;
  background: transparent;
  // border: 1px solid #d9d9d9;
}
.ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled):hover {
  border: 1px solid #d9d9d9;
  box-shadow: none;
}
.ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled):first-child {
  border: 1px solid #d9d9d9;
}
.search-btn {
  background: transparent !important;
  border: none !important;
}
.input-search .ant-input {
  height: 32.01px !important;
}
</style>
