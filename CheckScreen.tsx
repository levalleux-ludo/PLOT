import React, { Component } from 'react';
import { Text } from 'react-native';
import { View } from 'native-base';
import { useNavigation } from '@react-navigation/native';

interface MyState {}

class CheckScreen extends Component {
    state: MyState = {}

    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <View>
            <Text>CheckScreen works !</Text>
            </View>
        );
    }
}

// Wrap and export
export default function(props: any) {
    const navigation = useNavigation();
  
    return <CheckScreen {...props} navigation={navigation} />;
  }
  