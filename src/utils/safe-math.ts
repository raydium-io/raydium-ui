import BigNumber from 'bignumber.js'

export class TokenAmount {
  static toBigNumber(value: number | string): BigNumber {
    return new BigNumber(value)
  }

  static toFloat(
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
}
