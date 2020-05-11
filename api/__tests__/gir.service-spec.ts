import girService from '../src/gir.service';
import { today, addDays, daysBetween, dayBefore } from '../src/utils';
import { GlobalInfectionRecord } from '../src/global-infection-record';
import * as fs from 'fs';

const day2 = today();
const day1 = addDays(day2, -15);

function valuesPerDay(): Map<number, number[]> {
  let value = 12345;
  const valuesMap = new Map();
  for (const day of daysBetween(day1, day2)) {
    const values = [];
    for (let i = 0; i < 5; i++) {
      values.push(value++);
    }
    valuesMap.set(day.valueOf(), values);
  }
  return valuesMap;
}

describe('test GIR.Service', () => {
  it('test girService exists', done => {
    expect(girService).toBeDefined();
    done();
  });
  it('test getInfos', done => {
    const infos = girService.getInfos();
    expect(infos).toBeDefined();
    expect(infos.minDay).toEqual(0);
    expect(infos.maxDay).toEqual(0);
    done();
  });
  it('test load nothing', done => {
    const rootFolder = './tmp/records';
    if (fs.existsSync(rootFolder)) {
      fs.rmdirSync(rootFolder, { recursive: true });
    }
    girService.load(day1.valueOf(), day2.valueOf(), rootFolder);
    const infos = girService.getInfos();
    expect(infos).toBeDefined();
    expect(infos.minDay).toEqual(day1.valueOf());
    expect(infos.maxDay).toEqual(day2.valueOf());
    for (const day of daysBetween(day1, day2)) {
      console.log('test day', day.toDateString());
      expect(girService.getNbRecords(day.valueOf())).toEqual(0);
    }
    done();
  });
  it('test add records', done => {
    // const rootFolder = './tmp/records';
    // if (fs.existsSync(rootFolder)) {
    //   fs.rmdirSync(rootFolder, {recursive: true});
    // }
    // girService.load(day1.valueOf(), day2.valueOf(), rootFolder);
    const infos = girService.getInfos();
    expect(infos).toBeDefined();
    expect(infos.minDay).toEqual(day1.valueOf());
    expect(infos.maxDay).toEqual(day2.valueOf());
    const valuesMap = valuesPerDay();
    const allDays = daysBetween(day1, day2);
    for (const day of allDays) {
      const values = valuesMap.get(day.valueOf());
      for (const value of values) {
        const gir = new GlobalInfectionRecord(
          infos.bloomFilter.sizeInBits,
          infos.bloomFilter.nbHashes
        );
        gir.add(value);
        girService.mergeIntoRecord(
          day.valueOf(),
          Array.from(gir.getBuckets().values())
        );
      }
      expect(girService.getNbRecords(day.valueOf())).toEqual(1);
    }
    done();
  });
  it('test store records', done => {
    const rootFolder = './tmp/records';
    if (fs.existsSync(rootFolder)) {
      fs.rmdirSync(rootFolder, { recursive: true });
    }
    // girService.load(day1.valueOf(), day2.valueOf(), rootFolder);
    const infos = girService.getInfos();
    expect(infos).toBeDefined();
    // expect(infos.minDay).toEqual(day1.valueOf());
    // expect(infos.maxDay).toEqual(day2.valueOf());
    const valuesMap = valuesPerDay();
    for (const day of daysBetween(day1, day2)) {
      const values = valuesMap.get(day.valueOf());
      for (const value of values) {
        const gir = new GlobalInfectionRecord(
          infos.bloomFilter.sizeInBits,
          infos.bloomFilter.nbHashes
        );
        gir.add(value);
        girService.mergeIntoRecord(
          day.valueOf(),
          Array.from(gir.getBuckets().values())
        );
      }
    }
    girService.store(rootFolder);
    const folders = fs.readdirSync(rootFolder);
    const allDays = daysBetween(day1, day2);
    expect(folders.length).toEqual(allDays.length);
    for (const day of allDays) {
      const folder = girService.getFolderForDay(day);
      const files = fs.readdirSync(folder);
      expect(files.length).toEqual(1);
    }
    done();
  });
  it('test load records', done => {
    const rootFolder = './tmp/records';
    expect(fs.existsSync(rootFolder)).toBe(true);
    girService.load(day1.valueOf(), day2.valueOf(), rootFolder);
    const infos = girService.getInfos();
    expect(infos).toBeDefined();
    expect(infos.minDay).toEqual(day1.valueOf());
    expect(infos.maxDay).toEqual(day2.valueOf());
    const valuesMap = valuesPerDay();
    for (const day of daysBetween(day1, day2)) {
      const values = valuesMap.get(day.valueOf());
      expect(girService.getNbRecords(day.valueOf())).toEqual(1);
      const gir = girService.getARecord(day.valueOf(), 0);
      for (const value of values) {
        console.log(`test value ${value} on day ${day.toDateString()}`);
        expect(gir.test(value)).toBe(true);
      }
    }
    done();
  });
});
