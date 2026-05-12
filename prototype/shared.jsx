// shared.jsx — design tokens + primitive UI components
const { useState, useEffect, useRef, useCallback } = React;

// ── Mobile hook ────────────────────────────────────────
const useIsMobile = () => {
  const [mob, setMob] = useState(() => window.innerWidth <= 640);
  useEffect(() => {
    const fn = () => setMob(window.innerWidth <= 640);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return mob;
};

const useIsTablet = () => {
  const [tab, setTab] = useState(() => window.innerWidth <= 960);
  useEffect(() => {
    const fn = () => setTab(window.innerWidth <= 960);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return tab;
};

const T = {
  bg0: 'var(--bg0)', bg1: 'var(--bg1)', bg2: 'var(--bg2)', bg3: 'var(--bg3)', bg4: 'var(--bg4)',
  border: 'var(--border)', borderHover: 'var(--border-hover)',
  text0: 'var(--text0)', text1: 'var(--text1)', text2: 'var(--text2)',
  purple: 'var(--accent)', purpleHover: 'var(--accent-hover)',
  purpleFaint: 'var(--accent-faint)', purpleDark: 'var(--accent-dark)',
  green: 'var(--green)', greenFaint: 'var(--green-faint)',
  amber: 'var(--amber)', amberFaint: 'var(--amber-faint)',
  coral: 'var(--coral)', coralFaint: 'var(--coral-faint)',
};

// ── Theme helpers ──────────────────────────────────────
const hexToRgb = hex => {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return [r,g,b];
};
const lighten = (hex, amt) => {
  const [r,g,b] = hexToRgb(hex);
  return `#${[r,g,b].map(v => Math.min(255,v+amt).toString(16).padStart(2,'0')).join('')}`;
};
const applyAccent = (hex) => {
  const [r,g,b] = hexToRgb(hex);
  const root = document.documentElement;
  root.style.setProperty('--accent', hex);
  root.style.setProperty('--accent-hover', lighten(hex, 18));
  root.style.setProperty('--accent-faint', `rgba(${r},${g},${b},0.12)`);
  root.style.setProperty('--accent-dark', `rgba(${r},${g},${b},0.22)`);
};
const applyDark = (dark) => {
  document.documentElement.classList.toggle('light', !dark);
};

// ── Icon SVGs ──────────────────────────────────────────
const Ico = ({ children, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" style={{ flexShrink: 0 }}>
    {children}
  </svg>
);
const IcoDash  = () => <Ico><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/></Ico>;
const IcoPage  = () => <Ico><path d="M3 1h7l3 3v11H3V1zm7 0v3h3"/><line x1="5" y1="7" x2="11" y2="7"/><line x1="5" y1="10" x2="9" y2="10"/></Ico>;
const IcoColl  = () => <Ico><ellipse cx="8" cy="4" rx="6" ry="2"/><path d="M2 4v3c0 1.1 2.7 2 6 2s6-.9 6-2V4"/><path d="M2 7v3c0 1.1 2.7 2 6 2s6-.9 6-2V7"/><path d="M2 10v2c0 1.1 2.7 2 6 2s6-.9 6-2v-2"/></Ico>;
const IcoMedia = () => <Ico><rect x="1" y="2" width="14" height="12" rx="1"/><path d="M1 10l4-4 3 3 2-2 5 5"/><circle cx="11" cy="5" r="1.5"/></Ico>;
const IcoKey   = () => <Ico><circle cx="6" cy="7" r="4"/><circle cx="6" cy="7" r="2"/><path d="M9.4 9.4l5 5M12 12l2-2"/></Ico>;
const IcoGear  = () => <Ico><circle cx="8" cy="8" r="2.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.2 3.2l1.4 1.4M11.4 11.4l1.4 1.4M3.2 12.8l1.4-1.4M11.4 4.6l1.4-1.4"/></Ico>;

// ── Badge ──────────────────────────────────────────────
const Badge = ({ type = 'default', children, dot }) => {
  const map = {
    published: { bg: T.greenFaint,  color: T.green },
    draft:     { bg: T.amberFaint,  color: T.amber },
    scheduled: { bg: T.purpleFaint, color: T.purple },
    error:     { bg: T.coralFaint,  color: T.coral },
    active:    { bg: T.greenFaint,  color: T.green },
    inactive:  { bg: T.bg3,         color: T.text1 },
    rw:        { bg: T.purpleFaint, color: T.purple },
    ro:        { bg: T.bg3,         color: T.text1 },
    default:   { bg: T.bg3,         color: T.text1 },
  };
  const c = map[type] || map.default;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: c.bg, color: c.color, fontSize: 10, padding: '2px 7px', borderRadius: 3, fontFamily: 'Geist Mono, monospace', lineHeight: 1.6, whiteSpace: 'nowrap' }}>
      {dot && <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.color, flexShrink: 0 }} />}
      {children}
    </span>
  );
};

// ── Toggle ─────────────────────────────────────────────
const Toggle = ({ value, onChange, disabled }) => (
  <div onClick={() => !disabled && onChange(!value)}
    style={{ width: 34, height: 19, borderRadius: 10, background: value ? T.purple : T.bg4, border: `1px solid ${value ? T.purple : T.border}`, cursor: disabled ? 'not-allowed' : 'pointer', position: 'relative', transition: 'all 0.2s', flexShrink: 0 }}>
    <div style={{ width: 13, height: 13, borderRadius: '50%', background: value ? '#fff' : T.text2, position: 'absolute', top: 2, left: value ? 17 : 2, transition: 'left 0.18s, background 0.2s' }} />
  </div>
);

// ── Btn ────────────────────────────────────────────────
const Btn = ({ children, variant = 'default', size = 'md', onClick, disabled, style: sx }) => {
  const [hov, setHov] = useState(false);
  const v = { primary: { bg: hov ? T.purpleHover : T.purple, color: '#fff', border: 'none' }, default: { bg: hov ? T.bg4 : T.bg3, color: T.text0, border: `1px solid ${T.border}` }, ghost: { bg: hov ? T.bg3 : 'transparent', color: hov ? T.text0 : T.text1, border: 'none' }, danger: { bg: hov ? 'rgba(240,107,107,0.18)' : T.coralFaint, color: T.coral, border: `1px solid rgba(240,107,107,0.25)` } }[variant] || {};
  const pad = { sm: '3px 9px', md: '5px 13px', lg: '9px 20px' }[size];
  return (
    <button onClick={onClick} disabled={disabled} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: v.bg, color: v.color, border: v.border, borderRadius: 4, padding: pad, cursor: disabled ? 'not-allowed' : 'pointer', fontSize: 11, transition: 'all 0.15s', opacity: disabled ? 0.4 : 1, display: 'inline-flex', alignItems: 'center', gap: 5, ...sx }}>
      {children}
    </button>
  );
};

// ── Input ──────────────────────────────────────────────
const Input = ({ value, onChange, placeholder, style: sx, type = 'text', rows }) => {
  const base = { background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 4, padding: '6px 10px', color: T.text0, fontSize: 11, outline: 'none', width: '100%' };
  if (rows) return <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{ ...base, resize: 'vertical', ...sx }} />;
  return <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ ...base, ...sx }} />;
};

// ── Select ─────────────────────────────────────────────
const Select = ({ value, onChange, options, style: sx }) => (
  <select value={value} onChange={e => onChange(e.target.value)}
    style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 4, padding: '6px 10px', color: T.text0, fontSize: 11, outline: 'none', width: '100%', cursor: 'pointer', ...sx }}>
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

// ── Modal ──────────────────────────────────────────────
const Modal = ({ open, onClose, title, children, width = 420 }) => {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 8, width, maxWidth: '90vw', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
          <span style={{ fontSize: 12, color: T.text0 }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: T.text1, cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '0 2px' }}>×</button>
        </div>
        <div style={{ padding: 16, overflowY: 'auto' }}>{children}</div>
      </div>
    </div>
  );
};

// ── Sidebar ────────────────────────────────────────────
const NAV = [
  { id: 'dashboard',   label: 'Dashboard',     Icon: IcoDash  },
  { id: 'pages',       label: 'Pages',         Icon: IcoPage  },
  { id: 'collections', label: 'Collections',   Icon: IcoColl  },
  { id: 'media',       label: 'Media Library', Icon: IcoMedia },
  { id: 'apikeys',     label: 'API Keys',      Icon: IcoKey   },
];

const Sidebar = ({ active, onNav, counts, onLogout }) => {
  const isMobile = useIsMobile();
  const [hov, setHov] = useState(null);
  const ALL_NAV = [...NAV, { id: 'settings', label: 'Settings', Icon: IcoGear }];

  // ── Mobile: bottom tab bar ─────────────────────────
  if (isMobile) {
    return (
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 56, background: T.bg0, borderTop: `1px solid ${T.border}`, display: 'flex', zIndex: 200, paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {ALL_NAV.map(({ id, label, Icon }) => {
          const on = active === id;
          return (
            <button key={id} onClick={() => onNav(id)}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, background: 'none', border: 'none', color: on ? T.purple : T.text2, cursor: 'pointer', fontSize: 9, padding: '8px 0', borderTop: `2px solid ${on ? T.purple : 'transparent'}`, transition: 'color 0.13s' }}>
              <Icon size={16} />
              <span style={{ fontSize: 9, lineHeight: 1 }}>{label.split(' ')[0]}</span>
            </button>
          );
        })}
        {onLogout && (
          <button onClick={onLogout}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, background: 'none', border: 'none', color: T.text2, cursor: 'pointer', fontSize: 9, padding: '8px 0', borderTop: '2px solid transparent' }}>
            <svg width={14} height={14} viewBox="0 0 16 16" fill="currentColor">
              <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6"/>
            </svg>
            <span style={{ fontSize: 9, lineHeight: 1 }}>Exit</span>
          </button>
        )}
      </div>
    );
  }

  // ── Desktop: left sidebar ──────────────────────────
  return (
    <div style={{ width: 180, minHeight: '100vh', background: T.bg0, borderRight: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      <div style={{ padding: '13px 14px 11px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 22, height: 22, background: T.purple, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', fontWeight: 700, flexShrink: 0 }}>q</div>
        <div>
          <div style={{ fontFamily: 'Instrument Serif', fontStyle: 'italic', fontSize: 15, color: T.text0, lineHeight: 1 }}>qqCMS</div>
          <div style={{ fontSize: 9, color: T.text2, marginTop: 1 }}>v0.1.0</div>
        </div>
      </div>
      <nav style={{ flex: 1, padding: '6px 0' }}>
        {NAV.map(({ id, label, Icon }) => {
          const on = active === id, h = hov === id;
          return (
            <button key={id} onClick={() => onNav(id)}
              onMouseEnter={() => setHov(id)} onMouseLeave={() => setHov(null)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', background: on ? T.purpleFaint : h ? 'rgba(255,255,255,0.025)' : 'transparent', border: 'none', borderLeft: `2px solid ${on ? T.purple : 'transparent'}`, color: on ? T.purple : h ? T.text0 : T.text1, cursor: 'pointer', fontSize: 11, transition: 'all 0.13s', textAlign: 'left' }}>
              <Icon />
              <span style={{ flex: 1 }}>{label}</span>
              {counts && counts[id] ? <span style={{ fontSize: 9, color: on ? T.purple : T.text2, background: T.bg3, padding: '1px 5px', borderRadius: 3 }}>{counts[id]}</span> : null}
            </button>
          );
        })}
      </nav>
      <div style={{ borderTop: `1px solid ${T.border}`, padding: '6px 0' }}>
        {(() => { const on = active === 'settings'; return (
          <button onClick={() => onNav('settings')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', background: on ? T.purpleFaint : 'transparent', border: 'none', borderLeft: `2px solid ${on ? T.purple : 'transparent'}`, color: on ? T.purple : T.text1, cursor: 'pointer', fontSize: 11 }}>
            <IcoGear /><span>Settings</span>
          </button>
        ); })()}
        {onLogout && (
          <button onClick={onLogout}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', background: 'transparent', border: 'none', borderLeft: '2px solid transparent', color: T.text2, cursor: 'pointer', fontSize: 11, transition: 'color 0.13s' }}
            onMouseEnter={e => { e.currentTarget.style.color = T.coral; }}
            onMouseLeave={e => { e.currentTarget.style.color = T.text2; }}>
            <svg width={14} height={14} viewBox="0 0 16 16" fill="currentColor" style={{ flexShrink: 0 }}>
              <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6"/>
            </svg>
            <span>Log out</span>
          </button>
        )}
      </div>
    </div>
  );
};

// ── TopBar ─────────────────────────────────────────────
const TopBar = ({ title, badge, actions, right }) => {
  const isMobile = useIsMobile();
  return (
    <div style={{ height: 44, background: T.bg0, borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', padding: `0 ${isMobile ? 12 : 18}px`, gap: isMobile ? 6 : 10, flexShrink: 0 }}>
      {typeof title === 'string'
        ? <span style={{ fontFamily: 'Instrument Serif', fontStyle: 'italic', fontSize: isMobile ? 17 : 20, color: T.text0, lineHeight: 1 }}>{title}</span>
        : title}
      {badge !== undefined && !isMobile && <span style={{ background: T.bg3, color: T.text1, fontSize: 10, padding: '1px 6px', borderRadius: 3 }}>{badge}</span>}
      {actions && !isMobile && <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginLeft: 4 }}>{actions}</div>}
      <div style={{ flex: 1 }} />
      {right && <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>{right}</div>}
    </div>
  );
};

// ── FormRow — stacks on mobile ─────────────────────────
const FormRow = ({ label, hint, children }) => {
  const isMobile = useIsMobile();
  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'flex-start', gap: isMobile ? 6 : 20, padding: '14px 0', borderBottom: `1px solid ${T.border}` }}>
      <div style={{ width: isMobile ? '100%' : 200, flexShrink: 0 }}>
        <div style={{ fontSize: 11, color: T.text0, marginBottom: 3 }}>{label}</div>
        {hint && !isMobile && <div style={{ fontSize: 10, color: T.text2, lineHeight: 1.5 }}>{hint}</div>}
      </div>
      <div style={{ flex: 1, width: '100%' }}>{children}</div>
    </div>
  );
};

// ── Card ───────────────────────────────────────────────
const Card = ({ title, children, style: sx }) => (
  <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 6, overflow: 'hidden', ...sx }}>
    {title && <div style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}`, fontSize: 11, color: T.text0 }}>{title}</div>}
    {children}
  </div>
);

Object.assign(window, { T, Badge, Toggle, Btn, Input, Select, Modal, Sidebar, TopBar, FormRow, Card, useIsMobile, useIsTablet, applyAccent, applyDark });
