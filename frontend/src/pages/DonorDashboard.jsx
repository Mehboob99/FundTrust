import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import styles from './Dashboard.module.css'

export default function DonorDashboard() {
  const { user } = useAuth()
  const [stats, setStats]       = useState({})
  const [donations, setDonations] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([axios.get('/api/donor/stats'), axios.get('/api/donor/donations')])
      .then(([s, d]) => { setStats(s.data); setDonations(d.data) })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="page-hdr">
        <h1>👤 Donor Dashboard</h1>
        <p>Welcome back, {user?.name}!</p>
      </div>
      <div className="section">
        <div className="container">
          {loading ? <div className="loading-wrap"><div className="spinner" /></div> : (
            <>
              <div className={styles.statsRow}>
                <div className="stat-card">
                  <div className="stat-icon">💚</div>
                  <div className="stat-val">₹{Number(stats.total_donated||0).toLocaleString('en-IN')}</div>
                  <div className="stat-lbl">Total Donated</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🌿</div>
                  <div className="stat-val">{stats.projects_supported || 0}</div>
                  <div className="stat-lbl">Campaigns Supported</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🎯</div>
                  <div className="stat-val">{stats.total_donations || 0}</div>
                  <div className="stat-lbl">Total Donations</div>
                </div>
              </div>

              <div className={styles.section}>
                <div className={styles.sectionHdr}>
                  <h2 className={styles.sectionTitle}>Your Donation History</h2>
                  <Link to="/projects" className="btn btn-primary btn-sm">+ Donate More</Link>
                </div>
                {donations.length === 0 ? (
                  <div className="empty">
                    <span className="empty-icon">💚</span>
                    <h3>No donations yet</h3>
                    <p>Browse campaigns and make your first donation!</p>
                    <Link to="/projects" className="btn btn-primary">Browse Campaigns</Link>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', fontFamily: 'DM Sans,sans-serif', fontSize: '0.85rem' }}>
                      <colgroup>
                        <col style={{ width: '35%' }} />
                        <col style={{ width: '22%' }} />
                        <col style={{ width: '15%' }} />
                        <col style={{ width: '15%' }} />
                        <col style={{ width: '13%' }} />
                      </colgroup>
                      <thead>
                        <tr style={{ background: '#f0fdf4' }}>
                          <th style={{ padding: '0.8rem 1rem', textAlign: 'left', fontWeight: 700, color: '#4a6741', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #c8e6c9' }}>Campaign</th>
                          <th style={{ padding: '0.8rem 1rem', textAlign: 'left', fontWeight: 700, color: '#4a6741', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #c8e6c9' }}>Location</th>
                          <th style={{ padding: '0.8rem 1rem', textAlign: 'left', fontWeight: 700, color: '#4a6741', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #c8e6c9' }}>Amount</th>
                          <th style={{ padding: '0.8rem 1rem', textAlign: 'left', fontWeight: 700, color: '#4a6741', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #c8e6c9' }}>Date</th>
                          <th style={{ padding: '0.8rem 1rem', textAlign: 'left', fontWeight: 700, color: '#4a6741', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #c8e6c9' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {donations.map((d, i) => (
                          <tr key={d.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb', transition: 'background 0.2s' }}>
                            <td style={{ padding: '0.85rem 1rem', borderBottom: '1px solid #e8f5e9', fontWeight: 600, color: '#1b2d1e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.project_title}</td>
                            <td style={{ padding: '0.85rem 1rem', borderBottom: '1px solid #e8f5e9', color: '#4a6741', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📍 {d.location}</td>
                            <td style={{ padding: '0.85rem 1rem', borderBottom: '1px solid #e8f5e9', fontWeight: 700, color: '#16a34a' }}>₹{Number(d.amount).toLocaleString('en-IN')}</td>
                            <td style={{ padding: '0.85rem 1rem', borderBottom: '1px solid #e8f5e9', color: '#6b7280' }}>{d.date?.slice(0,10)}</td>
                            <td style={{ padding: '0.85rem 1rem', borderBottom: '1px solid #e8f5e9' }}>
                              <Link to={`/project/${d.project_id}`} style={{ background: '#f0fdf4', color: '#16a34a', border: '1.5px solid #16a34a', borderRadius: 8, padding: '0.3rem 0.8rem', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>View</Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
