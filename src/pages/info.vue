<template>
  <div>
    <div class="big_div image_div" style="background: rgb(19, 26, 53)">
      <img src="../assets/background/info_background.svg" class="image" />
      <div class="node_div" style="padding-top: 70px">
        <a href="/">
          <img src="../assets/icons/logo-text.svg" width="260" height="80" />
        </a>
      </div>
    </div>
    <div class="big_div" style="padding-top: 100px; padding-bottom: 120px; background: #131a35">
      <div class="node_div">
        <div class="font_center">
          <div class="data_div">
            <div class="data_div_title font_color_3">Total Value Locked</div>
            <div class="data_div_num">
              ${{
                Math.round(tvl_farm + tvl_stake)
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              }}
            </div>
          </div>
          <div class="data_div">
            <div class="data_div_title font_color_3">24 Hour Volume</div>
            <div class="data_div_num">
              ${{
                Math.round(hour_volume_24)
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              }}
            </div>
          </div>
          <div class="data_div">
            <div class="data_div_title font_color_3">RAY Price</div>
            <div class="data_div_num">
              ${{ (Math.round(ray_price * 100) / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') }}
            </div>
          </div>
          <div style="clear: both"></div>
        </div>
        <div style="font-size: 65px; padding-top: 100px" class="font_color_1">Raydium</div>
        <div style="font-size: 32px; width: 950px" class="font_color_3">
          Raydium is an on-chain order book automated market maker (AMM) that enables lightning-fast trades, shared
          liquidity and new features for earning yield.
        </div>
        <div style="font-size: 20px; width: 850px; padding-top: 25px" class="font_color_2">
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
    <div class="big_div" style="padding-top: 110px; padding-bottom: 100px; background: #131e39">
      <div class="node_div">
        <div style="width: 50%; float: left">
          <div class="font_color_1" style="font-size: 40px; padding-bottom: 40px">Tokenomics</div>
          <ul class="font_color_2" style="font-size: 20px; width: 530px; line-height: 1.5">
            <li>555 million RAY hard cap</li>
            <li>The total RAY mining reserve consists of 34% of all tokens, or 188.7m RAY</li>
            <li>Emissions will last for approximately 36 months, with halvenings occurring every six months</li>
            <li>
              Emissions at launch are approximately 1% per month, this will increase as the number of users and LPs grow
              and then slowly decline according to a 36 month emissions schedule.
            </li>
          </ul>
        </div>
        <div style="width: 50%; float: left">
          <div class="font_color_1" style="font-size: 40px; padding-bottom: 40px">Locked Token Distribution</div>
          <ul class="font_color_2" style="font-size: 20px; width: 530px; line-height: 1.5">
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
    <div class="big_div image_div" style="padding-top: 110px; padding-bottom: 120px; background: #1a2843">
      <img src="../assets/background/info_background2.svg" class="image2" />
      <div class="node_div">
        <div style="float: right; width: 800px">
          <div class="font_color_1" style="font-size: 40px; font-weight: 100">Circulating Token Supply</div>
          <ul class="font_color_2" style="font-size: 20px; padding-top: 20px">
            <li>Initial circulating supply is 2% or approximately or 11m tokens</li>
            <li>An additional 1% or 5.5m tokens are being used for Raydium liquidity pools</li>
          </ul>
          <div class="font_color_3" style="font-size: 20px; padding: 30px 0">
            Funding and Stakeholders (as a % of total tokens)
          </div>
          <div style="width: 100%; font-size: 20px">
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
    <div class="big_div" style="padding-top: 110px; padding-bottom: 120px; background: #131e39">
      <div class="node_div">
        <div class="font_color_1" style="font-size: 40px; text-align: center; padding-bottom: 60px">
          Allocation Breakdown
        </div>
        <div class="font_color_3" style="font-size: 20px">
          <div class="allocation_breakdown_table_line">
            <div class="value font_color_1">Team (locked 1-3)</div>
            <div class="value" style="text-align: center">20%</div>
            <div class="value" style="text-align: right">111,000,000</div>
          </div>
          <div class="allocation_breakdown_table_line">
            <div class="value font_color_1">Advisors (locked 1-3)</div>
            <div class="value" style="text-align: center">2%</div>
            <div class="value" style="text-align: right">11,100,000</div>
          </div>
          <div class="allocation_breakdown_table_line">
            <div class="value font_color_1">Partnership & Ecosystem</div>
            <div class="value" style="text-align: center">30%</div>
            <div class="value" style="text-align: right">166,500,000</div>
          </div>
          <div class="allocation_breakdown_table_line">
            <div class="value font_color_1">Mining Pool</div>
            <div class="value" style="text-align: center">34%</div>
            <div class="value" style="text-align: right">188,700,000</div>
          </div>
          <div class="allocation_breakdown_table_line">
            <div class="value font_color_1">Liquidity Reserve</div>
            <div class="value" style="text-align: center">8%</div>
            <div class="value" style="text-align: right">44,400,000</div>
          </div>
          <div class="allocation_breakdown_table_line">
            <div class="value font_color_1">Community & Seed (locked 1-3)</div>
            <div class="value" style="text-align: center">6%</div>
            <div class="value" style="text-align: right">33,300,000</div>
          </div>
        </div>
      </div>
    </div>
    <div class="big_div" style="padding-top: 110px; padding-bottom: 100px; background: #1a2843">
      <div class="node_div">
        <div class="font_color_1" style="font-size: 40px; padding-bottom: 60px">Team</div>
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
import Vue from 'vue'
import { mapState } from 'vuex'
// import { FARMS } from '@/utils/farms'

export default Vue.extend({
  components: {},

  layout: 'no_head',

  data() {
    return {
      ray_price: 0,
      hour_volume_24: 0,
      tvl_farm: 0,
      timer: null as any,
      tvl_stake: 0
    }
  },

  computed: {
    ...mapState(['wallet', 'liquidity', 'price', 'farm'])
  },

  watch: {
    'liquidity.infos': {
      handler() {
        this.liquidity_infos_flush()
      },
      deep: true
    },
    'price.prices': {
      handler() {
        this.price_prices_flush()
      },
      deep: true
    },
    'farm.infos': {
      handler() {
        this.farm_infos_flush()
      },
      deep: true
    }
  },

  beforeDestroy() {
    clearInterval(this.timer)
  },

  mounted() {
    this.get_request_data()
    this.liquidity_infos_flush()
    this.farm_infos_flush()
    this.price_prices_flush()
    this.timer = setInterval(this.get_request_data, 1000 * 30)
  },

  methods: {
    liquidity_infos_flush() {
      let valueData = 0
      for (const itemInfo of Object.values(this.liquidity.infos)) {
        valueData +=
          (itemInfo as any).coin.balance.toEther().toNumber() * this.price.prices[(itemInfo as any).coin.symbol] * 2
      }
      this.tvl_farm = valueData
    },
    price_prices_flush() {
      this.ray_price = this.price.prices?.RAY
    },
    farm_infos_flush() {
      let stakeData = 0
      for (const item of Object.values(this.farm.infos)) {
        if ((item as any).isStake) {
          stakeData +=
            ((item as any).lp.balance.wei / 10 ** (item as any).lp.balance.decimals) *
            this.price.prices[(item as any).name]
        }
      }
      this.tvl_stake = stakeData
    },
    get_request_data() {
      this.$axios
        .get('https://api.raydium.io/ray/24_hour_volume', {
          params: {}
        })
        .then((res: any) => {
          this.hour_volume_24 = parseFloat(res.data)
        })
    }
  }
})
</script>

<style lang="less" scoped>
.big_div {
  width: 100%;
}
.node_div {
  width: 1250px;
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
.data_div {
  width: 360px;
  height: 189px;
  float: left;
  border: 1px #05bec5 solid;
  margin: 24px;
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
  .value {
    display: inline-block;
    width: 49%;
  }
}
.allocation_breakdown_table_line {
  border-bottom: 1px solid rgba(119, 227, 239, 1);
  padding: 16px 0;
  .value {
    display: inline-block;
    width: 33%;
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
</style>
