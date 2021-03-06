<template>
  <div>
    <div class="big_div image_div">
      <img src="../assets/background/index_background.svg" class="image" />
      <div class="node_div" style="padding-top: 70px">
        <img src="../assets/icons/logo-text.svg" width="220" height="60" />
      </div>
    </div>
    <div class="big_div image_div" style="padding-top: 100px; padding-bottom: 300px">
      <div class="node_div">
        <div class="title">An avenue for</div>
        <div class="title">the evolution of <span class="defiText">DeFi</span></div>
        <div class="subtitle">Next-level liquidity. Friction-less yield. Light-speed swaps.</div>
        <div style="padding-top: 150px">
          <div class="card button_div" style="display: inline-block">
            <a href="swap" style="display: inline-block; width: 100%; height: 100%">
              <div class="card-body" style="padding: 0; height: 100%">
                <div class="button_font">Launch app</div>
              </div></a
            >
          </div>
          <div class="button_div_line button_div" style="display: inline-block">
            <a href="https://raydium.gitbook.io/raydium/" style="display: inline-block; width: 100%; height: 100%">
              <div class="" style="padding: 0; height: 100%">
                <div class="button_font">READ MORE</div>
              </div></a
            >
          </div>
        </div>
      </div>
    </div>
    <div class="big_div image_div" style="padding-top: 100px; padding-bottom: 300px">
      <img src="../assets/background/index_background2.svg" class="image2" />
      <div class="node_div">
        <div class="title_line">A Bridge for <span class="weight_title">DeFi</span></div>
        <div class="node_p font_color_2" style="width: 450px">
          Raydium offers DeFi and AMM projects a clear path for bridging platforms and liquidity with the evolved
          capabilities of Solana and Serum.
        </div>
      </div>
    </div>
    <div class="big_div image_div" style="padding-top: 150px; padding-bottom: 300px">
      <img src="../assets/background/index_background3.svg" class="image3" />
      <div class="node_div" style="width: 40%; margin-left: 60%">
        <div class="title_line">Ecosystem-Wide <span class="weight_title">Liquidity</span></div>
        <div class="node_p font_color_2" style="width: 450px">
          Unlike other AMMs, Raydium provides on-chain liquidity to a central limit order book, meaning that pools have
          access to all order flow and liquidity on Serum.
        </div>
      </div>
    </div>
    <div class="big_div image_div" style="padding-top: 150px; padding-bottom: 120px">
      <img src="../assets/background/index_background4.svg" class="image4" />
      <div class="node_div" style="width: 40%; margin-left: 20%">
        <div class="title_line">The Speed of <span class="weight_title">Solana</span></div>
        <div class="node_p font_color_2" style="width: 450px">
          Raydium is built on the Solana blockchain, enabling faster transactions, significantly lower fees, and
          enhanced scalability.
        </div>
      </div>
    </div>
    <div class="big_div" style="padding-top: 150px; padding-bottom: 120px">
      <div class="node_div" style="text-align: center">
        <div class="title_line">Our <span class="weight_title">Partners</span></div>
        <img src="../assets/background/index_background5.svg" style="width: 70%; margin-top: 5%" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  layout: 'no_head'
})
</script>

<style lang="less" scoped>
.container {
  max-width: 450px;

  .change-side {
    div {
      height: 32px;
      width: 32px;
      border-radius: 50%;
      background: #000829;
      cursor: pointer;
    }
  }
}
.big_div {
  width: 100%;
}
.node_div {
  width: 1400px;
  margin: 0 auto;
}
.font_color_1 {
  color: rgba(241, 241, 242, 1);
}
.font_color_2 {
  color: #84879c;
}
.font_center {
  text-align: center;
}
.image_div {
  position: relative;
  .image {
    position: absolute;
    width: 932px;
    height: 780.35px;
    right: 0;
    z-index: -1;
  }
  .image2 {
    position: absolute;
    right: 0;
    z-index: -1;
    top: -50px;
  }
  .image3 {
    position: absolute;
    left: 20%;
    z-index: -1;
    top: 0;
  }
  .image4 {
    position: absolute;
    right: 20%;
    z-index: -1;
    top: 30px;
  }
}
.title {
  font-weight: 600;
  letter-spacing: -0.02em;
  color: #f1f1f2;
  font-size: 6.5vw;
  line-height: 1.1;
}
.defiText {
  background: -webkit-linear-gradient(90deg, #5ac4be 0%, #3772ff 50%, #c200fb 100%);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.subtitle {
  font-weight: 300;
  letter-spacing: -0.02em;
  color: #f1f1f2;
  opacity: 0.5;
  font-size: 3vw;
  padding-top: 40px;
}
.button_div {
  width: 220px;
  height: 60px;
  .button_font {
    text-transform: uppercase;
    color: #fff;
    margin-top: 15px;
    text-align: center;
    font-weight: bold;
    font-size: 20px;
  }
}
.button_div_line {
  border: 1px solid #fff;
  border-radius: 5px;
  margin-left: 40px;
}
.title_line {
  font-size: 40px;
  .weight_title {
    font-weight: bold;
  }
}
.node_p {
  font-size: 20px;
}
</style>
