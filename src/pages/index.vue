<template>
  <div class="page-container">
    <nav class="home-navbar">
      <div class="logo">
        <NuxtLink to="/">
          <img src="../assets/icons/logo-text.svg" width="148" height="40" />
        </NuxtLink>
      </div>
      <div class="card cursor-pointer forsted-glass teal">Launch app</div>
    </nav>

    <section class="section-app-face children-center grid-cover-container">
      <img src="../assets/background/index_background.svg" class="image-1" />
      <div class="grid-cover-content children-center">
        <div class="title">An avenue for</div>
        <div class="title">the evolution of <span class="defiText">DeFi</span></div>
        <div class="subtitle">Next-level liquidity. Friction-less yield. Light-speed swaps.</div>

        <div style="padding-top: 36px; position: relative">
          <NuxtLink to="/swap/" style="display: inline-block; width: 100%; height: 100%">
            <div class="card-body" style="padding: 0; height: 100%">
              <div class="button_font">Launch app</div>
            </div>
          </NuxtLink>
          <div class="button_div_line button_div" style="display: inline-block; position: absolute; z-index: 999">
            <a href="https://raydium.gitbook.io/raydium/" target="_blank"> READ MORE </a>
          </div>
        </div>

        <img src="../assets/background/index_background6.svg" class="solana-log" />
      </div>
    </section>

    <section class="section-features children-center grid-cover-container">
      <img src="../assets/background/index_background2.svg" class="image-2" />
      <div class="content">
        <div class="title-text">
          <div class="line" />
          <div class="text">A suite of features powering the evolution of DeFi on Solana</div>
        </div>

        <div class="boards">
          <div class="card children-center forsted-glass lightsmoke">
            <div class="card forsted-glass teal">
              <img class="icon" src="../assets/icons/trade.svg" />
            </div>
            <div class="feature-title">Trade</div>
            <div class="feature-description">Swap or Trade quickly and cheaply</div>
            <div class="card forsted-glass teal">Enter Exchange</div>
          </div>

          <div class="card children-center forsted-glass lightsmoke">
            <div class="card forsted-glass teal">
              <img class="icon" src="../assets/icons/yield.svg" />
            </div>
            <div class="feature-title">Yield</div>
            <div class="feature-description">Earn yield through fees and yield farms</div>
            <div class="card forsted-glass teal">Enter Farms</div>
          </div>

          <div class="card children-center forsted-glass lightsmoke">
            <div class="card forsted-glass teal">
              <img class="icon" src="../assets/icons/pool.svg" />
            </div>
            <div class="feature-title">Pool</div>
            <div class="feature-description">Provide liquidity for any SPL token</div>
            <div class="card forsted-glass teal">Add Liquidity</div>
          </div>

          <div class="card children-center forsted-glass lightsmoke">
            <div class="card forsted-glass teal">
              <img class="icon" src="../assets/icons/acceleRaytor.svg" />
            </div>
            <div class="feature-title">AcceleRaytor</div>
            <div class="feature-description">Launchpad for new Solana projects</div>
            <div class="card forsted-glass teal">View Projects</div>
          </div>
        </div>
      </div>
    </section>

    <section class="section-features children-center grid-cover-container">
      <img src="../assets/background/index_background3.svg" class="image-3" />
      <div class="content">
        <div class="title-text">
          <div class="line" />
          <div class="text">Raydium provides Ecosystem-Wide Liquidity for users and projects</div>
        </div>

        <div class="boards">
          <div class="card children-center forsted-glass smoke">
            <div class="card forsted-glass teal">
              <img class="icon" src="../assets/icons/order-book-AMM.svg" />
            </div>
            <div class="feature-title">Order Book AMM</div>
            <div class="feature-description">
              Raydium's AMM interacts with Serum's central limit order book, meaning that pools have access to all order
              flow and liquidity on Serum, and vice versa.
            </div>
          </div>

          <div class="card children-center forsted-glass smoke">
            <div class="card forsted-glass teal">
              <img class="icon" src="../assets/icons/best-price-swaps.svg" />
            </div>
            <div class="feature-title">Best Price Swaps</div>
            <div class="feature-description">
              Raydium determines whether swapping within a liquidity pool or through the Serum order book will provide
              the best price for the user, and executes accordingly.
            </div>
          </div>

          <div class="card children-center forsted-glass smoke">
            <div class="card forsted-glass teal">
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
.cursor-pointer {
  cursor: pointer;
}

.card {
  padding: 8px 24px;
  border-radius: 6px;
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
.forsted-glass::after {
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

.title-text .line {
  margin: auto;
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

  background: linear-gradient(45deg, hsl(235, 51%, 26%), hsl(258, 56%, 34%));
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
  margin-bottom: 32px;
}

.section-features .feature-title {
  font-weight: 600;
  font-size: 20px;
  line-height: 27px;
  color: var(--text-primary);
}
.section-features .feature-description {
  font-size: 14px;
  line-height: 16px;
  color: var(--text-secondary);
}

.section-features .boards {
  display: flex;
  gap: 8px;
}
.section-features .boards > .card {
  padding: 24px;
}

.section-partners .boards {
  width: 100%;
  display: flex;
  justify-content: space-around;
}
</style>
