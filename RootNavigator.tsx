import * as React from 'react';
import { createStackNavigator, StackHeaderLeftButtonProps } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { StyleSheet } from 'react-native';
import HomeScreen from './HomeScreen';
import DetailsScreen from './DetailsScreen';
import MenuScreen from './MenuScreen';
import MainScreen from './MainScreen';
import BloomFilterScreen from './BloomFilterScreen';
import CheckScreen from './CheckScreen';
import PublishScreen from './PublishScreen';
import { View, Button, Icon, Text, Right, Body, Left } from 'native-base';


const Stack = createStackNavigator();

function RootNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Main">
                <Stack.Screen name="Main" component={MainScreen} options={{ header: () => null }}/>
                <Stack.Screen name="Home" component={HomeScreen}
                 options={{ title: 'Overview',
                 headerStyle: {
                   backgroundColor: '#f4511e',
                 },
                 headerTintColor: '#fff',
                 headerTitleStyle: {
                   fontWeight: 'bold',
                 }, }}/>
                <Stack.Screen name="Services" component={MenuScreen} />
                <Stack.Screen name="Publish" component={PublishScreen} />
                <Stack.Screen name="Check" component={CheckScreen} />
                <Stack.Screen name="Details" component={DetailsScreen}  options={{ header: () => null }}/>
                <Stack.Screen name="BloomFilters" component={BloomFilterScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    )
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

  
export default RootNavigator;