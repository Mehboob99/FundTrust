import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from '../components/Toast'

export default function Login() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  if (user) { navigate(user.role === 'ngo' ? '/ngo/dashboard' : '/donor/dashboard'); return null }

  const handle = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { toast.error('Fill all fields'); return }
    setLoading(true)
    try {
      const r = await login(form.email, form.password)
      toast.success(`Welcome back, ${r.user.name}!`)
      navigate(r.user.role === 'ngo' ? '/ngo/dashboard' : '/donor/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed')
    } finally { setLoading(false) }
  }

  const fillDemo = (role) => {
    if (role === 'ngo') setForm({ email: 'ngo@fundtrust.in', password: 'password123' })
    else setForm({ email: 'donor@fundtrust.in', password: 'password123' })
  }

  const inp = (extra = {}) => ({
    width: '100%', padding: '0.78rem 1rem', background: '#fff',
    border: '1.5px solid #d1fae5', borderRadius: 11,
    fontFamily: 'DM Sans,sans-serif', fontSize: '0.88rem',
    color: '#111', outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
    ...extra
  })

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0fdf4', padding: '2rem 1rem' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap'); .pw-toggle:hover{color:#16a34a!important}`}</style>
      <div style={{ background: '#fff', border: '1.5px solid #d1fae5', borderRadius: 22, padding: '2.5rem', width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(22,163,74,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '2.2rem', display: 'block' }}>🌿</span>
          <h1 style={{ fontFamily: 'Playfair Display,serif', fontSize: '1.5rem', color: '#15803d', margin: '0.3rem 0 0.1rem' }}>FundTrust</h1>
          <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: '1.2rem', color: '#111', margin: 0 }}>Welcome Back</h2>
          <p style={{ fontFamily: 'DM Sans,sans-serif', color: '#6b7280', fontSize: '0.82rem', marginTop: '0.3rem' }}>Sign in to your account</p>
        </div>

        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '0.9rem 1.1rem', marginBottom: '1.5rem' }}>
          <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '0.74rem', color: '#4b5563', marginBottom: '0.55rem', fontWeight: 600 }}>Quick Demo Login:</p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => fillDemo('donor')} style={{ flex: 1, padding: '0.45rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, fontFamily: 'DM Sans,sans-serif', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>👤 Donor Demo</button>
            <button onClick={() => fillDemo('ngo')} style={{ flex: 1, padding: '0.45rem', background: '#fff', color: '#16a34a', border: '1.5px solid #16a34a', borderRadius: 8, fontFamily: 'DM Sans,sans-serif', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>🏢 NGO Demo</button>
          </div>
        </div>

        <form onSubmit={handle}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '0.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.4rem' }}>Email Address</label>
            <input style={inp()} type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              onFocus={e => e.target.style.borderColor = '#16a34a'} onBlur={e => e.target.style.borderColor = '#d1fae5'} />
          </div>

          <div style={{ marginBottom: '1.3rem' }}>
            <label style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '0.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.4rem' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input style={inp({ paddingRight: '2.8rem' })} type={showPw ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                onFocus={e => e.target.style.borderColor = '#16a34a'} onBlur={e => e.target.style.borderColor = '#d1fae5'} />
              <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '1.1rem', transition: 'color 0.2s', padding: 0, lineHeight: 1 }}>
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.9rem', background: 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff', border: 'none', borderRadius: 12, fontFamily: 'DM Sans,sans-serif', fontWeight: 700, fontSize: '0.96rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, boxShadow: '0 8px 25px rgba(22,163,74,0.35)', transition: 'all 0.2s' }}>
            {loading ? '⏳ Logging in...' : 'Login →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontFamily: 'DM Sans,sans-serif', fontSize: '0.82rem', color: '#6b7280', marginTop: '1.2rem' }}>
          Don't have an account? <Link to="/register" style={{ color: '#16a34a', fontWeight: 700, textDecoration: 'none' }}>Register here</Link>
        </p>
      </div>
    </div>
  )
}
