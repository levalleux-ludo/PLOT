import React, { Component } from 'react';
import { Container, Content, Footer, FooterTab, Button, Icon, Left, Body, Header, Right, Title } from 'native-base';
import { StyleSheet, Dimensions, Alert, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, NavigationContainer } from '@react-navigation/native';
import BackgroundGeolocation, { ServiceStatus, StationaryLocation, Location, LocationError } from '@mauron85/react-native-background-geolocation';
import MapComponent from './MapComponent';
import { Region, LatLng } from 'react-native-maps';
import LocationService, { LocationArea } from './LocationService';
import LocationRecorder, { today, dayBefore, dayAfter } from './LocationRecorder';
import { createStackNavigator } from '@react-navigation/stack';
import TableComponent from './TableComponent';

const defaultLatitudeDelta = 0.015;
const defaultLongitudeDelta = 0.0121;

interface MyState {
    region: Region | undefined,
    zoomFactor: number,
    locations: LocationArea[],
    hiddenLocations: Map<string, boolean>,
    stationaries: StationaryLocation[],
    isRunning: boolean,
    currentDay: Date,
    hasDayBefore: boolean,
    hasDayAfter: boolean,
    showMap: boolean
}

const Stack = createStackNavigator();

class MainScreen extends Component {

state: MyState = {
    region: undefined,
    zoomFactor: 1,
    locations: [],
    hiddenLocations: new Map(),
    stationaries: [],
    isRunning: false,
    currentDay: today(),
    hasDayBefore: true,
    hasDayAfter: true,
    showMap: true
  };

    constructor(props: any) {
        super(props);
        this.goToSettings = this.goToSettings.bind(this);
        this.goToDayAfter = this.goToDayAfter.bind(this);
        this.goToDayBefore = this.goToDayBefore.bind(this);
        this.switchToMapView = this.switchToMapView.bind(this);
        this.switchToTableView = this.switchToTableView.bind(this);
        this.getValueAtCol = this.getValueAtCol.bind(this);
        this.getRowStyle = this.getRowStyle.bind(this);
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
      this.onChangeDay(this.state.currentDay);
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
        console.log('[INFO] Set region:' + region);
        this.setState({ region });
      }
  }

    componentWillUnmount() {
    }
  

    goToSettings() {
        const { navigation }: any = this.props;
        navigation.navigate('Services');
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

    onChangeDay(currentDay: Date) {
      const recorder = new LocationRecorder();
      const hasDayAfter = recorder.recordExists(dayAfter(currentDay));
      const hasDayBefore = recorder.recordExists(dayBefore(currentDay));
      recorder.getLocations(currentDay).then(locations => {
        if (locations && (locations.length > 0)) {
          this.refreshRegion(locations[0].toLatLng());
          this.setState({hasDayAfter, hasDayBefore, locations});
        }
      }).catch(error => console.error(error));
    }

    goToDayBefore() {
      const currentDay = dayBefore(this.state.currentDay);
      console.log("goToDayBefore", currentDay.toDateString());
      this.setState({currentDay});
      this.onChangeDay(currentDay);
    }

    goToDayAfter() {
      const currentDay = dayAfter(this.state.currentDay);
      console.log("goToDayAfter", currentDay.toDateString());
      this.setState({currentDay});
      this.onChangeDay(currentDay);
    }

    switchToTableView() {
      this.setState({showMap: false});
    }

    switchToMapView() {
      this.setState({showMap: true});
    }

    hideLocation(location: LatLng, isHidden: boolean) {
      const hiddenLocations = this.state.hiddenLocations;
      const locationKey = JSON.stringify(location);
      if (!isHidden && hiddenLocations.has(locationKey)) {
        hiddenLocations.delete(locationKey);
      } else {
        hiddenLocations.set(locationKey, isHidden);
      }
      this.setState({hiddenLocations});
    }

    getValueAtCol(area: LocationArea, colIndex: number) {
      const location = area.toLatLng();
      const locationKey = JSON.stringify(location);
      const isHidden = this.state.hiddenLocations.has(locationKey) ? this.state.hiddenLocations.get(locationKey) : false;
      const value = [
        // (la: LocationArea) => la.getDay().toDateString(),
        (la: LocationArea) => new Date(la.time).toISOString(),
        (la: LocationArea) => la.lati,
        (la: LocationArea) => la.longi,
        (la: LocationArea) => (
          <TouchableOpacity onPress={() => {
            const message = (isHidden) ? 
              `Location ${location} is now being revealed` :
              `Location ${location} is now hidden`;
            Alert.alert(message);
            this.hideLocation(location, !isHidden);
          }}>
            <View style={styles.filter}>
              <Icon type="AntDesign" name={isHidden ? "lock" : "unlock"} style={styles.iconBlack}/>
            </View>
          </TouchableOpacity>
        )
      ];
      return value[colIndex](area);
    }

    getRowStyle(area: LocationArea) {
      const location = area.toLatLng();
      const locationKey = JSON.stringify(location);
      const isHidden = this.state.hiddenLocations.has(locationKey) ? this.state.hiddenLocations.get(locationKey) : false;
      return (isHidden) ? styles.hiddenCell : styles.cell;
    }

    render() {
        const { locations, stationaries, region, isRunning, currentDay, hasDayBefore, hasDayAfter }: MyState = this.state;
        return (
            <Container>
                <Content scrollEnabled={false}  padder={false}>
                { this.state.showMap ? 
                  <View>
                  <MapComponent
                   region={region}
                   locations={locations.map(l => l.toLatLng())}
                   onRegionChange={this.onRegionChange}
                   onPressZoomIn={this.onPressZoomIn}
                   onPressZoomOut={this.onPressZoomOut}
                   >
                  </MapComponent>
                  <TouchableOpacity style={styles.switchToTable} onPress={this.switchToTableView}>
                    <Icon name="md-list" style={styles.iconSwitchToTable}/>
                  </TouchableOpacity>
                  </View>
                :
                <Container>
                <Header transparent style={{margin:0, padding: 0}}>
                <Body><Title>Header No Shadow</Title></Body>
                <Right>
                <TouchableOpacity style={styles.switchToMap} onPress={this.switchToMapView}>
                  <Icon name="md-map" style={styles.iconSwitchToTable}/>
                </TouchableOpacity>
                </Right>
                </Header>
                <Content padder={false}>
                  <TableComponent
                  locationAreas={locations.sort((l1, l2) => l1.time - l2.time)}
                  tableHead={['Time', 'Latitude', 'Longitude', 'Filter']}
                  colWidth={[190,68,68,48]}
                  getValueAtCol={this.getValueAtCol}
                  getRowStyle={this.getRowStyle}
                  >
                </TableComponent>
                </Content>
               </Container>
              }
                </Content>
                <Footer style={styles.footer}>
                <FooterTab>
                  <Button onPress={this.goToDayBefore} disabled={false}>
                  <Icon name={'ios-arrow-back'} style={styles.icon} />
                  </Button>
                  <Text style={styles.date}>{currentDay.toDateString()}</Text>
                  <Button onPress={this.goToDayAfter} disabled={false}>
                    <Icon name={'ios-arrow-forward'} style={styles.icon} />
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
    },
    date: {
      color: '#fff',
      fontSize: 20,
      alignItems: 'center',
      fontWeight: 'bold',
      alignSelf: 'center',
      marginStart: 12,
      marginEnd: 12
    },
    switchToTable: {
      position: "absolute",
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      right: 10,
      top: 10,
      zIndex: 99,
    },
    switchToMap: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99,
    },
    iconSwitchToTable: {
      fontSize: 40,
    },
    btn: {
      width: 58,
      height: 18,
      backgroundColor: '#78B7BB',
      borderRadius: 2
    },
    filter: {
      alignItems: 'center',
      justifyContent: 'center'
    },
    iconBlack: {
      color: '#000',
      fontSize: 30
    },
    hiddenCell: {
      backgroundColor: '#FF0000',
    },
    cell: {
    }
  });
  
// Wrap and export
export default function(props: any) {
    const navigation = useNavigation();
  
    return <MainScreen {...props} navigation={navigation} />;
  }
  