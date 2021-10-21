import lessToJson from 'less-to-json'
import path from 'path'

const lessVariables = lessToJson('src/styles/variables.less')

export default {
  server: {
    host: '0.0.0.0'
  },

  srcDir: './src/',
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  // show
  // publicRuntimeConfig: { baseURL: process.env.NUXT_BASE_URL },

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'Raydium',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no'
      },
      { hid: 'description', name: 'description', content: 'An avenue for the evolution of DeFi' }
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
  },

  loadingIndicator: {
    name: 'circle',
    color: '#5ac4be',
    background: '#131a35'
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    {
      src: '@/styles/antd.less',
      lang: 'less'
    },
    {
      src: '@/styles/global.less',
      lang: 'less'
    }
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: ['@/plugins/axios.ts', '@/plugins/api.ts', '@/plugins/web3.ts', '@/plugins/notify.ts'],

  router: {
    middleware: ['route']
  },

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
    // https://github.com/nuxt-community/eslint-module
    '@nuxtjs/eslint-module',
    // https://go.nuxtjs.dev/stylelint
    '@nuxtjs/stylelint-module',
    // https://typed-vuex.roe.dev
    'nuxt-typed-vuex'
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    'nuxt-clipboard',
    '@nuxtjs/dayjs',
    '@nuxtjs/google-gtag',
    '@nuxtjs/gtm',
    // '@nuxtjs/sentry'
    '@/modules/alexa'
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {},

  clipboard: {
    autoSetContainer: true
  },

  dayjs: {
    locales: ['en'],
    defaultLocale: 'en',
    plugins: ['utc']
  },

  // https://github.com/nuxt-community/google-gtag-module
  'google-gtag': {
    id: 'G-78BZ5BGCV5',
    debug: true
  },

  alexa: {
    id: '7D7sw1Fx9f207i'
  },

  // https://github.com/nuxt-community/gtm-module
  gtm: {
    id: 'GTM-MN4HVBS',
    enabled: true
  },

  // sentry: {
  //   dsn: '',
  //   config: {}
  // },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    transpile: [/^ant-design-vue/],

    loaders: {
      less: {
        javascriptEnabled: true,
        modifyVars: lessVariables
      }
    },

    babel: {
      plugins: [
        [
          'import',
          {
            libraryName: 'ant-design-vue',
            libraryDirectory: 'lib',
            style: true
          },
          'ant-design-vue'
        ]
      ]
    },

    extend(config) {
      config.resolve.alias['@ant-design/icons/lib/dist$'] = path.resolve(__dirname, './src/utils/antd-icons.ts')
    }
  }
}
