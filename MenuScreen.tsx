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
import { Ionicons } from '@expo/vector-icons';
  

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
        <Header>
          <Left>
            <Button transparent onPress={() => this.goBack()}>
              <Icon name="arrow-back" style={styles.iconStyle} />
            </Button>
          </Left>
          <Body>
            <Title>Menu</Title>
          </Body>
          <Right />
        </Header>
        <Content>
          <List style={{ flex: 1, backgroundColor: '#fff' }}>
            <ListItem icon onPress={() => this.navigate('Logs')}>
              <Left>
                <Icon name="ios-archive" style={styles.iconStyle} />
              </Left>
              <Body>
                <Text>Plugin Logs</Text>
              </Body>
            </ListItem>
            <ListItem icon onPress={() => this.navigate('AllLocations')}>
              <Left>
                <Icon name="ios-planet" style={styles.iconStyle} />
              </Left>
              <Body>
                <Text>All Locations</Text>
              </Body>
            </ListItem>
            <ListItem icon onPress={() => this.navigate('PendingLocations')}>
              <Left>
                <Icon name="ios-planet" style={styles.iconStyle} />
              </Left>
              <Body>
                <Text>Pending Locations</Text>
              </Body>
            </ListItem>
            <ListItem icon onPress={() => this.navigate('Config')}>
              <Left>
                <Icon name="ios-settings" style={styles.iconStyle} />
              </Left>
              <Body>
                <Text>Plugin Configuration</Text>
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
      color: '#0A69FE'
    }
  });
  

// Wrap and export for calling from navigator
export default function(props: any) {
    const navigation = useNavigation();

    return <MenuScreen {...props} navigation={navigation} />;
}