import * as api from './api.js'
import {
  formatDayModalTitle,
  formatLongDatePt,
  formatMonthTitle,
  monthGrid,
  nextWeekStartSunday,
  toDateKey,
  weekdayLabels,
  weekDateKeysFromSunday,
} from './dates.js'

/** @type {'home'|'login'|'hub'|'community'} */
let screen = 'home'

/** @type {any | null} */
let community = null

let calYear = new Date().getFullYear()
let calMonth = new Date().getMonth()

const $ = (id) => /** @type {HTMLElement} */ (document.getElementById(id))

function showScreen(name) {
  screen = name
  for (const el of document.querySelectorAll('.screen')) {
    el.classList.add('hidden')
  }
  const map = {
    home: 'screen-home',
    login: 'screen-login',
    hub: 'screen-hub',
    community: 'screen-community',
  }
  $(map[name])?.classList.remove('hidden')
}

function refreshHome() {
  const user = api.getSessionUser()
  const logged = $('home-logged')
  const guest = $('home-guest')
  if (user) {
    logged.classList.remove('hidden')
    guest.classList.add('hidden')
    $('home-login-name').textContent = user.login
  } else {
    logged.classList.add('hidden')
    guest.classList.remove('hidden')
  }
}

function setHubBanner(text, visible) {
  const b = $('hub-banner')
  b.textContent = text
  b.classList.toggle('hidden', !visible)
}

async function refreshHub() {
  setHubBanner('', false)
  const list = $('hub-list')
  list.innerHTML = ''
  const mine = await api.fetchMine()
  $('hub-empty').classList.toggle('hidden', mine.length > 0)
  for (const c of mine) {
    const li = document.createElement('li')
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'community-row'
    btn.innerHTML = `<span class="community-row__name"></span><span class="community-row__meta"></span>`
    btn.querySelector('.community-row__name').textContent = c.name
    btn.querySelector('.community-row__meta').textContent = c.inviteCode
    btn.addEventListener('click', () => {
      void openCommunity(c.id)
    })
    li.appendChild(btn)
    list.appendChild(li)
  }
}

function renderNotifications() {
  const ul = $('notif-list')
  ul.innerHTML = ''
  const items = community?.notifications ?? []
  $('notif-empty').classList.toggle('hidden', items.length > 0)
  for (const n of items) {
    const li = document.createElement('li')
    li.className = 'notif-item'
    const when = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(
      n.createdAt,
    )
    li.innerHTML = `<p class="notif-item__text"></p><p class="notif-item__meta"></p>`
    li.querySelector('.notif-item__text').textContent = n.message
    li.querySelector('.notif-item__meta').textContent = `${n.authorLogin} · ${when}`
    ul.appendChild(li)
  }
}

function renderCalendar() {
  const root = $('calendar-root')
  if (!community) return

  const user = api.getSessionUser()
  const todayKey = toDateKey(new Date())
  const labels = weekdayLabels()
  const cells = monthGrid(calYear, calMonth)

  const wrap = document.createElement('div')
  wrap.className = 'calendar'

  const toolbar = document.createElement('div')
  toolbar.className = 'calendar__toolbar'
  const btnPrev = document.createElement('button')
  btnPrev.type = 'button'
  btnPrev.className = 'btn btn--ghost'
  btnPrev.textContent = '‹'
  btnPrev.addEventListener('click', () => {
    const d = new Date(calYear, calMonth - 1, 1)
    calYear = d.getFullYear()
    calMonth = d.getMonth()
    renderCalendar()
  })
  const btnNext = document.createElement('button')
  btnNext.type = 'button'
  btnNext.className = 'btn btn--ghost'
  btnNext.textContent = '›'
  btnNext.addEventListener('click', () => {
    const d = new Date(calYear, calMonth + 1, 1)
    calYear = d.getFullYear()
    calMonth = d.getMonth()
    renderCalendar()
  })
  const title = document.createElement('h3')
  title.className = 'calendar__title'
  title.textContent = formatMonthTitle(calYear, calMonth)
  toolbar.append(btnPrev, title, btnNext)

  const wd = document.createElement('div')
  wd.className = 'calendar__weekdays'
  for (const l of labels) {
    const s = document.createElement('span')
    s.className = 'calendar__weekday'
    s.textContent = l
    wd.appendChild(s)
  }

  const grid = document.createElement('div')
  grid.className = 'calendar__grid'

  const byDate = community.checkinsByDate || {}

  for (let i = 0; i < cells.length; i++) {
    const key = cells[i]
    if (!key) {
      const empty = document.createElement('div')
      empty.className = 'calendar__cell calendar__cell--empty'
      grid.appendChild(empty)
      continue
    }

    const list = byDate[key] || []
    const hasAny = list.length > 0
    const mine = user && list.some((m) => m.userId === user.userId)
    const isToday = key === todayKey
    const dayNum = Number(key.slice(8))

    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'calendar__cell'
    if (isToday) btn.classList.add('calendar__cell--today')
    if (hasAny) btn.classList.add('calendar__cell--has')
    if (mine) btn.classList.add('calendar__cell--mine')

    const span = document.createElement('span')
    span.className = 'calendar__daynum'
    span.textContent = String(dayNum)
    btn.appendChild(span)
    if (mine) {
      const fl = document.createElement('span')
      fl.className = 'calendar__flame'
      fl.setAttribute('aria-hidden', 'true')
      btn.appendChild(fl)
    }

    btn.addEventListener('click', () => openDayModal(key))
    grid.appendChild(btn)
  }

  wrap.append(toolbar, wd, grid)
  root.innerHTML = ''
  root.appendChild(wrap)
}

function openDayModal(dateKey) {
  const byDate = community?.checkinsByDate || {}
  const list = byDate[dateKey] || []
  $('day-modal-title').textContent = `Check-ins em ${formatDayModalTitle(dateKey)}`
  $('day-modal-empty').classList.toggle('hidden', list.length > 0)
  const ul = $('day-modal-list')
  ul.innerHTML = ''
  ul.classList.toggle('hidden', list.length === 0)
  for (const m of list) {
    const li = document.createElement('li')
    li.textContent = m.login
    ul.appendChild(li)
  }
  $('modal-day').classList.remove('hidden')
}

function closeDayModal() {
  $('modal-day').classList.add('hidden')
}

function updateCheckinButton() {
  const user = api.getSessionUser()
  const btn = $('btn-checkin')
  if (!community || !user) return
  const todayKey = toDateKey(new Date())
  const list = community.checkinsByDate?.[todayKey] || []
  const already = list.some((m) => m.userId === user.userId)
  btn.disabled = already
  btn.textContent = already ? 'Check-in de hoje feito' : 'Fazer check-in hoje'
}

function ensureStreakSelectPopulated() {
  const sel = /** @type {HTMLSelectElement | null} */ ($('select-streak-target'))
  if (!sel || sel.options.length > 0) return
  for (let n = 2; n <= 6; n++) {
    const o = document.createElement('option')
    o.value = String(n)
    o.textContent = `${n} dias`
    sel.appendChild(o)
  }
}

function renderStreak() {
  if (!community) return
  ensureStreakSelectPopulated()

  const rawTarget = Number(community.streakDaysTarget ?? 4)
  const target = Number.isFinite(rawTarget) ? Math.min(6, Math.max(2, Math.round(rawTarget))) : 4
  const sel = /** @type {HTMLSelectElement | null} */ ($('select-streak-target'))
  if (sel) sel.value = String(target)

  const user = api.getSessionUser()
  const root = $('streak-week-root')
  const summary = $('streak-summary')
  const encourage = $('streak-encourage')
  if (!root || !summary || !encourage) return

  const todayKey = toDateKey(new Date())
  const weekKeys = weekDateKeysFromSunday(new Date())
  const labels = weekdayLabels()
  const byDate = community.checkinsByDate || {}
  /** @type {Set<string>} */
  const checked = new Set()
  for (const key of weekKeys) {
    const list = byDate[key] || []
    if (user && list.some((m) => m.userId === user.userId)) checked.add(key)
  }

  const done = checked.size
  const slotsAhead = weekKeys.filter((k) => k >= todayKey && !checked.has(k)).length
  const stillPossible = done + slotsAhead >= target
  const met = done >= target

  root.innerHTML = ''
  const row = document.createElement('div')
  row.className = 'streak-week__row'
  for (let i = 0; i < 7; i++) {
    const key = weekKeys[i]
    const has = checked.has(key)
    const cell = document.createElement('div')
    cell.className = 'streak-day'
    if (has) cell.classList.add('streak-day--done')
    else if (key < todayKey) cell.classList.add('streak-day--missed')
    else cell.classList.add('streak-day--upcoming')
    if (key === todayKey) cell.classList.add('streak-day--today')

    const lab = document.createElement('span')
    lab.className = 'streak-day__wd'
    lab.textContent = labels[i]
    const num = document.createElement('span')
    num.className = 'streak-day__num'
    num.textContent = String(Number(key.slice(8)))
    cell.append(lab, num)
    row.appendChild(cell)
  }
  root.appendChild(row)

  if (met) {
    summary.textContent = `Você bateu a meta desta semana (${target} ${target === 1 ? 'dia' : 'dias'}). Parabéns!`
    encourage.classList.add('hidden')
    encourage.textContent = ''
  } else {
    summary.textContent = `Esta semana: ${done} de ${target} dias com check-in.`
    if (!stillPossible) {
      const nextStart = nextWeekStartSunday(new Date())
      encourage.textContent =
        'Não dá mais para completar a meta nesta semana, mas isso faz parte — foque no que vem por aí. ' +
        `A próxima sequência começa no domingo, ${formatLongDatePt(nextStart)}.`
      encourage.classList.remove('hidden')
    } else {
      encourage.classList.add('hidden')
      encourage.textContent = ''
    }
  }
}

function renderCommunityView() {
  if (!community) return
  $('community-name').textContent = community.name
  $('community-code').textContent = community.inviteCode
  updateCheckinButton()
  renderStreak()
  renderCalendar()
  renderNotifications()
}

async function openCommunity(id) {
  try {
    community = await api.fetchCommunity(id)
    calYear = new Date().getFullYear()
    calMonth = new Date().getMonth()
    renderCommunityView()
    showScreen('community')
  } catch (e) {
    alert(e.message || String(e))
  }
}

function wire() {
  $('btn-go-login').addEventListener('click', () => showScreen('login'))
  $('btn-login-back').addEventListener('click', () => showScreen('home'))
  $('btn-go-communities').addEventListener('click', async () => {
    try {
      await refreshHub()
      showScreen('hub')
    } catch (e) {
      alert(e.message || String(e))
    }
  })
  $('btn-logout').addEventListener('click', () => {
    api.clearSession()
    refreshHome()
    showScreen('home')
  })

  $('btn-hub-back').addEventListener('click', () => {
    refreshHome()
    showScreen('home')
  })

  $('btn-community-back').addEventListener('click', async () => {
    try {
      await refreshHub()
      showScreen('hub')
    } catch (e) {
      alert(e.message || String(e))
    }
  })

  $('form-login').addEventListener('submit', async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    const login = String(fd.get('login') || '')
    const password = String(fd.get('password') || '')
    const err = $('login-error')
    err.classList.add('hidden')
    try {
      const { user, token } = await api.postSession(login, password)
      api.setSession({ user, token })
      refreshHome()
      await refreshHub()
      showScreen('hub')
    } catch (ex) {
      err.textContent = ex.message || String(ex)
      err.classList.remove('hidden')
    }
  })

  $('form-create').addEventListener('submit', async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    const name = String(fd.get('name') || '')
    try {
      community = await api.createCommunity(name)
      e.target.reset()
      setHubBanner(`Comunidade criada. Código: ${community.inviteCode}`, true)
      calYear = new Date().getFullYear()
      calMonth = new Date().getMonth()
      renderCommunityView()
      showScreen('community')
    } catch (ex) {
      alert(ex.message || String(ex))
    }
  })

  $('form-join').addEventListener('submit', async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    const code = String(fd.get('code') || '')
    try {
      community = await api.joinCommunity(code)
      e.target.reset()
      setHubBanner('', false)
      calYear = new Date().getFullYear()
      calMonth = new Date().getMonth()
      renderCommunityView()
      showScreen('community')
    } catch (ex) {
      alert(ex.message || String(ex))
    }
  })

  $('btn-copy-code').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(community?.inviteCode || '')
    } catch {
      /* ignore */
    }
  })

  $('btn-checkin').addEventListener('click', async () => {
    if (!community) return
    const todayKey = toDateKey(new Date())
    try {
      const { community: next } = await api.postCheckin(community.id, todayKey)
      community = next
      renderCommunityView()
    } catch (ex) {
      alert(ex.message || String(ex))
    }
  })

  $('form-notif').addEventListener('submit', async (e) => {
    e.preventDefault()
    if (!community) return
    const fd = new FormData(e.target)
    const message = String(fd.get('message') || '')
    try {
      const { community: next } = await api.postNotification(community.id, message)
      community = next
      e.target.reset()
      renderCommunityView()
    } catch (ex) {
      alert(ex.message || String(ex))
    }
  })

  $('form-streak-target').addEventListener('submit', async (e) => {
    e.preventDefault()
    if (!community) return
    const fd = new FormData(e.target)
    const streakDaysTarget = Number(fd.get('streakDaysTarget'))
    try {
      community = await api.patchCommunity(community.id, { streakDaysTarget })
      renderCommunityView()
    } catch (ex) {
      alert(ex.message || String(ex))
    }
  })

  $('btn-day-close').addEventListener('click', closeDayModal)
  const modalBackdrop = $('modal-day')
  const modalPanel = modalBackdrop.querySelector('.modal')
  modalBackdrop.addEventListener('click', (ev) => {
    if (ev.target === modalBackdrop) closeDayModal()
  })
  modalPanel?.addEventListener('click', (ev) => {
    ev.stopPropagation()
  })
}

function boot() {
  wire()
  refreshHome()
  showScreen('home')
}

boot()
