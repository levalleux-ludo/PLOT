import React, { Component } from 'react';
import MapView, { Marker, Circle, Region, AnimatedRegion, LatLng, Polygon } from 'react-native-maps';
import { Dimensions } from 'react-native';
const TrackingDot = require('./res/TrackingDot.png');

function reduce(coord: number): number {
    return Math.floor(coord * 20000)/20000; // reduce at 0.00005
}

const MapComponent = (props: {locations: Location[], region: Region}) => {
    const { height, width } = Dimensions.get('window');
    const polygons = [];
    if (props.region) {
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
        <MapView style={{ width, height }} region={props.region}>
                {props.locations.map((location: Location, idx: number) => (
                    <Marker
                    key={idx}
                    coordinate={location}
                    image={TrackingDot}
                    />
                ))}
                {polygons.map((polygon: LatLng[]) => (
                    <Polygon 
                    coordinates={polygon}
                    fillColor={"rgba(128,128,255,0.5)"}
                    strokeColor={"rgba(128,255,128,0.5)"}
                    strokeWidth={5}
                    />
                ))}
                </MapView>
    );
};

export default MapComponent;
  
