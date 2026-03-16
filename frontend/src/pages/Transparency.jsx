import { useState, useEffect } from 'react'
import axios from 'axios'
import styles from './Transparency.module.css'

const TABS = ['All','image','video','receipt']

export default function Transparency() {
  const [proofs, setProofs] = useState([])
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/api/transparency').then(r => setProofs(r.data)).finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'All' ? proofs : proofs.filter(p => p.file_type === filter)
  const icons = { image:'🖼️', video:'🎥', receipt:'📄' }

  return (
    <div>
      <div className="page-hdr">
        <h1>🔍 Transparency Wall</h1>
        <p>Every rupee tracked — real proofs from NGOs across India</p>
      </div>
      <div className="section">
        <div className="container">
          <div className={styles.tabs}>
            {TABS.map(t => (
              <button key={t} className={`${styles.tab} ${filter===t ? styles.tabActive:''}`} onClick={() => setFilter(t)}>
                {t === 'All' ? 'All Proofs' : t === 'image' ? '🖼️ Photos' : t === 'video' ? '🎥 Videos' : '📄 Receipts'}
              </button>
            ))}
          </div>

          {loading ? <div className="loading-wrap"><div className="spinner" /></div> :
           filtered.length === 0 ? (
            <div className="empty"><span className="empty-icon">📷</span><h3>No proofs uploaded yet</h3><p>NGOs will upload proofs as donations are used</p></div>
           ) : (
            <div className={styles.grid}>
              {filtered.map(p => (
                <div key={p.id} className={styles.card}>
                  <div className={styles.cardTop}>
                    <span className={styles.typeIcon}>{icons[p.file_type] || '📁'}</span>
                    <span className={`badge ${p.file_type==='image'?'badge-green':p.file_type==='video'?'badge-blue':'badge-earth'}`}>{p.file_type}</span>
                  </div>

                  {/* ── MEDIA PREVIEW ── */}
                  <div className={styles.mediaPreview}>
                    {p.file_type === 'image' && (
                      <img
                        src={`/api/uploads/${p.file_path}`}
                        alt={p.description || 'Proof'}
                        className={styles.previewImg}
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    )}
                    {p.file_type === 'video' && (
                      <video controls className={styles.previewVideo}>
                        <source src={`/api/uploads/${p.file_path}`} />
                      </video>
                    )}
                    {p.file_type === 'receipt' && (
                        <a
                        href={`/api/uploads/${p.file_path}`}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.receiptLink}
                      >
                        📄 View Receipt
                      </a>
                    )}
                  </div>

                  <h4 className={styles.cardTitle}>{p.description || 'Proof uploaded'}</h4>
                  <p className={styles.cardProject}>🌿 {p.project_title}</p>
                  <p className={styles.cardNgo}>by {p.ngo_name}</p>
                  <p className={styles.cardDate}>{p.upload_date?.slice(0,10)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}