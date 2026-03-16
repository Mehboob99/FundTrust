import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { toast } from '../components/Toast'
import styles from './ProjectDetail.module.css'

const QUICK = [100, 500, 1000, 5000]

export default function ProjectDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [amount, setAmount]   = useState('')
  const [message, setMsg]     = useState('')
  const [donating, setDonating] = useState(false)
  const [tab, setTab] = useState('about')

  useEffect(() => {
    axios.get(`https://fundtrust.onrender.com/api/projects/${id}`)
      .then(r => setProject(r.data))
      .catch(() => navigate('/projects'))
      .finally(() => setLoading(false))
  }, [id])

  const handleDonate = async () => {
    if (!user) { toast.error('Please login to donate'); navigate('/login'); return }
    if (!amount || isNaN(amount) || Number(amount) < 1) { toast.error('Enter valid amount (min ₹1)'); return }
    setDonating(true)
    try {
      const r = await axios.post(`/api/donate/${id}`, { amount: Number(amount), message })
      toast.success(r.data.message)
      setAmount(''); setMsg('')
      const r2 = await axios.get(`https://fundtrust.onrender.com/api/projects/${id}`)
      setProject(r2.data)
    } catch (e) {
      toast.error(e.response?.data?.error || 'Donation failed')
    } finally { setDonating(false) }
  }

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>
  if (!project) return null

  const pct = Math.min(100, Math.round((project.amount_raised / project.goal_amount) * 100))

  return (
    <div className="section">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link> › <Link to="/projects">Campaigns</Link> › {project.title}
        </div>
        <div className={styles.layout}>
          {/* LEFT */}
          <div className={styles.left}>
            <img src={project.image_url || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80'} alt={project.title} className={styles.heroImg} />

            {/* Tabs */}
            <div className={styles.tabs}>
              {['about','proofs','donors'].map(t => (
                <button key={t} className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`} onClick={() => setTab(t)}>
                  {t === 'about' ? 'About' : t === 'proofs' ? `Proof (${project.proofs?.length || 0})` : `Donors (${project.donor_count || 0})`}
                </button>
              ))}
            </div>

            {tab === 'about' && (
              <div className={styles.tabContent}>
                <span className={`badge badge-green`}>{project.category}</span>
                <h1 className={styles.title}>{project.title}</h1>
                <p className={styles.meta}>🌿 {project.ngo_name} &nbsp;•&nbsp; 📍 {project.location}</p>
                <p className={styles.desc}>{project.description}</p>
              </div>
            )}

            {tab === 'proofs' && (
              <div className={styles.tabContent}>
                {project.proofs?.length === 0 ? (
                  <div className="empty"><span className="empty-icon">📷</span><h3>No proofs yet</h3><p>NGO will upload photos/videos soon</p></div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '1rem' }}>
                    {project.proofs.map(pr => (
                      <div key={pr.id} style={{ background: '#f0fdf4', border: '1px solid #c8e6c9', borderRadius: 14, overflow: 'hidden' }}>
                        {pr.file_type === 'image' && (
                          <img
                            src={`https://fundtrust.onrender.com/api/uploads/${pr.file_path}`}
                            alt={pr.description}
                            style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }}
                            onError={e => { e.target.style.display='none' }}
                          />
                        )}
                        {pr.file_type === 'video' && (
                          <video
                            controls
                            style={{ width: '100%', height: 180, background: '#000', display: 'block' }}
                          >
                            <source src={`https://fundtrust.onrender.com/api/uploads/${pr.file_path}`} />
                            Your browser does not support video.
                          </video>
                        )}
                        {pr.file_type === 'receipt' && (
                          <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>📄</div>
                        )}
                        <div style={{ padding: '0.8rem' }}>
                          <p style={{ fontWeight: 600, fontSize: '0.82rem', color: '#1b2d1e', margin: '0 0 0.2rem' }}>{pr.description || 'Proof uploaded'}</p>
                          <p style={{ fontSize: '0.7rem', color: '#9ca3af', margin: 0 }}>{pr.upload_date?.slice(0,10)} · {pr.file_type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'donors' && (
              <div className={styles.tabContent}>
                {project.donors?.length === 0 ? (
                  <div className="empty"><span className="empty-icon">💚</span><h3>Be the first donor!</h3></div>
                ) : (
                  <div className={styles.donorsList}>
                    {project.donors.map((d,i) => (
                      <div key={i} className={styles.donorRow}>
                        <span className={styles.donorAvatar}>{d.donor_name?.charAt(0)?.toUpperCase()}</span>
                        <div>
                          <p className={styles.donorName}>{d.donor_name}</p>
                          {d.message && <p className={styles.donorMsg}>"{d.message}"</p>}
                        </div>
                        <span className={styles.donorAmt}>₹{Number(d.amount).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT - DONATE SIDEBAR */}
          <div className={styles.right}>
            <div className={styles.donateBox}>
              <div className={styles.progSection}>
                <div className={styles.amounts}>
                  <span className={styles.raised}>₹{Number(project.amount_raised).toLocaleString('en-IN')}</span>
                  <span className={styles.goal}>of ₹{Number(project.goal_amount).toLocaleString('en-IN')}</span>
                </div>
                <div className="prog-track lg"><div className="prog-bar" style={{ width: `${pct}%` }} /></div>
                <div className={styles.progMeta}>
                  <span>{pct}% funded</span>
                  <span>👥 {project.donor_count} donors</span>
                </div>
              </div>

              <h3 className={styles.donateTitle}>Make a Donation</h3>
              <div className={styles.quickBtns}>
                {QUICK.map(q => (
                  <button key={q} className={`${styles.quickBtn} ${String(amount) === String(q) ? styles.quickActive : ''}`} onClick={() => setAmount(q)}>
                    ₹{q.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
              <input
                className="form-input"
                type="number"
                placeholder="Or enter custom amount (₹)"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                style={{ marginBottom: '0.8rem' }}
              />
              <textarea
                className="form-input"
                placeholder="Leave a message (optional)"
                rows={2}
                value={message}
                onChange={e => setMsg(e.target.value)}
                style={{ marginBottom: '1rem' }}
              />
              {user?.role === 'donor' ? (
                <button className="btn btn-primary btn-full btn-lg" onClick={handleDonate} disabled={donating}>
                  {donating ? '⏳ Processing...' : '💚 Donate Now'}
                </button>
              ) : user?.role === 'ngo' ? (
                <p className={styles.ngoNote}>NGOs cannot donate. Switch to donor account.</p>
              ) : (
                <Link to="/login" className="btn btn-primary btn-full btn-lg">Login to Donate</Link>
              )}
              <p className={styles.secure}>🔒 Secure & Transparent Donation</p>
            </div>

            <div className={styles.ngoCard}>
              <h4 className={styles.ngoTitle}>About the NGO</h4>
              <p className={styles.ngoName}>🌿 {project.ngo_name}</p>
              {project.organization && <p className={styles.ngoOrg}>{project.organization}</p>}
              <Link to="/transparency" className="btn btn-outline btn-sm" style={{ marginTop: '0.8rem' }}>View Proofs</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
