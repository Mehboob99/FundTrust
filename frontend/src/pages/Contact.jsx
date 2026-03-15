import { useState } from 'react'
import { toast } from '../components/Toast'
import styles from './Contact.module.css'

export default function Contact() {
  const [form, setForm] = useState({ name:'', email:'', message:'' })
  const f = k => e => setForm({...form, [k]: e.target.value})

  const handle = (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) { toast.error('Fill all fields'); return }
    toast.success('Message sent! We will reply within 24 hours.')
    setForm({ name:'', email:'', message:'' })
  }

  return (
    <div>
      <div className="page-hdr">
        <h1>📞 Contact Us</h1>
        <p>We'd love to hear from you</p>
      </div>
      <div className="section">
        <div className="container">
          <div className={styles.grid}>
            <div>
              <span className="section-tag">Get in Touch</span>
              <h2 className="section-title" style={{marginBottom:'1.5rem'}}>Talk to the FundTrust Team</h2>
              <div className={styles.infoCards}>
                {[
                  { icon:'📧', title:'Email', val:'info@fundtrust.in' },
                  { icon:'📞', title:'Phone', val:'+91 98765 43210' },
                  { icon:'📍', title:'Address', val:'New Delhi, India 110001' },
                  { icon:'⏰', title:'Hours', val:'Mon-Fri, 9AM – 6PM IST' },
                ].map(c => (
                  <div key={c.title} className={styles.infoCard}>
                    <span className={styles.infoIcon}>{c.icon}</span>
                    <div>
                      <p className={styles.infoTitle}>{c.title}</p>
                      <p className={styles.infoVal}>{c.val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.formBox}>
              <h3 className={styles.formTitle}>Send a Message</h3>
              <form onSubmit={handle}>
                <div className="form-group">
                  <label className="form-label">Your Name</label>
                  <input className="form-input" type="text" placeholder="Your full name" value={form.name} onChange={f('name')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={f('email')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea className="form-input" rows={5} placeholder="How can we help?" value={form.message} onChange={f('message')} />
                </div>
                <button type="submit" className="btn btn-primary btn-full btn-lg">Send Message 📤</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
