import { LocationArea } from "./LocationService";
import { BloomFilter } from 'bloomfilter';

const BLOOM_FILTERS_PARAMS = {
    sizeInBits: 32*128,
    nbHashes: 12
  };
  
export class BloomFilterService {
    public static convertLocationArea(locationArea: LocationArea): string {
        const sep = '-';
        return `${locationArea.time.toString(16)}${sep}${locationArea.lati.toString(16)}${sep}${locationArea.longi.toString(16)}`
    }
    public static createBloomFilter(locations: LocationArea[]): BloomFilter {
        const filter = new BloomFilter(BLOOM_FILTERS_PARAMS.sizeInBits, BLOOM_FILTERS_PARAMS.nbHashes);
        for (const area of locations) {
            const code = this.convertLocationArea(area);
            filter.add(code);
        }
        return filter;
    }
}