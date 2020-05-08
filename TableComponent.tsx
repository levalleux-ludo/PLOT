import React, { Component } from 'react';
import { View, Spinner } from 'native-base';
import { Text, ScrollView, StyleSheet } from 'react-native';
import { Table, TableWrapper, Row } from 'react-native-table-component';
import { LocationArea } from './LocationService';
import asyncComponent from './asyncComponent';


interface MyProps {
    children: any[], // only to avoid compiler error
    locationAreas: LocationArea[],
    tableHead: string[],
    colWidth: number[],
    getValueAtCol: (locationArea: LocationArea, colIndex: number) => any,
    getRowStyle: (locationArea: LocationArea) => any
}

async function load(): Promise<any> {
    return new Promise((resolve, reject) => {
        resolve();
    });
}

const AsyncTable = asyncComponent((props: MyProps) => {
    return new Promise((resolve, reject) => {
        resolve((<View></View>));
    });
});

const TableComponent = (props: MyProps) => {
    const tableData = [];
    if (props.locationAreas) {
        for (const locationArea of props.locationAreas) {
            const rowData = [];
            if (props.tableHead) {
                for (let col = 0; col < props.tableHead.length; col++) {
                    rowData.push(props.getValueAtCol ? props.getValueAtCol(locationArea, col) : 'N/A');
                }
            }
            tableData.push({rowStyle: props.getRowStyle(locationArea), rowData});
        }
    }
    let isLoading = true;
    const table = (
        <Table borderStyle={{borderWidth: 1, borderColor: '#C1C0B9'}}>
        {
          tableData.map(({rowStyle,rowData}, index) => (
            <Row
              key={index}
              data={rowData}
              widthArr={props.colWidth}
              style={[styles.row, index%2 && {backgroundColor: '#F7F6E7'}, rowStyle]}
              textStyle={styles.text}
            />
          ))
        }
      </Table>
    );
    isLoading = false;
    return (
        <View style={styles.container}>
        <ScrollView horizontal={true} style={{overflow: "hidden"}}>
          <View>
            <Table borderStyle={{borderWidth: 1, borderColor: '#C1C0B9'}}>
              <Row data={props.tableHead} widthArr={props.colWidth} style={styles.header} textStyle={styles.text}/>
            </Table>
            <ScrollView style={styles.dataWrapper}>
                { isLoading ? <Spinner /> : table}
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, paddingTop: 0, backgroundColor: '#fff' },
    header: { height: 50, backgroundColor: '#537791' },
    text: { textAlign: 'center', fontWeight: '100' },
    dataWrapper: { marginTop: -1 },
    row: { height: 40, backgroundColor: '#E7E6E1' }
  });
  

export default TableComponent;
// export default asyncComponent((props) => {
//     return new Promise((resolve, reject) => {
//         resolve(TableComponent(props));
//     });
// });
