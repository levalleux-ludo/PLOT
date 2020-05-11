import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import { Text, View, Accordion, Icon, Item, Spinner } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { LocationArea } from './LocationService';
import LocationRecorder, { today, dayBefore, addDays } from './LocationRecorder';
import { BloomFilterService } from './BloomFilterService';
import { Table, TableWrapper, Row } from 'react-native-table-component';

interface ItemContent {
  index: number,
  loaded: boolean,
  loading: boolean,
  locations: LocationArea[],
  tableData: any[],
  colWidth: number[],
  view: JSX.Element
}

interface ItemData {
  title: any,
  content: ItemContent
}

interface MyState {
  dataArray: ItemData[],
  loaded: boolean[],
  loading: boolean[]
}

class BloomFilterScreen extends Component {
    state: MyState = {
        dataArray: [],
        loaded: [],
        loading: []
    };

    constructor(props: any) {
        super(props);
        this._renderContent = this._renderContent.bind(this);
    }

    loadRecord(
      dayStart: Date,
      nbDaysBackwards: number,
      callback: (data: {day: Date, title: string, locations: LocationArea[]}, index: number) => void
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
      callback: (data: {day: Date, title: string, locations: LocationArea[]}, index: number) => void) {
      const onLocations = (day: Date, locations: LocationArea[], index: number) => {
          console.log(`Get ${locations.length} locations for day ${day.toDateString()}`);
          callback({
              day: day,
              title: day.toDateString(),
              locations: locations
          }, index);
          if (day.getUTCDate() !== dayEnd.getUTCDate()) {
              index++;
              this.recursiveLoadRecord(recorder, dayStart, dayEnd, dayIncrement, index, callback);
          } else {
              console.log(`loadRecord finished for day ${day.toDateString()}, index=${index}`);
          }
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
          (data: {day: Date, title: string, locations: LocationArea[]}, index: number) => {
              const {dataArray, loaded, loading} = this.getState();
              dataArray[index] = {
                  title: data.title,
                  content: {
                    index: index,
                    loaded: false,
                    loading: false,
                    locations: data.locations,
                    tableData: [],
                    colWidth: []
                  }
              };
              loaded[index] = false;
              loading[index] = false;
              this.setState({dataArray, loaded, loading});
          }
      );
    }

    getState(): MyState {
      return this.state;
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
      buildTableData(locations: LocationArea[]): {tableData: any[], colWidth: number[]} {
        const tableData: any[] = [];
        const nbColumns = 64;
        const colWidth: number[] = [];
        if (locations && locations.length) {
          const bloomFilter = BloomFilterService.createBloomFilter(locations);
          let rowData: any[] = [];
          bloomFilter.buckets.forEach((value: number, index: number) => {
            for (let bit = 0; bit < 32; bit++) {
              rowData.push(
                  (value & (1 << bit)) ? 'x': ''
              );
              const index1 = index * 32 + bit;
              if (index1 < nbColumns) {
                  colWidth.push(6);
              }
              if (index1 % nbColumns === nbColumns - 1) {
                  tableData.push(rowData);
                  rowData = [];
              }
            }
          })
        }
        return {tableData, colWidth};
      }
      async asyncBuildTable(
        locations: LocationArea[],
        preCallback?: () => void
      ): Promise<{tableData: any[], colWidth: number[]}> {
        console.log("Launch asyncBuildTable");
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            if (preCallback) {
              preCallback();
            }
            resolve(this.buildTableData(locations));
          }, 0);
        });
      }
      _renderContent(item: ItemData) {
        const {loaded, loading} = this.state;
        console.log('loaded', loaded[item.content.index], 'loading', loading[item.content.index]);
        if (loaded[item.content.index]) {
          const tableData: any[] = item.content.tableData;
          const colWidth: number[] = item.content.colWidth;
          console.log('Return recorded view for day', item.content.view);
          return item.content.view;
        } else {
          if (!loading[item.content.index]) {
            this.asyncBuildTable(
              item.content.locations,
              () => {
                const {dataArray, loaded, loading} = this.getState();
                const itemData = dataArray[item.content.index];
                itemData.content.loading = true;
                item.content.loading = true;
                loading[item.content.index] = true;
                this.setState({dataArray, loaded, loading});
              }
            ).then(({tableData, colWidth}) => {
              const {dataArray, loaded, loading} = this.getState();
              const itemData = dataArray[item.content.index];
              itemData.content.loaded = true;
              item.content.loaded = true;
              loaded[item.content.index] = true;
              loading[item.content.index] = false;
              itemData.content.loading = false;
              item.content.loading = false;
              itemData.content.tableData = tableData;
              itemData.content.colWidth = colWidth;
              itemData.content.view = (
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
                  }</Table>
                </View>
              );
              this.setState({dataArray, loaded, loading});
            });            
          }
          return (
            <View>
              <Spinner></Spinner>
              <Text>Building BloomFilter ...</Text>
            </View>
          )
        }
      }
      
    render() {
        // const dataArray = [
        //     {title: 'toto', content: "TOTO"},
        //     {title: 'titi', content: "TITI"}
        // ]
        const {dataArray} = this.state;
        return (
            <View>
            <Text>BloomFilters works !</Text>
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
  
    return <BloomFilterScreen {...props} navigation={navigation} />;
  }
  