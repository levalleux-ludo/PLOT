export function getDayFromTime(time: number): Date {
  const date = new Date(time);
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}

export function today(): Date {
  return getDayFromTime(Date.now());
}

const A_SECOND = 1000;
const AN_HOUR = 3600 * A_SECOND;
const A_DAY = 24 * AN_HOUR;

export function dayBefore(aDay: Date): Date {
  return getDayFromTime(aDay.valueOf() - A_DAY);
}

export function dayAfter(aDay: Date): Date {
  return getDayFromTime(aDay.valueOf() + A_DAY);
}

export function addDays(aDay: Date, nbDaysToAdd: number): Date {
  return getDayFromTime(aDay.valueOf() + nbDaysToAdd * A_DAY);
}

export function daysBetween(day1: Date, day2: Date): Date[] {
  const days = [];
  const nbDays = 1 + Math.floor((day2.valueOf() - day1.valueOf()) / A_DAY);
  if (nbDays >= 0) {
    for (let i = 0; i < nbDays; i++) {
      days.push(addDays(day1, i));
    }
  } else {
    for (let i = 0; i > nbDays; i--) {
      days.push(addDays(day1, i));
    }
  }
  return days;
}
