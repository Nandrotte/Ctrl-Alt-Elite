import { useEffect, useMemo, useState } from 'react'

const accounts = [
  {
    id: 'zicht',
    name: 'DOE JOHN',
    label: 'Zichtrekening',
    balance: '2.605,73 EUR',
    icon: 'wallet',
  },
  {
    id: 'spaar',
    name: 'DOE JOHN',
    label: 'Spaarrekening',
    balance: '20,05 EUR',
    icon: 'piggy',
  },
  {
    id: 'visa',
    name: 'DOE JOHN',
    label: 'Visa Debit',
    balance: 'Limiet · 2.500 EUR',
    icon: 'card',
  },
]

const quickPay = [
  { id: 1, label: 'JP', name: 'J. Peeters', tone: 'initials' },
  { id: 2, label: 'wallet', name: 'Zicht', tone: 'icon' },
  { id: 3, label: 'SM', name: 'S. Maes', tone: 'initials' },
  { id: 4, label: 'wallet', name: 'Spaar', tone: 'icon' },
  { id: 5, label: 'AL', name: 'A. Lenaerts', tone: 'initials' },
]

const primaryActions = [
  { id: 'receive', label: 'Geld ontvangen', tone: 'navy', icon: 'receive' },
  { id: 'scan', label: 'Code scannen', tone: 'navy', icon: 'qr' },
  { id: 'transfer', label: 'Overschrijven', tone: 'cyan', icon: 'transfer' },
]

const SUBSCRIPTION_PATH = '/subscription-manager'

const menuActions = [
  { id: 'invoice', label: 'Factuur betalen', badge: 'Nieuw', icon: 'invoice' },
  { id: 'subs', label: 'Subscriptie Manager', icon: 'subs', href: SUBSCRIPTION_PATH },
  { id: 'standing', label: 'Doorlopende opdrachten', icon: 'repeat' },
  { id: 'cards', label: 'Kaarten beheren', icon: 'cards' },
  { id: 'docs', label: 'Documenten', icon: 'docs' },
]

const ALL_CATEGORIES = 'Alle'

const euroFormat = new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' })
const euro = (amount) => euroFormat.format(amount)

// Backend dates are ISO (yyyy-mm-dd); parse them as local dates.
const toDate = (iso) => new Date(`${iso}T00:00:00`)
const shortDate = (iso) => toDate(iso).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short' })
const longDate = (iso) => toDate(iso).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' })
const dayOfMonth = (iso) => toDate(iso).getDate()
const monthShort = (iso) => toDate(iso).toLocaleDateString('nl-BE', { month: 'short' }).replace('.', '')
const monthLabel = (iso) => (iso ? toDate(iso).toLocaleDateString('nl-BE', { month: 'long', year: 'numeric' }) : '')

function todayIso() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

const emptySubscription = { name: '', category: 'Streaming', amount: '9.99', nextDate: todayIso() }

function getPageFromLocation() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  if (path === SUBSCRIPTION_PATH || window.location.hash === '#dashboard') {
    return 'subscriptions'
  }
  return 'home'
}

function goTo(path) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

function handleInternalNav(event, path) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
    return
  }
  event.preventDefault()
  goTo(path)
}

function KbcLogo() {
  return (
    <svg className="kbcLogo" viewBox="0 0 62 28" role="img" aria-label="KBC">
      <rect x="0" y="0" width="28" height="4" rx="2" fill="#00aeef" />
      <text
        x="0"
        y="25"
        fill="currentColor"
        fontFamily="'Source Sans 3', 'Segoe UI', sans-serif"
        fontWeight="800"
        fontSize="22"
        letterSpacing="-0.4"
      >
        KBC
      </text>
    </svg>
  )
}

function SvgIcon({ name }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }

  switch (name) {
    case 'settings':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M10.2 3.8h3.6l.4 2.1a6.8 6.8 0 0 1 1.7 1l2-1 1.8 1.8-1 2a6.8 6.8 0 0 1 1 1.7l2.1.4v3.6l-2.1.4a6.8 6.8 0 0 1-1 1.7l1 2-1.8 1.8-2-1a6.8 6.8 0 0 1-1.7 1l-.4 2.1h-3.6l-.4-2.1a6.8 6.8 0 0 1-1.7-1l-2 1-1.8-1.8 1-2a6.8 6.8 0 0 1-1-1.7l-2.1-.4v-3.6l2.1-.4a6.8 6.8 0 0 1 1-1.7l-1-2 1.8-1.8 2 1a6.8 6.8 0 0 1 1.7-1l.4-2.1Z"
            {...common}
          />
          <circle cx="12" cy="12" r="2.8" {...common} />
        </svg>
      )
    case 'bell':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6.5 9.5a5.5 5.5 0 0 1 11 0c0 4.2 1.5 5.5 1.5 5.5H5s1.5-1.3 1.5-5.5Z" {...common} />
          <path d="M10 18.5a2 2 0 0 0 4 0" {...common} />
        </svg>
      )
    case 'search':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="6.5" {...common} />
          <path d="M16.2 16.2 20 20" {...common} />
        </svg>
      )
    case 'edit':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 20h4.2L19 9.2 14.8 5 4 15.8V20Z" {...common} />
          <path d="M12.8 6.9 17.1 11.2" {...common} />
        </svg>
      )
    case 'wallet':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3.5" y="6.5" width="17" height="12" rx="2.5" {...common} />
          <path d="M3.5 10h17" {...common} />
          <circle cx="16.2" cy="14.2" r="1.1" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'piggy':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M16.5 9.2c.8-.2 1.5-.8 1.8-1.6.2.9.9 1.6 1.8 1.8-.8.3-1.4.9-1.6 1.7" {...common} />
          <path d="M5.5 11.5c0-3.2 2.8-5.5 6.5-5.5 3 0 5.5 1.5 6.3 3.7.8.2 1.4.9 1.4 1.8v1.3c0 1.2-.9 2.2-2.1 2.4l-.8 2.8H13l-.7-2h-1.6l-.7 2H7.7l-.8-2.8A2.4 2.4 0 0 1 5 12.8v-.4c0-.3.2-.6.5-.9Z" {...common} />
          <circle cx="9.2" cy="11.2" r="0.8" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'card':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3.5" y="6" width="17" height="12" rx="2.2" {...common} />
          <path d="M3.5 10h17M7 14.5h4" {...common} />
        </svg>
      )
    case 'chat':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 6.5h14a1.5 1.5 0 0 1 1.5 1.5v7a1.5 1.5 0 0 1-1.5 1.5H10l-4 3v-3H5A1.5 1.5 0 0 1 3.5 15V8A1.5 1.5 0 0 1 5 6.5Z" {...common} />
        </svg>
      )
    case 'chevron':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m9 6 6 6-6 6" {...common} />
        </svg>
      )
    case 'receive':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="7" y="3.5" width="10" height="17" rx="2.2" {...common} />
          <path d="M12 9v5.5M9.8 12.3 12 14.5l2.2-2.2" {...common} />
        </svg>
      )
    case 'qr':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 5h5v5H5V5Zm9 0h5v5h-5V5ZM5 14h5v5H5v-5Zm9 2.5h2V19h-2v-2.5Zm3.5 0H19V19h-1.5v-2.5ZM14 14h2.2v2.2H14V14Zm3.8 0H19v2.2h-1.2V14Z" {...common} />
        </svg>
      )
    case 'transfer':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="6.5" y="3.5" width="11" height="17" rx="2.2" {...common} />
          <path d="M12 8.5v6M14.3 12.2 12 14.5l-2.3-2.3" {...common} />
        </svg>
      )
    case 'invoice':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 3.5h7.5L19 8v12.5H7V3.5Z" {...common} />
          <path d="M14.5 3.5V8H19M9.5 12h5M9.5 15.5h5" {...common} />
        </svg>
      )
    case 'subs':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="4" y="5" width="16" height="14" rx="2.2" {...common} />
          <path d="M8 9.5h8M8 13h5" {...common} />
        </svg>
      )
    case 'repeat':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M17 7H8.5A3.5 3.5 0 0 0 5 10.5V12" {...common} />
          <path d="m14.5 4.5 2.5 2.5-2.5 2.5" {...common} />
          <path d="M7 17h8.5A3.5 3.5 0 0 0 19 13.5V12" {...common} />
          <path d="m9.5 19.5-2.5-2.5 2.5-2.5" {...common} />
        </svg>
      )
    case 'cards':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="4" y="7" width="14" height="10" rx="2" {...common} />
          <path d="M6 5.5h12.5A1.5 1.5 0 0 1 20 7v8" {...common} />
        </svg>
      )
    case 'docs':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 4.5h6l4 4V19a1.5 1.5 0 0 1-1.5 1.5H8A1.5 1.5 0 0 1 6.5 19V6A1.5 1.5 0 0 1 8 4.5Z" {...common} />
          <path d="M14 4.5V9h4.5M9.5 13h5M9.5 16h3.5" {...common} />
        </svg>
      )
    case 'calendar':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="4" y="5.5" width="16" height="14.5" rx="2.2" {...common} />
          <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" {...common} />
        </svg>
      )
    case 'spark':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 17.5h6M10 20.5h4" {...common} />
          <path d="M12 3.5a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2v.2h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3.5Z" {...common} />
        </svg>
      )
    case 'plus':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 5v14M5 12h14" {...common} />
        </svg>
      )
    case 'close':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" {...common} />
        </svg>
      )
    case 'check':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m5 12.5 4.5 4.5L19 7.5" {...common} />
        </svg>
      )
    default:
      return null
  }
}

function KbcHeader() {
  return (
    <header className="kbcHeader">
      <a className="logoLink" href="/" onClick={(event) => handleInternalNav(event, '/')}>
        <KbcLogo />
      </a>
      <div className="headerIcons">
        <button className="iconBtn" type="button" aria-label="Instellingen">
          <SvgIcon name="settings" />
        </button>
        <button className="iconBtn" type="button" aria-label="Meldingen">
          <SvgIcon name="bell" />
          <span className="notifDot" />
        </button>
      </div>

      <div className="kateSearch">
        <SvgIcon name="search" />
        <input placeholder="Hoe kan ik je helpen?" aria-label="Zoeken met Kate" />
        <strong className="kateMark">Kate</strong>
      </div>
    </header>
  )
}

const STATUS_LABELS = {
  HERKEND: 'Herkend',
  BEVESTIGD: 'Bevestigd',
  GEANNULEERD: 'Opgezegd',
}

const CATEGORY_TONES = ['navy', 'blue', 'teal', 'cyan', 'slate']

function SubscriptionManagerPage() {
  const [subscriptions, setSubscriptions] = useState([])
  const [dashboardData, setDashboardData] = useState(null)
  const [backendStatus, setBackendStatus] = useState('loading')
  const [category, setCategory] = useState(ALL_CATEGORIES)
  const [reserveEnabled, setReserveEnabled] = useState(false)
  const [reserveAmount, setReserveAmount] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [showCompare, setShowCompare] = useState(false)
  const [newSubscription, setNewSubscription] = useState(emptySubscription)

  useEffect(() => {
    let cancelled = false
    fetch('/api/dashboard')
      .then((response) => {
        if (!response.ok) throw new Error('Dashboard API unavailable')
        return response.json()
      })
      .then((dashboard) => {
        if (cancelled) return
        setDashboardData(dashboard)
        setSubscriptions(dashboard.subscriptions.map((item) => ({
          ...item,
          amount: Number(item.amount),
          confidence: Math.round(Number(item.confidence) * 100),
        })))
        setReserveEnabled(dashboard.reserve.enabled)
        setReserveAmount(Number(dashboard.reserve.monthlyTarget))
        setBackendStatus('live')
      })
      .catch(() => {
        if (!cancelled) setBackendStatus('error')
      })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!showAdd && !showCompare) return undefined
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setShowAdd(false)
        setShowCompare(false)
      }
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [showAdd, showCompare])

  const syncReserve = (enabled, amount) => {
    fetch('/api/reserve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled, monthlyTarget: Number(amount) || 0 }),
    }).catch(() => setBackendStatus('offline'))
  }

  const updateStatus = (item, status) => {
    setSubscriptions((current) => (
      status === 'GEANNEGEERD'
        ? current.filter((entry) => entry.id !== item.id)
        : current.map((entry) => (entry.id === item.id ? { ...entry, status } : entry))
    ))
    if (item.manual) return
    fetch(`/api/subscriptions/${item.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(() => setBackendStatus('offline'))
  }

  const categories = useMemo(
    () => [...new Set(subscriptions.map((item) => item.category))],
    [subscriptions],
  )
  const categoryTone = (name) => CATEGORY_TONES[Math.max(categories.indexOf(name), 0) % CATEGORY_TONES.length]

  const pendingReview = subscriptions.filter((item) => item.status === 'HERKEND')
  const activeSubscriptions = subscriptions.filter((item) => item.status !== 'GEANNULEERD')
  const monthlyTotal = activeSubscriptions.reduce((sum, item) => sum + item.amount, 0)
  const annualTotal = monthlyTotal * 12

  const visibleSubscriptions = useMemo(() => (
    [...(category === ALL_CATEGORIES ? subscriptions : subscriptions.filter((item) => item.category === category))]
      .sort((a, b) => a.nextDate.localeCompare(b.nextDate))
  ), [category, subscriptions])

  const categorySpend = useMemo(() => {
    const grouped = activeSubscriptions.reduce((groups, item) => ({
      ...groups,
      [item.category]: (groups[item.category] || 0) + item.amount,
    }), {})
    return Object.entries(grouped).sort(([, first], [, second]) => second - first)
  }, [activeSubscriptions])

  const upcoming = [...activeSubscriptions].sort((a, b) => a.nextDate.localeCompare(b.nextDate))
  const nextSubscription = upcoming.find((item) => item.nextDate >= todayIso()) || upcoming[0]

  const overlap = dashboardData?.overlaps?.[0]
  const overlapItems = overlap
    ? overlap.subscriptions.map((name) => subscriptions.find((item) => item.name === name)).filter(Boolean)
    : []
  const overlapSaving = overlap ? Number(overlap.possibleMonthlySaving) : 0
  const preDebitAlerts = dashboardData?.alerts || []

  const reserveTarget = Number(reserveAmount) || 0
  const reserveCoverage = monthlyTotal > 0 ? Math.min(100, Math.round((reserveTarget / monthlyTotal) * 100)) : 100
  const reserveDifference = reserveTarget - monthlyTotal

  const addSubscription = (event) => {
    event.preventDefault()
    if (!newSubscription.name.trim() || Number(newSubscription.amount) <= 0) return
    setSubscriptions((current) => [...current, {
      id: `manual-${Date.now()}`,
      manual: true,
      name: newSubscription.name.trim(),
      category: newSubscription.category,
      amount: Number(newSubscription.amount),
      nextDate: newSubscription.nextDate,
      frequency: 'Maandelijks',
      confidence: 100,
      reason: 'Handmatig toegevoegd',
      status: 'BEVESTIGD',
    }])
    setNewSubscription(emptySubscription)
    setShowAdd(false)
  }

  const statusText = {
    live: 'Live gekoppeld',
    loading: 'Gegevens laden…',
    error: 'Backend niet bereikbaar',
    offline: 'Wijziging niet opgeslagen',
  }[backendStatus]

  return (
    <div className="shell">
      <div className="appFrame">
        <div className="topBand">
          <KbcHeader />
          <section className="subscriptionHero">
            <nav className="breadcrumb" aria-label="Kruimelpad">
              <a href="/" onClick={(event) => handleInternalNav(event, '/')}>Overzicht</a>
              <SvgIcon name="chevron" />
              <span>Subscriptie Manager</span>
            </nav>
            <div className="heroRow">
              <div className="heroCopy">
                <h1 className="sectionTitle">Subscriptie Manager</h1>
                <p>Al je terugkerende betalingen automatisch herkend, op één plek.</p>
              </div>
              <div className="heroTotal">
                <span>Vaste kosten per maand</span>
                <strong>{euro(monthlyTotal)}</strong>
                <small>{euro(annualTotal)} per jaar</small>
              </div>
            </div>
            <span className={`aiStatus ${backendStatus}`}><span /> {statusText}</span>
          </section>
        </div>

        <main className="kbcMain subscriptionMain">
          <section className="kpiStrip" aria-label="Samenvatting">
            <article>
              <span className="kpiIcon"><SvgIcon name="subs" /></span>
              <div><span>Actieve abonnementen</span><strong>{activeSubscriptions.length}</strong></div>
            </article>
            <article>
              <span className="kpiIcon"><SvgIcon name="calendar" /></span>
              <div>
                <span>Volgende afschrijving</span>
                <strong>{nextSubscription ? euro(nextSubscription.amount) : '—'}</strong>
                <small>{nextSubscription ? `${shortDate(nextSubscription.nextDate)} · ${nextSubscription.name}` : 'Geen gepland'}</small>
              </div>
            </article>
            <article>
              <span className="kpiIcon"><SvgIcon name="wallet" /></span>
              <div><span>Kosten per jaar</span><strong>{euro(annualTotal)}</strong></div>
            </article>
            <article className="kpiHighlight">
              <span className="kpiIcon"><SvgIcon name="spark" /></span>
              <div>
                <span>Mogelijke besparing</span>
                <strong>{euro(overlapSaving)}</strong>
                <small>per maand</small>
              </div>
            </article>
          </section>

          {preDebitAlerts.map((alert) => (
            <div className="preDebitNotice" key={`${alert.subscription}-${alert.date}`}>
              <SvgIcon name="bell" />
              <div><strong>{alert.subscription} wordt binnenkort afgeschreven</strong><span>{alert.message} {euro(Number(alert.amount))} op {longDate(alert.date)}.</span></div>
            </div>
          ))}

          <div className="managerGrid">
            <div className="mainColumn">
              <section className="panel subscriptionsPanel">
                <header className="panelHeader">
                  <div>
                    <h2>Jouw abonnementen</h2>
                    <p>Herkend op basis van je betalingen van de afgelopen maanden.</p>
                  </div>
                  <button type="button" className="secondaryButton" onClick={() => setShowAdd(true)}>
                    <SvgIcon name="plus" /> Toevoegen
                  </button>
                </header>

                {pendingReview.length > 0 && (
                  <div className="reviewBar">
                    <span className="reviewIcon"><SvgIcon name="check" /></span>
                    <div>
                      <strong>Kloppen deze abonnementen?</strong>
                      <span>{pendingReview.length} herkend op basis van je betalingen, nog niet bevestigd.</span>
                    </div>
                    <button type="button" className="secondaryButton" onClick={() => pendingReview.forEach((item) => updateStatus(item, 'BEVESTIGD'))}>
                      Alles bevestigen
                    </button>
                  </div>
                )}

                <div className="filterChips" role="tablist" aria-label="Filter op categorie">
                  {[ALL_CATEGORIES, ...categories].map((name) => (
                    <button
                      key={name}
                      type="button"
                      role="tab"
                      aria-selected={category === name}
                      className={category === name ? 'active' : ''}
                      onClick={() => setCategory(name)}
                    >
                      {name}
                    </button>
                  ))}
                </div>

                <div className="subscriptionList">
                  <div className="listHead" aria-hidden="true">
                    <span>Abonnement</span>
                    <span>Status</span>
                    <span>Volgende</span>
                    <span>Per maand</span>
                    <span />
                  </div>
                  {visibleSubscriptions.length === 0 && (
                    <p className="emptyState">
                      {backendStatus === 'loading' ? 'Abonnementen laden…' : 'Geen abonnementen gevonden.'}
                    </p>
                  )}
                  {visibleSubscriptions.map((item) => (
                    <article className={`subRow ${item.status === 'GEANNULEERD' ? 'isCancelled' : ''}`} key={item.id}>
                      <div className="subMain">
                        <span className={`subAvatar tone-${categoryTone(item.category)}`}>{item.name.slice(0, 1)}</span>
                        <div className="subInfo">
                          <strong>{item.name}</strong>
                          <span>{item.category}{item.frequency && item.frequency !== 'Maandelijks' ? ` · ${item.frequency}` : ''}</span>
                        </div>
                      </div>
                      <div className="subStatus">
                        <span
                          className={`statusPill status-${item.status}`}
                          title={item.status === 'HERKEND' ? `${item.confidence}% zeker · ${item.reason}` : undefined}
                        >
                          {STATUS_LABELS[item.status] || item.status}
                        </span>
                      </div>
                      <div className="subDate">{shortDate(item.nextDate)}</div>
                      <div className="subAmount">
                        <strong>{euro(item.amount)}</strong>
                      </div>
                      <div className="subActions">
                        {item.status === 'HERKEND' && (
                          <>
                            <button type="button" className="iconAction confirm" title="Bevestigen" aria-label={`${item.name} bevestigen`} onClick={() => updateStatus(item, 'BEVESTIGD')}>
                              <SvgIcon name="check" />
                            </button>
                            <button type="button" className="iconAction" title="Geen abonnement" aria-label={`${item.name} is geen abonnement`} onClick={() => updateStatus(item, 'GEANNEGEERD')}>
                              <SvgIcon name="close" />
                            </button>
                          </>
                        )}
                        {item.status === 'BEVESTIGD' && (
                          <button type="button" className="iconAction" title="Markeer als opgezegd" aria-label={`${item.name} markeren als opgezegd`} onClick={() => updateStatus(item, 'GEANNULEERD')}>
                            <SvgIcon name="close" />
                          </button>
                        )}
                        {item.status === 'GEANNULEERD' && (
                          <button type="button" className="iconAction" title="Opnieuw activeren" aria-label={`${item.name} opnieuw activeren`} onClick={() => updateStatus(item, 'BEVESTIGD')}>
                            <SvgIcon name="repeat" />
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </section>

                <section className="panel calendarPanel">
                  <header className="panelHeader compact">
                    <h2>Kalender afschrijvingen</h2>
                    <span className="panelMeta">{monthLabel(upcoming[0]?.nextDate)}</span>
                  </header>
                  <ol className="timeline">
                    {upcoming.map((item) => (
                      <li key={`cal-${item.id}`} className={item.nextDate < todayIso() ? 'isPast' : ''}>
                        <span className="dateBlock">
                          <strong>{dayOfMonth(item.nextDate)}</strong>
                          <small>{monthShort(item.nextDate)}</small>
                        </span>
                        <span className="timelineName">{item.name}</span>
                        <strong>{euro(item.amount)}</strong>
                      </li>
                    ))}
                  </ol>
                </section>
            </div>

            <aside className="sideColumn">
              <section className="panel">
                <header className="panelHeader compact">
                  <h2>Per categorie</h2>
                  <span className="panelMeta">{euro(monthlyTotal)} / maand</span>
                </header>
                <div className="categoryBars">
                  {categorySpend.map(([label, amount]) => (
                    <div className="categoryBar" key={label}>
                      <div className="categoryBarLabel">
                        <span><i className={`dot tone-${categoryTone(label)}`} />{label}</span>
                        <strong>{euro(amount)}</strong>
                      </div>
                      <div className="barTrack">
                        <i className={`tone-${categoryTone(label)}`} style={{ width: `${(amount / Math.max(monthlyTotal, 1)) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                  {categorySpend.length === 0 && <p className="emptyState">Nog geen gegevens.</p>}
                </div>
              </section>

              {overlapItems.length >= 2 && (
                <section className="panel insightPanel">
                  <span className="insightTag"><SvgIcon name="spark" /> Besparingstip</span>
                  <h2>{overlapItems.length} abonnementen in {overlap.category}</h2>
                  <p>
                    Je betaalt voor {overlapItems.map((item) => item.name).join(' en ')}. Door er één op te zeggen bespaar je tot{' '}
                    <strong>{euro(overlapSaving * 12)}</strong> per jaar.
                  </p>
                  <button type="button" className="primaryButton" onClick={() => setShowCompare(true)}>Vergelijk abonnementen</button>
                </section>
              )}

              <section className="panel reservePanel">
                <header className="panelHeader compact">
                  <div>
                    <h2>Reserve voor vaste kosten</h2>
                    <p>Zet elke maand automatisch geld opzij.</p>
                  </div>
                  <label className="toggleLabel">
                    <input
                      type="checkbox"
                      checked={reserveEnabled}
                      onChange={(event) => { setReserveEnabled(event.target.checked); syncReserve(event.target.checked, reserveAmount) }}
                    />
                    <span className="toggleTrack" />
                    <span className="srOnly">Reserve actief</span>
                  </label>
                </header>
                <div className={`reserveBody ${reserveEnabled ? '' : 'isDisabled'}`}>
                  <label className="reserveInput">
                    <span>Maandelijks bedrag</span>
                    <div className="inputAffix">
                      <em>€</em>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        disabled={!reserveEnabled}
                        value={reserveAmount ?? ''}
                        onChange={(event) => setReserveAmount(event.target.value)}
                        onBlur={() => syncReserve(reserveEnabled, reserveAmount)}
                      />
                    </div>
                  </label>
                  <div className="coverage">
                    <div className="coverageTop"><span>Dekking vaste kosten</span><strong>{reserveCoverage}%</strong></div>
                    <div className="barTrack"><i className={reserveDifference >= 0 ? 'tone-teal' : 'tone-blue'} style={{ width: `${reserveCoverage}%` }} /></div>
                    <small className={reserveDifference >= 0 ? 'ok' : 'short'}>
                      {!reserveEnabled
                        ? 'Reserve staat uit'
                        : reserveDifference >= 0
                          ? `Volledig gedekt, ${euro(reserveDifference)} buffer`
                          : `Nog ${euro(Math.abs(reserveDifference))} tekort per maand`}
                    </small>
                  </div>
                </div>
              </section>

            </aside>
          </div>

          {showAdd && (
            <div className="modalBackdrop" onMouseDown={(event) => event.target === event.currentTarget && setShowAdd(false)}>
              <form className="modalCard" onSubmit={addSubscription}>
                <button type="button" className="modalClose" aria-label="Sluiten" onClick={() => setShowAdd(false)}>×</button>
                <h2>Abonnement toevoegen</h2>
                <p>Voeg een abonnement toe dat we nog niet herkend hebben.</p>
                <label>Naam<input required value={newSubscription.name} onChange={(event) => setNewSubscription({ ...newSubscription, name: event.target.value })} placeholder="bv. Videoland" /></label>
                <label>Categorie<select value={newSubscription.category} onChange={(event) => setNewSubscription({ ...newSubscription, category: event.target.value })}>{[...new Set([...categories, 'Streaming', 'Muziek', 'Software', 'Sport', 'Andere'])].map((name) => <option key={name}>{name}</option>)}</select></label>
                <div className="formGrid">
                  <label>Bedrag per maand<input required type="number" min="0.01" step="0.01" value={newSubscription.amount} onChange={(event) => setNewSubscription({ ...newSubscription, amount: event.target.value })} /></label>
                  <label>Volgende afschrijving<input required type="date" value={newSubscription.nextDate} onChange={(event) => setNewSubscription({ ...newSubscription, nextDate: event.target.value })} /></label>
                </div>
                <div className="modalActions">
                  <button type="button" className="secondaryButton" onClick={() => setShowAdd(false)}>Annuleren</button>
                  <button className="primaryButton" type="submit">Opslaan</button>
                </div>
              </form>
            </div>
          )}

          {showCompare && (
            <div className="modalBackdrop" onMouseDown={(event) => event.target === event.currentTarget && setShowCompare(false)}>
              <div className="modalCard">
                <button type="button" className="modalClose" aria-label="Sluiten" onClick={() => setShowCompare(false)}>×</button>
                <h2>Vergelijk je {overlap?.category.toLowerCase()}diensten</h2>
                <p>Je betaalt momenteel voor {overlapItems.length} diensten in dezelfde categorie.</p>
                <div className="compareList">
                  {overlapItems.map((item) => (
                    <div className="compareRow" key={item.id}>
                      <span className={`subAvatar tone-${categoryTone(item.category)}`}>{item.name.slice(0, 1)}</span>
                      <div><strong>{item.name}</strong><span>Volgende afschrijving {shortDate(item.nextDate)}</span></div>
                      <div className="compareAmount"><strong>{euro(item.amount)}</strong><span>{euro(item.amount * 12)} / jaar</span></div>
                    </div>
                  ))}
                </div>
                <div className="compareTotal">
                  <span>Samen per maand</span>
                  <strong>{euro(overlapItems.reduce((sum, item) => sum + item.amount, 0))}</strong>
                </div>
                <div className="compareSaving">
                  <SvgIcon name="spark" />
                  <span>Zeg je de goedkoopste op, dan bespaar je <strong>{euro(overlapSaving * 12)}</strong> per jaar.</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function App() {
  const [page, setPage] = useState(getPageFromLocation)

  useEffect(() => {
    const sync = () => setPage(getPageFromLocation())
    window.addEventListener('popstate', sync)
    window.addEventListener('hashchange', sync)
    return () => {
      window.removeEventListener('popstate', sync)
      window.removeEventListener('hashchange', sync)
    }
  }, [])

  if (page === 'subscriptions') {
    return <SubscriptionManagerPage />
  }

  return (
    <div className="shell">
      <div className="appFrame">
        <div className="topBand">
          <KbcHeader />
          <section className="welcome">
            <span>Goeiedag,</span>
            <h1>John Doe</h1>
          </section>
        </div>

        <main className="kbcMain">
          <section className="accountsRail" aria-label="Rekeningen">
            {accounts.map((account) => (
              <article className="accountCard" key={account.id}>
                <div className="accountCardTop">
                  <span className="accountTypeIcon">
                    <SvgIcon name={account.icon} />
                  </span>
                  <button className="editBtn" type="button" aria-label={`${account.label} bewerken`}>
                    <SvgIcon name="edit" />
                  </button>
                </div>
                <div className="accountCardBody">
                  <span className="accountLabel">{account.label}</span>
                  <span className="accountName">{account.name}</span>
                  <strong className="accountBalance">{account.balance}</strong>
                </div>
              </article>
            ))}
          </section>

          <a className="securityBanner" href="#">
            <span className="securityIcon">
              <SvgIcon name="chat" />
            </span>
            <span>Check of je met KBC spreekt.</span>
            <span className="bannerChevron">
              <SvgIcon name="chevron" />
            </span>
          </a>

          <section className="bottomSheet" aria-label="Acties">
            <div className="sheetHandle" />

            <div className="sheetBlock">
              <h2 className="sectionTitle">Snel betalen</h2>
              <div className="quickPayRow">
                {quickPay.map((person) => (
                  <button className="quickPayItem" type="button" key={person.id}>
                    <span className={`quickAvatar ${person.tone}`}>
                      {person.tone === 'icon' ? <SvgIcon name="wallet" /> : person.label}
                    </span>
                    <small>{person.name}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="sheetBlock">
              <h2 className="sectionTitle">Alle acties</h2>
              <div className="primaryActions">
                {primaryActions.map((action) => (
                  <button className="primaryAction" type="button" key={action.id}>
                    <span className={`actionCircle ${action.tone}`}>
                      <SvgIcon name={action.icon} />
                    </span>
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>

              <div className="actionList">
                {menuActions.map((item) => {
                  const content = (
                    <>
                      <span className="listIcon">
                        <SvgIcon name={item.icon} />
                      </span>
                      <span className="listLabel">
                        {item.label}
                        {item.badge ? <em className="newBadge">{item.badge}</em> : null}
                      </span>
                      <span className="listChevron">
                        <SvgIcon name="chevron" />
                      </span>
                    </>
                  )

                  if (item.href) {
                    return (
                      <a
                        className="actionListItem"
                        href={item.href}
                        key={item.id}
                        onClick={(event) => handleInternalNav(event, item.href)}
                      >
                        {content}
                      </a>
                    )
                  }

                  return (
                    <button className="actionListItem" type="button" key={item.id}>
                      {content}
                    </button>
                  )
                })}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default App
