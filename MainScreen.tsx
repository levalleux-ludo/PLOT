import React, { Component } from 'react';
import { Container, Content, Footer, FooterTab, Button, Icon } from 'native-base';
import { StyleSheet, Dimensions, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker, Circle, Region } from 'react-native-maps';
import BackgroundGeolocation, { ServiceStatus, StationaryLocation, Location } from '@mauron85/react-native-background-geolocation';
const TrackingDot = require('./res/TrackingDot.png');

class MainScreen extends Component {

  state: {
    region: Region | undefined,
    locations: Location[],
    stationaries: StationaryLocation[],
    isRunning: boolean
  } = {
    region: undefined,
    locations: [],
    stationaries: [],
    isRunning: false
  };

    constructor(props: any) {
        super(props);
        this.goToSettings = this.goToSettings.bind(this);
    }

    componentDidMount() {
      BackgroundGeolocation.configure({
        desiredAccuracy: BackgroundGeolocation.MEDIUM_ACCURACY,
        stationaryRadius: 5,
        distanceFilter: 5,
        notificationTitle: 'Background tracking',
        notificationText: 'enabled',
        debug: false,
        startOnBoot: false,
        stopOnTerminate: true,
        locationProvider: BackgroundGeolocation.DISTANCE_FILTER_PROVIDER,
        interval: 1000,
        fastestInterval: 500,
        activitiesInterval: 1000,
        stopOnStillActivity: false
      });

      BackgroundGeolocation.on('location', location => {
        console.log('[DEBUG] BackgroundGeolocation location', location);
        BackgroundGeolocation.startTask(taskKey => {
          requestAnimationFrame(() => {
            const longitudeDelta = 0.01;
            const latitudeDelta = 0.01;
            const region = Object.assign({}, location, {
              latitudeDelta,
              longitudeDelta
            });
            const locations = this.state.locations.slice(0);
            locations.push(location);
            this.setState({ locations, region });
            BackgroundGeolocation.endTask(taskKey);
          });
        });
      });
  
      BackgroundGeolocation.on('stationary', (stationaryLocation) => {
        // handle stationary locations here
        console.log('[INFO] stationaryLocation:', stationaryLocation);
      });

      BackgroundGeolocation.on('error', (error) => {
        console.log('[ERROR] BackgroundGeolocation error:', error);
      });
  
      BackgroundGeolocation.on('start', () => {
        console.log('[INFO] BackgroundGeolocation service has been started');
      });
  
      BackgroundGeolocation.on('stop', () => {
        console.log('[INFO] BackgroundGeolocation service has been stopped');
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
          BackgroundGeolocation.start(); //triggers start on start event
        }
      });

      BackgroundGeolocation.getCurrentLocation(lastLocation => {
        this.refreshRegion(lastLocation);
      }, (error) => {
        setTimeout(() => {
          Alert.alert('Error obtaining current location', JSON.stringify(error));
        }, 100);
      });

    }

    refreshRegion(location: Location) {
      let region = this.state.region;
      const latitudeDelta = 0.01;
      const longitudeDelta = 0.01;
      region = Object.assign({}, location, {
        latitudeDelta,
        longitudeDelta
      });
      console.log('[INFO] Set region:' + region);
      this.setState({ locations: [location], region });
    }

    componentWillUnmount() {
      // unregister all event listeners
      BackgroundGeolocation.removeAllListeners();
    }
  

    goToSettings() {
        const { navigation }: any = this.props;
        navigation.navigate('Menu');
    }

    toggleTracking() {

    }
    
    render() {
        const { height, width } = Dimensions.get('window');
        const { locations, stationaries, region, isRunning }: any = this.state;
        return (
            <Container>
                <Content>
                  <MapView style={{ width, height }} region={region}>
                    {locations.map((location: Location, idx: number) => (
                      <Marker
                        key={idx}
                        coordinate={location}
                        image={TrackingDot}
                      />
                    ))}
                  </MapView>
                </Content>
                <Footer style={styles.footer}>
                <FooterTab>
                    <Button onPress={this.toggleTracking}>
                    <Icon name={isRunning ? 'pause' : 'play'} style={styles.icon} />
                    </Button>
                    <Button onPress={this.goToSettings}>
                    <Icon name="menu" style={styles.icon} />
                    </Button>
                </FooterTab>
                </Footer>
            </Container>
        )
    }
}

const styles = StyleSheet.create({
    container: {
      flex: 1
    },
    footer: {
      backgroundColor: '#0C68FB',
    },
    icon: {
      color: '#fff',
      fontSize: 30
    }
  });
  
// Wrap and export
export default function(props: any) {
    const navigation = useNavigation();
  
    return <MainScreen {...props} navigation={navigation} />;
  }
  