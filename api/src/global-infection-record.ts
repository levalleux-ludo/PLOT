import { BloomFilter as BloomFilterJS } from 'bloomfilter';
import * as fs from 'fs';

const MAX_CONTRIBUTIONS = 1000;

export class GlobalInfectionRecord {
  public static FromBucket(
    bucket: number[],
    nbHashes: number
  ): GlobalInfectionRecord {
    return new GlobalInfectionRecord(bucket, nbHashes);
  }

  public static FromFile(
    filename: string,
    nbHashes: number
  ): GlobalInfectionRecord {
    const data = fs.readFileSync(filename);
    const bucket = new Uint32Array(data.buffer);
    return GlobalInfectionRecord.FromBucket(
      Array.from(bucket.values()),
      nbHashes
    );
  }

  private nbContributions = 0;
  private bloomFilterJS: BloomFilterJS;

  public constructor(sizeInBits: number | number[], nbHashes: number) {
    this.bloomFilterJS = new BloomFilterJS(sizeInBits, nbHashes);
  }

  public add(value: number) {
    // console.log('bloom add', value, BloomedLocationRecord.md_parse(value));
    this.bloomFilterJS.add(value);
  }

  public test(value: number): boolean {
    // console.log('bloom test', value, BloomedLocationRecord.md_parse(value));
    return this.bloomFilterJS.test(value);
  }

  public isFull(): boolean {
    return this.nbContributions >= MAX_CONTRIBUTIONS;
  }

  public merge(data: number[]) {
    if (this.isFull()) {
      throw new Error('Can not add more contribution in this record');
    }
    const bucketsOUT = this.bloomFilterJS.buckets;
    if (data.length !== bucketsOUT.length) {
      throw new Error('Unable to merge 2 BloomFilter of different sizes');
    }
    for (let i = 0; i < data.length; i++) {
      // tslint:disable-next-line: no-bitwise
      bucketsOUT[i] |= data[i];
    }
  }

  public save(filename: string) {
    const array = [].slice.call(this.bloomFilterJS.buckets);
    const data = new Uint32Array(array);
    fs.writeFileSync(filename, data);
  }

  public getBuckets() {
    return this.bloomFilterJS.buckets;
  }
}
