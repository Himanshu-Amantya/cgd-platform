import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../lib/icons.jsx'

const NAV_LINKS = [
  { label: 'Home', href: '#' },
  { label: 'Services', href: '#services' },
  { label: 'How It Works', href: '#how' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
]

const STEPS = [
  { num: '01', title: 'Apply Online', desc: 'Submit your application through the MyPNG national portal with Aadhaar eKYC.', icon: 'file' },
  { num: '02', title: 'Verify & Pay', desc: 'Documents verified by our team. Pay the security deposit securely online.', icon: 'shield' },
  { num: '03', title: 'Get Connected', desc: 'Our engineers install the pipeline and meter. Start using clean PNG gas.', icon: 'flame' },
]

const SERVICES = [
  { icon: 'leaf', title: 'Domestic PNG', desc: 'Safe, 24/7 piped natural gas supply directly to your kitchen. No more cylinder hassles.', tone: 'green' },
  { icon: 'flame', title: 'Commercial & Industrial', desc: 'Reliable bulk gas supply for restaurants, hotels, hospitals and manufacturing units.', tone: 'blue' },
  { icon: 'card', title: 'Online Bill Payment', desc: 'Pay your gas bills instantly via UPI, cards, net banking or NEFT — anytime, anywhere.', tone: 'purple' },
  { icon: 'gauge', title: 'Smart Metering', desc: 'Real-time consumption tracking with smart meters for accurate, transparent billing.', tone: 'amber' },
]

export default function Launchpad() {
  const nav = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!mobileMenu) return
    const close = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMobileMenu(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [mobileMenu])

  const scrollTo = (href) => {
    setMobileMenu(false)
    if (href === '#') return window.scrollTo({ top: 0, behavior: 'smooth' })
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="lp">
      {/* Top strip */}
      <div className="lp-strip">
        <div className="lp-container lp-strip-inner">
          <span><Icon name="phone" size={12} /> Toll-free: 1800-XXX-XXXX</span>
          <span className="lp-strip-sep" />
          <span><Icon name="clock" size={12} /> Mon-Sat, 9 AM - 6 PM</span>
          <a className="lp-strip-link" onClick={() => nav('/officer')}>Staff Login</a>
        </div>
      </div>

      {/* Navbar */}
      <nav className={'lp-nav' + (scrolled ? ' scrolled' : '')}>
        <div className="lp-container lp-nav-inner">
          <div className="lp-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="lp-logo"><Icon name="leaf" size={20} style={{ color: '#fff' }} /></div>
            <div>
              <span className="lp-brand-name">Gas<b>onet</b></span>
              <span className="lp-brand-tag">City Gas Distribution</span>
            </div>
          </div>
          <div className={'lp-links' + (mobileMenu ? ' open' : '')} ref={menuRef}>
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href} className="lp-link"
                onClick={(e) => { e.preventDefault(); scrollTo(l.href) }}>
                {l.label}
              </a>
            ))}
            <button className="btn btn-green btn-sm lp-nav-cta" onClick={() => nav('/customer')}>
              Customer Login
            </button>
          </div>
          {mobileMenu && <div className="lp-menu-backdrop" onClick={() => setMobileMenu(false)} />}
          <button className="lp-hamburger" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle menu">
            <Icon name={mobileMenu ? 'x' : 'menu'} size={20} />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="lp-hero">
        <div className="lp-hero-inner lp-container">
          <div className="lp-hero-content">
            <div className="lp-hero-badge"><Icon name="flame" size={12} /> PNGRB Licensed &middot; Bikaner & Churu GA</div>
            <h1>Clean Piped Gas,<br />Delivered to Your<br /><span>Doorstep.</span></h1>
            <p>Apply for a new PNG connection, pay bills, and track everything online — integrated with the MyPNG national portal.</p>
            <div className="lp-hero-actions">
              <button className="lp-btn-primary" onClick={() => nav('/customer/onboarding')}>
                Apply for New Connection <Icon name="arrowR" size={16} />
              </button>
              <button className="lp-btn-ghost" onClick={() => scrollTo('#how')}>
                How It Works <Icon name="chev" size={14} />
              </button>
            </div>
            <div className="lp-hero-trust">
              {['PNGRB Licensed', 'ISO 9001:2015', 'Govt. of India'].map((t) => (
                <span key={t}><Icon name="check" size={12} /> {t}</span>
              ))}
            </div>
          </div>
          <div className="lp-hero-right">
            <div className="lp-hero-stats">
              {[
                { v: '2.8L+', l: 'Active Connections', ic: 'flame', t: 'green' },
                { v: '150+', l: 'CNG Stations', ic: 'pin', t: 'blue' },
                { v: '40%', l: 'Savings vs LPG', ic: 'trend', t: 'purple' },
                { v: '99.9%', l: 'Uptime SLA', ic: 'shield', t: 'amber' },
              ].map((s) => (
                <div key={s.l} className="lp-hero-stat">
                  <div className={'lp-hero-stat-ic ic-' + s.t}><Icon name={s.ic} size={18} /></div>
                  <div className="lp-hero-stat-v">{s.v}</div>
                  <div className="lp-hero-stat-l">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="lp-how" id="how">
        <div className="lp-container">
          <div className="lp-sec-label">How It Works</div>
          <h2 className="lp-sec-title">Three Simple Steps to<br />Get Connected</h2>
          <div className="lp-steps">
            {STEPS.map((s, i) => (
              <div key={s.num} className="lp-step">
                <div className="lp-step-num">{s.num}</div>
                <div className="lp-step-ic"><Icon name={s.icon} size={24} /></div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                {i < STEPS.length - 1 && <div className="lp-step-connector" />}
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <button className="lp-btn-primary" onClick={() => nav('/customer')}>
              Apply Now <Icon name="arrowR" size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="lp-services" id="services">
        <div className="lp-container">
          <div className="lp-sec-label">Our Services</div>
          <h2 className="lp-sec-title">What We Offer</h2>
          <div className="lp-svc-grid">
            {SERVICES.map((s) => (
              <div key={s.title} className="lp-svc-card">
                <div className={'lp-svc-ic ic-' + s.tone}><Icon name={s.icon} size={22} /></div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="lp-about" id="about">
        <div className="lp-container">
          <div className="lp-about-grid">
            <div className="lp-about-text">
              <div className="lp-sec-label">About Gasonet</div>
              <h2>Building Rajasthan's Cleanest Gas Network</h2>
              <p>Gasonet Services (RJ) Ltd. is a PNGRB-licensed City Gas Distribution entity serving Bikaner and Churu in Rajasthan. We deliver safe, reliable and affordable piped natural gas to homes and businesses.</p>
              <div className="lp-about-feats">
                {[
                  'PNGRB Licensed Entity',
                  'ISO 9001:2015 Certified',
                  'Bikaner & Churu GA',
                  '24/7 Emergency Response',
                ].map((f) => (
                  <div key={f} className="lp-about-feat">
                    <Icon name="check" size={14} /> {f}
                  </div>
                ))}
              </div>
            </div>
            <div className="lp-about-highlights">
              {[
                { ic: 'leaf', t: 'green', title: 'Clean Energy', desc: 'PNG reduces carbon emissions by 30% vs LPG' },
                { ic: 'shield', t: 'blue', title: 'Safe & Reliable', desc: '24/7 SCADA monitoring and leak detection' },
                { ic: 'rupee', t: 'amber', title: 'Cost Effective', desc: 'Save up to 40% on fuel costs vs LPG cylinders' },
              ].map((h) => (
                <div key={h.title} className="lp-about-hl">
                  <div className={'lp-about-hl-ic ic-' + h.t}><Icon name={h.ic} size={20} /></div>
                  <div>
                    <div className="lp-about-hl-t">{h.title}</div>
                    <div className="lp-about-hl-d">{h.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Portals */}
      <section className="lp-portals">
        <div className="lp-container">
          <div className="lp-sec-label lp-sec-label-dark">Access Portals</div>
          <h2 className="lp-sec-title" style={{ color: '#fff' }}>Choose Your Portal</h2>
          <div className="lp-portal-grid">
            {[
              { to: '/customer', icon: 'leaf', tone: 'green', name: 'Customer Portal', who: 'Consumers', desc: 'Apply for PNG, pay bills, track applications and manage your account.' },
              { to: '/mypng', icon: 'flame', tone: 'blue', name: 'MyPNG Portal', who: 'Onboarding', desc: 'PNGRB national portal for eKYC, address verification and application submission.' },
              { to: '/officer', icon: 'shield', tone: 'purple', name: 'Staff Console', who: 'Gasonet Staff', desc: 'Review applications, manage customers, meters, billing and operations.' },
            ].map((p) => (
              <div key={p.to} className="lp-portal-card" onClick={() => nav(p.to)}>
                <div className={'lp-portal-ic ic-' + p.tone}><Icon name={p.icon} size={24} /></div>
                <div className="lp-portal-who">{p.who}</div>
                <h3>{p.name}</h3>
                <p>{p.desc}</p>
                <span className="lp-portal-link">Open <Icon name="arrowR" size={14} /></span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="lp-footer" id="contact">
        <div className="lp-container">
          <div className="lp-footer-top">
            <div className="lp-footer-brand">
              <div className="lp-footer-logo">
                <div className="lp-logo lp-logo-sm"><Icon name="leaf" size={16} style={{ color: '#fff' }} /></div>
                <span className="lp-footer-name">Gas<b>onet</b></span>
              </div>
              <p>Gasonet Services (RJ) Ltd.<br />PNGRB Licensed CGD Entity<br />Bikaner & Churu GA, Rajasthan</p>
            </div>
            <div className="lp-footer-col">
              <h4>Portals</h4>
              <a onClick={() => nav('/customer')}>Customer Portal</a>
              <a onClick={() => nav('/mypng')}>MyPNG Portal</a>
              <a onClick={() => nav('/officer')}>Staff Console</a>
            </div>
            <div className="lp-footer-col">
              <h4>Company</h4>
              <a href="#">Refund Policy</a>
              <a href="#">Tenders</a>
              <a href="#">Public Awareness</a>
              <a href="#">Careers</a>
            </div>
            <div className="lp-footer-col">
              <h4>Support</h4>
              <a href="#">Help Desk</a>
              <a href="#">Emergency: 1800-XXX-XXXX</a>
              <a href="#">Dealership</a>
              <a href="#">HSE</a>
            </div>
          </div>
          <div className="lp-footer-bottom">
            <span>&copy; 2026 Gasonet Services (RJ) Ltd.</span>
            <span>Built by Amantya</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
