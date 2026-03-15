import { Link } from 'react-router-dom'
import styles from './About.module.css'

const VALUES = [
  { icon: '🔍', title: 'Full Transparency', desc: 'Every donation is tracked. NGOs upload photos, videos & receipts to prove how funds are used.' },
  { icon: '🌿', title: 'Verified NGOs', desc: 'We partner only with registered and verified NGOs working for sustainable change.' },
  { icon: '💚', title: 'Direct Impact', desc: 'Donations go directly to campaigns with minimal overhead. Maximum impact for every rupee.' },
  { icon: '🏆', title: 'Accountability', desc: 'NGOs must upload proof before withdrawing funds. Donors can track in real-time.' },
  { icon: '🌍', title: 'India-First', desc: 'Built for India, focused on rural development, education, healthcare and environment.' },
  { icon: '🤝', title: 'Community Trust', desc: 'Building a community where donors and NGOs trust each other through transparency.' },
]

export default function About() {
  return (
    <div>
      <div className="page-hdr">
        <h1>🌿 About FundTrust</h1>
        <p>Transparent donations for a better India</p>
      </div>
      <div className="section">
        <div className="container">
          <div className={styles.intro}>
            <div className={styles.introText}>
              <span className="section-tag">Our Story</span>
              <h2 className="section-title">Why FundTrust?</h2>
              <p>India has thousands of NGOs doing incredible work — but donors often don't know if their money truly reached the cause. FundTrust was built to solve this problem.</p>
              <p style={{marginTop:'1rem'}}>We created a platform where every rupee is tracked, every expense has proof, and every donor can see real impact through photos, videos and receipts uploaded by NGOs.</p>
              <Link to="/projects" className="btn btn-primary" style={{marginTop:'1.5rem'}}>Browse Campaigns 🌱</Link>
            </div>
            <div className={styles.introImg}>
              <img src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=500&q=80" alt="Impact" />
            </div>
          </div>
        </div>
      </div>
      <div className="section section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Our Values</span>
            <h2 className="section-title">What We Stand For</h2>
          </div>
          <div className={styles.valuesGrid}>
            {VALUES.map(v => (
              <div key={v.title} className={styles.valueCard}>
                <span className={styles.valueIcon}>{v.icon}</span>
                <h3 className={styles.valueTitle}>{v.title}</h3>
                <p className={styles.valueDesc}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
