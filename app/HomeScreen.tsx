import React from 'react';
import { View, Text, Button } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { Icon } from 'native-base';
import { StyleSheet } from 'react-native';


const HomeScreen = ({ navigation }: any) => {
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Text>Home Screen 2</Text>
            <FontAwesome5 name={'comments'} />
            <Button title="Go to Details"
            onPress={() => navigation.navigate('Details')} />
            <Button title="Menu"
            onPress={() => navigation.navigate('Menu')} />
        </View>
    )
}

const styles = StyleSheet.create({
    iconStyle: {
      color: '#0A69FE'
    }
  });

export default HomeScreen;