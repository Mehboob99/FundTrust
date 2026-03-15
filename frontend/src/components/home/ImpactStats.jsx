import { useState, useEffect, useRef } from 'react'
import styles from './ImpactStats.module.css'

function Counter({ target, prefix = '', suffix = '', duration = 2000 }) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true
        const steps = 60
        const inc = target / steps
        let cur = 0
        const t = setInterval(() => {
          cur += inc
          if (cur >= target) { setVal(target); clearInterval(t) }
          else setVal(Math.floor(cur))
        }, duration / steps)
      }
    }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [target])

  const fmt = (n) => {
    if (n >= 10000000) return (n / 10000000).toFixed(1) + ' Cr'
    if (n >= 100000)   return (n / 100000).toFixed(1) + ' L'
    if (n >= 1000)     return (n / 1000).toFixed(0) + 'K'
    return n.toLocaleString('en-IN')
  }

  return <span ref={ref}>{prefix}{fmt(val)}{suffix}</span>
}

const STATS = [
  { icon: '👥', val: 12000, prefix: '', suffix: '+', label: 'People Helped', sub: 'Lives changed across India' },
  { icon: '💚', val: 2600000, prefix: '₹', suffix: '', label: 'Funds Raised', sub: 'Total donations collected' },
  { icon: '🌿', val: 50,   prefix: '', suffix: '+', label: 'Projects Done', sub: 'Successfully completed' },
  { icon: '🏃', val: 6,    prefix: '', suffix: '',  label: 'Active Campaigns', sub: 'Running right now' },
]

export default function ImpactStats({ stats = {} }) {
  return (
    <section className={styles.section}>
      <div className={styles.bgDecor} />
      <div className="container">
        <div className={styles.header}>
          <span className={styles.tag}>Our Impact</span>
          <h2 className={styles.title}>Real Numbers, Real Change</h2>
          <p className={styles.sub}>Every donation makes a measurable difference in someone's life</p>
        </div>
        <div className={styles.grid}>
          {STATS.map((s, i) => (
            <div key={s.label} className={styles.card} style={{ '--delay': `${i * 0.1}s` }}>
              <div className={styles.iconWrap}>
                <span className={styles.icon}>{s.icon}</span>
                <div className={styles.iconRing} />
              </div>
              <div className={styles.num}>
                <Counter
                  target={s.label === 'Funds Raised' ? (stats.total_raised || s.val) :
                          s.label === 'People Helped' ? (stats.total_donors * 5 || s.val) :
                          s.label === 'Active Campaigns' ? (stats.total_projects || s.val) : s.val}
                  prefix={s.prefix} suffix={s.suffix}
                />
              </div>
              <div className={styles.label}>{s.label}</div>
              <div className={styles.sublabel}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
