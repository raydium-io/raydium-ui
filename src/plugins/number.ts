import { SafeMath } from '@/utils/safe-math'
import Vue from 'vue'

// https://2amigos.us/blog/javascript-floating-number-precision-using-vuejs-filters-and-bignumberjs
export function toFixed(value: number, decimals = 0) {
  return SafeMath.toFixed(value, decimals)
}

export function toFormat(value: number, decimals = 0) {
  return SafeMath.toFormat(value, decimals)
}

Vue.filter('toFixed', toFixed)
Vue.filter('toFormat', toFormat)
