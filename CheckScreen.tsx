import React, { Component } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Text, View, Accordion, Icon, List, ListItem, Left, Right, Body } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { LocationArea } from './LocationService';
import LocationRecorder, { today, dayBefore, addDays } from './LocationRecorder';
import { BloomFilterService } from './BloomFilterService';
import { Table, TableWrapper, Row } from 'react-native-table-component';
import { BloomFilter } from 'bloomfilter';
import Spinner from 'react-native-spinkit';

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

class CheckScreen extends Component {
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

    async generateBloomFilter(data: DataItem): Promise<BloomFilter>{
      return new Promise((resolve, reject) => {
        try {
          setTimeout(() => {
            const bloomFilter = new BloomFilter(0,0)
            resolve(bloomFilter);
          }, 2000);
        } catch (e) {reject(e)};
      });
    }

    async getGlobalRecord(day: Date): Promise<BloomFilter>{
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(new BloomFilter(0,0));
        }, 2000);
      });
    }

    async compare(day: Date, bloomFilter: BloomFilter, globalRecord: BloomFilter): Promise<number> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
              resolve(12);
            }, 2000);
        });
    }

    loadRecord(
        dayStart: Date,
        nbDaysBackwards: number,
        callback: (data: DataItem, index: number, next: () => void) => void
    ) {
        const recorder = new LocationRecorder();
        const dayEnd = addDays(dayStart, -nbDaysBackwards);
        this.recursiveLoadRecord(
            recorder,
            dayStart,
            dayEnd,
            -1,
            0,
            callback
        );
    }

    recursiveLoadRecord(
        recorder: LocationRecorder,
        dayStart: Date,
        dayEnd: Date,
        dayIncrement: number,
        index: number,
        callback: (data: DataItem, index: number, next: () => void) => void) {
        const onLocations = (day: Date, locations: LocationArea[], index: number) => {
            console.log(`Get ${locations.length} locations for day ${day.toDateString()}`);
            callback({
                day: day,
                selected: false,
                completed: false,
                computing: false,
                downloading: false,
                comparing: false,
                error: false,
                status: '',
                nbContacts: 0
            }, index, () => {
              if (day.getUTCDate() !== dayEnd.getUTCDate()) {
                index++;
                this.recursiveLoadRecord(recorder, dayStart, dayEnd, dayIncrement, index, callback);
              } else {
                  console.log(`loadRecord finished for day ${day.toDateString()}, index=${index}`);
              }
            });
        }
        const day = addDays(dayStart, index * dayIncrement);
        recorder.recordExists(day).then(exists => {
          if (exists) {
            recorder.getLocations(day).then(locations => {
                onLocations(day, locations, index);
            }).catch(e => console.error(e));
          } else {
            onLocations(day, [], index);
            }
        }).catch(e => console.error(e));
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
              this.generateBloomFilter(data).then((bloomFilter) => {
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
                    this.compare(day, bloomFilter, globalRecord).then((nbContacts) => {
                        data.nbContacts = nbContacts;
                        onCompleted(dataArray, 'nb contacts:');
                    }).catch(e => {
                        onCompleted(dataArray, '', e);
                    });
                }).catch(e => {
                  onCompleted(dataArray, '', e);
                });
              }).catch(e => {
                onCompleted(dataArray, '', e);
              });
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
  