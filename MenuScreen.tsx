import React, { PureComponent, Component } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, View } from 'react-native';
import {
    Container,
    Header,
    Title,
    Content,
    Left,
    Right,
    Body,
    Button,
    Icon,
    List,
    ListItem,
    Text
  } from 'native-base';
import * as Font from 'expo-font';
import { Ionicons, Fontisto } from '@expo/vector-icons';
  

class MenuScreen extends Component {

    state = {
        loading: true
    }

    async componentDidMount() {
        await Font.loadAsync({
            'Roboto': require('native-base/Fonts/Roboto.ttf'),
            'Roboto_medium': require('native-base/Fonts/Roboto_medium.ttf'),
            ...Ionicons.font,
        })
        this.setState({ loading: false })
    }
    
    navigate(scene: any) {
        const { navigation }: any = this.props;
        navigation.navigate(scene);
    }

    goBack() {
        const { navigation }: any = this.props;
        navigation.goBack();
    }
    
    render() {
        if (this.state.loading) {
            return (
              <View></View>
            );
        }
        return (
            <Container>
        <Content>
          <List style={{ flex: 1, backgroundColor: '#fff' }}>
            <ListItem icon onPress={() => this.navigate('Check')}>
              <Left>
                <Icon type="Feather" name="user-check" style={styles.iconStyle} />
              </Left>
              <Body>
                <Text>Check Infection Status</Text>
              </Body>
            </ListItem>
            <ListItem icon onPress={() => this.navigate('Publish')}>
              <Left>
                <Icon type="FontAwesome" name="cloud-upload" style={styles.iconStyle} />
              </Left>
              <Body>
                <Text>Publish Locations</Text>
              </Body>
            </ListItem>
            <ListItem icon>
              <Left>
                <Icon name="ios-construct" style={styles.iconStyle} />
              </Left>
              <Body>
                <Text>Show App Settings</Text>
              </Body>
            </ListItem>
            <ListItem icon>
              <Left>
                <Icon name="ios-compass" style={styles.iconStyle} />
              </Left>
              <Body>
                <Text>Show Location Settings</Text>
              </Body>
            </ListItem>
          </List>
        </Content>
      </Container>
        );
    };
}

const styles = StyleSheet.create({
    iconStyle: {
      color: '#0A69FE',
      fontSize: 36,
      width: 40,
      padding: 0
    }
  });
  

// Wrap and export for calling from navigator
export default function(props: any) {
    const navigation = useNavigation();

    return <MenuScreen {...props} navigation={navigation} />;
}