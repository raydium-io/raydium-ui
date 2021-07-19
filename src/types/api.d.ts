export interface PricesData {
  [key: string]: number
}

export interface InfoData {
  tvl: number
  volume24h: number
  totalvolume: number
}

export interface PairData {}

export interface Rpc {
  url: string
  weight: number
}

export interface ConfigData {
  success: boolean
  strategy: 'speed' | 'weight'
  rpcs: Rpc[]
}

export interface EpochInfo {}

export interface NuxtApiInstance {
  getPrices: () => Promise<PricesData>
  getInfo: () => Promise<InfoData>
  getPairs: () => Promise<PairData[]>
  getConfig: () => Promise<ConfigData>
  getEpochInfo: (rpc: string) => Promise<EpochInfo>
}
