import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

const AVATARS = ['🂡','🂱','🃁','🃑','🂢','🂲','🃂','🃒']

function initials(name) {
  return name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

const COLORS = [
  { bg: '#2a1f3d', fg: '#c4b5fd' },
  { bg: '#1a2e1a', fg: '#86efac' },
  { bg: '#2e1a1a', fg: '#fca5a5' },
  { bg: '#2e2510', fg: '#fcd34d' },
  { bg: '#0f2535', fg: '#7dd3fc' },
  { bg: '#2a1a2e', fg: '#f0abfc' },
  { bg: '#1a2e2a', fg: '#5eead4' },
  { bg: '#2e1f10', fg: '#fdba74' },
]

function Avatar({ name, idx, size = 34 }) {
  const c = COLORS[idx % COLORS.length]
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: c.bg, color: c.fg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 700, flexShrink: 0, border: `1px solid ${c.fg}22`
    }}>
      {initials(name)}
    </div>
  )
}

function MoneyDisplay({ amount, size = 'md' }) {
  const abs = Math.abs(amount)
  const color = amount > 0 ? 'var(--green)' : amount < 0 ? 'var(--red)' : 'var(--text2)'
  const prefix = amount > 0 ? '+' : amount < 0 ? '-' : ''
  const fs = size === 'lg' ? 28 : size === 'sm' ? 13 : 16
  return (
    <span style={{ color, fontFamily: "'DM Mono', monospace", fontSize: fs, fontWeight: 500 }}>
      {prefix}₪{abs}
    </span>
  )
}

function Card({ children, style }) {
  return (
    <div style={{
      background: 'var(--bg2)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '16px 20px',
      marginBottom: 12,
      ...style
    }}>
      {children}
    </div>
  )
}

function Btn({ children, onClick, variant = 'default', style, disabled }) {
  const styles = {
    default: { background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text)', padding: '8px 18px', borderRadius: 'var(--radius)', fontSize: 14 },
    primary: { background: 'var(--gold)', border: 'none', color: '#0d0d0f', padding: '10px 22px', borderRadius: 'var(--radius)', fontSize: 14, fontWeight: 700 },
    danger: { background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--red)', padding: '6px 12px', borderRadius: 'var(--radius)', fontSize: 13 },
    ghost: { background: 'transparent', border: 'none', color: 'var(--text2)', padding: '6px 10px', borderRadius: 'var(--radius)', fontSize: 13 },
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ ...styles[variant], opacity: disabled ? 0.4 : 1, cursor: disabled ? 'not-allowed' : 'pointer', ...style }}
    >
      {children}
    </button>
  )
}

function TabBar({ active, onChange }) {
  const tabs = [
    { id: 'players', label: 'Players' },
    { id: 'session', label: 'New game' },
    { id: 'history', label: 'History' },
    { id: 'settle', label: 'Settle up' },
  ]
  return (
    <div style={{ display: 'flex', gap: 4, background: 'var(--bg2)', padding: 4, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', marginBottom: 24 }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            flex: 1, padding: '9px 0', borderRadius: 10, border: 'none', fontSize: 13, fontFamily: "'Syne', sans-serif", fontWeight: active === t.id ? 700 : 400,
            background: active === t.id ? 'var(--bg4)' : 'transparent',
            color: active === t.id ? 'var(--text)' : 'var(--text2)',
            transition: 'all 0.15s',
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

// ── PLAYERS TAB ──────────────────────────────────────────────────────
function PlayersTab({ players, sessions, onAdd, onRemove, loading }) {
  const [name, setName] = useState('')

  function getNet(player) {
    return sessions.reduce((sum, s) => {
      const r = s.results?.find(r => r.player_id === player.id)
      return r ? sum + r.cashout - r.buyin : sum
    }, 0)
  }

  function getGames(player) {
    return sessions.filter(s => s.results?.some(r => r.player_id === player.id)).length
  }

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Player name" onKeyDown={e => e.key === 'Enter' && name.trim() && (onAdd(name.trim()), setName(''))} />
          <Btn variant="primary" onClick={() => { if (name.trim()) { onAdd(name.trim()); setName('') } }}>Add</Btn>
        </div>
      </Card>

      {loading && <div style={{ color: 'var(--text3)', textAlign: 'center', padding: '2rem', fontSize: 14 }}>Loading...</div>}

      {!loading && players.length === 0 && (
        <div style={{ color: 'var(--text2)', textAlign: 'center', padding: '2rem', fontSize: 14 }}>
          No players yet. Add your crew above.
        </div>
      )}

      {players.map((p, i) => {
        const net = getNet(p)
        const games = getGames(p)
        return (
          <Card key={p.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar name={p.name} idx={i} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{p.name}</div>
                <div style={{ color: 'var(--text3)', fontSize: 12, fontFamily: "'DM Mono', monospace", marginTop: 2 }}>
                  {games} game{games !== 1 ? 's' : ''}
                </div>
              </div>
              <MoneyDisplay amount={net} />
              <Btn variant="danger" onClick={() => onRemove(p.id)}>✕</Btn>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

// ── SESSION TAB ──────────────────────────────────────────────────────
function SessionTab({ players, onSave }) {
  const [date, setDate] = useState('')
  const [buyin, setBuyin] = useState('50')
  const [selected, setSelected] = useState({})
  const [rebuys, setRebuys] = useState({})
  const [cashouts, setCashouts] = useState({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [saving, setSaving] = useState(false)

  function toggle(id) {
    const next = { ...selected, [id]: !selected[id] }
    setSelected(next)
    if (next[id] && !cashouts[id]) setCashouts(c => ({ ...c, [id]: buyin }))
  }

  const participating = players.filter(p => selected[p.id])

  const totalBuyin = participating.reduce((sum, p) => {
    const b = parseInt(buyin) || 0
    const r = parseInt(rebuys[p.id]) || 0
    return sum + b * (1 + r)
  }, 0)

  const totalCashout = participating.reduce((sum, p) => sum + (parseInt(cashouts[p.id]) || 0), 0)
  const diff = totalCashout - totalBuyin
  const balanced = diff === 0 && participating.length >= 2

  async function handleSave() {
    setError('')
    if (participating.length < 2) { setError('Select at least 2 players.'); return }
    if (diff !== 0) { setError(`Money doesn't balance: diff is ${diff > 0 ? '+' : ''}₪${diff}.`); return }

    setSaving(true)
    const results = participating.map(p => ({
      player_id: p.id,
      buyin: (parseInt(buyin) || 0) * (1 + (parseInt(rebuys[p.id]) || 0)),
      cashout: parseInt(cashouts[p.id]) || 0,
      rebuys: parseInt(rebuys[p.id]) || 0,
    }))
    const ok = await onSave({ date: date || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }), buyin_amount: parseInt(buyin) || 0, results })
    setSaving(false)
    if (ok) {
      setSuccess(true)
      setSelected({}); setRebuys({}); setCashouts({}); setDate('')
      setTimeout(() => setSuccess(false), 3000)
    } else {
      setError('Failed to save. Check your connection.')
    }
  }

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>DATE</label>
            <input value={date} onChange={e => setDate(e.target.value)} placeholder={new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} />
          </div>
          <div style={{ width: 110 }}>
            <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>BUY-IN (₪)</label>
            <input type="number" value={buyin} onChange={e => setBuyin(e.target.value)} min="0" />
          </div>
        </div>
      </Card>

      <Card>
        <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 14, letterSpacing: '0.05em' }}>SELECT PLAYERS & ENTER RESULTS</div>
        {players.length === 0 && <div style={{ color: 'var(--text3)', fontSize: 14 }}>Add players first.</div>}
        {players.map((p, i) => (
          <div key={p.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="checkbox" id={`chk-${p.id}`} checked={!!selected[p.id]} onChange={() => toggle(p.id)}
                style={{ width: 18, height: 18, accentColor: 'var(--gold)', flexShrink: 0, cursor: 'pointer', background: 'transparent' }} />
              <Avatar name={p.name} idx={i} size={28} />
              <label htmlFor={`chk-${p.id}`} style={{ flex: 1, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>{p.name}</label>
            </div>
            {selected[p.id] && (
              <div style={{ display: 'flex', gap: 10, marginTop: 10, paddingLeft: 28 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>REBUYS</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={() => setRebuys(r => ({ ...r, [p.id]: Math.max(0, (parseInt(r[p.id]) || 0) - 1) }))}
                      style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg4)', border: '1px solid var(--border2)', color: 'var(--text)', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >−</button>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 16, minWidth: 20, textAlign: 'center' }}>
                      {rebuys[p.id] || 0}
                    </span>
                    <button
                      onClick={() => setRebuys(r => ({ ...r, [p.id]: (parseInt(r[p.id]) || 0) + 1 }))}
                      style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg4)', border: '1px solid var(--border2)', color: 'var(--text)', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >+</button>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>CASH-OUT (₪)</div>
                  <input type="number" value={cashouts[p.id] || ''} min="0"
                    onChange={e => setCashouts(c => ({ ...c, [p.id]: e.target.value }))} />
                </div>
              </div>
            )}
          </div>
        ))}
      </Card>

      {participating.length >= 2 && (
        <Card style={{ border: `1px solid ${balanced ? 'rgba(34,197,94,0.3)' : diff !== 0 ? 'rgba(239,68,68,0.3)' : 'var(--border)'}` }}>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 10, letterSpacing: '0.05em' }}>BALANCE CHECK</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 14, color: 'var(--text2)' }}>Total buy-in</span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14 }}>₪{totalBuyin}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 14, color: 'var(--text2)' }}>Total cash-out</span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14 }}>₪{totalCashout}</span>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>
              {balanced ? '✓ Money checks out' : `⚠ Off by`}
            </span>
            {!balanced && <MoneyDisplay amount={diff} />}
            {balanced && <span style={{ color: 'var(--green)', fontFamily: "'DM Mono', monospace", fontSize: 14 }}>₪0</span>}
          </div>
        </Card>
      )}

      {error && <div style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12, padding: '10px 14px', background: 'var(--red-dim)', borderRadius: 'var(--radius)' }}>{error}</div>}
      {success && <div style={{ color: 'var(--green)', fontSize: 13, marginBottom: 12, padding: '10px 14px', background: 'var(--green-dim)', borderRadius: 'var(--radius)' }}>✓ Session saved!</div>}

      <Btn variant="primary" onClick={handleSave} disabled={saving} style={{ width: '100%' }}>
        {saving ? 'Saving...' : 'Save session'}
      </Btn>
    </div>
  )
}

// ── HISTORY TAB ──────────────────────────────────────────────────────
function HistoryTab({ players, sessions, onDelete }) {
  if (sessions.length === 0) return (
    <div style={{ color: 'var(--text2)', textAlign: 'center', padding: '2rem', fontSize: 14 }}>No sessions recorded yet.</div>
  )

  function playerName(id) { return players.find(p => p.id === id)?.name || '?' }
  function playerIdx(id) { return players.findIndex(p => p.id === id) }

  return (
    <div>
      {sessions.map(s => (
        <Card key={s.id}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{s.date}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: "'DM Mono', monospace", marginTop: 2 }}>
                {s.results?.length} players · ₪{s.buyin_amount} buy-in
              </div>
            </div>
            <Btn variant="danger" onClick={() => onDelete(s.id)}>Delete</Btn>
          </div>
          {s.results?.map(r => {
            const net = r.cashout - r.buyin
            const idx = playerIdx(r.player_id)
            return (
              <div key={r.player_id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderTop: '1px solid var(--border)' }}>
                <Avatar name={playerName(r.player_id)} idx={idx} size={28} />
                <span style={{ flex: 1, fontSize: 14 }}>{playerName(r.player_id)}</span>
                <span style={{ fontSize: 12, color: 'var(--text3)', fontFamily: "'DM Mono', monospace" }}>in ₪{r.buyin}</span>
                <MoneyDisplay amount={net} size="sm" />
              </div>
            )
          })}
        </Card>
      ))}
    </div>
  )
}

// ── SETTLE UP TAB ──────────────────────────────────────────────────────
function SettleTab({ players, sessions }) {
  const balances = {}
  players.forEach(p => { balances[p.id] = 0 })
  sessions.forEach(s => {
    s.results?.forEach(r => { balances[r.player_id] = (balances[r.player_id] || 0) + r.cashout - r.buyin })
  })

  const sorted = players
    .map(p => ({ ...p, net: balances[p.id] || 0 }))
    .sort((a, b) => b.net - a.net)

  const winners = sorted.filter(p => p.net > 0).map(p => ({ ...p, rem: p.net }))
  const losers = sorted.filter(p => p.net < 0).map(p => ({ ...p, rem: -p.net }))
  const debts = []
  let wi = 0, li = 0
  while (wi < winners.length && li < losers.length) {
    const amt = Math.min(winners[wi].rem, losers[li].rem)
    if (amt > 0) debts.push({ from: losers[li], to: winners[wi], amount: amt })
    winners[wi].rem -= amt; losers[li].rem -= amt
    if (winners[wi].rem < 1) wi++
    if (losers[li].rem < 1) li++
  }

  const totalSessions = sessions.length
  const totalPot = sessions.reduce((s, sess) => s + (sess.buyin_amount || 0) * (sess.results?.length || 0), 0)

  if (players.length === 0) return (
    <div style={{ color: 'var(--text2)', textAlign: 'center', padding: '2rem', fontSize: 14 }}>Add players first.</div>
  )

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'Sessions', val: totalSessions },
          { label: 'Players', val: players.length },
          { label: 'Transactions', val: debts.length },
        ].map(m => (
          <div key={m.label} style={{ background: 'var(--bg2)', borderRadius: 'var(--radius)', padding: '12px', textAlign: 'center', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4, letterSpacing: '0.05em' }}>{m.label.toUpperCase()}</div>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{m.val}</div>
          </div>
        ))}
      </div>

      <Card>
        <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 14, letterSpacing: '0.05em' }}>ALL-TIME STANDINGS</div>
        {sorted.map((p, i) => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: i < sorted.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <span style={{ fontSize: 12, color: 'var(--text3)', fontFamily: "'DM Mono', monospace", width: 20 }}>{i + 1}</span>
            <Avatar name={p.name} idx={players.findIndex(x => x.id === p.id)} size={28} />
            <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{p.name}</span>
            <MoneyDisplay amount={p.net} />
          </div>
        ))}
      </Card>

      <Card>
        <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 14, letterSpacing: '0.05em' }}>WHO PAYS WHO</div>
        {debts.length === 0 && <div style={{ color: 'var(--text3)', fontSize: 14 }}>Everyone is settled up!</div>}
        {debts.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', borderBottom: i < debts.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <Avatar name={d.from.name} idx={players.findIndex(p => p.id === d.from.id)} size={28} />
            <span style={{ fontSize: 14 }}>{d.from.name}</span>
            <span style={{ color: 'var(--text3)', fontSize: 13, margin: '0 4px' }}>→</span>
            <Avatar name={d.to.name} idx={players.findIndex(p => p.id === d.to.id)} size={28} />
            <span style={{ fontSize: 14, flex: 1 }}>{d.to.name}</span>
            <span style={{ fontFamily: "'DM Mono', monospace", color: 'var(--gold)', fontWeight: 600, fontSize: 15 }}>₪{d.amount}</span>
          </div>
        ))}
      </Card>
    </div>
  )
}

// ── MAIN APP ──────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState('players')
  const [players, setPlayers] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const [{ data: ps }, { data: ss }] = await Promise.all([
      supabase.from('players').select('*').order('created_at'),
      supabase.from('sessions').select('*, results(*)').order('created_at', { ascending: false }),
    ])
    if (ps) setPlayers(ps)
    if (ss) setSessions(ss)
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  async function addPlayer(name) {
    const { data } = await supabase.from('players').insert({ name }).select().single()
    if (data) setPlayers(p => [...p, data])
  }

  async function removePlayer(id) {
    await supabase.from('players').delete().eq('id', id)
    setPlayers(p => p.filter(x => x.id !== id))
  }

  async function saveSession({ date, buyin_amount, results }) {
    const { data: sess } = await supabase.from('sessions').insert({ date, buyin_amount }).select().single()
    if (!sess) return false
    const rows = results.map(r => ({ ...r, session_id: sess.id }))
    const { error } = await supabase.from('results').insert(rows)
    if (error) return false
    await fetchAll()
    setTab('history')
    return true
  }

  async function deleteSession(id) {
    await supabase.from('results').delete().eq('session_id', id)
    await supabase.from('sessions').delete().eq('id', id)
    setSessions(s => s.filter(x => x.id !== id))
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--gold)' }}>
          POKER
        </h1>
        <span style={{ fontSize: 28, fontWeight: 400, color: 'var(--text2)' }}>TRACKER</span>
      </div>

      <TabBar active={tab} onChange={setTab} />

      {tab === 'players' && <PlayersTab players={players} sessions={sessions} onAdd={addPlayer} onRemove={removePlayer} loading={loading} />}
      {tab === 'session' && <SessionTab players={players} onSave={saveSession} />}
      {tab === 'history' && <HistoryTab players={players} sessions={sessions} onDelete={deleteSession} />}
      {tab === 'settle' && <SettleTab players={players} sessions={sessions} />}
    </div>
  )
}
