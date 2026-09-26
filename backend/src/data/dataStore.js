const fs = require('fs');
const path = require('path');

// Locate demo-data.json
const demoDataPath = path.resolve(__dirname, '../../../phase-1/demo-data.json');

// In-memory data store initialized from demo-data.json
let store = {
  resort: {},
  rooms: [],
  guests: [],
  staff: [],
  incidents: [],
  tasks: [],
};

function loadInitialData() {
  try {
    if (fs.existsSync(demoDataPath)) {
      const raw = fs.readFileSync(demoDataPath, 'utf8');
      const parsed = JSON.parse(raw);
      store = {
        resort: parsed.resort || {},
        rooms: parsed.rooms ? JSON.parse(JSON.stringify(parsed.rooms)) : [],
        guests: parsed.guests ? JSON.parse(JSON.stringify(parsed.guests)) : [],
        staff: parsed.staff ? JSON.parse(JSON.stringify(parsed.staff)) : [],
        incidents: parsed.incidents ? JSON.parse(JSON.stringify(parsed.incidents)) : [],
        tasks: parsed.tasks ? JSON.parse(JSON.stringify(parsed.tasks)) : [],
      };
      console.log(`[DataStore] Loaded ${store.rooms.length} rooms, ${store.guests.length} guests, ${store.staff.length} staff, ${store.incidents.length} incidents, ${store.tasks.length} tasks.`);
    } else {
      console.warn(`[DataStore] Warning: demo-data.json not found at ${demoDataPath}`);
    }
  } catch (error) {
    console.error(`[DataStore] Error reading demo-data.json:`, error.message);
  }
}

// Initial load
loadInitialData();

const dataStore = {
  getStore: () => store,
  resetStore: () => loadInitialData(),

  // Generic helpers
  findAll: (collection) => store[collection] || [],
  findById: (collection, id) => (store[collection] || []).find((item) => item.id === id),
  create: (collection, item) => {
    store[collection].push(item);
    return item;
  },
  update: (collection, id, updates) => {
    const index = (store[collection] || []).findIndex((item) => item.id === id);
    if (index === -1) return null;
    store[collection][index] = { ...store[collection][index], ...updates };
    return store[collection][index];
  },
  delete: (collection, id) => {
    const index = (store[collection] || []).findIndex((item) => item.id === id);
    if (index === -1) return false;
    store[collection].splice(index, 1);
    return true;
  },
};

module.exports = dataStore;
