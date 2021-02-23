import Vue from 'vue'
import { notification } from 'ant-design-vue'

notification.config({
  placement: 'bottomLeft',
  bottom: '10px',
  duration: 2,
})

Vue.prototype.$notify = notification
