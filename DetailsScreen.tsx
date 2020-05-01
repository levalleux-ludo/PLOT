import React, { Component } from 'react';
import { View, Text, Button } from "react-native";
import { useNavigation } from '@react-navigation/native';

// const DetailsScreen = ({navigation}: any) => (
//     <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center'}}>
//         <Text>Details Screen</Text>
//         <Button title="Go to Details ... again"
//         onPress={() => navigation.push('Details')} />
//         <Button title="Go to Home"
//         onPress={() => navigation.navigate('Home')} />
//         <Button title="Go back"
//         onPress={() => navigation.goBack()} />
//     </View>
// );

// export default DetailsScreen;

class DetailsScreen extends Component {


    render() {
        const { navigation }: any = this.props;
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Text>Details Screen 2</Text>
            <Button title="Go to Details ... again"
            onPress={() => navigation.push('Details')} />
            <Button title="Go to Home"
            onPress={() => navigation.navigate('Home')} />
            <Button title="Go back"
            onPress={() => navigation.goBack()} />
        </View>
        );
    }
}
// Wrap and export
export default function(props: any) {
    const navigation = useNavigation();
  
    return <DetailsScreen {...props} navigation={navigation} />;
  }
  