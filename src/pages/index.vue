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
      <div class="image-1" />
      <div class="grid-cover-content children-center">
        <div class="title">
          An avenue for <br />
          the evolution of <span class="defi-text">DeFi</span>
        </div>
        <div class="subtitle">
          Light-speed <b>swaps</b>. Next-level <b>liquidity</b>. {{ '\n' }} Friction-less <b>yield</b>.
        </div>

        <div class="row-box-1">
          <NuxtLink to="/swap/">
            <div class="card button-like card-1">
              <span class="font">Launch app</span><img class="icon" src="../assets/icons/button-icon-right.svg" />
            </div>
          </NuxtLink>

          <a href="https://raydium.gitbook.io/raydium/" rel="nofollow noopener noreferrer" target="_blank">
            <div class="card button-like card-2 forsted-glass teal">
              <span class="font">Read docs</span><img class="icon" src="../assets/icons/gitbook.svg" />
            </div>
          </a>
        </div>

        <div class="row-box-2">
          <div class="card forsted-glass smoke">
            <div class="card-title">TOTAL VALUE LOCKED</div>
            <div class="value">
              <span class="value-sign">$</span>
              <span class="value-number">
                {{
                  Math.round(tvl)
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                }}
              </span>
            </div>
          </div>

          <div class="card forsted-glass smoke">
            <div class="card-title">TOTAL TRADING VOLUME</div>
            <div class="value">
              <span class="value-sign">$</span>
              <span class="value-number">
                {{
                  Math.round(totalvolume)
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                }}
              </span>
            </div>
          </div>
        </div>

        <img src="../assets/background/index_slogan_build_on.svg" class="solana-logo" />
      </div>
    </section>

    <section class="section-features -1 children-center">
      <div class="image-2" />
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
            <NuxtLink to="/swap/"><div class="card button-like forsted-glass teal">Enter Exchange</div></NuxtLink>
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
            <NuxtLink to="/acceleraytor/">
              <div class="card button-like forsted-glass teal">View Projects</div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <section class="section-features -2 children-center grid-cover-container">
      <div class="image-3" />
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
              AcceleRaytor offers projects a straightforward 3 step process to raise funds and bootstrap liquidity on
              Raydium and Serum.
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section-partners children-center">
      <div class="title-text">
        <div class="line" />
        <div class="text">Partners</div>
      </div>

      <div class="boards">
        <img src="../assets/icons/solana-text-logo.svg" />
        <img src="../assets/icons/serum-text-logo.svg" />
        <!-- <img src="../assets/icons/sushi-text-logo.svg" /> Temporary-->
      </div>
    </section>

    <footer class="page-footer">
      <div class="links-group">
        <div class="group about">
          <div class="title-text">
            <div class="text">ABOUT</div>
            <div class="line" />
          </div>
          <ul class="links">
            <li>
              <a
                class="link"
                href="https://raydium.gitbook.io/raydium/"
                rel="nofollow noopener noreferrer"
                target="_blank"
                >Documentation</a
              >
            </li>
            <li>
              <a
                class="link"
                href="https://coinmarketcap.com/currencies/raydium/"
                rel="nofollow noopener noreferrer"
                target="_blank"
                >CoinMarketCap</a
              >
            </li>
            <li>
              <a
                class="link"
                href="https://www.coingecko.com/en/coins/raydium"
                rel="nofollow noopener noreferrer"
                target="_blank"
                >CoinGecko</a
              >
            </li>
            <li>
              <a class="link" href="/docs/disclaimer" target="_blank">Disclaimer</a>
            </li>
          </ul>
        </div>

        <div class="group protocol">
          <div class="title-text">
            <div class="text">PROTOCOL</div>
            <div class="line" />
          </div>
          <ul class="links">
            <li>
              <a
                class="link"
                href="https://forms.gle/Fjq4MiRA2qWbPyt29"
                rel="nofollow noopener noreferrer"
                target="_blank"
                >Apply for DropZone</a
              >
            </li>
            <li>
              <a
                class="link"
                href="https://docs.google.com/forms/d/1Mk-x0OcI1tCZzL0Lj_WY8d02dMXsc-Z2AG3AaO6W_Rc/edit#responses"
                rel="nofollow noopener noreferrer"
                target="_blank"
                >Apply for Fusion Pool</a
              >
            </li>
            <li>
              <a
                class="link"
                href="https://docs.google.com/forms/d/1Mk-x0OcI1tCZzL0Lj_WY8d02dMXsc-Z2AG3AaO6W_Rc/edit#responses"
                rel="nofollow noopener noreferrer"
                target="_blank"
                >Apply for AcceleRaytor</a
              >
            </li>
            <li>
              <a
                class="link"
                href="https://raydium.gitbook.io/raydium/permissionless/creating-a-pool"
                rel="nofollow noopener noreferrer"
                target="_blank"
                >Permissionless Pool</a
              >
            </li>
          </ul>
        </div>

        <div class="group support">
          <div class="title-text">
            <div class="text">SUPPORT</div>
            <div class="line" />
          </div>
          <ul class="links">
            <li>
              <a
                class="link"
                href="https://raydium.gitbook.io/raydium/trading-on-serum/spl-wallets"
                rel="nofollow noopener noreferrer"
                target="_blank"
                >Getting Started on Raydium</a
              >
            </li>
            <li>
              <a
                class="link"
                href="https://raydium.gitbook.io/raydium/trading-on-serum/faq"
                rel="nofollow noopener noreferrer"
                target="_blank"
                >FAQ</a
              >
            </li>
          </ul>
        </div>

        <div class="group community">
          <div class="title-text">
            <div class="text">COMMUNITY</div>
            <div class="line" />
          </div>
          <ul class="links">
            <li>
              <a
                href="https://twitter.com/RaydiumProtocol"
                class="link"
                rel="nofollow noopener noreferrer"
                target="_blank"
              >
                <div class="card icon-like forsted-glass teal">
                  <img src="../assets/icons/home-icon-twitter.svg" width="20" height="20" />
                </div>
                <div class="media-name">Twitter</div>
              </a>
            </li>
            <li>
              <a href="https://raydium.medium.com/" class="link" rel="nofollow noopener noreferrer" target="_blank">
                <div class="card icon-like forsted-glass teal">
                  <img src="../assets/icons/home-icon-medium.svg" width="18" height="18" />
                </div>
                <div class="media-name">Medium</div>
              </a>
            </li>
            <li>
              <a
                href="https://discord.com/invite/6EvFwvCfpx"
                class="link"
                rel="nofollow noopener noreferrer"
                target="_blank"
              >
                <div class="card icon-like forsted-glass teal">
                  <img src="../assets/icons/home-icon-discord.svg" width="20" height="20" />
                </div>
                <div class="media-name">Discord</div>
              </a>
            </li>
            <li>
              <a href="https://weibo.com/u/7573315825" class="link" rel="nofollow noopener noreferrer" target="_blank">
                <div class="card icon-like forsted-glass teal">
                  <img src="../assets/icons/home-icon-weibo.svg" width="20" height="20" />
                </div>
                <div class="media-name">Weibo</div>
              </a>
            </li>
            <li style="width: max-content">
              <Popover v-model="isPopupOpen" trigger="click" placement="right">
                <template slot="content">
                  <ul class="pop-links">
                    <a
                      class="link"
                      href="https://t.me/raydiumprotocol"
                      rel="nofollow noopener noreferrer"
                      target="_blank"
                      >Telegram (EN)</a
                    >
                    <a class="link" href="https://t.me/RaydiumChina" rel="nofollow noopener noreferrer" target="_blank"
                      >Telegram (CN)</a
                    >
                    <a class="link" href="https://t.me/raydiumkorea" rel="nofollow noopener noreferrer" target="_blank"
                      >Telegram (KR)</a
                    >
                    <a class="link" href="https://t.me/raydiumjapan" rel="nofollow noopener noreferrer" target="_blank"
                      >Telegram (JP)</a
                    >
                    <a
                      class="link"
                      href="https://t.me/RaydiumSpanish"
                      rel="nofollow noopener noreferrer"
                      target="_blank"
                      >Telegram (ES)</a
                    >
                    <a class="link" href="https://t.me/RaydiumTurkey" rel="nofollow noopener noreferrer" target="_blank"
                      >Telegram (TR)</a
                    >
                    <a
                      class="link"
                      href="https://t.me/RaydiumVietnam"
                      rel="nofollow noopener noreferrer"
                      target="_blank"
                      >Telegram (VN)</a
                    >
                    <a
                      class="link"
                      href="https://t.me/RaydiumRussian"
                      rel="nofollow noopener noreferrer"
                      target="_blank"
                      >Telegram (RU)</a
                    >
                    <a
                      class="link"
                      href="https://t.me/raydiumthailand"
                      rel="nofollow noopener noreferrer"
                      target="_blank"
                      >Telegram (TH)</a
                    >
                  </ul>
                </template>

                <div class="link">
                  <div class="card icon-like forsted-glass teal">
                    <img src="../assets/icons/home-icon-telegram.svg" width="24" height="24" />
                  </div>
                  <div class="media-name" style="cursor: pointer">Telegram</div>
                  <Icon
                    type="down"
                    style="transform: translateY(2px) scaleX(0.7) scaleY(0.6); margin: -12px; cursor: pointer"
                  />
                </div>
              </Popover>
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
import { Icon, Popover } from 'ant-design-vue'

@Component({
  components: {
    Icon,
    Popover
  },
  layout: 'home',

  async asyncData({ $accessor, $api }) {
    if (!$accessor.price.initialized) {
      await $accessor.price.requestPrices()
    }

    const { tvl, totalvolume } = await $api.getInfo()
    return { tvl, totalvolume }
  }
})
export default class Index extends Vue {
  isPopupOpen = false
  tvl = 0
  totalvolume = 0
  timer: number | undefined = undefined

  mounted() {
    this.timer = window.setInterval(this.getInfo, 1000 * 30)
  }

  beforeDestroy() {
    window.clearInterval(this.timer)
  }

  async getInfo() {
    const { tvl, totalvolume } = await this.$api.getInfo()
    this.tvl = tvl
    this.totalvolume = totalvolume
  }
}
</script>

<style>
.ant-popover-arrow {
  border-color: #0c0926 !important;
}
.ant-popover-inner-content {
  background-color: #0c0926 !important;
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
  font-weight: bold;
  font-size: 14px;
  line-height: 18px;
}
.button-like:active {
  filter: brightness(0.75);
  transform: scale(0.95);
}
.button-like:hover {
  filter: brightness(0.85);
}
.button-like .font {
  display: inline-block;
}
.clickable {
  cursor: pointer;
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
  z-index: -1;
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
  grid-area: 1 / 1;
  overflow: auto;
}

.page-container {
  --text-primary: hsl(0, 0%, 100%);
  --text-secondary: hsl(222deg, 100%, 84%);
  --text-secondary-light: #c4d6ff;

  overflow: hidden;
}

.home-navbar {
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 50px 165px;
  justify-content: space-between;
  z-index: 1;
}

.section-app-face {
  margin-top: 80px;
  margin-bottom: 72px;
  height: 804px;
  position: relative;
}
.section-app-face .image-1 {
  background-image: url('../assets/background/index_background.svg');
  background-repeat: no-repeat;
  height: 100%;
  width: 744px;
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
  font-weight: 700;
  color: transparent;
  background: radial-gradient(circle at top right, #39d0d8, #2b6aff);
  background-clip: text;
}
.section-app-face .row-box-1 {
  display: grid;
  grid-auto-flow: column;
  gap: 32px;
  margin-bottom: 68px;
}
.section-app-face .row-box-1 .card-1 {
  border-radius: 12px;
  color: white;
  background: linear-gradient(245.22deg, #da2eef 35%, #2b6aff 65.17%, #39d0d8 92.1%);
  background-position: 1% 50%;
  background-size: 150% 150%;
  transition: 500ms;
}
.section-app-face .row-box-1 .card-1:hover {
  border-radius: 12px;
  color: white;
  background-position: 99% 50%;
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
  display: grid;
  grid-auto-flow: column;
  gap: 32px;
  margin-bottom: 36px;
}
.section-app-face .row-box-2 .card {
  width: 260px;
  padding: 24px;
}
.section-app-face .row-box-2 .card .card-title {
  font-size: 14px;
  line-height: 18px;
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
  font-size: 16px;
}
.section-app-face .row-box-2 .card .value-number {
  font-size: 22px;
  letter-spacing: 2px;
}

.pop-links {
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.pop-links .link {
  padding: 8px;
  color: #c4d6ff;
}
.pop-links .link:not(:last-child) {
  box-shadow: 0 1px 0 rgba(196, 214, 255, 0.1);
}
.pop-links .link:hover {
  color: white;
}

.section-partners {
  margin-bottom: 100px;
}
.section-partners .boards {
  width: 100%;
  display: flex;
  justify-content: space-around;
  padding: 0 228px;
}
.section-partners .boards > * {
  flex-grow: 0;
}

.page-footer {
  position: relative;
  background-image: url('../assets/background/index_footer_background.webp'),
    linear-gradient(transparent 30%, #141041 30%, #141041);
  background-size: 100% 600px, 100% 100%;
  display: flow-root;
}
.page-footer .links-group {
  width: 100%;
  padding: 200px 4% 0;
  position: relative;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}
.page-footer .links-group > * {
  flex-basis: 220px;
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
.page-footer .group .links .link {
  font-size: 16px;
  margin-bottom: 26px;
  display: grid;
  grid-auto-flow: column;
  justify-content: start;
  gap: 12px;
  align-items: center;
  color: var(--text-secondary-light);
}
.page-footer .group .links .link:hover {
  color: white;
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
  margin: 16px auto 64px;
  display: block;
}

.section-features .feature-title {
  font-weight: 600;
  font-size: 20px;
  color: var(--text-primary);
  margin-bottom: 8px;
}
.section-features .feature-description {
  font-weight: 300;
  font-size: 14px;
  line-height: 16px;
  color: var(--text-secondary-light);
  margin-bottom: 20px;
}
.section-features .content {
  max-width: 1220px;
  overflow: auto;
  width: 100%;
}

.section-features .boards {
  display: grid;
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
  font-weight: 600;
  margin-bottom: 8px;
}

.section-features.\-1 {
  position: relative;
  margin: 0 auto;
  padding: 0 96px;
  max-width: 1320px;
  min-height: 506px;
  overflow: hidden;
  border-radius: 100px;
  background: radial-gradient(at center top, transparent 20%, hsl(245, 60%, 16%, 0.2)),
    url('../assets/background/index_background2_lights.webp'), #1b1659;
  box-shadow: 8px 8px 10px rgba(20, 16, 65, 0.05), -8px -8px 10px rgba(197, 191, 255, 0.05),
    inset 0 6px 20px rgba(197, 191, 255, 0.2), inset 0 -1px 25px rgba(197, 191, 255, 0.1);
  background-size: 100% 100%;
}

.section-features.\-1 .boards {
  grid-template-columns: repeat(4, 1fr);
  gap: 22px;
}
.section-features.\-1 .boards > .card {
  grid-template-rows: auto auto 1fr auto;
}

.section-features.\-1 .image-2 {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(245.22deg, #da2eef 7.97%, #2b6aff 49.17%, #39d0d8 92.1%);
  mask-image: url('../assets/background/index_background2.svg');
}

.section-features.\-2 .image-3 {
  background: url('../assets/background/index_background3.webp');
  background-size: 100% 100%;
  width: 100%;
  height: 100%;
}
.section-features.\-2 .content {
  padding: 0 56px;
  margin: 108px 64px 172px;
}
.section-features.\-2 .boards {
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  justify-items: center;
}

.section-features.\-2 .feature-description {
  font-size: 16px;
  line-height: 24px;
}

.section-features.\-2 .boards > .card {
  max-width: 360px;
  grid-template-rows: auto auto 1fr;
  align-items: initial;
}

@media (max-width: 1128px) {
  /* is tablet */
  .home-navbar {
    padding: 50px 58px;
  }

  .section-app-face {
    margin-top: 116px;
    height: 720px;
  }
  .section-app-face .image-1 {
    background-size: 100%;
    width: 668px;
  }
  .section-app-face .title {
    font-size: 48px;
    line-height: 44px;
  }
  .section-app-face .subtitle {
    font-size: 20px;
    line-height: 26px;
  }
  .section-app-face .row-box-1 {
    gap: 24px;
    margin-bottom: 84px;
  }
  .section-app-face .row-box-2 {
    gap: 24px;
  }
  .section-app-face .row-box-2 .card .card-title {
    font-weight: 300;
    font-size: 12px;
    line-height: 15px;
  }
  .section-app-face .row-box-2 .card .value-sign {
    font-weight: 300;
    font-size: 12px;
  }
  .section-app-face .row-box-2 .card .value-number {
    font-weight: 300;
    font-size: 18px;
  }

  .page-footer {
    background-size: 200vw 600px, 100% 100%;
    text-align: center;
  }
  .page-footer .links-group .group.community {
    flex-basis: 100vw;
  }
  .page-footer .links-group .title-text .line {
    margin: 0 auto;
  }
  .page-footer .links-group .group.community .title-text {
    display: none;
  }
  .page-footer .links-group .group.community .links {
    display: flex;
    justify-content: center;
    gap: 40px;
    margin-top: 24px;
    margin-bottom: 16px;
  }
  .page-footer .links-group .group.community .links .media-name {
    display: none;
  }
  .page-footer .group .links .link {
    justify-content: center;
  }

  .section-features.\-1 {
    margin: 0 24px;
    padding: 64px 40px;
    border-radius: 60px;
    background: radial-gradient(at center top, transparent 20%, hsl(245, 60%, 16%, 0.2)),
      url('../assets/background/index_background2_lights_tablet.webp'), #1b1659;
    background-size: 100% 100%;
  }
  .section-features.\-1 .boards {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
  .section-features.\-2 .boards {
    grid-template-columns: 1fr;
  }
  .section-features.\-2 .image-3 {
    background-image: url('../assets/background/index_background3_tablet.webp');
  }
}

@media (max-width: 768px) {
  /* is phone */
  .button-like {
    font-size: 12px;
    line-height: 15px;
  }
  .card {
    padding: 10px 20px;
  }
  .title-text .text {
    font-size: 16px;
    line-height: 20px;
  }

  .home-navbar {
    justify-content: center;
  }
  .home-navbar > *:nth-child(2n) {
    display: none;
  }
  .section-app-face {
    margin-top: 116px;
    height: unset;
  }
  .section-app-face .image-1 {
    width: 394px;
    height: 430px;
  }
  .section-app-face .title {
    font-size: 32px;
    line-height: 32px;
  }
  .section-app-face .subtitle {
    font-size: 16px;
    line-height: 20px;
    white-space: pre-line;
    margin-top: -22px; /* to counteract the impact of white-space: pre-line */
  }
  .section-app-face .row-box-1 {
    gap: 20px;
    margin-bottom: 56px;
  }
  .section-app-face .row-box-1 .card-1 {
    font-size: 12px;
    line-height: 15px;
  }
  .section-app-face .row-box-2 {
    gap: 20px;
  }
  .section-app-face .row-box-2 .card {
    width: 165px;
    padding: 16px;

    --border-radius: 11.27px;
  }
  .section-app-face .row-box-2 .card .card-title {
    font-size: 8px;
    line-height: 10px;
  }
  .section-app-face .row-box-2 .card .value {
    line-height: 0;
  }
  .section-app-face .row-box-2 .card .value-sign {
    font-size: 8px;
    line-height: 10px;
  }
  .section-app-face .row-box-2 .card .value-number {
    font-size: 12px;
    line-height: 15px;
  }
  .section-app-face .solana-logo {
    display: block;
    position: absolute;
    left: 50%;
    transform: translate(-50%) scale(0.8);
    bottom: -32px;
  }

  .page-footer .links-group {
    gap: 56px;
  }
  .section-partners .boards {
    width: unset;
    justify-content: unset;
    padding: unset;
    flex-direction: column;
    gap: 40px;
  }

  .section-features .feature-title {
    font-size: 18px;
    line-height: 23px;
  }
  .section-features .feature-description {
    font-size: 14px;
    line-height: 16px;
  }

  .section-features.\-1 {
    border-radius: 40px;
    background: radial-gradient(at center top, transparent 20%, hsl(245, 60%, 16%, 0.2)),
      url('../assets/background/index_background2_lights_mobile.webp'), #1b1659;
    background-size: 100% 100%;
    padding: 56px 20px;
  }
  .section-features.\-1 .boards {
    grid-template-columns: 1fr;
  }
  .section-features.\-2 .boards {
    grid-template-columns: 1fr;
  }
  .section-features.\-2 .content {
    padding: 0 20px;
  }
  .section-features.\-2 .image-3 {
    background-image: url('../assets/background/index_background3_mobile.webp');
  }
  .section-features.\-2 .feature-description {
    font-size: 14px;
    line-height: 20px;
  }
  .section-features .boards > .card {
    padding: 44px 20px;
  }
  .page-footer .links-group .group {
    flex-basis: 100vw;
  }
  .page-footer .group .links .link {
    justify-content: center;
  }
}
</style>
