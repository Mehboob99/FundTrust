import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { toast } from '../components/Toast'
import styles from './Dashboard.module.css'

export default function NgoDashboard() {
  const { user } = useAuth()
  const [stats, setStats]       = useState({})
  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(true)

  const fetchData = () => {
    setLoading(true)
    Promise.all([axios.get('https://fundtrust.onrender.com/api/ngo/stats'), axios.get('https://fundtrust.onrender.com/api/ngo/projects')])
      .then(([s, p]) => { setStats(s.data); setProjects(p.data) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const deleteProject = async (id) => {
    if (!confirm('Delete this campaign?')) return
    try {
      await axios.delete(`https://fundtrust.onrender.com/api/projects/${id}`)
      toast.success('Campaign deleted')
      fetchData()
    } catch { toast.error('Delete failed') }
  }

  return (
    <div>
      <div className="page-hdr">
        <h1>🏢 NGO Dashboard</h1>
        <p>Welcome, {user?.name}!</p>
      </div>
      <div className="section">
        <div className="container">
          {loading ? <div className="loading-wrap"><div className="spinner" /></div> : (
            <>
              <div className={styles.statsRow}>
                <div className="stat-card">
                  <div className="stat-icon">💚</div>
                  <div className="stat-val">₹{Number(stats.total_raised||0).toLocaleString('en-IN')}</div>
                  <div className="stat-lbl">Total Raised</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🌿</div>
                  <div className="stat-val">{stats.total_projects || 0}</div>
                  <div className="stat-lbl">Total Campaigns</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <div className="stat-val">{stats.total_donors || 0}</div>
                  <div className="stat-lbl">Total Donors</div>
                </div>
              </div>

              <div className={styles.section}>
                <div className={styles.sectionHdr}>
                  <h2 className={styles.sectionTitle}>Your Campaigns</h2>
                  <Link to="/ngo/add-project" className="btn btn-primary btn-sm">+ New Campaign</Link>
                </div>
                {projects.length === 0 ? (
                  <div className="empty">
                    <span className="empty-icon">🌿</span>
                    <h3>No campaigns yet</h3>
                    <p>Create your first campaign and start receiving donations!</p>
                    <Link to="/ngo/add-project" className="btn btn-primary">Create Campaign</Link>
                  </div>
                ) : (
                  <div className="tbl-wrap">
                    <table className="data-tbl">
                      <thead>
                        <tr><th>Campaign</th><th>Raised</th><th>Goal</th><th>Donors</th><th>Status</th><th>Actions</th></tr>
                      </thead>
                      <tbody>
                        {projects.map(p => (
                          <tr key={p.id}>
                            <td><strong>{p.title}</strong><br/><small style={{color:'#7a9e7e'}}>📍 {p.location}</small></td>
                            <td className="amt-cell">₹{Number(p.amount_raised).toLocaleString('en-IN')}</td>
                            <td>₹{Number(p.goal_amount).toLocaleString('en-IN')}</td>
                            <td>👥 {p.donor_count}</td>
                            <td><span className={`badge ${p.status==='active' ? 'badge-green' : 'badge-earth'}`}>{p.status}</span></td>
                            <td>
                              <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap'}}>
                                <Link to={`/project/${p.id}`} className="btn btn-outline btn-sm">View</Link>
                                <Link to={`/ngo/edit-project/${p.id}`} className="btn btn-secondary btn-sm">Edit</Link>
                                <Link to={`/ngo/upload-proof/${p.id}`} className="btn btn-earth btn-sm">Proof</Link>
                                <button className="btn btn-danger btn-sm" onClick={() => deleteProject(p.id)}>Delete</button>
                              </div>
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
