import React, { Component } from 'react';
import MapView, { Marker, Circle, Region, AnimatedRegion, LatLng, Polygon, MapEvent } from 'react-native-maps';
import { Dimensions, TouchableOpacity, StyleSheet } from 'react-native';
import { Fab, Icon, View } from 'native-base';
const TrackingDot = require('./res/TrackingDot.png');
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';

function reduce(coord: number): number {
    return Math.floor(coord * 20000)/20000; // reduce at 0.00005
}

interface MyProps {
    children: any[], // only to avoid compiler error
    locations: LatLng[],
    region: Region | undefined,
    showMenu: boolean,
    menuPosition: {x:number, y: number},
    menuOption: number,
    isLocationHidden: (idx: number) => boolean,
    onRegionChange: (region: Region) => void,
    onPressZoomIn: () => void,
    onPressZoomOut: () => void,
    onPressPolygon: (idx: number) => ((e: MapEvent) => void),
    closeMenu: () => void,
    onClickMenuOption: (option: number) => void
}

const MapComponent = (props: MyProps) => {
    const { height, width } = Dimensions.get('window');
    // const polygons = [];
    const offsetLati = 0.00010;
    const offsetLongi = 0.00015;
    const colorBase = "rgba(128,128,255,0.9)";
    const colorHidden = "rgba(255,128,128,0.9)"
    // if (props.region && (props.region.latitudeDelta < 0.0001) && (props.region.longitudeDelta < 0.0001)) {
    //     console.log("region", JSON.stringify(props.region));
    //     const lati1 = reduce(props.region.latitude - 2 * props.region.latitudeDelta);
    //     const lati2 = reduce(props.region.latitude + 2 * props.region.latitudeDelta);
    //     const longi1 = reduce(props.region.longitude - 2 * props.region.longitudeDelta);
    //     const longi2 = reduce(props.region.longitude + 2 * props.region.longitudeDelta);
    //     const latiMin = Math.min(lati1, lati2);
    //     const latiMax = Math.max(lati1, lati2);
    //     const longiMin = Math.min(longi1, longi2);
    //     const longiMax = Math.max(longi1, longi2);
    //     console.log("latiMin", latiMin, "latiMax", latiMax);
    //     console.log("longiMin", longiMin, "longiMax", longiMax);
        // for (let longitude = longiMin; longitude <= longiMax; longitude += 0.0005) {
        //     for (let latitude = latiMin; latitude <= latiMax; latitude += 0.0005) {
        //         polygons.push([
        //             {latitude: latitude, longitude: longitude},
        //             {latitude: latitude + 0.00005, longitude: longitude},
        //             {latitude: latitude + 0.00005, longitude: longitude + 0.00005},
        //             {latitude: latitude, longitude: longitude + 0.00005}
        //         ]);
        //     }
        // }
    // }
    // console.log("[INFO] Nb Polygons: ", polygons.length);

    return (
        <View>
        <MapView
            style={{ width, height }}
            region={props.region}
            onRegionChange={props.onRegionChange}
            showsMyLocationButton={true}
            zoomControlEnabled={true}
            >
                {props.locations.map((location: LatLng, idx: number) => {
                    let fillColor = colorBase;
                    if (props.isLocationHidden(idx)) {
                        fillColor = colorHidden;
                    } else {
                    }
                    // console.log("create polygon at", location);
                    return (
                        <Polygon 
                        key={idx}
                        coordinates={[
                            {latitude: location.latitude, longitude: location.longitude},
                            {latitude: location.latitude, longitude: location.longitude + offsetLongi},
                            {latitude: location.latitude + offsetLati, longitude: location.longitude + offsetLongi},
                            {latitude: location.latitude + offsetLati, longitude: location.longitude}
                        ]}
                        fillColor={fillColor}
                        tappable={true}
                        onPress={props.onPressPolygon(idx)}
                        />
                    );}
                )}
                </MapView>
                <TouchableOpacity
                style={styles.zoomIn}
                onPress={()=>{props.onPressZoomIn()}}
                >
                <Icon 
                    name="md-add-circle"
                    style={styles.icon}
                    />
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.zoomOut}
                onPress={()=>{props.onPressZoomOut()}}
                >
                <Icon 
                    name="md-remove-circle" 
                    style={styles.icon}
                    />
            </TouchableOpacity>

            <Menu
                style={{position: "absolute", top:props.menuPosition.y, left:props.menuPosition.x, height: 100, backgroundColor: 'blue'}}
                opened={props.showMenu}
                onClose={props.closeMenu}
                onBackdropPress={props.closeMenu}
            >
            <MenuTrigger>
            </MenuTrigger>
            <MenuOptions>
              <MenuOption text={'Hide this location'} value={1} disabled={props.menuOption !== 1} onSelect={() => props.onClickMenuOption(1)}></MenuOption>
              <MenuOption text={'Reveal this location'} value={0} disabled={props.menuOption !== 0} onSelect={() => props.onClickMenuOption(0)}></MenuOption>
            </MenuOptions>
          </Menu>
          </View>
    );
};

const styles = StyleSheet.create({
    zoomIn:     {
        position: 'absolute',
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        right: 0,
        bottom: 120,
    },
    zoomOut: {
        position: 'absolute',
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        right: 0,
        bottom: 80,
    },
    icon: {
        fontSize: 36
    }
})
export default MapComponent;
  
