import { LatLng } from 'react-native-maps';
import { Location } from '@mauron85/react-native-background-geolocation';

function reduce(coord: number, accuracy: number): number {
    return Math.floor(coord / accuracy)*accuracy;
}

export class LocationArea {
    static size: {lati: number, longi: number, time: number} = {
        lati: 0.00002, longi: 0.00002, time: 10000
    };

    public constructor(
        public time: number,
        public lati: number,
        public longi: number
    ) {}

    getDay(): Date {
        let date = new Date(this.time);
        return new Date(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate()
        );
    }

    equals(area2: LocationArea) {
        if ((area2)
            && (area2.lati === this.lati)
            && (area2.longi === this.longi)
            && (area2.time === this.time)) {
            return true;
        }
        return false;
    }

    hasSameDayAndCoordinatesThan(area2: LocationArea|undefined) {
        if ((area2)
            && (area2.lati === this.lati)
            && (area2.longi === this.longi)
            && (area2.getDay() === this.getDay())) {
            return true;
        }
        return false;
    }

    static fromLocation(location: Location): LocationArea {
        return new LocationArea(
            reduce(location.time, LocationArea.size.time),
            reduce(location.latitude, LocationArea.size.lati),
            reduce(location.longitude, LocationArea.size.longi)
        );
    }

    toLatLng(): LatLng {
        return {
            latitude: this.lati,
            longitude: this.longi
        };
    }
}
