declare module 'lunar-javascript' {
  export class Lunar {
    static fromDate(date: Date): Lunar
    getMonthInChinese(): string
    getDayInChinese(): string
    getYearInGanZhi(): string
    getYearShengXiao(): string
    getJieQi(): string
    getFestivals(): string[]
    getDayYi(): string[]
    getDayJi(): string[]
  }

  export class Solar {
    static fromDate(date: Date): Solar
    getFestivals(): string[]
  }
} 