import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/')
    setOpen(false)
  }

  const isActive = (path) => location.pathname === path ? styles.active : ''

  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand}>
          <span>🌿</span>
          <span className={styles.brandText}>Fund<span className={styles.accent}>Trust</span></span>
        </Link>

        <button className={styles.hamburger} onClick={() => setOpen(!open)}>
          <span /><span /><span />
        </button>

        <ul className={`${styles.links} ${open ? styles.open : ''}`}>
          <li><Link to="/" className={`${styles.link} ${isActive('/')}`} onClick={() => setOpen(false)}>Home</Link></li>
          <li><Link to="/projects" className={`${styles.link} ${isActive('/projects')}`} onClick={() => setOpen(false)}>Campaigns</Link></li>
          <li><Link to="/transparency" className={`${styles.link} ${isActive('/transparency')}`} onClick={() => setOpen(false)}>Transparency</Link></li>
          <li><Link to="/about" className={`${styles.link} ${isActive('/about')}`} onClick={() => setOpen(false)}>About</Link></li>
          {user ? (
            <>
              <li>
                <Link
                  to={user.role === 'ngo' ? '/ngo/dashboard' : '/donor/dashboard'}
                  className={`${styles.link}`}
                  onClick={() => setOpen(false)}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <button className={`btn btn-outline ${styles.logoutBtn}`} onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/login" className={`${styles.link} ${isActive('/login')}`} onClick={() => setOpen(false)}>Login</Link></li>
              <li><Link to="/register" className="btn btn-primary btn-sm" onClick={() => setOpen(false)}>Register</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  )
}
