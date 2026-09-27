'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CloudRain,
  Sun,
  BookOpen,
  TrendingDown,
  TrendingUp,
  Info,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  X,
  Flame,
  ShieldAlert,
  DollarSign,
  Layers,
  Filter,
  Users,
  BedDouble,
  Wrench,
  Clock,
} from 'lucide-react';
import { getCalendarMonth, getAnnualSeasonality } from '../../lib/api';

// Comprehensive Indian Tourism Seasonality Knowledge Base
// Models vacation periods, school cycles, board exam windows, and festival calendar
export const INDIAN_MONTH_DATA = [
  {
    month: 0,
    name: 'January',
    seasonType: 'on-season',
    isOffSeason: false,
    label: 'Peak Winter & Festivals',
    trafficLevel: 'high',
    trafficTag: 'High Leisure Traffic',
    avgOccupancy: '82%',
    adrGuide: '₹11,500',
    weather: 'Pleasant & Cool (22°C - 30°C)',
    festivals: ['Makar Sankranti / Pongal (Jan 14)', 'Republic Day Weekend (Jan 26)'],
    reasonTitle: 'Winter Vacation Spillover & Republic Day Weekend',
    reasonDescription:
      'High tourist inflow to Goa & coastal resorts. Pleasant winter weather, domestic winter school breaks concluding, and Republic Day long weekend drive strong leisure bookings.',
    operationalStrategy:
      'Maintain premium ADR yield, mandate minimum 2-night stay for Republic Day weekend, enforce strict no-cancellation rules on suites.',
  },
  {
    month: 1,
    name: 'February',
    seasonType: 'off-season',
    isOffSeason: true,
    label: 'Off-Season: Board Exams & No Vacations',
    trafficLevel: 'low',
    trafficTag: 'Low Traffic (Exam Lull)',
    avgOccupancy: '38%',
    adrGuide: '₹5,200',
    weather: 'Warm & Dry (24°C - 32°C)',
    festivals: ['Maha Shivaratri (Single-day observance)'],
    reasonTitle: 'CBSE & ICSE Board Exams / Zero Vacation Breaks',
    reasonDescription:
      'Classic Indian Off-Season: Strictly no school or college vacations nationwide. CBSE, ICSE, and state boards conduct crucial annual board exams & pre-boards. Indian families avoid leisure travel, causing domestic occupancy to drop sharply.',
    operationalStrategy:
      'Launch off-season weekday corporate packages, offer -30% OTA flash deals, conduct preventive HVAC maintenance in unoccupied wings without guest disruption.',
  },
  {
    month: 2,
    name: 'March',
    seasonType: 'shoulder',
    isOffSeason: false,
    label: 'Shoulder: Fiscal Closing & Holi Surge',
    trafficLevel: 'moderate',
    trafficTag: 'Moderate / Holi Surge',
    avgOccupancy: '58%',
    adrGuide: '₹7,800',
    weather: 'Sunny & Pleasant (25°C - 33°C)',
    festivals: ['Holi Festival (Mar 25)', 'Maha Shivaratri (Mar 3)'],
    reasonTitle: 'School Exams Wrap-up & High-Demand Holi Weekend',
    reasonDescription:
      'Shoulder season. While corporate financial year-end and school final exams subdue early March travel, the 3-day Holi festival weekend triggers massive domestic leisure travel surges.',
    operationalStrategy:
      'Protect inventory for the Holi weekend at dynamic premium rates (+35%); offer mid-week corporate offsite incentives.',
  },
  {
    month: 3,
    name: 'April',
    seasonType: 'shoulder',
    isOffSeason: false,
    label: 'Shoulder: Early Summer Break',
    trafficLevel: 'moderate',
    trafficTag: 'Moderate Traffic',
    avgOccupancy: '66%',
    adrGuide: '₹8,400',
    weather: 'Warm & Sunny (26°C - 34°C)',
    festivals: ['Good Friday (Apr 3)', 'Ambedkar Jayanti (Apr 14)', 'Ram Navami (Apr 15)'],
    reasonTitle: 'Transition to Summer Break in Late April',
    reasonDescription:
      'Academic year transitions. School examinations conclude across states and early summer vacations kick off by mid-to-late April, initiating family vacation bookings.',
    operationalStrategy:
      'Prepare all family suites and villas for summer turnover; launch early-bird summer holiday packages.',
  },
  {
    month: 4,
    name: 'May',
    seasonType: 'on-season',
    isOffSeason: false,
    label: 'Peak Summer School Vacations',
    trafficLevel: 'high',
    trafficTag: 'Peak Family Season',
    avgOccupancy: '88%',
    adrGuide: '₹12,800',
    weather: 'Hot & Humid (28°C - 35°C)',
    festivals: ['Buddha Purnima (May 31)', 'Nationwide Summer Holidays'],
    reasonTitle: '100% Nationwide School & University Summer Holidays',
    reasonDescription:
      'Peak Domestic Vacation Period: All schools, colleges, and families across India are on annual summer vacation. Highest domestic family booking volume of the entire second quarter.',
    operationalStrategy:
      'Enforce full capacity staffing across Front Desk & Housekeeping; bundle water-sports, kid clubs, and premium dining packages to maximize RevPAR.',
  },
  {
    month: 5,
    name: 'June',
    seasonType: 'shoulder',
    isOffSeason: false,
    label: 'Shoulder: School Reopening & Monsoon Arrival',
    trafficLevel: 'moderate',
    trafficTag: 'Moderate / Tapering',
    avgOccupancy: '52%',
    adrGuide: '₹6,500',
    weather: 'Monsoon Arrives (Heavy Showers)',
    festivals: ['Eid al-Adha (Mid-June)'],
    reasonTitle: 'Summer Vacations Conclude / Academic Session Begins',
    reasonDescription:
      'Sharp transition: Summer vacation concludes in early June as schools and universities reopen nationwide. Southwest monsoon arrives on the western coast, transitioning into off-season.',
    operationalStrategy:
      'Transition marketing towards monsoon wellness packages, indoor spa retreats, and budget-conscious weekenders.',
  },
  {
    month: 6,
    name: 'July',
    seasonType: 'off-season',
    isOffSeason: true,
    label: 'Deep Off-Season: Peak Monsoon & School Term',
    trafficLevel: 'low',
    trafficTag: 'Deep Off-Season (Monsoon)',
    avgOccupancy: '32%',
    adrGuide: '₹4,600',
    weather: 'Heavy Torrential Monsoons (Rough Sea)',
    festivals: ['No major festival vacations'],
    reasonTitle: 'Southwest Monsoon Downpours / Zero Vacation Breaks',
    reasonDescription:
      'Deepest Off-Season in India: Zero school or corporate vacations. Continuous torrential rains, rough seas (beaches red-flagged for swimming/watersports), and schools in regular session cause domestic leisure demand to hit annual lows.',
    operationalStrategy:
      'Execute scheduled wing shutdowns for deep repairs (e.g. AC compressor overhauls); sell all-inclusive rainy getaway & Ayurvedic spa deals.',
  },
  {
    month: 7,
    name: 'August',
    seasonType: 'off-season',
    isOffSeason: true,
    label: 'Off-Season: Monsoon Lull (Except Aug 15)',
    trafficLevel: 'low',
    trafficTag: 'Low Traffic Baseline',
    avgOccupancy: '44%',
    adrGuide: '₹5,400',
    weather: 'Monsoon Showers & Overcast (25°C - 30°C)',
    festivals: ['Independence Day Long Weekend (Aug 15)', 'Raksha Bandhan (Aug 28)'],
    reasonTitle: 'Monsoon Lull Punctuated Only by Independence Day Weekend',
    reasonDescription:
      'Persistent Off-Season: Ongoing monsoon rains and full school attendance maintain a low baseline. However, Independence Day (Aug 15) and Raksha Bandhan provide brief 3-day domestic demand spikes.',
    operationalStrategy:
      'Yield up aggressively for the 3-day Independence Day weekend (+40%), while offering deep discounts on weekday inventory.',
  },
  {
    month: 8,
    name: 'September',
    seasonType: 'off-season',
    isOffSeason: true,
    label: 'Off-Season: Pitru Paksha & Pre-Festive Lull',
    trafficLevel: 'low',
    trafficTag: 'Low Traffic (Shradh Lull)',
    avgOccupancy: '40%',
    adrGuide: '₹5,100',
    weather: 'Monsoon Tapering (26°C - 31°C)',
    festivals: ['Janmashtami (Sep 4)', 'Ganesh Chaturthi (Sep 14)', 'Pitru Paksha Begins'],
    reasonTitle: 'Pre-Festive Lull, Shradh Period, School Mid-Terms',
    reasonDescription:
      'Cultural & Academic Off-Season: The 16-day lunar period of Pitru Paksha (Shradh) is observed, during which traditional Indian travelers avoid vacations, celebrations, and new bookings. Schools conduct mid-term exams.',
    operationalStrategy:
      'Target corporate conferences, MICE groups, and international digital nomads ahead of the October festive explosion.',
  },
  {
    month: 9,
    name: 'October',
    seasonType: 'on-season',
    isOffSeason: false,
    label: 'Peak Festive: Navratri, Durga Puja, Dussehra',
    trafficLevel: 'high',
    trafficTag: 'High Festive Traffic',
    avgOccupancy: '86%',
    adrGuide: '₹12,400',
    weather: 'Sunny & Clear Post-Monsoon (25°C - 32°C)',
    festivals: ['Gandhi Jayanti (Oct 2)', 'Durga Puja / Navratri', 'Dussehra (Oct 20)'],
    reasonTitle: 'Dussehra & Autumn School Vacation Rush',
    reasonDescription:
      'Festive Season Kickoff: Monsoons clear, beaches reopen, and nationwide school autumn vacations coincide with Navratri, Durga Puja, and Dussehra for heavy domestic holiday traffic.',
    operationalStrategy:
      'Reopen all wings at 100% capacity; discontinue low-tier OTA promotions; maximize beach-facing villa premiums.',
  },
  {
    month: 10,
    name: 'November',
    seasonType: 'on-season',
    isOffSeason: false,
    label: 'Super Peak: Diwali & Hindu Wedding Season',
    trafficLevel: 'surge',
    trafficTag: 'Super Peak (Diwali)',
    avgOccupancy: '93%',
    adrGuide: '₹15,000',
    weather: 'Pleasant & Mild (23°C - 31°C)',
    festivals: ['Diwali (Nov 8)', 'Govardhan Puja (Nov 9)', 'Bhai Dooj (Nov 10)', 'Guru Nanak Jayanti'],
    reasonTitle: 'Diwali Festive Holidays & Peak Wedding Muhurats',
    reasonDescription:
      'Super-Peak Travel: Diwali week holidays, extended school breaks, auspicious Hindu wedding dates, and flawless coastal weather produce near 100% occupancy across premium rooms.',
    operationalStrategy:
      'Implement strict minimum-stay restrictions (3 nights minimum over Diwali week), non-refundable deposits, and banquet upsells.',
  },
  {
    month: 11,
    name: 'December',
    seasonType: 'on-season',
    isOffSeason: false,
    label: 'Super Peak: Christmas & New Year Gala',
    trafficLevel: 'surge',
    trafficTag: 'Maximum Peak (Year-End)',
    avgOccupancy: '97%',
    adrGuide: '₹18,500',
    weather: 'Optimal Winter Breeze (20°C - 30°C)',
    festivals: ['Christmas Day (Dec 25)', 'New Year’s Eve Gala (Dec 31)'],
    reasonTitle: 'Christmas Week & New Year Celebrations',
    reasonDescription:
      'Highest ADR & Occupancy of the Year: Winter school & college breaks, international tourist influx, beach gala events, and festive parties ensure sold-out status weeks in advance.',
    operationalStrategy:
      'Mandatory New Year Gala Dinner supplements, 100% advance deposit collection, VIP airport transfer upsells.',
  },
];

export default function SeasonalCalendar({ onDaySelect = null }) {
  // Calendar View State: default to current date
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(6); // Default to July (Peak Off-Season) to immediately highlight requirement
  const [daysData, setDaysData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'off-season', 'on-season'
  const [selectedDay, setSelectedDay] = useState(null);

  // Month metadata
  const currentMonthMeta = useMemo(() => {
    return INDIAN_MONTH_DATA[currentMonth] || INDIAN_MONTH_DATA[0];
  }, [currentMonth]);

  // Load calendar days from API or resilient fallback
  useEffect(() => {
    let isCancelled = false;

    async function loadMonth() {
      try {
        setLoading(true);
        const data = await getCalendarMonth(currentYear, currentMonth);
        if (!isCancelled && Array.isArray(data) && data.length > 0) {
          setDaysData(data);
        } else if (!isCancelled) {
          // Generate fallback
          generateFallbackDays(currentYear, currentMonth);
        }
      } catch (err) {
        console.warn('[SeasonalCalendar] API fetch degraded, using local Indian seasonality knowledge base:', err.message);
        if (!isCancelled) {
          generateFallbackDays(currentYear, currentMonth);
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    loadMonth();

    return () => {
      isCancelled = true;
    };
  }, [currentYear, currentMonth]);

  // Fallback day generator matching Indian hospitality seasonality
  const generateFallbackDays = (year, month) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const meta = INDIAN_MONTH_DATA[month] || INDIAN_MONTH_DATA[0];
    const generated = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayDate = new Date(year, month, d);
      const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6;

      // Special single-day festival checks in 2026
      let event = null;
      let status = meta.seasonType;
      let demand = meta.trafficLevel;
      let isOffSeason = meta.isOffSeason;

      if (month === 0 && d === 14) { event = 'Makar Sankranti'; status = 'on-season'; demand = 'surge'; isOffSeason = false; }
      else if (month === 0 && d === 26) { event = 'Republic Day'; status = 'on-season'; demand = 'surge'; isOffSeason = false; }
      else if (month === 2 && d === 25) { event = 'Holi'; status = 'on-season'; demand = 'surge'; isOffSeason = false; }
      else if (month === 7 && d === 15) { event = 'Independence Day'; status = 'on-season'; demand = 'surge'; isOffSeason = false; }
      else if (month === 7 && d === 28) { event = 'Raksha Bandhan'; status = 'on-season'; demand = 'high'; isOffSeason = false; }
      else if (month === 8 && d === 4) { event = 'Janmashtami'; status = 'on-season'; demand = 'high'; isOffSeason = false; }
      else if (month === 9 && d === 20) { event = 'Dussehra'; status = 'on-season'; demand = 'surge'; isOffSeason = false; }
      else if (month === 10 && d === 8) { event = 'Diwali'; status = 'on-season'; demand = 'surge'; isOffSeason = false; }
      else if (month === 11 && d === 25) { event = 'Christmas'; status = 'on-season'; demand = 'surge'; isOffSeason = false; }
      else if (month === 11 && d === 31) { event = 'New Year’s Eve'; status = 'on-season'; demand = 'surge'; isOffSeason = false; }

      generated.push({
        date: dateStr,
        day: d,
        dayOfWeek: dayDate.getDay(),
        status: status,
        isOffSeason: isOffSeason,
        event: event,
        demand: demand,
        reason: event ? `Festive demand surge for ${event}` : (isOffSeason ? meta.reasonTitle : meta.reasonTitle),
        occupancyEstimate: isOffSeason ? (isWeekend ? '42%' : '32%') : (demand === 'surge' ? '96%' : '84%'),
        adrRecommendation: isOffSeason ? meta.adrGuide : (demand === 'surge' ? '₹14,500' : '₹9,800'),
        monthName: meta.name,
      });
    }

    setDaysData(generated);
  };

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDay(null);
  };

  // First day offset for calendar grid
  const firstDayOffset = useMemo(() => {
    return new Date(currentYear, currentMonth, 1).getDay();
  }, [currentYear, currentMonth]);

  // Count off-season months in annual calendar
  const offSeasonMonthsCount = useMemo(() => {
    return INDIAN_MONTH_DATA.filter((m) => m.isOffSeason).length;
  }, []);

  return (
    <div className="rounded-2xl border border-border bg-white shadow-soft overflow-hidden transition-all">
      {/* ─── 1. TOP HEADER & CONTEXT ─── */}
      <div className="p-4 sm:p-5 border-b border-border bg-surface-secondary/30 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-primary" />
              Indian Hospitality Intelligence
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-sky-50 text-sky-800 border border-sky-200 flex items-center gap-1">
              <TrendingDown className="w-3 h-3 text-sky-600" />
              {offSeasonMonthsCount} Off-Season Months in India
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-amber-600" />
              Festival &amp; Vacation Tracking
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-foreground mt-2 tracking-tight flex items-center gap-2">
            <span>India Tourism &amp; Seasonal Demand Calendar</span>
            <span className="text-xs font-mono font-normal text-muted-foreground">
              (Azure Bay Resort, Goa)
            </span>
          </h2>

          <p className="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            Visual demand signals calibrated against <strong>Indian school vacations</strong>,{' '}
            <strong>academic board examinations</strong>, and <strong>major cultural festivals</strong>.
            Off-season periods are colored to identify low-traffic months for promotional yield and maintenance windows.
          </p>
        </div>

        {/* Quick Month Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-center shrink-0">
          <button
            onClick={() => {
              setActiveFilter('all');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-border text-muted-foreground hover:text-foreground hover:bg-surface-secondary'
            }`}
          >
            All 12 Months
          </button>

          <button
            onClick={() => {
              setActiveFilter('off-season');
              // Jump to July or February if currently in peak
              if (!currentMonthMeta.isOffSeason) setCurrentMonth(6);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeFilter === 'off-season'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-sky-50 border border-sky-200 text-sky-700 hover:bg-sky-100'
            }`}
            title="Show Indian months with little traffic due to no vacation seasons and exams"
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>Off-Season Months (Low Traffic)</span>
          </button>

          <button
            onClick={() => {
              setActiveFilter('on-season');
              if (currentMonthMeta.isOffSeason) setCurrentMonth(10); // jump to Nov Diwali
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeFilter === 'on-season'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Peak Vacation &amp; Festivals</span>
          </button>
        </div>
      </div>

      {/* ─── 2. ANNUAL 12-MONTH RIBBON SELECTOR ─── */}
      <div className="px-4 py-3 bg-slate-50 border-b border-border overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          <span className="text-[11px] font-mono font-bold uppercase text-muted-foreground mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            Year {currentYear}:
          </span>

          {INDIAN_MONTH_DATA.map((m) => {
            const isSelected = currentMonth === m.month;
            const isOff = m.isOffSeason;
            const isDimmed =
              (activeFilter === 'off-season' && !isOff) ||
              (activeFilter === 'on-season' && isOff);

            let chipClasses = 'bg-white border-border text-foreground hover:border-slate-300';
            if (isOff) {
              chipClasses = isSelected
                ? 'bg-sky-700 border-sky-700 text-white ring-2 ring-sky-300 shadow-sm'
                : 'bg-sky-50/90 border-sky-200 text-sky-800 hover:bg-sky-100';
            } else if (m.seasonType === 'on-season') {
              chipClasses = isSelected
                ? 'bg-amber-600 border-amber-600 text-white ring-2 ring-amber-300 shadow-sm'
                : 'bg-amber-50/90 border-amber-200 text-amber-900 hover:bg-amber-100';
            } else {
              chipClasses = isSelected
                ? 'bg-teal-700 border-teal-700 text-white ring-2 ring-teal-300 shadow-sm'
                : 'bg-teal-50/90 border-teal-200 text-teal-800 hover:bg-teal-100';
            }

            return (
              <button
                key={m.month}
                onClick={() => {
                  setCurrentMonth(m.month);
                  setSelectedDay(null);
                }}
                className={`px-3 py-2 rounded-xl border text-left flex flex-col transition-all cursor-pointer ${chipClasses} ${
                  isDimmed ? 'opacity-40 hover:opacity-100' : 'opacity-100'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold font-mono uppercase">{m.name.slice(0, 3)}</span>
                  {isOff ? (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                        isSelected ? 'bg-sky-900/60 text-sky-100' : 'bg-sky-200/80 text-sky-900'
                      }`}
                    >
                      OFF-SEASON
                    </span>
                  ) : m.seasonType === 'on-season' ? (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                        isSelected ? 'bg-amber-900/60 text-amber-100' : 'bg-amber-200/80 text-amber-900'
                      }`}
                    >
                      PEAK
                    </span>
                  ) : (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider ${
                        isSelected ? 'bg-teal-900/60 text-teal-100' : 'bg-teal-100 text-teal-800'
                      }`}
                    >
                      MID
                    </span>
                  )}
                </div>

                <div className="text-[10px] truncate max-w-[110px] mt-1 opacity-90">
                  {isOff ? 'Low Traffic (Exams/Rain)' : m.trafficTag}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── 3. ACTIVE MONTH STATUS & OFF-SEASON RATIONALE BANNER ─── */}
      <div
        className={`p-4 sm:p-5 border-b transition-colors ${
          currentMonthMeta.isOffSeason
            ? 'bg-gradient-to-r from-sky-50 via-blue-50/70 to-indigo-50/40 border-sky-200'
            : currentMonthMeta.seasonType === 'on-season'
            ? 'bg-gradient-to-r from-amber-50 via-orange-50/50 to-rose-50/30 border-amber-200'
            : 'bg-gradient-to-r from-teal-50 via-emerald-50/40 to-slate-50 border-teal-200'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            {/* Header Tag with clear Off-Season emphasis */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  currentMonthMeta.isOffSeason
                    ? 'bg-sky-600 text-white shadow-xs'
                    : currentMonthMeta.seasonType === 'on-season'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-teal-600 text-white shadow-xs'
                }`}
              >
                {currentMonthMeta.isOffSeason ? (
                  <>
                    <CloudRain className="w-3.5 h-3.5" />
                    OFF-SEASON MONTH IN INDIA (LOW TRAFFIC)
                  </>
                ) : currentMonthMeta.seasonType === 'on-season' ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    PEAK ON-SEASON (HIGH TRAFFIC &amp; FESTIVALS)
                  </>
                ) : (
                  <>
                    <Sun className="w-3.5 h-3.5" />
                    SHOULDER SEASON (MODERATE TRAFFIC)
                  </>
                )}
              </span>

              <span className="text-xs font-mono font-semibold text-slate-700 bg-white/80 border border-border px-2 py-0.5 rounded">
                Expected Occupancy: <strong>{currentMonthMeta.avgOccupancy}</strong>
              </span>

              <span className="text-xs font-mono font-semibold text-slate-700 bg-white/80 border border-border px-2 py-0.5 rounded">
                Target ADR: <strong>{currentMonthMeta.adrGuide}</strong>
              </span>
            </div>

            {/* Title & Indian Tourism Rationale */}
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>{currentMonthMeta.name} {currentYear}</span>
              <span className="text-sm font-medium text-slate-500">— {currentMonthMeta.reasonTitle}</span>
            </h3>

            <p className="text-xs text-slate-700 leading-relaxed max-w-4xl">
              {currentMonthMeta.reasonDescription}
            </p>

            {/* Strategic Hotel Operations Guidance */}
            <div className="pt-1 flex items-start gap-1.5 text-[11px] font-medium text-slate-600">
              <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
              <span>
                <strong>Operations &amp; Revenue Recommendation:</strong> {currentMonthMeta.operationalStrategy}
              </span>
            </div>
          </div>

          {/* Month Switcher Controls */}
          <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl bg-white border border-border hover:bg-slate-100 text-foreground transition-all shadow-xs"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="px-3 py-1.5 rounded-xl bg-white border border-border text-center shadow-xs">
              <div className="text-xs font-bold font-mono text-foreground uppercase">
                {currentMonthMeta.name}
              </div>
              <div className="text-[10px] font-mono text-muted-foreground">{currentYear}</div>
            </div>

            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl bg-white border border-border hover:bg-slate-100 text-foreground transition-all shadow-xs"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── 4. CALENDAR GRID ─── */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 gap-2 text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, idx) => (
            <div
              key={d}
              className={`py-1.5 text-xs font-mono font-bold uppercase rounded-lg ${
                idx === 0 || idx === 6
                  ? 'bg-rose-50/70 text-rose-700 border border-rose-100'
                  : 'bg-surface-secondary/60 text-muted-foreground'
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-mono mt-3">Loading Indian hospitality seasonality data...</span>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {/* Blank offset tiles for first day */}
            {Array.from({ length: firstDayOffset }).map((_, i) => (
              <div
                key={`offset-${i}`}
                className="min-h-[78px] rounded-xl border border-dashed border-border/40 bg-surface-secondary/20 opacity-50"
              />
            ))}

            {/* Days tiles */}
            {daysData.map((day) => {
              const isSelected = selectedDay?.date === day.date;
              const isFestival = Boolean(day.event);
              const isOffSeason = day.isOffSeason && !isFestival;

              // Distinct Coloring Logic matching prompt requirements
              let containerStyle = '';
              let badgeText = '';
              let badgeStyle = '';

              if (isFestival) {
                // Festival day stands out (even in an off-season month!)
                containerStyle =
                  'bg-rose-50/90 border-rose-300 hover:border-rose-500 hover:shadow-md';
                badgeText = day.event;
                badgeStyle = 'bg-rose-600 text-white font-bold truncate max-w-full';
              } else if (isOffSeason) {
                // OFF-SEASON COLORED TILE: Soft Ice-Blue / Cool Slate
                containerStyle =
                  'bg-sky-50/70 border-sky-200/90 hover:bg-sky-100/70 hover:border-sky-400 hover:shadow-sm';
                badgeText = 'Off-Season (Low)';
                badgeStyle = 'bg-sky-100 text-sky-800 font-semibold border border-sky-200';
              } else if (day.status === 'on-season') {
                containerStyle =
                  'bg-amber-50/60 border-amber-200/90 hover:bg-amber-100/60 hover:border-amber-400 hover:shadow-sm';
                badgeText = 'Peak (High)';
                badgeStyle = 'bg-amber-100 text-amber-900 font-semibold border border-amber-200';
              } else {
                containerStyle =
                  'bg-surface-secondary/50 border-border hover:bg-surface-secondary hover:border-slate-300';
                badgeText = 'Shoulder';
                badgeStyle = 'bg-slate-100 text-slate-700 font-medium';
              }

              return (
                <div
                  key={day.date}
                  onClick={() => {
                    setSelectedDay(day);
                    if (onDaySelect) onDaySelect(day);
                  }}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between min-h-[82px] relative group ${containerStyle} ${
                    isSelected ? 'ring-2 ring-primary shadow-md scale-[1.02]' : ''
                  }`}
                  title={`${day.date}: ${day.reason || 'Click for operational breakdown'}`}
                >
                  {/* Top: Day Number & Demand Dot */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-bold font-mono ${
                        isFestival
                          ? 'text-rose-700'
                          : isOffSeason
                          ? 'text-sky-900'
                          : day.status === 'on-season'
                          ? 'text-amber-900'
                          : 'text-foreground'
                      }`}
                    >
                      {day.day}
                    </span>

                    {/* Demand Dot */}
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isFestival
                          ? 'bg-rose-500 animate-pulse'
                          : isOffSeason
                          ? 'bg-sky-400'
                          : day.demand === 'surge'
                          ? 'bg-purple-500'
                          : day.demand === 'high'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      title={`Demand signal: ${day.demand}`}
                    />
                  </div>

                  {/* Middle: Event or Seasonality Tag */}
                  <div className="my-1">
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded block text-center truncate ${badgeStyle}`}
                    >
                      {badgeText}
                    </span>
                  </div>

                  {/* Bottom: Occupancy Forecast & Price */}
                  <div className="flex items-center justify-between text-[9px] font-mono text-muted-foreground pt-0.5 border-t border-border/40">
                    <span className="truncate">
                      {day.occupancyEstimate || (isOffSeason ? '35%' : '85%')} occ
                    </span>
                    <span className="font-semibold text-slate-600 truncate">
                      {isOffSeason ? 'Discount' : 'Yield+'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── 5. LEGEND & SEASONALITY GUIDE ─── */}
        <div className="pt-3 border-t border-border/70 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono font-bold text-muted-foreground uppercase text-[11px]">
              Legend:
            </span>

            {/* Off-season swatch */}
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded bg-sky-100 border border-sky-300" />
              <span className="text-slate-700 font-medium">
                Off-Season (Low Traffic • No Vacations/Exams)
              </span>
            </div>

            {/* Peak swatch */}
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded bg-amber-100 border border-amber-300" />
              <span className="text-slate-700 font-medium">
                Peak (Festivals &amp; Summer/Winter Vacations)
              </span>
            </div>

            {/* Festival surge */}
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                ★
              </div>
              <span className="text-slate-700 font-medium">
                Major Indian Festival Surge Day
              </span>
            </div>

            {/* Shoulder swatch */}
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded bg-slate-100 border border-slate-300" />
              <span className="text-slate-700 font-medium">Shoulder Season</span>
            </div>
          </div>

          <div className="text-[11px] font-mono text-muted-foreground">
            Click any day tile to inspect operational recommendations
          </div>
        </div>
      </div>

      {/* ─── 6. INTERACTIVE DAY DETAIL MODAL ─── */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-border shadow-2xl max-w-xl w-full p-6 space-y-4 animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                      selectedDay.isOffSeason && !selectedDay.event
                        ? 'bg-sky-100 text-sky-800 border border-sky-200'
                        : selectedDay.event
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {selectedDay.isOffSeason && !selectedDay.event
                      ? 'OFF-SEASON DAY (LOW TRAFFIC)'
                      : selectedDay.event
                      ? `FESTIVAL SURGE: ${selectedDay.event}`
                      : 'PEAK TOURISM PERIOD'}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">
                    Azure Bay Demand Engine
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground mt-1">
                  {new Date(selectedDay.date).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick KPI Strip */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-3 rounded-xl bg-slate-50 border border-border">
                <div className="text-[10px] font-mono uppercase text-muted-foreground">Demand Level</div>
                <div className="text-sm font-bold text-foreground capitalize mt-0.5">
                  {selectedDay.demand}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-border">
                <div className="text-[10px] font-mono uppercase text-muted-foreground">Forecast Occupancy</div>
                <div className="text-sm font-bold text-primary mt-0.5">
                  {selectedDay.occupancyEstimate || (selectedDay.isOffSeason ? '36%' : '88%')}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-border">
                <div className="text-[10px] font-mono uppercase text-muted-foreground">Suggested ADR</div>
                <div className="text-sm font-bold text-emerald-600 mt-0.5">
                  {selectedDay.adrRecommendation || currentMonthMeta.adrGuide}
                </div>
              </div>
            </div>

            {/* Context & Reason */}
            <div className="p-3.5 rounded-xl bg-slate-50/80 border border-border space-y-1">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-primary" />
                <span>Indian Hospitality Context:</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedDay.reason || currentMonthMeta.reasonDescription}
              </p>
            </div>

            {/* Operational Action Points across Departments */}
            <div className="space-y-2">
              <div className="text-xs font-bold font-mono uppercase text-muted-foreground">
                Department Operational Instructions:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg border border-border bg-white flex items-start gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-foreground">Revenue Dept:</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {selectedDay.isOffSeason
                        ? 'Deploy -25% off-season discount codes; avoid OTA commission gouging.'
                        : 'Maximize ADR yield (+35%), enforce 2-night minimum stay policy.'}
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg border border-border bg-white flex items-start gap-2">
                  <Wrench className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-foreground">Maintenance:</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {selectedDay.isOffSeason
                        ? 'Prime window: Schedule preventative AC compressor & villa overhauls.'
                        : 'Zero disruption window: All maintenance teams on emergency on-call.'}
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg border border-border bg-white flex items-start gap-2">
                  <BedDouble className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-foreground">Housekeeping:</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {selectedDay.isOffSeason
                        ? 'Deep curtain steaming, floor polish, and linen inventory audit.'
                        : 'Rapid turnover readiness; dispatch priority check-in teams by 13:00.'}
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg border border-border bg-white flex items-start gap-2">
                  <Users className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-foreground">Front Desk:</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {selectedDay.isOffSeason
                        ? 'Offer complimentary room upgrades to Deluxe/Suites to delight guests.'
                        : 'VIP arrival lounge setup, express check-in queues, keycard pre-coding.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedDay(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
