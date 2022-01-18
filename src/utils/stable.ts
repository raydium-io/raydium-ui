import { stableConfig } from '@/store/liquidity'
import BigNumber from 'bignumber.js'

function getDxByDy(x: BigNumber, y: BigNumber, dy: BigNumber, k: BigNumber): BigNumber {
  if (dy.lt(0)) {
    if (dy.abs().gte(y)) throw new Error('error')

    return dy.abs().multipliedBy(
      new BigNumber(stableConfig.n)
        .minus(1)
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
    let dx = dy.multipliedBy(-1).multipliedBy(
      new BigNumber(stableConfig.n)
        .minus(1)
        .dividedBy(new BigNumber(stableConfig.n).minus(k.dividedBy(y.plus(dy)).dividedBy(y.plus(dy))))
        .sqrt()
    )
    dx = dx.multipliedBy(-1)
    return dx
  } else {
    const dx1 = x.sqrt().minus(x)
    const dy2 = dy.minus(k.sqrt().minus(y))
    const dx2 = getDyByDx(k.sqrt(), k.sqrt(), dy2, k)
    return dx1.plus(dx2)
  }
}

function getDyByDx(x: BigNumber, y: BigNumber, dx: BigNumber, k: BigNumber): BigNumber {
  if (dx.gte(0)) {
    console.log('todo')
  } else if (x.plus(dx).gte(k.sqrt())) {
    x = x.plus(dx)
    dx = dx.multipliedBy(-1)
    console.log('todo')

    dy = dy.dividedBy(-1)
    return dy
  } else {
    const dy1 = k.sqrt().minus(y)
    const dx2 = dx.minus(k.sqrt().minus(x))
    const dy2 = getDxByDy(k.sqrt(), k.sqrt(), dx2, k)
    return dy1.plus(dy2)
  }

  return new BigNumber(0)
}
