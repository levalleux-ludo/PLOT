import React, { Component } from 'react';
import MapView, { Marker, Circle, Region, AnimatedRegion, LatLng, Polygon } from 'react-native-maps';
import { Dimensions, TouchableOpacity, StyleSheet } from 'react-native';
import { Fab, Icon, View } from 'native-base';
const TrackingDot = require('./res/TrackingDot.png');

function reduce(coord: number): number {
    return Math.floor(coord * 20000)/20000; // reduce at 0.00005
}

interface MyProps {
    children: any[], // only to avoid compiler error
    locations: LatLng[],
    region: Region | undefined,
    onRegionChange: (region: Region) => void,
    onPressZoomIn: () => void,
    onPressZoomOut: () => void
}

const MapComponent = (props: MyProps) => {
    const { height, width } = Dimensions.get('window');
    const polygons = [];
    if (props.region && (props.region.latitudeDelta < 0.0001) && (props.region.longitudeDelta < 0.0001)) {
        console.log("region", JSON.stringify(props.region));
        const lati1 = reduce(props.region.latitude - 2 * props.region.latitudeDelta);
        const lati2 = reduce(props.region.latitude + 2 * props.region.latitudeDelta);
        const longi1 = reduce(props.region.longitude - 2 * props.region.longitudeDelta);
        const longi2 = reduce(props.region.longitude + 2 * props.region.longitudeDelta);
        const latiMin = Math.min(lati1, lati2);
        const latiMax = Math.max(lati1, lati2);
        const longiMin = Math.min(longi1, longi2);
        const longiMax = Math.max(longi1, longi2);
        console.log("latiMin", latiMin, "latiMax", latiMax);
        console.log("longiMin", longiMin, "longiMax", longiMax);
        for (let longitude = longiMin; longitude <= longiMax; longitude += 0.00005) {
            for (let latitude = latiMin; latitude <= latiMax; latitude += 0.00005) {
                polygons.push([
                    {latitude: latitude, longitude: longitude},
                    {latitude: latitude + 0.00005, longitude: longitude},
                    {latitude: latitude + 0.00005, longitude: longitude + 0.00005},
                    {latitude: latitude, longitude: longitude + 0.00005}
                ]);
            }
        }
    }
    console.log("[INFO] Nb Polygons: ", polygons.length);

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
                    // console.log("create polygon at", location);
                    return (
                        <Polygon 
                        key={idx}
                        coordinates={[
                            {latitude: location.latitude, longitude: location.longitude},
                            {latitude: location.latitude, longitude: location.longitude + 0.00005},
                            {latitude: location.latitude + 0.00005, longitude: location.longitude + 0.00005},
                            {latitude: location.latitude + 0.00005, longitude: location.longitude}
                        ]}
                        fillColor={"rgba(128,128,255,0.9)"}
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
  
