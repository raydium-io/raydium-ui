<template>
  <div :class="isMobile ? 'mobile' : 'pc'">
    <div class="big_div image_div" style="background: rgb(19, 26, 53)">
      <img src="../assets/background/info_background.svg" class="image" />
      <div class="node_div" style="padding-top: 70px">
        <a href="/">
          <img src="../assets/icons/logo-text.svg" class="big_logo" />
        </a>
      </div>
    </div>
    <div class="big_div div3">
      <div class="node_div">
        <div class="font_center">
          <div class="data_div">
            <div class="data_div_title font_color_3">Total Value Locked</div>
            <div class="data_div_num">
              ${{
                Math.round(tvl)
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              }}
            </div>
          </div>
          <div class="data_div">
            <div class="data_div_title font_color_3">24 Hour Volume</div>
            <div class="data_div_num">
              ${{
                Math.round(volume24h)
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              }}
            </div>
          </div>
          <div class="data_div">
            <div class="data_div_title font_color_3">RAY Price</div>
            <div class="data_div_num">
              ${{ (Math.round(prices.RAY * 100) / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') }}
            </div>
          </div>
          <div style="clear: both"></div>
        </div>
        <div class="font_color_1 title">Raydium</div>
        <div class="font_color_3 title_node">
          Raydium is an on-chain order book automated market maker (AMM) that enables lightning-fast trades, shared
          liquidity and new features for earning yield.
        </div>
        <div class="font_color_2 title_node_2">
          Raydium provides on-chain liquidity to Serum's central limit order book, meaning that Raydium's users and
          liquidity pools have access to the order flow and liquidity of the entire Serum ecosystem, and vice versa. All
          of this is supercharged by building on Solana, an incredibly fast and efficient blockchain.
        </div>
        <div>
          <a href="https://coinmarketcap.com/currencies/raydium/" target="_blank">
            <button class="button_link">
              COINMARKETCAP
              <div class="button_link_coin">▶</div>
            </button>
          </a>
          <a href="https://www.coingecko.com/en/coins/raydium" target="_blank">
            <button class="button_link">
              COINGECKO
              <div class="button_link_coin">▶</div>
            </button>
          </a>
        </div>
      </div>
    </div>
    <div class="big_div div4">
      <div class="node_div">
        <div class="tokenomics_div">
          <div class="font_color_1 title">Tokenomics</div>
          <ul class="font_color_2 node">
            <li>555 million RAY hard cap</li>
            <li>The total RAY mining reserve consists of 34% of all tokens, or 188.7m RAY</li>
            <li>Emissions will last for approximately 36 months, with halvenings occurring every six months</li>
            <li>
              Emissions at launch are approximately 1% per month, this will increase as the number of users and LPs grow
              and then slowly decline according to a 36 month emissions schedule.
            </li>
          </ul>
        </div>
        <div class="tokenomics_div">
          <div class="font_color_1 title">Locked Token Distribution</div>
          <ul class="font_color_2 node">
            <li>
              Team, advisors and seed funding tokens (25.9% of total) are locked with a 1 year cliff and unlock linearly
              after that for the following 24 months.
            </li>
            <li>
              Community Bonfida pool sale tokens, 1.1% of total, have a 1 year lock after which they will be fully
              unlocked.
            </li>
          </ul>
        </div>
        <div style="clear: both"></div>
      </div>
    </div>
    <div class="big_div image_div div5">
      <img src="../assets/background/info_background2.svg" class="image2" />
      <div class="node_div">
        <div class="circulating_div">
          <div class="font_color_1 title">Circulating Token Supply</div>
          <ul class="font_color_2 node">
            <li>Initial circulating supply is 2% or approximately or 11m tokens</li>
            <li>An additional 1% or 5.5m tokens are being used for Raydium liquidity pools</li>
          </ul>
          <div class="font_color_3 node_2">Funding and Stakeholders (as a % of total tokens)</div>
          <div style="width: 100%">
            <div class="funding_and_stakeholders_table_line">
              <div class="font_color_1 value">Seed Funding</div>
              <div class="font_color_3 value" style="text-align: right">3.9%</div>
            </div>
            <div class="funding_and_stakeholders_table_line">
              <div class="font_color_1 value">Liquidity</div>
              <div class="font_color_3 value" style="text-align: right">3.0%</div>
            </div>
            <div class="funding_and_stakeholders_table_line">
              <div class="font_color_1 value">EcoSerum</div>
              <div class="font_color_3 value" style="text-align: right">1.0%</div>
            </div>
            <div class="funding_and_stakeholders_table_line">
              <div class="font_color_1 value">Community Bonfida Pools</div>
              <div class="font_color_3 value" style="text-align: right">1.1%</div>
            </div>
            <div class="funding_and_stakeholders_table_line">
              <div class="font_color_1 value">Solana Foundation</div>
              <div class="font_color_3 value" style="text-align: right">0.4%</div>
            </div>
          </div>
        </div>
        <div style="clear: both"></div>
      </div>
    </div>
    <div class="big_div div6">
      <div class="node_div">
        <div class="font_color_1 Allocation">Allocation Breakdown</div>
        <div class="font_color_3 Allocation_table">
          <div class="allocation_breakdown_table_line">
            <div class="item font_color_1 item_title">Team (locked 1-3)</div>
            <div class="item num item_other">20%</div>
            <div class="item value item_other">111,000,000</div>
          </div>
          <div class="allocation_breakdown_table_line">
            <div class="item font_color_1 item_title">Advisors (locked 1-3)</div>
            <div class="item num item_other">2%</div>
            <div class="item value item_other">11,100,000</div>
          </div>
          <div class="allocation_breakdown_table_line">
            <div class="item font_color_1 item_title">Partnership & Ecosystem</div>
            <div class="item num item_other">30%</div>
            <div class="item value item_other">166,500,000</div>
          </div>
          <div class="allocation_breakdown_table_line">
            <div class="item font_color_1 item_title">Mining Pool</div>
            <div class="item num item_other">34%</div>
            <div class="item value item_other">188,700,000</div>
          </div>
          <div class="allocation_breakdown_table_line">
            <div class="item font_color_1 item_title">Liquidity Reserve</div>
            <div class="item num item_other">8%</div>
            <div class="item value item_other">44,400,000</div>
          </div>
          <div class="allocation_breakdown_table_line">
            <div class="item font_color_1 item_title">Community & Seed (locked 1-3)</div>
            <div class="item num item_other">6%</div>
            <div class="item value item_other">33,300,000</div>
          </div>
        </div>
      </div>
    </div>
    <div class="big_div div7">
      <div class="node_div">
        <div class="font_color_1 team_title">Team</div>
        <div style="font-weight: 100">
          <div class="team_table_line">
            <div class="font_color_3 name">AlphaRay</div>
            <div class="font_color_2 value">
              AlphaRay leads overall strategy, operations, product direction and business development for Raydium. With
              a background in algorithmic trading in commodities, Alpha transitioned to market making and liquidity
              providing for cryptocurrency in 2017 and hasn't looked back. After diving into DeFi in the summer of 2020,
              Alpha saw a market need for an order book AMM to aggregate liquidity, and with the release of Serum,
              pulled together a team of experienced trading developers to tackle the problem head on.
            </div>
            <div style="clear: both"></div>
          </div>
          <div class="team_table_line">
            <div class="font_color_3 name">XRay</div>
            <div class="font_color_2 value">
              XRay is Raydium's Chief of Technology and Dev Team leader. X has 8 years of experience as a trading and
              low latency systems architect for both traditional and crypto markets. X designs all of Raydium’s systems
              and infrastructure as needed.
            </div>
            <div style="clear: both"></div>
          </div>
          <div class="team_table_line">
            <div class="font_color_3 name">GammaRay</div>
            <div class="font_color_2 value">
              GammaRay heads up marketing and communications while also playing a key role in strategy and product
              direction. Gamma spent a large part of his career at a leading data analytics and market research firm,
              working on both client engagements and corporate marketing. Prior to Raydium, Gamma's focus within
              cryptocurrency has been technical analysis and discretionary trading.
            </div>
            <div style="clear: both"></div>
          </div>
          <div class="team_table_line">
            <div class="font_color_3 name">StingRay</div>
            <div class="font_color_2 value">
              A developer with an eye for detail and innovative solutions, StingRay is an experienced operating system
              and trading developer. With a range of talents garnered through working on the systems kernel for an
              autonomous car driving company, StingRay shifted focus to trading and is the senior developer for
              Raydium's on-chain order book AMM.
            </div>
            <div style="clear: both"></div>
          </div>
          <div class="team_table_line" style="border: none">
            <div class="font_color_3 name">RayZor</div>
            <div class="font_color_2 value">
              RayZor mined his first BTC in 2012, his first ETH in 2015 and his first SUSHI since day one. He’s written
              many smart contracts on Ethereum as well as toying around with the BSC. With a degree in systems security
              engineering and significant experience working as a white hat hacker, RayZor ensures all the capital in
              Raydium is secure.
            </div>
            <div style="clear: both"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'

@Component({
  layout: 'single',

  head: {
    title: 'Raydium Info'
  },

  async asyncData({ $accessor, $api }) {
    if (!$accessor.price.initialized) {
      await $accessor.price.requestPrices()
    }

    const { tvl, volume24h } = await $api.getInfo()
    return { tvl, volume24h }
  }
})
export default class Info extends Vue {
  tvl = 0
  volume24h = 0
  timer: number | undefined = undefined

  get isMobile() {
    return this.$accessor.isMobile
  }

  get prices() {
    return this.$accessor.price.prices
  }

  mounted() {
    this.timer = window.setInterval(this.getInfo, 1000 * 30)
  }

  beforeDestroy() {
    window.clearInterval(this.timer)
  }

  async getInfo() {
    const { tvl, volume24h } = await this.$api.getInfo()
    this.tvl = tvl
    this.volume24h = volume24h
  }
}
</script>

<style lang="less" scoped>
.mobile {
  .div7 {
    padding-top: 50px;
    padding-bottom: 50px;
    background: #1a2843;
  }

  .div6 {
    padding-top: 50px;
    padding-bottom: 50px;
    background: #131e39;
  }

  .div5 {
    padding-top: 50px;
    padding-bottom: 50px;
    background: #1a2843;
  }

  .div4 {
    padding-top: 50px;
    padding-bottom: 50px;
    background: #131e39;
  }

  .div3 {
    padding-top: 30px;
    padding-bottom: 50px;
    background: #131a35;
  }

  .big_logo {
    width: 180px;
  }

  .big_div {
    width: 100%;
  }

  .node_div {
    width: 80%;
    margin: 0 auto;
  }

  .font_color_1 {
    color: rgba(241, 241, 242, 1);
  }

  .font_color_2 {
    color: #bbbebc;
  }

  .font_color_3 {
    color: #84879c;
  }

  .font_center {
    text-align: center;
  }

  .title {
    font-size: 45px;
    padding-top: 50px;
  }

  .title_node {
    font-size: 22px;
    width: 90%;
  }

  .title_node_2 {
    font-size: 18px;
    width: 90%;
    padding-top: 25px;
  }

  .data_div {
    width: 90%;
    display: inline-block;
    border: 1px #05bec5 solid;
    margin-bottom: 30px;

    .data_div_num {
      font-size: 30px;
      padding-top: 15px;
      padding-bottom: 20px;
      font-weight: 100;
    }

    .data_div_title {
      font-size: 22px;
      padding-top: 23px;
    }
  }

  .tokenomics_div {
    width: 100%;

    .title {
      font-size: 25px;
      padding-bottom: 20px;
    }

    .node {
      font-size: 18px;
      line-height: 1.4;
    }
  }

  .circulating_div {
    .title {
      font-size: 25px;
      font-weight: 100;
    }

    .node {
      font-size: 18px;
      padding-top: 10px;
    }

    .node_2 {
      font-size: 18px;
      padding: 10px 0;
    }
  }

  .Allocation {
    font-size: 25px;
    text-align: center;
    padding-bottom: 20px;
  }

  .Allocation_table {
    font-size: 16px;

    .num {
      text-align: left;
    }

    .value {
      text-align: right;
    }
  }

  .team_title {
    font-size: 30px;
    padding-bottom: 20px;
  }

  .button_link {
    font-size: 16px;
    background: rgba(90, 196, 190, 0.1);
    padding: 13px 24px;
    border: 1px solid #5ac4be;
    margin-top: 20px;
    border-radius: 4px;
    width: 90%;
    text-align: left;

    .button_link_coin {
      font-size: 5px;
      display: inline-block;
      padding-left: 20px;
    }
  }

  .image_div {
    position: relative;

    .image {
      position: absolute;
      width: 932px;
      height: 780.35px;
      right: 0;
      top: 0;
      z-index: 1;
    }

    .image2 {
      position: absolute;
      width: 70%;
      top: -70px;
    }
  }

  .funding_and_stakeholders_table_line {
    border-bottom: 1px solid rgba(119, 227, 239, 1);
    padding: 10px 0;
    font-size: 15px;

    .value {
      display: inline-block;
      width: 49%;
    }
  }

  .allocation_breakdown_table_line {
    border-bottom: 1px solid rgba(119, 227, 239, 1);
    padding: 16px 0;

    .item_other {
      display: inline-block;
      width: 49%;
    }

    .item_title {
      width: 100%;
    }
  }

  .team_table_line {
    border-bottom: rgba(128, 128, 255, 1) 1px solid;
    margin: 10px 0;
    padding-bottom: 34px;
    font-size: 20px;

    .name {
      font-size: 25px;
      margin-bottom: 10px;
    }

    .value {
      font-size: 16px;
    }
  }
}

.pc {
  .div7 {
    padding-top: 110px;
    padding-bottom: 100px;
    background: #1a2843;
  }

  .div6 {
    padding-top: 110px;
    padding-bottom: 120px;
    background: #131e39;
  }

  .div5 {
    padding-top: 110px;
    padding-bottom: 120px;
    background: #1a2843;
  }

  .div4 {
    padding-top: 110px;
    padding-bottom: 100px;
    background: #131e39;
  }

  .div3 {
    padding-top: 100px;
    padding-bottom: 120px;
    background: #131a35;
  }

  .big_logo {
    width: 260px;
    height: 80px;
  }

  .big_div {
    width: 100%;
  }

  .node_div {
    width: 80%;
    margin: 0 auto;

    .title {
      font-size: 65px;
      padding-top: 100px;
    }
  }

  .font_color_1 {
    color: rgba(241, 241, 242, 1);
  }

  .font_color_2 {
    color: #bbbebc;
  }

  .font_color_3 {
    color: #84879c;
  }

  .font_center {
    text-align: center;
  }

  .title_node {
    font-size: 32px;
    width: 60%;
  }

  .title_node_2 {
    font-size: 20px;
    width: 50%;
    padding-top: 25px;
  }

  .data_div {
    width: 30%;
    min-height: 189px;
    display: inline-block;
    border: 1px #05bec5 solid;
    margin: 1%;

    .data_div_num {
      font-size: 40px;
      padding-top: 15px;
      padding-bottom: 40px;
      font-weight: 100;
    }

    .data_div_title {
      font-size: 32px;
      padding-top: 43px;
    }
  }

  .tokenomics_div {
    width: 50%;
    float: left;

    .title {
      font-size: 40px;
      padding-bottom: 40px;
    }

    .node {
      font-size: 20px;
      width: 90%;
      line-height: 1.5;
    }
  }

  .circulating_div {
    float: right;
    width: 50%;

    .title {
      font-size: 40px;
      font-weight: 100;
    }

    .node {
      font-size: 20px;
      padding-top: 20px;
    }

    .node_2 {
      font-size: 20px;
      padding: 30px 0;
    }
  }

  .Allocation {
    font-size: 40px;
    text-align: center;
    padding-bottom: 60px;
  }

  .Allocation_table {
    font-size: 20px;

    .num {
      text-align: center;
    }

    .value {
      text-align: right;
    }
  }

  .team_title {
    font-size: 40px;
    padding-bottom: 60px;
  }

  .button_link {
    font-size: 16px;
    background: rgba(90, 196, 190, 0.1);
    padding: 13px 24px;
    border: 1px solid #5ac4be;
    margin-top: 50px;
    border-radius: 4px;
    margin-right: 30px;

    .button_link_coin {
      font-size: 5px;
      display: inline-block;
      padding-left: 20px;
    }
  }

  .image_div {
    position: relative;

    .image {
      position: absolute;
      width: 932px;
      height: 780.35px;
      right: 0;
      top: 0;
      z-index: 1;
    }

    .image2 {
      position: absolute;
      width: 932px;
      height: 780.35px;
      top: -70px;
    }
  }

  .funding_and_stakeholders_table_line {
    border-bottom: 1px solid rgba(119, 227, 239, 1);
    padding: 16px 0;
    font-size: 20px;

    .value {
      display: inline-block;
      width: 49%;
    }
  }

  .allocation_breakdown_table_line {
    border-bottom: 1px solid rgba(119, 227, 239, 1);
    padding: 16px 0;

    .item {
      display: inline-block;
      width: 32%;
    }
  }

  .team_table_line {
    border-bottom: rgba(128, 128, 255, 1) 1px solid;
    margin: 34px 0;
    padding-bottom: 34px;
    font-size: 20px;

    .name {
      float: left;
      width: 40%;
      font-size: 34px;
    }

    .value {
      float: left;
      width: 60%;
    }
  }
}
</style>
