import React, { Component } from 'react';
import MapView, { Marker, Circle, Region, AnimatedRegion } from 'react-native-maps';
import { Dimensions } from 'react-native';
const TrackingDot = require('./res/TrackingDot.png');

const MapComponent = (props: {locations: Location[], region: Region}) => {
    const { height, width } = Dimensions.get('window');
    return (
        <MapView style={{ width, height }} region={props.region}>
                {props.locations.map((location: Location, idx: number) => (
                    <Marker
                    key={idx}
                    coordinate={location}
                    image={TrackingDot}
                    />
                ))}
                </MapView>
    );
};

export default MapComponent;
  