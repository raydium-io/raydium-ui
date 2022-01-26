import BigNumber from 'bignumber.js'

const Gn = 150
const Geps = 10 ** -6

export function cK(xBase: BigNumber, yBase: BigNumber) {
  const n = new BigNumber(Gn)
  const x = new BigNumber(xBase.gt(yBase) ? xBase : yBase)
  const y = new BigNumber(xBase.lt(yBase) ? xBase : yBase)

  let max = new BigNumber(x)
  let min = new BigNumber(y)
  let mid = new BigNumber(max).plus(min).dividedBy(2)
  let left = getCurKLeft(mid, y)
  let right = getCurKRight(n, x, y, mid)
  let count = 0

  while (left.minus(right).abs().gt(Geps)) {
    if (left.gt(right)) {
      max = mid
    } else {
      min = mid
    }
    mid = new BigNumber(max).plus(min).dividedBy(2)
    left = getCurKLeft(mid, y)
    right = getCurKRight(n, x, y, mid)
    if (count++ > 1000) break
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

export function getStablePrice(k: number, x: number, y: number, baseIn: boolean) {
  let price
  if (x <= y) {
    price = Math.sqrt((10 * x ** 2 - k) / ((10 - 1) * x ** 2))
  } else {
    price = Math.sqrt(((10 - 1) * y ** 2) / (10 * y ** 2 - k))
  }
  if (baseIn) {
    return price
  } else {
    return 1 / price
  }
}

function cD(k: number, dx: number, x: number, y: number, flag: boolean) {
  let maxFlag = x > y ? x : y
  maxFlag = maxFlag > dx ? maxFlag : dx

  let min = -maxFlag
  if (flag) {
    const temp = Math.sqrt(k / Gn) - y
    min = min > temp ? min : temp
  }
  let max = maxFlag
  let mid = (min + max) / 2

  const left = dx
  let rightLeft = 0
  let rightMid = 0
  let rightRight = 0

  let count = 0
  while (Math.abs(Math.abs(left) - Math.abs(rightMid)) > Geps && min !== max) {
    console.log('temp', k, dx, x, y, flag)
    if (count++ > 3000) return 0
    mid = (min + max) / 2
    let temp = Gn - k / (flag ? y + min : y) ** 2
    temp = temp > 0 ? temp : 0
    rightLeft = -min * Math.sqrt((Gn - 1) / temp)
    rightMid = -mid * Math.sqrt((Gn - 1) / (Gn - k / (flag ? y + mid : y) ** 2))
    rightRight = -max * Math.sqrt((Gn - 1) / (Gn - k / (flag ? y + max : y) ** 2))

    // console.log('--', count++, rightLeft, rightMid, rightRight, Math.abs(Math.abs(left) - Math.abs(rightMid)))
    if ((rightLeft < left && left < rightMid) || (rightLeft > left && left > rightMid)) {
      max = mid
    } else if ((rightMid < left && left < rightRight) || (rightMid > left && left > rightRight)) {
      min = mid
    }
  }
  return mid
}

export function getDxByDy(k: number, x: number, y: number, dy: number): number {
  const y0 = Math.sqrt(k)
  if (dy <= 0) {
    if (-dy > y) return 0 // error
    const dx = -dy * Math.sqrt((Gn - 1) / (Gn - k / (y + dy) ** 2))
    return dx
  } else if (y + dy <= y0) {
    y = y + dy
    dy = -dy
    let dx = -dy * Math.sqrt((Gn - 1) / (Gn - k / (y + dy) ** 2))
    dx = -dx
    return dx
  } else {
    const dx1 = y0 - x
    const dy2 = dy - (y0 - y)
    const dx2 = getDyByDx(k, y0, y0, dy2)
    return dx1 + dx2
  }
}

export function getDyByDx(k: number, x: number, y: number, dx: number): number {
  const y0 = Math.sqrt(k)
  if (dx >= 0) {
    const dy = cD(k, dx, x, y, true)
    return dy
  } else if (x + dx >= y0) {
    x = x + dx
    dx = -dx
    const dy = -cD(k, dx, x, y, false)
    return dy
  } else {
    const dy1 = y0 - y
    const dx2 = dx - (y0 - x)
    const dy2 = getDxByDy(k, y0, y0, dx2)
    return dy1 + dy2
  }
}
