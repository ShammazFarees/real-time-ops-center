import axios from 'axios';

const BACKEND_INGEST_URL = process.env.BACKEND_URL || 'http://localhost:5000/api/incidents/ingest';

const sampleTitles = [
  'Commercial Building Fire - Jinnah Avenue Islamabad',
  'Multi-Vehicle Collision on Islamabad Expressway',
  'Cardiac Emergency at F-6 Markaz Market',
  'Armed Robbery Security Alert - Blue Area Islamabad',
  'Nullah Lai Urban Flood Warning - Rawalpindi',
  'Industrial Chemical Leak - I-9 Sector Islamabad',
  'Feeder Transformer Detonation - Saddar Rawalpindi',
  'Highway Traffic Entrapment - GT Road Interchange'
];

const samplePayloads = [
  'CRITICAL: Heavy smoke emitting from 3rd floor commercial plaza on Jinnah Avenue. Rescue 1122 fire tender dispatched. Sprinkler failure reported.',
  'URGENT: High-speed 3-car collision on Expressway near Faizabad interchange. 2 passengers trapped. Rescue 1122 medical team required.',
  'MEDICAL ALERT: Elderly male collapsed unconscious at F-6 Markaz plaza. Edhi Ambulance dispatched. Pre-hospital CPR in progress.',
  'SECURITY ALERT: Silent panic alarm triggered at bank branch in Blue Area. Armed suspects fled on motorcycle toward Khyaban-e-Iqbal.',
  'NATURAL HAZARD: Rapid water level rise at Nullah Lai Katarian bridge reaching 18ft danger mark. District Emergency Officer issuing alert.',
  'HAZMAT ALERT: Chemical storage drum punctured during loading in I-9/3 Industrial Area. Toxic fumes spreading across factory compound.',
  'INFRASTRUCTURE: 132kV grid transformer explosion in Saddar Bazar. Severe local power blackout. IESCO and Rescue 1122 on standby.',
  'TRAFFIC CRITICAL: Delivery truck overturned on GT Road Rawalpindi blocking 2 lanes. Traffic Police requesting heavy recovery crane.'
];

// Base GPS center point (Islamabad / Rawalpindi Metropolitan Area, Pakistan)
const BASE_LAT = 33.6844;
const BASE_LNG = 73.0479;

function getRandomCoordinates(): [number, number] {
  const latOffset = (Math.random() - 0.5) * 0.08;
  const lngOffset = (Math.random() - 0.5) * 0.08;
  return [Number((BASE_LNG + lngOffset).toFixed(4)), Number((BASE_LAT + latOffset).toFixed(4))];
}

async function emitTelemetryEvent() {
  const index = Math.floor(Math.random() * sampleTitles.length);
  const title = sampleTitles[index];
  const rawPayload = samplePayloads[index];
  const coordinates = getRandomCoordinates();

  try {
    console.log(`[SIMULATOR PAKISTAN] Emitting event: "${title}" at coordinates [${coordinates[1]}, ${coordinates[0]}]...`);
    const res = await axios.post(BACKEND_INGEST_URL, {
      title,
      rawPayload,
      coordinates
    });
    console.log(`[SIMULATOR RESPONSE] Accepted by Queue. Incident ID: ${res.data.incidentId}`);
  } catch (error: any) {
    console.warn(`[SIMULATOR WARNING] Failed to post to backend at ${BACKEND_INGEST_URL}: ${error.message}`);
  }
}

console.log('====================================================');
console.log('  PAKISTAN TACTICAL OPS CENTER - TELEMETRY STREAMER');
console.log('  Target Endpoint:', BACKEND_INGEST_URL);
console.log('  Region: Islamabad / Rawalpindi Metropolitan Area');
console.log('  Stream Interval: Every 4 seconds');
console.log('====================================================');

// Initial emission
emitTelemetryEvent();

// Recurring stream every 4 seconds
setInterval(() => {
  emitTelemetryEvent();
}, 4000);
