export interface PricesData {
  [key: string]: number
}

export interface InfoData {
  tvl: number
  volume24h: number
}

export interface NuxtApiInstance {
  getPrices: (coins: string) => Promise<PricesData>
  getInfo: () => Promise<InfoData>
}
