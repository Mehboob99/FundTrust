import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div>
          <div className={styles.brand}>🌿 FundTrust</div>
          <p className={styles.tagline}>Transparent donations for a greener, better India. Every rupee tracked.</p>
        </div>
        <div>
          <h4 className={styles.col_title}>Quick Links</h4>
          <ul className={styles.col_links}>
            <li><Link to="/projects">Campaigns</Link></li>
            <li><Link to="/transparency">Transparency</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className={styles.col_title}>Account</h4>
          <ul className={styles.col_links}>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register as Donor</Link></li>
            <li><Link to="/register">Register as NGO</Link></li>
          </ul>
        </div>
        <div>
          <h4 className={styles.col_title}>Contact</h4>
          <p className={styles.contact_info}>📧 info@fundtrust.in</p>
          <p className={styles.contact_info}>📞 +91 98765 43210</p>
          <p className={styles.contact_info}>📍 New Delhi, India</p>
        </div>
      </div>
      <div className={styles.bottom}>
        <p>© 2024 FundTrust. Made with 🌿 for India.</p>
      </div>
    </footer>
  )
}
