import React, { Component } from 'react';
import { Container, Content, Footer, FooterTab, Button, Icon } from 'native-base';
import { StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker, Circle } from 'react-native-maps';

class MainScreen extends Component {

    constructor(props: any) {
        super(props);
        this.state = {
          region: null,
          locations: [],
          stationaries: [],
          isRunning: false
        };
    
        this.goToSettings = this.goToSettings.bind(this);
    }

    goToSettings() {
        const { navigation }: any = this.props;
        navigation.navigate('Menu');
    }

    toggleTracking() {

    }
    
    render() {
        const { height, width } = Dimensions.get('window');
        const { locations, stationaries, region, isRunning }: any = this.state;
        return (
            <Container>
                <Content>
                  <MapView style={{ width, height }} region={region}>
                  </MapView>
                </Content>
                <Footer style={styles.footer}>
                <FooterTab>
                    <Button onPress={this.toggleTracking}>
                    <Icon name={isRunning ? 'pause' : 'play'} style={styles.icon} />
                    </Button>
                    <Button onPress={this.goToSettings}>
                    <Icon name="menu" style={styles.icon} />
                    </Button>
                </FooterTab>
                </Footer>
            </Container>
        )
    }
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
  
// Wrap and export
export default function(props: any) {
    const navigation = useNavigation();
  
    return <MainScreen {...props} navigation={navigation} />;
  }
  