import { BloomFilter as BloomFilterJS } from 'bloomfilter';
import { BloomedLocationRecord } from '../_services/privacy.service';

export class BloomFilter {

  bloomFilterJS: BloomFilterJS;
  nbHashes: number;

  public static FromBucket(bucket: number[], nbHashes: number): BloomFilter {
    return new BloomFilter(bucket, nbHashes);
  }

  public constructor(sizeInBits: number | number[], nbHashes: number) {
    this.nbHashes = nbHashes;
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

  public merge(bucketsIN: number[]) {
    const bucketsOUT = this.bloomFilterJS.buckets;
    if (bucketsIN.length !== bucketsOUT.length) {
      throw new Error('Unable to merge 2 BloomFilter of different sizes');
    }
    for (let i = 0; i < bucketsIN.length; i++) {
      // tslint:disable-next-line: no-bitwise
      bucketsOUT[i] |= bucketsIN[i];
    }
  }

  public get buckets(): number[] {
    return [].slice.call(this.bloomFilterJS.buckets);
  }
}
