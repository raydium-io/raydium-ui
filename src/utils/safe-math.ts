import BigNumber from 'bignumber.js'

// https://github.com/GoogleChromeLabs/jsbi#how
// https://github.com/MikeMcl/bignumber.js
// https://github.com/AdleyTales/MyBigNumber
// https://blog.csdn.net/shenxianhui1995/article/details/103985434
export class SafeMath {
  static add(a: number, b: number) {
    const safeA = new BigNumber(a)
    const safeB = new BigNumber(b)

    return safeA.plus(safeB).toNumber()
  }

  static sub(a: number, b: number) {
    const safeA = new BigNumber(a)
    const safeB = new BigNumber(b)

    return safeA.minus(safeB).toNumber()
  }

  static mul(a: number, b: number) {
    const safeA = new BigNumber(a)
    const safeB = new BigNumber(b)

    return safeA.multipliedBy(safeB).toNumber()
  }

  static div(a: number, b: number) {
    const safeA = new BigNumber(a)
    const safeB = new BigNumber(b)

    return safeA.dividedBy(safeB).toNumber()
  }

  // 采用和以太一样的命名 除以精度
  static toEther(value: number, decimals: number) {
    const safeValue = new BigNumber(value)
    const decimal = new BigNumber(10).exponentiatedBy(decimals)

    return safeValue.dividedBy(decimal).toNumber()
  }

  static toWei(value: number, decimals: number) {
    const safeValue = new BigNumber(value)
    const decimal = new BigNumber(10).exponentiatedBy(decimals)

    return safeValue.multipliedBy(decimal).toNumber()
  }

  static toFormat(value: number, decimals: number) {
    const safeValue = new BigNumber(value)

    return safeValue.toFormat(decimals)
  }

  static toFixed(value: number, decimals: number) {
    const safeValue = new BigNumber(value)

    return safeValue.toFixed(decimals)
  }
}
