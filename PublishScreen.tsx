import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import { Text, View, Accordion, Icon } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { LocationArea } from './LocationService';
import LocationRecorder, { today } from './LocationRecorder';
import { BloomFilterService } from './BloomFilterService';
import { Table, TableWrapper, Row } from 'react-native-table-component';

interface MyState {
    locations: LocationArea[],
    dataArray: any[]
}

class PublishScreen extends Component {
    state: MyState = {
        locations: [],
        dataArray: []
    };

    constructor(props: any) {
        super(props);
    }

    componentDidMount() {
        const recorder = new LocationRecorder();
        const dataArray: any[] = [];
        const day = today();
        recorder.getLocations(day).then(locations => {
            dataArray.push({
                title: day.toDateString(),
                content: locations
            })
            this.setState({locations, dataArray});
        })
        // LocationService.onLocationChanged.attach((area) => {
        //   console.log("LocationService.onLocationChanged", area);
        //     this.refreshRegion(area.toLatLng());
        // });
        // LocationService.onStatusChanged.attach((running) => {
        //   this.setState({ isRunning: running });
        // })
        // if (LocationService.lastLocation) {
        //   this.refreshRegion(LocationService.lastLocation.toLatLng());
        // }
        // this.onChangeDay(this.state.currentDay);
      }
  
      onChangeDay(currentDay: Date) {
        // const recorder = new LocationRecorder();
        // const hasDayAfter = recorder.recordExists(dayAfter(currentDay));
        // const hasDayBefore = recorder.recordExists(dayBefore(currentDay));
        // recorder.getLocations(currentDay).then(locations => {
        //   if (locations && (locations.length > 0)) {
        //     this.refreshRegion(locations[0].toLatLng());
        //     this.setState({hasDayAfter, hasDayBefore, locations});
        //   }
        // }).catch(error => console.error(error));
      }
    
      _renderHeader(item: any, expanded: boolean) {
        return (
          <View style={{
            flexDirection: "row",
            padding: 10,
            justifyContent: "space-between",
            alignItems: "center" ,
            backgroundColor: "#A9DAD6" }}>
          <Text style={{ fontWeight: "600" }}>
              {" "}{item.title}
            </Text>
            {expanded
              ? <Icon style={{ fontSize: 18 }} name="remove-circle" />
              : <Icon style={{ fontSize: 18 }} name="add-circle" />}
          </View>
        );
      }
      _renderContent(item: any) {
        const tableData: any[] = [];
        const locations = item.content;
        const nbColumns = 4;
        const colWidth: number[] = [];
        if (locations && locations.length) {
              const bloomFilter = BloomFilterService.createBloomFilter(locations);
              let rowData: any[] = [];
              bloomFilter.buckets.forEach((value: number, index: number) => {
                rowData.push(value.toString(16));
                if (index < nbColumns) {
                    colWidth.push(68);
                }
                if (index % nbColumns === nbColumns - 1) {
                    tableData.push(rowData);
                    rowData = [];
                }
              })
        }
        const tableData1: any[] = [];
        const nbColumns1 = 64;
        const colWidth1: number[] = [];
        if (locations && locations.length) {
              const bloomFilter = BloomFilterService.createBloomFilter(locations);
              let rowData: any[] = [];
              bloomFilter.buckets.forEach((value: number, index: number) => {
                  for (let bit = 0; bit < 32; bit++) {
                    rowData.push(
                        (value & (1 << bit)) ? 'x': ''
                    );
                    const index1 = index * 32 + bit;
                    if (index1 < nbColumns1) {
                        colWidth1.push(6);
                    }
                    if (index1 % nbColumns1 === nbColumns1 - 1) {
                        tableData1.push(rowData);
                        rowData = [];
                    }
                }
              })
        }

        return (
            <View>
            <Table borderStyle={{borderWidth: 1, borderColor: '#C1C0B9'}}>
            {
              tableData.map((rowData, index) => (
                <Row
                  key={index}
                  data={rowData}
                  widthArr={colWidth}
                  style={[styles.row, index%2 && {backgroundColor: '#F7F6E7'}]}
                  textStyle={styles.text}
                />
              ))
            }
          </Table>
          <Table borderStyle={{borderWidth: 1, borderColor: '#C1C0B9'}}>
          {
            tableData1.map((rowData, index) => (
              <Row
                key={index}
                data={rowData}
                widthArr={colWidth1}
                style={[styles.row, index%2 && {backgroundColor: '#F7F6E7'}]}
                textStyle={styles.text}
              />
            ))
          }</Table>
          </View>
        );
      }
      
    render() {
        // const dataArray = [
        //     {title: 'toto', content: "TOTO"},
        //     {title: 'titi', content: "TITI"}
        // ]
        const {dataArray} = this.state;
        return (
            <View>
            <Text>PublishScreen works !</Text>
            <Accordion 
                dataArray={dataArray}
                expanded={0}
                renderHeader={this._renderHeader}
                renderContent={this._renderContent}
            ></Accordion>
            </View>
        );
    }
}


const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, paddingTop: 0, backgroundColor: '#fff' },
    header: { height: 50, backgroundColor: '#537791' },
    text: { textAlign: 'center', fontSize: 8, fontWeight: '100' },
    dataWrapper: { marginTop: -1 },
    row: { height: 8, backgroundColor: '#E7E6E1' }
  });
  

// Wrap and export
export default function(props: any) {
    const navigation = useNavigation();
  
    return <PublishScreen {...props} navigation={navigation} />;
  }
  