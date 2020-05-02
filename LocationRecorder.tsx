import AsyncStorage from '@react-native-community/async-storage';
import { LocationArea } from "./LocationService";

function getDayFromTime(time: number): Date {
    let date = new Date(time);
    return new Date(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate()
    );
}

function storageKeyForDay(time: Date) {
    return 'DAY_RECORD_' + time.toDateString();
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
    async getLocations(day: Date): Promise<LocationArea[]> {
        let locations: LocationArea[] = [];
        const key = storageKeyForDay(day);
        try {
            const data = await AsyncStorage.getItem(key);
            if(data !== null) {
                locations = JSON.parse(data);
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