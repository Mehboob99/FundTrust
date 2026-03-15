import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from '../components/Toast'
import styles from './UploadProof.module.css'

export default function UploadProof() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [form, setForm] = useState({ file_type: 'image', description: '' })
  const [file, setFile]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [proofs, setProofs] = useState([])

  useEffect(() => {
    axios.get(`/api/projects/${id}`).then(r => { setProject(r.data); setProofs(r.data.proofs || []) })
  }, [id])

  const [uploadProgress, setUploadProgress] = useState(0)

  const handle = async (e) => {
    e.preventDefault()
    if (!file) { toast.error('Select a file'); return }
    setLoading(true)
    setUploadProgress(0)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('file_type', form.file_type)
    fd.append('description', form.description)
    try {
      await axios.post(`/api/ngo/upload-proof/${id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 300000, // 5 minute timeout for large videos
        onUploadProgress: (progressEvent) => {
          const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(pct)
        }
      })
      toast.success('Proof uploaded!')
      setFile(null); setForm({ file_type:'image', description:'' }); setUploadProgress(0)
      const r = await axios.get(`/api/projects/${id}`)
      setProofs(r.data.proofs || [])
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed')
    } finally { setLoading(false) }
  }

  const icons = { image:'🖼️', video:'🎥', receipt:'📄' }

  return (
    <div className="section">
      <div className="container">
        <div className={styles.wrap}>
          <h1 className={styles.title}>📸 Upload Proof</h1>
          {project && <p className={styles.sub}>Campaign: <strong>{project.title}</strong></p>}

          <div className={styles.grid}>
            <div className={styles.uploadBox}>
              <form onSubmit={handle}>
                <div className="form-group">
                  <label className="form-label">Proof Type</label>
                  <div className={styles.typePicker}>
                    {['image','video','receipt'].map(t => (
                      <button key={t} type="button" className={`${styles.typeBtn} ${form.file_type===t ? styles.typeActive:''}`} onClick={() => setForm({...form, file_type: t})}>
                        {icons[t]} {t.charAt(0).toUpperCase()+t.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input" rows={3} placeholder="Describe what this proof shows..." value={form.description} onChange={e => setForm({...form,description:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Select File *</label>
                  <div className={styles.fileBox}>
                    <input type="file" id="fileInput" style={{display:'none'}} accept={form.file_type==='image'?'image/*':form.file_type==='video'?'video/*':'.pdf,image/*'} onChange={e => setFile(e.target.files[0])} />
                    <label htmlFor="fileInput" className={styles.fileLabel}>
                      <span className={styles.fileIcon}>{file ? '✅' : '📁'}</span>
                      <span>{file ? file.name : 'Click to choose file'}</span>
                    </label>
                  </div>
                </div>
                {/* Upload Progress Bar */}
                {loading && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '0.8rem', color: '#16a34a', fontWeight: 600 }}>
                        {uploadProgress < 100 ? '📤 Uploading...' : '✅ Processing...'}
                      </span>
                      <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '0.8rem', color: '#6b7280' }}>{uploadProgress}%</span>
                    </div>
                    <div style={{ background: '#f0fdf4', borderRadius: 99, height: 8, overflow: 'hidden' }}>
                      <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'linear-gradient(90deg,#16a34a,#4ade80)', borderRadius: 99, transition: 'width 0.3s ease', boxShadow: '0 0 8px rgba(74,222,128,0.5)' }} />
                    </div>
                    {form.file_type === 'video' && (
                      <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '0.72rem', color: '#9ca3af', marginTop: '0.3rem' }}>
                        🎥 Badi video hai toh thoda time lagega — page band mat karo!
                      </p>
                    )}
                  </div>
                )}
                <div className="form-actions">
                  <button type="button" className="btn btn-outline" onClick={() => navigate('/ngo/dashboard')} disabled={loading}>Back</button>
                  <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                    {loading ? `⏳ ${uploadProgress}% Uploading...` : '📤 Upload Proof'}
                  </button>
                </div>
              </form>
            </div>

            <div>
              <h3 className={styles.histTitle}>Uploaded Proofs ({proofs.length})</h3>
              {proofs.length === 0 ? (
                <div className="empty"><span className="empty-icon">📷</span><h3>No proofs yet</h3></div>
              ) : (
                <div className={styles.proofsList}>
                  {proofs.map(p => (
                    <div key={p.id} className={styles.proofItem}>
                      <span className={styles.proofIcon}>{icons[p.file_type]}</span>
                      <div>
                        <p className={styles.proofName}>{p.description || 'Proof uploaded'}</p>
                        <p className={styles.proofDate}>{p.upload_date?.slice(0,10)} • {p.file_type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
