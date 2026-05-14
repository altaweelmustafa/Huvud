import { useState, useEffect, useCallback } from "react";
import { FONT, WHITE, TEXT, STORAGE_KEY } from "./constants";
import { fetchNodes, fetchUsers }          from "./api";

import Sidebar       from "./components/Sidebar";
import LoginScreen   from "./components/LoginScreen";
import PasswordGate  from "./components/PasswordGate";

import OverviewPage    from "./components/pages/OverviewPage";
import MapPage         from "./components/pages/MapPage";
import NodesPage       from "./components/pages/NodesPage";
import UsersPage       from "./components/pages/UsersPage";
import CoordinatesPage from "./components/pages/CoordinatesPage";
import UptimePage      from "./components/pages/UptimePage";
import SettingsPage    from "./components/pages/SettingsPage";

export default function App() {
  const [screen,   setScreen]   = useState("loading");
  const [config,   setConfig]   = useState(null);
  const [active,   setActive]   = useState("map");
  const [sideOpen, setSideOpen] = useState(true);
  const [nodes,    setNodes]    = useState([]);
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  // Check localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) { setConfig(JSON.parse(saved)); setScreen("locked"); }
    else { setScreen("login"); }
  }, []);

  const refresh = useCallback(async (cfg) => {
    const c = cfg ?? config;
    if (!c) return;
    setLoading(true); setError(null);
    try {
      const [n, u] = await Promise.all([fetchNodes(c.url, c.key), fetchUsers(c.url, c.key)]);
      setNodes(n); setUsers(u);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [config]);

  // Auto-refresh every 30s when app is unlocked
  useEffect(() => {
    if (screen !== "app") return;
    refresh();
    const iv = setInterval(() => refresh(), 30_000);
    return () => clearInterval(iv);
  }, [screen]);

  function handleLogin(cfg)  { setConfig(cfg); setScreen("app"); refresh(cfg); }
  function handleUnlock()    { setScreen("app"); refresh(); }
  function handleLogout()    {
    localStorage.removeItem(STORAGE_KEY);
    setConfig(null); setNodes([]); setUsers([]);
    setScreen("login");
  }

  if (screen === "loading") return null;
  if (screen === "login")   return <LoginScreen onLogin={handleLogin} />;
  if (screen === "locked")  return <PasswordGate savedPass={config.pass} onUnlock={handleUnlock} />;

  const pages = {
    overview:    <OverviewPage    nodes={nodes} users={users} />,
    map:         <MapPage         nodes={nodes} />,
    nodes:       <NodesPage       nodes={nodes} />,
    users:       <UsersPage       nodes={nodes} users={users} />,
    coordinates: <CoordinatesPage nodes={nodes} />,
    uptime:      <UptimePage      nodes={nodes} />,
    settings:    <SettingsPage    config={config} setConfig={setConfig} refetch={refresh} loading={loading} error={error} onLogout={handleLogout} />,
  };

  return (
    <div style={{
      fontFamily: FONT, background: WHITE, color: TEXT,
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      display: "flex", overflow: "hidden",
    }}>
      <Sidebar active={active} setActive={setActive} open={sideOpen} setOpen={setSideOpen} />
      <div style={{
        flex: 1, minWidth: 0, display: "flex", flexDirection: "column",
        overflowY: active === "map" ? "hidden" : "auto",
      }}>
        {pages[active] ?? null}
      </div>
    </div>
  );
}
