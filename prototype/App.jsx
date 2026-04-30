// App.jsx — Dashboard, Media Library, Settings, API Keys, root App
const { useState, useEffect } = React;

// ── DATA ──────────────────────────────────────────────
const INIT_MEDIA = [
  { id:1,  name:'hero-banner.jpg',  type:'JPG', size:'1.2 MB', dims:'1920×1080', uploaded:'Mar 14, 2025', usedIn:2  },
  { id:2,  name:'logo-white.svg',   type:'SVG', size:'45 KB',  dims:null,        uploaded:'Mar 10, 2025', usedIn:0  },
  { id:3,  name:'q1-report.pdf',    type:'PDF', size:'3.4 MB', dims:null,        uploaded:'Mar 8, 2025',  usedIn:0  },
  { id:4,  name:'avatar-01.jpg',    type:'JPG', size:'210 KB', dims:'400×400',   uploaded:'Mar 6, 2025',  usedIn:1  },
  { id:5,  name:'bg-pattern.png',   type:'PNG', size:'1.1 MB', dims:'800×800',   uploaded:'Mar 4, 2025',  usedIn:3  },
  { id:6,  name:'IMG_9921.jpg',     type:'JPG', size:'4.2 MB', dims:'3024×4032', uploaded:'Mar 1, 2025',  usedIn:0  },
  { id:7,  name:'IMG_9922.jpg',     type:'JPG', size:'3.8 MB', dims:'3024×4032', uploaded:'Feb 28, 2025', usedIn:0  },
  { id:8,  name:'invoice-jan.pdf',  type:'PDF', size:'880 KB', dims:null,        uploaded:'Feb 25, 2025', usedIn:0  },
  { id:9,  name:'data-export.csv',  type:'CSV', size:'12 KB',  dims:null,        uploaded:'Feb 20, 2025', usedIn:0  },
  { id:10, name:'unknown_file',     type:'???', size:'0 B',    dims:null,        uploaded:'Feb 18, 2025', usedIn:0  },
  { id:11, name:'team-photo.jpg',   type:'JPG', size:'5.5 MB', dims:'2400×1600', uploaded:'Feb 15, 2025', usedIn:1  },
  { id:12, name:'diagram.png',      type:'PNG', size:'340 KB', dims:'1200×800',  uploaded:'Feb 10, 2025', usedIn:0  },
];
const INIT_API_KEYS = [
  { id:1, name:'Production Key',  key:'sk_live_••••••••', permissions:'rw', created:'Apr 15, 2026' },
  { id:2, name:'Development Key', key:'sk_test_••••••••', permissions:'ro', created:'Apr 10, 2026' },
];
const INIT_SETTINGS = {
  projectName:'My qqCMS Project', adminUrl:'https://admin.example.com',
  darkMode:true, compactSidebar:false,
  apiUrl:'https://api.example.com', contentApiKey:'ck_••••••••••••',
  locales:[
    { code:'en', label:'English',  isDefault:true  },
    { code:'et', label:'Estonian', isDefault:false },
    { code:'ru', label:'Russian',  isDefault:false },
  ],
  prefixDefaultLocale:false,
};

const typeColor = { JPG:T.purple, PNG:T.purple, SVG:T.green, PDF:T.coral, CSV:T.amber };
const typeIcon  = t => ({ JPG:'▣', PNG:'▣', SVG:'◈', PDF:'⊟', CSV:'≡' }[t] || '?');
const mimeFilter = {
  All: ()=>true,
  Images: m=>['JPG','PNG','SVG'].includes(m.type),
  Video:  m=>m.type==='MP4',
  Documents: m=>['PDF','CSV'].includes(m.type),
};

// ══════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════
const DashboardPage = ({ onNav }) => {
  const isMobile = useIsMobile();
  const activity = [
    { icon:'✎', text:"You updated 'Homepage'",          time:'10 mins ago' },
    { icon:'▣', text:"Max uploaded 'hero_bg.jpg'",      time:'Yesterday'   },
    { icon:'◈', text:"New collection 'products' added", time:'2 days ago'  },
    { icon:'⚷', text:"API key regenerated",              time:'3 days ago'  },
  ];
  const quickLinks = ["Drafts (3)", "Review 'Products' Schema"];
  const stats = [
    { label:'Total Pages', value:24,  icon:'◻', color:T.purple, nav:'pages'       },
    { label:'Collections', value:8,   icon:'≡', color:T.green,  nav:'collections'  },
    { label:'Media Items', value:152, icon:'▣', color:T.amber,  nav:'media'        },
  ];
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <TopBar title="Dashboard" />
      <div style={{ flex:1, overflowY:'auto', background:T.bg1, padding: isMobile ? '14px 12px' : 24 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap: isMobile ? 8 : 12, marginBottom: isMobile ? 14 : 24 }}>
          {stats.map(s => (
            <div key={s.label} onClick={() => onNav(s.nav)}
              style={{ background:T.bg2, border:`1px solid ${T.border}`, borderRadius:8, padding: isMobile ? '12px 10px' : '20px 18px', cursor:'pointer' }}>
              <div style={{ fontSize: isMobile ? 14 : 18, color:s.color, marginBottom: isMobile ? 5 : 8, opacity:0.7 }}>{s.icon}</div>
              <div style={{ fontFamily:'Instrument Serif', fontStyle:'italic', fontSize: isMobile ? 26 : 34, color:s.color, lineHeight:1, marginBottom:4 }}>{s.value}</div>
              <div style={{ fontSize: isMobile ? 9 : 11, color:T.text1, lineHeight:1.3 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 10 : 16 }}>
          <div style={{ background:T.bg2, border:`1px solid ${T.border}`, borderRadius:8, overflow:'hidden' }}>
            <div style={{ padding:'11px 16px', borderBottom:`1px solid ${T.border}`, fontSize:11, color:T.text0 }}>Recent Activity</div>
            {activity.map((a, i) => (
              <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'10px 16px', borderBottom: i < activity.length-1 ? `1px solid ${T.border}` : 'none' }}>
                <span style={{ fontSize:14, color:T.text2, flexShrink:0 }}>{a.icon}</span>
                <div><div style={{ fontSize:11, color:T.text0, marginBottom:2 }}>{a.text}</div><div style={{ fontSize:10, color:T.text2 }}>{a.time}</div></div>
              </div>
            ))}
          </div>
          <div style={{ background:T.bg2, border:`1px solid ${T.border}`, borderRadius:8, overflow:'hidden' }}>
            <div style={{ padding:'11px 16px', borderBottom:`1px solid ${T.border}`, fontSize:11, color:T.text0 }}>Quick Links</div>
            <div style={{ padding:14, display:'flex', flexDirection:'column', gap:8 }}>
              {quickLinks.map((l,i) => (
                <button key={i} style={{ background:T.bg3, border:`1px solid ${T.border}`, borderRadius:5, padding:'10px 14px', color:T.text0, cursor:'pointer', fontSize:11, textAlign:'left' }}>{l}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════
// MEDIA LIBRARY
// ══════════════════════════════════════════════════════
const MediaPage = () => {
  const isMobile = useIsMobile();
  const [media, setMedia]         = useState(INIT_MEDIA);
  const [filter, setFilter]       = useState('All');
  const [search, setSearch]       = useState('');
  const [viewMode, setViewMode]   = useState('grid');
  const [selected, setSelected]   = useState(null);
  const [uploadModal, setUploadModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [drag, setDrag]           = useState(false);
  const [uploading, setUploading] = useState([]);

  const visible = media
    .filter(mimeFilter[filter] || (()=>true))
    .filter(m => !search || m.name.toLowerCase().includes(search.toLowerCase()));

  const sel = media.find(m => m.id === selected);

  const doUpload = () => {
    const items = [{ name:'product-photo.jpg', progress:0 }, { name:'brand-assets.svg', progress:0 }];
    setUploading(items); setUploadModal(false);
    let p = 0;
    const iv = setInterval(() => {
      p += 12;
      setUploading(prev => prev.map(u => ({ ...u, progress: Math.min(p + Math.random()*15, 100) })));
      if (p >= 100) {
        clearInterval(iv);
        setTimeout(() => {
          setUploading([]);
          const newId = Math.max(...media.map(m=>m.id)) + 1;
          setMedia(prev => [{ id:newId, name:'uploaded-file.jpg', type:'JPG', size:'2.4 MB', dims:'1920×1080', uploaded:'19 Apr 2026', usedIn:0 }, ...prev]);
        }, 600);
      }
    }, 180);
  };

  const selectFile = (id) => {
    const next = id === selected ? null : id;
    setSelected(next);
    if (isMobile && next) setDetailModal(true);
  };

  const DetailContent = ({ file }) => !file ? null : (
    <div>
      <div style={{ background:T.bg3, borderRadius:5, aspectRatio:'4/3', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14, border:`1px solid ${T.border}` }}>
        <span style={{ fontSize:40, color: typeColor[file.type]||T.text2, opacity:0.4 }}>{typeIcon(file.type)}</span>
      </div>
      {[['Type',file.type],['Size',file.size],['Dimensions',file.dims||'—'],['Uploaded',file.uploaded],['Used in', file.usedIn ? `${file.usedIn} pages` : 'Not used']].map(([k,v])=>(
        <div key={k} style={{ marginBottom:10 }}>
          <div style={{ fontSize:10, color:T.text2, marginBottom:2 }}>{k}</div>
          <div style={{ fontSize:11, color: k==='Used in'&&file.usedIn ? T.purple : T.text0 }}>{v}</div>
        </div>
      ))}
      <div style={{ marginBottom:10 }}>
        <div style={{ fontSize:10, color:T.text2, marginBottom:5 }}>ALT TEXT</div>
        <textarea placeholder="Describe this image…" rows={3}
          style={{ width:'100%', background:T.bg2, border:`1px solid ${T.border}`, borderRadius:4, padding:'6px 8px', color:T.text0, fontSize:11, resize:'none', outline:'none' }} />
        <div style={{ display:'flex', justifyContent:'flex-end', marginTop:6 }}><Btn size="sm" variant="default">Save</Btn></div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        <Btn variant="default" style={{ width:'100%', justifyContent:'center' }}>Copy URL</Btn>
        <Btn variant="danger" style={{ width:'100%', justifyContent:'center' }}
          onClick={()=>{ setMedia(prev=>prev.filter(m=>m.id!==file.id)); setSelected(null); setDetailModal(false); }}>
          Delete file
        </Btn>
      </div>
    </div>
  );

  const FILTERS = ['All','Images','Video','Documents'];

  return (
    <div style={{ display:'flex', height:'100%' }}>
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <TopBar title="Media Library"
          right={<Btn variant="primary" onClick={()=>setUploadModal(true)}>{isMobile ? '↑' : 'Upload files'}</Btn>}
        />

        {/* Filters bar */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:6, padding:'8px 12px', borderBottom:`1px solid ${T.border}`, background:T.bg0, flexShrink:0 }}>
          <div style={{ position:'relative', flex:'1 1 140px', minWidth:120 }}>
            <span style={{ position:'absolute', left:8, top:'50%', transform:'translateY(-50%)', color:T.text2, fontSize:12 }}>⌕</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…"
              style={{ width:'100%', background:T.bg2, border:`1px solid ${T.border}`, borderRadius:4, padding:'5px 8px 5px 26px', color:T.text0, fontSize:11, outline:'none' }} />
          </div>
          <div style={{ display:'flex', gap:3, flexShrink:0 }}>
            {FILTERS.map(f => (
              <button key={f} onClick={()=>setFilter(f)}
                style={{ background: filter===f ? T.purple : T.bg3, border:`1px solid ${filter===f ? T.purple : T.border}`, color: filter===f ? '#fff' : T.text1, padding:'4px 9px', borderRadius:4, cursor:'pointer', fontSize:10, whiteSpace:'nowrap' }}>{f}</button>
            ))}
          </div>
          <div style={{ display:'flex', background:T.bg3, border:`1px solid ${T.border}`, borderRadius:4, overflow:'hidden', flexShrink:0 }}>
            {[['grid','⊞'],['list','≡']].map(([v,icon]) => (
              <button key={v} onClick={()=>setViewMode(v)}
                style={{ background: viewMode===v ? T.bg4 : 'none', border:'none', color: viewMode===v ? T.text0 : T.text2, padding:'5px 9px', cursor:'pointer', fontSize:14 }}>{icon}</button>
            ))}
          </div>
        </div>

        {/* Upload progress */}
        {uploading.length > 0 && (
          <div style={{ padding:'6px 12px', borderBottom:`1px solid ${T.border}`, background:T.bg0, flexShrink:0 }}>
            {uploading.map((u,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom: i < uploading.length-1 ? 4 : 0 }}>
                <span style={{ fontSize:10, color:T.text1, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.name}</span>
                <div style={{ width:80, height:3, background:T.bg3, borderRadius:2, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${u.progress}%`, background:T.purple, borderRadius:2, transition:'width 0.15s' }} />
                </div>
                <span style={{ fontSize:10, color:T.text2, width:28 }}>{Math.round(u.progress)}%</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ flex:1, overflowY:'auto', background:T.bg1 }}>
          {viewMode === 'grid' ? (
            <div style={{ display:'grid', gridTemplateColumns:`repeat(auto-fill,minmax(${isMobile?90:150}px,1fr))`, gap:1, background:T.border }}>
              {visible.map(m => (
                <div key={m.id} onClick={()=>selectFile(m.id)}
                  style={{ background: m.id===selected ? T.purpleDark : T.bg2, border:`2px solid ${m.id===selected ? T.purple : 'transparent'}`, aspectRatio:'4/3', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:5, cursor:'pointer', position:'relative', padding:'8px 6px' }}>
                  <span style={{ fontSize: isMobile ? 20 : 26, color: typeColor[m.type]||T.text2, opacity:0.55 }}>{typeIcon(m.type)}</span>
                  <div style={{ textAlign:'center', maxWidth:'100%' }}>
                    <div style={{ fontSize:9, color:T.text0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth: isMobile ? 82 : 130 }}>{m.name}</div>
                    <div style={{ fontSize:8, color:T.text2 }}>{m.size}</div>
                  </div>
                  {m.id===selected && <div style={{ position:'absolute', top:4, right:4, width:13, height:13, background:T.purple, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, color:'#fff' }}>✓</div>}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ overflowX:'auto' }}>
              <div style={{ display:'flex', padding:'0 12px', minHeight:32, borderBottom:`1px solid ${T.border}`, background:T.bg0, alignItems:'center', minWidth: isMobile ? 420 : 'auto' }}>
                {[['Name',3],['Type',1],['Size',1],!isMobile&&['Uploaded',1]].filter(Boolean).map(([h,f])=>(
                  <div key={h} style={{ flex:f, fontSize:10, color:T.text2, textTransform:'uppercase', letterSpacing:'0.05em' }}>{h}</div>
                ))}
              </div>
              {visible.map(m => (
                <div key={m.id} onClick={()=>selectFile(m.id)}
                  style={{ display:'flex', alignItems:'center', padding:'0 12px', minHeight:40, borderBottom:`1px solid ${T.border}`, background: m.id===selected ? T.purpleFaint : 'transparent', cursor:'pointer', minWidth: isMobile ? 420 : 'auto' }}>
                  <div style={{ flex:3, display:'flex', alignItems:'center', gap:7, overflow:'hidden', paddingRight:8 }}>
                    <span style={{ color: typeColor[m.type]||T.text2, fontSize:13, flexShrink:0 }}>{typeIcon(m.type)}</span>
                    <span style={{ fontSize:11, color:T.text0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.name}</span>
                  </div>
                  <div style={{ flex:1, fontSize:10, color: typeColor[m.type]||T.text2 }}>{m.type}</div>
                  <div style={{ flex:1, fontSize:11, color:T.text1 }}>{m.size}</div>
                  {!isMobile && <div style={{ flex:1, fontSize:10, color:T.text2 }}>{m.uploaded}</div>}
                </div>
              ))}
            </div>
          )}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 12px', borderTop:`1px solid ${T.border}`, fontSize:10, color:T.text2 }}>
            <span>{visible.length} files</span>
            <div style={{ display:'flex', gap:6 }}><Btn size="sm" variant="default" disabled>&lt;</Btn><Btn size="sm" variant="default">&gt;</Btn></div>
          </div>
        </div>
      </div>

      {/* Desktop detail panel */}
      {!isMobile && sel && (
        <div style={{ width:230, borderLeft:`1px solid ${T.border}`, background:T.bg0, display:'flex', flexDirection:'column', flexShrink:0 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'11px 14px', borderBottom:`1px solid ${T.border}` }}>
            <span style={{ fontSize:11, color:T.text0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:170 }}>{sel.name}</span>
            <button onClick={()=>setSelected(null)} style={{ background:'none', border:'none', color:T.text1, cursor:'pointer', fontSize:18 }}>×</button>
          </div>
          <div style={{ flex:1, overflowY:'auto', padding:14 }}><DetailContent file={sel} /></div>
        </div>
      )}

      {/* Mobile detail modal */}
      {isMobile && (
        <Modal open={detailModal&&!!sel} onClose={()=>{setDetailModal(false);setSelected(null);}} title={sel?.name||''} width={340}>
          <DetailContent file={sel} />
        </Modal>
      )}

      <Modal open={uploadModal} onClose={()=>setUploadModal(false)} title="Upload files" width={420}>
        <div onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)}
          onDrop={e=>{e.preventDefault();setDrag(false);doUpload();}} onClick={doUpload}
          style={{ border:`2px dashed ${drag?T.purple:T.border}`, borderRadius:8, padding:'40px 20px', textAlign:'center', background: drag?T.purpleFaint:T.bg3, cursor:'pointer', transition:'all 0.15s', marginBottom:12 }}>
          <div style={{ fontSize:28, marginBottom:8, color:T.purple, opacity:0.7 }}>↑</div>
          <div style={{ fontSize:13, color:T.text0, marginBottom:4 }}>Drop files here or click to browse</div>
          <div style={{ fontSize:10, color:T.text2 }}>JPG, PNG, SVG, PDF — max 20 MB</div>
        </div>
      </Modal>
    </div>
  );
};

// ══════════════════════════════════════════════════════
// SETTINGS
// ══════════════════════════════════════════════════════
const SETTING_SECTIONS = [
  { id:'project',      label:'Project',      icon:'◻', danger:false },
  { id:'appearance',   label:'Appearance',   icon:'◑', danger:false },
  { id:'api',          label:'API',          icon:'⚷', danger:false },
  { id:'localization', label:'Localization', icon:'◎', danger:false },
  { id:'danger',       label:'Danger Zone',  icon:'⚠', danger:true  },
];

// Defined outside SettingsPage so React doesn't remount on each render
const SettingsBlock = ({ sectionRef, id, title, children }) => (
  <div ref={sectionRef} style={{ background: id==='danger'?'rgba(240,107,107,0.06)':T.bg2, border:`1px solid ${id==='danger'?'rgba(240,107,107,0.25)':T.border}`, borderRadius:8, padding:'16px 16px', marginBottom:12 }}>
    <div style={{ fontFamily:'Instrument Serif', fontStyle:'italic', fontSize:17, color: id==='danger'?T.coral:T.text0, marginBottom:14 }}>{title}</div>
    {children}
  </div>
);

const SettingsPage = () => {
  const { useRef, useEffect: ue } = React;
  const isMobile = useIsMobile();
  const [cfg, setCfg]       = useState(INIT_SETTINGS);
  const [saved, setSaved]   = useState(false);
  const [active, setActive] = useState('project');
  const scrollRef = useRef(null);
  const refs = Object.fromEntries(SETTING_SECTIONS.map(s => [s.id, useRef(null)]));
  const set = (k,v) => setCfg(c => ({...c, [k]:v}));
  const save = () => { setSaved(true); setTimeout(()=>setSaved(false), 2000); };

  const scrollTo = (id) => {
    const el = refs[id]?.current;
    const container = scrollRef.current;
    if (el && container) container.scrollTo({ top: el.offsetTop - 16, behavior: 'smooth' });
  };

  ue(() => {
    const container = scrollRef.current;
    if (!container) return;
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollTop + clientHeight >= scrollHeight - 8) {
        setActive(SETTING_SECTIONS[SETTING_SECTIONS.length - 1].id);
        return;
      }
      // Use offsetTop relative to scrollRef container
      let best = SETTING_SECTIONS[0].id;
      for (const s of SETTING_SECTIONS) {
        const el = refs[s.id]?.current;
        if (el && el.offsetTop <= scrollTop + 80) best = s.id;
      }
      setActive(best);
    };
    container.addEventListener('scroll', onScroll);
    return () => container.removeEventListener('scroll', onScroll);
  }, []);

  const Block = SettingsBlock;

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <TopBar title="Settings" right={<Btn variant="primary" onClick={save}>{saved ? '✓ Saved' : 'Save changes'}</Btn>} />
      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>

        {/* Desktop left nav */}
        {!isMobile && (
          <div style={{ width:180, borderRight:`1px solid ${T.border}`, background:T.bg0, padding:'10px 0', flexShrink:0 }}>
            <div style={{ fontSize:9, color:T.text2, textTransform:'uppercase', letterSpacing:'0.07em', padding:'0 14px 8px' }}>Settings</div>
            {SETTING_SECTIONS.map(s => {
              const on = active===s.id;
              return (
                <button key={s.id} onClick={()=>scrollTo(s.id)}
                  style={{ width:'100%', display:'flex', alignItems:'center', gap:8, padding:'7px 14px', background: on?(s.danger?'rgba(240,107,107,0.08)':T.purpleFaint):'transparent', border:'none', borderLeft:`2px solid ${on?(s.danger?T.coral:T.purple):'transparent'}`, color: on?(s.danger?T.coral:T.purple):T.text1, cursor:'pointer', fontSize:11, textAlign:'left', transition:'all 0.13s' }}>
                  <span style={{ opacity:0.7 }}>{s.icon}</span>{s.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Mobile: horizontal pill nav */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          {isMobile && (
            <div style={{ display:'flex', gap:6, padding:'8px 12px', borderBottom:`1px solid ${T.border}`, background:T.bg0, overflowX:'auto', flexShrink:0 }}>
              {SETTING_SECTIONS.map(s => {
                const on = active===s.id;
                return (
                  <button key={s.id} onClick={()=>scrollTo(s.id)}
                    style={{ background: on?(s.danger?'rgba(240,107,107,0.15)':T.purpleFaint):'transparent', border:`1px solid ${on?(s.danger?T.coral:T.purple):T.border}`, color: on?(s.danger?T.coral:T.purple):T.text1, padding:'5px 12px', borderRadius:20, cursor:'pointer', fontSize:10, whiteSpace:'nowrap', flexShrink:0 }}>
                    {s.label}
                  </button>
                );
              })}
            </div>
          )}

          <div ref={scrollRef} style={{ flex:1, overflowY:'auto', background:T.bg1, padding: isMobile ? '14px 12px 80px' : '20px 24px 80px' }}>
            <div style={{ maxWidth:660 }}>

              <Block sectionRef={refs['project']} id="project" title="Project">
                <FormRow label="Project name" hint="Display name shown in the browser tab.">
                  <Input value={cfg.projectName} onChange={v=>set('projectName',v)} placeholder="My qqCMS Project" />
                </FormRow>
                <FormRow label="Admin URL" hint="Base URL for the admin interface.">
                  <Input value={cfg.adminUrl} onChange={v=>set('adminUrl',v)} placeholder="https://admin.example.com" />
                </FormRow>
                <div style={{ display:'flex', justifyContent:'flex-end', paddingTop:12 }}>
                  <Btn variant="primary" onClick={save}>{saved ? '✓ Saved' : 'Save changes'}</Btn>
                </div>
              </Block>

              <Block sectionRef={refs['appearance']} id="appearance" title="Appearance">
                <FormRow label="Dark mode" hint="Use dark theme across the admin interface.">
                  <Toggle value={cfg.darkMode} onChange={v=>set('darkMode',v)} />
                </FormRow>
                <FormRow label="Compact sidebar" hint="Collapse sidebar labels, show only icons.">
                  <Toggle value={cfg.compactSidebar} onChange={v=>set('compactSidebar',v)} />
                </FormRow>
              </Block>

              <Block sectionRef={refs['api']} id="api" title="API">
                <FormRow label="API URL" hint="Public-facing base URL for the API.">
                  <Input value={cfg.apiUrl} onChange={v=>set('apiUrl',v)} placeholder="https://api.example.com" />
                </FormRow>
                <FormRow label="Content API key" hint="Read-only key for public content access.">
                  <div style={{ display:'flex', gap:8 }}>
                    <Input value={cfg.contentApiKey} onChange={v=>set('contentApiKey',v)} />
                    <Btn variant="default">Regen</Btn>
                  </div>
                </FormRow>
              </Block>

              <Block sectionRef={refs['localization']} id="localization" title="Localization">
                <div style={{ fontSize:11, color:T.text1, marginBottom:14, marginTop:-4 }}>Manage the languages available for your content.</div>
                {cfg.locales.map((loc,i) => (
                  <div key={loc.code} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 0', borderBottom: i < cfg.locales.length-1 ? `1px solid ${T.border}` : 'none' }}>
                    <span style={{ fontSize:10, color:T.text2, width:20 }}>{loc.code}</span>
                    <span style={{ fontSize:11, color:T.text0, flex:1 }}>{loc.label}</span>
                    {loc.isDefault
                      ? <Badge type="scheduled">Default</Badge>
                      : <>
                          <button
                            onClick={() => setCfg(c => ({ ...c, locales: c.locales.map((l,j) => ({ ...l, isDefault: j===i })) }))}
                            style={{ background:'none', border:`1px solid ${T.border}`, borderRadius:3, color:T.text1, cursor:'pointer', fontSize:10, padding:'2px 8px', whiteSpace:'nowrap', transition:'all 0.13s' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor=T.purple; e.currentTarget.style.color=T.purple; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor=T.border; e.currentTarget.style.color=T.text1; }}>
                            Set default
                          </button>
                          <button
                            onClick={() => setCfg(c => ({ ...c, locales: c.locales.filter((_,j) => j!==i) }))}
                            style={{ background:'none', border:'none', color:T.text2, cursor:'pointer', fontSize:11, padding:'2px 4px' }}
                            onMouseEnter={e => e.currentTarget.style.color=T.coral}
                            onMouseLeave={e => e.currentTarget.style.color=T.text2}>
                            ×
                          </button>
                        </>
                    }
                  </div>
                ))}
                <button style={{ background:'none', border:'none', color:T.purple, cursor:'pointer', fontSize:11, marginTop:12, padding:0 }}>+ Add locale</button>
                <div style={{ borderTop:`1px solid ${T.border}`, marginTop:16, paddingTop:14, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ fontSize:11, color:T.text0, marginBottom:3 }}>Prefix default locale</div>
                    <div style={{ fontSize:10, color:T.text2 }}>Include locale code in URLs for default language.</div>
                  </div>
                  <Toggle value={cfg.prefixDefaultLocale} onChange={v=>set('prefixDefaultLocale',v)} />
                </div>
              </Block>

              <Block sectionRef={refs['danger']} id="danger" title="Danger Zone">
                <div style={{ fontSize:11, color:T.text1, marginBottom:16, marginTop:-4 }}>Irreversible and destructive actions.</div>
                {[
                  { label:'Reset application cache', desc:'Clears all generated static pages and cached API responses.', btn:'Reset cache' },
                  { label:'Revoke all API keys',     desc:'Immediately invalidates all existing user and system API keys.', btn:'Revoke keys' },
                  { label:'Delete project',          desc:'Permanently delete this project and all its data.', btn:'Delete project' },
                ].map((a,i,arr) => (
                  <div key={a.label} style={{ display:'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent:'space-between', gap:12, padding:'13px 0', flexDirection: isMobile ? 'column' : 'row', borderBottom: i<arr.length-1 ? `1px solid rgba(240,107,107,0.15)` : 'none' }}>
                    <div>
                      <div style={{ fontSize:12, color:T.text0, marginBottom:4 }}>{a.label}</div>
                      <div style={{ fontSize:11, color:T.text1 }}>{a.desc}</div>
                    </div>
                    <Btn variant="danger" style={{ flexShrink:0, ...(isMobile?{alignSelf:'flex-start'}:{}) }}>{a.btn}</Btn>
                  </div>
                ))}
              </Block>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════
// API KEYS
// ══════════════════════════════════════════════════════
const ApiKeysPage = () => {
  const isMobile = useIsMobile();
  const [keys, setKeys]         = useState(INIT_API_KEYS);
  const [createModal, setCreateModal] = useState(false);
  const [newKeyForm, setNewKeyForm]   = useState({ name:'', permissions:'ro' });
  const [created, setCreated]         = useState(null);

  const createKey = () => {
    const newKey = { id:keys.length+1, name:newKeyForm.name, key:`sk_${newKeyForm.permissions==='rw'?'live':'test'}_••••••••`, permissions:newKeyForm.permissions, created:'19 Apr 2026' };
    setKeys(prev => [...prev, newKey]);
    setCreated(newKey);
    setNewKeyForm({ name:'', permissions:'ro' });
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <TopBar title="API Keys" right={<Btn variant="primary" onClick={()=>{setCreated(null);setCreateModal(true);}}>+ {isMobile ? 'New' : 'Create New Key'}</Btn>} />
      <div style={{ flex:1, overflowY:'auto', background:T.bg1, padding: isMobile ? '14px 12px' : '20px' }}>
        <div style={{ maxWidth:760 }}>
          {isMobile ? (
            /* Mobile: card list */
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {keys.map(k => (
                <div key={k.id} style={{ background:T.bg2, border:`1px solid ${T.border}`, borderRadius:7, padding:'13px 14px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                    <div>
                      <div style={{ fontSize:12, color:T.text0, marginBottom:4 }}>{k.name}</div>
                      <div style={{ fontSize:10, color:T.text2, fontFamily:'Geist Mono, monospace' }}>{k.key}</div>
                    </div>
                    <button onClick={()=>setKeys(prev=>prev.filter(x=>x.id!==k.id))}
                      style={{ background:'none', border:'none', color:T.coral, cursor:'pointer', fontSize:11, flexShrink:0 }}>Revoke</button>
                  </div>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <Badge type={k.permissions}>{k.permissions==='rw' ? 'Read / Write' : 'Read Only'}</Badge>
                    <span style={{ fontSize:10, color:T.text2 }}>{k.created}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Desktop: table */
            <>
              <div style={{ display:'flex', alignItems:'center', padding:'0 16px', minHeight:36, background:T.bg2, border:`1px solid ${T.border}`, borderRadius:'6px 6px 0 0', fontSize:10, color:T.text2 }}>
                <div style={{ flex:2 }}>Name / Key</div>
                <div style={{ flex:1 }}>Permissions</div>
                <div style={{ flex:1 }}>Created</div>
                <div style={{ width:70, textAlign:'right' }}>Actions</div>
              </div>
              {keys.map((k,i) => (
                <div key={k.id} style={{ display:'flex', alignItems:'center', padding:'0 16px', minHeight:46, background:T.bg2, borderLeft:`1px solid ${T.border}`, borderRight:`1px solid ${T.border}`, borderBottom:`1px solid ${T.border}`, ...(i===keys.length-1?{borderRadius:'0 0 6px 6px'}:{}) }}>
                  <div style={{ flex:2 }}>
                    <div style={{ fontSize:11, color:T.text0, marginBottom:2 }}>{k.name}</div>
                    <div style={{ fontSize:10, color:T.text2, fontFamily:'Geist Mono, monospace' }}>{k.key}</div>
                  </div>
                  <div style={{ flex:1 }}><Badge type={k.permissions}>{k.permissions==='rw'?'Read / Write':'Read Only'}</Badge></div>
                  <div style={{ flex:1, fontSize:11, color:T.text1 }}>{k.created}</div>
                  <div style={{ width:70, textAlign:'right' }}>
                    <button onClick={()=>setKeys(prev=>prev.filter(x=>x.id!==k.id))}
                      style={{ background:'none', border:'none', color:T.coral, cursor:'pointer', fontSize:11 }}>Revoke</button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      <Modal open={createModal} onClose={()=>setCreateModal(false)} title="Create New API Key" width={380}>
        {created ? (
          <div>
            <div style={{ fontSize:11, color:T.text1, marginBottom:12 }}>Your new API key has been created. Copy it now — it won't be shown again.</div>
            <div style={{ background:T.bg3, border:`1px solid ${T.border}`, borderRadius:4, padding:'10px 12px', fontFamily:'Geist Mono, monospace', fontSize:11, color:T.green, marginBottom:16, wordBreak:'break-all' }}>
              sk_{created.permissions==='rw'?'live':'test'}_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
            </div>
            <div style={{ display:'flex', justifyContent:'flex-end' }}>
              <Btn variant="default" onClick={()=>{setCreateModal(false);setCreated(null);}}>Done</Btn>
            </div>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div>
              <div style={{ fontSize:10, color:T.text1, marginBottom:5 }}>Key name</div>
              <Input value={newKeyForm.name} onChange={v=>setNewKeyForm(f=>({...f,name:v}))} placeholder="e.g. Production Key" />
            </div>
            <div>
              <div style={{ fontSize:10, color:T.text1, marginBottom:8 }}>Permissions</div>
              <div style={{ display:'flex', gap:6 }}>
                {[['ro','Read Only'],['rw','Read / Write']].map(([v,l]) => (
                  <button key={v} onClick={()=>setNewKeyForm(f=>({...f,permissions:v}))}
                    style={{ flex:1, padding:'7px 0', background: newKeyForm.permissions===v ? T.purpleFaint : T.bg3, border:`1px solid ${newKeyForm.permissions===v ? T.purple : T.border}`, color: newKeyForm.permissions===v ? T.purple : T.text1, borderRadius:4, cursor:'pointer', fontSize:11 }}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:8, paddingTop:4 }}>
              <Btn variant="default" onClick={()=>setCreateModal(false)}>Cancel</Btn>
              <Btn variant="primary" onClick={createKey} disabled={!newKeyForm.name}>Create key</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ══════════════════════════════════════════════════════
// LOGIN PAGE
// ══════════════════════════════════════════════════════
const LoginPage = ({ onLogin }) => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setError(''); setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Simulated check — in real app credentials come from .env
      if (email === 'admin@example.com' && password === 'admin') {
        onLogin();
      } else {
        setError('Invalid credentials');
      }
    }, 800);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg0)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
        <div style={{ width: 32, height: 32, background: 'var(--accent)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#fff', fontWeight: 700 }}>q</div>
        <span style={{ fontFamily: 'Instrument Serif', fontStyle: 'italic', fontSize: 26, color: 'var(--text0)', letterSpacing: '-0.5px' }}>qqCMS</span>
      </div>

      {/* Card */}
      <div style={{ width: '100%', maxWidth: 380, background: 'var(--bg2)', border: `1px solid var(--border)`, borderRadius: 10, padding: '28px 28px 24px', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
        <div style={{ fontFamily: 'Instrument Serif', fontStyle: 'italic', fontSize: 22, color: 'var(--text0)', marginBottom: 4 }}>Sign in</div>
        <div style={{ marginBottom: 24 }} />

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 10, color: 'var(--text1)', display: 'block', marginBottom: 5 }}>Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="admin@example.com" autoComplete="email"
              style={{ width: '100%', background: 'var(--bg1)', border: `1px solid ${error ? 'var(--coral)' : 'var(--border)'}`, borderRadius: 5, padding: '8px 11px', color: 'var(--text0)', fontSize: 12, outline: 'none', transition: 'border-color 0.15s' }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = error ? 'var(--coral)' : 'var(--border)'}
            />
          </div>

          <div>
            <label style={{ fontSize: 10, color: 'var(--text1)', display: 'block', marginBottom: 5 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" autoComplete="current-password"
                style={{ width: '100%', background: 'var(--bg1)', border: `1px solid ${error ? 'var(--coral)' : 'var(--border)'}`, borderRadius: 5, padding: '8px 36px 8px 11px', color: 'var(--text0)', fontSize: 12, outline: 'none', transition: 'border-color 0.15s' }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = error ? 'var(--coral)' : 'var(--border)'}
              />
              <button type="button" onClick={() => setShowPass(s => !s)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: 12, padding: 2 }}>
                {showPass ? '○' : '●'}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background: 'var(--coral-faint)', border: '1px solid rgba(240,107,107,0.3)', borderRadius: 5, padding: '8px 11px', fontSize: 11, color: 'var(--coral)' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '10px', background: loading ? 'var(--bg4)' : 'var(--accent)', border: 'none', borderRadius: 5, color: '#fff', fontSize: 12, cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}>
            {loading ? (
              <><span style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Signing in…</>
            ) : 'Sign in →'}
          </button>
        </form>

        <div style={{ marginTop: 20, padding: '12px', background: 'var(--bg3)', border: `1px solid var(--border)`, borderRadius: 6 }}>
          <div style={{ fontSize: 10, color: 'var(--text2)', marginBottom: 4 }}>Demo credentials</div>
          <div style={{ fontSize: 10, color: 'var(--text1)', fontFamily: 'Geist Mono, monospace', lineHeight: 1.7 }}>
            admin@example.com<br/>admin
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24, fontSize: 10, color: 'var(--text2)' }}>qqCMS v0.1.0</div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{"accentColor":"#6B5CE7","darkMode":true}/*EDITMODE-END*/;

const App = () => {
  const isMobile = useIsMobile();
  const [loggedIn, setLoggedIn] = useState(() => localStorage.getItem('qqcms-auth') === '1');
  const [nav, setNav] = useState(() => localStorage.getItem('qqcms-nav') || 'dashboard');
  const [tweaksVisible, setTweaksVisible] = useState(false);
  const [tweaks, setTweaks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('qqcms-tweaks')) || TWEAK_DEFAULTS; }
    catch { return TWEAK_DEFAULTS; }
  });

  useEffect(() => {
    applyAccent(tweaks.accentColor);
    applyDark(tweaks.darkMode);
  }, []);

  const setTweak = (key, val) => {
    const next = { ...tweaks, [key]: val };
    setTweaks(next);
    localStorage.setItem('qqcms-tweaks', JSON.stringify(next));
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: next }, '*');
    if (key === 'accentColor') applyAccent(val);
    if (key === 'darkMode') applyDark(val);
  };

  const handleLogin = () => { localStorage.setItem('qqcms-auth', '1'); setLoggedIn(true); };
  const handleLogout = () => { localStorage.removeItem('qqcms-auth'); setLoggedIn(false); };

  useEffect(() => { localStorage.setItem('qqcms-nav', nav); }, [nav]);

  useEffect(() => {
    const handler = e => {
      if (e.data?.type === '__activate_edit_mode')   setTweaksVisible(true);
      if (e.data?.type === '__deactivate_edit_mode') setTweaksVisible(false);
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  if (!loggedIn) return <LoginPage onLogin={handleLogin} />;

  const renderPage = () => {
    switch (nav) {
      case 'dashboard':   return <DashboardPage onNav={setNav} />;
      case 'pages':       return <PagesPage />;
      case 'collections': return <CollectionsPage />;
      case 'media':       return <MediaPage />;
      case 'apikeys':     return <ApiKeysPage />;
      case 'settings':    return <SettingsPage />;
      default:            return null;
    }
  };

  const ACCENT_PRESETS = [
    { color: '#6B5CE7', label: 'Violet'   },
    { color: '#2ECC71', label: 'Emerald'  },
    { color: '#F5A623', label: 'Amber'    },
    { color: '#F06B6B', label: 'Coral'    },
    { color: '#60a5fa', label: 'Sky'      },
    { color: '#f472b6', label: 'Pink'     },
  ];

  return (
    <div style={{ display:'flex', height:'100vh', width:'100vw', overflow:'hidden', background:'var(--bg0)' }}>
      {!isMobile && <Sidebar active={nav} onNav={setNav} onLogout={handleLogout} />}

      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', paddingBottom: isMobile ? 56 : 0 }}>
        {isMobile && (
          <div style={{ height:40, background:'var(--bg0)', borderBottom:`1px solid var(--border)`, display:'flex', alignItems:'center', padding:'0 14px', flexShrink:0 }}>
            <div style={{ width:20, height:20, background:'var(--accent)', borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'#fff', fontWeight:700, flexShrink:0 }}>q</div>
            <span style={{ fontFamily:'Instrument Serif', fontStyle:'italic', fontSize:15, color:'var(--text0)', marginLeft:8 }}>qqCMS</span>
          </div>
        )}
        {renderPage()}
      </div>

      {isMobile && <Sidebar active={nav} onNav={setNav} onLogout={handleLogout} />}

      {/* Tweaks panel */}
      {tweaksVisible && (
        <div style={{ position:'fixed', bottom: isMobile ? 66 : 20, right:16, zIndex:9000, background:'var(--bg2)', border:`1px solid var(--border)`, borderRadius:10, padding:16, width:220, boxShadow:'0 12px 40px rgba(0,0,0,0.4)' }}>
          <div style={{ fontSize:12, color:'var(--text0)', marginBottom:14, fontWeight:500, letterSpacing:'-0.01em' }}>Tweaks</div>

          {/* Dark / Light toggle */}
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:10, color:'var(--text1)', marginBottom:8 }}>Theme</div>
            <div style={{ display:'flex', background:'var(--bg3)', border:`1px solid var(--border)`, borderRadius:6, padding:3, gap:3 }}>
              {[{ val:true, label:'Dark', icon:'◐' }, { val:false, label:'Light', icon:'○' }].map(({ val, label, icon }) => {
                const on = tweaks.darkMode === val;
                return (
                  <button key={label} onClick={() => setTweak('darkMode', val)}
                    style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:5, padding:'6px 0', background: on ? 'var(--bg0)' : 'transparent', border:`1px solid ${on ? 'var(--border)' : 'transparent'}`, borderRadius:4, color: on ? 'var(--text0)' : 'var(--text2)', cursor:'pointer', fontSize:11, transition:'all 0.15s' }}>
                    <span style={{ fontSize:12 }}>{icon}</span>{label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accent color */}
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:10, color:'var(--text1)', marginBottom:8 }}>Accent color</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
              {ACCENT_PRESETS.map(({ color, label }) => {
                const on = tweaks.accentColor === color;
                return (
                  <button key={color} onClick={() => setTweak('accentColor', color)}
                    title={label}
                    style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5, padding:'8px 4px', background: on ? 'var(--accent-faint)' : 'transparent', border:`1px solid ${on ? 'var(--accent)' : 'var(--border)'}`, borderRadius:6, cursor:'pointer', transition:'all 0.15s' }}>
                    <div style={{ width:20, height:20, borderRadius:'50%', background:color, boxShadow: on ? `0 0 0 2px var(--bg2), 0 0 0 4px ${color}` : 'none', transition:'box-shadow 0.15s' }} />
                    <span style={{ fontSize:9, color: on ? 'var(--accent)' : 'var(--text2)' }}>{label}</span>
                  </button>
                );
              })}
            </div>
            {/* Custom hex input */}
            <div style={{ marginTop:8, display:'flex', gap:6, alignItems:'center' }}>
              <div style={{ width:20, height:20, borderRadius:4, background:tweaks.accentColor, flexShrink:0, border:`1px solid var(--border)` }} />
              <input value={tweaks.accentColor}
                onChange={e => { const v = e.target.value; if (/^#[0-9a-fA-F]{6}$/.test(v)) setTweak('accentColor', v); }}
                style={{ flex:1, background:'var(--bg1)', border:`1px solid var(--border)`, borderRadius:4, padding:'4px 8px', color:'var(--text0)', fontSize:10, outline:'none', fontFamily:'Geist Mono, monospace' }}
                placeholder="#6B5CE7"
                maxLength={7}
              />
            </div>
          </div>

          {/* Page jump */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize:10, color:'var(--text1)', marginBottom:6 }}>Go to page</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:4 }}>
              {['dashboard','pages','collections','media','apikeys','settings'].map(p => (
                <button key={p} onClick={() => setNav(p)}
                  style={{ background: nav===p ? 'var(--accent-faint)' : 'var(--bg3)', border:`1px solid ${nav===p ? 'var(--accent)' : 'var(--border)'}`, color: nav===p ? 'var(--accent)' : 'var(--text1)', padding:'4px 6px', borderRadius:4, cursor:'pointer', fontSize:9, textAlign:'left', transition:'all 0.13s' }}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Login page shortcut */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
            <button onClick={handleLogout}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', background: 'var(--coral-faint)', border: '1px solid rgba(240,107,107,0.25)', borderRadius: 5, color: 'var(--coral)', cursor: 'pointer', fontSize: 10 }}>
              <svg width={11} height={11} viewBox="0 0 16 16" fill="currentColor"><path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6"/></svg>
              Preview login page
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
