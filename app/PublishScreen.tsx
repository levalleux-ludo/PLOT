import React, { Component } from 'react';
import { StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, View, Accordion, Icon, List, ListItem, Left, Right, Body } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { LocationArea } from './LocationService';
import LocationRecorder, { today, dayBefore, addDays } from './LocationRecorder';
import { BloomFilterService } from './BloomFilterService';
import { Table, TableWrapper, Row } from 'react-native-table-component';
import { BloomFilter } from 'bloomfilter';
import Spinner from 'react-native-spinkit';
import fetchService from './FetchService';
import { CheckPublishAbstract } from './CheckPublishAbstract';

interface DataItem {
  day: Date;
  selected: boolean;
  completed: boolean;
  computing: boolean;
  publishing: boolean;
  error: boolean;
  status: string;
}
interface MyState {
    dataArray: DataItem[],
    loaded: boolean[],
    loading: boolean[]
  }

class PublishScreen extends CheckPublishAbstract {
    state: MyState = {
        dataArray: [],
        loaded: [],
        loading: []      
    };

    constructor(props: any) {
        super(props);
    }

    getState(): MyState {
      return this.state;
    }

    async publish(day: Date, bloomFilter: BloomFilter): Promise<void>{
      return new Promise((resolve, reject) => {
        fetchService.publishRecord(day, bloomFilter).then(() => {
          setTimeout(() => resolve(), 0);
          // resolve();
        }).catch(e => {
          console.error(e);
          reject(e);
        });
      });
    }

    componentDidMount() {
        const dayStart = today();
        const dayEnd = addDays(dayStart, -15);
        this.loadRecord(
          dayStart,
          15,
          (data: DataItem, index: number, next: () => void) => {
              const onCompleted = (dataArray: DataItem[], status: string, e?: Error) => {
                if (e) {
                  data.error = true;
                  console.error(e);
                } else {
                  data.error = false;
                }
                data.status = status;
                data.completed = true;
                data.computing = false;
                data.publishing = false;
                data.selected = false;
                this.setState(dataArray);
                next();
              };
              const {dataArray, loaded, loading} = this.getState();
              dataArray[index] = data;
              loaded[index] = false;
              loading[index] = false;
              data.status = 'computing...';
              data.computing = true;
              data.selected = true;
              this.setState({dataArray, loaded, loading});
              const day = data.day;
              this.generateBloomFilter(day).then((bloomFilter) => {
                data.error = false;
                data.completed = false;
                data.computing = false;
                data.publishing = true;
                data.status = 'publishing...';
                this.setState(dataArray);
                this.publish(day, bloomFilter).then((result) => {
                  onCompleted(dataArray, 'published');
                }).catch(e => {
                  onCompleted(dataArray, '', e);
                });
              }).catch(e => {
                onCompleted(dataArray, '', e);
              });
          },
          () => {
            Alert.alert('Thank you !', 'Your personal location record has been published successfully.');
          }
      );
    }
  
    render() {
        const {dataArray} = this.state;
        return (
          <View>
            <ScrollView>
              <View>
                  <List>
                  {
                    dataArray.map((data, index) => (
                      <ListItem selected={data.selected} key={index}>
                        <Left style={styles.left}>
                          <Text>{data.day.toDateString()}</Text>
                        </Left>
                        <Body>
                          <Text>{data.status}</Text>
                        </Body>
                        <Right>
                          <Text> {
                          (data.error) ? <Icon type="MaterialIcons" name="error"></Icon>
                          : (data.completed) ? <Icon type="FontAwesome" name="check-square-o"></Icon>
                          : (data.computing) ? <Spinner color='blue' type="9CubeGrid" />
                          : (data.publishing) ? <Spinner color='blue' type="ThreeBounce"/>
                          : '?' }
                          </Text>
                        </Right>
                      </ListItem>
                    ))
                  }
                </List>
              </View>
            </ScrollView>
          </View>
        );
    }
}


const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, paddingTop: 0, backgroundColor: '#fff' },
    header: { height: 50, backgroundColor: '#537791' },
    text: { textAlign: 'center', fontSize: 8, fontWeight: '100' },
    dataWrapper: { marginTop: -1 },
    row: { height: 8, backgroundColor: '#E7E6E1' },
    left: {},
    right: {}
  });
  

// Wrap and export
export default function(props: any) {
    const navigation = useNavigation();
  
    return <PublishScreen {...props} navigation={navigation} />;
  }
  