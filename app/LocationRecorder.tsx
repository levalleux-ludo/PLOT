import AsyncStorage from '@react-native-community/async-storage';
import { LocationArea } from "./LocationArea";
import { randomInt } from './Utils';

export const fake = true;

export function createFakeData() {
    const nbDays = 16;
    const minLocationsPerDay = 50;
    const maxLocationsPerDay = 100;
    const minLatitude = +51.148;
    const maxLatitude = +51.152;
    const minLongitude = 0.868;
    const maxLongitude = +0.872;
    const accuracyFactor = 10000;
    let date = today();
    const recorder = new LocationRecorder();
    for (let dayIdx = 0; dayIdx < nbDays; dayIdx++) {
        const locations = [];
        const nbLocations = randomInt(minLocationsPerDay, maxLocationsPerDay);
        for (let i = 0; i < nbLocations; i++) {
            const lati = randomInt(minLatitude * accuracyFactor, maxLatitude * accuracyFactor) / accuracyFactor;
            const longi = randomInt(minLongitude * accuracyFactor, maxLongitude * accuracyFactor) / accuracyFactor;
            const time = new Date(
                date.getUTCFullYear(),
                date.getUTCMonth(),
                date.getUTCDate(),
                randomInt(0, 12),
                6*randomInt(0, 10)
            )
            const area = new LocationArea(time.valueOf(), lati, longi);
            // console.log("generate random area:", area);
            locations.push(area);
        }
        recorder.storeLocations(date, locations);
        date = dayBefore(date);
    }
}

export function getDayFromTime(time: number): Date {
    let date = new Date(time);
    return new Date(Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate()
    ));
}

export function today(): Date {
    return getDayFromTime(Date.now())
}

const A_SECOND = 1000;
const AN_HOUR = 3600 * A_SECOND;
const A_DAY = 24 * AN_HOUR;

export function dayBefore(aDay: Date) {
    return getDayFromTime(aDay.valueOf() - A_DAY);
}

export function dayAfter(aDay: Date) {
    return getDayFromTime(aDay.valueOf() + A_DAY);
}

function storageKeyForDay(time: Date) {
    return 'DAY_RECORD_' + time.toDateString();
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
  

export default class LocationRecorder {
    lastRecordedDay = 0;
    lastRecordedArea: LocationArea|undefined = undefined;
    constructor() {
    }
    async storageExists(key: string): Promise<boolean> {
        try {
            const value = await AsyncStorage.getItem(key);
            if(value !== null) {
                return true;
            }
        } catch(e) {
            return false;
        }
        return false;
    }
    async recordExists(day: Date): Promise<boolean> {
        const key = storageKeyForDay(day);
        try {
            const value = await AsyncStorage.getItem(key);
            if(value !== null) {
                return true;
            }
        } catch(e) {
            return false;
        }
        return false;
    }
    async getLocations(day: Date): Promise<LocationArea[]> {
        let locations: LocationArea[] = [];
        const key = storageKeyForDay(day);
        try {
            const data = await AsyncStorage.getItem(key);
            if(data !== null) {
                locations = JSON.parse(data).map((l: any) => new LocationArea(l.time, l.lati, l.longi));
            }
        } catch(e) {
            console.error(e);
        }
        return locations;
    }
    async storeLocations(day: Date, locations: LocationArea[]) {
        const key = storageKeyForDay(day);
        return await AsyncStorage.setItem(key, JSON.stringify(locations));
    }
    async record(area: LocationArea) {
        const time = area.time;
        const day = getDayFromTime(time);
        if (day.valueOf() !== this.lastRecordedDay) {
            // new day = new record
            // TODO: delete the storage for the oldest day if older than 15 days
            // --> AsyncStorage.removeItem(key)
        }
        await this.getLocations(day).then(async (locations) => {
            if ((locations.length > 0) && !(locations[locations.length - 1].hasSameDayAndCoordinatesThan(area))) {
                console.log("[INFO] LocationRecorder.record", area);
                this.lastRecordedArea = area;
                locations.push(area);
                await this.storeLocations(day, locations);
            }
        });
    }
    getLastRecordedArea(): LocationArea|undefined {
        return this.lastRecordedArea;
    }
}