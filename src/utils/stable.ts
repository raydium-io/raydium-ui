import BigNumber from 'bignumber.js'

export const stableConfig = {
  n: 150,
  eps: new BigNumber(10 ** -15)
}

export function cK(xBase: BigNumber, yBase: BigNumber) {
  const n = new BigNumber(stableConfig.n)
  const x = new BigNumber(xBase.gt(yBase) ? xBase : yBase)
  const y = new BigNumber(xBase.lt(yBase) ? xBase : yBase)

  let max = new BigNumber(x)
  let min = new BigNumber(y)
  let mid = new BigNumber(max).plus(min).dividedBy(2)
  let left = getCurKLeft(mid, y)
  let right = getCurKRight(n, x, y, mid)
  let count = 0

  while (left.minus(right).abs().gt(stableConfig.eps)) {
    if (left.gt(right)) {
      max = mid
    } else {
      min = mid
    }
    mid = new BigNumber(max).plus(min).dividedBy(2)
    left = getCurKLeft(mid, y)
    right = getCurKRight(n, x, y, mid)
    if (count++ > 100) break
  }

  return mid.multipliedBy(mid)
}

function getCurKLeft(mid: BigNumber, y: BigNumber) {
  return new BigNumber(mid).multipliedBy(mid).dividedBy(y).dividedBy(y)
}
function getCurKRight(n: BigNumber, x: BigNumber, y: BigNumber, mid: BigNumber) {
  const data = new BigNumber(n)
    .minus(1)
    .multipliedBy(new BigNumber(y).minus(mid))
    .multipliedBy(new BigNumber(y).minus(mid))
    .dividedBy(new BigNumber(x).minus(mid))
    .dividedBy(new BigNumber(x).minus(mid))
  return new BigNumber(n).minus(data)
}

export function getStablePrice(currentK: BigNumber, x: BigNumber, y: BigNumber, baseIn: boolean) {
  let price
  if (x.lte(y)) {
    price = new BigNumber(stableConfig.n)
      .multipliedBy(x)
      .multipliedBy(x)
      .minus(currentK)
      .dividedBy(new BigNumber(stableConfig.n - 1).multipliedBy(x).multipliedBy(x))
      .sqrt()
  } else {
    price = new BigNumber(stableConfig.n - 1)
      .multipliedBy(y)
      .multipliedBy(y)
      .dividedBy(new BigNumber(stableConfig.n).multipliedBy(x).multipliedBy(x).minus(currentK))
      .sqrt()
  }
  if (baseIn) {
    return price
  } else {
    return new BigNumber(1).dividedBy(price)
  }
}

export function getDxByDy(
  xBase: BigNumber,
  yBase: BigNumber,
  dy: BigNumber,
  k: BigNumber,
  baseInSide: boolean
): BigNumber {
  const x = new BigNumber(xBase.gt(yBase) ? xBase : yBase)
  let y = new BigNumber(xBase.lt(yBase) ? xBase : yBase)
  if (xBase.lt(yBase)) {
    console.log('getDxByDy to getDyByDx')
    return getDyByDx(x, y, dy, k, baseInSide)
  }
  if (dy.lt(new BigNumber(0))) {
    if (dy.abs().gte(y)) return new BigNumber(0) // Error

    return dy
      .multipliedBy(-1)
      .multipliedBy(
        new BigNumber(stableConfig.n - 1)
          .dividedBy(
            new BigNumber(stableConfig.n).minus(
              k.dividedBy(new BigNumber(y).plus(dy).multipliedBy(new BigNumber(y).plus(dy)))
            )
          )
          .sqrt()
      )
  } else if (y.minus(dy).lte(k.sqrt())) {
    y = y.plus(dy)
    dy = dy.multipliedBy(-1)
    let dx = dy
      .multipliedBy(-1)
      .multipliedBy(
        new BigNumber(stableConfig.n - 1)
          .dividedBy(new BigNumber(stableConfig.n).minus(k.dividedBy(y.plus(dy)).dividedBy(y.plus(dy))))
          .sqrt()
      )
    dx = dx.multipliedBy(-1)
    return dx
  } else {
    const dx1 = k.sqrt().minus(x)
    const dy2 = dy.minus(k.sqrt().minus(y))
    const dx2 = getDyByDx(k.sqrt(), k.sqrt(), dy2, k, baseInSide)
    return dx1.plus(dx2)
  }
}

export function getDyByDx(
  xBase: BigNumber,
  yBase: BigNumber,
  dx: BigNumber,
  k: BigNumber,
  baseInSide: boolean
): BigNumber {
  let x = new BigNumber(xBase.gt(yBase) ? xBase : yBase)
  const y = new BigNumber(xBase.lt(yBase) ? xBase : yBase)
  if (xBase.lt(yBase)) {
    return getDxByDy(x, y, dx, k, baseInSide)
  }

  if (dx.gt(new BigNumber(0))) {
    const dy = computerD(x, y, k, dx, true)
    return dy
  } else if (x.plus(dx).gte(k.sqrt())) {
    x = x.plus(dx)
    dx = dx.multipliedBy(-1)
    let dy = computerD(x, y, k, dx, false)
    dy = dy.dividedBy(-1)
    return dy
  } else {
    const dy1 = k.sqrt().minus(y)
    const dx2 = dx.minus(k.sqrt().minus(x))
    const dy2 = getDxByDy(k.sqrt(), k.sqrt(), dx2, k, baseInSide)
    return dy1.plus(dy2)
  }
}

function computerD(xBase: BigNumber, yBase: BigNumber, k: BigNumber, di: BigNumber, positive: boolean): BigNumber {
  // const x = new BigNumber(xBase.gte(yBase) ? xBase : yBase)
  const y = new BigNumber(xBase.lt(yBase) ? xBase : yBase)
  let max = new BigNumber(y)
  let min = new BigNumber(0)
  let mid = new BigNumber(max).plus(min).dividedBy(2)
  let diTemp = new BigNumber(0)

  let count = 0

  while (di.abs().minus(diTemp.abs()).abs().gt(stableConfig.eps) && !min.eq(max)) {
    mid = new BigNumber(max).plus(min).dividedBy(2)
    console.log(
      'temp -> ',
      count++,
      min.toFixed(),
      min.toFixed(),
      max.toFixed(),
      di.toFixed(),
      diTemp.toFixed(),
      di.abs().minus(diTemp.abs()).abs().toFixed()
    )
    const tempY = positive ? y.plus(mid) : y
    const tempYPow = tempY.multipliedBy(tempY)
    diTemp = new BigNumber(mid)
      .multipliedBy(-1)
      .multipliedBy(
        new BigNumber(stableConfig.n - 1)
          .dividedBy(new BigNumber(stableConfig.n).minus(new BigNumber(k).dividedBy(tempYPow)))
          .sqrt()
      )

    if (diTemp.abs().gt(di.abs())) {
      max = mid
    } else {
      min = mid
    }
  }

  return mid
}
