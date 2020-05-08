import BackgroundGeolocation, { ServiceStatus, StationaryLocation, Location } from '@mauron85/react-native-background-geolocation';
import { Alert } from 'react-native';
import { SyncEvent } from 'ts-events';
import LocationRecorder from './LocationRecorder';
import { LatLng } from 'react-native-maps';


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

export default class LocationService {
    static isInitialized = false;
    static onLocationChanged: SyncEvent<LocationArea> = new SyncEvent();
    static onStatusChanged: SyncEvent<boolean> = new SyncEvent();
    static lastLocation: LocationArea;
    static async initialize() {
        if (this.isInitialized) {
            return;
        }
        const locationRecorder = new LocationRecorder();

        BackgroundGeolocation.configure({
            desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
            stationaryRadius: 5,
            distanceFilter: 5,
            notificationTitle: 'Background tracking',
            notificationText: 'enabled',
            debug: false,
            startOnBoot: true,
            stopOnTerminate: false,
            locationProvider: BackgroundGeolocation.DISTANCE_FILTER_PROVIDER,
            interval: 1000,
            fastestInterval: 1000,
            activitiesInterval: 1000,
            activityType: 'AutomotiveNavigation',
            pauseLocationUpdates: false,
            saveBatteryOnBackground: true,
            stopOnStillActivity: false,
            maxLocations: 15*240
        });
    
        BackgroundGeolocation.on('location', location => {
            console.log('[DEBUG] BackgroundGeolocation location', location);
            BackgroundGeolocation.startTask(taskKey => {
                const area = LocationArea.fromLocation(location);
                if (!area.hasSameDayAndCoordinatesThan(locationRecorder.getLastRecordedArea())) {
                    locationRecorder.record(area);
                    this.onLocationChanged.post(area);
                }
                BackgroundGeolocation.endTask(taskKey);
            });
        });
    
        BackgroundGeolocation.on('stationary', (stationaryLocation) => {
            // handle stationary locations here
            console.log('[INFO] stationaryLocation:', stationaryLocation);
          });
    
          BackgroundGeolocation.on('error', (error) => {
            console.log('[ERROR] BackgroundGeolocation error:', error);
            this.onStatusChanged.post(false);
          });
      
          BackgroundGeolocation.on('start', () => {
            console.log('[INFO] BackgroundGeolocation service has been started');
            this.onStatusChanged.post(true);
          });
      
          BackgroundGeolocation.on('stop', () => {
            console.log('[INFO] BackgroundGeolocation service has been stopped');
            this.onStatusChanged.post(false);
          });
      
          BackgroundGeolocation.on('authorization', (status) => {
            console.log('[INFO] BackgroundGeolocation authorization status: ' + status);
            if (status !== BackgroundGeolocation.AUTHORIZED) {
              // we need to set delay or otherwise alert may not be shown
              setTimeout(() =>
                Alert.alert('App requires location tracking permission', 'Would you like to open app settings?', [
                  { text: 'Yes', onPress: () => BackgroundGeolocation.showAppSettings() },
                  { text: 'No', onPress: () => console.log('No Pressed'), style: 'cancel' }
                ]), 1000);
            }
          });
      
        BackgroundGeolocation.on('background', () => {
            console.log('[INFO] App is in background');
        });
      
        BackgroundGeolocation.on('foreground', () => {
            console.log('[INFO] App is in foreground');
        });
    
        BackgroundGeolocation.checkStatus((status: ServiceStatus) => {
            console.log('[INFO] BackgroundGeolocation service is running', status.isRunning);
            console.log('[INFO] BackgroundGeolocation services enabled', status.locationServicesEnabled);
            console.log('[INFO] BackgroundGeolocation auth status: ' + status.authorization);
            if (!status.isRunning) {
            //   BackgroundGeolocation.start(); //triggers start on start event
            }
        });
    
        await BackgroundGeolocation.getCurrentLocation(lastLocation => {
            console.log('[INFO] BackgroundGeolocation getCurrentLocation', lastLocation);
            this.lastLocation = LocationArea.fromLocation(lastLocation);
        }, (error) => {
            setTimeout(() => {
              Alert.alert('Error obtaining current location', JSON.stringify(error));
            }, 100);
        });

        this.isInitialized = true;
    }

    static destroy() {
        this.isInitialized = false;
        // unregister all event listeners
        this.onLocationChanged.detach();
        this.onStatusChanged.detach();
        BackgroundGeolocation.removeAllListeners();
    }

    static toggleTracking() {
        BackgroundGeolocation.checkStatus(({ isRunning, locationServicesEnabled, authorization }) => {
            if (isRunning) {
              BackgroundGeolocation.stop();
              return false;
            }
      
            if (!locationServicesEnabled) {
              Alert.alert(
                'Location services disabled',
                'Would you like to open location settings?',
                [
                  {
                    text: 'Yes',
                    onPress: () => BackgroundGeolocation.showLocationSettings()
                  },
                  {
                    text: 'No',
                    onPress: () => console.log('No Pressed'),
                    style: 'cancel'
                  }
                ]
              );
              return false;
            }
      
            if (authorization.valueOf() == 99) {
              // authorization yet to be determined
              BackgroundGeolocation.start();
            } else if (authorization == BackgroundGeolocation.AUTHORIZED) {
              // calling start will also ask user for permission if needed
              // permission error will be handled in permisision_denied event
              BackgroundGeolocation.start();
            } else {
              Alert.alert(
                'App requires location tracking',
                'Please grant permission',
                [
                  {
                    text: 'Ok',
                    onPress: () => BackgroundGeolocation.start()
                  }
                ]
              );
            }
          });
    }

}