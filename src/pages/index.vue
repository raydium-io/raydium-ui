<template>
  <div class="page-container">
    <nav class="home-navbar">
      <NuxtLink to="/swap/">
        <img src="../assets/icons/logo-text.svg" width="148" height="40" />
      </NuxtLink>

      <NuxtLink to="/swap/">
        <div class="card button-like forsted-glass teal"><span class="font">Launch app</span></div>
      </NuxtLink>
    </nav>

    <section class="section-app-face children-center grid-cover-container">
      <img src="../assets/background/index_background.svg" class="image-1" />
      <div class="grid-cover-content children-center">
        <div class="title">
          An avenue for <br />
          the evolution of <span class="defi-text">DeFi</span>
        </div>
        <div class="subtitle">Light-speed <b>swaps</b>. Next-level <b>liquidity</b>. Friction-less <b>yield</b>.</div>

        <div class="row-box-1">
          <NuxtLink to="/swap/">
            <div class="card button-like card-1">
              <span class="font">Launch app</span><img class="icon" src="../assets/icons/button-icon-right.svg" />
            </div>
          </NuxtLink>

          <a href="https://raydium.gitbook.io/raydium/" target="_blank">
            <div class="card button-like card-2 forsted-glass teal">
              <span class="font">Read docs</span><img class="icon" src="../assets/icons/gitbook.svg" />
            </div>
          </a>
        </div>

        <div class="row-box-2">
          <div class="card forsted-glass smoke">
            <div class="card-title">TOTAL VALUE LOCKED</div>
            <div class="value">
              <span class="value-sign">$</span
              >{{
                Math.round(tvl)
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              }}
            </div>
          </div>

          <div class="card forsted-glass smoke">
            <div class="card-title">24 HOUR VOLUME</div>
            <div class="value">
              <span class="value-sign">$</span
              >{{
                Math.round(volume24h)
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              }}
            </div>
          </div>
        </div>

        <img src="../assets/background/index_background6.svg" class="solana-logo" />
      </div>
    </section>

    <section class="section-features children-center grid-cover-container">
      <img class="image-2" src="../assets/background/index_background2.svg" />
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
          <div class="card children-center forsted-glass buriedlightsmoke">
            <div class="card icon-like forsted-glass teal">
              <img class="icon" src="../assets/icons/order-book-AMM.svg" />
            </div>
            <div class="feature-title">Order Book AMM</div>
            <div class="feature-description">
              Raydium's AMM interacts with Serum's central limit order book, meaning that pools have access to all order
              flow and liquidity on Serum, and vice versa.
            </div>
          </div>

          <div class="card children-center forsted-glass buriedlightsmoke">
            <div class="card icon-like forsted-glass teal">
              <img class="icon" src="../assets/icons/best-price-swaps.svg" />
            </div>
            <div class="feature-title">Best Price Swaps</div>
            <div class="feature-description">
              Raydium determines whether swapping within a liquidity pool or through the Serum order book will provide
              the best price for the user, and executes accordingly.
            </div>
          </div>

          <div class="card children-center forsted-glass buriedlightsmoke">
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

    <footer class="page-footer grid-cover-container">
      <img src="../assets/background/index_footer_background.svg" style="width: 100%" />
      <div class="content">
        <div class="group about">
          <div class="title-text">
            <div class="text">ABOUT</div>
            <div class="line" />
          </div>
          <ul class="links">
            <li>Meet Raydium</li>
            <li>Ray Token</li>
            <li>Media Assets</li>
          </ul>
        </div>

        <div class="group protocol">
          <div class="title-text">
            <div class="text">PROTOCOL</div>
            <div class="line" />
          </div>
          <ul class="links">
            <li>Apply for Fusion Pool</li>
            <li>Apply for AcceleRaytor</li>
            <li>Permissionless Pool</li>
            <li>API</li>
          </ul>
        </div>

        <div class="group support">
          <div class="title-text">
            <div class="text">SUPPORT</div>
            <div class="line" />
          </div>
          <ul class="links">
            <li>Getting Started on Solana</li>
            <li>Getting Started on Raydium</li>
            <li>FAQ</li>
          </ul>
        </div>

        <div class="group community">
          <div class="title-text">
            <div class="text">COMMUNITY</div>
            <div class="line" />
          </div>
          <ul class="links">
            <li>
              <a href="https://twitter.com/RaydiumProtocol">
                <div class="card icon-like forsted-glass teal">
                  <img src="../assets/icons/home-icon-twitter.svg" width="20" height="20" />
                </div>
                <div class="media-name">Twitter</div>
              </a>
            </li>
            <li>
              <a href="https://raydium.medium.com/">
                <div class="card icon-like forsted-glass teal">
                  <img src="../assets/icons/home-icon-medium.svg" width="18" height="18" />
                </div>
                <div class="media-name">Medium</div>
              </a>
            </li>
            <li>
              <a href="https://discord.com/invite/6EvFwvCfpx">
                <div class="card icon-like forsted-glass teal">
                  <img src="../assets/icons/home-icon-discord.svg" width="20" height="20" />
                </div>
                <div class="media-name">Discord</div>
              </a>
            </li>
            <li>
              <a href="https://t.me/raydiumprotocol">
                <div class="card icon-like forsted-glass teal">
                  <img src="../assets/icons/home-icon-telegram.svg" width="24" height="24" />
                </div>
                <div class="media-name">Telegram</div>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <img class="foot-logo" src="../assets/icons/logo-text.svg" width="148" height="40" />
    </footer>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'

@Component({
  layout: 'home',

  async asyncData({ $accessor, $api }) {
    if (!$accessor.price.initialized) {
      await $accessor.price.requestPrices()
    }

    const { tvl, volume24h } = await $api.getInfo()
    return { tvl, volume24h }
  }
})
export default class Index extends Vue {
  tvl = 0
  volume24h = 0
  timer: number | undefined = undefined

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
<style>
@font-face {
  font-family: 'Space Grotesk';
  src: url('../assets/fonts/SpaceGroteskVariable.woff2') format('woff2');
}
@font-face {
  font-family: 'Space Grotesk semibold';
  src: url('../assets/fonts/SpaceGrotesk-SemiBold.woff2') format('woff2');
}
</style>
<style scoped>
/* utilities */
.card {
  padding: 12px 24px;
  border-radius: 6px;
}
.button-like {
  cursor: pointer;
  user-select: none;
  transition: 75ms;
}
.button-like:active {
  filter: brightness(0.75);
  transform: scale(0.95);
}
.button-like:hover {
  filter: brightness(0.95);
}
.button-like .font {
  font-weight: 600;
  transform: translateY(2px); /* forcely fix the strange position problem of font:Space Grotesk */
  display: inline-block;
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
  background: linear-gradient(126.7deg, var(--bg-board-color) 28.7%, var(--bg-board-color-2, var(--bg-board-color)));
}
.forsted-glass::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.7;
  background: transparent;
  border-radius: inherit;
  box-shadow: inset 0 0 0 var(--border-line-width, 1.5px) var(--border-color);
  mask-image: radial-gradient(at -31% -58%, hsl(0, 0%, 0%, 0.5) 34%, transparent 60%),
    linear-gradient(to left, hsl(0, 0%, 0%, 0.2) 0%, transparent 13%),
    linear-gradient(hsl(0deg 0% 0% / 5%), hsl(0deg 0% 0% / 5%));
}
.forsted-glass.buriedlightsmoke,
.forsted-glass.lightsmoke {
  --border-color: hsl(0, 0%, 100%);
  --bg-board-color: hsl(0, 0%, 100%, 0.08);
  --bg-board-color-2: hsl(0, 0%, 100%, 0);
  --text-color: hsl(0, 0%, 100%);
  --blur-size: 1.5px;
  --border-radius: 20px;
  --border-line-width: 2px;
}
.forsted-glass.buriedlightsmoke {
  --blur-size: 6px;
}
.forsted-glass.smoke {
  --border-color: hsl(0, 0%, 100%);
  --bg-board-color: hsl(0, 0%, 100%, 0.12);
  --bg-board-color-2: hsl(0, 0%, 100%, 0);
  --text-color: hsl(0, 0%, 100%);
  --blur-size: 2.3px;
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
.title-text .text {
  font-size: 20px;
  line-height: 27px;
}

.grid-cover-container {
  place-items: center;
  display: grid;
}
.grid-cover-container > * {
  max-width: 100%;
  min-width: 375px; /* it's the IPhone 6 width */
  grid-area: 1 / 1;
  overflow: auto;
}

.page-container {
  --text-primary: hsl(0, 0%, 100%);
  --text-secondary: hsl(222deg, 100%, 84%);
  --text-secondary-light: #c4d6ff;

  font-family: 'Space Grotesk', sans-serif;
}

.home-navbar {
  display: flex;
  padding: 50px 167px;
  justify-content: space-between;
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
  margin-top: 56px;
}
.section-app-face .subtitle {
  font-style: normal;
  font-weight: normal;
  font-size: 22px;
  line-height: 30px;
  color: var(--text-secondary);
  margin-bottom: 24px;
}
.section-app-face .defi-text {
  font-family: 'Space Grotesk semibold', sans-serif;
  color: transparent;
  background: radial-gradient(circle at top right, #39d0d8, #2b6aff);
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
  margin-left: 6px;
}
.section-app-face .row-box-1 .card-2 .icon {
  width: 14px;
  height: 14px;
  margin-left: 8px;
}
.section-app-face .row-box-2 {
  display: flex;
  gap: 32px;
  margin-bottom: 36px;
}
.section-app-face .row-box-2 .card {
  width: 228px;
  padding: 24px;
}
.section-app-face .row-box-2 .card .card-title {
  font-size: 14px;
  line-height: 19px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}
.section-app-face .row-box-2 .card .value {
  font-style: normal;
  font-weight: 500;
  font-size: 18px;
  color: var(--text-primary);
}
.section-app-face .row-box-2 .card .value-sign {
  font-variant: normal;
}

.page-footer {
  position: relative;
}
.page-footer img {
  width: 100%;
}
.page-footer .content {
  width: 100%;
  padding: 4%;
  position: relative;
  display: flex;
  justify-content: space-around;
}
.page-footer .group .title-text .text {
  font-size: 14px;
  margin-bottom: 8px;
}
.page-footer .group .title-text .line {
  width: 20px;
  margin: 0;
}
.page-footer .group .links {
  margin: 0;
  padding: 0;
  list-style: none;
  color: var(--text-secondary-light);
}
.page-footer .group .links a {
  display: flex;
  gap: 12px;
  align-items: center;
  color: var(--text-secondary-light);
}
.page-footer .group .links a:hover {
  color: var(--text-secondary);
}
.page-footer .group .links > li {
  font-size: 16px;
  margin-bottom: 26px;
}
.page-footer .group .links .icon-like {
  padding: 0;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: grid;
  place-content: center;
}
.page-footer .foot-logo {
  position: absolute;
  bottom: 8%;
}

.section-features .image-2 {
  overflow: hidden;
  border-radius: 100px;
  background: radial-gradient(at center top, transparent 20%, hsl(245, 60%, 16%, 0.2)),
    url('../assets/background/index_background2_lights.svg'), #1b1659;
  box-shadow: inset 0 3px 12px rgb(255 255 255 / 18%), 0 -6px 24px -6px rgb(255 255 255 / 7%);
}
.section-features .image-2 img {
  mask-image: radial-gradient(at center, rgb(0 0 0 / 80%), rgb(0 0 0 / 40%));
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
  color: var(--text-secondary-light);
  margin-bottom: 20px;
}
.section-features .content {
  max-width: 1220px;
  padding: 0 56px;
  overflow: auto;
  width: 100%;
}
.section-features .boards {
  display: flex;
  gap: 22px;
}
.section-features .boards > .card {
  padding: 24px 50px;
  flex: 1 0 120px;
}
.section-features .boards > .card > .card.icon-like {
  padding: 12px;
  margin-bottom: 12px;
}
.section-features .boards > .card > .feature-title {
  margin-bottom: 8px;
}

.section-partners {
  margin-bottom: 100px;
}
.section-partners .boards {
  width: 100%;
  display: flex;
  justify-content: space-around;
}

.section-features.\-2 .image-3 {
  width: 100%;
}
.section-features.\-2 .content {
  margin: 64px;
}
.section-features.\-2 .boards {
  gap: 24px;
}

.section-features.\-2 .feature-description {
  font-size: 16px;
  line-height: 24px;
}

.section-features.\-2 .boards > .card {
  max-width: 360px;
}
</style>
