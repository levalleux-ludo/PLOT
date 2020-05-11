import React, { Component } from 'react';
import { StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, View, Accordion, Icon, List, ListItem, Left, Right, Body } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import LocationRecorder, { today, dayBefore, addDays } from './LocationRecorder';
import { BloomFilterService } from './BloomFilterService';
import { Table, TableWrapper, Row } from 'react-native-table-component';
import { BloomFilter } from 'bloomfilter';
import Spinner from 'react-native-spinkit';
import { CheckPublishAbstract } from './CheckPublishAbstract';
import fetchService from './FetchService';

interface DataItem {
  day: Date;
  selected: boolean;
  completed: boolean;
  computing: boolean;
  downloading: boolean;
  comparing: boolean;
  error: boolean;
  status: string;
  nbContacts: number;
}
interface MyState {
    dataArray: DataItem[],
    loaded: boolean[],
    loading: boolean[]
  }

class CheckScreen extends CheckPublishAbstract {
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

    async getGlobalRecord(day: Date): Promise<BloomFilter> {
        return new Promise((resolve, reject) => {
            fetchService.getGIRInfos().then(infos => {
                const nbHashes = infos.bloomFilter.nbHashes;
                fetchService.getGIR(day).then(gir => {
                    const bloomFilter = BloomFilterService.fromBuckets(gir, nbHashes);
                    setTimeout(() => resolve(bloomFilter), 0);
                }).catch(e => {
                    console.error(e);
                    reject(e);
                });
            }).catch(e => {
                console.error(e);
                reject(e);
            });
        });
    }

    async compare(day: Date, globalRecord: BloomFilter): Promise<number> {
        const recorder = new LocationRecorder();
        return new Promise((resolve, reject) => {
          recorder.recordExists(day).then(exists => {
            if (exists) {
                recorder.getLocations(day).then(locations => {
                    resolve(BloomFilterService.compare(locations, globalRecord));
                //   setTimeout(() => resolve(bloomFilter), 1);
                }).catch(e => {
                  console.error(e);
                  reject(e);
                });
            } else {
              const e = `No location record found for day ${day.toDateString()}`;
              console.error(e);
              reject(e);
            }
          }).catch(e => {
            console.error(e);
            reject(e);
          });
        });
    }

    componentDidMount() {
        const dayStart = today();
        const dayEnd = addDays(dayStart, -15);
        let cumulNbContact = 0;
        this.loadRecord(
          dayStart,
          15,
          // callback
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
                data.downloading = false;
                data.comparing = false;
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
                data.error = false;
                data.completed = false;
                data.computing = false;
                data.downloading = true;
                data.status = 'getting global record...';
                this.setState(dataArray);
                this.getGlobalRecord(day).then((globalRecord) => {
                    data.computing = false;
                    data.downloading = false;
                    data.comparing = true;
                    data.status = 'comparing...';
                    this.setState(dataArray);
                    this.compare(day, globalRecord).then((nbContacts) => {
                        data.nbContacts = nbContacts;
                        cumulNbContact += nbContacts;
                        onCompleted(dataArray, 'nb contacts:');
                    }).catch(e => {
                        onCompleted(dataArray, '', e);
                    });
                }).catch(e => {
                  onCompleted(dataArray, '', e);
                });
          },
          // next
          () => {
            Alert.alert(`Total nb of contacts with infectious people: ${cumulNbContact}`);
          }
      );
    }

    
    goBack() {
        const { navigation }: any = this.props;
        navigation.goBack();
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
                          : (data.completed) ? data.nbContacts
                          : (data.computing) ? <Spinner color='blue' type="9CubeGrid" />
                          : (data.downloading) ? <Spinner color='blue' type="ThreeBounce"/>
                          : (data.comparing) ? <Spinner color='blue' type="WanderingCubes"/>
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
  
    return <CheckScreen {...props} navigation={navigation} />;
  }
  