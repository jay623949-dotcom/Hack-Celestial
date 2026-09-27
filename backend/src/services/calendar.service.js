


class CalendarService {
  constructor() {
    // A mock list of Indian festivals for the year, representing "On-Season" (High Demand)
    // In a full production app, this could parse the actual Google Calendar ICS feed:
    // https://calendar.google.com/calendar/ical/en.indian%23holiday%40group.v.calendar.google.com/public/basic.ics
    this.indianFestivals = [
      { date: '2026-01-14', name: 'Makar Sankranti', type: 'on-season' },
      { date: '2026-01-26', name: 'Republic Day', type: 'on-season' },
      { date: '2026-03-03', name: 'Maha Shivaratri', type: 'on-season' },
      { date: '2026-03-25', name: 'Holi', type: 'on-season' },
      { date: '2026-04-15', name: 'Ram Navami', type: 'on-season' },
      { date: '2026-08-15', name: 'Independence Day', type: 'on-season' },
      { date: '2026-09-06', name: 'Janmashtami', type: 'on-season' },
      { date: '2026-10-02', name: 'Gandhi Jayanti', type: 'on-season' },
      { date: '2026-10-18', name: 'Dussehra', type: 'on-season' },
      { date: '2026-11-08', name: 'Diwali', type: 'on-season' },
      { date: '2026-12-25', name: 'Christmas', type: 'on-season' },
    ];
  }

  getCalendarEvents() {
    return this.indianFestivals;
  }

  getSeasonalDemand(dateString) {
    // Check if the given date is near a festival (e.g., +/- 3 days for Indian festivals)
    const targetDate = new Date(dateString);
    let demandSignal = 'neutral';
    let festivalName = null;

    for (const fest of this.indianFestivals) {
      const festDate = new Date(fest.date);
      const diffTime = Math.abs(targetDate - festDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      if (diffDays === 0) {
        demandSignal = 'surge'; // Exact day
        festivalName = fest.name;
        break;
      } else if (diffDays <= 3) {
        demandSignal = 'high'; // Near the day
        festivalName = fest.name;
        break;
      }
    }

    // Default off-season / on-season logic
    // We can define off-season as mid-summer (May-June) in India except hill stations.
    // For this generic resort, let's say July-August is monsoon (off-season)
    const month = targetDate.getMonth();
    if (!festivalName && (month === 6 || month === 7)) {
      demandSignal = 'low'; // July, August
    }

    return { demandSignal, festivalName };
  }
  
  getCalendarDataForMonth(year, month) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const calendar = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const seasonInfo = this.getSeasonalDemand(dateStr);
      let status = 'neutral';
      if (seasonInfo.demandSignal === 'surge' || seasonInfo.demandSignal === 'high') status = 'on-season';
      if (seasonInfo.demandSignal === 'low') status = 'off-season';
      
      calendar.push({
        date: dateStr,
        day: d,
        status: status,
        event: seasonInfo.festivalName,
        demand: seasonInfo.demandSignal
      });
    }

    return calendar;
  }
}

module.exports = new CalendarService();
