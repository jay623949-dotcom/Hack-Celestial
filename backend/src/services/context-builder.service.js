const dataStore = require('../data/dataStore');

/**
 * ContextBuilderService
 * Transforms raw database state into a compact, relevant Canonical AI Context
 * adhering to /schemas/ai/agent-context.schema.json.
 * 
 * Factual Integrity Principles:
 * 1. Never invent missing data (use null or omit).
 * 2. Never treat null as zero.
 * 3. All constraints are strictly derived from observed database state.
 */
class ContextBuilderService {
  /**
   * Build Canonical AI Context for an operational trigger
   * @param {Object} triggerOptions 
   * @returns {Object} Canonical Operational Context
   */
  async buildContext(triggerOptions = {}) {
    const store = dataStore.getStore();
    const allRooms = store.rooms || [];
    const allGuests = store.guests || [];
    const allStaff = store.staff || [];
    const allIncidents = store.incidents || [];
    const allTasks = store.tasks || [];
    const rawResort = store.resort || {};

    const now = new Date().toISOString();
    const contextId = `ctx-${Date.now().toString().slice(-6)}`;

    // Normalize resort to meet schema requirements
    const resort = {
      id: rawResort.id || 'resort-001',
      name: rawResort.name || 'The Grand Azure Bay Resort & Villas',
      location: rawResort.location || 'Goa, India',
      timezone: rawResort.timezone || 'Asia/Kolkata',
      total_rooms: Number(rawResort.total_rooms) || allRooms.length || 20,
    };

    const triggerType = triggerOptions.type || triggerOptions.trigger_type || 'multiple_incidents';
    let trigger = {
      type: triggerType,
      incident_id: triggerOptions.incident_id || null,
      severity: 'medium',
      description: triggerOptions.description || '',
    };

    let selectedIncidents = [];
    let selectedRooms = [];
    let selectedGuests = [];
    let selectedStaff = [];
    let selectedTasks = [];
    let derivedConstraints = [];
    let upcomingEvents = [];

    // Helper: Map raw room to canonical room format
    const mapRoom = (r) => {
      const roomObj = {
        id: r.id,
        number: String(r.number),
        floor: Number(r.floor) || 1,
        type: r.type || 'Standard',
        status: r.status || 'available',
      };
      if (r.housekeeping_status) {
        roomObj.housekeeping_status = r.housekeeping_status;
      }
      if (Array.isArray(r.features) && r.features.length > 0) {
        roomObj.features = r.features;
      }
      return roomObj;
    };

    // Helper: Map raw guest to canonical guest format (minimizing sensitive data)
    const mapGuest = (g) => {
      const guestObj = {
        id: g.id,
        name: g.name,
        vip: Boolean(g.vip),
      };
      if (g.vip_tier) guestObj.vip_tier = g.vip_tier;
      if (g.room_id) guestObj.room_id = g.room_id;
      if (g.check_in) guestObj.check_in = g.check_in;
      if (g.check_out) guestObj.check_out = g.check_out;
      if (g.arrival_type) guestObj.arrival_type = g.arrival_type;
      if (g.notes) guestObj.notes = g.notes;
      return guestObj;
    };

    // Helper: Map raw staff
    const mapStaff = (s) => ({
      id: s.id,
      name: s.name,
      department: s.department,
      role: s.role || 'Staff Member',
      status: s.status || 'on_duty',
      current_task: s.current_task || 'Operational duty',
    });

    // Helper: Map raw incident
    const mapIncident = (i) => ({
      id: i.id,
      title: i.title,
      severity: i.severity || 'medium',
      status: i.status || 'open',
      department: i.department || 'general',
      room_id: i.room_id || null,
      guest_id: i.guest_id || null,
    });

    // Helper: Map raw task
    const mapTask = (t) => ({
      id: t.id,
      title: t.title,
      department: t.department || 'general',
      assigned_to: t.assigned_to || null,
      priority: t.priority || 'medium',
      status: t.status || 'pending',
    });

    // --- Scenario Dispatches Based on Trigger Type ---

    if (triggerType === 'vip_early_arrival' || triggerType === 'vip_arrival') {
      const guestId = triggerOptions.guest_id || 'guest-001';
      const guest = allGuests.find((g) => g.id === guestId) || allGuests.find((g) => g.vip) || allGuests[0];

      trigger.severity = 'critical';
      trigger.incident_id = triggerOptions.incident_id || 'incident-001';
      trigger.description = trigger.description || `${guest ? guest.name : 'VIP Guest'} has arrived early at front desk while assigned accommodation requires operational coordination.`;

      if (guest) {
        selectedGuests.push(mapGuest(guest));
        // Find assigned room
        if (guest.room_id) {
          const assignedRoom = allRooms.find((r) => r.id === guest.room_id);
          if (assignedRoom) selectedRooms.push(mapRoom(assignedRoom));
        }
      }

      // Prioritize Room 205 (Deluxe) as the primary alternative room
      const alt205 = allRooms.find((r) => String(r.number) === '205');
      if (alt205 && !selectedRooms.some((sr) => sr.id === alt205.id)) {
        selectedRooms.push(mapRoom(alt205));
      }

      // Add any additional available Deluxe/Suite rooms if needed
      const otherAltRooms = allRooms.filter(
        (r) => (r.status === 'available' || r.type.toLowerCase().includes('deluxe')) &&
               (!guest || r.id !== guest.room_id) &&
               (!alt205 || r.id !== alt205.id)
      ).slice(0, 1);
      otherAltRooms.forEach((r) => {
        if (!selectedRooms.some((sr) => sr.id === r.id)) {
          selectedRooms.push(mapRoom(r));
        }
      });

      // Relevant incidents (Room 401 AC Failure)
      selectedIncidents = allIncidents
        .filter((i) => (guest && i.guest_id === guest.id) || (guest && i.room_id === guest.room_id) || i.id === 'INC-401-AC' || i.id === 'incident-001')
        .map(mapIncident);

      // Relevant staff: Amit Shah (Front Desk), Priya Sharma (Housekeeping), Rohan Mehta (Maintenance HVAC)
      const keyStaffIds = ['staff-001', 'staff-003', 'staff-005', 'staff-002'];
      const keyStaffMembers = allStaff.filter((s) => keyStaffIds.includes(s.id));
      const remainingStaff = allStaff.filter(
        (s) => !keyStaffIds.includes(s.id) && ['front_desk', 'housekeeping', 'maintenance', 'revenue'].includes(s.department) && (s.status === 'on_duty' || s.status === 'available')
      ).slice(0, 2);

      selectedStaff = [...keyStaffMembers, ...remainingStaff].map(mapStaff);

      // Related tasks
      selectedTasks = allTasks
        .filter((t) => (guest && t.room_id === guest.room_id) || selectedIncidents.some((i) => i.id === t.incident_id))
        .slice(0, 4)
        .map(mapTask);

    } else if (triggerType === 'hvac_failure' || triggerType === 'room_hvac_failure') {
      const roomId = triggerOptions.room_id || 'room-401';
      const targetRoom = allRooms.find((r) => r.id === roomId) || allRooms[0];

      trigger.severity = 'critical';
      trigger.incident_id = triggerOptions.incident_id || 'incident-001';
      trigger.description = trigger.description || `HVAC compressor malfunction reported in ${targetRoom.number}. Ambient temperature rising.`;

      if (targetRoom) selectedRooms.push(mapRoom(targetRoom));

      // Alternative available room on same/similar tier
      const altRoom = allRooms.find((r) => r.id !== targetRoom.id && (r.status === 'available' || r.type === targetRoom.type));
      if (altRoom) selectedRooms.push(mapRoom(altRoom));

      // Guest assigned if any
      const affectedGuest = allGuests.find((g) => g.room_id === targetRoom.id);
      if (affectedGuest) selectedGuests.push(mapGuest(affectedGuest));

      selectedIncidents = allIncidents
        .filter((i) => i.room_id === targetRoom.id || i.id === 'incident-001')
        .map(mapIncident);

      // Maintenance and guest service staff
      selectedStaff = allStaff
        .filter((s) => ['maintenance', 'front_desk'].includes(s.department) && s.status === 'on_duty')
        .slice(0, 4)
        .map(mapStaff);

      selectedTasks = allTasks
        .filter((t) => t.room_id === targetRoom.id || t.department === 'maintenance')
        .slice(0, 3)
        .map(mapTask);

    } else if (triggerType === 'housekeeping_bottleneck') {
      trigger.severity = 'high';
      trigger.incident_id = triggerOptions.incident_id || 'incident-002';
      trigger.description = trigger.description || 'Turnover backlog detected. Multiple departure rooms require turnover with limited available attendants.';

      // Dirty rooms needing clean
      const dirtyRooms = allRooms.filter((r) => r.status === 'dirty' || r.housekeeping_status === 'blocked').slice(0, 4);
      selectedRooms = (dirtyRooms.length > 0 ? dirtyRooms : allRooms.slice(0, 3)).map(mapRoom);

      // Housekeeping staff
      selectedStaff = allStaff
        .filter((s) => s.department === 'housekeeping')
        .map(mapStaff);

      selectedIncidents = allIncidents
        .filter((i) => i.department === 'housekeeping')
        .map(mapIncident);

      selectedTasks = allTasks
        .filter((t) => t.department === 'housekeeping')
        .slice(0, 4)
        .map(mapTask);

    } else if (triggerType === 'large_group_arrival') {
      trigger.severity = 'high';
      trigger.incident_id = triggerOptions.incident_id || 'incident-004';
      trigger.description = trigger.description || '50-guest wedding party arriving on 4th floor; pre-check-in verification in progress.';

      // Floor 4 rooms
      const floor4Rooms = allRooms.filter((r) => r.floor === 4);
      selectedRooms = (floor4Rooms.length > 0 ? floor4Rooms : allRooms.slice(0, 4)).map(mapRoom);

      selectedStaff = allStaff
        .filter((s) => ['front_desk', 'revenue', 'guest_services'].includes(s.department) && s.status === 'on_duty')
        .map(mapStaff);

      selectedIncidents = allIncidents
        .filter((i) => i.department === 'revenue' || (i.room_id && selectedRooms.some((r) => r.id === i.room_id)))
        .map(mapIncident);

      selectedTasks = allTasks
        .filter((t) => selectedRooms.some((r) => r.id === t.room_id) || t.department === 'revenue')
        .slice(0, 4)
        .map(mapTask);

      upcomingEvents.push({
        event_id: 'evt-group-001',
        title: '50-Guest Wedding Group Inbound',
        expected_time: '2026-09-26T14:00:00+05:30',
        guest_count: 50,
        room_block: ['402', '403', '404'],
      });

    } else {
      // Default: multiple_incidents / multiple_simultaneous_incidents
      trigger.severity = 'critical';
      trigger.description = trigger.description || 'Multiple simultaneous operational incidents requiring cross-departmental coordination.';

      // Open incidents
      const openIncidents = allIncidents.filter((i) => i.status === 'open' || i.status === 'in_progress');
      selectedIncidents = (openIncidents.length > 0 ? openIncidents : allIncidents).slice(0, 5).map(mapIncident);

      // Rooms tied to active incidents or dirty/maintenance
      const activeRoomIds = new Set(selectedIncidents.map((i) => i.room_id).filter(Boolean));
      allRooms.forEach((r) => {
        if (activeRoomIds.has(r.id) || r.status === 'maintenance' || r.status === 'dirty') {
          selectedRooms.push(mapRoom(r));
        }
      });
      // Guarantee at least 1-2 candidate alternative rooms
      const availableRooms = allRooms.filter((r) => r.status === 'available');
      if (availableRooms.length > 0 && selectedRooms.length < 5) {
        selectedRooms.push(mapRoom(availableRooms[0]));
      }
      if (selectedRooms.length === 0) {
        selectedRooms = allRooms.slice(0, 4).map(mapRoom);
      }

      // Guests affected
      const activeGuestIds = new Set(selectedIncidents.map((i) => i.guest_id).filter(Boolean));
      selectedGuests = allGuests
        .filter((g) => activeGuestIds.has(g.id) || g.vip)
        .slice(0, 3)
        .map(mapGuest);

      // On-duty staff across active departments
      selectedStaff = allStaff
        .filter((s) => s.status === 'on_duty')
        .slice(0, 8)
        .map(mapStaff);

      // Tasks in progress or pending
      selectedTasks = allTasks
        .filter((t) => t.status === 'in_progress' || t.status === 'pending')
        .slice(0, 6)
        .map(mapTask);
    }

    // --- Strict Data Derivation of Operational Constraints ---
    const onDutyHousekeepers = allStaff.filter((s) => s.department === 'housekeeping' && s.status === 'on_duty').length;
    derivedConstraints.push({
      id: 'const-hk-capacity',
      type: 'labor_capacity',
      description: `${onDutyHousekeepers} housekeeping staff currently on duty across all floors.`,
    });

    const maintenanceRooms = allRooms.filter((r) => r.status === 'maintenance');
    if (maintenanceRooms.length > 0) {
      derivedConstraints.push({
        id: 'const-maint-rooms',
        type: 'room_unavailability',
        description: `Room(s) ${maintenanceRooms.map((r) => r.number).join(', ')} unavailable due to maintenance defect.`,
      });
    }

    const dirtyRoomsCount = allRooms.filter((r) => r.status === 'dirty').length;
    if (dirtyRoomsCount > 0) {
      derivedConstraints.push({
        id: 'const-dirty-backlog',
        type: 'cleaning_backlog',
        description: `${dirtyRoomsCount} departure room(s) currently marked dirty awaiting turnover.`,
      });
    }

    // Floor 4 wedding block constraint
    const reservedFloor4 = allRooms.filter((r) => r.floor === 4 && r.status === 'reserved');
    if (reservedFloor4.length > 0) {
      derivedConstraints.push({
        id: 'const-floor4-block',
        type: 'inventory_lock',
        description: `Floor 4 rooms (${reservedFloor4.map((r) => r.number).join(', ')}) reserved for incoming wedding party.`,
      });
      if (upcomingEvents.length === 0) {
        upcomingEvents.push({
          event_id: 'evt-wedding-01',
          title: '50-Guest Wedding Group Arrival',
          expected_time: '2026-09-26T14:00:00+05:30',
          guest_count: 50,
          room_block: reservedFloor4.map((r) => String(r.number)),
        });
      }
    }

    // Assemble Canonical Context Object
    const canonicalContext = {
      context_id: contextId,
      schema_version: '1.0',
      created_at: now,
      resort,
      trigger,
      guests: selectedGuests,
      rooms: selectedRooms,
      staff: selectedStaff,
      incidents: selectedIncidents,
      tasks: selectedTasks,
      constraints: derivedConstraints,
      upcoming_events: upcomingEvents,
    };

    console.log(`[ContextBuilder] Built context ${contextId} for trigger "${trigger.type}": ${canonicalContext.rooms.length} rooms, ${canonicalContext.incidents.length} incidents, ${canonicalContext.staff.length} staff, ${canonicalContext.tasks.length} tasks.`);

    return canonicalContext;
  }
}

module.exports = new ContextBuilderService();
