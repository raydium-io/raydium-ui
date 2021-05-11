export interface PricesData {
  [key: string]: number
}

export interface InfoData {
  tvl: number
  volume24h: number
}

export interface PairData {}

export interface NuxtApiInstance {
  getPrices: () => Promise<PricesData>
  getInfo: () => Promise<InfoData>
  getPairs: () => Promise<PairData[]>
}
