# Huvud

A self-hosted network operations dashboard for the West Bank hospital mesh. Built with React, pulls live data from Headscale, renders a real map with Leaflet, and runs fully in-browser with no backend of its own.

![overview](./imgs/Pasted%20image%2020260514011522.png)

---

## Tabs

### Overview

The landing summary. Shows total nodes, online/offline count, uptime percentage, and district count at a glance. Below that, a district coverage table with a progress bar per district, and a full node list at the bottom.

---

### Map

A live OpenStreetMap with a pin for every configured node.

- **Green** — node is registered and online
- **Red** — node is registered and offline
- **Gray** — location is configured in `NODE_LOCATIONS` but the node hasn't joined yet

Click any pin to see hostname, IP, district, status, and exact coordinates. The right panel lists all pins — clicking one flies the map to that location.

The map loads even with zero registered nodes.

![map](imgs/Screencast_20260514_011727.gif)

---

### Nodes

A searchable table of all registered nodes. Filter by name, IP, or district. Click any row to expand a full detail panel below the table showing hostname, IP, district, role, status, last seen timestamp, tunnel type, and GPS coordinates if configured.

---

### Districts

One section per district, each district being a Headscale user. Shows a coverage progress bar and a node table per district. Districts with no nodes show an empty state. New districts appear automatically when you create a new user in Headscale.

![districts](./imgs/Pasted%20image%2020260514012057.png)

---

### Uptime

Shows overall system status derived from the Headscale `online` field. Highlights offline nodes at the top, then shows all nodes with their last seen timestamps. Refreshes every 30 seconds automatically.

---

### Settings

Server configuration, district list pulled from Headscale users, and the full `NODE_LOCATIONS` coordinate table. Has a manual sync button to force a data refresh outside the 30-second cycle.

![settings](./imgs/Pasted%20image%2020260514012136.png)

---

## Node Naming Convention

Huvud parses hostnames automatically to assign nodes to districts and roles.

```
<district>-<role>-<number>

ramallah-hospital-1
nablus-clinic-2
jenin-field-1
```

No manual assignment needed — the name drives everything.

---

## Adding a Node Location

Open `src/App.jsx` and find `NODE_LOCATIONS` near the top. Add an entry:

```js
const NODE_LOCATIONS = {
  "ramallah-hospital-1": {
    lat:   31.89975402722865,
    lng:   35.20597188356702,
    label: "Ramallah General Hospital",
  },
  // add more here
};
```

Get coordinates by right-clicking a location on Google Maps and copying the coordinates. Nodes without an entry fall back to their district center.

---

## Configuration

All config is at the top of `src/App.jsx`:

```js
const HEADSCALE_URL = "http://<your-headscale-proxy>:8082";
const HEADSCALE_KEY = "hskey-api-...";
```

`HEADSCALE_URL` should point to the nginx CORS proxy, not Headscale directly.

---

## Running

```bash
# Install dependencies
npm install

# Development
npm run dev

# Production build
npm run build

# Copy build output to nginx
cp -r dist/* ../dashboard/
docker compose restart dashboard
```

---

## Stack

| piece | what it does |
|---|---|
| React | UI framework |
| Leaflet.js | Map rendering via OpenStreetMap |
| Headscale API | Source of truth for nodes and districts |
| nginx | Serves the built app + CORS proxy to Headscale |
| Docker Compose | Runs alongside Headscale, Headscale UI, Uptime Kuma |
