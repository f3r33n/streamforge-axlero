const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

async function apiGet(path) {
  const response = await fetch(`${API_URL}${path}`);
  if (!response.ok) {
    throw new Error(`API ${path} failed: ${response.status}`);
  }
  return response.json();
}

export function fetchHealth() {
  return apiGet("/health");
}

export function fetchTrucks() {
  return apiGet("/trucks");
}

export function fetchStats() {
  return apiGet("/stats");
}

export function fetchAlerts() {
  return apiGet("/alerts");
}

export { API_URL };
