const fs = require('fs');
const path = require('path');
const { pool } = require('../../src/config/db');

async function seedDatabase() {
  if (!pool) {
    console.error('❌ Error: DATABASE_URL is not configured. Set DATABASE_URL in .env before running seeds.');
    process.exit(1);
  }

  const demoDataPath = path.resolve(__dirname, '../../../phase-1/demo-data.json');
  if (!fs.existsSync(demoDataPath)) {
    console.error(`❌ Error: demo-data.json not found at ${demoDataPath}`);
    process.exit(1);
  }

  const demoData = JSON.parse(fs.readFileSync(demoDataPath, 'utf8'));
  const client = await pool.connect();

  try {
    console.log('[Seed] Starting database seed transaction...');
    await client.query('BEGIN');

    // Clean existing tables to guarantee consistent idempotent re-seeding
    await client.query(`
      DELETE FROM tasks;
      DELETE FROM incidents;
      UPDATE rooms SET guest_id = NULL;
      DELETE FROM guests;
      DELETE FROM staff;
      DELETE FROM rooms;
      DELETE FROM resorts;
    `);


    // 1. Seed Resort
    const resort = demoData.resort || {
      id: 'resort-001',
      name: 'The Grand Azure Bay Resort & Villas',
      total_rooms: 20,
    };
    await client.query(
      `INSERT INTO resorts (id, name, location, timezone, total_rooms)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         location = EXCLUDED.location,
         total_rooms = EXCLUDED.total_rooms,
         updated_at = CURRENT_TIMESTAMP`,
      [resort.id, resort.name, 'Azure Bay, Goa, India', 'Asia/Kolkata', resort.total_rooms || 20]
    );

    // 2. Seed Rooms
    for (const room of demoData.rooms || []) {
      await client.query(
        `INSERT INTO rooms (id, resort_id, number, floor, type, status, features, last_cleaned)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE SET
           number = EXCLUDED.number,
           floor = EXCLUDED.floor,
           type = EXCLUDED.type,
           status = EXCLUDED.status,
           features = EXCLUDED.features,
           last_cleaned = EXCLUDED.last_cleaned,
           updated_at = CURRENT_TIMESTAMP`,
        [
          room.id,
          resort.id,
          room.number,
          room.floor || 1,
          room.type,
          room.status || 'available',
          JSON.stringify(room.features || []),
          room.last_cleaned ? new Date(room.last_cleaned) : null,
        ]
      );
    }

    // 3. Seed Guests
    for (const guest of demoData.guests || []) {
      await client.query(
        `INSERT INTO guests (id, resort_id, name, vip, vip_tier, room_id, check_in, check_out, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           vip = EXCLUDED.vip,
           vip_tier = EXCLUDED.vip_tier,
           room_id = EXCLUDED.room_id,
           check_in = EXCLUDED.check_in,
           check_out = EXCLUDED.check_out,
           notes = EXCLUDED.notes,
           updated_at = CURRENT_TIMESTAMP`,
        [
          guest.id,
          resort.id,
          guest.name,
          Boolean(guest.vip),
          guest.vip_tier || 'Standard',
          guest.room_id || null,
          guest.check_in ? new Date(guest.check_in) : null,
          guest.check_out ? new Date(guest.check_out) : null,
          guest.notes || '',
        ]
      );

      // Link room.guest_id
      if (guest.room_id) {
        await client.query(`UPDATE rooms SET guest_id = $1 WHERE id = $2`, [guest.id, guest.room_id]);
      }
    }

    // 4. Seed Staff
    for (const member of demoData.staff || []) {
      await client.query(
        `INSERT INTO staff (id, resort_id, name, department, role, status, current_task)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           department = EXCLUDED.department,
           role = EXCLUDED.role,
           status = EXCLUDED.status,
           current_task = EXCLUDED.current_task,
           updated_at = CURRENT_TIMESTAMP`,
        [
          member.id,
          resort.id,
          member.name,
          member.department,
          member.role,
          member.status || 'on_duty',
          member.current_task || 'Standby',
        ]
      );
    }

    // 5. Seed Incidents
    for (const incident of demoData.incidents || []) {
      await client.query(
        `INSERT INTO incidents (id, resort_id, title, description, severity, status, department, room_id, guest_id, reported_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           description = EXCLUDED.description,
           severity = EXCLUDED.severity,
           status = EXCLUDED.status,
           department = EXCLUDED.department,
           room_id = EXCLUDED.room_id,
           guest_id = EXCLUDED.guest_id,
           reported_at = EXCLUDED.reported_at,
           updated_at = CURRENT_TIMESTAMP`,
        [
          incident.id,
          resort.id,
          incident.title,
          incident.description || '',
          incident.severity || 'medium',
          incident.status || 'open',
          incident.department || 'general',
          incident.room_id || null,
          incident.guest_id || null,
          incident.reported_at ? new Date(incident.reported_at) : new Date(),
        ]
      );
    }

    // 6. Seed Tasks
    for (const task of demoData.tasks || []) {
      await client.query(
        `INSERT INTO tasks (id, resort_id, title, description, department, assigned_to, room_id, incident_id, priority, status, due_time)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           description = EXCLUDED.description,
           department = EXCLUDED.department,
           assigned_to = EXCLUDED.assigned_to,
           room_id = EXCLUDED.room_id,
           incident_id = EXCLUDED.incident_id,
           priority = EXCLUDED.priority,
           status = EXCLUDED.status,
           due_time = EXCLUDED.due_time,
           updated_at = CURRENT_TIMESTAMP`,
        [
          task.id,
          resort.id,
          task.title,
          task.description || '',
          task.department || 'general',
          task.assigned_to || null,
          task.room_id || null,
          task.incident_id || null,
          task.priority || 'medium',
          task.status || 'pending',
          task.due_time || '12:00 PM',
        ]
      );
    }

    await client.query('COMMIT');
    console.log(`✅ [Seed] Successfully seeded PostgreSQL with ${demoData.rooms.length} rooms, ${demoData.guests.length} guests, ${demoData.staff.length} staff, ${demoData.incidents.length} incidents, and ${demoData.tasks.length} tasks.`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ [Seed] Database seeding failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seedDatabase();
