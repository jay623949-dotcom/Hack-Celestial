/**
 * Smart Resort 360 - In-Memory State & Data Store
 * Matches the complete schema & seed dataset from HackCel.
 */

// Initial Seed Generator
function generateSeedData() {
  const now = new Date();

  // 1. Rooms (101-110, 201-210, 301-310, V01-V03)
  const rooms = [];
  const categories = {
    1: { cat: 'standard', baseRate: 149.0, wing: 'A' },
    2: { cat: 'deluxe', baseRate: 219.0, wing: 'A' },
    3: { cat: 'suite', baseRate: 349.0, wing: 'B' },
  };

  let idCounter = 1;
  for (const floor of [1, 2, 3]) {
    const { cat, baseRate, wing } = categories[floor];
    for (let r = 1; r <= 10; r++) {
      const roomNum = `${floor}${r < 10 ? '0' + r : r}`;
      rooms.push({
        id: idCounter++,
        room_number: roomNum,
        category: cat,
        base_rate: baseRate,
        current_rate: baseRate,
        status: 'available',
        fault_free: true,
        floor,
        wing,
      });
    }
  }

  // Villas
  for (let i = 1; i <= 3; i++) {
    rooms.push({
      id: idCounter++,
      room_number: `V0${i}`,
      category: 'villa',
      base_rate: 599.0,
      current_rate: 599.0,
      status: 'available',
      fault_free: true,
      floor: 1,
      wing: 'C',
    });
  }

  // Room lookup map
  const roomMap = {};
  rooms.forEach((r) => {
    roomMap[r.room_number] = r.id;
  });

  // 2. Technicians
  const technicians = [
    { id: 1, name: 'Carlos Mendez', skill_tags: ['plumbing', 'hvac', 'general'], current_job_count: 0, status: 'available' },
    { id: 2, name: 'Priya Sharma', skill_tags: ['electrical', 'general'], current_job_count: 0, status: 'available' },
    { id: 3, name: 'James Okafor', skill_tags: ['hvac', 'pool', 'elevator'], current_job_count: 0, status: 'available' },
  ];

  // 3. Assets
  const assets = [
    {
      id: 1,
      asset_type: 'hvac',
      room_id: roomMap['101'],
      run_hours: 4800,
      location_label: 'Room 101',
      repair_history: [
        { issue_type: 'refrigerant_low', date: '2024-01-15', resolved_by: 'Carlos Mendez' },
        { issue_type: 'refrigerant_low', date: '2024-06-20', resolved_by: 'James Okafor' },
      ],
    },
    {
      id: 2,
      asset_type: 'hvac',
      room_id: roomMap['204'],
      run_hours: 3200,
      location_label: 'Room 204',
      repair_history: [{ issue_type: 'compressor_fault', date: '2025-03-10', resolved_by: 'James Okafor' }],
    },
    {
      id: 3,
      asset_type: 'plumbing',
      room_id: roomMap['102'],
      run_hours: 8000,
      location_label: 'Room 102',
      repair_history: [
        { issue_type: 'cartridge_leak', date: '2024-04-01', resolved_by: 'Carlos Mendez' },
        { issue_type: 'cartridge_leak', date: '2024-09-12', resolved_by: 'Carlos Mendez' },
      ],
    },
    {
      id: 4,
      asset_type: 'plumbing',
      room_id: roomMap['208'],
      run_hours: 5000,
      location_label: 'Room 208',
      repair_history: [{ issue_type: 'pipe_corrosion', date: '2024-11-05', resolved_by: 'Carlos Mendez' }],
    },
    {
      id: 5,
      asset_type: 'electrical',
      room_id: roomMap['301'],
      run_hours: 12000,
      location_label: 'Room 301',
      repair_history: [{ issue_type: 'breaker_trip', date: '2025-01-20', resolved_by: 'Priya Sharma' }],
    },
  ];

  // 4. Parts Inventory
  const parts = [
    { id: 1, part_name: 'HVAC Dual Run Capacitor 45/5 uF', part_number: 'CAP-45-5', asset_type: 'hvac', stock_count: 8, unit_cost: 22.5 },
    { id: 2, part_name: 'Brass Compression Coupling 1/2"', part_number: 'PLM-CC-50', asset_type: 'plumbing', stock_count: 14, unit_cost: 8.75 },
    { id: 3, part_name: 'Moen Shower Cartridge 1222', part_number: 'PLM-MC-1222', asset_type: 'plumbing', stock_count: 5, unit_cost: 34.0 },
    { id: 4, part_name: 'GFCI Receptacle 20A Ivory', part_number: 'ELE-GFCI-20', asset_type: 'electrical', stock_count: 12, unit_cost: 16.25 },
    { id: 5, part_name: 'MERV 13 Air Filter 20x25x4', part_number: 'FLT-M13-2025', asset_type: 'hvac', stock_count: 24, unit_cost: 18.0 },
  ];

  // 5. Housekeeping Tasks
  const housekeepingTasks = [
    { id: 1, room_id: roomMap['101'], status: 'dirty', priority_rank: 1, eta_minutes: 35, assigned_attendant: 'Maria Santos', blocked: 'false' },
    { id: 2, room_id: roomMap['102'], status: 'cleaning', priority_rank: 2, eta_minutes: 20, assigned_attendant: 'Juan Reyes', blocked: 'false' },
    { id: 3, room_id: roomMap['204'], status: 'dirty', priority_rank: 3, eta_minutes: 45, assigned_attendant: 'Maria Santos', blocked: 'false' },
    { id: 4, room_id: roomMap['208'], status: 'dirty', priority_rank: 4, eta_minutes: 50, assigned_attendant: 'Amina Al-Mansoor', blocked: 'false' },
    { id: 5, room_id: roomMap['301'], status: 'dirty', priority_rank: 5, eta_minutes: 60, assigned_attendant: 'Juan Reyes', blocked: 'false' },
  ];

  // 6. Checked-in initial guests
  const guests = [
    {
      id: 1,
      name: 'Sarah Chen',
      reservation_id: 'RES-8821',
      room_id: roomMap['103'],
      persona_label: 'Business',
      value_tier: 'Premium',
      sentiment_state: 'Neutral',
      checkin_date: new Date(Date.now() - 4 * 3600000).toISOString(),
      checkout_date: new Date(Date.now() + 48 * 3600000).toISOString(),
      wallet_spend_to_date: 350.0,
    },
    {
      id: 2,
      name: 'Alexander Wright',
      reservation_id: 'RES-9934',
      room_id: roomMap['302'],
      persona_label: 'Luxury',
      value_tier: 'VIP',
      sentiment_state: 'Positive',
      checkin_date: new Date(Date.now() - 8 * 3600000).toISOString(),
      checkout_date: new Date(Date.now() + 72 * 3600000).toISOString(),
      wallet_spend_to_date: 1450.0,
    },
    {
      id: 3,
      name: 'David & Emily Miller',
      reservation_id: 'RES-6612',
      room_id: roomMap['201'],
      persona_label: 'Family',
      value_tier: 'Standard',
      sentiment_state: 'Neutral',
      checkin_date: new Date(Date.now() - 2 * 3600000).toISOString(),
      checkout_date: new Date(Date.now() + 24 * 3600000).toISOString(),
      wallet_spend_to_date: 120.0,
    },
  ];

  // Mark occupied rooms
  guests.forEach((g) => {
    const room = rooms.find((r) => r.id === g.room_id);
    if (room) room.status = 'occupied';
  });

  return {
    rooms,
    technicians,
    assets,
    parts,
    housekeepingTasks,
    guests,
    workOrders: [],
    offers: [],
    rateChangeLogs: [],
    meterReadings: [],
    activeAnomalies: [],
    totalActiveCostIncidents: 0.0,
    nextId: {
      room: idCounter,
      guest: 10,
      workOrder: 1,
      offer: 1,
      rateChangeLog: 1,
      housekeeping: 10,
      meter: 1,
    },
  };
}

let state = generateSeedData();

function resetState() {
  state = generateSeedData();
  return state;
}

module.exports = {
  state,
  resetState,
  generateSeedData,
};
