import { useEffect, useState } from "react";
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

const stats = [
  { title: "Active Trucks", value: "42", icon: Truck, color: "text-cyan-400" },
  { title: "Critical Alerts", value: "05", icon: AlertTriangle, color: "text-red-400" },
  { title: "Avg Speed", value: "68 km/h", icon: Gauge, color: "text-green-400" },
  { title: "Fuel Avg", value: "74%", icon: Fuel, color: "text-yellow-400" },
];

const speedData = [
  { time: "08:00", speed: 52 }, { time: "09:00", speed: 64 },
  { time: "10:00", speed: 58 }, { time: "11:00", speed: 72 },
  { time: "12:00", speed: 68 }, { time: "13:00", speed: 76 },
];

const fuelData = [
  { truck: "T1", fuel: 81 }, { truck: "T2", fuel: 54 },
  { truck: "T3", fuel: 33 }, { truck: "T4", fuel: 67 },
];

// Approximate stylized positions (not geographically precise) on a 0-500 x 0-620 canvas
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

const allTrucks = [
  { id: "TRUCK-01", route: "Delhi → Jaipur", speed: 72, fuel: 81, temp: "32°C", status: "Moving", driver: "Rajesh Kumar" },
  { id: "TRUCK-07", route: "Mumbai → Pune", speed: 65, fuel: 54, temp: "35°C", status: "Moving", driver: "Anil Sharma" },
  { id: "TRUCK-12", route: "Bangalore → Mysore", speed: 91, fuel: 33, temp: "41°C", status: "Overspeed", driver: "Suresh Patel" },
  { id: "TRUCK-03", route: "Chennai → Coimbatore", speed: 58, fuel: 12, temp: "38°C", status: "Low Fuel", driver: "Venkat Rao" },
  { id: "TRUCK-18", route: "Hyderabad → Vijayawada", speed: 62, fuel: 67, temp: "46°C", status: "High Temp", driver: "Ravi Naik" },
  { id: "TRUCK-22", route: "Kolkata → Bhubaneswar", speed: 70, fuel: 78, temp: "31°C", status: "Moving", driver: "Dipak Mondal" },
];

const alertsData = [
  { id: 1, truck: "TRUCK-12", type: "Overspeed", level: "Critical", time: "2 min ago", detail: "Speed: 91 km/h — Limit: 80 km/h", resolved: false },
  { id: 2, truck: "TRUCK-03", type: "Low Fuel", level: "Warning", time: "8 min ago", detail: "Fuel level at 12% — refuel needed", resolved: false },
  { id: 3, truck: "TRUCK-18", type: "High Engine Temp", level: "Critical", time: "15 min ago", detail: "Engine at 46°C — coolant check required", resolved: false },
  { id: 4, truck: "TRUCK-09", type: "GPS Signal Lost", level: "Warning", time: "32 min ago", detail: "Last seen: NH-48 near Gurgaon", resolved: false },
  { id: 5, truck: "TRUCK-31", type: "Harsh Braking", level: "Info", time: "1 hr ago", detail: "3 harsh braking events logged", resolved: true },
];

const weeklyData = [
  { day: "Mon", trips: 38, incidents: 2, fuelAvg: 72 },
  { day: "Tue", trips: 42, incidents: 1, fuelAvg: 75 },
  { day: "Wed", trips: 35, incidents: 4, fuelAvg: 68 },
  { day: "Thu", trips: 47, incidents: 0, fuelAvg: 80 },
  { day: "Fri", trips: 44, incidents: 3, fuelAvg: 74 },
  { day: "Sat", trips: 30, incidents: 1, fuelAvg: 71 },
  { day: "Sun", trips: 22, incidents: 0, fuelAvg: 77 },
];

const efficiencyData = [
  { route: "Delhi→Jaipur", efficiency: 88 },
  { route: "Mumbai→Pune", efficiency: 72 },
  { route: "BLR→Mysore", efficiency: 45 },
  { route: "Chennai→CBE", efficiency: 61 },
  { route: "HYD→VJA", efficiency: 79 },
];

function statusColor(status) {
  if (status === "Overspeed") return "#F87171";
  if (status === "Low Fuel") return "#FACC15";
  if (status === "High Temp") return "#FB923C";
  return "#22D3EE";
}

function parseRoute(route) {
  const [from, to] = route.split(" → ").map((s) => s.trim());
  return { from, to, fromCoord: cityCoords[from], toCoord: cityCoords[to] };
}

export default function App() {
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [hoveredTruckId, setHoveredTruckId] = useState(null);
  const [liveTrucks, setLiveTrucks] = useState(
    allTrucks.map((t) => ({ ...t, progress: Math.floor(Math.random() * 70) + 10 }))
  );
  const [activeTab, setActiveTab] = useState("dashboard");
  const [alerts, setAlerts] = useState(alertsData);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveTrucks((prev) =>
        prev.map((truck) => ({
          ...truck,
          speed: Math.max(40, truck.speed + Math.floor(Math.random() * 7 - 3)),
          fuel: Math.max(10, truck.fuel - (Math.random() > 0.7 ? 1 : 0)),
          progress: (truck.progress + Math.random() * 2.2) % 100,
        }))
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "fleet", label: "Live Fleet", icon: Radio },
    { id: "map", label: "Live Map", icon: MapIcon },
    { id: "alerts", label: "Alerts", icon: BellRing },
    { id: "analytics", label: "Analytics", icon: BarChart2 },
  ];

  const resolveAlert = (id) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, resolved: true } : a))
    );
  };

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
              {item.id === "alerts" && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {alerts.filter((a) => !a.resolved).length}
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
              {activeTab === "map" && "Live truck positions across active routes"}
              {activeTab === "alerts" && `${alerts.filter((a) => !a.resolved).length} active alerts`}
              {activeTab === "analytics" && "Weekly performance insights"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#0F172A] border border-white/10 px-4 py-2 rounded-xl">
              <Search className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400 text-sm">Search trucks</span>
            </div>
            <Bell className="w-6 h-6 text-gray-300 cursor-pointer hover:text-white transition-colors" />
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 text-sm">Live</span>
            </div>
          </div>
        </div>

        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="grid grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
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
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <h3 className="text-4xl font-bold mt-4">{stat.value}</h3>
                </motion.div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="col-span-2 bg-[#0F172A] border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">Speed trend</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={speedData}>
                      <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 12 }} />
                      <Tooltip contentStyle={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                      <Line type="monotone" dataKey="speed" stroke="#22D3EE" strokeWidth={3} dot={{ fill: "#22D3EE", r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">Fuel levels</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={fuelData}>
                      <XAxis dataKey="truck" stroke="#64748B" tick={{ fontSize: 12 }} />
                      <Tooltip contentStyle={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                      <Bar dataKey="fuel" fill="#22D3EE" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 bg-[#0F172A] border border-white/10 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Live Fleet Status</h3>
                  <span className="text-cyan-400 text-sm">42 trucks online</span>
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
                  {alerts.filter((a) => !a.resolved).slice(0, 3).map((alert, index) => (
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
                </div>
                <button onClick={() => setActiveTab("alerts")} className="mt-4 w-full text-center text-cyan-400 text-sm hover:text-cyan-300 transition-colors">
                  View all alerts →
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* LIVE FLEET */}
        {activeTab === "fleet" && (
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
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <h4 className="font-semibold">{truck.id}</h4>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      truck.status === "Overspeed" ? "bg-red-500/20 text-red-400" :
                      truck.status === "Low Fuel" ? "bg-yellow-500/20 text-yellow-400" :
                      truck.status === "High Temp" ? "bg-orange-500/20 text-orange-400" :
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
                      <p className={`font-bold ${parseInt(truck.temp) > 42 ? "text-orange-400" : "text-white"}`}>{truck.temp}</p>
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
        {activeTab === "map" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 bg-[#0F172A] border border-white/10 rounded-2xl p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-cyan-400" /> Fleet positions
                  </h3>
                  <span className="text-gray-400 text-xs">Updated every 2s</span>
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

                    {/* Stylized India silhouette */}
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

                    {/* Routes */}
                    {liveTrucks.map((truck) => {
                      const { fromCoord, toCoord } = parseRoute(truck.route);
                      if (!fromCoord || !toCoord) return null;
                      return (
                        <line
                          key={`route-${truck.id}`}
                          x1={fromCoord.x} y1={fromCoord.y}
                          x2={toCoord.x} y2={toCoord.y}
                          stroke="#22D3EE"
                          strokeOpacity={hoveredTruckId === truck.id ? 0.55 : 0.18}
                          strokeWidth={hoveredTruckId === truck.id ? 2 : 1.2}
                          strokeDasharray="5 5"
                        />
                      );
                    })}

                    {/* City markers */}
                    {Object.entries(cityCoords).map(([name, coord]) => (
                      <g key={name}>
                        <circle cx={coord.x} cy={coord.y} r="3" fill="#64748B" />
                        <text x={coord.x + 7} y={coord.y + 3} fontSize="10" fill="#94A3B8">{name}</text>
                      </g>
                    ))}

                    {/* Trucks */}
                    {liveTrucks.map((truck) => {
                      const { fromCoord, toCoord } = parseRoute(truck.route);
                      if (!fromCoord || !toCoord) return null;
                      const t = truck.progress / 100;
                      const x = fromCoord.x + (toCoord.x - fromCoord.x) * t;
                      const y = fromCoord.y + (toCoord.y - fromCoord.y) * t;
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
                              <rect x="0" y="-14" width="128" height="46" rx="8" fill="#0B1627" stroke="#22D3EE" strokeOpacity="0.4" />
                              <text x="8" y="0" fontSize="11" fill="#22D3EE" fontWeight="600">{truck.id}</text>
                              <text x="8" y="14" fontSize="9" fill="#94A3B8">{truck.status} · {truck.speed} km/h</text>
                              <text x="8" y="26" fontSize="9" fill="#94A3B8">{Math.round(truck.progress)}% of route</text>
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
                      <p className="text-gray-400 text-xs mb-3">{truck.route}</p>
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-cyan-400 transition-all duration-700"
                          style={{ width: `${truck.progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{Math.round(truck.progress)}% complete</span>
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
            <div className="grid grid-cols-3 gap-6 mb-8">
              {[
                { label: "Critical", count: alerts.filter((a) => a.level === "Critical" && !a.resolved).length, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
                { label: "Warnings", count: alerts.filter((a) => a.level === "Warning" && !a.resolved).length, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
                { label: "Resolved today", count: alerts.filter((a) => a.resolved).length, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
              ].map((s) => (
                <div key={s.label} className={`${s.bg} border rounded-2xl p-6`}>
                  <p className="text-gray-400 text-sm">{s.label}</p>
                  <h3 className={`text-5xl font-bold mt-2 ${s.color}`}>{s.count}</h3>
                </div>
              ))}
            </div>
            <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-6">All Alerts</h3>
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
            </div>
          </motion.div>
        )}

        {/* ANALYTICS */}
        {activeTab === "analytics" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="grid grid-cols-4 gap-6 mb-8">
              {[
                { label: "Total Trips (Week)", value: "258", trend: "+12%", up: true },
                { label: "Total Incidents", value: "11", trend: "-4%", up: false },
                { label: "Avg Fuel Efficiency", value: "74%", trend: "+2%", up: true },
                { label: "On-time Delivery", value: "91%", trend: "+5%", up: true },
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
                  <div className={`flex items-center gap-1 mt-2 text-sm ${kpi.up ? "text-green-400" : "text-red-400"}`}>
                    {kpi.up ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {kpi.trend} vs last week
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">Weekly Trips vs Incidents</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                      <XAxis dataKey="day" stroke="#64748B" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#64748B" tick={{ fontSize: 12 }} />
                      <Tooltip contentStyle={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                      <Bar dataKey="trips" fill="#22D3EE" radius={[4, 4, 0, 0]} name="Trips" />
                      <Bar dataKey="incidents" fill="#F87171" radius={[4, 4, 0, 0]} name="Incidents" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">Avg Fuel Efficiency (Week)</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyData}>
                      <XAxis dataKey="day" stroke="#64748B" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#64748B" tick={{ fontSize: 12 }} domain={[60, 85]} />
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
                </div>
              </div>
            </div>
            <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Activity className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-semibold">Route Efficiency Breakdown</h3>
              </div>
              <div className="space-y-4">
                {efficiencyData.map((route) => (
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
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-green-400 text-sm">Live tracking active</span>
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
                    <h3 className={`text-3xl font-bold mt-2 ${parseInt(selectedTruck.temp) > 42 ? "text-orange-400" : "text-white"}`}>{selectedTruck.temp}</h3>
                  </div>
                  <div className="bg-[#111827] rounded-2xl p-5">
                    <p className="text-gray-400 text-sm">Driver</p>
                    <h3 className="text-xl font-bold mt-2">{selectedTruck.driver}</h3>
                  </div>
                </div>
                <div className="bg-[#111827] rounded-2xl p-5">
                  <h4 className="text-lg font-semibold mb-3">Route information</h4>
                  <div className="flex items-center gap-2 text-gray-300 mb-4">
                    <MapPin className="w-4 h-4 text-cyan-400" />{selectedTruck.route}
                  </div>
                  <div>
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                      <span>Route progress</span>
                      <span>{Math.round(selectedTruck.progress ?? 68)}% complete</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div
                        className="bg-cyan-400 h-2.5 rounded-full transition-all duration-700"
                        style={{ width: `${selectedTruck.progress ?? 68}%` }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}