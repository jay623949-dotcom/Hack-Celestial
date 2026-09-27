import { API_BASE_URL, BACKEND_URL } from './config';

/**
 * Resilient API fetcher with timeout protection, safe non-JSON error handling,
 * and structured error normalization.
 */
async function fetchFromApi(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const timeoutMs = options.timeoutMs || 25000; // 25s default timeout

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let activeRole = 'admin';
  try {
    if (typeof window !== 'undefined') {
      activeRole = localStorage.getItem('resort360_demo_role') || 'admin';
    }
  } catch (_) {}

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': activeRole,
        'x-role': activeRole,
        ...options.headers,
      },
      signal: controller.signal,
      ...options,
    });

    clearTimeout(timeoutId);

    // Safely parse JSON or text response
    let data = null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { error: { message: text || `HTTP ${response.status}` } };
    }

    if (!response.ok) {
      const errorMsg = data?.error?.message || `API request failed with status ${response.status}`;
      const err = new Error(errorMsg);
      err.status = response.status;
      err.code = data?.error?.code || (response.status === 404 ? 'RESOURCE_NOT_FOUND' : 'API_ERROR');
      err.details = data?.error?.details || null;
      throw err;
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      const timeoutErr = new Error(`Request to ${endpoint} timed out after ${timeoutMs / 1000}s. Please check backend connection.`);
      timeoutErr.code = 'REQUEST_TIMEOUT';
      timeoutErr.status = 504;
      console.warn(`[API Timeout] ${endpoint}`);
      throw timeoutErr;
    }

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
 * Reset Demo Environment to deterministic VIP Early Arrival Scenario
 */
export async function triggerDemoReset() {
  return fetchFromApi('/demo/reset', {
    method: 'POST',
    body: JSON.stringify({ scenario: 'vip_early_arrival' }),
  });
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
 * Update room operational status, condition, or notes
 */
export async function updateRoom(id, updates) {
  return fetchFromApi(`/rooms/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
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
 * Register a new operational incident / room concern
 */
export async function createIncident(data) {
  return fetchFromApi('/incidents', {
    method: 'POST',
    body: JSON.stringify(data),
  });
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
 * Update incident status or resolution notes
 */
export async function updateIncident(id, updates) {
  return fetchFromApi(`/incidents/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

/**
 * Update task status or assignment
 */
export async function updateTask(id, updates) {
  return fetchFromApi(`/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

/**
 * Update guest record
 */
export async function updateGuest(id, updates) {
  return fetchFromApi(`/guests/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

/**
 * Update staff duty status
 */
export async function updateStaff(id, updates) {
  return fetchFromApi(`/staff/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
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
 * Submits trigger or operational context to backend AI service
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
 * Nugen Domain-Aligned AI Analysis
 * Submits incident context to Nugen domain model
 */
export async function analyzeWithNugen(payload) {
  const body = payload?.context || payload?.trigger ? payload : { trigger: payload };
  return fetchFromApi('/ai/nugen/analyze', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * Fetch Nugen Platform and Model Status
 */
export async function getNugenStatus() {
  return fetchFromApi('/ai/nugen/status');
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

export async function resetActionPlan(id) {
  return fetchFromApi(`/action-plans/${id}/reset`, {
    method: 'POST',
  });
}

/**
 * Phase 5 Execution APIs
 */
export async function executeActionPlan(id, { actorId, actorRole } = {}) {
  return fetchFromApi(`/action-plans/${id}/execute`, {
    method: 'POST',
    body: JSON.stringify({ actor_id: actorId, actor_role: actorRole }),
  });
}

export async function getExecutionState(id) {
  return fetchFromApi(`/action-plans/${id}/execution`);
}

export async function getExecutionTimeline(id) {
  return fetchFromApi(`/action-plans/${id}/timeline`);
}

export async function updateTaskStatus(taskId, status) {
  return fetchFromApi(`/tasks/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}



// ─────────────────────────────────────────────────────────────────────────────
// SMART RESORT 360 AUTONOMOUS AGENT API WRAPPERS
// ─────────────────────────────────────────────────────────────────────────────
const BACKEND_ROOT = BACKEND_URL;

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
  // Ping & Telemetry
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
  getCalendarMonth: (year, month) => smartApiRequest(`/api/calendar/month?year=${year}&month=${month}`),
  getCalendarDate: (date) => smartApiRequest(`/api/calendar/date/${date}`),
  getAnnualSeasonality: (year) => smartApiRequest(`/api/calendar/annual?year=${year}`),
  getCalendarEvents: () => smartApiRequest('/api/calendar/events'),

  // Intelligence Engine
  guestIntake: (data) => smartApiRequest('/api/engine/guest-intake', 'POST', data),
  costIncident: (data) => smartApiRequest('/api/engine/cost-incident', 'POST', data),
  flashSale: (data) => smartApiRequest('/api/engine/flash-sale', 'POST', data),
  housekeepingReorder: (data) => smartApiRequest('/api/engine/housekeeping-reorder', 'POST', data),
};

export async function getCalendarMonth(year, month) {
  return smartResortApi.getCalendarMonth(year, month);
}

export async function getAnnualSeasonality(year) {
  return smartResortApi.getAnnualSeasonality(year);
}

export async function getCalendarEvents() {
  return smartResortApi.getCalendarEvents();
}

export const weatherDigitalTwinApi = {
  getCurrentWeather: () => fetchFromApi('/weather/current'),
  refreshWeather: () => fetchFromApi('/weather/refresh'),
  getContext: () => fetchFromApi('/digital-twin/weather/context'),
  getSignals: () => fetchFromApi('/digital-twin/weather/signals'),
  runSimulation: (params) => fetchFromApi('/digital-twin/weather/simulate', {
    method: 'POST',
    body: JSON.stringify(params),
  }),
  getNugenImpact: (params) => fetchFromApi('/nugen/weather-impact', {
    method: 'POST',
    body: JSON.stringify(params || {}),
  }),
};






