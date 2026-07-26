/* ============================================================
   KIN — cloud family module (Supabase, zero dependencies)
   INERT until configured: with no keys, every method is a no-op and
   the app runs exactly as before (fully local). Once the user pastes
   their Supabase URL + anon key + family code, a real shared family
   leaderboard turns on.

   Security model: a family is a shared code (the "secret"). Each device
   has a random id and upserts one row into a `members` table. No login,
   no passwords, no personal data beyond the display name you choose —
   appropriate for a small trusted family group.
   ============================================================ */
const Cloud = (() => {
  const CFG_KEY = 'kin_cloud_cfg';
  const DEV_KEY = 'kin_device_id';
  let cfg = null;
  let members = null;      // cached leaderboard rows
  let status = 'idle';     // idle | loading | ok | error
  let lastError = '';

  function load() {
    try { cfg = JSON.parse(localStorage.getItem(CFG_KEY) || 'null'); } catch { cfg = null; }
    return cfg;
  }
  function deviceId() {
    let d = localStorage.getItem(DEV_KEY);
    if (!d) {
      d = (self.crypto && crypto.randomUUID) ? crypto.randomUUID()
        : 'dev-' + Math.random().toString(36).slice(2) + '-' + (new Date().getTime());
      localStorage.setItem(DEV_KEY, d);
    }
    return d;
  }
  const configured = () => !!(cfg && cfg.url && cfg.key);
  const enabled = () => !!(cfg && cfg.url && cfg.key && cfg.family && cfg.name);
  const base = () => cfg.url.replace(/\/+$/, '');
  // Works with both key types: legacy anon JWT (eyJ...) and the new
  // publishable key (sb_publishable_...). The Bearer header is only meaningful
  // for a JWT; for anon/public access the apikey header is what authorizes.
  const authHeaders = (key) => { const h = { apikey: key }; if (/^eyJ/.test(key)) h.Authorization = 'Bearer ' + key; return h; };
  const headers = () => ({ ...authHeaders(cfg.key), 'Content-Type': 'application/json' });

  function save(patch) { cfg = { ...(cfg || {}), ...patch }; localStorage.setItem(CFG_KEY, JSON.stringify(cfg)); }
  function clear() { cfg = null; members = null; status = 'idle'; localStorage.removeItem(CFG_KEY); }
  function familyCode() { return (cfg && cfg.family) || ''; }

  async function syncSelf(stats) {
    if (!enabled()) return;
    const row = {
      device_id: deviceId(), family: cfg.family, name: cfg.name,
      workouts: stats.workouts | 0, streak: stats.streak | 0, updated_at: new Date().toISOString()
    };
    await fetch(base() + '/rest/v1/members?on_conflict=device_id,family', {
      method: 'POST',
      headers: { ...headers(), Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify(row)
    });
  }

  async function refresh(stats) {
    if (!enabled()) return;
    status = 'loading';
    try {
      if (stats) await syncSelf(stats);
      const url = base() + '/rest/v1/members?family=eq.' + encodeURIComponent(cfg.family) +
        '&order=streak.desc,workouts.desc&select=name,workouts,streak,device_id';
      const res = await fetch(url, { headers: headers() });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      members = await res.json();
      status = 'ok'; lastError = '';
    } catch (e) { status = 'error'; lastError = e.message || 'network'; }
  }

  // Validate URL + key + that the `members` table exists.
  async function test(tmp) {
    const c = tmp || cfg;
    try {
      const th = { apikey: c.key }; if (/^eyJ/.test(c.key)) th.Authorization = 'Bearer ' + c.key;
      const res = await fetch(c.url.replace(/\/+$/, '') + '/rest/v1/members?limit=1&select=device_id', { headers: th });
      if (res.ok) return { ok: true };
      if (res.status === 404) return { ok: false, error: 'הטבלה members לא קיימת — הרץ את ה-SQL' };
      if (res.status === 401) return { ok: false, error: 'המפתח (anon key) שגוי' };
      return { ok: false, error: 'HTTP ' + res.status };
    } catch (e) { return { ok: false, error: 'לא הצלחתי להתחבר ל-URL' }; }
  }

  load();
  return {
    load, save, clear, deviceId, configured, enabled, familyCode, syncSelf, refresh, test,
    get cfg() { return cfg; },
    get members() { return members; },
    get status() { return status; },
    get lastError() { return lastError; },
    resetCache() { members = null; status = 'idle'; }
  };
})();
