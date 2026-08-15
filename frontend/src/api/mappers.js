/** Presentation-only lookups — telemetry values come from the backend. */
export const ROUTE_LABELS = {
  "ROUTE-01": "Delhi → Jaipur",
  "ROUTE-02": "Mumbai → Pune",
  "ROUTE-03": "Bangalore → Mysore",
};

export const DRIVER_NAMES = {
  "DRIVER-01": "Rajesh Kumar",
  "DRIVER-02": "Anil Sharma",
  "DRIVER-03": "Suresh Patel",
  "DRIVER-04": "Venkat Rao",
  "DRIVER-05": "Ravi Naik",
};

/** Producer simulation bounds (Pune region) mapped to SVG map area. */
const MAP_BOUNDS = {
  minLat: 18.45,
  maxLat: 18.75,
  minLng: 73.75,
  maxLng: 74.05,
  svgMinX: 120,
  svgMaxX: 200,
  svgMinY: 310,
  svgMaxY: 380,
};

export function latLngToSvg(lat, lng) {
  const x =
    MAP_BOUNDS.svgMinX +
    ((lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) *
      (MAP_BOUNDS.svgMaxX - MAP_BOUNDS.svgMinX);
  const y =
    MAP_BOUNDS.svgMinY +
    ((MAP_BOUNDS.maxLat - lat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) *
      (MAP_BOUNDS.svgMaxY - MAP_BOUNDS.svgMinY);
  return { x, y };
}

export function deriveDisplayStatus(truck) {
  if (truck.status === "STOPPED") {
    return "Stopped";
  }

  const alerts = truck.alerts || [];
  if (alerts.includes("OVERSPEED")) return "Overspeed";
  if (alerts.includes("LOW_FUEL")) return "Low Fuel";
  if (alerts.includes("HIGH_ENGINE_TEMPERATURE")) return "High Temp";
  if (alerts.includes("NORMAL")) return "Moving";
  return "Moving";
}

export function mapTruckToUi(truck) {
  const route =
    ROUTE_LABELS[truck.route_id] || truck.route_id || "Unknown route";
  const driver =
    DRIVER_NAMES[truck.driver_id] || truck.driver_id || "Unknown driver";
  const temperature = truck.temperature ?? 0;

  return {
    id: truck.truck_id,
    truck_id: truck.truck_id,
    driver,
    driver_id: truck.driver_id,
    route,
    route_id: truck.route_id,
    speed: truck.speed ?? 0,
    fuel: Math.round(truck.fuel ?? 0),
    temp: `${temperature}°C`,
    temperature,
    status: deriveDisplayStatus(truck),
    backendStatus: truck.status,
    alerts: truck.alerts || [],
    latitude: truck.latitude,
    longitude: truck.longitude,
    timestamp: truck.timestamp,
    mapPos: latLngToSvg(truck.latitude, truck.longitude),
  };
}

export function formatAlertTime(timestamp) {
  if (!timestamp) return "Just now";
  const then = new Date(timestamp);
  const diffMs = Date.now() - then.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  return `${diffHr} hr ago`;
}

export function mapAlertToUi(alert) {
  return {
    id: alert.id,
    truck: alert.truck_id,
    type: alert.type,
    level: alert.level,
    time: formatAlertTime(alert.timestamp),
    detail: alert.detail,
    resolved: false,
  };
}

export function buildDashboardStats(stats, alertList) {
  const criticalCount = alertList.filter(
    (a) => a.level === "Critical" && !a.resolved
  ).length;

  return [
    {
      title: "Active Trucks",
      value: String(stats.active_count ?? 0),
      iconKey: "Truck",
      color: "text-cyan-400",
    },
    {
      title: "Critical Alerts",
      value: String(criticalCount).padStart(2, "0"),
      iconKey: "AlertTriangle",
      color: "text-red-400",
    },
    {
      title: "Avg Speed",
      value: `${Math.round(stats.avg_speed ?? 0)} km/h`,
      iconKey: "Gauge",
      color: "text-green-400",
    },
    {
      title: "Fuel Avg",
      value: `${Math.round(stats.avg_fuel ?? 0)}%`,
      iconKey: "Fuel",
      color: "text-yellow-400",
    },
  ];
}

export function buildFuelChartData(trucks) {
  return trucks.map((t) => ({
    truck: t.id.replace("TRUCK-", "T"),
    fuel: t.fuel,
  }));
}

export function buildRouteEfficiency(trucks) {
  const byRoute = {};
  for (const truck of trucks) {
    const key = truck.route_id || truck.route;
    if (!byRoute[key]) {
      byRoute[key] = { totalFuel: 0, count: 0, label: truck.route };
    }
    byRoute[key].totalFuel += truck.fuel;
    byRoute[key].count += 1;
  }
  return Object.values(byRoute).map((entry) => ({
    route: entry.label.replace(" → ", "→"),
    efficiency: Math.round(entry.totalFuel / entry.count),
  }));
}
