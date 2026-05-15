# Huvud

A self-hosted network operations dashboard for the West Bank hospital mesh. Built with React, pulls live data from Headscale and Uptime Kuma, renders a real map with Leaflet, and runs fully in-browser with no backend of its own.

![overview](imgs/Pasted%20image%2020260514011522.png)

-----

## Tabs

### Overview

The landing summary. Shows total nodes, online/offline count, uptime percentage, and user count at a glance. Below that, a user coverage table with a progress bar per user, and a full node list at the bottom.

-----

### Map

A live OpenStreetMap with a pin for every configured node.

<<<<<<< HEAD
- **Green** — node is registered and online
- **Red** — node is registered and offline
- **Gray** — location is configured in `nodeLocations.js` but the node hasn't joined yet
=======
- **Green**: node is registered and online
- **Red**: node is registered and offline
- **Gray**: location is configured in `nodeLocations.js` but the node hasn’t joined yet
>>>>>>> 10079f9de1ba9d50a145b8ef19f505f011e525e5

Click any pin to see hostname, IP, user, status, and exact coordinates. The right panel lists all pins — clicking one flies the map to that location.

The map loads even with zero registered nodes.

![map](imgs/Screencast_20260514_011727.gif)

-----

### Nodes

A searchable table of all registered nodes. Filter by name, IP, or user. Click any row to expand a full detail panel showing hostname, IP, user, role, status, last seen timestamp, tunnel type, and GPS coordinates if configured.

-----

### Users

One section per Headscale user. Shows a coverage progress bar and a node table per user. Users with no nodes show an empty state. New users appear automatically when you create them in Headscale.

![users](imgs/Pasted%20image%2020260514012057.png)
<<<<<<< HEAD

---

### Coordinates

Shows all configured node locations with their exact GPS coordinates and live status. Highlights any registered nodes that don't have coordinates yet — those fall back to their user's center on the map.
=======
>>>>>>> 10079f9de1ba9d50a145b8ef19f505f011e525e5

-----

### Coordinates

Shows all configured node locations with their exact GPS coordinates and live status. Highlights any registered nodes that don’t have coordinates yet — those fall back to their user’s center on the map.

-----

### Uptime

Pulls live data from Uptime Kuma — shows all monitors with ping, 24h uptime percentage, monitor type, and host/IP. The WireGuard column fills in automatically when a Headscale node with a matching hostname joins the mesh. Refreshes every 30 seconds.

-----

### Settings

Server configuration, sync controls, and password change. Log out clears all credentials from the browser.

![settings](imgs/Pasted%20image%2020260514012136.png)

-----

## Node Naming Convention

Huvud parses hostnames automatically to assign nodes to users and roles.

```
<user>-<role>-<number>

ramallah-hospital-1
nablus-clinic-2
jenin-field-1
```

No manual assignment needed, the name drives everything.

-----

## Project Structure

<<<<<<< HEAD
```
src/
├── main.jsx
├── App.jsx
├── constants.js
├── api.js
├── data/
│   └── nodeLocations.js
└── components/
    ├── Sidebar.jsx
    ├── LoginScreen.jsx
    ├── PasswordGate.jsx
    ├── shared/
    │   ├── Clock.jsx
    │   ├── SectionHeading.jsx
    │   ├── FieldLabel.jsx
    │   ├── ReadBox.jsx
    │   ├── Btn.jsx
    │   ├── StatusDot.jsx
    │   ├── StatBox.jsx
    │   └── Table.jsx
    └── pages/
        ├── OverviewPage.jsx
        ├── MapPage.jsx
        ├── NodesPage.jsx
        ├── UsersPage.jsx
        ├── CoordinatesPage.jsx
        ├── UptimePage.jsx
        └── SettingsPage.jsx
```

---

## Adding a Node Location

Open `src/data/nodeLocations.js` and add an entry:

```js
"ramallah-hospital-1": {
  lat:   31.89975402722865,
  lng:   35.20597188356702,
  label: "Ramallah General Hospital",
},
```

Get coordinates by right-clicking a location on Google Maps and copying them. Nodes without an entry fall back to their user's center on the map.
=======
Open `src/data/nodeLocations.js` and add an entry:

```js
"ramallah-hospital-1": {
  lat:   31.89975402722865,
  lng:   35.20597188356702,
  label: "Ramallah General Hospital",
},
```

Get coordinates by right-clicking a location on Google Maps and copying them. Nodes without an entry fall back to their user’s center on the map.
>>>>>>> 10079f9de1ba9d50a145b8ef19f505f011e525e5

-----

## Configuration

Edit `src/constants.js`:

```js
export const UPTIME_KUMA_URL  = "http://<your-server>:8083";
export const UPTIME_KUMA_SLUG = "your-status-page-slug";
```

<<<<<<< HEAD
Headscale URL and API key are entered on first login and stored locally in the browser — they're never in the source code.
=======
Headscale URL and API key are entered on first login and stored locally in the browser — they’re never in the source code.
>>>>>>> 10079f9de1ba9d50a145b8ef19f505f011e525e5

-----

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

-----

## Stack

<<<<<<< HEAD
| piece | what it does |
|---|---|
| React | UI framework |
| Leaflet.js | Map rendering via OpenStreetMap |
| Headscale API | Source of truth for nodes and users |
| Uptime Kuma API | Ping, uptime %, and monitor status |
| nginx | Serves the built app + CORS proxy to Headscale and Uptime Kuma |
| Docker Compose | Runs alongside Headscale, Headscale UI, Uptime Kuma |
=======
|piece          |what it does                                                  |
|---------------|--------------------------------------------------------------|
|React          |UI framework                                                  |
|Leaflet.js     |Map rendering via OpenStreetMap                               |
|Headscale API  |Source of truth for nodes and users                           |
|Uptime Kuma API|Ping, uptime %, and monitor status                            |
|nginx          |Serves the built app + CORS proxy to Headscale and Uptime Kuma|
|Docker Compose |Runs alongside Headscale, Headscale UI, Uptime Kuma           |
>>>>>>> 10079f9de1ba9d50a145b8ef19f505f011e525e5
