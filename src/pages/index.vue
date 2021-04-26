<template>
  <div>
    <div class="big_div image_div hidden" style="padding-bottom: 200px">
      <img src="../assets/background/index_background.svg" class="image" />
      <div class="node_div logo">
        <a href="/">
          <img src="../assets/icons/logo-text.svg" width="220" height="60" />
        </a>
      </div>
      <div class="node_div">
        <div class="title">An avenue for</div>
        <div class="title">the evolution of <span class="defiText">DeFi</span></div>
        <div class="subtitle">Next-level liquidity. Friction-less yield. Light-speed swaps.</div>
        <div style="padding-top: 36px; position: relative">
          <Button size="large" ghost class="button_div" style="position: absolute; z-index: 999">
            <a href="swap" style="display: inline-block; width: 100%; height: 100%">
              <div class="card-body" style="padding: 0; height: 100%">
                <div class="button_font">Launch app</div>
              </div></a
            >
          </Button>
          <div class="button_div_line button_div" style="display: inline-block; position: absolute; z-index: 999">
            <a
              href="https://raydium.gitbook.io/raydium/"
              target="_blank"
              style="display: inline-block; width: 100%; height: 100%"
            >
              <div class="" style="padding: 0; height: 100%">
                <div class="button_font">READ MORE</div>
              </div></a
            >
          </div>
        </div>
        <div>
          <img src="../assets/background/index_background6.svg" class="solana_log" />
          <div style="clear: both"></div>
        </div>
      </div>
    </div>
    <div class="big_div image_div hidden" style="padding-top: 100px; padding-bottom: 300px">
      <img src="../assets/background/index_background2.svg" class="image2" />
      <div class="node_div" style="z-index: 10">
        <div class="title_line">A Bridge for <span class="weight_title">DeFi</span></div>
        <div class="node_p font_color_2 node_width">
          Raydium offers DeFi and AMM projects a clear path for bridging platforms and liquidity with the evolved
          capabilities of Solana and Serum.
        </div>
      </div>
    </div>
    <div class="big_div" style="padding-top: 150px; padding-bottom: 300px">
      <div class="node_div image_div">
        <div class="float_right ecosystemwide">
          <div class="title_line text_align_right">
            Ecosystem-Wide <span class="weight_title text_align_right">Liquidity</span>
          </div>
          <div class="node_p font_color_2 text_align_right node_width">
            Unlike other AMMs, Raydium provides on-chain liquidity to a central limit order book, meaning that pools
            have access to all order flow and liquidity on Serum.
          </div>
        </div>
        <img src="../assets/background/index_background3.svg" class="image3" />
        <div style="clear: both"></div>
      </div>
    </div>
    <div class="big_div hidden" style="padding-top: 150px; padding-bottom: 120px">
      <div class="node_div image_div">
        <img src="../assets/background/index_background4.svg" class="image4" />
        <div class="title_line">The Speed of <span class="weight_title">Solana</span></div>
        <div class="node_p font_color_2 node_width">
          Raydium is built on the Solana blockchain, enabling faster transactions, significantly lower fees, and
          enhanced scalability.
        </div>
      </div>
    </div>
    <div class="big_div" style="padding-top: 150px; padding-bottom: 120px">
      <div class="node_div" style="text-align: center">
        <div class="title_line">Our <span class="weight_title">Partners</span></div>
        <img src="../assets/background/index_background5.svg" class="image5" style="margin-top: 5%" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'

import { Button } from 'ant-design-vue'

@Component({
  layout: 'single',

  components: {
    Button
  }
})
export default class Index extends Vue {}
</script>

<style lang="less" scoped>
@media only screen and (min-width: 700px) {
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
    width: 80%;
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
    }
    .image2 {
      position: absolute;
      right: 0;
      top: -50px;
    }
    .image3 {
      position: absolute;
      top: -50%;
      width: 450px;
      height: 500px;
    }
    .image4 {
      position: absolute;
      right: 0;
      top: -50%;
    }
  }
  .image5 {
    width: 70%;
  }
  .title {
    font-weight: 100;
    letter-spacing: -0.02em;
    color: #f1f1f2;
    font-size: 88px;
    line-height: 1.1;
  }
  .defiText {
    font-weight: 600;
    background: -webkit-linear-gradient(90deg, #5ac4be 0%, #3772ff 50%, #c200fb 100%);
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .subtitle {
    font-weight: 300;
    letter-spacing: -0.02em;
    color: #f1f1f2;
    opacity: 0.5;
    font-size: 32px;
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
    left: 220px;
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
  .solana_log {
    float: right;
    padding-top: 166px;
  }
  .float_left {
    float: left;
  }
  .float_right {
    float: right;
  }
  .ecosystemwide {
    padding-top: 40px;
  }
  .node_width {
    width: 450px;
  }
  .logo {
    padding-bottom: 170px;
    padding-top: 100px;
  }
}
@media screen and (max-width: 700px) {
  .hidden {
    word-break: keep-all;
    overflow: hidden;
    text-overflow: ellipsis;
  }
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
    width: 70%;
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
      // width: 932px;
      // height: 780.35px;
      right: 0;
      width: 100%;
    }
    .image2 {
      position: absolute;
      right: -90%;
      top: -40px;
      z-index: 0;
    }
    .image3 {
      position: absolute;
      top: -30%;
      width: 450px;
      height: 500px;
      left: -80%;
    }
    .image4 {
      position: absolute;
      right: -60%;
      top: 0;
    }
  }
  .title {
    font-weight: 100;
    letter-spacing: -0.02em;
    color: #f1f1f2;
    font-size: 9vw;
    line-height: 1.1;
  }
  .defiText {
    font-weight: 600;
    background: -webkit-linear-gradient(90deg, #5ac4be 0%, #3772ff 50%, #c200fb 100%);
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .subtitle {
    font-weight: 300;
    letter-spacing: -0.02em;
    color: #f1f1f2;
    opacity: 0.5;
    font-size: 32px;
    padding-top: 20px;
    width: 100%;
  }
  .button_div {
    width: 40%;
    min-width: 130px;
    height: 50px;
    .button_font {
      text-transform: uppercase;
      color: #fff;
      margin-top: 15px;
      text-align: center;
      font-weight: bold;
      font-size: 15px;
    }
  }
  .button_div_line {
    border: 1px solid #fff;
    border-radius: 5px;
    margin-left: 40px;
    left: 40%;
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
  .solana_log {
    float: right;
    padding-top: 66px;
  }
  .float_left {
    float: left;
  }
  .float_right {
    float: right;
  }
  .ecosystemwide {
    padding-top: 40px;
  }
  .text_align_right {
    text-align: right;
  }
  .logo {
    padding-top: 50px;
    padding-bottom: 50px;
  }
  .image5 {
    width: 100%;
  }
}
</style>
