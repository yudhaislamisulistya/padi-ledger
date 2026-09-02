import { useEffect, useMemo, useState } from 'react'
import modelIllustration from './assets/model-ctgt.png'
import { parseCsv } from './csv.js'
import './App.css'

const navItems = [
  { id: 'overview', label: 'Ringkasan', icon: 'ri-dashboard-2-line' },
  { id: 'traceability', label: 'Telusur Batch', icon: 'ri-route-line' },
  { id: 'model', label: 'Kinerja CTGT', icon: 'ri-brain-line' },
  { id: 'ledger', label: 'Audit Ledger', icon: 'ri-shield-check-line' },
  { id: 'about', label: 'Tentang Model', icon: 'ri-information-line' },
]

const nextEventMetrics = [
  { label: 'Top-3 Accuracy', ctgt: 0.971, baseline: 0.926 },
  { label: 'MRR', ctgt: 0.842, baseline: 0.78 },
  { label: 'Accuracy', ctgt: 0.724, baseline: 0.635 },
  { label: 'F1-Macro', ctgt: 0.708, baseline: 0.587 },
]

const anomalyMetrics = [
  { label: 'CTGT terbaik', value: 0.791 },
  { label: 'Logistic Regression', value: 0.801 },
  { label: 'Gradient Boosting', value: 0.806 },
]

const auditMetrics = [
  ['Keunikan transaction hash', 1],
  ['Kecocokan event blockchain', 1],
  ['Keberhasilan pencatatan on-chain', 1],
  ['Transaksi terverifikasi', 1],
  ['Cakupan traceability batch', 1],
]

const processStages = [
  ['Panen', 'ri-seedling-line'],
  ['Penimbangan', 'ri-scales-3-line'],
  ['Pengeringan', 'ri-sun-line'],
  ['Penyimpanan', 'ri-archive-line'],
  ['Penggilingan', 'ri-settings-3-line'],
  ['Distribusi', 'ri-truck-line'],
]

const formatInteger = new Intl.NumberFormat('id-ID')
const formatDecimal = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 })
const formatDate = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
})

function formatTimestamp(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : formatDate.format(date)
}

function titleCase(value = '') {
  return value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function shortHash(value = '') {
  return value.length > 20 ? `${value.slice(0, 10)}…${value.slice(-8)}` : value
}

function statusTone(status = '') {
  if (['success', 'verified', 'premium', 'low'].includes(status)) return 'success'
  if (['warning', 'pending', 'medium'].includes(status)) return 'warning'
  if (['failed', 'delayed', 'substandard', 'high'].includes(status)) return 'danger'
  return 'neutral'
}

function StatusBadge({ value }) {
  return <span className={`status-badge ${statusTone(value)}`}>{titleCase(value)}</span>
}

function PageHeader({ eyebrow, title, description, children }) {
  return (
    <div className="page-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children && <div className="heading-actions">{children}</div>}
    </div>
  )
}

function StatCard({ icon, label, value, detail, tone = 'green' }) {
  return (
    <article className="card stat-card">
      <div className={`stat-icon ${tone}`}><i className={icon} /></div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </article>
  )
}

function Overview({ setPage }) {
  return (
    <>
      <PageHeader
        eyebrow="Dashboard penelitian"
        title="Kendali pascapanen yang dapat diprediksi dan diaudit"
        description="Ringkasan eksperimen CTGT dan lapisan audit smart contract pada dataset sintetis pascapanen padi Indonesia."
      >
        <button className="primary-button" onClick={() => setPage('traceability')}>
          <i className="ri-qr-scan-2-line" /> Telusuri batch
        </button>
      </PageHeader>

      <div className="notice-banner" role="note">
        <i className="ri-flask-line" />
        <div><strong>Mode demonstrasi penelitian</strong><span>Data sintetis terkontrol · hasil bukan monitoring produksi secara real-time</span></div>
      </div>

      <section className="stats-grid" aria-label="Ringkasan dataset">
        <StatCard icon="ri-share-forward-box-line" label="Event proses" value="8.752" detail="14,59 event per batch" />
        <StatCard icon="ri-stack-line" label="Batch padi" value="600" detail="513 jalur proses unik" tone="gold" />
        <StatCard icon="ri-pulse-line" label="Log sensor" value="28.843" detail="43,50% pelanggaran ambang" tone="blue" />
        <StatCard icon="ri-links-line" label="Record blockchain" value="4.768" detail="Auditabilitas 1,0000" tone="dark" />
      </section>

      <div className="dashboard-grid">
        <section className="card panel process-panel">
          <div className="panel-header">
            <div><span className="eyebrow">Representasi proses</span><h2>Directed temporal graph</h2></div>
            <span className="status-badge success"><span className="pulse-dot" /> 759 node aktif</span>
          </div>
          <div className="process-flow">
            {processStages.map(([label, icon], index) => (
              <div className="flow-group" key={label}>
                <div className="flow-node"><i className={icon} /><span>{label}</span></div>
                {index < processStages.length - 1 && <i className="ri-arrow-right-line flow-arrow" />}
              </div>
            ))}
          </div>
          <div className="panel-footnote"><i className="ri-information-line" /> Urutan aktual dapat memuat quality check, re-drying, reprocessing, dan blockchain anchor.</div>
        </section>

        <section className="card panel status-panel">
          <div className="panel-header"><div><span className="eyebrow">Kesehatan proses</span><h2>Status event</h2></div></div>
          <div className="donut-layout">
            <div className="donut" aria-label="68,97 persen event berhasil"><div><strong>69,0%</strong><span>berhasil</span></div></div>
            <ul className="legend-list">
              <li><span className="legend-dot success" /><span>Success</span><strong>6.036</strong></li>
              <li><span className="legend-dot warning" /><span>Warning</span><strong>1.728</strong></li>
              <li><span className="legend-dot delayed" /><span>Delayed</span><strong>793</strong></li>
              <li><span className="legend-dot failed" /><span>Failed</span><strong>195</strong></li>
            </ul>
          </div>
        </section>
      </div>

      <div className="dashboard-grid lower-grid">
        <section className="card panel performance-panel">
          <div className="panel-header">
            <div><span className="eyebrow">Hasil terbaik</span><h2>Next-event prediction</h2></div>
            <button className="text-button" onClick={() => setPage('model')}>Detail eksperimen <i className="ri-arrow-right-line" /></button>
          </div>
          <div className="metric-hero">
            <div><strong>0,971</strong><span>Top-3 Accuracy</span></div>
            <div className="spark-bars" aria-hidden="true">{[44, 58, 51, 72, 64, 85, 78, 96].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div>
          </div>
          <div className="mini-metrics">
            <div><span>MRR</span><strong>0,842</strong></div>
            <div><span>Accuracy</span><strong>0,724</strong></div>
            <div><span>F1-Macro</span><strong>0,708</strong></div>
          </div>
        </section>

        <section className="card panel audit-panel">
          <div className="audit-seal"><i className="ri-shield-check-line" /></div>
          <span className="eyebrow">Smart contract auditability</span>
          <h2>Seluruh pengujian lulus</h2>
          <p>Keunikan hash, kecocokan event, verifikasi, penolakan duplikasi, dan integritas payload tervalidasi pada 4.768 record.</p>
          <button className="secondary-button" onClick={() => setPage('ledger')}>Lihat audit ledger</button>
        </section>
      </div>
    </>
  )
}

function Traceability({ researchData, loading, error }) {
  const [query, setQuery] = useState('BATCH-2025-0001')
  const [selectedId, setSelectedId] = useState('BATCH-2025-0001')
  const [message, setMessage] = useState('')

  const selected = researchData.outcomes.find((item) => item.batch_id === selectedId)
  const events = useMemo(
    () => researchData.events.filter((item) => item.batch_id === selectedId).sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
    [researchData.events, selectedId],
  )
  const transactions = useMemo(
    () => researchData.blockchain.filter((item) => item.batch_id === selectedId).sort((a, b) => a.tx_time.localeCompare(b.tx_time)),
    [researchData.blockchain, selectedId],
  )

  function submitSearch(event) {
    event.preventDefault()
    const normalized = query.trim().toUpperCase()
    if (!researchData.outcomes.some((item) => item.batch_id === normalized)) {
      setMessage(`Batch “${normalized || '-'}” tidak ditemukan pada 600 outcome penelitian.`)
      return
    }
    setSelectedId(normalized)
    setQuery(normalized)
    setMessage('')
  }

  return (
    <>
      <PageHeader eyebrow="Traceability explorer" title="Telusuri perjalanan satu batch" description="Cari ID batch untuk melihat outcome, urutan event proses, dan bukti transaksi yang tercatat pada simulasi blockchain." />
      <section className="card search-card">
        <form onSubmit={submitSearch} className="batch-search">
          <i className="ri-search-line" />
          <label htmlFor="batch-id" className="sr-only">ID batch</label>
          <input id="batch-id" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Contoh: BATCH-2025-0001" autoComplete="off" />
          <button type="submit" disabled={loading}>Telusuri</button>
        </form>
        <div className="search-hints"><span>Coba cepat:</span>{['BATCH-2025-0001', 'BATCH-2025-0005', 'BATCH-2025-0100'].map((id) => <button key={id} onClick={() => { setQuery(id); setSelectedId(id); setMessage('') }}>{id}</button>)}</div>
      </section>

      {loading && <div className="state-card"><i className="ri-loader-4-line spin" /><strong>Memuat artefak penelitian…</strong></div>}
      {error && <div className="state-card error"><i className="ri-error-warning-line" /><strong>{error}</strong></div>}
      {message && <div className="state-card error" role="alert"><i className="ri-search-eye-line" /><strong>{message}</strong></div>}

      {!loading && !error && selected && (
        <>
          <section className="batch-summary">
            <div className="batch-title">
              <span className="eyebrow">Batch terpilih</span>
              <h2>{selected.batch_id}</h2>
              <span className="data-provenance"><i className="ri-database-2-line" /> batch_outcomes.csv</span>
            </div>
            <div className="summary-item"><span>Mutu akhir</span><StatusBadge value={selected.final_quality_grade} /></div>
            <div className="summary-item"><span>Risk level</span><StatusBadge value={selected.risk_level} /></div>
            <div className="summary-item"><span>Yield</span><strong>{formatDecimal.format(Number(selected.yield_percent))}%</strong></div>
            <div className="summary-item"><span>Kadar air akhir</span><strong>{formatDecimal.format(Number(selected.final_moisture_content))}%</strong></div>
            <div className="summary-item"><span>Traceability</span><StatusBadge value={selected.traceability_complete_flag === '1' ? 'verified' : 'pending'} /></div>
          </section>

          <div className="trace-grid">
            <section className="card panel timeline-panel">
              <div className="panel-header"><div><span className="eyebrow">Riwayat proses</span><h2>{events.length} event terurut waktu</h2></div><span className="data-provenance">edges_events.csv</span></div>
              <div className="timeline">
                {events.map((item) => (
                  <article className="timeline-item" key={item.event_id}>
                    <div className={`timeline-marker ${statusTone(item.process_status)}`}><i className={item.event_type === 'blockchain_anchor' ? 'ri-links-line' : 'ri-checkbox-blank-circle-fill'} /></div>
                    <div className="timeline-content">
                      <div><strong>{titleCase(item.event_type)}</strong><StatusBadge value={item.process_status} /></div>
                      <p>{item.source_node_id} <i className="ri-arrow-right-line" /> {item.target_node_id}</p>
                      <small>{formatTimestamp(item.timestamp)} · durasi {formatInteger.format(Number(item.duration_min))} menit</small>
                    </div>
                    {(item.anomaly_flag === '1' || item.delay_flag === '1') && <div className="event-flags">{item.anomaly_flag === '1' && <span>Anomali</span>}{item.delay_flag === '1' && <span>Terlambat</span>}</div>}
                  </article>
                ))}
              </div>
            </section>

            <aside className="trace-side">
              <section className="card panel compact-panel">
                <div className="panel-header"><div><span className="eyebrow">Outcome</span><h2>Ringkasan akhir</h2></div></div>
                <dl className="detail-list">
                  <div><dt>Waktu proses</dt><dd>{formatDecimal.format(Number(selected.total_processing_time_hr))} jam</dd></div>
                  <div><dt>Kehilangan hasil</dt><dd>{formatDecimal.format(Number(selected.total_loss_kg))} kg</dd></div>
                  <div><dt>Broken rice</dt><dd>{formatDecimal.format(Number(selected.broken_rice_percent))}%</dd></div>
                  <div><dt>Kontaminasi</dt><dd>{selected.contamination_flag === '1' ? 'Terdeteksi' : 'Tidak terdeteksi'}</dd></div>
                  <div><dt>Outcome tercatat</dt><dd>{formatTimestamp(selected.outcome_timestamp)}</dd></div>
                </dl>
              </section>
              <section className="card panel compact-panel">
                <div className="panel-header"><div><span className="eyebrow">Ledger evidence</span><h2>{transactions.length} transaksi</h2></div><span className="data-provenance">blockchain_logs.csv</span></div>
                <div className="tx-list">
                  {transactions.length ? transactions.map((item) => (
                    <div className="tx-item" key={item.tx_id}>
                      <i className="ri-links-line" />
                      <div><strong>{item.smart_contract_event}</strong><code title={item.tx_hash}>{shortHash(item.tx_hash)}</code><small>Block #{item.block_number}</small></div>
                      <StatusBadge value={item.verification_status} />
                    </div>
                  )) : <p className="empty-note">Belum ada transaksi blockchain untuk batch ini.</p>}
                </div>
              </section>
            </aside>
          </div>
        </>
      )}
    </>
  )
}

function MetricBar({ label, value, comparison, tone = 'primary' }) {
  return (
    <div className="metric-bar-row">
      <div><span>{label}</span><strong>{value.toFixed(3).replace('.', ',')}</strong></div>
      <div className="metric-track"><i className={tone} style={{ width: `${value * 100}%` }} />{comparison != null && <i className="baseline" style={{ width: `${comparison * 100}%` }} />}</div>
    </div>
  )
}

function ModelPerformance() {
  return (
    <>
      <PageHeader eyebrow="Evaluasi model" title="Kinerja prediktif CTGT" description="Perbandingan leakage-aware pada pemisahan data kronologis. Nilai ditampilkan sesuai hasil eksperimen penelitian." />
      <div className="model-callout">
        <div><span>Konfigurasi CTGT terbaik</span><strong>no_graph_relation</strong></div>
        <p>Encoding temporal dan fitur causal-sensor memberi sinyal lebih kuat; relasi graf aditif saat ini berpotensi menambah redundansi atau noise.</p>
      </div>
      <div className="dashboard-grid model-grid">
        <section className="card panel">
          <div className="panel-header"><div><span className="eyebrow">Tugas 01</span><h2>Next-event prediction</h2></div><span className="status-badge success">CTGT unggul</span></div>
          <p className="panel-description">CTGT terbaik dibandingkan baseline Markov. Garis tipis menunjukkan hasil baseline.</p>
          <div className="metric-bars">
            {nextEventMetrics.map((metric) => <MetricBar key={metric.label} label={metric.label} value={metric.ctgt} comparison={metric.baseline} />)}
          </div>
          <div className="chart-legend"><span><i className="solid" />CTGT terbaik</span><span><i className="line" />Markov baseline</span></div>
        </section>
        <section className="card panel">
          <div className="panel-header"><div><span className="eyebrow">Tugas 02</span><h2>Event anomaly detection</h2></div><span className="status-badge warning">Kompetitif</span></div>
          <p className="panel-description">ROC-AUC CTGT kompetitif, tetapi Gradient Boosting tetap tertinggi dengan selisih 0,015.</p>
          <div className="horizontal-comparison">
            {anomalyMetrics.map((metric, index) => (
              <div key={metric.label}><span>{metric.label}</span><div><i style={{ width: `${metric.value * 100}%` }} className={index === 2 ? 'best' : ''} /></div><strong>{metric.value.toFixed(3).replace('.', ',')}</strong></div>
            ))}
          </div>
          <div className="insight-box"><i className="ri-lightbulb-flash-line" /><p>CTGT lebih selaras dengan kecerdasan urutan proses, sedangkan classifier konvensional masih efektif menangkap sinyal anomali tabular.</p></div>
        </section>
      </div>
      <section className="card panel ablation-table">
        <div className="panel-header"><div><span className="eyebrow">Ablation study</span><h2>Kontribusi komponen CTGT</h2></div></div>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Eksperimen</th><th>Top-3 Acc</th><th>MRR</th><th>Accuracy</th><th>F1-Macro</th><th>ROC-AUC anomali</th></tr></thead>
            <tbody>
              <tr><td><strong>full_ctgt</strong></td><td>0,969</td><td>0,823</td><td>0,702</td><td>0,676</td><td>0,716</td></tr>
              <tr><td>no_temporal_encoding</td><td>0,963</td><td>0,820</td><td>0,686</td><td>0,667</td><td>0,703</td></tr>
              <tr className="best-row"><td><strong>no_graph_relation</strong><span>Best</span></td><td><strong>0,971</strong></td><td><strong>0,842</strong></td><td><strong>0,724</strong></td><td><strong>0,708</strong></td><td><strong>0,791</strong></td></tr>
              <tr><td>no_causal_sensor_features</td><td>0,966</td><td>0,832</td><td>0,708</td><td>0,702</td><td>0,679</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

function LedgerAudit({ researchData, loading }) {
  const verified = researchData.blockchain.filter((item) => item.verification_status === 'verified').length
  const latest = [...researchData.blockchain].sort((a, b) => b.tx_time.localeCompare(a.tx_time)).slice(0, 8)
  return (
    <>
      <PageHeader eyebrow="Smart contract layer" title="Audit ledger dan integritas event" description="Blockchain berfungsi sebagai lapisan audit terpisah dari model prediksi CTGT. Hasil di bawah berasal dari simulasi terkontrol." >
        <a className="secondary-button" href="/data/blockchain_auditability_metrics.csv" download><i className="ri-download-2-line" /> Unduh metrik</a>
      </PageHeader>
      <section className="ledger-hero card">
        <div className="ledger-icon"><i className="ri-shield-check-line" /></div>
        <div><span className="eyebrow">Audit test status</span><h2>Passed</h2><p>Semua assertion logika dan metrik auditabilitas memenuhi nilai yang diharapkan.</p></div>
        <div className="ledger-count"><strong>4.768</strong><span>reference log rows</span></div>
      </section>
      <div className="dashboard-grid ledger-grid">
        <section className="card panel">
          <div className="panel-header"><div><span className="eyebrow">Auditability score</span><h2>Lima metrik tervalidasi</h2></div><span className="status-badge success">5 / 5 lulus</span></div>
          <div className="audit-bars">
            {auditMetrics.map(([label, value]) => <MetricBar key={label} label={label} value={value} />)}
          </div>
        </section>
        <section className="card panel logic-checks">
          <div className="panel-header"><div><span className="eyebrow">Logic assertions</span><h2>Kontrol integritas</h2></div></div>
          <ul>
            <li><i className="ri-checkbox-circle-fill" /><div><strong>Duplicate event rejected</strong><span>Event identik tidak dapat dicatat ulang.</span></div></li>
            <li><i className="ri-checkbox-circle-fill" /><div><strong>Event hash verification passed</strong><span>Hash tersimpan cocok dengan payload asli.</span></div></li>
            <li><i className="ri-checkbox-circle-fill" /><div><strong>Modified payload changes hash</strong><span>Perubahan data menghasilkan fingerprint baru.</span></div></li>
          </ul>
          <div className="hash-flow"><span>Event payload</span><i className="ri-arrow-right-line" /><span>SHA-256</span><i className="ri-arrow-right-line" /><span>Ledger record</span></div>
        </section>
      </div>
      <section className="card panel transaction-table">
        <div className="panel-header"><div><span className="eyebrow">Ledger snapshot</span><h2>Transaksi terbaru dalam dataset</h2></div><span className="data-provenance">{loading ? 'Memuat…' : `${formatInteger.format(verified)} berstatus verified`}</span></div>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Transaction ID</th><th>Batch</th><th>Smart contract event</th><th>Transaction hash</th><th>Block</th><th>Status</th></tr></thead>
            <tbody>{latest.map((item) => <tr key={item.tx_id}><td><strong>{item.tx_id}</strong></td><td>{item.batch_id}</td><td>{item.smart_contract_event}</td><td><code title={item.tx_hash}>{shortHash(item.tx_hash)}</code></td><td>#{item.block_number}</td><td><StatusBadge value={item.verification_status} /></td></tr>)}</tbody>
          </table>
        </div>
      </section>
    </>
  )
}

function AboutModel() {
  return (
    <>
      <PageHeader eyebrow="Causal Temporal Graph Transformer" title="Tentang Padi Ledger" description="Antarmuka demonstrasi untuk penelitian traceability pascapanen padi berbasis CTGT dan smart contract." />
      <div className="about-grid">
        <section className="card product-card">
          <div className="product-visual"><img src={modelIllustration} alt="Ilustrasi arsitektur model CTGT dan smart contract untuk proses pascapanen padi" /></div>
          <div className="product-copy"><span className="eyebrow">Model penelitian</span><h2>Prediksi proses, deteksi anomali, dan auditabilitas</h2><p>CTGT mempelajari urutan event, konteks waktu, relasi entitas, serta kondisi sensor untuk mendukung prediksi next-event dan deteksi anomali. Smart contract mencatat hash event sebagai bukti integritas dan traceability.</p></div>
        </section>
        <section className="card panel architecture-card">
          <span className="eyebrow">Arsitektur ringkas</span>
          <div className="architecture-flow">
            <div><i className="ri-database-2-line" /><strong>Input</strong><span>Event · waktu · graf · sensor</span></div>
            <i className="ri-arrow-down-line" />
            <div className="highlight"><i className="ri-brain-line" /><strong>CTGT Encoder</strong><span>Temporal attention + feature gate</span></div>
            <i className="ri-arrow-down-line" />
            <div className="split-output"><span><i className="ri-route-line" />Next-event</span><span><i className="ri-alarm-warning-line" />Anomali</span></div>
            <div className="audit-layer"><i className="ri-links-line" /><span>Smart contract audit layer</span></div>
          </div>
        </section>
      </div>
      <div className="dashboard-grid about-details">
        <section className="card panel"><div className="panel-header"><div><span className="eyebrow">Tujuan</span><h2>Nilai operasional</h2></div></div><ul className="feature-list"><li><i className="ri-calendar-check-line" /><span><strong>Antisipasi proses berikutnya</strong>Mendukung penjadwalan dan penanganan pengecualian.</span></li><li><i className="ri-temp-cold-line" /><span><strong>Respons terhadap anomali</strong>Menandai kondisi sensor dan proses yang memerlukan inspeksi.</span></li><li><i className="ri-file-search-line" /><span><strong>Verifikasi lintas aktor</strong>Menyediakan histori event yang konsisten untuk audit.</span></li></ul></section>
        <section className="card panel"><div className="panel-header"><div><span className="eyebrow">Batasan studi</span><h2>Konteks penggunaan</h2></div></div><ul className="limitation-list"><li>Dataset masih bersifat sintetis dan memerlukan validasi lapangan.</li><li>Encoding relasi graf belum selalu meningkatkan kinerja model.</li><li>Blockchain diuji melalui simulasi Python, belum pada testnet.</li><li>Dashboard ini menyajikan artefak penelitian, bukan sistem produksi live.</li></ul></section>
      </div>
    </>
  )
}

function App() {
  const [page, setPage] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [researchData, setResearchData] = useState({ outcomes: [], events: [], blockchain: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([
      fetch('/data/batch_outcomes.csv').then((response) => response.ok ? response.text() : Promise.reject(new Error('Outcome batch tidak tersedia.'))),
      fetch('/data/edges_events.csv').then((response) => response.ok ? response.text() : Promise.reject(new Error('Event proses tidak tersedia.'))),
      fetch('/data/blockchain_logs.csv').then((response) => response.ok ? response.text() : Promise.reject(new Error('Log blockchain tidak tersedia.'))),
    ])
      .then(([outcomes, events, blockchain]) => {
        if (active) setResearchData({ outcomes: parseCsv(outcomes), events: parseCsv(events), blockchain: parseCsv(blockchain) })
      })
      .catch((reason) => { if (active) setError(`Gagal memuat data penelitian: ${reason.message}`) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  function navigate(target) {
    setPage(target)
    setSidebarOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="brand"><span className="brand-mark"><i className="ri-seedling-line" /></span><span><strong>Padi Ledger</strong><small>CTGT Traceability</small></span></div>
        <nav aria-label="Navigasi utama">
          <span className="nav-label">Menu penelitian</span>
          {navItems.map((item) => <button key={item.id} className={page === item.id ? 'active' : ''} onClick={() => navigate(item.id)}><i className={item.icon} /><span>{item.label}</span>{page === item.id && <i className="ri-arrow-right-s-line nav-arrow" />}</button>)}
        </nav>
        <div className="sidebar-card"><i className="ri-database-check-line" /><strong>Dataset siap</strong><span>600 batch · 2025</span><small>Synthetic research data</small></div>
        <div className="sidebar-footer"><span>Research prototype</span><strong>v1.0.0</strong></div>
      </aside>
      {sidebarOpen && <button className="sidebar-backdrop" aria-label="Tutup menu" onClick={() => setSidebarOpen(false)} />}

      <div className="main-shell">
        <header className="topbar">
          <button className="menu-button" onClick={() => setSidebarOpen((open) => !open)} aria-label="Buka menu"><i className="ri-menu-2-line" /></button>
          <div className="breadcrumb"><span>Padi Ledger</span><i className="ri-arrow-right-s-line" /><strong>{navItems.find((item) => item.id === page)?.label}</strong></div>
          <div className="topbar-right"><div className="system-status"><span /><div><strong>Sistem tersedia</strong><small>Port 7113</small></div></div><div className="research-avatar">PL</div></div>
        </header>
        <main>
          {page === 'overview' && <Overview setPage={navigate} />}
          {page === 'traceability' && <Traceability researchData={researchData} loading={loading} error={error} />}
          {page === 'model' && <ModelPerformance />}
          {page === 'ledger' && <LedgerAudit researchData={researchData} loading={loading} />}
          {page === 'about' && <AboutModel />}
        </main>
        <footer><span>© 2026 Padi Ledger · Research Prototype</span><span>CTGT + Smart Contract Auditability</span></footer>
      </div>
    </div>
  )
}

export default App
