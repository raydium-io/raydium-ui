import { NuxtWeb3Instance } from './web3'
import { NuxtApiInstance } from './api'
import { NuxtNotifyInstance } from './notify'
import { WalletAdapter } from '@/wallets/types'

import { accessorType } from '@/store'

// Nuxt 2.9+
declare module '@nuxt/types' {
  interface Context {
    $web3: NuxtWeb3Instance
    $api: NuxtApiInstance
    $notify: NuxtNotifyInstance
    $accessor: typeof accessorType
  }

  interface NuxtAppOptions {}

  interface Configuration {}
}

declare module 'vue/types/vue' {
  interface Vue {
    $web3: NuxtWeb3Instance
    $api: NuxtApiInstance
    $notify: NuxtNotifyInstance
    $accessor: typeof accessorType
    $wallet: WalletAdapter | null
  }
}

// vuex
declare module 'vuex/types/index' {
  // eslint-disable-next-line
  interface Store<S> {
    $web3: NuxtWeb3Instance
    $api: NuxtApiInstance
    $notify: NuxtNotifyInstance
    $accessor: typeof accessorType
  }
}
