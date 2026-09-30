import { useEffect, useState } from 'react'

const accounts = [
  { name: 'Zichtrekening', iban: 'BE•• 1234 5678 9012', balance: '€ 12.480,32', change: '+€ 320,40' },
  { name: 'Spaarrekening', iban: 'BE•• 2234 5678 9012', balance: '€ 58.120,11', change: '+€ 1.120,00' },
  { name: 'Beleggingsportefeuille', iban: 'BE•• 3234 5678 9012', balance: '€ 24.860,50', change: '+2,8%' },
]

const transactions = [
  { title: 'SEPA overschrijving naar J. Peeters', time: 'Vandaag · 09:41', amount: '-€ 240,00', status: 'Verwerkt' },
  { title: 'Loonstorting werkgever', time: 'Gisteren · 17:12', amount: '+€ 3.250,00', status: 'Binnen' },
  { title: 'QR-betaling supermarkt', time: 'Gisteren · 13:05', amount: '-€ 42,18', status: 'Voltooid' },
  { title: 'Rentebijschrijving spaarrekening', time: 'Ma  · 08:00', amount: '+€ 18,24', status: 'Automatisch' },
]

const shortcuts = [
  'Subscriptie Manager',
  'Directe overschrijving',
  'QR-code betalen',
  'Nieuwe overschrijving',
  'Kaart blokkeren',
]

const weeklySpending = [
  { day: 'Ma', value: 42 },
  { day: 'Di', value: 58 },
  { day: 'Wo', value: 34 },
  { day: 'Do', value: 71 },
  { day: 'Vr', value: 89 },
  { day: 'Za', value: 63 },
  { day: 'Zo', value: 28 },
]

const alerts = [
  'Document ter ondertekening: hypothecair bijvoegsel',
  'Nieuwe veilige melding in Kate',
  'Afsprakenslot beschikbaar bij KBC Live',
]

function Icon({ children }) {
  return <span className="icon">{children}</span>
}

function EmptyDashboardPage({ onBack }) {
  return (
    <div className="shell">
      <header className="topbar">
        <div className="brandWrap">
          <div className="logoMark">KBC</div>
          <div>
            <div className="brandTitle">Subscriptie Manager</div>
            <div className="brandSub">Dashboard-pagina</div>
          </div>
        </div>

        <div className="topActions singleAction">
          <button className="secondaryButton" type="button" onClick={onBack}>
            Terug naar overzicht
          </button>
        </div>
      </header>

      <main className="emptyPage">
        <div className="emptyState panel">
          <p className="eyebrow">Subscriptie Manager</p>
          <h1>Lege pagina</h1>
          <p>Hier kan later de nieuwe Subscriptie Manager-flow of feature worden toegevoegd.</p>
        </div>
      </main>
    </div>
  )
}

function App() {
  const [page, setPage] = useState(() => (window.location.hash === '#dashboard' ? 'dashboard' : 'home'))

  useEffect(() => {
    const onHashChange = () => {
      setPage(window.location.hash === '#dashboard' ? 'dashboard' : 'home')
    }

    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  if (page === 'dashboard') {
    return <EmptyDashboardPage onBack={() => { window.location.hash = '' }} />
  }

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brandWrap">
          <div className="logoMark">KBC</div>
          <div>
            <div className="brandTitle">KBC Touch</div>
            <div className="brandSub">Persoonlijk digitaal bankieren</div>
          </div>
        </div>

        <nav className="primaryTabs" aria-label="Primaire navigatie">
          {['Betalen', 'Sparen & Beleggen', 'Lenen', 'Verzekeren'].map((tab, index) => (
            <a key={tab} className={index === 0 ? 'tab active' : 'tab'} href="#">
              {tab}
            </a>
          ))}
        </nav>

        <div className="topActions">
          <label className="searchBar" aria-label="Zoeken">
            <span>⌕</span>
            <input placeholder="Zoek transacties, documenten of rekeningen" />
          </label>
          <button className="ghostButton" type="button">
            <Icon>🔔</Icon>
            <span className="badgeDot" />
          </button>
          <button className="profileButton" type="button">
            <span className="avatar">MA</span>
            <span className="profileText">
              <strong>Maria</strong>
              <small>Privé</small>
            </span>
          </button>
        </div>
      </header>

      <main className="dashboard">
        <section className="heroGrid">
          <article className="balanceCard panel accent">
            <div className="panelHeader">
              <div>
                <p className="eyebrow">Hoofdoverzicht</p>
                <h1>Goedemiddag, Maria</h1>
              </div>
              <div className="timeChip">Realtime synchronisatie</div>
            </div>

            <div className="bigBalance">
              <span>Totaal beschikbaar vermogen</span>
              <strong>€ 95.460,93</strong>
              <p>Inclusief zicht-, spaar- en beleggingsrekeningen</p>
            </div>

            <div className="summaryPills">
              <div>
                <span>Inkomend</span>
                <strong>+€ 4.588,64</strong>
              </div>
              <div>
                <span>Uitgaand</span>
                <strong>-€ 1.204,18</strong>
              </div>
              <div>
                <span>Valuta</span>
                <strong>EUR</strong>
              </div>
            </div>
          </article>

          <article className="quickActions panel">
            <div className="panelHeader compact">
              <div>
                <p className="eyebrow">Snelle acties</p>
                <h2>Handelingen in 1 klik</h2>
              </div>
            </div>
            <div className="actionGrid">
              {shortcuts.map((item) => (
                <a
                  key={item}
                  className="actionCard"
                  href={item === 'Subscriptie Manager' ? '#dashboard' : '#'}
                >
                  <span className="actionIcon">↗</span>
                  <span>{item}</span>
                </a>
              ))}
            </div>
          </article>

          <article className="panel analyticsPanel">
            <div className="panelHeader compact">
              <div>
                <p className="eyebrow">Uitgavenanalyse</p>
                <h2>Weekoverzicht</h2>
              </div>
              <button className="textButton" type="button">Details</button>
            </div>

            <div className="chartWrap" aria-label="Wekelijkse uitgaven grafiek">
              {weeklySpending.map((item) => (
                <div className="chartBarGroup" key={item.day}>
                  <div className="chartValue">{item.value}%</div>
                  <div className="chartTrack">
                    <div className="chartFill" style={{ height: `${item.value}%` }} />
                  </div>
                  <span>{item.day}</span>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="contentGrid">
          <div className="mainColumn">
            <article className="panel accountsPanel">
              <div className="panelHeader">
                <div>
                  <p className="eyebrow">Rekeningoverzicht</p>
                  <h2>Rekeningen en portfolio</h2>
                </div>
                <button className="textButton" type="button">Alles bekijken</button>
              </div>

              <div className="accountsList">
                {accounts.map((account) => (
                  <div className="accountRow" key={account.name}>
                    <div className="accountMeta">
                      <div className="accountIcon">●</div>
                      <div>
                        <strong>{account.name}</strong>
                        <p>{account.iban}</p>
                      </div>
                    </div>
                    <div className="accountValue">
                      <strong>{account.balance}</strong>
                      <span>{account.change}</span>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="panel transactionsPanel">
              <div className="panelHeader">
                <div>
                  <p className="eyebrow">Recente transacties</p>
                  <h2>Laatste bewegingen</h2>
                </div>
                <div className="statusLegend">
                  <span className="statusDot green" /> Verwerkt
                  <span className="statusDot blue" /> In afwachting
                </div>
              </div>

              <div className="transactionList">
                {transactions.map((tx) => (
                  <div className="transactionRow" key={tx.title}>
                    <div>
                      <strong>{tx.title}</strong>
                      <p>{tx.time}</p>
                    </div>
                    <div className="transactionRight">
                      <strong>{tx.amount}</strong>
                      <span>{tx.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <aside className="sideColumn">
            <article className="panel assistantPanel">
              <div className="panelHeader compact">
                <div>
                  <p className="eyebrow">Kate</p>
                  <h2>Digitale assistent</h2>
                </div>
                <div className="kateBubble">AI</div>
              </div>
              <p className="assistantText">
                Kate signaleert facturen, helpt bij betalingen en beantwoordt vragen over je saldo.
              </p>
              <button className="primaryButton" type="button">Start gesprek</button>
            </article>

            <article className="panel tasksPanel">
              <div className="panelHeader compact">
                <div>
                  <p className="eyebrow">Acties</p>
                  <h2>Ondertekenen & goedkeuren</h2>
                </div>
              </div>
              <ul className="alertList">
                {alerts.map((item) => (
                  <li key={item}>
                    <span className="checkMark">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="panel contactPanel">
              <div className="panelHeader compact">
                <div>
                  <p className="eyebrow">Contact</p>
                  <h2>Kantoor / KBC Live</h2>
                </div>
              </div>
              <div className="contactActions">
                <button className="secondaryButton" type="button">Bel KBC Live</button>
                <button className="secondaryButton" type="button">Maak afspraak</button>
              </div>
            </article>
          </aside>
        </section>
      </main>

      <button className="assistantFab" type="button" aria-label="Open Kate assistent">
        ✦
      </button>
    </div>
  )
}

export default App
