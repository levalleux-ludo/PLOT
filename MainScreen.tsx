import React, { Component } from 'react';
import { Container, Content, Footer, FooterTab, Button, Icon } from 'native-base';
import { StyleSheet, Dimensions, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BackgroundGeolocation, { ServiceStatus, StationaryLocation, Location } from '@mauron85/react-native-background-geolocation';
import MapComponent from './MapComponent';
import { Region, LatLng } from 'react-native-maps';
import LocationService, { LocationArea } from './LocationService';

const defaultLatitudeDelta = 0.015;
const defaultLongitudeDelta = 0.0121;
class MainScreen extends Component {

  state: {
    region: Region | undefined,
    zoomFactor: number,
    locations: LatLng[],
    stationaries: StationaryLocation[],
    isRunning: boolean
  } = {
    region: undefined,
    zoomFactor: 1,
    locations: [],
    stationaries: [],
    isRunning: false
  };

    constructor(props: any) {
        super(props);
        this.goToSettings = this.goToSettings.bind(this);
    }

    componentDidMount() {
      LocationService.onLocationChanged.attach((area) => {
        console.log("LocationService.onLocationChanged", area);
          this.refreshRegion(area.toLatLng());
      });
      LocationService.onStatusChanged.attach((running) => {
        this.setState({ isRunning: running });
      })
      if (LocationService.lastLocation) {
        this.refreshRegion(LocationService.lastLocation.toLatLng());
      }
    }

    refreshRegion(location?: LatLng) {
      let region = this.state.region;
      let newLocation = location;
      if (!newLocation && region) {
        newLocation = {latitude: region.latitude, longitude: region.longitude};
      }
      console.log("refreshRegion");
      if (newLocation) {
        region = Object.assign({}, {
            latitude: newLocation.latitude,
            longitude: newLocation.longitude,
            latitudeDelta: defaultLatitudeDelta*this.state.zoomFactor,
            longitudeDelta: defaultLongitudeDelta*this.state.zoomFactor
        });
        let locations = this.state.locations;
        locations.push(newLocation);
        console.log('[INFO] Set region:' + region);
        this.setState({ locations, region });
      }
  }

    componentWillUnmount() {
    }
  

    goToSettings() {
        const { navigation }: any = this.props;
        navigation.navigate('Menu');
    }

    toggleTracking() {
      LocationService.toggleTracking();
    }

    onRegionChange = (region: Region) => {
      const zoomFactor = Math.min(region.latitudeDelta/defaultLatitudeDelta, region.longitudeDelta/defaultLongitudeDelta);
      console.log("onRegionChange", region, "zoomFactor", zoomFactor);
      this.setState({ region, zoomFactor });
    }

    onPressZoomIn = () => {
      const zoomFactor = this.state.zoomFactor / 1.2;
      console.log("onPressZoomIn zoomFactor", zoomFactor);
      this.setState({ zoomFactor });
      this.refreshRegion();
    }

    onPressZoomOut = () => {
      const zoomFactor = this.state.zoomFactor * 1.2;
      console.log("onPressZoomOut zoomFactor", zoomFactor);
      this.setState({ zoomFactor });
      this.refreshRegion();
    }
        
    render() {
        const { locations, stationaries, region, isRunning }: any = this.state;
        return (
            <Container>
                <Content>
                  <MapComponent
                   region={region}
                   locations={locations}
                   onRegionChange={this.onRegionChange}
                   onPressZoomIn={this.onPressZoomIn}
                   onPressZoomOut={this.onPressZoomOut}
                   >
                   </MapComponent>
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
  