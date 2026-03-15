import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import styles from './HeroSection.module.css'

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1600&q=90',
  'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1600&q=90',
  'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1600&q=90',
]

const QUICK_AMOUNTS = [500, 1000, 2500, 5000]

export default function HeroSection({ stats = {} }) {
  const [imgIdx, setImgIdx]     = useState(0)
  const [amount, setAmount]     = useState(1000)
  const [custom, setCustom]     = useState('')
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    setTimeout(() => setAnimated(true), 100)
    const t = setInterval(() => setImgIdx(i => (i + 1) % HERO_IMAGES.length), 5000)
    return () => clearInterval(t)
  }, [])

  const donateAmt = custom ? Number(custom) : amount

  return (
    <section className={styles.hero}>
      {/* Background Images with Ken Burns */}
      {HERO_IMAGES.map((img, i) => (
        <div
          key={img}
          className={`${styles.bgSlide} ${i === imgIdx ? styles.bgActive : ''}`}
          style={{ backgroundImage: `url(${img})` }}
        />
      ))}
      <div className={styles.overlay} />

      {/* Floating particles */}
      <div className={styles.particles}>
        {[...Array(8)].map((_, i) => (
          <span key={i} className={styles.particle} style={{ '--i': i }} />
        ))}
      </div>

      <div className={`container ${styles.content}`}>
        {/* Left — Text */}
        <div className={`${styles.textSide} ${animated ? styles.textIn : ''}`}>
          <div className={styles.tagRow}>
            <span className={styles.tag}>🌿 India's Most Transparent NGO Platform</span>
          </div>
          <h1 className={styles.headline}>
            Together We Can<br />
            <span className={styles.accent}>Change Lives</span>
          </h1>
          <p className={styles.subtext}>
            FundTrust connects compassionate donors with verified NGOs. Every rupee tracked, every impact proven — with real photos, videos and receipts.
          </p>
          <div className={styles.heroBtns}>
            <Link to="/projects" className={styles.btnPrimary}>
              <span>💚</span> Donate Now
            </Link>
            <Link to="/transparency" className={styles.btnGhost}>
              <span>🔍</span> See Impact
            </Link>
          </div>
          {/* Mini stats */}
          <div className={styles.miniStats}>
            {[
              { val: `₹${((stats.total_raised||2600000)/100000).toFixed(1)}L`, lbl: 'Raised' },
              { val: stats.total_donors || '1,200+', lbl: 'Donors' },
              { val: stats.total_projects || '50+', lbl: 'Campaigns' },
            ].map(s => (
              <div key={s.lbl} className={styles.miniStat}>
                <span className={styles.miniVal}>{s.val}</span>
                <span className={styles.miniLbl}>{s.lbl}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Glassmorphism Donate Card */}
        <div className={`${styles.glassCard} ${animated ? styles.cardIn : ''}`}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon}>💚</span>
            <div>
              <h3 className={styles.cardTitle}>Make a Donation</h3>
              <p className={styles.cardSub}>100% transparent impact</p>
            </div>
          </div>

          <div className={styles.amountGrid}>
            {QUICK_AMOUNTS.map(a => (
              <button
                key={a}
                className={`${styles.amtBtn} ${amount === a && !custom ? styles.amtActive : ''}`}
                onClick={() => { setAmount(a); setCustom('') }}
              >
                ₹{a.toLocaleString('en-IN')}
              </button>
            ))}
          </div>

          <div className={styles.customWrap}>
            <span className={styles.rupee}>₹</span>
            <input
              className={styles.customInput}
              type="number"
              placeholder="Custom amount"
              value={custom}
              onChange={e => { setCustom(e.target.value); setAmount(0) }}
            />
          </div>

          <Link
            to={`/projects`}
            className={styles.donateBtn}
          >
            Donate ₹{donateAmt.toLocaleString('en-IN')} Now →
          </Link>

          <div className={styles.secureRow}>
            <span>🔒 100% Secure</span>
            <span>•</span>
            <span>✅ Verified NGOs</span>
            <span>•</span>
            <span>📸 Proof Uploaded</span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className={styles.scrollHint}>
        <span className={styles.scrollDot} />
        <span>Scroll to explore</span>
      </div>
    </section>
  )
}
