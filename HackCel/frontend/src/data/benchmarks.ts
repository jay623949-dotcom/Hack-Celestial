/**
 * Smart Resort 360 Benchmark Datasets & Demo Scenarios
 * Grounded in resort operational realities: Front Desk, CV Triage, Telemetry, Yield.
 */

import { GuestRecord, HousekeepingTask, WorkOrderRecord } from '../types/schemas';

export interface IntakeScenario {
  id: string;
  title: string;
  guest_id: string;
  guest_name: string;
  reservation_context: {
    room_tier: string;
    membership_tier: 'None' | 'Silver' | 'Gold' | 'Diamond' | 'Titanium';
    stay_purpose: string;
    checked_in: boolean;
  };
  audio_duration_seconds: number;
  transcript: string;
  notes: string;
}

export const INTAKE_BENCHMARKS: IntakeScenario[] = [
  {
    id: 'intake-keynote',
    title: 'Exhausted Keynote Speaker (Travel Disruption)',
    guest_id: 'G-7041',
    guest_name: 'Dr. Evelyn Vance',
    reservation_context: {
      room_tier: 'Executive Bayfront Suite',
      membership_tier: 'Diamond',
      stay_purpose: 'Keynote Speaker at AI Global Summit 9am tomorrow',
      checked_in: true,
    },
    audio_duration_seconds: 14,
    transcript:
      "Hi, my flight was delayed five hours and my luggage is still stuck at SFO. I have a critical keynote presentation at 9:00 AM sharp tomorrow. I urgently need a whisper-quiet room on a high floor away from the elevators, blazing fast Wi-Fi, and could someone please arrange early morning coffee service by 6:30 AM? Also, could you check if my company billed the master folio?",
    notes: 'Multi-intent transcript with travel stress indicators. Should trigger Business persona, VIP At-Risk, service recovery panel perk, noise_tolerance=quiet, and discrete sub-requests.',
  },
  {
    id: 'intake-loyalist',
    title: 'Honeymoon Loyalist (High Value & Celebration)',
    guest_id: 'G-9920',
    guest_name: 'Marcus & Chloe Sterling',
    reservation_context: {
      room_tier: 'Penthouse Oceanview Villa',
      membership_tier: 'Titanium',
      stay_purpose: '10th Wedding Anniversary & Repeat Stay',
      checked_in: true,
    },
    audio_duration_seconds: 18,
    transcript:
      "Good afternoon! We're back for our tenth stay with you all. It's our wedding anniversary today! We booked the oceanview suite as usual, but if there's any complimentary upgrade available or chilled champagne you could send up, we would truly love that. Oh, and could we schedule two 4:00 PM sunset spa appointments?",
    notes: 'Loyalist + Luxury language, Titanium membership. Stated anniversary context. Should yield Loyalist/Luxury, VIP Positive, explicit requests separated.',
  },
  {
    id: 'intake-frugal-family',
    title: 'Frugal Multi-Child Family (Price & Value Driven)',
    guest_id: 'G-3318',
    guest_name: 'David Miller & Family',
    reservation_context: {
      room_tier: 'Double Queen Garden Room',
      membership_tier: 'None',
      stay_purpose: 'Family Vacation with 3 Toddlers',
      checked_in: true,
    },
    audio_duration_seconds: 16,
    transcript:
      "Hello! We booked the standard double queen through Expedia. Does our room rate include the breakfast buffet for all five of us, or do you have family discount coupon vouchers? Also we need two pack-and-play cribs brought up, and is there any fee for late 2:00 PM checkout on Sunday? We don't want any unexpected resort charges.",
    notes: 'Strong price-sensitive language (discounts, coupons, surprise charges) + family context. Should yield Frugal persona (or Family), Standard Neutral/Positive.',
  },
  {
    id: 'intake-influencer',
    title: 'Travel Content Creator (Aesthetic & Exposure Demands)',
    guest_id: 'G-5104',
    guest_name: 'Aria Thorne',
    reservation_context: {
      room_tier: 'Deluxe Terrace King',
      membership_tier: 'Silver',
      stay_purpose: 'Resort Architectural Review & Travel Vlogging (250k followers)',
      checked_in: true,
    },
    audio_duration_seconds: 15,
    transcript:
      "Hey there! I'm Aria Thorne, I do luxury hospitality content for about 250,000 subscribers. I specifically requested a corner room with unobstructed golden-hour sunlight for our sunset reel shoot. I also need an extra lighting ring stand if concierge has one, and where is the best spot on the property for rooftop drone clearance?",
    notes: 'Explicit social reach / content creation mention with high specificity. Should trigger Influencer persona, Standard Neutral.',
  },
  {
    id: 'intake-quiet',
    title: 'Minimalist Late Arrival (Zero Distinguishing Signal)',
    guest_id: 'G-1029',
    guest_name: 'Sarah Chen',
    reservation_context: {
      room_tier: 'Standard King',
      membership_tier: 'None',
      stay_purpose: 'Overnight transit',
      checked_in: true,
    },
    audio_duration_seconds: 6,
    transcript:
      "Hello, checking in under Sarah Chen. Just need the room key please.",
    notes: 'True minimalist intake with no sentiment or preference signals. Guardrail check: Should assign Quiet persona, Standard Neutral, null preferences.',
  },
];

export interface CvScenario {
  id: string;
  title: string;
  room_id: string;
  fixture_name: string;
  image_type: 'svg-diagram' | 'photo-url';
  image_data_description: string;
  svg_icon: string;
  simulated_confidence: number;
  expected_severity: 'safety' | 'guest-facing' | 'cosmetic' | 'deferred';
  notes: string;
}

export const CV_BENCHMARKS: CvScenario[] = [
  {
    id: 'cv-hvac-leak',
    title: 'HVAC Air Handler Condensate Line Rupture with Live Conduit Proximity',
    room_id: 'Suite 412',
    fixture_name: 'Ceiling HVAC Grille & Junction Box',
    image_type: 'svg-diagram',
    image_data_description: 'Severe water stream leaking from split PVC condensate drain line dripping directly onto 220V conduit splice plate.',
    svg_icon: 'hvac-hazard',
    simulated_confidence: 0.94,
    expected_severity: 'safety',
    notes: 'Safety hazard. Enforces non-negotiable room lockout (fault_free: false) and emergency work order dispatch.',
  },
  {
    id: 'cv-blurry-fixture',
    title: 'Degraded / Low-Light Blurry Plumbing Fitting (Guardrail Test)',
    room_id: 'Room 205',
    fixture_name: 'Under-sink angle stop valve',
    image_type: 'svg-diagram',
    image_data_description: 'Extremely blurry 0.3MP night camera image with motion smear showing indistinct pipe contour.',
    svg_icon: 'blur-hazard',
    simulated_confidence: 0.44, // < 0.6 GUARDRAIL TRIGGER
    expected_severity: 'guest-facing',
    notes: 'Confidence score 0.44 < 0.6. Guardrail MUST trigger: requires_human_review: true, generic escalation payload, no fabricated part.',
  },
  {
    id: 'cv-faucet-corrosion',
    title: 'Hansgrohe Basin Mixer Base Ring Stress Fracture & Minor Seep',
    room_id: 'Villa 14',
    fixture_name: 'Bathroom Faucet Mixer',
    image_type: 'svg-diagram',
    image_data_description: 'Visible hairline crack along polished chrome escutcheon collar with mineral crusting and 2 drops/min seepage.',
    svg_icon: 'faucet-leak',
    simulated_confidence: 0.89,
    expected_severity: 'guest-facing',
    notes: 'Guest-facing fixture issue. Confident identification, work order created with cartridge replacement.',
  },
  {
    id: 'cv-balcony-lock',
    title: 'Oceanfront Balcony Sliding Door Primary Latch Sheared Pin',
    room_id: 'Room 608',
    fixture_name: 'Balcony Heavy Glass Door Locking Mechanism',
    image_type: 'svg-diagram',
    image_data_description: 'Broken mortise hook bolt pin preventing sliding glass door from locking against 50kt wind gusts on 6th floor.',
    svg_icon: 'lock-hazard',
    simulated_confidence: 0.92,
    expected_severity: 'safety',
    notes: 'Safety issue on upper floor balcony. Must trigger lockout and emergency maintenance.',
  },
];

export interface TelemetryScenario {
  id: string;
  source_work_order_id: string;
  room_id: string;
  occupancy_status: 'Occupied' | 'Unoccupied (Vacant Clean)';
  meter_type: 'Water Flow (GPM)' | 'Power Surge (kW)' | 'HVAC Thermal Delta';
  current_reading: string;
  normal_baseline: string;
  duration_minutes: number;
  anomaly_description: string;
  estimated_cost_impact: number;
  affects_room_ids: string[];
}

export const TELEMETRY_BENCHMARKS: TelemetryScenario[] = [
  {
    id: 'telemetry-water-unoccupied',
    source_work_order_id: 'WO-8842',
    room_id: 'Suite 502',
    occupancy_status: 'Unoccupied (Vacant Clean)',
    meter_type: 'Water Flow (GPM)',
    current_reading: '16.8 GPM continuous flow',
    normal_baseline: '0.00 GPM',
    duration_minutes: 42,
    anomaly_description: 'Catastrophic mainline burst in unoccupied penthouse bathroom. Subflooring saturation in 502, water permeating ceiling cavity of Suite 402 directly below.',
    estimated_cost_impact: 1850.0,
    affects_room_ids: ['Suite 502', 'Suite 402'],
  },
  {
    id: 'telemetry-hvac-thermal',
    source_work_order_id: 'WO-8910',
    room_id: 'Villa 08',
    occupancy_status: 'Occupied',
    meter_type: 'Power Surge (kW)',
    current_reading: '34.2 kW spike (compressor locked rotor)',
    normal_baseline: '4.5 kW',
    duration_minutes: 18,
    anomaly_description: 'Heat exchanger thermal overrun with high-current surge in outdoor condenser unit. Imminent compressor seizure.',
    estimated_cost_impact: 620.0,
    affects_room_ids: ['Villa 08'],
  },
];

export interface PerishableAssetScenario {
  id: string;
  asset: string;
  original_price: number;
  discounted_price: number;
  expires_in_minutes: number;
  capacity_remaining: number;
  description: string;
}

export const FLASH_SALE_ASSETS: PerishableAssetScenario[] = [
  {
    id: 'asset-spa-2pm',
    asset: 'Spa slot 2:00 PM - 90-min Deep Ocean Hot Stone Treatment',
    original_price: 320,
    discounted_price: 195,
    expires_in_minutes: 35,
    capacity_remaining: 1,
    description: 'Master therapist cancellation opening in our oceanfront hydrothermal suite.',
  },
  {
    id: 'asset-catamaran',
    asset: 'Sunset Catamaran 5:30 PM Private Snorkel & Champagne Cruise',
    original_price: 450,
    discounted_price: 280,
    expires_in_minutes: 75,
    capacity_remaining: 2,
    description: 'Exclusive 42-foot catamaran with open bar sailing past emerald cliffs at twilight.',
  },
  {
    id: 'asset-cabana',
    asset: 'Cabana 4 Oceanfront Reserve with Chilled Rosé & Fruit Platter',
    original_price: 260,
    discounted_price: 150,
    expires_in_minutes: 45,
    capacity_remaining: 1,
    description: 'Direct infinity pool frontage with dedicated butler and afternoon shade.',
  },
];

// Initial Resort Agents State
export const INITIAL_GUESTS: GuestRecord[] = [
  {
    id: 'G-7041',
    name: 'Dr. Evelyn Vance',
    roomNumber: 'Suite 304',
    vipTier: 'VIP',
    persona: 'Business',
    sentiment: 'At-Risk',
    sentimentColor: 'red',
    checkInStatus: 'Checked-In',
    arrivalEta: 'Checked in 15m ago',
    preferences: ['Quiet floor', 'Wi-Fi 500+ Mbps', '06:30 Coffee'],
    serviceRecoveryTriggered: true,
    recoveryPerk: 'Complimentary high-speed satellite uplink pass & $50 breakfast credit',
    spendProfile: 'Corporate Master Account ($1,400/night)',
  },
  {
    id: 'G-9920',
    name: 'Marcus Sterling',
    roomNumber: 'Villa 10',
    vipTier: 'VIP',
    persona: 'Loyalist',
    sentiment: 'Positive',
    sentimentColor: 'green',
    checkInStatus: 'Checked-In',
    arrivalEta: 'Checked in 2h ago',
    preferences: ['Ocean view', 'Champagne welcome', 'Spa package'],
    serviceRecoveryTriggered: false,
    spendProfile: 'Titanium Club Member ($18.5k LTV)',
  },
  {
    id: 'G-3318',
    name: 'David Miller',
    roomNumber: 'Room 214',
    vipTier: 'Standard',
    persona: 'Family',
    sentiment: 'Neutral',
    sentimentColor: 'yellow',
    checkInStatus: 'Checked-In',
    arrivalEta: 'Checked in 1h ago',
    preferences: ['2x Pack & Play cribs', 'Late checkout request'],
    serviceRecoveryTriggered: false,
    spendProfile: 'Standard Leisure ($320/night)',
  },
  {
    id: 'G-5104',
    name: 'Aria Thorne',
    roomNumber: 'Room 418',
    vipTier: 'Standard',
    persona: 'Influencer',
    sentiment: 'Neutral',
    sentimentColor: 'yellow',
    checkInStatus: 'Checked-In',
    arrivalEta: 'Checked in 30m ago',
    preferences: ['Golden hour terrace', 'Ring light support'],
    serviceRecoveryTriggered: false,
    spendProfile: 'Media Rate ($420/night)',
  },
  {
    id: 'G-1029',
    name: 'Sarah Chen',
    roomNumber: 'Room 108',
    vipTier: 'Standard',
    persona: 'Quiet',
    sentiment: 'Neutral',
    sentimentColor: 'yellow',
    checkInStatus: 'Checked-In',
    arrivalEta: 'Checked in 45m ago',
    preferences: [],
    serviceRecoveryTriggered: false,
    spendProfile: 'Transit Overnight ($240/night)',
  },
  {
    id: 'G-8802',
    name: 'Ambassador Jean-Luc Moreau',
    vipTier: 'VIP',
    persona: 'Luxury',
    sentiment: 'Positive',
    sentimentColor: 'green',
    checkInStatus: 'Arriving',
    arrivalEta: 'ETA 11:15 AM (Incoming VIP)',
    preferences: ['Executive suite', 'Express check-in', 'Private luggage transfer'],
    serviceRecoveryTriggered: false,
    spendProfile: 'Diplomatic Suite ($2,100/night)',
  },
];

export const INITIAL_WORK_ORDERS: WorkOrderRecord[] = [
  {
    id: 'WO-8842',
    room_id: 'Suite 502',
    asset_type: 'Main Water Line Fitting',
    visible_issue: 'Catastrophic supply line separation in ceiling cavity',
    required_part: '1-inch CPVC union coupling & shutoff ball valve',
    priority: 'Emergency',
    severity: 'safety',
    status: 'Dispatched',
    confidence_score: 0.96,
    requires_human_review: false,
    estimated_cost: 1850.0,
    timestamp: '10:42 AM',
  },
  {
    id: 'WO-8721',
    room_id: 'Suite 412',
    asset_type: 'HVAC Air Handler Grille',
    visible_issue: 'Condensate drip near conduit junction',
    required_part: 'Drain line trap assembly & wire insulation sleeve',
    priority: 'High',
    severity: 'safety',
    status: 'In Progress',
    confidence_score: 0.94,
    requires_human_review: false,
    estimated_cost: 380.0,
    timestamp: '09:15 AM',
  },
  {
    id: 'WO-8650',
    room_id: 'Room 205',
    asset_type: 'Angle Stop Valve',
    visible_issue: 'Unclear fixture seepage (low optical clarity)',
    required_part: null,
    priority: 'Standard',
    severity: 'guest-facing',
    status: 'Open',
    confidence_score: 0.44,
    requires_human_review: true,
    estimated_cost: 120.0,
    timestamp: '08:50 AM',
  },
];

export const INITIAL_HOUSEKEEPING_TASKS: HousekeepingTask[] = [
  {
    room_id: 'Suite 304',
    priority_rank: 1,
    status: 'Priority-Expedite',
    eta_minutes: 20,
    assignedStaff: 'Elena Ramos (Lead)',
    reason: 'VIP Keynote speaker arrival - noise buffer verification & coffee station prep',
    fault_free: false,
  },
  {
    room_id: 'Penthouse 601',
    priority_rank: 2,
    status: 'In-Progress',
    eta_minutes: 40,
    assignedStaff: 'Carlos Ortiz',
    reason: 'Turnover clean for arriving VIP Ambassador',
    fault_free: false,
  },
  {
    room_id: 'Suite 502',
    priority_rank: 3,
    status: 'Locked-Out',
    eta_minutes: 0,
    assignedStaff: 'Unassigned (Maintenance Lockout)',
    reason: 'Water main rupture active dry-out. Safety lockout active.',
    fault_free: false,
  },
  {
    room_id: 'Room 214',
    priority_rank: 4,
    status: 'Cleaned',
    eta_minutes: 0,
    assignedStaff: 'Maria Santos',
    reason: 'Crib delivery and sanitization completed',
    fault_free: true,
  },
  {
    room_id: 'Villa 10',
    priority_rank: 5,
    status: 'Cleaned',
    eta_minutes: 0,
    assignedStaff: 'Kenji Sato',
    reason: 'Anniversary rose petal turndown & champagne bucket staged',
    fault_free: true,
  },
];
