// pages.jsx — PagesPage + CollectionsPage
const { useState } = React;

// ── DATA ──────────────────────────────────────────────
const INIT_PAGES_DATA = [
  { id: 1, slug: '/',        title: 'Home',     status: 'published', updated: '2m ago',   content: 'This is a lightweight headless CMS designed for developers.' },
  { id: 2, slug: '/about',   title: 'About Us', status: 'published', updated: 'yesterday',content: 'Learn more about our team and mission.' },
  { id: 3, slug: '/contact', title: 'Contact',  status: 'draft',     updated: '3d ago',   content: 'Get in touch with us.' },
  { id: 4, slug: '/blog',    title: 'Blog',     status: 'published', updated: '5d ago',   content: 'Read our latest articles.' },
];

const INIT_COLLECTIONS = [
  {
    id: 'footer_links', name: 'footer_links', count: 6,
    fields: [
      { name: 'label', type: 'Text', required: true },
      { name: 'href',  type: 'Text', required: true },
      { name: 'target',type: 'Text', required: false },
      { name: 'visible',type:'Boolean',required: false },
    ],
    entries: [
      { label: 'Home',    href: '/',         target: '_self',  visible: true  },
      { label: 'About',   href: '/about',    target: '_self',  visible: true  },
      { label: 'Blog',    href: '/blog',     target: '_self',  visible: true  },
      { label: 'Contact', href: '/contact',  target: '_self',  visible: true  },
      { label: 'GitHub',  href: 'https://...', target: '_blank', visible: true },
      { label: 'Privacy', href: '/privacy',  target: '_self',  visible: false },
    ],
  },
  {
    id: 'header_nav', name: 'header_nav', count: 5,
    fields: [
      { name: 'label', type: 'Text',    required: true  },
      { name: 'href',  type: 'Text',    required: true  },
      { name: 'target',type: 'Text',    required: false },
      { name: 'visible',type: 'Boolean',required: false },
    ],
    entries: [
      { label: 'Home',     href: '/',         target: '_self', visible: true  },
      { label: 'Features', href: '/features', target: '_self', visible: true  },
      { label: 'Pricing',  href: '/pricing',  target: '_self', visible: true  },
      { label: 'Docs',     href: '/docs',     target: '_self', visible: true  },
      { label: 'Blog',     href: '/blog',     target: '_self', visible: false },
    ],
  },
  {
    id: 'products', name: 'products', count: 12,
    fields: [
      { name: 'name',     type: 'Text',    required: true  },
      { name: 'price',    type: 'Number',  required: true  },
      { name: 'category', type: 'Text',    required: false },
      { name: 'in_stock', type: 'Boolean', required: false },
    ],
    entries: [
      { name: 'Starter Kit',  price: '€29',    category: 'SaaS',    in_stock: true  },
      { name: 'Pro Bundle',   price: '€99',    category: 'SaaS',    in_stock: true  },
      { name: 'Enterprise',   price: 'Custom', category: 'SaaS',    in_stock: true  },
      { name: 'Plugin Pack',  price: '€19',    category: 'Add-on',  in_stock: true  },
      { name: 'Theme Dark',   price: '€14',    category: 'Add-on',  in_stock: false },
      { name: 'Support Plus', price: '€49',    category: 'Service', in_stock: true  },
    ],
  },
];

// ── Page Editor ────────────────────────────────────────
const TOOLBAR_BTNS = ['B','I','U','S','<>','H1','H2','•','≡'];
const catColor = { SaaS: T.purple, 'Add-on': T.amber, Service: T.coral };

const PageEditor = ({ page, onBack, onStatusChange }) => {
  const isMobile = useIsMobile();
  const [content, setContent] = useState(page.content || '');
  const [slug, setSlug]       = useState(page.slug);
  const [seoTitle, setSeoTitle] = useState(page.title + ' — My Website');
  const [lang, setLang]       = useState('EN');
  const [metaOpen, setMetaOpen] = useState(false);
  const isLive = page.status === 'published';

  const MetaPanel = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Version status */}
      <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 6, padding: 12 }}>
        <div style={{ fontSize: 11, color: T.text0, marginBottom: 10 }}>Version status</div>
        {isLive ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontSize: 10, color: T.text2 }}>Published</span>
              <span style={{ fontSize: 10, color: T.text2 }}>Draft</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 10, color: T.green }}>Mar 12</span>
              <span style={{ fontSize: 10, color: T.purple }}>now ●</span>
            </div>
            <div style={{ background: T.amberFaint, border: `1px solid rgba(245,166,35,0.25)`, borderRadius: 4, padding: '7px 9px', marginBottom: 10 }}>
              <div style={{ fontSize: 10, color: T.amber, marginBottom: 3 }}>⚠ Unpublished changes</div>
              <div style={{ fontSize: 9, color: T.text1, lineHeight: 1.5 }}>The live version is older than your current draft.</div>
            </div>
          </>
        ) : (
          <div style={{ fontSize: 10, color: T.text1, marginBottom: 10 }}>Not published yet</div>
        )}
        <div style={{ display: 'flex', gap: 6 }}>
          <Btn size="sm" variant="default" style={{ flex: 1, justifyContent: 'center' }}>Save draft</Btn>
          <Btn size="sm" variant="primary" style={{ flex: 1, justifyContent: 'center' }}>Publish ↑</Btn>
        </div>
      </div>
      {/* Page meta */}
      <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 6, padding: 12 }}>
        <div style={{ fontSize: 11, color: T.text0, marginBottom: 10 }}>Page meta</div>
        <div style={{ fontSize: 10, color: T.text2, marginBottom: 4 }}>Slug</div>
        <Input value={slug} onChange={setSlug} style={{ marginBottom: 10 }} />
        <div style={{ fontSize: 10, color: T.text2, marginBottom: 4 }}>SEO title</div>
        <Input value={seoTitle} onChange={setSeoTitle} placeholder="Home — My Website" />
      </div>
      {/* Language */}
      <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 6, padding: 12 }}>
        <div style={{ fontSize: 11, color: T.text0, marginBottom: 10 }}>Language</div>
        <div style={{ display: 'flex', gap: 4, marginBottom: 7 }}>
          {['EN','ET'].map(l => (
            <button key={l} onClick={() => setLang(l)}
              style={{ flex: 1, padding: '4px 0', background: lang === l ? T.purple : T.bg4, border: `1px solid ${lang === l ? T.purple : T.border}`, borderRadius: 3, color: lang === l ? '#fff' : T.text1, cursor: 'pointer', fontSize: 10 }}>
              {l}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 9, color: T.text2 }}>Editing: {lang === 'EN' ? 'English' : 'Estonian'} variant</div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Breadcrumb topbar */}
      <div style={{ height: 44, background: T.bg0, borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', padding: '0 12px', gap: 6, flexShrink: 0 }}>
        <Btn size="sm" variant="ghost" onClick={onBack}>← Back</Btn>
        {!isMobile && <>
          <span style={{ fontSize: 11, color: T.text2 }}>/</span>
          <span style={{ fontSize: 11, color: T.text0 }}>{page.slug.replace('/', '') || 'home'}</span>
        </>}
        <div style={{ flex: 1 }} />
        {isMobile && (
          <Btn size="sm" variant="ghost" onClick={() => setMetaOpen(true)}>Meta ⋯</Btn>
        )}
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: isLive ? T.green : T.amber, background: isLive ? T.greenFaint : T.amberFaint, padding: '3px 10px', borderRadius: 3 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: isLive ? T.green : T.amber }} />
          {isLive ? 'Live' : 'Draft'}
        </span>
        {isLive
          ? <Btn size="sm" variant="ghost" onClick={() => onStatusChange(page.id, 'draft')}>Unpublish</Btn>
          : <Btn size="sm" variant="primary" onClick={() => onStatusChange(page.id, 'published')}>Publish ↑</Btn>}
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Editor area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: isMobile ? 'none' : `1px solid ${T.border}` }}>
          {/* Toolbar */}
          <div style={{ display: 'flex', gap: 2, padding: '6px 10px', borderBottom: `1px solid ${T.border}`, background: T.bg0, flexShrink: 0, overflowX: 'auto' }}>
            {TOOLBAR_BTNS.map((b, i) => (
              <button key={i} style={{ background: 'none', border: 'none', color: T.text1, padding: '3px 7px', borderRadius: 3, cursor: 'pointer', fontSize: 11, fontFamily: 'Geist Mono, monospace', flexShrink: 0 }}
                onMouseEnter={e => e.target.style.background = T.bg3}
                onMouseLeave={e => e.target.style.background = 'none'}>
                {b}
              </button>
            ))}
          </div>
          {/* Content */}
          <div style={{ flex: 1, overflow: 'auto', padding: isMobile ? '20px 16px' : '28px 48px', background: T.bg1 }}>
            <div style={{ maxWidth: 640, margin: '0 auto' }}>
              <div contentEditable suppressContentEditableWarning
                style={{ fontFamily: 'Instrument Serif', fontStyle: 'italic', fontSize: isMobile ? 22 : 28, color: T.text0, outline: 'none', marginBottom: 20, lineHeight: 1.3 }}>
                {page.title}
              </div>
              <textarea value={content} onChange={e => setContent(e.target.value)}
                style={{ width: '100%', background: 'none', border: 'none', outline: 'none', color: T.text1, fontSize: 13, lineHeight: 1.8, resize: 'none', minHeight: 300, fontFamily: 'Geist Mono, monospace' }} />
            </div>
          </div>
          {/* Footer */}
          <div style={{ padding: '7px 14px', borderTop: `1px solid ${T.border}`, fontSize: 10, color: T.text2, background: T.bg0 }}>
            Last saved as draft · 3 min ago
          </div>
        </div>

        {/* Right metadata panel — desktop only */}
        {!isMobile && (
          <div style={{ width: 220, overflowY: 'auto', background: T.bg0, padding: 14, flexShrink: 0 }}>
            <MetaPanel />
          </div>
        )}
      </div>

      {/* Mobile meta sheet */}
      {isMobile && (
        <Modal open={metaOpen} onClose={() => setMetaOpen(false)} title="Page settings" width={360}>
          <MetaPanel />
        </Modal>
      )}
    </div>
  );
};

// ── Pages Page ─────────────────────────────────────────
const PagesPage = () => {
  const [pages, setPages] = useState(INIT_PAGES_DATA);
  const [editing, setEditing] = useState(null);
  const [newModal, setNewModal] = useState(false);
  const [newForm, setNewForm] = useState({ title: '', slug: '/' });

  const pub   = pages.filter(p => p.status === 'published').length;
  const draft = pages.filter(p => p.status === 'draft').length;

  const changeStatus = (id, status) => {
    setPages(prev => prev.map(p => p.id === id ? { ...p, status, updated: 'just now' } : p));
    if (editing?.id === id) setEditing(prev => ({ ...prev, status }));
  };

  const createPage = () => {
    const newId = Math.max(...pages.map(p => p.id)) + 1;
    const newPage = { id: newId, ...newForm, status: 'draft', updated: 'just now', content: '' };
    setPages(prev => [...prev, newPage]);
    setEditing(newPage);
    setNewModal(false);
    setNewForm({ title: '', slug: '/' });
  };

  if (editing) return <PageEditor page={editing} onBack={() => setEditing(null)} onStatusChange={changeStatus} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TopBar title="Pages"
        right={<Btn variant="primary" onClick={() => setNewModal(true)}>+ New page</Btn>}
      />
      <div style={{ flex: 1, overflowY: 'auto', background: T.bg1, padding: 20 }}>
        {/* Summary line */}
        <div style={{ fontSize: 11, color: T.text2, marginBottom: 16, display: 'flex', gap: 8 }}>
          <span>{pages.length} pages</span>
          <span>·</span>
          <span style={{ color: T.green }}>{pub} published</span>
          <span>·</span>
          <span style={{ color: T.amber }}>{draft} draft</span>
        </div>
        {/* Card grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {pages.map(page => (
            <div key={page.id} onClick={() => setEditing(page)}
              style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 8, padding: '16px 18px', cursor: 'pointer', transition: 'border-color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = T.borderHover}
              onMouseLeave={e => e.currentTarget.style.borderColor = T.border}>
              <div style={{ fontSize: 10, color: T.green, fontFamily: 'Geist Mono, monospace', marginBottom: 10 }}>{page.slug}</div>
              <div style={{ fontFamily: 'Instrument Serif', fontStyle: 'italic', fontSize: 22, color: T.text0, marginBottom: 14, lineHeight: 1.2 }}>{page.title}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Badge type={page.status}>{page.status.toUpperCase()}</Badge>
                <span style={{ fontSize: 10, color: T.text2 }}>Updated {page.updated}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal open={newModal} onClose={() => setNewModal(false)} title="New page" width={400}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, color: T.text1, marginBottom: 5 }}>Title</div>
            <Input value={newForm.title} onChange={v => setNewForm(f => ({ ...f, title: v }))} placeholder="Page title" />
          </div>
          <div>
            <div style={{ fontSize: 10, color: T.text1, marginBottom: 5 }}>Slug</div>
            <Input value={newForm.slug} onChange={v => setNewForm(f => ({ ...f, slug: v }))} placeholder="/slug" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
            <Btn variant="default" onClick={() => setNewModal(false)}>Cancel</Btn>
            <Btn variant="primary" onClick={createPage} disabled={!newForm.title}>Create page</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ── Collections: Entry value renderer ─────────────────
const EntryVal = ({ val, field }) => {
  if (field.type === 'Boolean') return val
    ? <span style={{ color: T.green, fontSize: 11 }}>✓ true</span>
    : <span style={{ color: T.amber, fontSize: 11 }}>- false</span>;
  if (field.name === 'category') {
    const c = catColor[val] || T.text1;
    return <span style={{ background: `${c}20`, color: c, fontSize: 10, padding: '2px 7px', borderRadius: 3 }}>{val}</span>;
  }
  return <span style={{ fontSize: 11, color: T.text0 }}>{String(val ?? '')}</span>;
};

// ── Collections Page ───────────────────────────────────
const CollectionsPage = () => {
  const isMobile = useIsMobile();
  const [colls, setColls]       = useState(INIT_COLLECTIONS);
  const [selId, setSelId]       = useState('footer_links');
  const [mode, setMode]         = useState('entries');
  const [hovRow, setHovRow]     = useState(null);
  const [addFieldModal, setAddFieldModal] = useState(false);
  const [newCollModal, setNewCollModal]   = useState(false);
  const [collsOpen, setCollsOpen]        = useState(false); // mobile panel
  const [fieldForm, setFieldForm] = useState({ name: '', type: 'Text', required: false, unique: false, localised: false });
  const [newCollName, setNewCollName] = useState('');

  const coll = colls.find(c => c.id === selId);

  const addField = () => {
    setColls(prev => prev.map(c => c.id === selId ? { ...c, fields: [...c.fields, { name: fieldForm.name, type: fieldForm.type, required: fieldForm.required }] } : c));
    setAddFieldModal(false);
    setFieldForm({ name: '', type: 'Text', required: false, unique: false, localised: false });
  };

  const addColl = () => {
    if (!newCollName.trim()) return;
    const id = newCollName.toLowerCase().replace(/\s+/g, '_');
    setColls(prev => [...prev, { id, name: id, count: 0, fields: [{ name: 'title', type: 'Text', required: true }], entries: [] }]);
    setSelId(id);
    setNewCollModal(false);
    setNewCollName('');
  };

  const FIELD_TYPES = ['Text','Number','Boolean','Rich text','Media','Date'];

  const CollectionList = () => (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px 8px', fontSize: 9, color: T.text2, textTransform: 'uppercase', letterSpacing: '0.07em', borderBottom: `1px solid ${T.border}` }}>
        <span>Collections</span>
        <button onClick={() => setNewCollModal(true)} style={{ background: 'none', border: 'none', color: T.text1, cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>+</button>
      </div>
      {colls.map(c => {
        const on = c.id === selId;
        return (
          <button key={c.id} onClick={() => { setSelId(c.id); setMode('entries'); setCollsOpen(false); }}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 7, padding: '9px 14px', background: on ? T.purpleFaint : 'transparent', border: 'none', borderLeft: `2px solid ${on ? T.purple : 'transparent'}`, color: on ? T.text0 : T.text1, cursor: 'pointer', fontSize: 11, textAlign: 'left' }}>
            <span style={{ fontSize: 9, color: T.text2 }}>≡</span>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
            <span style={{ fontSize: 9, color: on ? T.purple : T.text2, background: T.bg3, padding: '1px 5px', borderRadius: 3, flexShrink: 0 }}>{c.count}</span>
          </button>
        );
      })}
    </>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TopBar title="Collections"
        right={<>
          {isMobile && <Btn size="sm" variant="default" onClick={() => setCollsOpen(true)}>≡ {coll?.name}</Btn>}
          <Btn variant="primary" onClick={() => setNewCollModal(true)}>+{!isMobile && ' New collection'}</Btn>
        </>}
      />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Desktop left panel */}
        {!isMobile && (
          <div style={{ width: 190, borderRight: `1px solid ${T.border}`, background: T.bg0, display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto' }}>
            <CollectionList />
          </div>
        )}

        {/* Mobile: collection picker as modal */}
        {isMobile && (
          <Modal open={collsOpen} onClose={() => setCollsOpen(false)} title="Collections" width={320}>
            <div style={{ margin: '-16px' }}>
              <CollectionList />
            </div>
          </Modal>
        )}

        {/* Main content */}
        {coll && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: T.bg1 }}>
            {/* Sub-header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderBottom: `1px solid ${T.border}`, background: T.bg0, flexShrink: 0, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'Instrument Serif', fontStyle: 'italic', fontSize: 17, color: T.text0 }}>{coll.name}</span>
              {!isMobile && <span style={{ fontSize: 10, color: T.text2 }}>{coll.count} entries · {coll.fields.length} fields</span>}
              <div style={{ flex: 1 }} />
              <button onClick={() => setMode(mode === 'schema' ? 'entries' : 'schema')}
                style={{ background: mode === 'schema' ? T.purple : T.bg3, border: `1px solid ${mode === 'schema' ? T.purple : T.border}`, color: mode === 'schema' ? '#fff' : T.text1, padding: '3px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>
                Schema
              </button>
              <Btn size="sm" variant="default">+ Add entry</Btn>
            </div>

            {mode === 'entries' ? (
              <div style={{ flex: 1, overflowY: 'auto' }}>
                <div style={{ overflowX: 'auto' }}>
                  {/* Table header */}
                  <div style={{ display: 'flex', padding: '0 14px', borderBottom: `1px solid ${T.border}`, minHeight: 32, alignItems: 'center', background: T.bg0, minWidth: 400 }}>
                    {coll.fields.map(f => (
                      <div key={f.name} style={{ flex: 1, fontSize: 10, color: T.text2, minWidth: 80 }}>{f.name}</div>
                    ))}
                    <div style={{ width: 48 }} />
                  </div>
                  {/* Entries */}
                  {coll.entries.map((entry, i) => (
                    <div key={i} onMouseEnter={() => setHovRow(i)} onMouseLeave={() => setHovRow(null)}
                      style={{ display: 'flex', alignItems: 'center', padding: '0 14px', minHeight: 40, borderBottom: `1px solid ${T.border}`, background: hovRow === i ? 'rgba(255,255,255,0.025)' : 'transparent', minWidth: 400 }}>
                      {coll.fields.map(f => (
                        <div key={f.name} style={{ flex: 1, minWidth: 80 }}>
                          <EntryVal val={entry[f.name]} field={f} />
                        </div>
                      ))}
                      <div style={{ width: 48, display: 'flex', gap: 4, justifyContent: 'flex-end', opacity: hovRow === i ? 1 : 0, transition: 'opacity 0.13s' }}>
                        <button style={{ background: 'none', border: 'none', color: T.text1, cursor: 'pointer', fontSize: 12, padding: '3px 5px' }}>✎</button>
                        <button style={{ background: 'none', border: 'none', color: T.coral, cursor: 'pointer', fontSize: 12, padding: '3px 5px' }}>⊗</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '10px 14px' }}>
                  <button style={{ background: 'none', border: 'none', color: T.text2, cursor: 'pointer', fontSize: 11 }}>+ Add entry</button>
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                  {coll.fields.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 5, padding: '10px 14px' }}>
                      <span style={{ fontSize: 10, color: T.text2, width: 12 }}>≡</span>
                      <span style={{ fontSize: 12, color: T.text0, flex: 1 }}>{f.name}</span>
                      <span style={{ background: T.purpleFaint, color: T.purple, fontSize: 10, padding: '2px 7px', borderRadius: 3 }}>{f.type}</span>
                      {f.required && <span style={{ background: T.greenFaint, color: T.green, fontSize: 10, padding: '2px 7px', borderRadius: 3 }}>req</span>}
                      <button style={{ background: 'none', border: 'none', color: T.coral, cursor: 'pointer', fontSize: 12 }}>⊗</button>
                    </div>
                  ))}
                </div>
                <button onClick={() => setAddFieldModal(true)}
                  style={{ background: T.bg3, border: `1px dashed ${T.border}`, borderRadius: 5, padding: '10px 14px', width: '100%', color: T.text1, cursor: 'pointer', fontSize: 11, textAlign: 'left' }}>
                  + Add field
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Field Modal */}
      <Modal open={addFieldModal} onClose={() => setAddFieldModal(false)} title="Add field" width={380}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontSize: 10, color: T.text1, marginBottom: 5 }}>Field name</div>
            <Input value={fieldForm.name} onChange={v => setFieldForm(f => ({ ...f, name: v }))} placeholder="e.g. title" />
          </div>
          <div>
            <div style={{ fontSize: 10, color: T.text1, marginBottom: 8 }}>Field type</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
              {FIELD_TYPES.map(type => {
                const icons = { Text:'T', Number:'#', Boolean:'○', 'Rich text':'≡', Media:'▣', Date:'⊡' };
                const on = fieldForm.type === type;
                return (
                  <button key={type} onClick={() => setFieldForm(f => ({ ...f, type }))}
                    style={{ background: on ? T.purpleFaint : T.bg3, border: `1px solid ${on ? T.purple : T.border}`, borderRadius: 5, padding: '10px 6px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: 18, color: on ? T.purple : T.text1 }}>{icons[type]}</span>
                    <span style={{ fontSize: 10, color: on ? T.purple : T.text1 }}>{type}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {[['required','Required'],['unique','Unique'],['localised','Localised']].map(([k, label]) => (
              <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 11, color: T.text1 }}>
                <input type="checkbox" checked={fieldForm[k]} onChange={e => setFieldForm(f => ({ ...f, [k]: e.target.checked }))} style={{ accentColor: T.purple }} />
                {label}
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4, borderTop: `1px solid ${T.border}` }}>
            <Btn variant="default" onClick={() => setAddFieldModal(false)}>Cancel</Btn>
            <Btn variant="primary" onClick={addField} disabled={!fieldForm.name}>Add field</Btn>
          </div>
        </div>
      </Modal>

      {/* New Collection Modal */}
      <Modal open={newCollModal} onClose={() => setNewCollModal(false)} title="New collection" width={360}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, color: T.text1, marginBottom: 5 }}>Collection name</div>
            <Input value={newCollName} onChange={setNewCollName} placeholder="e.g. blog_posts" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Btn variant="default" onClick={() => setNewCollModal(false)}>Cancel</Btn>
            <Btn variant="primary" onClick={addColl} disabled={!newCollName}>Create</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
};

Object.assign(window, { PagesPage, CollectionsPage, INIT_PAGES_DATA });
