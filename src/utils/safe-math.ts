import BigNumber from 'bignumber.js'

export class TokenAmount {
  static toBigNumber(value: number | string): BigNumber {
    return new BigNumber(value)
  }

  // 采用和以太一样的命名 除以精度
  static fromWei(
    value: number | string | BigNumber,
    decimals: number
  ): BigNumber {
    let amount

    if (value instanceof BigNumber) {
      amount = value
    } else {
      amount = new BigNumber(value)
    }

    const decimal = new BigNumber(10).exponentiatedBy(decimals)
    return amount.dividedBy(decimal)
  }

  static toWei(
    value: number | string | BigNumber,
    decimals: number
  ): BigNumber {
    let amount

    if (value instanceof BigNumber) {
      amount = value
    } else {
      amount = new BigNumber(value)
    }

    const decimal = new BigNumber(10).exponentiatedBy(decimals)
    return amount.multipliedBy(decimal)
  }
}
