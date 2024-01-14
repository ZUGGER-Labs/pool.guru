import dayjs from 'dayjs'

// block number before 24H
// block number before 1 Week
// block number before 1 Month
export function getDeltaTimestamps(): [number, number, number] {
    const utcCurrentTime = dayjs()

    const t1 = utcCurrentTime.subtract(1, 'day').startOf('minute').unix()
    const tWeek = utcCurrentTime.subtract(1, 'week').startOf('minute').unix()
    const tMonth = utcCurrentTime.subtract(1, 'month').startOf('minute').unix()
    return [t1, tWeek, tMonth]
  }
  