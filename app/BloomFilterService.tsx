import { LocationArea } from './LocationArea';
import { BloomFilter } from 'bloomfilter';

export class BloomFilterService {
    public static convertLocationArea(locationArea: LocationArea): string {
        const sep = '-';
        return `${locationArea.time.toString(16)}${sep}${locationArea.lati.toString(16)}${sep}${locationArea.longi.toString(16)}`
    }
    public static createBloomFilter(locations: LocationArea[], sizeInBits: number, nbHashes: number): BloomFilter {
        const filter = new BloomFilter(sizeInBits, nbHashes);
        for (const area of locations) {
            const code = this.convertLocationArea(area);
            filter.add(code);
        }
        return filter;
    }
    public static fromBuckets(buckets: number[], nbHashes: number): BloomFilter {
        return new BloomFilter(buckets, nbHashes);
    }

    public static compare(locations: LocationArea[], globalRecord: BloomFilter): number {
        let nbContacts = 0;
        for (const area of locations) {
            const code = this.convertLocationArea(area);
            if (globalRecord.test(code)) {
                nbContacts++;
            }
        }
        return nbContacts;
    }
}