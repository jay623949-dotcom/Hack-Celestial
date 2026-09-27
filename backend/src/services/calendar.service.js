/**
 * CalendarService
 * Models Indian Hospitality Seasonality, Vacation Cycles, and Festival Calendar.
 * Specifically distinguishes Off-Season months (February exam lull, July-August monsoon, September pre-festive lull)
 * from On-Season / Peak months (Diwali, Dussehra, May summer vacations, Christmas/New Year).
 */

class CalendarService {
  constructor() {
    // Comprehensive list of Indian National Holidays, Key Festivals, and Long Weekends for 2026
    this.indianFestivals = [
      // January
      { date: '2026-01-14', name: 'Makar Sankranti / Pongal', type: 'festival', demand: 'surge' },
      { date: '2026-01-26', name: 'Republic Day (Long Weekend)', type: 'national_holiday', demand: 'surge' },
      
      // March
      { date: '2026-03-03', name: 'Maha Shivaratri', type: 'festival', demand: 'high' },
      { date: '2026-03-20', name: 'Eid al-Fitr', type: 'festival', demand: 'surge' },
      { date: '2026-03-25', name: 'Holi', type: 'festival', demand: 'surge' },
      
      // April
      { date: '2026-04-03', name: 'Good Friday', type: 'national_holiday', demand: 'high' },
      { date: '2026-04-14', name: 'Ambedkar Jayanti / Baisakhi', type: 'festival', demand: 'high' },
      { date: '2026-04-15', name: 'Ram Navami', type: 'festival', demand: 'high' },

      // May (Peak Summer Vacation Month)
      { date: '2026-05-31', name: 'Buddha Purnima', type: 'festival', demand: 'high' },

      // August
      { date: '2026-08-15', name: 'Independence Day (Long Weekend)', type: 'national_holiday', demand: 'surge' },
      { date: '2026-08-28', name: 'Raksha Bandhan', type: 'festival', demand: 'high' },

      // September
      { date: '2026-09-04', name: 'Janmashtami', type: 'festival', demand: 'high' },
      { date: '2026-09-14', name: 'Ganesh Chaturthi', type: 'festival', demand: 'high' },

      // October
      { date: '2026-10-02', name: 'Gandhi Jayanti', type: 'national_holiday', demand: 'high' },
      { date: '2026-10-18', name: 'Maha Ashtami / Durga Puja', type: 'festival', demand: 'surge' },
      { date: '2026-10-20', name: 'Dussehra (Vijayadashami)', type: 'festival', demand: 'surge' },

      // November
      { date: '2026-11-08', name: 'Diwali (Deepavali)', type: 'festival', demand: 'surge' },
      { date: '2026-11-09', name: 'Govardhan Puja', type: 'festival', demand: 'surge' },
      { date: '2026-11-10', name: 'Bhai Dooj', type: 'festival', demand: 'surge' },
      { date: '2026-11-24', name: 'Guru Nanak Jayanti', type: 'festival', demand: 'high' },

      // December
      { date: '2026-12-25', name: 'Christmas Day', type: 'festival', demand: 'surge' },
      { date: '2026-12-31', name: 'New Year’s Eve Gala', type: 'holiday', demand: 'surge' },
    ];

    // Indian Month Seasonality Profiles
    // Outlines why each month is Off-Season vs On-Season based on school vacations, weather, and festivals in India
    this.monthProfiles = {
      0: {
        month: 0,
        name: 'January',
        seasonType: 'on-season',
        isOffSeason: false,
        label: 'Peak Winter & Festivals',
        trafficLevel: 'high',
        avgOccupancy: '82%',
        adrGuide: '₹11,500',
        description: 'Pleasant winter weather in Goa/coastal India. High domestic leisure travel driven by New Year holiday spillover, Makar Sankranti, and Republic Day long weekend.',
        vacationReason: 'Winter holiday season ending; Republic Day extended long weekend.'
      },
      1: {
        month: 1,
        name: 'February',
        seasonType: 'off-season',
        isOffSeason: true,
        label: 'Off-Season (CBSE/ICSE Exam Period)',
        trafficLevel: 'low',
        avgOccupancy: '38%',
        adrGuide: '₹5,200',
        description: 'Nationwide Off-Season: Strictly no school or college vacations across India. CBSE, ICSE, and state boards conduct crucial annual board exams & pre-boards. Domestic families freeze leisure travel.',
        vacationReason: 'No vacation seasons in India; nationwide school board examination lock.'
      },
      2: {
        month: 2,
        name: 'March',
        seasonType: 'shoulder',
        isOffSeason: false,
        label: 'Shoulder Season (Exams Wrap-up & Holi)',
        trafficLevel: 'moderate',
        avgOccupancy: '58%',
        adrGuide: '₹7,800',
        description: 'Shoulder season with academic final exams closing and fiscal year-end deadlines. Features an isolated high-surge demand spike during the Holi festival weekend.',
        vacationReason: 'Academic year concludes; Holi festival short break.'
      },
      3: {
        month: 3,
        name: 'April',
        seasonType: 'shoulder',
        isOffSeason: false,
        label: 'Shoulder Transition to Summer',
        trafficLevel: 'moderate',
        avgOccupancy: '66%',
        adrGuide: '₹8,400',
        description: 'Academic year transition. Summer school vacations commence in late April for many North and South Indian states, marking the early ramp-up of family leisure bookings.',
        vacationReason: 'Summer school vacations commence in late April.'
      },
      4: {
        month: 4,
        name: 'May',
        seasonType: 'on-season',
        isOffSeason: false,
        label: 'Peak Summer School Vacations',
        trafficLevel: 'high',
        avgOccupancy: '88%',
        adrGuide: '₹12,800',
        description: 'Peak Domestic Family Travel: 100% of schools, colleges, and educational institutions in India are on annual summer vacation. Highest domestic family resort occupancy of Q2.',
        vacationReason: 'Nationwide annual summer vacation for all schools & colleges.'
      },
      5: {
        month: 5,
        name: 'June',
        seasonType: 'shoulder',
        isOffSeason: false,
        label: 'Shoulder (School Reopenings & Monsoon)',
        trafficLevel: 'moderate',
        avgOccupancy: '52%',
        adrGuide: '₹6,500',
        description: 'Demand softens significantly in mid-June as schools and universities reopen nationwide for the new academic session, accompanied by the arrival of the southwest monsoon.',
        vacationReason: 'Summer vacations conclude mid-June; schools reopen.'
      },
      6: {
        month: 6,
        name: 'July',
        seasonType: 'off-season',
        isOffSeason: true,
        label: 'Off-Season (Heavy Monsoon & School Session)',
        trafficLevel: 'low',
        avgOccupancy: '32%',
        adrGuide: '₹4,600',
        description: 'Deep Off-Season in India: Zero school or corporate vacations. Continuous southwest monsoon downpours, rough seas (beaches red-flagged in coastal Goa), and schools in regular term.',
        vacationReason: 'No vacations in India; active school semester and peak monsoon season.'
      },
      7: {
        month: 7,
        name: 'August',
        seasonType: 'off-season',
        isOffSeason: true,
        label: 'Off-Season (Monsoon Lull / Holiday Spike)',
        trafficLevel: 'low',
        avgOccupancy: '44%',
        adrGuide: '₹5,400',
        description: 'Off-Season baseline traffic due to persistent monsoon rainfall and full school attendance. Punctuated only by brief holiday spikes on Independence Day (Aug 15) and Raksha Bandhan.',
        vacationReason: 'No extended vacation seasons; traffic mostly subdued except Aug 15 weekend.'
      },
      8: {
        month: 8,
        name: 'September',
        seasonType: 'off-season',
        isOffSeason: true,
        label: 'Off-Season (Pre-Festive / Pitru Paksha Lull)',
        trafficLevel: 'low',
        avgOccupancy: '40%',
        adrGuide: '₹5,100',
        description: 'Off-Season Lull: Pre-Diwali trough. Features the 16-day lunar period of Pitru Paksha (Shradh), traditionally inauspicious for holidays & celebrations. School mid-term exams in session.',
        vacationReason: 'No school holidays; cultural Pitru Paksha period and school mid-term exams.'
      },
      9: {
        month: 9,
        name: 'October',
        seasonType: 'on-season',
        isOffSeason: false,
        label: 'Peak Festive (Navratri, Durga Puja, Dussehra)',
        trafficLevel: 'high',
        avgOccupancy: '86%',
        adrGuide: '₹12,400',
        description: 'Major Festive Season: Navratri, Durga Puja, and Dussehra bring extensive school autumn breaks and corporate long weekends, initiating the high tourist season.',
        vacationReason: 'Dussehra and Durga Puja school vacation breaks nationwide.'
      },
      10: {
        month: 10,
        name: 'November',
        seasonType: 'on-season',
        isOffSeason: false,
        label: 'Super Peak (Diwali & Hindu Wedding Season)',
        trafficLevel: 'surge',
        avgOccupancy: '93%',
        adrGuide: '₹15,000',
        description: 'Super-Peak Demand: Diwali festive holidays, Govardhan Puja, Bhai Dooj, auspicious Hindu wedding dates (muhurats), and ideal pleasant coastal weather.',
        vacationReason: 'Diwali festive holiday week and school vacation breaks.'
      },
      11: {
        month: 11,
        name: 'December',
        seasonType: 'on-season',
        isOffSeason: false,
        label: 'Super Peak (Christmas & New Year Gala)',
        trafficLevel: 'surge',
        avgOccupancy: '97%',
        adrGuide: '₹18,500',
        description: 'Maximum Peak of the Calendar: Christmas week and New Year gala season. International charters, domestic winter school breaks, beach music festivals, and premium ADR yield.',
        vacationReason: 'Nationwide winter school vacations and year-end celebrations.'
      }
    };
  }

  getCalendarEvents() {
    return this.indianFestivals;
  }

  getMonthProfile(month) {
    const m = typeof month === 'string' ? parseInt(month, 10) : month;
    return this.monthProfiles[m] || {
      month: m,
      name: 'Unknown',
      seasonType: 'neutral',
      isOffSeason: false,
      label: 'Standard Season',
      trafficLevel: 'moderate',
      avgOccupancy: '60%',
      description: 'Standard operational period.'
    };
  }

  getSeasonalDemand(dateString) {
    const targetDate = new Date(dateString);
    const month = targetDate.getMonth();
    const dayOfWeek = targetDate.getDay(); // 0 is Sunday, 6 is Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    let demandSignal = 'neutral';
    let festivalName = null;
    let festivalType = null;
    let isSpecificHoliday = false;

    // Check against festival dates (within +/- 3 days window)
    for (const fest of this.indianFestivals) {
      const festDate = new Date(fest.date);
      const targetTime = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()).getTime();
      const festTime = new Date(festDate.getFullYear(), festDate.getMonth(), festDate.getDate()).getTime();
      const diffDays = Math.round(Math.abs(targetTime - festTime) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        demandSignal = fest.demand || 'surge';
        festivalName = fest.name;
        festivalType = fest.type;
        isSpecificHoliday = true;
        break;
      } else if (diffDays <= 2) {
        demandSignal = 'high';
        festivalName = `${fest.name} (Nearby Window)`;
        festivalType = fest.type;
        break;
      }
    }

    const monthProfile = this.getMonthProfile(month);
    let status = 'neutral';
    let reason = '';
    let isOffSeason = false;

    if (isSpecificHoliday || demandSignal === 'surge' || demandSignal === 'high') {
      status = 'on-season';
      reason = festivalName ? `High demand driven by ${festivalName}` : 'Peak holiday period';
    } else if (monthProfile.isOffSeason) {
      // Off-season months (February, July, August, September) with no festivals
      status = 'off-season';
      isOffSeason = true;
      demandSignal = 'low';
      reason = monthProfile.vacationReason || monthProfile.description;
    } else if (monthProfile.seasonType === 'on-season') {
      // Peak months (e.g. May summer holidays, late Dec)
      status = 'on-season';
      demandSignal = isWeekend ? 'surge' : 'high';
      reason = monthProfile.description;
    } else {
      // Shoulder months (March, April, June)
      status = 'neutral';
      demandSignal = isWeekend ? 'moderate' : 'neutral';
      reason = monthProfile.description;
    }

    return {
      demandSignal,
      festivalName,
      festivalType,
      status,
      isOffSeason,
      monthSeason: monthProfile.seasonType,
      monthName: monthProfile.name,
      reason,
      occupancyEstimate: isOffSeason ? (isWeekend ? '42%' : '32%') : (demandSignal === 'surge' ? '96%' : '78%'),
      adrRecommendation: isOffSeason ? monthProfile.adrGuide : (demandSignal === 'surge' ? '₹14,500' : '₹9,800')
    };
  }

  getCalendarDataForMonth(year, month) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const calendar = [];
    const monthProfile = this.getMonthProfile(month);

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayDate = new Date(year, month, d);
      const seasonInfo = this.getSeasonalDemand(dateStr);

      calendar.push({
        date: dateStr,
        day: d,
        dayOfWeek: dayDate.getDay(),
        status: seasonInfo.status,
        isOffSeason: seasonInfo.isOffSeason,
        event: seasonInfo.festivalName,
        demand: seasonInfo.demandSignal,
        reason: seasonInfo.reason,
        occupancyEstimate: seasonInfo.occupancyEstimate,
        adrRecommendation: seasonInfo.adrRecommendation,
        monthSeason: monthProfile.seasonType,
        monthName: monthProfile.name,
        monthLabel: monthProfile.label
      });
    }

    // Attach month profile metadata to array object for rich consumers
    calendar.monthProfile = monthProfile;
    return calendar;
  }

  getAnnualOverview(year = 2026) {
    const overview = [];
    for (let m = 0; m < 12; m++) {
      const profile = this.getMonthProfile(m);
      const festivalsInMonth = this.indianFestivals.filter(f => {
        const festDate = new Date(f.date);
        return festDate.getMonth() === m;
      });

      overview.push({
        ...profile,
        year,
        festivalsCount: festivalsInMonth.length,
        festivals: festivalsInMonth,
      });
    }
    return overview;
  }
}

module.exports = new CalendarService();
