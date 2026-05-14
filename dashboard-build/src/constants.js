export const FONT    = "ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace";
export const TEAL    = "#0d7377";
export const TEAL_BG = "#eef6f6";
export const GRAY_BG = "#f0f0f0";
export const WHITE   = "#ffffff";
export const TEXT    = "#1a1a1a";
export const MUTED   = "#6b7280";
export const FAINT   = "#9ca3af";
export const BORDER  = "#d1d5db";
export const GREEN   = "#16a34a";
export const RED     = "#dc2626";
export const AMBER   = "#d97706";

export const STORAGE_KEY = "huvud_config";

export const UPTIME_KUMA_URL  = "http://100.105.90.110:8083";
export const UPTIME_KUMA_SLUG = "home";

export const DISTRICT_COORDS = {
  RAMALLAH: { lat: 31.9038, lng: 35.2034 },
  NABLUS:   { lat: 32.2211, lng: 35.2544 },
  HEBRON:   { lat: 31.5326, lng: 35.0998 },
  JENIN:    { lat: 32.4607, lng: 35.2961 },
  TULKARM:  { lat: 32.3103, lng: 35.0281 },
  JERICHO:  { lat: 31.8567, lng: 35.4610 },
  SALFIT:   { lat: 32.0857, lng: 35.1786 },
  DEFAULT:  { lat: 31.9522, lng: 35.2332 },
};

export const NAV = [
  { id: "overview",    label: "Overview",    icon: "⊞" },
  { id: "map",         label: "Map",         icon: "◎" },
  { id: "nodes",       label: "Nodes",       icon: "○" },
  { id: "users",       label: "Users",       icon: "□" },
  { id: "coordinates", label: "Coordinates", icon: "⌖" },
  { id: "uptime",      label: "Uptime",      icon: "◈" },
  { id: "settings",    label: "Settings",    icon: "⚙" },
];
