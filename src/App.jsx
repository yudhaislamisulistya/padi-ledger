import { useEffect, useMemo, useState } from 'react'
import coverPattern from '../templates/images/cover-pattern.png'
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

const processStages = [
  ['Panen', 'ri-seedling-line'],
  ['Penimbangan', 'ri-scales-3-line'],
  ['Pengeringan', 'ri-sun-line'],
  ['Penyimpanan', 'ri-archive-line'],
  ['Penggilingan', 'ri-settings-3-line'],
  ['Distribusi', 'ri-truck-line'],
]

const auditMetrics = [
  'Keunikan transaction hash',
  'Kecocokan event blockchain',
  'Keberhasilan pencatatan on-chain',
  'Transaksi terverifikasi',
  'Cakupan traceability batch',
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

function tone(value = '') {
  if (['success', 'verified', 'premium', 'low'].includes(value)) return 'success'
  if (['warning', 'pending', 'medium'].includes(value)) return 'warning'
  if (['failed', 'delayed', 'substandard', 'high'].includes(value)) return 'danger'
  return 'secondary'
}

function StatusBadge({ value }) {
  const color = tone(value)
  return <span className={`badge bg-${color}-subtle text-${color}`}>{titleCase(value)}</span>
}

function PageHeader({ title, description, action }) {
  return (
    <div className="row mb-3 pb-1">
      <div className="col-12">
        <div className="d-flex align-items-lg-center flex-lg-row flex-column gap-3">
          <div className="flex-grow-1">
            <h4 className="fs-18 mb-1">{title}</h4>
            <p className="text-muted mb-0">{description}</p>
          </div>
          {action && <div className="mt-3 mt-lg-0">{action}</div>}
        </div>
      </div>
    </div>
  )
}

function CardHeader({ icon, title, subtitle, action }) {
  return (
    <div className="card-header align-items-center d-flex">
      <div className="flex-grow-1">
        <h4 className="card-title mb-0">{icon && <i className={`${icon} text-success me-2`} />}{title}</h4>
        {subtitle && <p className="text-muted mb-0 mt-1 fs-12">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}

function StatCard({ icon, label, value, detail, color }) {
  return (
    <div className="col-xl-3 col-md-6">
      <div className="card card-animate h-100">
        <div className="card-body">
          <div className="d-flex align-items-center">
            <div className="flex-grow-1 overflow-hidden">
              <p className="text-uppercase fw-medium text-muted text-truncate mb-0">{label}</p>
            </div>
            <div className="flex-shrink-0"><span className={`badge bg-${color}-subtle text-${color}`}>Dataset</span></div>
          </div>
          <div className="d-flex align-items-end justify-content-between mt-4">
            <div>
              <h4 className="fs-22 fw-semibold ff-secondary mb-2">{value}</h4>
              <span className="text-muted fs-12">{detail}</span>
            </div>
            <div className="avatar-sm flex-shrink-0">
              <span className={`avatar-title bg-${color}-subtle rounded fs-3`}><i className={`${icon} text-${color}`} /></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Overview({ navigate }) {
  return (
    <>
      <PageHeader
        title="Selamat datang di Padi Ledger"
        description="Dashboard eksperimen CTGT dan auditabilitas smart contract untuk traceability pascapanen padi."
        action={<button className="btn btn-success" onClick={() => navigate('traceability')}><i className="ri-qr-scan-2-line align-bottom me-1" /> Telusuri Batch</button>}
      />

      <div className="alert alert-warning border-0 material-shadow" role="alert">
        <div className="d-flex align-items-center">
          <i className="ri-flask-line fs-20 me-3" />
          <div><strong>Mode demonstrasi penelitian.</strong> <span className="text-muted">Data sintetis terkontrol; hasil bukan monitoring produksi secara real-time.</span></div>
        </div>
      </div>

      <div className="row g-3 mb-1">
        <StatCard icon="ri-share-forward-box-line" label="Event Proses" value="8.752" detail="14,59 event per batch" color="success" />
        <StatCard icon="ri-stack-line" label="Batch Padi" value="600" detail="513 jalur proses unik" color="primary" />
        <StatCard icon="ri-pulse-line" label="Log Sensor" value="28.843" detail="43,50% pelanggaran ambang" color="info" />
        <StatCard icon="ri-links-line" label="Record Blockchain" value="4.768" detail="Auditabilitas 1,0000" color="warning" />
      </div>

      <div className="row">
        <div className="col-xl-8">
          <div className="card card-height-100">
            <CardHeader icon="ri-git-merge-line" title="Directed Temporal Graph" subtitle="Representasi alur pascapanen sebagai event terurut waktu" action={<span className="badge bg-success-subtle text-success"><i className="ri-checkbox-circle-line me-1" />759 node aktif</span>} />
            <div className="card-body">
              <div className="template-process-flow">
                {processStages.map(([label, icon], index) => (
                  <div className="process-group" key={label}>
                    <div className="process-step"><span className="avatar-sm"><span className="avatar-title bg-success-subtle text-success rounded-circle fs-20"><i className={icon} /></span></span><strong>{label}</strong></div>
                    {index < processStages.length - 1 && <i className="ri-arrow-right-line text-muted process-arrow" />}
                  </div>
                ))}
              </div>
              <div className="alert alert-info border-0 mb-0 mt-3 py-2 fs-12"><i className="ri-information-line me-1" /> Urutan aktual dapat memuat quality check, re-drying, reprocessing, dan blockchain anchor.</div>
            </div>
          </div>
        </div>
        <div className="col-xl-4">
          <div className="card card-height-100">
            <CardHeader icon="ri-pie-chart-line" title="Status Event" subtitle="Distribusi 8.752 event proses" />
            <div className="card-body">
              <div className="template-donut-layout">
                <div className="template-donut"><div><strong>69,0%</strong><span>berhasil</span></div></div>
                <div className="status-legend">
                  {[['Success', '6.036', 'success'], ['Warning', '1.728', 'warning'], ['Delayed', '793', 'info'], ['Failed', '195', 'danger']].map(([label, value, color]) => (
                    <div key={label}><span><i className={`bg-${color}`} />{label}</span><strong>{value}</strong></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-xl-8">
          <div className="card">
            <CardHeader title="Performa Next-Event Prediction" subtitle="Konfigurasi terbaik: no_graph_relation" action={<button className="btn btn-soft-success btn-sm" onClick={() => navigate('model')}>Detail eksperimen <i className="ri-arrow-right-line align-bottom" /></button>} />
            <div className="card-header p-0 border-0 bg-light-subtle">
              <div className="row g-0 text-center">
                {[['Top-3 Accuracy', '0,971'], ['MRR', '0,842'], ['Accuracy', '0,724'], ['F1-Macro', '0,708']].map(([label, value]) => (
                  <div className="col-6 col-sm-3" key={label}><div className="p-3 border border-dashed border-start-0"><h5 className="mb-1 text-success">{value}</h5><p className="text-muted mb-0 fs-12">{label}</p></div></div>
                ))}
              </div>
            </div>
            <div className="card-body">
              <div className="performance-chart" aria-label="Perbandingan CTGT terbaik dengan Markov baseline">
                {nextEventMetrics.map((metric) => (
                  <div className="performance-column" key={metric.label}><div><i className="ctgt" style={{ height: `${metric.ctgt * 100}%` }} /><i className="baseline" style={{ height: `${metric.baseline * 100}%` }} /></div><span>{metric.label}</span></div>
                ))}
              </div>
              <div className="chart-key"><span><i className="bg-success" />CTGT terbaik</span><span><i className="bg-primary" />Markov baseline</span></div>
            </div>
          </div>
        </div>
        <div className="col-xl-4">
          <div className="card featured-audit overflow-hidden">
            <img src={coverPattern} className="featured-pattern" alt="" />
            <div className="card-body position-relative">
              <div className="avatar-md mb-4"><span className="avatar-title bg-white bg-opacity-10 text-white rounded fs-2"><i className="ri-shield-check-line" /></span></div>
              <span className="badge bg-warning-subtle text-warning mb-3">SMART CONTRACT AUDITABILITY</span>
              <h4 className="text-white">Seluruh pengujian lulus</h4>
              <p className="text-white-50">Keunikan hash, kecocokan event, verifikasi, penolakan duplikasi, dan integritas payload tervalidasi pada 4.768 record.</p>
              <button className="btn btn-light" onClick={() => navigate('ledger')}>Lihat Audit Ledger</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function Traceability({ researchData, loading, error }) {
  const [query, setQuery] = useState('BATCH-2025-0001')
  const [selectedId, setSelectedId] = useState('BATCH-2025-0001')
  const [message, setMessage] = useState('')
  const selected = researchData.outcomes.find((item) => item.batch_id === selectedId)
  const events = useMemo(() => researchData.events.filter((item) => item.batch_id === selectedId).sort((a, b) => a.timestamp.localeCompare(b.timestamp)), [researchData.events, selectedId])
  const transactions = useMemo(() => researchData.blockchain.filter((item) => item.batch_id === selectedId).sort((a, b) => a.tx_time.localeCompare(b.tx_time)), [researchData.blockchain, selectedId])

  function selectBatch(id) {
    setQuery(id)
    setSelectedId(id)
    setMessage('')
  }

  function submitSearch(event) {
    event.preventDefault()
    const normalized = query.trim().toUpperCase()
    if (!researchData.outcomes.some((item) => item.batch_id === normalized)) {
      setMessage(`Batch “${normalized || '-'}” tidak ditemukan pada 600 outcome penelitian.`)
      return
    }
    selectBatch(normalized)
  }

  return (
    <>
      <PageHeader title="Traceability Explorer" description="Telusuri outcome, urutan event proses, dan bukti transaksi berdasarkan ID batch." />
      <div className="card">
        <div className="card-body">
          <form onSubmit={submitSearch}>
            <label className="form-label" htmlFor="batch-id">ID Batch</label>
            <div className="input-group">
              <span className="input-group-text"><i className="ri-search-line" /></span>
              <input id="batch-id" className="form-control" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Contoh: BATCH-2025-0001" autoComplete="off" />
              <button className="btn btn-success" type="submit" disabled={loading}>Telusuri</button>
            </div>
          </form>
          <div className="d-flex flex-wrap align-items-center gap-2 mt-3"><span className="text-muted fs-12">Coba cepat:</span>{['BATCH-2025-0001', 'BATCH-2025-0005', 'BATCH-2025-0100'].map((id) => <button className="btn btn-soft-secondary btn-sm" key={id} onClick={() => selectBatch(id)}>{id}</button>)}</div>
        </div>
      </div>

      {loading && <div className="alert alert-info"><i className="ri-loader-4-line spin me-2" />Memuat artefak penelitian…</div>}
      {error && <div className="alert alert-danger"><i className="ri-error-warning-line me-2" />{error}</div>}
      {message && <div className="alert alert-danger" role="alert"><i className="ri-search-eye-line me-2" />{message}</div>}

      {!loading && !error && selected && (
        <>
          <div className="card batch-overview-card">
            <div className="card-body">
              <div className="row align-items-center g-3">
                <div className="col-xl-3 col-md-6"><span className="text-uppercase text-muted fs-11">Batch terpilih</span><h5 className="mb-1 mt-1">{selected.batch_id}</h5><code className="fs-11">batch_outcomes.csv</code></div>
                <div className="col"><span className="text-muted fs-12 d-block mb-2">Mutu akhir</span><StatusBadge value={selected.final_quality_grade} /></div>
                <div className="col"><span className="text-muted fs-12 d-block mb-2">Risk level</span><StatusBadge value={selected.risk_level} /></div>
                <div className="col"><span className="text-muted fs-12 d-block mb-1">Yield</span><strong>{formatDecimal.format(Number(selected.yield_percent))}%</strong></div>
                <div className="col"><span className="text-muted fs-12 d-block mb-1">Kadar air</span><strong>{formatDecimal.format(Number(selected.final_moisture_content))}%</strong></div>
                <div className="col"><span className="text-muted fs-12 d-block mb-2">Traceability</span><StatusBadge value={selected.traceability_complete_flag === '1' ? 'verified' : 'pending'} /></div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-xl-8">
              <div className="card">
                <CardHeader title={`${events.length} Event Terurut Waktu`} subtitle="Riwayat proses dari edges_events.csv" />
                <div className="card-body">
                  <div className="activity-feed">
                    {events.map((item) => (
                      <article className="activity-item" key={item.event_id}>
                        <div className={`activity-icon bg-${tone(item.process_status)}-subtle text-${tone(item.process_status)}`}><i className={item.event_type === 'blockchain_anchor' ? 'ri-links-line' : 'ri-checkbox-blank-circle-fill'} /></div>
                        <div className="activity-content">
                          <div className="d-flex flex-wrap align-items-center gap-2"><h6 className="mb-0">{titleCase(item.event_type)}</h6><StatusBadge value={item.process_status} />{item.anomaly_flag === '1' && <span className="badge bg-danger-subtle text-danger">Anomali</span>}{item.delay_flag === '1' && <span className="badge bg-warning-subtle text-warning">Terlambat</span>}</div>
                          <p className="text-muted mb-1 mt-1"><code>{item.source_node_id}</code> <i className="ri-arrow-right-line mx-1" /> <code>{item.target_node_id}</code></p>
                          <small className="text-muted">{formatTimestamp(item.timestamp)} · durasi {formatInteger.format(Number(item.duration_min))} menit</small>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-4">
              <div className="card">
                <CardHeader title="Ringkasan Outcome" />
                <div className="card-body">
                  <div className="table-responsive"><table className="table table-borderless table-sm align-middle mb-0"><tbody>
                    {[['Waktu proses', `${formatDecimal.format(Number(selected.total_processing_time_hr))} jam`], ['Kehilangan hasil', `${formatDecimal.format(Number(selected.total_loss_kg))} kg`], ['Broken rice', `${formatDecimal.format(Number(selected.broken_rice_percent))}%`], ['Kontaminasi', selected.contamination_flag === '1' ? 'Terdeteksi' : 'Tidak terdeteksi'], ['Outcome tercatat', formatTimestamp(selected.outcome_timestamp)]].map(([label, value]) => <tr key={label}><td className="text-muted">{label}</td><td className="text-end fw-medium">{value}</td></tr>)}
                  </tbody></table></div>
                </div>
              </div>
              <div className="card">
                <CardHeader title={`${transactions.length} Transaksi Ledger`} subtitle="Bukti dari blockchain_logs.csv" />
                <div className="card-body p-0">
                  <div className="list-group list-group-flush ledger-list">
                    {transactions.length ? transactions.map((item) => (
                      <div className="list-group-item" key={item.tx_id}>
                        <div className="d-flex align-items-start gap-2">
                          <div className="avatar-xs flex-shrink-0"><span className="avatar-title bg-success-subtle text-success rounded"><i className="ri-links-line" /></span></div>
                          <div className="flex-grow-1 overflow-hidden"><h6 className="mb-1 fs-13">{item.smart_contract_event}</h6><code className="d-block text-truncate" title={item.tx_hash}>{shortHash(item.tx_hash)}</code><small className="text-muted">Block #{item.block_number}</small></div>
                          <StatusBadge value={item.verification_status} />
                        </div>
                      </div>
                    )) : <p className="text-muted p-3 mb-0">Belum ada transaksi blockchain untuk batch ini.</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

function MetricProgress({ label, value, baseline }) {
  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between mb-2"><span className="text-muted">{label}</span><strong>{value.toFixed(3).replace('.', ',')}</strong></div>
      <div className="progress metric-progress"><div className="progress-bar bg-success" style={{ width: `${value * 100}%` }} /><span className="baseline-marker" style={{ left: `${baseline * 100}%` }} /></div>
    </div>
  )
}

function ModelPerformance() {
  return (
    <>
      <PageHeader title="Kinerja Prediktif CTGT" description="Evaluasi leakage-aware dengan pemisahan data kronologis dan baseline pembanding." />
      <div className="card bg-primary text-white overflow-hidden model-banner">
        <img src={coverPattern} className="featured-pattern" alt="" />
        <div className="card-body position-relative d-lg-flex align-items-center gap-4">
          <div className="flex-shrink-0"><span className="text-white-50 text-uppercase fs-11">Konfigurasi terbaik</span><h4 className="text-white ff-secondary mb-0 mt-1">no_graph_relation</h4></div>
          <div className="vr bg-white opacity-25 d-none d-lg-block" />
          <p className="text-white-75 mb-0">Encoding temporal dan fitur causal-sensor memberi sinyal lebih kuat; relasi graf aditif saat ini berpotensi menambah redundansi atau noise.</p>
        </div>
      </div>
      <div className="row">
        <div className="col-xl-6">
          <div className="card card-height-100">
            <CardHeader icon="ri-route-line" title="Next-Event Prediction" subtitle="CTGT terbaik dibandingkan baseline Markov" action={<span className="badge bg-success-subtle text-success">CTGT unggul</span>} />
            <div className="card-body">
              {nextEventMetrics.map((metric) => <MetricProgress key={metric.label} label={metric.label} value={metric.ctgt} baseline={metric.baseline} />)}
              <div className="alert alert-success border-0 mb-0 fs-12"><i className="ri-checkbox-circle-line me-1" /> Garis penanda menunjukkan hasil baseline Markov.</div>
            </div>
          </div>
        </div>
        <div className="col-xl-6">
          <div className="card card-height-100">
            <CardHeader icon="ri-alarm-warning-line" title="Event Anomaly Detection" subtitle="Perbandingan ROC-AUC" action={<span className="badge bg-warning-subtle text-warning">Kompetitif</span>} />
            <div className="card-body">
              {anomalyMetrics.map((metric, index) => <div className="mb-4" key={metric.label}><div className="d-flex justify-content-between mb-2"><span className="text-muted">{metric.label}</span><strong>{metric.value.toFixed(3).replace('.', ',')}</strong></div><div className="progress progress-sm"><div className={`progress-bar ${index === 2 ? 'bg-primary' : 'bg-info'}`} style={{ width: `${metric.value * 100}%` }} /></div></div>)}
              <div className="alert alert-warning border-0 mb-0 fs-12"><i className="ri-lightbulb-flash-line me-1" /> Gradient Boosting tertinggi dengan selisih ROC-AUC 0,015 dari CTGT terbaik.</div>
            </div>
          </div>
        </div>
      </div>
      <div className="card">
        <CardHeader title="Ablation Study" subtitle="Kontribusi temporal encoding, graph relation, dan causal-sensor features" />
        <div className="card-body p-0">
          <div className="table-responsive table-card"><table className="table table-hover table-centered align-middle table-nowrap mb-0"><thead className="text-muted table-light"><tr><th>Eksperimen</th><th>Top-3 Acc</th><th>MRR</th><th>Accuracy</th><th>F1-Macro</th><th>ROC-AUC Anomali</th></tr></thead><tbody>
            <tr><td><strong>full_ctgt</strong></td><td>0,969</td><td>0,823</td><td>0,702</td><td>0,676</td><td>0,716</td></tr>
            <tr><td>no_temporal_encoding</td><td>0,963</td><td>0,820</td><td>0,686</td><td>0,667</td><td>0,703</td></tr>
            <tr className="table-success"><td><strong>no_graph_relation</strong> <span className="badge bg-success ms-2">Best</span></td><td><strong>0,971</strong></td><td><strong>0,842</strong></td><td><strong>0,724</strong></td><td><strong>0,708</strong></td><td><strong>0,791</strong></td></tr>
            <tr><td>no_causal_sensor_features</td><td>0,966</td><td>0,832</td><td>0,708</td><td>0,702</td><td>0,679</td></tr>
          </tbody></table></div>
        </div>
      </div>
    </>
  )
}

function LedgerAudit({ researchData, loading }) {
  const verified = researchData.blockchain.filter((item) => item.verification_status === 'verified').length
  const latest = [...researchData.blockchain].sort((a, b) => b.tx_time.localeCompare(a.tx_time)).slice(0, 8)
  return (
    <>
      <PageHeader title="Audit Ledger dan Integritas Event" description="Blockchain berfungsi sebagai lapisan audit terpisah dari model prediksi CTGT." action={<a className="btn btn-soft-success" href="/data/blockchain_auditability_metrics.csv" download><i className="ri-download-2-line align-bottom me-1" />Unduh Metrik</a>} />
      <div className="row">
        <div className="col-xl-4">
          <div className="card bg-success text-white card-height-100 overflow-hidden audit-status-card">
            <img src={coverPattern} className="featured-pattern" alt="" />
            <div className="card-body position-relative">
              <div className="avatar-lg mb-4"><span className="avatar-title bg-white bg-opacity-10 rounded-circle fs-1"><i className="ri-shield-check-line" /></span></div>
              <p className="text-uppercase text-white-50 mb-1">Audit test status</p><h2 className="text-white mb-3">Passed</h2>
              <p className="text-white-75">Semua assertion logika dan metrik auditabilitas memenuhi nilai yang diharapkan.</p>
              <h3 className="text-white mb-0 mt-4">4.768 <small className="fs-12 text-white-50">reference log rows</small></h3>
            </div>
          </div>
        </div>
        <div className="col-xl-8">
          <div className="card card-height-100">
            <CardHeader title="Auditability Score" subtitle="Lima metrik tervalidasi" action={<span className="badge bg-success-subtle text-success">5 / 5 Lulus</span>} />
            <div className="card-body">
              {auditMetrics.map((label) => <div className="mb-3" key={label}><div className="d-flex justify-content-between mb-1"><span className="text-muted fs-12">{label}</span><strong className="text-success">1,000</strong></div><div className="progress progress-sm"><div className="progress-bar bg-success" style={{ width: '100%' }} /></div></div>)}
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-xl-4">
          <div className="card">
            <CardHeader title="Kontrol Integritas" subtitle="Logic assertions" />
            <div className="card-body">
              {[['Duplicate event rejected', 'Event identik tidak dapat dicatat ulang.'], ['Event hash verification passed', 'Hash tersimpan cocok dengan payload asli.'], ['Modified payload changes hash', 'Perubahan data menghasilkan fingerprint baru.']].map(([title, text]) => <div className="d-flex mb-4" key={title}><div className="flex-shrink-0"><i className="ri-checkbox-circle-fill text-success fs-20" /></div><div className="flex-grow-1 ms-3"><h6 className="mb-1">{title}</h6><p className="text-muted mb-0 fs-12">{text}</p></div></div>)}
              <div className="alert alert-light border mb-0 text-center fs-12"><code>Event payload</code> <i className="ri-arrow-right-line mx-1" /> <code>SHA-256</code> <i className="ri-arrow-right-line mx-1" /> <code>Ledger</code></div>
            </div>
          </div>
        </div>
        <div className="col-xl-8">
          <div className="card">
            <CardHeader title="Transaksi Terbaru" subtitle="Snapshot blockchain_logs.csv" action={<span className="text-muted fs-12">{loading ? 'Memuat…' : `${formatInteger.format(verified)} verified`}</span>} />
            <div className="card-body p-0">
              <div className="table-responsive table-card"><table className="table table-hover table-centered align-middle table-nowrap mb-0"><thead className="table-light text-muted"><tr><th>Transaction</th><th>Batch</th><th>Contract Event</th><th>Hash</th><th>Status</th></tr></thead><tbody>{latest.map((item) => <tr key={item.tx_id}><td><strong>{item.tx_id}</strong><small className="d-block text-muted">Block #{item.block_number}</small></td><td>{item.batch_id}</td><td>{item.smart_contract_event}</td><td><code title={item.tx_hash}>{shortHash(item.tx_hash)}</code></td><td><StatusBadge value={item.verification_status} /></td></tr>)}</tbody></table></div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function AboutModel() {
  return (
    <>
      <PageHeader title="Tentang Padi Ledger" description="Antarmuka demonstrasi penelitian Causal Temporal Graph Transformer dengan smart contract auditability." />
      <div className="row">
        <div className="col-xl-8">
          <div className="card overflow-hidden">
            <div className="row g-0">
              <div className="col-md-5 model-visual"><img src={modelIllustration} alt="Arsitektur CTGT dan smart contract untuk proses pascapanen padi" /></div>
              <div className="col-md-7"><div className="card-body h-100 d-flex flex-column justify-content-center p-4 p-xl-5"><span className="badge bg-success-subtle text-success align-self-start mb-3">MODEL PENELITIAN</span><h3 className="mb-3">Prediksi proses, deteksi anomali, dan auditabilitas</h3><p className="text-muted mb-0">CTGT mempelajari urutan event, konteks waktu, relasi entitas, serta kondisi sensor untuk mendukung prediksi next-event dan deteksi anomali. Smart contract mencatat hash event sebagai bukti integritas dan traceability.</p></div></div>
            </div>
          </div>
        </div>
        <div className="col-xl-4">
          <div className="card">
            <CardHeader title="Arsitektur Ringkas" />
            <div className="card-body architecture-stack">
              <div className="architecture-node"><i className="ri-database-2-line text-primary" /><strong>Input Data</strong><small>Event · waktu · graf · sensor</small></div><i className="ri-arrow-down-line" />
              <div className="architecture-node active"><i className="ri-brain-line" /><strong>CTGT Encoder</strong><small>Temporal attention + feature gate</small></div><i className="ri-arrow-down-line" />
              <div className="row g-2"><div className="col"><div className="architecture-node compact"><i className="ri-route-line text-success" /><strong>Next-event</strong></div></div><div className="col"><div className="architecture-node compact"><i className="ri-alarm-warning-line text-danger" /><strong>Anomali</strong></div></div></div>
              <div className="alert alert-warning text-center mb-0 mt-3"><i className="ri-links-line me-1" />Smart contract audit layer</div>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-xl-6">
          <div className="card card-height-100"><CardHeader title="Nilai Operasional" /><div className="card-body">{[['ri-calendar-check-line', 'Antisipasi proses berikutnya', 'Mendukung penjadwalan dan penanganan pengecualian.'], ['ri-temp-cold-line', 'Respons terhadap anomali', 'Menandai kondisi sensor dan proses yang memerlukan inspeksi.'], ['ri-file-search-line', 'Verifikasi lintas aktor', 'Menyediakan histori event yang konsisten untuk audit.']].map(([icon, title, text]) => <div className="d-flex mb-4" key={title}><div className="avatar-sm flex-shrink-0"><span className="avatar-title bg-success-subtle text-success rounded"><i className={`${icon} fs-20`} /></span></div><div className="ms-3"><h6 className="mb-1">{title}</h6><p className="text-muted mb-0 fs-12">{text}</p></div></div>)}</div></div>
        </div>
        <div className="col-xl-6">
          <div className="card card-height-100"><CardHeader title="Batasan Studi" /><div className="card-body"><ol className="list-group list-group-numbered list-group-flush">{['Dataset masih sintetis dan memerlukan validasi lapangan.', 'Encoding relasi graf belum selalu meningkatkan kinerja model.', 'Blockchain diuji melalui simulasi Python, belum pada testnet.', 'Dashboard menyajikan artefak penelitian, bukan sistem produksi live.'].map((item) => <li className="list-group-item border-0 px-0 text-muted" key={item}>{item}</li>)}</ol></div></div>
        </div>
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
    document.body.classList.toggle('vertical-sidebar-enable', sidebarOpen)
    return () => document.body.classList.remove('vertical-sidebar-enable')
  }, [sidebarOpen])

  useEffect(() => {
    let active = true
    Promise.all([
      fetch('/data/batch_outcomes.csv').then((response) => response.ok ? response.text() : Promise.reject(new Error('Outcome batch tidak tersedia.'))),
      fetch('/data/edges_events.csv').then((response) => response.ok ? response.text() : Promise.reject(new Error('Event proses tidak tersedia.'))),
      fetch('/data/blockchain_logs.csv').then((response) => response.ok ? response.text() : Promise.reject(new Error('Log blockchain tidak tersedia.'))),
    ]).then(([outcomes, events, blockchain]) => {
      if (active) setResearchData({ outcomes: parseCsv(outcomes), events: parseCsv(events), blockchain: parseCsv(blockchain) })
    }).catch((reason) => {
      if (active) setError(`Gagal memuat data penelitian: ${reason.message}`)
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [])

  function navigate(target) {
    setPage(target)
    setSidebarOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const activeLabel = navItems.find((item) => item.id === page)?.label

  return (
    <div id="layout-wrapper">
      <header id="page-topbar">
        <div className="layout-width"><div className="navbar-header">
          <div className="d-flex align-items-center">
            <div className="navbar-brand-box horizontal-logo"><button className="logo logo-dark border-0 bg-transparent" onClick={() => navigate('overview')}><span className="logo-sm"><i className="ri-seedling-line" /></span><span className="logo-lg">Padi Ledger</span></button></div>
            <button type="button" className="btn btn-sm px-3 fs-16 header-item vertical-menu-btn topnav-hamburger material-shadow-none" onClick={() => setSidebarOpen((open) => !open)} aria-label="Buka menu"><span className={`hamburger-icon ${sidebarOpen ? 'open' : ''}`}><span /><span /><span /></span></button>
            <button className="app-search d-none d-md-block border-0 bg-transparent" onClick={() => navigate('traceability')}><span className="position-relative d-block"><span className="form-control top-search-control">Cari ID batch…</span><span className="mdi mdi-magnify search-widget-icon" /></span></button>
          </div>
          <div className="d-flex align-items-center">
            <button className="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle" onClick={() => navigate('ledger')} title="Status audit"><i className="bx bx-shield-quarter fs-22" /><span className="position-absolute topbar-badge fs-10 translate-middle badge rounded-pill bg-success">5</span></button>
            <div className="ms-1 header-item"><button className="btn material-shadow-none p-0" onClick={() => navigate('about')}><span className="d-flex align-items-center"><span className="avatar-sm"><span className="avatar-title bg-success-subtle text-success rounded-circle fw-semibold">PL</span></span><span className="text-start ms-xl-2 d-none d-xl-block"><span className="d-block fw-medium user-name-text">Padi Ledger</span><span className="d-block fs-12 text-muted user-name-sub-text">Research Prototype</span></span></span></button></div>
          </div>
        </div></div>
      </header>

      <aside className="app-menu navbar-menu">
        <div className="navbar-brand-box"><button className="logo logo-light border-0 bg-transparent" onClick={() => navigate('overview')}><span className="logo-sm"><i className="ri-seedling-line" /></span><span className="logo-lg"><i className="ri-seedling-line me-2" />Padi Ledger</span></button></div>
        <div id="scrollbar"><div className="container-fluid"><ul className="navbar-nav" id="navbar-nav">
          <li className="menu-title"><span>Menu Penelitian</span></li>
          {navItems.map((item) => <li className="nav-item" key={item.id}><button className={`nav-link menu-link w-100 border-0 ${page === item.id ? 'active' : ''}`} onClick={() => navigate(item.id)}><i className={item.icon} /><span>{item.label}</span>{page === item.id && <span className="badge bg-success ms-auto">Aktif</span>}</button></li>)}
        </ul></div></div>
        <div className="sidebar-research-card">
          <img src={coverPattern} alt="" />
          <div className="position-relative"><div className="avatar-sm mx-auto mb-3"><span className="avatar-title bg-success rounded-circle"><i className="ri-database-check-line fs-20" /></span></div><h6 className="text-white mb-1">Dataset siap</h6><p className="text-white-50 fs-12 mb-2">600 batch · 8.752 event</p><span className="badge bg-success-subtle text-success">Synthetic 2025</span></div>
        </div>
      </aside>
      <div className="vertical-overlay" onClick={() => setSidebarOpen(false)} />

      <div className="main-content">
        <div className="page-content"><div className="container-fluid">
          <div className="page-title-box d-sm-flex align-items-center justify-content-between bg-transparent mb-3"><h4 className="mb-sm-0">{activeLabel}</h4><ol className="breadcrumb m-0"><li className="breadcrumb-item">Padi Ledger</li><li className="breadcrumb-item active">{activeLabel}</li></ol></div>
          {page === 'overview' && <Overview navigate={navigate} />}
          {page === 'traceability' && <Traceability researchData={researchData} loading={loading} error={error} />}
          {page === 'model' && <ModelPerformance />}
          {page === 'ledger' && <LedgerAudit researchData={researchData} loading={loading} />}
          {page === 'about' && <AboutModel />}
        </div></div>
        <footer className="footer"><div className="container-fluid"><div className="row"><div className="col-sm-6">2026 © Padi Ledger.</div><div className="col-sm-6"><div className="text-sm-end d-none d-sm-block">CTGT + Smart Contract Auditability</div></div></div></div></footer>
      </div>
    </div>
  )
}

export default App
