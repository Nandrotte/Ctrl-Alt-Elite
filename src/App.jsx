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

const euro = (amount) => `€ ${amount.toFixed(2).replace('.', ',')}`

function backendDateToUi(date) {
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year}`
}

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
    <svg className="kbcLogo" viewBox="0 0 62 22" role="img" aria-label="KBC">
      <text
        x="0"
        y="18"
        fill="currentColor"
        fontFamily="'Source Sans 3', 'Segoe UI', sans-serif"
        fontWeight="800"
        fontSize="20"
        letterSpacing="-0.6"
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

function SubscriptionManagerPage() {
  const [subscriptions, setSubscriptions] = useState([])
  const [dashboardData, setDashboardData] = useState(null)
  const [backendStatus, setBackendStatus] = useState('loading')
  const [category, setCategory] = useState('Alle categorieën')
  const [reserveEnabled, setReserveEnabled] = useState(false)
  const [reserveAmount, setReserveAmount] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [showCompare, setShowCompare] = useState(false)
  const [newSubscription, setNewSubscription] = useState({ name: '', category: 'Streaming', amount: '9.99', date: '01/11/2026' })

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
          date: backendDateToUi(item.nextDate),
          amount: Number(item.amount),
          confidence: Number(item.confidence) * 100,
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

  const syncReserve = (enabled, amount) => {
    fetch('/api/reserve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled, monthlyTarget: Number(amount) }),
    }).catch(() => setBackendStatus('offline'))
  }

  const visibleSubscriptions = useMemo(() => (
    category === 'Alle categorieën'
      ? subscriptions
      : subscriptions.filter((item) => item.category === category)
  ), [category, subscriptions])
  const total = visibleSubscriptions.reduce((sum, item) => sum + item.amount, 0)
  const categorySpend = useMemo(() => {
    const grouped = visibleSubscriptions.reduce((groups, item) => ({
      ...groups,
      [item.category]: (groups[item.category] || 0) + item.amount,
    }), {})
    return Object.entries(grouped).sort(([, first], [, second]) => second - first)
  }, [visibleSubscriptions])
  const highestCategorySpend = Math.max(...categorySpend.map(([, amount]) => amount), 1)
  const streamingOverlap = dashboardData?.overlaps?.find((item) => item.category === 'Streaming')
  const streaming = streamingOverlap
    ? streamingOverlap.subscriptions.map((name) => subscriptions.find((item) => item.name === name)).filter(Boolean)
    : subscriptions.filter((item) => item.category === 'Streaming')
  const preDebitAlerts = dashboardData?.alerts || []
  const nextSubscription = [...visibleSubscriptions].sort((a, b) => a.date.localeCompare(b.date))[0]

  const addSubscription = (event) => {
    event.preventDefault()
    if (!newSubscription.name.trim() || Number(newSubscription.amount) <= 0) return
    setSubscriptions((current) => [...current, {
      ...newSubscription,
      id: Date.now(),
      name: newSubscription.name.trim(),
      amount: Number(newSubscription.amount),
      confidence: 76,
      color: '#0057b8',
      reason: 'Handmatig toegevoegd voor controle',
    }])
    setNewSubscription({ name: '', category: 'Streaming', amount: '9.99', date: '01/11/2026' })
    setShowAdd(false)
  }

  return (
    <div className="shell">
      <div className="appFrame">
        <KbcHeader />

        <main className="kbcMain subscriptionMain">
          <section className="subscriptionHero">
            <a className="backText" href="/" onClick={(event) => handleInternalNav(event, '/')}>
              <SvgIcon name="chevron" />
              Terug
            </a>
            <h1 className="sectionTitle">Subscriptie Manager</h1>
            <p>Je terugkerende betalingen, automatisch herkend en overzichtelijk bij elkaar.</p>
            <span className="aiStatus"><span /> {backendStatus === 'live' ? 'Backend verbonden' : backendStatus === 'loading' ? 'Backendgegevens laden…' : 'Backend niet bereikbaar'}</span>
          </section>

          <section className="subscriptionMetrics" aria-label="Samenvatting abonnementen">
            <article><span>Vaste kosten per maand</span><strong>{euro(total)}</strong></article>
            <article><span>Volgende afschrijving</span><strong>{nextSubscription ? euro(nextSubscription.amount) : 'Geen'}</strong><small>{nextSubscription?.date || 'Geen abonnementen'}</small></article>
            <article><span>Herkende abonnementen</span><strong>{visibleSubscriptions.length}</strong><small>op basis van betalingen</small></article>
          </section>

          <section className="subscriptionCard upcomingCard">
            <div className="cardTitleRow"><div><span className="eyebrowLabel">OVERZICHT</span><h2>Komende afschrijvingen</h2></div><span className="cardMeta">OKTOBER 2026</span></div>
            {preDebitAlerts.map((alert) => <div className="preDebitNotice" key={`${alert.subscription}-${alert.date}`}><strong>Herinnering: {alert.subscription}</strong><span>{alert.message} {euro(Number(alert.amount))} op {backendDateToUi(alert.date)}.</span></div>)}
            <div className="subscriptionRows">
              {visibleSubscriptions.map((item) => (
                <article className="subscriptionItem" key={item.id}>
                  <span className="subscriptionBadge" style={{ backgroundColor: item.color }}>{item.name.slice(0, 1)}</span>
                  <div className="subscriptionInfo"><strong>{item.name}</strong><span>{item.category} · {item.reason}</span></div>
                  <div className="subscriptionAmount"><strong>{euro(item.amount)}</strong><span>op {item.date}</span></div>
                </article>
              ))}
            </div>
          </section>

          <section className="subscriptionCard spendingCard">
            <div className="cardTitleRow"><div><span className="eyebrowLabel">MAANDELIJKSE IMPACT</span><h2>Waar gaat je geld naartoe?</h2></div><strong className="chartTotal">{euro(total)} <small>per maand</small></strong></div>
            <div className="spendChart" role="img" aria-label="Maandelijkse abonnementskosten per categorie">
              <div className="chartPlot">
                <span className="chartGridLine chartGridTop" />
                <span className="chartGridLine chartGridMiddle" />
                <span className="chartGridLine chartGridBottom" />
                {categorySpend.map(([label, amount]) => (
                  <div className="chartColumn" key={label}>
                    <strong>{euro(amount)}</strong>
                    <i style={{ height: `${Math.max(12, (amount / highestCategorySpend) * 100)}%` }} />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
              <div className="chartLegend">
                {categorySpend.map(([label, amount]) => (
                  <span key={`legend-${label}`}><i />{label}<strong>{Math.round((amount / Math.max(total, 1)) * 100)}%</strong></span>
                ))}
              </div>
            </div>
          </section>

          {streaming.length >= 2 && (
            <section className="overlapNotice">
              <span className="noticeIcon"><SvgIcon name="repeat" /></span>
              <div><span className="eyebrowLabel">KANS OM TE BESPAREN</span><h2>Je hebt {streaming.length} streamingdiensten</h2><p>Netflix en Disney+ zijn allebei herkend in je betalingen. Vergelijk ze voordat je de volgende maand betaalt.</p><button type="button" className="primaryButton" onClick={() => setShowCompare(true)}>Vergelijk abonnementen</button></div>
            </section>
          )}

          <section className="subscriptionCard allSubscriptions">
            <div className="cardTitleRow"><div><span className="eyebrowLabel">HERKENDE BETALINGEN</span><h2>Jouw abonnementen</h2></div><button type="button" className="secondaryButton" onClick={() => setShowAdd(true)}>+ Toevoegen</button></div>
            <div className="managerControls"><label htmlFor="category-filter">Filter</label><select id="category-filter" value={category} onChange={(event) => setCategory(event.target.value)}><option>Alle categorieën</option><option>Streaming</option><option>Muziek</option><option>Software</option><option>Sport</option></select></div>
            <div className="subscriptionTable"><div className="tableHeader"><span>Abonnement</span><span>Categorie</span><span>Bedrag</span><span>Volgende datum</span></div>{visibleSubscriptions.map((item) => <div className="tableRow" key={`table-${item.id}`}><strong>{item.name}</strong><span>{item.category}</span><strong>{euro(item.amount)}</strong><span>{item.date}</span></div>)}</div>
          </section>

          <section className="reservePanel">
            <div><span className="eyebrowLabel">OPTIONEEL</span><h2>Reserveer je vaste bedrag</h2><p>Houd vooraf genoeg ruimte opzij voor je maandelijkse abonnementen.</p></div>
            <div className="reserveControls"><label className="toggleLabel"><input type="checkbox" checked={reserveEnabled} onChange={(event) => { setReserveEnabled(event.target.checked); syncReserve(event.target.checked, reserveAmount) }} /><span className="toggleTrack" /> Reserve actief</label><label className="reserveInput"><span>Maandelijks doel</span><input type="number" min="0" step="0.01" value={reserveAmount ?? ''} onChange={(event) => setReserveAmount(Number(event.target.value))} onBlur={() => syncReserve(reserveEnabled, reserveAmount)} /></label><strong>{reserveEnabled && reserveAmount !== null ? euro(reserveAmount - total) : 'Uitgeschakeld'} <small>beschikbaar</small></strong></div>
          </section>

          {showAdd && <div className="modalBackdrop" onMouseDown={(event) => event.target === event.currentTarget && setShowAdd(false)}><form className="modalCard" onSubmit={addSubscription}><button type="button" className="modalClose" onClick={() => setShowAdd(false)}>×</button><span className="eyebrowLabel">NIEUWE HERKENNING</span><h2>Abonnement toevoegen</h2><p>Voeg een voorstel toe dat je later aan transacties kunt koppelen.</p><label>Naam<input required value={newSubscription.name} onChange={(event) => setNewSubscription({ ...newSubscription, name: event.target.value })} placeholder="bv. Videoland" /></label><label>Categorie<select value={newSubscription.category} onChange={(event) => setNewSubscription({ ...newSubscription, category: event.target.value })}><option>Streaming</option><option>Muziek</option><option>Software</option><option>Sport</option></select></label><div className="formGrid"><label>Bedrag<input required type="number" min="0.01" step="0.01" value={newSubscription.amount} onChange={(event) => setNewSubscription({ ...newSubscription, amount: event.target.value })} /></label><label>Volgende datum<input type="text" value={newSubscription.date} onChange={(event) => setNewSubscription({ ...newSubscription, date: event.target.value })} /></label></div><button className="primaryButton" type="submit">Opslaan</button></form></div>}
          {showCompare && <div className="modalBackdrop" onMouseDown={(event) => event.target === event.currentTarget && setShowCompare(false)}><div className="modalCard"><button type="button" className="modalClose" onClick={() => setShowCompare(false)}>×</button><span className="eyebrowLabel">STREAMING</span><h2>Vergelijk je abonnementen</h2>{streaming.map((item) => <div className="compareRow" key={item.id}><strong>{item.name}</strong><span>{euro(item.amount)} per maand</span></div>)}<div className="compareTotal"><span>Samen per maand</span><strong>{euro(streaming.reduce((sum, item) => sum + item.amount, 0))}</strong></div></div></div>}
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
        <KbcHeader />

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
