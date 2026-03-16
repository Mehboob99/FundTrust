import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

/* ─────────────────────────────────────────────────────────────
   LIVE DONATION NOTIFICATION
───────────────────────────────────────────────────────────── */
const FAKE_DONATIONS = [
  { name: 'Rahul', city: 'Mumbai', amount: '₹500' },
  { name: 'Priya', city: 'Delhi', amount: '₹1,000' },
  { name: 'Amit', city: 'Pune', amount: '₹2,500' },
  { name: 'Sunita', city: 'Bangalore', amount: '₹500' },
  { name: 'Ravi', city: 'Chennai', amount: '₹5,000' },
  { name: 'Meera', city: 'Kolkata', amount: '₹1,500' },
  { name: 'Vikram', city: 'Hyderabad', amount: '₹750' },
]

function LiveDonationToast() {
  const [visible, setVisible] = useState(false)
  const [donation, setDonation] = useState(null)
  const idx = useRef(0)

  useEffect(() => {
    const show = () => {
      setDonation(FAKE_DONATIONS[idx.current % FAKE_DONATIONS.length])
      idx.current++
      setVisible(true)
      setTimeout(() => setVisible(false), 4000)
    }
    const first = setTimeout(show, 2500)
    const timer = setInterval(show, 7000)
    return () => { clearTimeout(first); clearInterval(timer) }
  }, [])

  return (
    <div style={{
      position: 'fixed', bottom: '1.5rem', left: '1.5rem', zIndex: 9999,
      transform: visible ? 'translateY(0) scale(1)' : 'translateY(120%) scale(0.9)',
      opacity: visible ? 1 : 0,
      transition: 'all 0.5s cubic-bezier(0.34,1.56,0.64,1)',
      pointerEvents: 'none',
    }}>
      {donation && (
        <div style={{
          background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)',
          borderLeft: '4px solid #16a34a', borderRadius: '14px',
          border: '1px solid rgba(22,163,74,0.25)',
          padding: '0.9rem 1.2rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', gap: '0.8rem', maxWidth: '290px',
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: 'linear-gradient(135deg,#16a34a,#059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', flexShrink: 0,
          }}>💚</div>
          <div>
            <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '0.78rem', fontWeight: 700, color: '#111', margin: 0 }}>
              {donation.name} from {donation.city}
            </p>
            <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '0.75rem', color: '#16a34a', margin: 0, fontWeight: 600 }}>
              donated {donation.amount} · just now
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   ANIMATED COUNTER
───────────────────────────────────────────────────────────── */
function AnimatedCounter({ target, suffix = '' }) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true
        const t0 = Date.now()
        const tick = () => {
          const p = Math.min((Date.now() - t0) / 2000, 1)
          const ease = 1 - Math.pow(1 - p, 3)
          setVal(Math.floor(ease * target))
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
        obs.disconnect()
      }
    }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [target])
  return <span ref={ref}>{val.toLocaleString('en-IN')}{suffix}</span>
}

/* ─────────────────────────────────────────────────────────────
   ANIMATED PROGRESS BAR
───────────────────────────────────────────────────────────── */
function ProgressBar({ raised, goal }) {
  const pct = Math.min(100, Math.round((raised / goal) * 100))
  const [w, setW] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setTimeout(() => setW(pct), 300); obs.disconnect() }
    }, { threshold: 0.4 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [pct])
  return (
    <div ref={ref}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
        <span style={{ fontFamily: 'DM Sans,sans-serif', fontWeight: 700, color: '#16a34a', fontSize: '0.83rem' }}>
          ₹{Number(raised).toLocaleString('en-IN')} raised
        </span>
        <span style={{ fontFamily: 'DM Sans,sans-serif', color: '#9ca3af', fontSize: '0.78rem' }}>{pct}%</span>
      </div>
      <div style={{ background: '#f0fdf4', borderRadius: 99, height: 7, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 99,
          background: 'linear-gradient(90deg,#16a34a,#4ade80)',
          width: `${w}%`, transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: '0 0 8px rgba(74,222,128,0.4)',
        }} />
      </div>
      <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.3rem' }}>
        of ₹{Number(goal).toLocaleString('en-IN')} goal
      </p>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   COUNTDOWN TIMER
───────────────────────────────────────────────────────────── */
function Countdown() {
  const end = useRef(Date.now() + 7 * 86400000)
  const [t, setT] = useState({ d: 7, h: 0, m: 0, s: 0 })
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, end.current - Date.now())
      setT({ d: Math.floor(diff / 86400000), h: Math.floor((diff % 86400000) / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) })
    }
    tick()
    const i = setInterval(tick, 1000)
    return () => clearInterval(i)
  }, [])
  const B = ({ n, l }) => (
    <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: '0.8rem 1rem', minWidth: 65, textAlign: 'center' }}>
      <div style={{ fontFamily: 'Playfair Display,serif', fontSize: '1.8rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>{String(n).padStart(2, '0')}</div>
      <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '0.6rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '0.2rem' }}>{l}</div>
    </div>
  )
  return <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}><B n={t.d} l="Days" /><B n={t.h} l="Hrs" /><B n={t.m} l="Min" /><B n={t.s} l="Sec" /></div>
}

/* ─────────────────────────────────────────────────────────────
   SUCCESS STORIES
───────────────────────────────────────────────────────────── */
const STORIES = [
  { img: 'https://images.unsplash.com/photo-1594608661623-aa0bd3a69d98?w=120&h=120&fit=crop', name: 'Savita Devi', loc: 'Rajasthan', text: 'Mere bacchon ko pehli baar school mila. FundTrust ne humari zindagi badal di. Ab meri beti doctor banegi!' },
  { img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop', name: 'Ramesh Kumar', loc: 'Bihar', text: 'Paani ke liye 5 km chalna padta tha. Aaj gaon mein saaf paani aa gaya. Bahut shukriya donors ko!' },
  { img: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=120&h=120&fit=crop', name: 'Lakshmi', loc: 'Tamil Nadu', text: 'Health camp mein pehli baar proper check-up hua. Doctor ne sahi time pe bimari pakdi. Meri jaan bachi!' },
  { img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop', name: 'Suresh Patel', loc: 'Gujarat', text: 'Silai training se ab main khud paise kamata hoon. Kisi par nirbhar nahi hona padta. Bahut khushi hai!' },
]

function Stories() {
  const [active, setActive] = useState(0)
  useEffect(() => { const t = setInterval(() => setActive(a => (a + 1) % STORIES.length), 4500); return () => clearInterval(t) }, [])
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: '1.2rem' }}>
        {STORIES.map((s, i) => (
          <div key={i} onClick={() => setActive(i)} style={{
            background: '#fff', borderRadius: 20, padding: '1.8rem',
            border: i === active ? '2px solid #16a34a' : '1.5px solid #e5e7eb',
            boxShadow: i === active ? '0 16px 50px rgba(22,163,74,0.14)' : '0 2px 12px rgba(0,0,0,0.05)',
            transform: i === active ? 'translateY(-5px)' : 'none',
            transition: 'all 0.45s ease', cursor: 'pointer',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginBottom: '1rem' }}>
              <img src={s.img} alt={s.name} style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover', border: '2.5px solid #dcfce7' }} />
              <div>
                <p style={{ fontFamily: 'DM Sans,sans-serif', fontWeight: 700, color: '#111', fontSize: '0.88rem', margin: 0 }}>{s.name}</p>
                <p style={{ fontFamily: 'DM Sans,sans-serif', color: '#16a34a', fontSize: '0.72rem', margin: 0 }}>📍 {s.loc}</p>
              </div>
            </div>
            <p style={{ fontFamily: 'DM Sans,sans-serif', color: '#374151', fontSize: '0.84rem', lineHeight: 1.7, fontStyle: 'italic', margin: '0 0 0.8rem' }}>"{s.text}"</p>
            <div style={{ display: 'flex', gap: '1px' }}>{[1,2,3,4,5].map(n => <span key={n} style={{ color: '#f59e0b', fontSize: '0.85rem' }}>★</span>)}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
        {STORIES.map((_, i) => <button key={i} onClick={() => setActive(i)} style={{ width: i === active ? 28 : 8, height: 8, borderRadius: 99, border: 'none', cursor: 'pointer', background: i === active ? '#16a34a' : '#d1fae5', transition: 'all 0.3s', padding: 0 }} />)}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   CAMPAIGN CARD
───────────────────────────────────────────────────────────── */
function CampaignCard({ project, index }) {
  const [hov, setHov] = useState(false)
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      background: '#fff', borderRadius: 20, overflow: 'hidden',
      border: '1px solid #e5e7eb',
      boxShadow: hov ? '0 20px 60px rgba(0,0,0,0.12)' : '0 4px 20px rgba(0,0,0,0.05)',
      transform: hov ? 'translateY(-6px)' : 'translateY(0)',
      transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
      animationFillMode: 'both',
    }}>
      <div style={{ position: 'relative', height: 195, overflow: 'hidden' }}>
        <img src={project.image_url || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&q=80'} alt={project.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: hov ? 'scale(1.07)' : 'scale(1)', transition: 'transform 0.5s ease' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.35) 0%,transparent 55%)' }} />
        <span style={{ position: 'absolute', top: '0.7rem', left: '0.7rem', background: 'rgba(255,255,255,0.95)', color: '#16a34a', fontSize: '0.65rem', fontWeight: 700, padding: '0.22rem 0.7rem', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.4px', backdropFilter: 'blur(10px)', border: '1px solid rgba(22,163,74,0.2)' }}>
          {project.category}
        </span>
      </div>
      <div style={{ padding: '1.3rem' }}>
        <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '0.7rem', color: '#16a34a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.35rem' }}>🌿 {project.ngo_name}</p>
        <h3 style={{ fontFamily: 'Playfair Display,serif', fontSize: '1rem', color: '#111', lineHeight: 1.4, marginBottom: '0.35rem' }}>{project.title}</h3>
        <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '0.73rem', color: '#9ca3af', marginBottom: '1rem' }}>📍 {project.location}</p>
        <ProgressBar raised={project.amount_raised} goal={project.goal_amount} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.1rem', paddingTop: '0.9rem', borderTop: '1px solid #f0fdf4' }}>
          <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '0.73rem', color: '#9ca3af' }}>👥 {project.donor_count || 0} donors</span>
          <Link to={`/project/${project.id}`} style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff', padding: '0.48rem 1.1rem', borderRadius: 99, fontFamily: 'DM Sans,sans-serif', fontWeight: 700, fontSize: '0.78rem', textDecoration: 'none', boxShadow: hov ? '0 6px 20px rgba(22,163,74,0.35)' : 'none', transition: 'box-shadow 0.3s' }}>
            Donate Now
          </Link>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   HOME PAGE
───────────────────────────────────────────────────────────── */
export default function Home() {
  const [projects, setProjects] = useState([])
  const [stats, setStats] = useState({})
  const [donateAmt, setDonateAmt] = useState(500)
  const [customAmt, setCustomAmt] = useState('')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    Promise.all([axios.get('/api/projects/featured'), axios.get('/api/stats')])
      .then(([p, s]) => { setProjects(p.data); setStats(s.data) })
    setTimeout(() => setLoaded(true), 120)
  }, [])

  const AMOUNTS = [500, 1000, 2500, 5000]
  const STATS = [
    { icon: '👥', label: 'Lives Changed', val: stats.total_donors || 0, suffix: '+' },
    { icon: '💰', label: 'Funds Raised', val: Math.floor((stats.total_raised || 0) / 1000), suffix: 'K+' },
    { icon: '🌍', label: 'Projects Done', val: stats.total_projects || 0, suffix: '' },
    { icon: '🤝', label: 'NGO Partners', val: 24, suffix: '+' },
  ]
  const CATS = [
    { e: '📚', n: 'Education', c: 12 }, { e: '🏥', n: 'Healthcare', c: 8 },
    { e: '💧', n: 'Clean Water', c: 6 }, { e: '🍱', n: 'Food', c: 9 },
    { e: '👩', n: 'Women Power', c: 7 }, { e: '🌱', n: 'Environment', c: 5 },
  ]

  const anim = (delay = 0) => ({
    opacity: loaded ? 1 : 0,
    transform: loaded ? 'translateY(0)' : 'translateY(30px)',
    transition: `all 0.9s cubic-bezier(0.4,0,0.2,1) ${delay}s`,
  })

  return (
    <div style={{ fontFamily: 'DM Sans,sans-serif', background: '#fff' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Playfair+Display:wght@600;700;800&display=swap');
        @keyframes bgPan{from{transform:scale(1.06) translateX(0)}to{transform:scale(1.09) translateX(-2%)}}
        @keyframes pulse2{0%,100%{opacity:1}50%{opacity:0.6}}
        @keyframes bounceY{0%,100%{transform:translateY(0) translateX(-50%)}50%{transform:translateY(-10px) translateX(-50%)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        .cc0{animation:fadeUp 0.6s ease 0s both}
        .cc1{animation:fadeUp 0.6s ease 0.1s both}
        .cc2{animation:fadeUp 0.6s ease 0.2s both}
        .cc3{animation:fadeUp 0.6s ease 0.3s both}
        .cc4{animation:fadeUp 0.6s ease 0.4s both}
        .cc5{animation:fadeUp 0.6s ease 0.5s both}
        .donate-btn:hover{transform:scale(1.03)!important;box-shadow:0 12px 40px rgba(22,163,74,0.5)!important}
        @media(max-width:860px){.hero-grid{grid-template-columns:1fr!important}.glass-card{display:none!important}.hero-h1{font-size:2.4rem!important}.stats-grid{grid-template-columns:repeat(2,1fr)!important}.campaigns-grid{grid-template-columns:1fr!important}.cats-grid{grid-template-columns:repeat(3,1fr)!important}}
        @media(max-width:540px){.cats-grid{grid-template-columns:repeat(2,1fr)!important}.donate-amts{grid-template-columns:repeat(2,1fr)!important}.cta-btns{flex-direction:column!important;align-items:stretch!important}.cta-btns a{text-align:center!important}}
      `}</style>

      <LiveDonationToast />

      {/* ════════════ HERO ════════════ */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: "url('https://fundtrust.onrender.com/api/uploads/hero.png')", backgroundSize: 'cover', backgroundPosition: 'center 30%', animation: 'bgPan 18s ease-in-out infinite alternate' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(3,38,17,0.88) 0%,rgba(20,83,45,0.78) 55%,rgba(5,46,22,0.62) 100%)' }} />
        <div style={{ position: 'absolute', top: '12%', right: '8%', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle,rgba(74,222,128,0.12),transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle,rgba(74,222,128,0.08),transparent 60%)', pointerEvents: 'none' }} />

        <div className="hero-grid" style={{ position: 'relative', maxWidth: 1180, margin: '0 auto', padding: '5rem 1.5rem 3rem', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2.5rem', alignItems: 'center', width: '100%' }}>
          {/* TEXT */}
          <div>
            <div style={{ ...anim(0), display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.13)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 99, padding: '0.4rem 1rem', marginBottom: '1.5rem' }}>
              <span style={{ width: 6, height: 6, background: '#4ade80', borderRadius: '50%', animation: 'pulse2 1.5s infinite', display: 'inline-block' }} />
              <span style={{ color: '#bbf7d0', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px' }}>India's Most Transparent NGO Platform</span>
            </div>

            <h1 className="hero-h1" style={{ ...anim(0.15), fontFamily: 'Playfair Display,serif', fontSize: 'clamp(2.8rem,5.5vw,4.2rem)', fontWeight: 700, color: '#fff', lineHeight: 1.1, margin: '0 0 1.2rem' }}>
              Together We Can<br />
              <span style={{ color: '#4ade80' }}>Change Lives</span>
            </h1>

            <p style={{ ...anim(0.28), color: 'rgba(255,255,255,0.82)', fontSize: '1.05rem', lineHeight: 1.8, maxWidth: 500, marginBottom: '2rem' }}>
              FundTrust connects compassionate donors with verified NGOs across India. Every rupee tracked with real photos, videos and receipts.
            </p>

            <div style={{ ...anim(0.4), display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
              <Link to="/projects" className="donate-btn" style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff', padding: '0.9rem 2.2rem', borderRadius: 99, fontWeight: 700, fontSize: '1rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 8px 30px rgba(22,163,74,0.45)', transition: 'all 0.25s' }}>
                💚 Donate Now
              </Link>
              <Link to="/transparency" style={{ background: 'rgba(255,255,255,0.13)', backdropFilter: 'blur(10px)', color: '#fff', padding: '0.9rem 1.8rem', border: '1px solid rgba(255,255,255,0.35)', borderRadius: 99, fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.25s' }}>
                🔍 See Proof
              </Link>
            </div>

            <div style={{ ...anim(0.52), display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              {['🔒 100% Secure', '✅ Verified NGOs', '📸 Proof Uploaded'].map(b => (
                <span key={b} style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8rem', fontWeight: 500 }}>{b}</span>
              ))}
            </div>
          </div>

          {/* GLASS DONATION CARD */}
          <div className="glass-card" style={{ ...anim(0.45), background: 'rgba(255,255,255,0.11)', backdropFilter: 'blur(28px)', border: '1px solid rgba(255,255,255,0.22)', borderRadius: 24, padding: '2rem', boxShadow: '0 30px 80px rgba(0,0,0,0.22)' }}>
            <p style={{ fontFamily: 'Playfair Display,serif', fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '0.3rem' }}>Quick Donate</p>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.78rem', marginBottom: '1.3rem' }}>Choose your impact</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.55rem', marginBottom: '0.9rem' }}>
              {AMOUNTS.map(a => (
                <button key={a} onClick={() => { setDonateAmt(a); setCustomAmt('') }} style={{ padding: '0.62rem', borderRadius: 11, border: donateAmt === a && !customAmt ? 'none' : '1px solid rgba(255,255,255,0.28)', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', fontWeight: 700, fontSize: '0.85rem', background: donateAmt === a && !customAmt ? 'linear-gradient(135deg,#16a34a,#22c55e)' : 'rgba(255,255,255,0.18)', color: '#fff', transition: 'all 0.2s', boxShadow: donateAmt === a && !customAmt ? '0 4px 18px rgba(22,163,74,0.5)' : 'none' }}>
                  ₹{a.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
            <input type="number" placeholder="Custom amount ₹" value={customAmt} onChange={e => { setCustomAmt(e.target.value); setDonateAmt(Number(e.target.value)) }}
              style={{ width: '100%', padding: '0.65rem 0.9rem', background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.28)', borderRadius: 11, color: '#fff', fontFamily: 'DM Sans,sans-serif', fontSize: '0.85rem', outline: 'none', marginBottom: '0.9rem', boxSizing: 'border-box' }} />
            <Link to="/projects" className="donate-btn" style={{ display: 'block', textAlign: 'center', background: 'linear-gradient(135deg,#16a34a,#4ade80)', color: '#fff', padding: '0.82rem', borderRadius: 12, fontWeight: 700, fontSize: '0.92rem', textDecoration: 'none', boxShadow: '0 8px 25px rgba(22,163,74,0.45)', transition: 'all 0.25s' }}>
              💚 Donate ₹{(Number(customAmt) || donateAmt).toLocaleString('en-IN')}
            </Link>
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.55)', fontSize: '0.68rem', marginTop: '0.6rem' }}>🔒 Secure & Transparent</p>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: '1.8rem', left: '50%', animation: 'bounceY 2s infinite', pointerEvents: 'none' }}>
          <div style={{ width: 1.5, height: 36, background: 'linear-gradient(to bottom,rgba(255,255,255,0.7),transparent)', margin: '0 auto' }} />
        </div>
      </section>

      {/* ════════════ IMPACT STATS ════════════ */}
      <section style={{ padding: '5rem 0', background: '#f0fdf4' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ display: 'inline-block', background: '#dcfce7', color: '#16a34a', fontSize: '0.7rem', fontWeight: 700, padding: '0.28rem 0.9rem', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '0.75rem', border: '1px solid #bbf7d0' }}>Our Impact</div>
            <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: 'clamp(1.8rem,4vw,2.5rem)', color: '#111', marginBottom: '0.4rem' }}>Real Change, Real Numbers</h2>
            <p style={{ color: '#6b7280', maxWidth: 440, margin: '0 auto', fontSize: '0.92rem' }}>Every donation creates measurable impact. Here's what we've achieved together.</p>
          </div>
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.2rem' }}>
            {STATS.map((s, i) => (
              <div key={i} className={`cc${i}`} style={{ background: '#fff', borderRadius: 18, padding: '2rem 1.5rem', border: '1px solid #dcfce7', textAlign: 'center', boxShadow: '0 4px 20px rgba(22,163,74,0.07)', borderTop: '3px solid #16a34a' }}>
                <div style={{ fontSize: '2.2rem', marginBottom: '0.7rem' }}>{s.icon}</div>
                <div style={{ fontFamily: 'Playfair Display,serif', fontSize: '2rem', fontWeight: 700, color: '#16a34a' }}>
                  <AnimatedCounter target={s.val} suffix={s.suffix} />
                </div>
                <div style={{ color: '#6b7280', fontSize: '0.78rem', fontWeight: 600, marginTop: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ URGENT CAMPAIGN ════════════ */}
      <section style={{ background: 'linear-gradient(135deg,#052e16 0%,#14532d 55%,#166534 100%)', padding: '4.5rem 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='0.025'%3E%3Ccircle cx='25' cy='25' r='18'/%3E%3C/g%3E%3C/svg%3E\")", pointerEvents: 'none' }} />
        <div style={{ maxWidth: 980, margin: '0 auto', padding: '0 1.5rem', position: 'relative' }}>
          <div style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 22, padding: 'clamp(1.5rem,4vw,2.8rem)' }}>
            <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 260 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#dc2626', borderRadius: 99, padding: '0.28rem 0.85rem', marginBottom: '1rem' }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff', animation: 'pulse2 1s infinite', display: 'block' }} />
                  <span style={{ color: '#fff', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>🚨 Urgent</span>
                </div>
                <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: 'clamp(1.5rem,3vw,2rem)', color: '#fff', marginBottom: '0.6rem' }}>Emergency Education Fund</h2>
                <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.88rem', lineHeight: 1.75, marginBottom: '1.5rem', maxWidth: 400 }}>
                  500 children in flood-hit Bihar need school supplies, books and uniforms. Help us reach our goal before the school year begins!
                </p>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#4ade80', fontWeight: 700, fontSize: '1.05rem', fontFamily: 'Playfair Display,serif' }}>₹72,500 raised</span>
                    <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.82rem' }}>72% of ₹1,00,000</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 99, height: 9 }}>
                    <div style={{ width: '72%', height: '100%', background: 'linear-gradient(90deg,#22c55e,#4ade80)', borderRadius: 99, boxShadow: '0 0 14px rgba(74,222,128,0.55)', transition: 'width 1.5s' }} />
                  </div>
                </div>
                <Link to="/projects" className="donate-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg,#16a34a,#4ade80)', color: '#fff', padding: '0.85rem 2rem', borderRadius: 99, fontWeight: 700, fontSize: '0.92rem', textDecoration: 'none', boxShadow: '0 8px 30px rgba(22,163,74,0.4)', transition: 'all 0.25s' }}>
                  💚 Donate to This Campaign
                </Link>
              </div>
              <div style={{ textAlign: 'center', minWidth: 200 }}>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.73rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.9rem', fontWeight: 700 }}>⏰ Campaign Ends In</p>
                <Countdown />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ FEATURED CAMPAIGNS ════════════ */}
      <section style={{ padding: '5rem 0', background: '#fff' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.8rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'inline-block', background: '#dcfce7', color: '#16a34a', fontSize: '0.7rem', fontWeight: 700, padding: '0.28rem 0.9rem', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '0.6rem', border: '1px solid #bbf7d0' }}>Active Campaigns</div>
              <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: 'clamp(1.8rem,4vw,2.4rem)', color: '#111', margin: 0 }}>Causes That Need You</h2>
            </div>
            <Link to="/projects" style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none', border: '1.5px solid #16a34a', borderRadius: 99, padding: '0.48rem 1.1rem', transition: 'all 0.2s' }}>View All →</Link>
          </div>
          <div className="campaigns-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1.4rem' }}>
            {projects.slice(0, 6).map((p, i) => <CampaignCard key={p.id} project={p} index={i} />)}
          </div>
        </div>
      </section>

      {/* ════════════ CATEGORIES ════════════ */}
      <section style={{ padding: '4rem 0', background: '#f9fafb' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: 'clamp(1.6rem,3vw,2.1rem)', color: '#111', marginBottom: '0.4rem' }}>Support What You Believe In</h2>
            <p style={{ color: '#6b7280', fontSize: '0.88rem' }}>Browse campaigns by category</p>
          </div>
          <div className="cats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '1rem' }}>
            {CATS.map(c => (
              <Link key={c.n} to={`/projects?category=${c.n}`} style={{ background: '#fff', borderRadius: 14, padding: '1.4rem 0.8rem', textAlign: 'center', textDecoration: 'none', border: '1.5px solid #e5e7eb', transition: 'all 0.25s', display: 'block' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#16a34a'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 35px rgba(22,163,74,0.12)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
                <span style={{ fontSize: '1.9rem', display: 'block', marginBottom: '0.5rem' }}>{c.e}</span>
                <p style={{ fontFamily: 'DM Sans,sans-serif', fontWeight: 700, color: '#111', fontSize: '0.82rem', margin: '0 0 0.18rem' }}>{c.n}</p>
                <p style={{ fontFamily: 'DM Sans,sans-serif', color: '#16a34a', fontSize: '0.68rem', margin: 0, fontWeight: 600 }}>{c.c} active</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ QUICK DONATE CTA ════════════ */}
      <section style={{ padding: '5rem 0', background: '#fff' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ display: 'inline-block', background: '#dcfce7', color: '#16a34a', fontSize: '0.7rem', fontWeight: 700, padding: '0.28rem 0.9rem', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '0.65rem', border: '1px solid #bbf7d0' }}>Quick Donate</div>
            <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: 'clamp(1.8rem,4vw,2.3rem)', color: '#111', marginBottom: '0.4rem' }}>Every Rupee Counts</h2>
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Your donation reaches verified NGOs with complete transparency</p>
          </div>
          <div style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: '1.5px solid #bbf7d0', borderRadius: 22, padding: '2.2rem', boxShadow: '0 20px 60px rgba(22,163,74,0.09)' }}>
            <div className="donate-amts" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.7rem', marginBottom: '1.1rem' }}>
              {AMOUNTS.map(a => (
                <button key={a} onClick={() => { setDonateAmt(a); setCustomAmt('') }} style={{ padding: '0.72rem 0.4rem', borderRadius: 11, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', fontWeight: 700, fontSize: '0.85rem', background: donateAmt === a && !customAmt ? 'linear-gradient(135deg,#16a34a,#15803d)' : '#fff', color: donateAmt === a && !customAmt ? '#fff' : '#374151', border: donateAmt === a && !customAmt ? 'none' : '1.5px solid #d1fae5', transition: 'all 0.2s', boxShadow: donateAmt === a && !customAmt ? '0 6px 20px rgba(22,163,74,0.3)' : 'none' }}>
                  ₹{a.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
            <input type="number" placeholder="Enter custom amount (₹)" value={customAmt} onChange={e => { setCustomAmt(e.target.value); setDonateAmt(Number(e.target.value)) }}
              style={{ width: '100%', padding: '0.82rem 1.1rem', background: '#fff', border: '1.5px solid #bbf7d0', borderRadius: 11, fontFamily: 'DM Sans,sans-serif', fontSize: '0.88rem', color: '#111', outline: 'none', marginBottom: '0.9rem', boxSizing: 'border-box' }} />
            <Link to="/projects" className="donate-btn" style={{ display: 'block', textAlign: 'center', background: 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff', padding: '0.95rem', borderRadius: 13, fontWeight: 700, fontSize: '0.98rem', textDecoration: 'none', boxShadow: '0 8px 28px rgba(22,163,74,0.35)', transition: 'all 0.25s' }}>
              💚 Donate ₹{(Number(customAmt) || donateAmt).toLocaleString('en-IN')} Now
            </Link>
            <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.72rem', marginTop: '0.75rem' }}>🔒 Secure · 📸 Proof Uploaded · ✅ Verified NGOs</p>
          </div>
        </div>
      </section>

      {/* ════════════ HOW IT WORKS ════════════ */}
      <section style={{ padding: '5rem 0', background: '#f0fdf4' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ display: 'inline-block', background: '#dcfce7', color: '#16a34a', fontSize: '0.7rem', fontWeight: 700, padding: '0.28rem 0.9rem', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '0.65rem', border: '1px solid #bbf7d0' }}>Process</div>
            <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: 'clamp(1.8rem,4vw,2.4rem)', color: '#111' }}>Simple, Transparent, Trusted</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1.5rem' }}>
            {[
              { n: '01', i: '🔍', t: 'Browse Campaigns', d: 'Explore verified NGO campaigns. Filter by category, location or cause.' },
              { n: '02', i: '💚', t: 'Donate Securely', d: 'Choose your amount. Every transaction is recorded and fully transparent.' },
              { n: '03', i: '📸', t: 'NGO Takes Action', d: 'Your donations reach verified NGOs who immediately start working.' },
              { n: '04', i: '✅', t: 'See Real Proof', d: 'NGOs upload photos, videos & receipts. Track how your money was used.' },
            ].map((s, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 18, padding: '1.8rem', border: '1px solid #dcfce7', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 18px rgba(22,163,74,0.06)' }}>
                <div style={{ fontFamily: 'Playfair Display,serif', fontSize: '3.8rem', fontWeight: 700, color: '#f0fdf4', position: 'absolute', top: '0.5rem', right: '1.2rem', lineHeight: 1 }}>{s.n}</div>
                <div style={{ fontSize: '2rem', marginBottom: '0.9rem' }}>{s.i}</div>
                <h3 style={{ fontFamily: 'Playfair Display,serif', fontSize: '1.05rem', color: '#111', marginBottom: '0.5rem' }}>{s.t}</h3>
                <p style={{ color: '#6b7280', fontSize: '0.83rem', lineHeight: 1.7, margin: 0 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ SUCCESS STORIES ════════════ */}
      <section style={{ padding: '5rem 0', background: '#fff' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ display: 'inline-block', background: '#dcfce7', color: '#16a34a', fontSize: '0.7rem', fontWeight: 700, padding: '0.28rem 0.9rem', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '0.65rem', border: '1px solid #bbf7d0' }}>Stories</div>
            <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: 'clamp(1.8rem,4vw,2.4rem)', color: '#111', marginBottom: '0.4rem' }}>Real People, Real Impact</h2>
            <p style={{ color: '#6b7280', fontSize: '0.88rem' }}>Lives changed by your generosity</p>
          </div>
          <Stories />
        </div>
      </section>

      {/* ════════════ FINAL CTA ════════════ */}
      <section style={{ background: 'linear-gradient(135deg,#052e16,#14532d)', padding: '5.5rem 0', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 500, background: 'radial-gradient(circle,rgba(74,222,128,0.07),transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 580, margin: '0 auto', padding: '0 1.5rem', position: 'relative' }}>
          <div style={{ fontSize: '2.8rem', marginBottom: '1rem' }}>🌿</div>
          <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: 'clamp(1.9rem,4vw,3rem)', color: '#fff', marginBottom: '1rem' }}>Be the Change You Want to See</h2>
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.98rem', lineHeight: 1.75, marginBottom: '2.5rem' }}>
            Join over 10,000 donors already changing lives across India. Every rupee makes a real difference.
          </p>
          <div className="cta-btns" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="donate-btn" style={{ background: 'linear-gradient(135deg,#16a34a,#4ade80)', color: '#fff', padding: '1rem 2.4rem', borderRadius: 99, fontWeight: 700, fontSize: '0.98rem', textDecoration: 'none', boxShadow: '0 8px 30px rgba(22,163,74,0.4)', transition: 'all 0.25s' }}>Join as Donor 💚</Link>
            <Link to="/projects" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', color: '#fff', padding: '1rem 2.4rem', border: '1px solid rgba(255,255,255,0.28)', borderRadius: 99, fontWeight: 600, fontSize: '0.98rem', textDecoration: 'none', transition: 'all 0.25s' }}>Explore Campaigns →</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
