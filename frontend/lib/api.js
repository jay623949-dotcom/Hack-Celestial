/**
 * Shared frontend API and backend communication client.
 * Base URL defaults to http://localhost:5000/api/v1
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

async function fetchFromApi(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error?.message || `API request failed with status ${response.status}`);
    }
    return data;
  } catch (error) {
    console.error(`[API Error] ${endpoint}:`, error.message);
    throw error;
  }
}

/**
 * Health check
 */
export async function checkBackendHealth() {
  return fetchFromApi('/health');
}

/**
 * Real-time operations summary
 */
export async function getOperationsSummary() {
  return fetchFromApi('/operations/summary');
}

/**
 * Rooms list with optional filtering
 */
export async function getRooms(params = {}) {
  const query = new URLSearchParams();
  if (params.status && params.status !== 'all') query.append('status', params.status);
  if (params.type) query.append('type', params.type);
  if (params.floor) query.append('floor', params.floor);

  const qs = query.toString() ? `?${query.toString()}` : '';
  return fetchFromApi(`/rooms${qs}`);
}

/**
 * Open incidents
 */
export async function getIncidents(params = {}) {
  const query = new URLSearchParams();
  if (params.status) query.append('status', params.status);
  if (params.severity) query.append('severity', params.severity);
  if (params.department) query.append('department', params.department);
  if (params.room_id) query.append('room_id', params.room_id);

  const qs = query.toString() ? `?${query.toString()}` : '';
  return fetchFromApi(`/incidents${qs}`);
}

/**
 * Active tasks
 */
export async function getTasks(params = {}) {
  const query = new URLSearchParams();
  if (params.status) query.append('status', params.status);
  if (params.department) query.append('department', params.department);
  if (params.priority) query.append('priority', params.priority);
  if (params.assigned_to) query.append('assigned_to', params.assigned_to);

  const qs = query.toString() ? `?${query.toString()}` : '';
  return fetchFromApi(`/tasks${qs}`);
}

/**
 * Guests
 */
export async function getGuests(params = {}) {
  const query = new URLSearchParams();
  if (params.vip !== undefined) query.append('vip', params.vip);
  if (params.room_id) query.append('room_id', params.room_id);

  const qs = query.toString() ? `?${query.toString()}` : '';
  return fetchFromApi(`/guests${qs}`);
}

/**
 * Staff
 */
export async function getStaff(params = {}) {
  const query = new URLSearchParams();
  if (params.department) query.append('department', params.department);
  if (params.status) query.append('status', params.status);

  const qs = query.toString() ? `?${query.toString()}` : '';
  return fetchFromApi(`/staff${qs}`);
}

/**
 * AI Operations Analysis
 * Submits operational context to backend OpenAI service
 */
export async function analyzeOperationsContext(context) {
  return fetchFromApi('/ai/analyze', {
    method: 'POST',
    body: JSON.stringify({ context }),
  });
}

