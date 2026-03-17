function pad(value: number): string {
  return value.toString().padStart(2, '0')
}

export function formatDateInput(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function getLastDaysRange(days: number, baseDate: Date = new Date()) {
  const end = new Date(baseDate)
  const start = new Date(baseDate)
  start.setDate(start.getDate() - days)

  return {
    dateFrom: formatDateInput(start),
    dateTo: formatDateInput(end),
  }
}
