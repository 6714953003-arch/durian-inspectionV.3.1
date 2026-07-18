export interface Tree {
  id: number
  name: string
  zoneId: number
  temperature: number
  humidity: number
  tempStatus: 'normal' | 'warning' | 'critical'
  humidStatus: 'normal' | 'warning' | 'critical'
  online: boolean
  pumpOn: boolean
  pumpMode: 'on' | 'off' | 'auto'
  lastUpdated: string
}

export interface Zone {
  id: number
  name: string
  trees: Tree[]
}

const trees: Tree[] = [
  { id: 1, name: 'ต้นที่ 1', zoneId: 1, temperature: 28.4, humidity: 72, tempStatus: 'normal', humidStatus: 'warning', online: true, pumpOn: false, pumpMode: 'auto', lastUpdated: '2 min ago' },
  { id: 2, name: 'ต้นที่ 2', zoneId: 1, temperature: 29.1, humidity: 68, tempStatus: 'normal', humidStatus: 'normal', online: true, pumpOn: false, pumpMode: 'off', lastUpdated: '2 min ago' },
  { id: 3, name: 'ต้นที่ 3', zoneId: 1, temperature: 31.2, humidity: 75, tempStatus: 'warning', humidStatus: 'warning', online: true, pumpOn: true, pumpMode: 'on', lastUpdated: '1 min ago' },
  { id: 4, name: 'ต้นที่ 4', zoneId: 2, temperature: 27.8, humidity: 65, tempStatus: 'normal', humidStatus: 'normal', online: true, pumpOn: false, pumpMode: 'auto', lastUpdated: '3 min ago' },
  { id: 5, name: 'ต้นที่ 5', zoneId: 2, temperature: 33.5, humidity: 58, tempStatus: 'warning', humidStatus: 'normal', online: true, pumpOn: true, pumpMode: 'on', lastUpdated: '1 min ago' },
  { id: 6, name: 'ต้นที่ 6', zoneId: 2, temperature: 29.9, humidity: 70, tempStatus: 'normal', humidStatus: 'normal', online: true, pumpOn: false, pumpMode: 'auto', lastUpdated: '2 min ago' },
  { id: 7, name: 'ต้นที่ 7', zoneId: 3, temperature: 36.8, humidity: 85, tempStatus: 'critical', humidStatus: 'critical', online: true, pumpOn: true, pumpMode: 'on', lastUpdated: '5 min ago' },
  { id: 8, name: 'ต้นที่ 8', zoneId: 3, temperature: 30.2, humidity: 63, tempStatus: 'normal', humidStatus: 'normal', online: true, pumpOn: false, pumpMode: 'off', lastUpdated: '2 min ago' },
  { id: 9, name: 'ต้นที่ 9', zoneId: 3, temperature: 34.1, humidity: 61, tempStatus: 'warning', humidStatus: 'normal', online: true, pumpOn: false, pumpMode: 'auto', lastUpdated: '4 min ago' },
  { id: 10, name: 'ต้นที่ 10', zoneId: 3, temperature: 28.7, humidity: 69, tempStatus: 'normal', humidStatus: 'normal', online: true, pumpOn: false, pumpMode: 'off', lastUpdated: '2 min ago' },
]

export const zones: Zone[] = [
  { id: 1, name: 'Zone 1', trees: trees.filter((t) => t.zoneId === 1) },
  { id: 2, name: 'Zone 2', trees: trees.filter((t) => t.zoneId === 2) },
  { id: 3, name: 'Zone 3', trees: trees.filter((t) => t.zoneId === 3) },
]

export const allTrees = trees

export function generateChartData(baseTemp: number, baseHumid: number) {
  const now = Date.now()
  return Array.from({ length: 24 }, (_, i) => ({
    time: new Date(now - (23 - i) * 5 * 60 * 1000).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    temperature: +(baseTemp + (Math.random() - 0.5) * 4).toFixed(1),
    humidity: Math.round(baseHumid + (Math.random() - 0.5) * 10),
  }))
}

export function generateDailyData(baseTemp: number, baseHumid: number, days = 10) {
  const now = new Date()
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (days - 1 - i))
    return {
      date: d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
      temperature: +(baseTemp + (Math.random() - 0.5) * 6).toFixed(1),
      humidity: Math.round(baseHumid + (Math.random() - 0.5) * 15),
    }
  })
}

export function generateTodayStats(baseTemp: number, baseHumid: number) {
  return {
    tempMin: +(baseTemp - 2 - Math.random() * 2).toFixed(1),
    tempMax: +(baseTemp + 2 + Math.random() * 2).toFixed(1),
    tempAvg: baseTemp,
    humidMin: Math.round(baseHumid - 8 - Math.random() * 5),
    humidMax: Math.round(baseHumid + 8 + Math.random() * 5),
    humidAvg: baseHumid,
  }
}
