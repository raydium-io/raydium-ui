import { Plugin } from '@nuxt/types'

import { parseError } from '@/utils'

const axiosPlugin: Plugin = ({ $axios }) => {
  $axios.defaults.timeout = 30000
  $axios.defaults.headers.post['Content-Type'] = 'application/json'

  $axios.onResponse((response) => response.data)

  $axios.onError((error) => {
    // $sentry.captureException(error);
    return Promise.reject(parseError(error))
  })
}

export default axiosPlugin
