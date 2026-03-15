import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from '../components/Toast'
import styles from './AddProject.module.css'

const CATS = ['Education','Healthcare','Food & Nutrition','Water & Sanitation','Women Empowerment','Disaster Relief','Environment','General']

export default function AddProject() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const [form, setForm] = useState({ title:'', description:'', location:'', category:'Education', goal_amount:'', image_url:'', status:'active' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isEdit) {
      axios.get(`/api/projects/${id}`).then(r => {
        const p = r.data
        setForm({ title: p.title, description: p.description, location: p.location, category: p.category || 'Education', goal_amount: p.goal_amount, image_url: p.image_url || '', status: p.status })
      })
    }
  }, [id])

  const f = k => e => setForm({...form, [k]: e.target.value})

  const handle = async (e) => {
    e.preventDefault()
    if (!form.title || !form.description || !form.location || !form.goal_amount) { toast.error('Fill all required fields'); return }
    if (Number(form.goal_amount) < 100) { toast.error('Goal amount min ₹100'); return }
    setLoading(true)
    try {
      if (isEdit) {
        await axios.put(`/api/projects/${id}`, form)
        toast.success('Campaign updated!')
      } else {
        await axios.post('/api/projects', form)
        toast.success('Campaign created!')
      }
      navigate('/ngo/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong')
    } finally { setLoading(false) }
  }

  return (
    <div className="section">
      <div className="container">
        <div className={styles.wrap}>
          <h1 className={styles.title}>{isEdit ? '✏️ Edit Campaign' : '🌱 New Campaign'}</h1>
          <p className={styles.sub}>{isEdit ? 'Update your campaign details' : 'Create a new fundraising campaign'}</p>
          <form onSubmit={handle} className={styles.form}>
            <div className="form-group">
              <label className="form-label">Campaign Title *</label>
              <input className="form-input" type="text" placeholder="E.g., Digital Classrooms for Rural Schools" value={form.title} onChange={f('title')} />
            </div>
            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea className="form-input" rows={5} placeholder="Describe your campaign, what you will do with the funds..." value={form.description} onChange={f('description')} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Location *</label>
                <input className="form-input" type="text" placeholder="E.g., Rajasthan, India" value={form.location} onChange={f('location')} />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input form-select" value={form.category} onChange={f('category')}>
                  {CATS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Goal Amount (₹) *</label>
                <input className="form-input" type="number" placeholder="500000" value={form.goal_amount} onChange={f('goal_amount')} />
              </div>
              {isEdit && (
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-input form-select" value={form.status} onChange={f('status')}>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Campaign Image URL</label>
              <input className="form-input" type="url" placeholder="https://images.unsplash.com/..." value={form.image_url} onChange={f('image_url')} />
              <span className="form-hint">Paste any image URL from Unsplash or other sources</span>
            </div>
            {form.image_url && (
              <div className={styles.preview}>
                <img src={form.image_url} alt="Preview" onError={e => e.target.style.display='none'} />
              </div>
            )}
            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={() => navigate('/ngo/dashboard')}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? '⏳ Saving...' : isEdit ? 'Update Campaign ✅' : 'Create Campaign 🌱'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
