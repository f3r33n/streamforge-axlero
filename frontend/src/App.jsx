import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck, AlertTriangle, Gauge, Fuel, Bell, Search, MapPin,
  LayoutDashboard, Radio, BellRing, BarChart2, X, CheckCircle,
  Clock, TrendingUp, TrendingDown, Activity, Map as MapIcon, Navigation,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, Tooltip,
  BarChart, Bar, AreaChart, Area, YAxis,
} from "recharts";
import { fetchTrucks, fetchStats, fetchAlerts, fetchHealth } from "./api/client";
import {
  mapTruckToUi,
  mapAlertToUi,
  buildDashboardStats,
  buildFuelChartData,
  buildRouteEfficiency,
} from "./api/mappers";

const STAT_ICONS = { Truck, AlertTriangle, Gauge, Fuel };

const cityCoords = {
  "Delhi": { x: 246, y: 118 },
  "Jaipur": { x: 205, y: 152 },
  "Mumbai": { x: 138, y: 330 },
  "Pune": { x: 168, y: 352 },
  "Bangalore": { x: 228, y: 432 },
  "Mysore": { x: 205, y: 452 },
  "Chennai": { x: 272, y: 440 },
  "Coimbatore": { x: 235, y: 468 },
  "Hyderabad": { x: 252, y: 350 },
  "Vijayawada": { x: 288, y: 382 },
  "Kolkata": { x: 378, y: 262 },
  "Bhubaneswar": { x: 350, y: 302 },
};

function statusColor(status) {
  if (status === "Overspeed") return "#F87171";
  if (status === "Low Fuel") return "#FACC15";
  if (status === "High Temp") return "#FB923C";
  if (status === "Stopped") return "#94A3B8";
  return "#22D3EE";
}

function formatTimeLabel(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function App() {
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [hoveredTruckId, setHoveredTruckId] = useState(null);
  const [liveTrucks, setLiveTrucks] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [alerts, setAlerts] = useState([]);
  const [dashboardStats, setDashboardStats] = useState([]);
  const [speedHistory, setSpeedHistory] = useState([]);
  const [fuelHistory, setFuelHistory] = useState([]);
  const [routeEfficiency, setRouteEfficiency] = useState([]);
  const [fleetStats, setFleetStats] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("loading");
  const [statusMessage, setStatusMessage] = useState("Connecting to backend…");
  const resolvedAlertIdsRef = useRef(new Set());

  useEffect(() => {
    let mounted = true;

    async function poll() {
      try {
        await fetchHealth();
        const [trucksRaw, statsRaw, alertsRaw] = await Promise.all([
          fetchTrucks(),
          fetchStats(),
          fetchAlerts(),
        ]);

        if (!mounted) return;

        const trucks = trucksRaw.map(mapTruckToUi);
        const alertItems = alertsRaw.map(mapAlertToUi).map((a) => ({
          ...a,
          resolved: resolvedAlertIdsRef.current.has(a.id),
        }));

        setLiveTrucks(trucks);
        setFleetStats(statsRaw);
        setDashboardStats(buildDashboardStats(statsRaw, alertItems));
        setAlerts(alertItems);
        setRouteEfficiency(buildRouteEfficiency(trucks));

        const now = new Date();
        if (statsRaw.total_trucks > 0) {
          setSpeedHistory((prev) => {
            const next = [...prev, { time: formatTimeLabel(now), speed: Math.round(statsRaw.avg_speed) }];
            return next.slice(-12);
          });
          setFuelHistory((prev) => {
            const next = [...prev, { time: formatTimeLabel(now), fuelAvg: Math.round(statsRaw.avg_fuel) }];
            return next.slice(-12);
          });
          setConnectionStatus("live");
          setStatusMessage(`${statsRaw.total_trucks} trucks tracked live`);
        } else {
          setConnectionStatus("waiting");
          setStatusMessage("Waiting for telemetry");
        }

        setSelectedTruck((prev) => {
          if (!prev) return null;
          return trucks.find((t) => t.id === prev.id) ?? null;
        });
      } catch {
        if (!mounted) return;
        setConnectionStatus("error");
        setStatusMessage("Backend unreachable — start FastAPI on port 8000");
      }
    }

    poll();
    const interval = setInterval(poll, 2000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "fleet", label: "Live Fleet", icon: Radio },
    { id: "map", label: "Live Map", icon: MapIcon },
    { id: "alerts", label: "Alerts", icon: BellRing },
    { id: "analytics", label: "Analytics", icon: BarChart2 },
  ];

  const resolveAlert = (id) => {
    resolvedAlertIdsRef.current.add(id);
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, resolved: true } : a))
    );
  };

  const fuelChartData = buildFuelChartData(liveTrucks);
  const activeAlerts = alerts.filter((a) => !a.resolved);
  const hasTrucks = liveTrucks.length > 0;

  const connectionBadge = {
    live: { bg: "bg-green-500/10 border-green-500/20", dot: "bg-green-400", text: "text-green-400", label: "Live" },
    waiting: { bg: "bg-yellow-500/10 border-yellow-500/20", dot: "bg-yellow-400", text: "text-yellow-400", label: "Waiting" },
    error: { bg: "bg-red-500/10 border-red-500/20", dot: "bg-red-400", text: "text-red-400", label: "Offline" },
    loading: { bg: "bg-gray-500/10 border-gray-500/20", dot: "bg-gray-400", text: "text-gray-400", label: "Loading" },
  }[connectionStatus];

  function renderEmptyState(message) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Truck className="w-12 h-12 text-gray-500 mb-4" />
        <p className="text-gray-300 text-lg font-medium">{message}</p>
        <p className="text-gray-500 text-sm mt-2 max-w-md">
          Start Kafka, run the producer, then ensure FastAPI is listening on port 8000.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07111F] text-white flex">
      <aside className="w-64 bg-[#0B1627] border-r border-white/10 p-6 flex flex-col">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400">StreamForge</h1>
          <p className="text-gray-400 mt-2 text-sm">Fleet Telemetry Dashboard</p>
        </div>
        <nav className="mt-10 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 ${
                activeTab === item.id
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
              {item.id === "alerts" && activeAlerts.length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeAlerts.length}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="mt-auto pt-6 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-sm">A</div>
            <div>
              <p className="text-sm font-medium">Admin</p>
              <p className="text-xs text-gray-400">Fleet Manager</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-4xl font-bold">
              {activeTab === "dashboard" && "Fleet Overview"}
              {activeTab === "fleet" && "Live Fleet"}
              {activeTab === "map" && "Live Map"}
              {activeTab === "alerts" && "Alerts Center"}
              {activeTab === "analytics" && "Analytics"}
            </h2>
            <p className="text-gray-400 mt-1 text-sm">
              {activeTab === "dashboard" && "Real-time monitoring dashboard"}
              {activeTab === "fleet" && `${liveTrucks.length} trucks tracked live`}
              {activeTab === "map" && "Live truck positions from GPS telemetry"}
              {activeTab === "alerts" && `${activeAlerts.length} active alerts`}
              {activeTab === "analytics" && "Live session performance (runtime data)"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#0F172A] border border-white/10 px-4 py-2 rounded-xl">
              <Search className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400 text-sm">Search trucks</span>
            </div>
            <Bell className="w-6 h-6 text-gray-300 cursor-pointer hover:text-white transition-colors" />
            <div className={`flex items-center gap-2 ${connectionBadge.bg} border px-4 py-2 rounded-full`}>
              <div className={`w-2 h-2 ${connectionBadge.dot} rounded-full ${connectionStatus === "live" ? "animate-pulse" : ""}`} />
              <span className={`${connectionBadge.text} text-sm`}>{connectionBadge.label}</span>
            </div>
          </div>
        </div>

        {connectionStatus === "error" && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">
            {statusMessage}
          </div>
        )}

        {connectionStatus === "waiting" && !hasTrucks && activeTab !== "analytics" && (
          renderEmptyState("Waiting for telemetry")
        )}

        {/* DASHBOARD */}
        {activeTab === "dashboard" && hasTrucks && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="grid grid-cols-4 gap-6 mb-8">
              {dashboardStats.map((stat, index) => {
                const Icon = STAT_ICONS[stat.iconKey];
                return (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="bg-[#0F172A] border border-white/10 rounded-2xl p-6"
                  >
                    <div className="flex justify-between items-center">
                      <p className="text-gray-400 text-sm">{stat.title}</p>
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <h3 className="text-4xl font-bold mt-4">{stat.value}</h3>
                  </motion.div>
                );
              })}
            </div>
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="col-span-2 bg-[#0F172A] border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-1">Speed trend</h3>
                <p className="text-gray-500 text-xs mb-4">Runtime session average (updates every 2s)</p>
                <div className="h-56">
                  {speedHistory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={speedHistory}>
                        <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 10 }} />
                        <Tooltip contentStyle={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                        <Line type="monotone" dataKey="speed" stroke="#22D3EE" strokeWidth={3} dot={{ fill: "#22D3EE", r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-500 text-sm flex items-center justify-center h-full">Collecting speed data…</p>
                  )}
                </div>
              </div>
              <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">Fuel levels</h3>
                <div className="h-56">
                  {fuelChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={fuelChartData}>
                        <XAxis dataKey="truck" stroke="#64748B" tick={{ fontSize: 12 }} />
                        <Tooltip contentStyle={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                        <Bar dataKey="fuel" fill="#22D3EE" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-500 text-sm flex items-center justify-center h-full">No fuel data yet</p>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 bg-[#0F172A] border border-white/10 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Live Fleet Status</h3>
                  <span className="text-cyan-400 text-sm">{liveTrucks.length} trucks online</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {liveTrucks.slice(0, 4).map((truck) => (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      key={truck.id}
                      onClick={() => setSelectedTruck(truck)}
                      className="bg-[#111827] border border-white/10 rounded-2xl p-4 cursor-pointer"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-sm">{truck.id}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          truck.status === "Overspeed" ? "bg-red-500/20 text-red-400" :
                          truck.status === "Low Fuel" ? "bg-yellow-500/20 text-yellow-400" :
                          truck.status === "High Temp" ? "bg-orange-500/20 text-orange-400" :
                          truck.status === "Stopped" ? "bg-gray-500/20 text-gray-400" :
                          "bg-green-500/20 text-green-400"
                        }`}>{truck.status}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 mb-2 text-xs">
                        <MapPin className="w-3 h-3" /><span>{truck.route}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Speed</span>
                        <span className="text-cyan-400">{truck.speed} km/h</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Fuel</span>
                        <span>{truck.fuel}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full transition-all duration-700 ${truck.fuel < 20 ? "bg-red-400" : "bg-cyan-400"}`} style={{ width: `${truck.fuel}%` }} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">Alerts center</h3>
                <div className="space-y-3">
                  {activeAlerts.slice(0, 3).map((alert, index) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-[#111827] border border-red-500/20 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{alert.truck} — {alert.type}</p>
                        <span className={`text-xs ${alert.level === "Critical" ? "text-red-400" : "text-yellow-400"}`}>{alert.level}</span>
                      </div>
                      <p className="text-gray-400 text-xs mt-1">{alert.time}</p>
                    </motion.div>
                  ))}
                  {activeAlerts.length === 0 && (
                    <p className="text-gray-500 text-sm">No active alerts</p>
                  )}
                </div>
                <button onClick={() => setActiveTab("alerts")} className="mt-4 w-full text-center text-cyan-400 text-sm hover:text-cyan-300 transition-colors">
                  View all alerts →
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* LIVE FLEET */}
        {activeTab === "fleet" && hasTrucks && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="grid grid-cols-3 gap-6">
              {liveTrucks.map((truck) => (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  key={truck.id}
                  onClick={() => setSelectedTruck(truck)}
                  className="bg-[#0F172A] border border-white/10 rounded-2xl p-5 cursor-pointer hover:border-cyan-500/30 transition-all"
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full animate-pulse ${truck.backendStatus === "STOPPED" ? "bg-gray-400" : "bg-green-400"}`} />
                      <h4 className="font-semibold">{truck.id}</h4>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      truck.status === "Overspeed" ? "bg-red-500/20 text-red-400" :
                      truck.status === "Low Fuel" ? "bg-yellow-500/20 text-yellow-400" :
                      truck.status === "High Temp" ? "bg-orange-500/20 text-orange-400" :
                      truck.status === "Stopped" ? "bg-gray-500/20 text-gray-400" :
                      "bg-green-500/20 text-green-400"
                    }`}>{truck.status}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 mb-4 text-sm">
                    <MapPin className="w-4 h-4 flex-shrink-0" /><span>{truck.route}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-[#111827] rounded-xl p-3 text-center">
                      <p className="text-gray-400 text-xs mb-1">Speed</p>
                      <p className="text-cyan-400 font-bold">{truck.speed}</p>
                      <p className="text-gray-500 text-xs">km/h</p>
                    </div>
                    <div className="bg-[#111827] rounded-xl p-3 text-center">
                      <p className="text-gray-400 text-xs mb-1">Fuel</p>
                      <p className={`font-bold ${truck.fuel < 20 ? "text-red-400" : "text-white"}`}>{truck.fuel}%</p>
                      <p className="text-gray-500 text-xs">level</p>
                    </div>
                    <div className="bg-[#111827] rounded-xl p-3 text-center">
                      <p className="text-gray-400 text-xs mb-1">Temp</p>
                      <p className={`font-bold ${truck.temperature > 42 ? "text-orange-400" : "text-white"}`}>{truck.temp}</p>
                      <p className="text-gray-500 text-xs">engine</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all duration-700 ${truck.fuel < 20 ? "bg-red-400" : "bg-cyan-400"}`} style={{ width: `${truck.fuel}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-3">
                    <span>Driver: {truck.driver}</span>
                    <span className="text-cyan-400">Details →</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* LIVE MAP */}
        {activeTab === "map" && hasTrucks && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 bg-[#0F172A] border border-white/10 rounded-2xl p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-cyan-400" /> Fleet positions
                  </h3>
                  <span className="text-gray-400 text-xs">Updated every 2s · GPS coordinates</span>
                </div>
                <div className="relative w-full" style={{ aspectRatio: "500 / 620" }}>
                  <svg viewBox="0 0 500 620" className="w-full h-full">
                    <defs>
                      <radialGradient id="mapGlow" cx="50%" cy="45%" r="65%">
                        <stop offset="0%" stopColor="#0E7490" stopOpacity="0.28" />
                        <stop offset="100%" stopColor="#0E7490" stopOpacity="0" />
                      </radialGradient>
                      <pattern id="gridPattern" width="28" height="28" patternUnits="userSpaceOnUse">
                        <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#1E293B" strokeWidth="1" />
                      </pattern>
                    </defs>

                    <rect x="0" y="0" width="500" height="620" fill="url(#gridPattern)" />

                    <path
                      d="M 205 32
                         C 235 26, 268 34, 282 58
                         C 292 76, 288 96, 306 112
                         C 330 130, 352 150, 348 178
                         C 344 202, 366 224, 386 250
                         C 402 272, 396 300, 372 312
                         C 350 322, 344 344, 356 366
                         C 366 384, 352 402, 328 400
                         C 306 398, 298 378, 302 356
                         C 306 332, 292 314, 270 312
                         C 260 340, 268 372, 258 402
                         C 250 426, 258 452, 244 476
                         C 234 494, 238 516, 226 536
                         C 216 552, 216 572, 200 584
                         C 190 592, 178 588, 174 574
                         C 168 552, 178 534, 168 514
                         C 158 496, 164 474, 150 458
                         C 136 442, 138 418, 122 402
                         C 104 384, 108 358, 96 338
                         C 84 318, 92 292, 108 278
                         C 96 258, 104 234, 122 222
                         C 116 200, 128 178, 150 170
                         C 146 148, 160 128, 182 122
                         C 178 100, 188 78, 205 66
                         C 198 52, 200 40, 205 32 Z"
                      fill="url(#mapGlow)"
                      stroke="#22D3EE"
                      strokeOpacity="0.35"
                      strokeWidth="1.5"
                    />

                    {Object.entries(cityCoords).map(([name, coord]) => (
                      <g key={name}>
                        <circle cx={coord.x} cy={coord.y} r="3" fill="#64748B" />
                        <text x={coord.x + 7} y={coord.y + 3} fontSize="10" fill="#94A3B8">{name}</text>
                      </g>
                    ))}

                    {liveTrucks.map((truck) => {
                      const { x, y } = truck.mapPos;
                      const color = statusColor(truck.status);
                      const isHovered = hoveredTruckId === truck.id;
                      return (
                        <g
                          key={truck.id}
                          transform={`translate(${x}, ${y})`}
                          onMouseEnter={() => setHoveredTruckId(truck.id)}
                          onMouseLeave={() => setHoveredTruckId(null)}
                          onClick={() => setSelectedTruck(truck)}
                          className="cursor-pointer"
                        >
                          <circle r={isHovered ? 12 : 9} fill={color} fillOpacity="0.2">
                            <animate attributeName="r" values="8;14;8" dur="2s" repeatCount="indefinite" />
                            <animate attributeName="fill-opacity" values="0.35;0;0.35" dur="2s" repeatCount="indefinite" />
                          </circle>
                          <circle r="5" fill={color} stroke="#07111F" strokeWidth="1.5" />
                          {isHovered && (
                            <g transform="translate(12, -10)">
                              <rect x="0" y="-14" width="148" height="58" rx="8" fill="#0B1627" stroke="#22D3EE" strokeOpacity="0.4" />
                              <text x="8" y="0" fontSize="11" fill="#22D3EE" fontWeight="600">{truck.id}</text>
                              <text x="8" y="14" fontSize="9" fill="#94A3B8">{truck.status} · {truck.speed} km/h</text>
                              <text x="8" y="26" fontSize="9" fill="#94A3B8">{truck.latitude?.toFixed(4)}, {truck.longitude?.toFixed(4)}</text>
                              <text x="8" y="38" fontSize="9" fill="#94A3B8">{truck.route}</text>
                            </g>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">Trucks in transit</h3>
                <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
                  {liveTrucks.map((truck) => (
                    <div
                      key={truck.id}
                      onMouseEnter={() => setHoveredTruckId(truck.id)}
                      onMouseLeave={() => setHoveredTruckId(null)}
                      onClick={() => setSelectedTruck(truck)}
                      className={`bg-[#111827] border rounded-xl p-4 cursor-pointer transition-all ${
                        hoveredTruckId === truck.id ? "border-cyan-500/50" : "border-white/10"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-semibold text-sm">{truck.id}</p>
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: statusColor(truck.status) }}
                        />
                      </div>
                      <p className="text-gray-400 text-xs mb-2">{truck.route}</p>
                      <p className="text-gray-500 text-xs mb-2">
                        {truck.latitude?.toFixed(4)}, {truck.longitude?.toFixed(4)}
                      </p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{truck.status}</span>
                        <span>{truck.speed} km/h</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ALERTS */}
        {activeTab === "alerts" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {!hasTrucks && alerts.length === 0 ? (
              renderEmptyState("No alerts — waiting for telemetry")
            ) : (
              <>
                <div className="grid grid-cols-3 gap-6 mb-8">
                  {[
                    { label: "Critical", count: alerts.filter((a) => a.level === "Critical" && !a.resolved).length, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
                    { label: "Warnings", count: alerts.filter((a) => a.level === "Warning" && !a.resolved).length, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
                    { label: "Resolved", count: alerts.filter((a) => a.resolved).length, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
                  ].map((s) => (
                    <div key={s.label} className={`${s.bg} border rounded-2xl p-6`}>
                      <p className="text-gray-400 text-sm">{s.label}</p>
                      <h3 className={`text-5xl font-bold mt-2 ${s.color}`}>{s.count}</h3>
                    </div>
                  ))}
                </div>
                <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold mb-6">All Alerts</h3>
                  {alerts.length === 0 ? (
                    <p className="text-gray-500 text-sm">No alerts from the fleet</p>
                  ) : (
                    <div className="space-y-4">
                      {alerts.map((alert, index) => (
                        <motion.div
                          key={alert.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.06 }}
                          className={`bg-[#111827] rounded-xl p-5 border transition-all ${
                            alert.resolved ? "border-white/5 opacity-50" :
                            alert.level === "Critical" ? "border-red-500/30" :
                            alert.level === "Warning" ? "border-yellow-500/30" : "border-blue-500/20"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${
                                alert.resolved ? "text-gray-500" :
                                alert.level === "Critical" ? "text-red-400" :
                                alert.level === "Warning" ? "text-yellow-400" : "text-blue-400"
                              }`} />
                              <div>
                                <div className="flex items-center gap-3 mb-1">
                                  <p className="font-semibold">{alert.truck}</p>
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    alert.resolved ? "bg-gray-500/20 text-gray-400" :
                                    alert.level === "Critical" ? "bg-red-500/20 text-red-400" :
                                    alert.level === "Warning" ? "bg-yellow-500/20 text-yellow-400" :
                                    "bg-blue-500/20 text-blue-400"
                                  }`}>{alert.resolved ? "Resolved" : alert.level}</span>
                                </div>
                                <p className="text-gray-300 text-sm">{alert.type}</p>
                                <p className="text-gray-400 text-xs mt-1">{alert.detail}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                              <div className="flex items-center gap-1 text-gray-400 text-xs">
                                <Clock className="w-3 h-3" />{alert.time}
                              </div>
                              {!alert.resolved && (
                                <button
                                  onClick={() => resolveAlert(alert.id)}
                                  className="flex items-center gap-1 bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 text-xs px-3 py-1.5 rounded-lg transition-all"
                                >
                                  <CheckCircle className="w-3 h-3" />Resolve
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* ANALYTICS */}
        {activeTab === "analytics" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {!hasTrucks ? (
              renderEmptyState("Waiting for telemetry to populate analytics")
            ) : (
              <>
                <div className="grid grid-cols-4 gap-6 mb-8">
                  {[
                    { label: "Total Trucks", value: String(fleetStats?.total_trucks ?? 0), trend: "live", up: true },
                    { label: "Active Alerts", value: String(Object.values(fleetStats?.alert_counts ?? {}).reduce((a, b) => a + b, 0)), trend: "current", up: false },
                    { label: "Avg Fuel", value: `${Math.round(fleetStats?.avg_fuel ?? 0)}%`, trend: "live avg", up: true },
                    { label: "Avg Speed", value: `${Math.round(fleetStats?.avg_speed ?? 0)} km/h`, trend: "live avg", up: true },
                  ].map((kpi, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="bg-[#0F172A] border border-white/10 rounded-2xl p-5"
                    >
                      <p className="text-gray-400 text-sm">{kpi.label}</p>
                      <h3 className="text-3xl font-bold mt-2">{kpi.value}</h3>
                      <div className={`flex items-center gap-1 mt-2 text-sm ${kpi.up ? "text-green-400" : "text-yellow-400"}`}>
                        {kpi.up ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {kpi.trend}
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold mb-1">Fleet avg speed (session)</h3>
                    <p className="text-gray-500 text-xs mb-4">Runtime polling history — not stored on server</p>
                    <div className="h-56">
                      {speedHistory.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={speedHistory}>
                            <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 9 }} />
                            <YAxis stroke="#64748B" tick={{ fontSize: 12 }} />
                            <Tooltip contentStyle={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                            <Bar dataKey="speed" fill="#22D3EE" radius={[4, 4, 0, 0]} name="Avg speed" />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <p className="text-gray-500 text-sm flex items-center justify-center h-full">Collecting data…</p>
                      )}
                    </div>
                  </div>
                  <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold mb-1">Fleet avg fuel (session)</h3>
                    <p className="text-gray-500 text-xs mb-4">Runtime polling history — not stored on server</p>
                    <div className="h-56">
                      {fuelHistory.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={fuelHistory}>
                            <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 9 }} />
                            <YAxis stroke="#64748B" tick={{ fontSize: 12 }} domain={[0, 100]} />
                            <Tooltip contentStyle={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                            <defs>
                              <linearGradient id="fuelGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#22D3EE" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="fuelAvg" stroke="#22D3EE" strokeWidth={2} fill="url(#fuelGrad)" name="Fuel %" />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <p className="text-gray-500 text-sm flex items-center justify-center h-full">Collecting data…</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Activity className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-lg font-semibold">Route Fuel Breakdown (current snapshot)</h3>
                  </div>
                  <div className="space-y-4">
                    {routeEfficiency.map((route) => (
                      <div key={route.route} className="flex items-center gap-4">
                        <span className="text-gray-400 text-sm w-36 flex-shrink-0">{route.route}</span>
                        <div className="flex-1 bg-gray-700 rounded-full h-3">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${route.efficiency}%` }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className={`h-3 rounded-full ${route.efficiency >= 80 ? "bg-green-400" : route.efficiency >= 60 ? "bg-cyan-400" : "bg-red-400"}`}
                          />
                        </div>
                        <span className={`text-sm font-semibold w-10 text-right ${route.efficiency >= 80 ? "text-green-400" : route.efficiency >= 60 ? "text-cyan-400" : "text-red-400"}`}>
                          {route.efficiency}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* Modal */}
        <AnimatePresence>
          {selectedTruck && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
              onClick={() => setSelectedTruck(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-[680px] bg-[#0F172A] border border-white/10 rounded-3xl p-8"
              >
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-3xl font-bold">{selectedTruck.id}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`w-2 h-2 rounded-full animate-pulse ${selectedTruck.backendStatus === "STOPPED" ? "bg-gray-400" : "bg-green-400"}`} />
                      <span className="text-green-400 text-sm">
                        {selectedTruck.backendStatus === "STOPPED" ? "Stopped" : "Live tracking active"}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedTruck(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-[#111827] rounded-2xl p-5">
                    <p className="text-gray-400 text-sm">Current Speed</p>
                    <h3 className="text-4xl font-bold text-cyan-400 mt-2">{selectedTruck.speed} <span className="text-lg font-normal">km/h</span></h3>
                  </div>
                  <div className="bg-[#111827] rounded-2xl p-5">
                    <p className="text-gray-400 text-sm">Fuel Level</p>
                    <h3 className={`text-4xl font-bold mt-2 ${selectedTruck.fuel < 20 ? "text-red-400" : "text-green-400"}`}>
                      {selectedTruck.fuel}<span className="text-lg font-normal">%</span>
                    </h3>
                  </div>
                  <div className="bg-[#111827] rounded-2xl p-5">
                    <p className="text-gray-400 text-sm">Engine Temperature</p>
                    <h3 className={`text-3xl font-bold mt-2 ${selectedTruck.temperature > 42 ? "text-orange-400" : "text-white"}`}>{selectedTruck.temp}</h3>
                  </div>
                  <div className="bg-[#111827] rounded-2xl p-5">
                    <p className="text-gray-400 text-sm">Driver</p>
                    <h3 className="text-xl font-bold mt-2">{selectedTruck.driver}</h3>
                  </div>
                </div>
                <div className="bg-[#111827] rounded-2xl p-5">
                  <h4 className="text-lg font-semibold mb-3">Route & location</h4>
                  <div className="flex items-center gap-2 text-gray-300 mb-2">
                    <MapPin className="w-4 h-4 text-cyan-400" />{selectedTruck.route}
                  </div>
                  <p className="text-gray-400 text-sm mb-2">
                    GPS: {selectedTruck.latitude?.toFixed(6)}, {selectedTruck.longitude?.toFixed(6)}
                  </p>
                  <p className="text-gray-500 text-xs">Last update: {selectedTruck.timestamp || "—"}</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
