import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from './HomeScreen';
import DetailsScreen from './DetailsScreen';
import MenuScreen from './MenuScreen';
import MainScreen from './MainScreen';


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
                <Stack.Screen name="Menu" component={MenuScreen} />
                <Stack.Screen name="Details" component={DetailsScreen}  options={{ header: () => null }}/>
            </Stack.Navigator>
        </NavigationContainer>
    )
}

  
export default RootNavigator;