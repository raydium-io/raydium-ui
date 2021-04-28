import BigNumber from 'bignumber.js'

// https://github.com/MikeMcl/bignumber.js
// https://blog.csdn.net/shenxianhui1995/article/details/103985434
export class TokenAmount {
  public wei: BigNumber

  public decimals: number
  public _decimals: BigNumber

  constructor(wei: number | string | BigNumber, decimals: number = 0, isWei = true) {
    this.decimals = decimals
    this._decimals = new BigNumber(10).exponentiatedBy(decimals)

    if (isWei) {
      this.wei = new BigNumber(wei)
    } else {
      this.wei = new BigNumber(wei).multipliedBy(this._decimals)
    }
  }

  toEther() {
    return this.wei.dividedBy(this._decimals)
  }

  toWei() {
    return this.wei
  }

  format() {
    const vaule = this.wei.dividedBy(this._decimals)
    return vaule.toFormat(vaule.isInteger() ? 0 : this.decimals)
  }

  fixed() {
    return this.wei.dividedBy(this._decimals).toFixed(this.decimals)
  }

  isNullOrZero() {
    return this.wei.isNaN() || this.wei.isZero()
  }
  // + plus
  // - minus
  // × multipliedBy
  // ÷ dividedBy
}

// >
export function gt(a: string | number, b: string | number) {
  const valueA = new BigNumber(a)
  const valueB = new BigNumber(b)

  return valueA.isGreaterThan(valueB)
}

// >=
export function gte(a: string | number, b: string | number) {
  const valueA = new BigNumber(a)
  const valueB = new BigNumber(b)

  return valueA.isGreaterThanOrEqualTo(valueB)
}

// <
export function lt(a: string | number, b: string | number) {
  const valueA = new BigNumber(a)
  const valueB = new BigNumber(b)

  return valueA.isLessThan(valueB)
}

// <=
export function lte(a: string | number, b: string | number) {
  const valueA = new BigNumber(a)
  const valueB = new BigNumber(b)

  return valueA.isLessThanOrEqualTo(valueB)
}

export function isNullOrZero(value: string | number) {
  const amount = new BigNumber(value)

  return amount.isNaN() || amount.isZero()
}
