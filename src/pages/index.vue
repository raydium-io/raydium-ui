<template>
  <div class="page-container">
    <nav class="home-navbar">
      <NuxtLink to="/swap/">
        <img src="../assets/icons/logo-text.svg" width="148" height="40" />
      </NuxtLink>

      <NuxtLink to="/swap/">
        <div class="card button-like forsted-glass teal">Launch app</div>
      </NuxtLink>
    </nav>

    <section class="section-app-face children-center grid-cover-container">
      <img src="../assets/background/index_background.svg" class="image-1" />
      <div class="grid-cover-content children-center">
        <div class="title">
          An avenue for <br />
          the evolution of <span class="defi-text">DeFi</span>
        </div>
        <div class="subtitle">Next-level <b>liquidity</b>. Friction-less <b>yield</b>. Light-speed <b>swaps</b>.</div>

        <div class="row-box-1">
          <NuxtLink to="/swap/">
            <div class="card button-like card-1">
              Launch app <img class="icon" src="../assets/icons/button-icon-right.svg" />
            </div>
          </NuxtLink>

          <a href="https://raydium.gitbook.io/raydium/" target="_blank">
            <div class="card button-like card-2 forsted-glass teal">
              Read docs <img class="icon" src="../assets/icons/gitbook.svg" />
            </div>
          </a>
        </div>

        <div class="row-box-2">
          <div class="card forsted-glass smoke">
            <div class="card-title">TOTAL VALUE LOCKED</div>
            <div class="value">$23333333</div>
          </div>

          <div class="card forsted-glass smoke">
            <div class="card-title">24H TRADING VOLUME</div>
            <div class="value">$1234567890</div>
          </div>
        </div>

        <img src="../assets/background/index_background6.svg" class="solana-logo" />
      </div>
    </section>

    <section class="section-features children-center grid-cover-container">
      <div class="image-2">
        <img src="../assets/background/index_background2.svg" />
      </div>
      <div class="content">
        <div class="title-text">
          <div class="line" />
          <div class="text">A suite of features powering the evolution of DeFi on Solana</div>
        </div>

        <div class="boards">
          <div class="card children-center forsted-glass lightsmoke">
            <div class="card icon-like forsted-glass teal">
              <img class="icon" src="../assets/icons/trade.svg" />
            </div>
            <div class="feature-title">Trade</div>
            <div class="feature-description">Swap or Trade quickly and cheaply.</div>
            <a class="card button-like forsted-glass teal" href="https://dex.raydium.io" target="_blank"
              >Enter Exchange</a
            >
          </div>

          <div class="card children-center forsted-glass lightsmoke">
            <div class="card icon-like forsted-glass teal">
              <img class="icon" src="../assets/icons/yield.svg" />
            </div>
            <div class="feature-title">Yield</div>
            <div class="feature-description">Earn yield through fees and yield farms.</div>
            <NuxtLink to="/farms/">
              <div class="card button-like forsted-glass teal">Enter Farms</div>
            </NuxtLink>
          </div>

          <div class="card children-center forsted-glass lightsmoke">
            <div class="card icon-like forsted-glass teal">
              <img class="icon" src="../assets/icons/pool.svg" />
            </div>
            <div class="feature-title">Pool</div>
            <div class="feature-description">Provide liquidity for any SPL token.</div>
            <NuxtLink to="/liquidity/">
              <div class="card button-like forsted-glass teal">Add Liquidity</div>
            </NuxtLink>
          </div>

          <div class="card children-center forsted-glass lightsmoke">
            <div class="card icon-like forsted-glass teal">
              <img class="icon" src="../assets/icons/acceleRaytor.svg" />
            </div>
            <div class="feature-title">AcceleRaytor</div>
            <div class="feature-description">Launchpad for new Solana projects.</div>
            <NuxtLink to="/acceleRaytor/">
              <div class="card button-like forsted-glass teal">View Projects</div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <section class="section-features -2 children-center grid-cover-container">
      <img src="../assets/background/index_background3.svg" class="image-3" />
      <div class="content">
        <div class="title-text">
          <div class="line" />
          <div class="text">Raydium provides Ecosystem-Wide Liquidity for users and projects</div>
        </div>

        <div class="boards">
          <div class="card children-center forsted-glass smoke">
            <div class="card icon-like forsted-glass teal">
              <img class="icon" src="../assets/icons/order-book-AMM.svg" />
            </div>
            <div class="feature-title">Order Book AMM</div>
            <div class="feature-description">
              Raydium's AMM interacts with Serum's central limit order book, meaning that pools have access to all order
              flow and liquidity on Serum, and vice versa.
            </div>
          </div>

          <div class="card children-center forsted-glass smoke">
            <div class="card icon-like forsted-glass teal">
              <img class="icon" src="../assets/icons/best-price-swaps.svg" />
            </div>
            <div class="feature-title">Best Price Swaps</div>
            <div class="feature-description">
              Raydium determines whether swapping within a liquidity pool or through the Serum order book will provide
              the best price for the user, and executes accordingly.
            </div>
          </div>

          <div class="card children-center forsted-glass smoke">
            <div class="card icon-like forsted-glass teal">
              <img class="icon" src="../assets/icons/high-liquidity-launches.svg" />
            </div>
            <div class="feature-title">High-Liquidity Launches</div>
            <div class="feature-description">
              AcceleRaytor offers projects a straightforward 3 step process to raise funds, launch an IDO, and bootstrap
              liquidity on Raydium and Serum.
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section-partners children-center">
      <div class="title-text">
        <div class="line" />
        <div class="text">PARTNERS</div>
      </div>

      <div class="boards">
        <img src="../assets/icons/solana-text-logo.svg" />
        <img src="../assets/icons/serum-text-logo.svg" />
        <img src="../assets/icons/sushi-text-logo.svg" />
      </div>
    </section>
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

<style scoped>
/* utilities */

.card {
  padding: 12px 24px;
  border-radius: 6px;
}
.button-like {
  cursor: pointer;
  display: flex;
  align-items: center;
}

.icon {
  display: inline-block;
  width: 24px;
  height: 24px;
}

.forsted-glass {
  position: relative;
  backdrop-filter: blur(var(--blur-size));
  color: var(--text-color);
  border-radius: var(--border-radius);
  background: linear-gradient(135deg, var(--bg-board-color), var(--bg-board-color-2, var(--bg-board-color)));
}
.forsted-glass::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.4;
  background: transparent;
  border-radius: var(--border-radius);
  box-shadow: inset 0 0 0 1.5px var(--border-color);
  mask-image: radial-gradient(at -31% -58%, hsl(0, 0%, 0%, 0.5) 34%, transparent 60%),
    linear-gradient(to left, hsl(0, 0%, 0%, 0.5) 10%, transparent 30%),
    linear-gradient(hsl(0deg 0% 0% / 5%), hsl(0deg 0% 0% / 5%));
}
.forsted-glass.lightsmoke {
  --border-color: hsl(0, 0%, 100%);
  --bg-board-color: hsl(0, 0%, 100%, 0.08);
  --bg-board-color-2: hsl(0, 0%, 100%, 0);
  --text-color: hsl(0, 0%, 100%);
  --blur-size: 2px;
  --border-radius: 20px;
}
.forsted-glass.smoke {
  --border-color: hsl(0, 0%, 100%);
  --bg-board-color: hsl(0, 0%, 100%, 0.1);
  --text-color: hsl(0, 0%, 100%);
  --blur-size: 2px;
  --border-radius: 20px;
}
.forsted-glass.teal {
  --border-color: hsl(165, 87%, 65%);
  --bg-board-color: hsl(183, 67%, 54%, 0.2);
  --bg-board-color-2: hsl(183, 67%, 54%, 0);
  --text-color: hsl(183, 67%, 54%);
  --blur-size: 6px;
  --border-radius: 12px;
}

.children-center {
  display: grid;
  justify-items: center;
  align-items: center;
  grid-template-columns: 1fr;
}
.children-center,
.children-text-center > * {
  text-align: center;
}
.children-center,
.children-flex-content-center > * {
  justify-content: center;
}

.title-text {
  margin-bottom: 32px;
}
.title-text .line {
  margin: 8px auto;
  width: 40px;
  height: 1px;
  border-radius: 2px;
  background: radial-gradient(39.84% 47.5% at 96.82% 58.33%, #39d0d8 0%, #2b6aff 100%);
}

.grid-cover-container {
  place-items: center;
  display: grid;
}
.grid-cover-container > * {
  grid-area: 1 / 1;
}

.page-container {
  --text-primary: hsl(0, 0%, 100%);
  --text-secondary: hsl(222deg, 100%, 84%);

  background: left / cover url('../assets/background/index_page_background.svg'), #131a35;
  display: flow-root;
}

.home-navbar {
  display: flex;
  padding: 16px;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(16px);
}

.section-app-face {
  margin-bottom: 72px;
}
.section-app-face .title {
  font-weight: 300;
  font-size: 64px;
  line-height: 60px;
  color: var(--text-primary);
  margin-bottom: 16px;
}
.section-app-face .subtitle {
  font-size: 22px;
  line-height: 30px;
  color: var(--text-secondary);
  margin-bottom: 24px;
}
.section-app-face .defi-text {
  font-weight: 600;
  color: transparent;
  background: radial-gradient(circle at 100%, #39d0d8, #2b6aff);
  background-clip: text;
}
.section-app-face .row-box-1 {
  display: flex;
  gap: 32px;
  margin-bottom: 67px;
}
.section-app-face .row-box-1 .card-1 {
  border-radius: 12px;
  color: white;
}
.section-app-face .row-box-1 .card-1 .icon {
  width: 4px;
  height: 12px;
  margin-left: 4px;
}
.section-app-face .row-box-1 .card-2 .icon {
  width: 14px;
  height: 14px;
  margin-left: 4px;
}
.section-app-face .row-box-2 {
  display: flex;
  gap: 32px;
  margin-bottom: 36px;
}
.section-app-face .row-box-2 .card {
  padding: 24px 52px;
}
.section-app-face .row-box-2 .card .card-title {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}
.section-app-face .row-box-2 .card .value {
  font-weight: 500;
  font-size: 18px;
  color: var(--text-primary);
}

.section-features .image-2 {
  overflow: hidden;
  border-radius: 100px;
  background: #1e2160;
  box-shadow: inset 0 0 48px #ffffff42, 0 0 40px #ffffff24;
}
.section-features .image-2 img {
  opacity: 0.4;
}
.section-features .feature-title {
  font-weight: 600;
  font-size: 20px;
  color: var(--text-primary);
  margin-bottom: 8px;
}
.section-features .feature-description {
  font-size: 14px;
  line-height: 16px;
  color: var(--text-secondary);
}
.section-features .boards {
  display: flex;
  gap: 16px;
}
.section-features .boards > .card {
  padding: 24px;
}
.section-features .boards > .card > .card.icon-like {
  padding: 12px;
  margin-bottom: 12px;
}
.section-features .boards > .card > .feature-title {
  margin-bottom: 8px;
}
.section-features .boards > .card > .feature-description {
  margin-bottom: 20px;
}

.section-partners {
  margin-bottom: 64px;
}
.section-partners .boards {
  width: 100%;
  display: flex;
  justify-content: space-around;
}

.section-features.\-2 .image-3 {
  width: 100%;
}
.section-features.\-2 .boards {
  gap: 24px;
}
.section-features.\-2 .boards > .card {
  max-width: 360px;
}
</style>
