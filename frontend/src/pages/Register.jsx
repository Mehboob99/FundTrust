import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from '../components/Toast'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'donor', organization: '', phone: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const f = k => e => setForm({ ...form, [k]: e.target.value })

  const handle = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) { toast.error('Fill all required fields'); return }
    if (form.password.length < 6) { toast.error('Password min 6 characters'); return }
    setLoading(true)
    try {
      await register(form)
      toast.success('Account created! Please login.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally { setLoading(false) }
  }

  const inp = (extra = {}) => ({
    width: '100%', padding: '0.75rem 1rem', background: '#fff',
    border: '1.5px solid #d1fae5', borderRadius: 11,
    fontFamily: 'DM Sans,sans-serif', fontSize: '0.86rem',
    color: '#111', outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s', ...extra
  })
  const lbl = { fontFamily: 'DM Sans,sans-serif', fontSize: '0.78rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.38rem' }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0fdf4', padding: '2rem 1rem' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap'); .pw-toggle:hover{color:#16a34a!important}`}</style>
      <div style={{ background: '#fff', border: '1.5px solid #d1fae5', borderRadius: 22, padding: '2.2rem', width: '100%', maxWidth: 500, boxShadow: '0 20px 60px rgba(22,163,74,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '2rem', display: 'block' }}>🌿</span>
          <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: '1.4rem', color: '#111', margin: '0.3rem 0 0.1rem' }}>Create Account</h2>
          <p style={{ fontFamily: 'DM Sans,sans-serif', color: '#6b7280', fontSize: '0.8rem', margin: 0 }}>Join India's most transparent donation platform</p>
        </div>

        {/* Role Selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.7rem', marginBottom: '1.4rem' }}>
          {[{ v: 'donor', e: '💚', l: 'Donor', d: 'I want to donate' }, { v: 'ngo', e: '🏢', l: 'NGO', d: 'I run an NGO' }].map(r => (
            <button key={r.v} type="button" onClick={() => setForm({ ...form, role: r.v })} style={{ padding: '0.9rem', border: form.role === r.v ? '2px solid #16a34a' : '1.5px solid #d1fae5', borderRadius: 12, background: form.role === r.v ? '#f0fdf4' : '#fff', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', textAlign: 'center', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
              <span style={{ fontSize: '1.4rem' }}>{r.e}</span>
              <span style={{ fontWeight: 700, fontSize: '0.88rem', color: form.role === r.v ? '#16a34a' : '#374151' }}>{r.l}</span>
              <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{r.d}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handle}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '0.9rem' }}>
            <div>
              <label style={lbl}>Full Name *</label>
              <input style={inp()} type="text" placeholder="Your name" value={form.name} onChange={f('name')} onFocus={e => e.target.style.borderColor='#16a34a'} onBlur={e => e.target.style.borderColor='#d1fae5'} />
            </div>
            <div>
              <label style={lbl}>Phone</label>
              <input style={inp()} type="tel" placeholder="+91 XXXXX" value={form.phone} onChange={f('phone')} onFocus={e => e.target.style.borderColor='#16a34a'} onBlur={e => e.target.style.borderColor='#d1fae5'} />
            </div>
          </div>

          <div style={{ marginBottom: '0.9rem' }}>
            <label style={lbl}>Email Address *</label>
            <input style={inp()} type="email" placeholder="you@example.com" value={form.email} onChange={f('email')} onFocus={e => e.target.style.borderColor='#16a34a'} onBlur={e => e.target.style.borderColor='#d1fae5'} />
          </div>

          {form.role === 'ngo' && (
            <div style={{ marginBottom: '0.9rem' }}>
              <label style={lbl}>Organization Name</label>
              <input style={inp()} type="text" placeholder="Your NGO name" value={form.organization} onChange={f('organization')} onFocus={e => e.target.style.borderColor='#16a34a'} onBlur={e => e.target.style.borderColor='#d1fae5'} />
            </div>
          )}

          <div style={{ marginBottom: '1.3rem' }}>
            <label style={lbl}>Password *</label>
            <div style={{ position: 'relative' }}>
              <input style={inp({ paddingRight: '2.8rem' })} type={showPw ? 'text' : 'password'} placeholder="Min 6 characters" value={form.password} onChange={f('password')} onFocus={e => e.target.style.borderColor='#16a34a'} onBlur={e => e.target.style.borderColor='#d1fae5'} />
              <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '1.1rem', transition: 'color 0.2s', padding: 0, lineHeight: 1 }}>
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.9rem', background: 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff', border: 'none', borderRadius: 12, fontFamily: 'DM Sans,sans-serif', fontWeight: 700, fontSize: '0.96rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, boxShadow: '0 8px 25px rgba(22,163,74,0.35)', transition: 'all 0.2s' }}>
            {loading ? '⏳ Creating...' : `Create ${form.role === 'ngo' ? 'NGO' : 'Donor'} Account →`}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontFamily: 'DM Sans,sans-serif', fontSize: '0.8rem', color: '#6b7280', marginTop: '1.1rem' }}>
          Already have an account? <Link to="/login" style={{ color: '#16a34a', fontWeight: 700, textDecoration: 'none' }}>Login here</Link>
        </p>
      </div>
    </div>
  )
}
