import { UPTIME_KUMA_URL, UPTIME_KUMA_SLUG } from "./constants";

export async function fetchNodes(url, key) {
  const res = await fetch(`${url}/api/v1/node`, {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (!res.ok) throw new Error(`headscale ${res.status}`);
  const data = await res.json();
  return (data.nodes ?? []).map(n => ({
    id:       n.id,
    name:     n.name ?? "—",
    ip:       n.ipAddresses?.[0] ?? "—",
    district: n.user?.name?.toUpperCase() ?? (n.name ?? "").split("-")[0].toUpperCase() ?? "UNKNOWN",
    role:     (n.name ?? "").split("-")[1] ?? "—",
    status:   n.online ? "up" : "down",
    lastSeen: n.lastSeen ?? null,
    user:     n.user?.name ?? "—",
  }));
}

export async function fetchUsers(url, key) {
  try {
    const res = await fetch(`${url}/api/v1/user`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.users ?? []).map(u => ({
      id:        u.id,
      name:      u.name,
      label:     u.name.charAt(0).toUpperCase() + u.name.slice(1),
      createdAt: u.createdAt,
    }));
  } catch { return []; }
}

function extractHost(url) {
  if (!url) return null;
  try { return new URL(url).hostname; }
  catch { return null; }
}

export async function fetchUptimeKuma() {
  if (!UPTIME_KUMA_URL) return null;
  try {
    const [heartbeatRes, pageRes] = await Promise.all([
      fetch(`${UPTIME_KUMA_URL}/api/status-page/heartbeat/${UPTIME_KUMA_SLUG}`),
      fetch(`${UPTIME_KUMA_URL}/api/status-page/${UPTIME_KUMA_SLUG}`),
    ]);
    if (!heartbeatRes.ok) return null;
    const heartbeat = await heartbeatRes.json();
    const page      = pageRes.ok ? await pageRes.json() : null;

    const nameMap = {};
    (page?.publicGroupList ?? []).forEach(group => {
      (group.monitorList ?? []).forEach(m => {
        nameMap[String(m.id)] = {
          name:     m.name,
          type:     m.type,
          url:      m.url ?? null,
          hostname: m.hostname ?? extractHost(m.url) ?? null,
        };
      });
    });

    return { ...heartbeat, nameMap };
  } catch { return null; }
}

export function parseUptimeKuma(data) {
  if (!data) return {};
  const map = {};
  const { heartbeatList = {}, uptimeList = {}, nameMap = {} } = data;

  Object.entries(heartbeatList).forEach(([id, beats]) => {
    const latest   = beats[beats.length - 1];
    const uptime24 = uptimeList[`${id}_24`] ?? null;
    const meta     = nameMap[id] ?? {};
    const key      = meta.name ?? `monitor-${id}`;
    map[key] = {
      up:       latest?.status === 1,
      ping:     latest?.ping ?? null,
      uptime:   uptime24 !== null ? Math.round(uptime24 * 100) : null,
      type:     meta.type ?? "—",
      hostname: meta.hostname ?? null,
      url:      meta.url ?? null,
    };
  });
  return map;
}
