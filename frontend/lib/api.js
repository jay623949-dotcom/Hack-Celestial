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
 * Fetch Canonical AI Context dynamically assembled from database state
 */
export async function getOperationalContext(trigger = { type: 'multiple_incidents' }) {
  return fetchFromApi('/ai/context', {
    method: 'POST',
    body: JSON.stringify({ trigger }),
  });
}

/**
 * AI Operations Analysis
 * Submits trigger or operational context to backend OpenAI service
 */
export async function analyzeOperationsContext(payload) {
  // If payload has context or trigger, send as-is; otherwise treat payload as trigger
  const body = payload?.context || payload?.trigger ? payload : { trigger: payload };
  return fetchFromApi('/ai/analyze', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * Create a new guest entry
 */
export async function createGuest(guestData) {
  return fetchFromApi('/guests', {
    method: 'POST',
    body: JSON.stringify(guestData),
  });
}

/**
 * Action Plans & Manager Decision APIs
 */
export async function getActionPlan(id) {
  return fetchFromApi(`/action-plans/${id}`);
}

export async function getActionPlanAuditTrail(id) {
  return fetchFromApi(`/action-plans/${id}/audit-trail`);
}

export async function approveActionPlan(id, { comment, actorId, actorRole } = {}) {
  return fetchFromApi(`/action-plans/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ comment, actor_id: actorId, actor_role: actorRole }),
  });
}

export async function rejectActionPlan(id, { reason, actorId, actorRole } = {}) {
  return fetchFromApi(`/action-plans/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason, actor_id: actorId, actor_role: actorRole }),
  });
}

export async function modifyActionPlan(id, { modifications, reason, actorId, actorRole } = {}) {
  return fetchFromApi(`/action-plans/${id}/modify`, {
    method: 'POST',
    body: JSON.stringify({ modifications, reason, actor_id: actorId, actor_role: actorRole }),
  });
}

export async function updateActionItemStatus(planId, itemId, status) {
  return fetchFromApi(`/action-plans/${planId}/items/${itemId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}


// ─────────────────────────────────────────────────────────────────────────────
// SMART RESORT 360 AUTONOMOUS AGENT API WRAPPERS
// ─────────────────────────────────────────────────────────────────────────────
const BACKEND_ROOT = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1').replace(/\/api\/v1\/?$/, '');

export async function smartApiRequest(path, method = 'GET', body = null) {
  const url = `${BACKEND_ROOT}${path.startsWith('/') ? path : `/${path}`}`;
  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`API error ${res.status}: ${errText}`);
    }
    return res.json();
  } catch (err) {
    console.error(`[SmartApi Error] ${path}:`, err.message);
    throw err;
  }
}

export const smartResortApi = {
  // Demo Reset & Ping
  resetDemo: () => smartApiRequest('/demo/reset', 'POST'),
  ping: () => smartApiRequest('/api/test/ping', 'POST'),
  getGuardrails: () => smartApiRequest('/api/guardrails'),
  getEventHistory: () => smartApiRequest('/api/events/history'),

  // Front Desk
  checkIn: (data) => smartApiRequest('/api/frontdesk/checkin', 'POST', data),
  getCheckedInGuests: () => smartApiRequest('/api/frontdesk/guests'),
  serviceRecovery: (guestId, action) => smartApiRequest('/api/frontdesk/service-recovery', 'POST', { guest_id: guestId, action }),
  getPriorityQueue: () => smartApiRequest('/api/frontdesk/priority-queue'),

  // Housekeeping
  getHousekeepingTasks: () => smartApiRequest('/api/housekeeping/tasks'),
  reorderHousekeeping: (taskIds) => smartApiRequest('/api/housekeeping/reorder', 'POST', { task_ids_in_order: taskIds }),
  completeHousekeepingTask: (id) => smartApiRequest('/api/housekeeping/complete', 'POST', { task_id: id }),

  // Maintenance
  uploadTicket: (data) => smartApiRequest('/api/maintenance/upload-ticket', 'POST', data),
  resolveWorkOrder: (workOrderId, resolutionNotes) => smartApiRequest('/api/maintenance/resolve', 'POST', { work_order_id: workOrderId, resolution_notes: resolutionNotes }),
  getAvailableSafeRooms: () => smartApiRequest('/api/maintenance/rooms/available-safe'),
  imageTriage: (data) => smartApiRequest('/api/maintenance/diagnostics/image-triage', 'POST', data),
  scanAnomalies: () => smartApiRequest('/api/maintenance/anomaly/scan', 'POST'),
  getActiveAnomalies: () => smartApiRequest('/api/maintenance/anomaly/active'),

  // Revenue
  recalculatePricing: (data) => smartApiRequest('/api/revenue/pricing', 'POST', data),
  getCurrentPricing: (category) => smartApiRequest(`/api/revenue/pricing/current/${category}`),
  getNetRevPar: () => smartApiRequest('/api/revenue/net-revpar'),
  createFlashSale: (data) => smartApiRequest('/api/revenue/flash-sale', 'POST', data),
  simulateWingShutdown: (wingId) => smartApiRequest('/api/revenue/wing-shutdown-simulate', 'POST', { wing_id: wingId }),

  // Intelligence Engine
  guestIntake: (data) => smartApiRequest('/api/engine/guest-intake', 'POST', data),
  maintenanceCv: (data) => smartApiRequest('/api/engine/maintenance-cv', 'POST', data),
  costIncident: (data) => smartApiRequest('/api/engine/cost-incident', 'POST', data),
  flashSale: (data) => smartApiRequest('/api/engine/flash-sale', 'POST', data),
  housekeepingReorder: (data) => smartApiRequest('/api/engine/housekeeping-reorder', 'POST', data),
};




