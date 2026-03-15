import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from '../components/Toast'

export default function ManageProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(true)

  const fetch = () => {
    setLoading(true)
    axios.get('/api/ngo/projects').then(r => setProjects(r.data)).finally(() => setLoading(false))
  }
  useEffect(() => { fetch() }, [])

  const del = async (id) => {
    if (!confirm('Delete campaign?')) return
    try { await axios.delete(`/api/projects/${id}`); toast.success('Deleted!'); fetch() }
    catch { toast.error('Delete failed') }
  }

  return (
    <div>
      <div className="page-hdr">
        <h1>📋 Manage Campaigns</h1>
        <p>View and manage all your campaigns</p>
      </div>
      <div className="section">
        <div className="container">
          <div style={{display:'flex',justifyContent:'flex-end',marginBottom:'1.5rem'}}>
            <Link to="/ngo/add-project" className="btn btn-primary">+ New Campaign</Link>
          </div>
          {loading ? <div className="loading-wrap"><div className="spinner" /></div> :
           projects.length === 0 ? (
            <div className="empty"><span className="empty-icon">🌿</span><h3>No campaigns</h3><Link to="/ngo/add-project" className="btn btn-primary">Create First Campaign</Link></div>
           ) : (
            <div className="tbl-wrap">
              <table className="data-tbl">
                <thead><tr><th>Campaign</th><th>Raised</th><th>Goal</th><th>Progress</th><th>Donors</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {projects.map(p => {
                    const pct = Math.min(100,Math.round((p.amount_raised/p.goal_amount)*100))
                    return (
                      <tr key={p.id}>
                        <td><strong>{p.title}</strong><br/><small style={{color:'#7a9e7e'}}>📍 {p.location}</small></td>
                        <td className="amt-cell">₹{Number(p.amount_raised).toLocaleString('en-IN')}</td>
                        <td>₹{Number(p.goal_amount).toLocaleString('en-IN')}</td>
                        <td style={{minWidth:'120px'}}>
                          <div className="prog-track"><div className="prog-bar" style={{width:`${pct}%`}} /></div>
                          <small style={{color:'#7a9e7e'}}>{pct}%</small>
                        </td>
                        <td>👥 {p.donor_count}</td>
                        <td><span className={`badge ${p.status==='active'?'badge-green':'badge-earth'}`}>{p.status}</span></td>
                        <td>
                          <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap'}}>
                            <Link to={`/ngo/edit-project/${p.id}`} className="btn btn-secondary btn-sm">Edit</Link>
                            <Link to={`/ngo/upload-proof/${p.id}`} className="btn btn-earth btn-sm">Proof</Link>
                            <button className="btn btn-danger btn-sm" onClick={() => del(p.id)}>Del</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
