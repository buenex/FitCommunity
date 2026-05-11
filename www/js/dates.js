const WEEKDAY_LABELS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function toDateKey(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function monthGrid(year, monthIndex) {
  const first = new Date(year, monthIndex, 1)
  const startPad = first.getDay()
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < startPad; i++) cells.push(null)
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(toDateKey(new Date(year, monthIndex, day)))
  }
  return cells
}

export function formatMonthTitle(year, monthIndex) {
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(
    new Date(year, monthIndex, 1),
  )
}

export function formatDayModalTitle(dateKey) {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(`${dateKey}T12:00:00`))
}

export function weekdayLabels() {
  return WEEKDAY_LABELS_PT
}

/** Semana domingo–sábado (fuso local) que contém `ref`. Retorna o domingo ao meio-dia local. */
export function startOfWeekSunday(ref = new Date()) {
  const d = new Date(ref)
  const day = d.getDay()
  d.setDate(d.getDate() - day)
  d.setHours(12, 0, 0, 0)
  return d
}

/** As sete chaves YYYY-MM-DD da semana (domingo → sábado) que contém `ref`. */
export function weekDateKeysFromSunday(ref = new Date()) {
  const start = startOfWeekSunday(ref)
  const keys = []
  for (let i = 0; i < 7; i++) {
    const x = new Date(start)
    x.setDate(start.getDate() + i)
    keys.push(toDateKey(x))
  }
  return keys
}

/** Próximo domingo após o início da semana atual de `ref` (início da próxima sequência). */
export function nextWeekStartSunday(ref = new Date()) {
  const start = startOfWeekSunday(ref)
  const n = new Date(start)
  n.setDate(start.getDate() + 7)
  return n
}

export function formatLongDatePt(d) {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d)
}
