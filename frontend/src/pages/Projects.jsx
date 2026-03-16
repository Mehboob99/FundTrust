import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import CampaignCard from '../components/CampaignCard'
import styles from './Projects.module.css'

const CATS = ['All','Education','Healthcare','Food & Nutrition','Water & Sanitation','Women Empowerment','Disaster Relief']

export default function Projects() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const cat = searchParams.get('category') || 'All'

  const fetchProjects = () => {
    setLoading(true)
    const params = {}
    if (cat && cat !== 'All') params.category = cat
    if (search) params.search = search
    axios.get('https://fundtrust.onrender.com/api/projects', { params })
      .then(r => setProjects(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchProjects() }, [cat])

  const setCat = (c) => {
    if (c === 'All') setSearchParams({})
    else setSearchParams({ category: c })
  }

  return (
    <div>
      <div className="page-hdr">
        <h1>🌱 All Campaigns</h1>
        <p>Support verified causes across India</p>
      </div>
      <div className="section">
        <div className="container">
          {/* Search + Filter */}
          <div className={styles.toolbar}>
            <div className={styles.searchBox}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                className={styles.searchInput}
                type="text"
                placeholder="Search campaigns..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchProjects()}
              />
              <button className="btn btn-primary btn-sm" onClick={fetchProjects}>Search</button>
            </div>
          </div>
          <div className={styles.cats}>
            {CATS.map(c => (
              <button
                key={c}
                className={`${styles.catBtn} ${(cat === c || (c === 'All' && !cat)) ? styles.catActive : ''}`}
                onClick={() => setCat(c)}
              >{c}</button>
            ))}
          </div>

          {loading ? (
            <div className="loading-wrap"><div className="spinner" /></div>
          ) : projects.length === 0 ? (
            <div className="empty">
              <span className="empty-icon">🌿</span>
              <h3>No campaigns found</h3>
              <p>Try a different category or search term</p>
            </div>
          ) : (
            <>
              <p className={styles.count}>{projects.length} campaign{projects.length !== 1 ? 's' : ''} found</p>
              <div className={styles.grid}>
                {projects.map(p => <CampaignCard key={p.id} project={p} />)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
