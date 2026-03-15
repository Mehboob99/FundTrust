import { Link } from 'react-router-dom'
import styles from './CampaignCard.module.css'

export default function CampaignCard({ project }) {
  const pct = Math.min(100, Math.round((project.amount_raised / project.goal_amount) * 100))
  return (
    <div className={`card ${styles.card}`}>
      <div className={styles.imgWrap}>
        <img src={project.image_url || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&q=80'} alt={project.title} className={styles.img} />
        <span className={`badge badge-green ${styles.cat}`}>{project.category}</span>
      </div>
      <div className={styles.body}>
        <p className={styles.ngo}>🌿 {project.ngo_name}</p>
        <h3 className={styles.title}>{project.title}</h3>
        <p className={styles.loc}>📍 {project.location}</p>
        <div className={styles.prog}>
          <div className="prog-track">
            <div className="prog-bar" style={{ width: `${pct}%` }} />
          </div>
          <div className={styles.progInfo}>
            <span className={styles.raised}>₹{Number(project.amount_raised).toLocaleString('en-IN')}</span>
            <span className={styles.pct}>{pct}%</span>
          </div>
          <p className={styles.goal}>of ₹{Number(project.goal_amount).toLocaleString('en-IN')} goal</p>
        </div>
        <div className={styles.footer}>
          <span className={styles.donors}>👥 {project.donor_count || 0} donors</span>
          <Link to={`/project/${project.id}`} className="btn btn-primary btn-sm">Donate Now</Link>
        </div>
      </div>
    </div>
  )
}
