import { Plugin } from '@nuxt/types'

import { notification } from 'ant-design-vue'

const notifyPlugin: Plugin = (ctx, inject) => {
  const notify = notification
  notify.config({
    placement: 'bottomLeft',
    bottom: '10px',
    duration: 3
  })

  ctx.$notify = notify
  inject('notify', notify)
}

export default notifyPlugin
