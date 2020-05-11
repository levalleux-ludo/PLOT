import { GlobalInfectionRecord } from '../src/global-infection-record';
import * as fs from 'fs';
import * as path from 'path';

const BLOOM_FILTERS_PARAMS = {
  sizeInBits: 32 * 1024,
  nbHashes: 12,
};

describe('GlobalInfectionRecord test', () => {
  it('create a GlobalInfectionRecord', done => {
    const gir = new GlobalInfectionRecord(
      BLOOM_FILTERS_PARAMS.sizeInBits,
      BLOOM_FILTERS_PARAMS.nbHashes
    );
    expect(gir).toBeDefined();
    done();
  });
  it('add a value and test it', done => {
    const value1 = 12345;
    const value2 = 54321;
    const gir = new GlobalInfectionRecord(
      BLOOM_FILTERS_PARAMS.sizeInBits,
      BLOOM_FILTERS_PARAMS.nbHashes
    );
    gir.add(value1);
    expect(gir.test(value1)).toBe(true);
    expect(gir.test(value2)).toBe(false);
    done();
  });
  it('merge a bucket and test it', done => {
    const value1 = 12345;
    const value2 = 54321;
    const value3 = 98765;
    const gir1 = new GlobalInfectionRecord(
      BLOOM_FILTERS_PARAMS.sizeInBits,
      BLOOM_FILTERS_PARAMS.nbHashes
    );
    gir1.add(value1);
    const gir2 = new GlobalInfectionRecord(
      BLOOM_FILTERS_PARAMS.sizeInBits,
      BLOOM_FILTERS_PARAMS.nbHashes
    );
    gir2.add(value2);
    expect(gir2.test(value1)).toBe(false);
    expect(gir2.test(value2)).toBe(true);
    expect(gir2.test(value3)).toBe(false);
    gir2.merge(Array.from(gir1.getBuckets().values()));
    expect(gir2.test(value1)).toBe(true);
    expect(gir2.test(value2)).toBe(true);
    expect(gir2.test(value3)).toBe(false);
    done();
  });
  it('Save a record into a file', done => {
    const value1 = 12345;
    const value2 = 54321;
    const value3 = 98765;
    const folder = './tmp';
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder);
    }
    const filename = path.join('./tmp', 'test.dat');
    const gir1 = new GlobalInfectionRecord(
      BLOOM_FILTERS_PARAMS.sizeInBits,
      BLOOM_FILTERS_PARAMS.nbHashes
    );
    gir1.add(value1);
    gir1.save(filename);
    expect(fs.existsSync(filename)).toBe(true);
    done();
  });
  it('Load a record from a file', done => {
    const value1 = 12345;
    const value2 = 54321;
    const value3 = 98765;
    const folder = './tmp';
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder);
    }
    const filename = path.join('./tmp', 'test.dat');
    const gir1 = new GlobalInfectionRecord(
      BLOOM_FILTERS_PARAMS.sizeInBits,
      BLOOM_FILTERS_PARAMS.nbHashes
    );
    gir1.add(value1);
    gir1.save(filename);
    const gir2 = GlobalInfectionRecord.FromFile(
      filename,
      BLOOM_FILTERS_PARAMS.nbHashes
    );
    expect(gir2).toBeDefined();
    expect(gir2.getBuckets().length).toEqual(gir1.getBuckets().length);
    expect(gir2.test(value1)).toBe(true);
    expect(gir2.test(value2)).toBe(false);
    done();
  });
});
