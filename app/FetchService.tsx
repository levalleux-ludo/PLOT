import { BloomFilter } from "bloomfilter";
import { BloomFilterService } from "./BloomFilterService";

const API_HOST = 'http://192.168.1.11:8080';

export interface BloomFilterParams {
    sizeInBits: number;
    nbHashes: number;
}
  
export interface GIRInfos {
    minDay: number;
    maxDay: number;
    bloomFilter: BloomFilterParams;
  }
  
class FetchService {
    public async publishRecord(day: Date, bloomFilter: BloomFilter): Promise<void> {
        const url = `${API_HOST}/gir/${day.valueOf()}`;
        const buckets = [].slice.call(bloomFilter.buckets);
        return new Promise((resolve, reject) => {
            fetch(
                url,
                {
                    method: 'PUT',
                    body: JSON.stringify(buckets),
                    headers: {'Content-Type': 'application/json',  'Access-Control-Allow-Origin': '*' }
                }
            ).then(res => {
                if (res.status >= 400) { // Error
                    reject(res.body);
                } else {
                    resolve();
                }
            }).catch(e => reject(e));
        })
    }

    public async getGIRInfos(): Promise<GIRInfos> {
        const url = `${API_HOST}/gir`
        return new Promise((resolve, reject) => {
            fetch(
                url,
                {
                    method: 'GET'
                }
            ).then(res => {
                res.json().then((data) => {
                    resolve(data);
                }).catch(e => reject(e));
            }).catch(e => reject(e));
        });
    }

    public async getGIR(day: Date): Promise<number[]> {
        const url = `${API_HOST}/gir/${day.valueOf()}/0`;
        return new Promise((resolve, reject) => {
            fetch(
                url,
                {
                    method: 'GET'
                }
            ).then(res => {
                if (res.ok) {
                    res.json().then((data) => {
                        resolve(data);
                    }).catch(e => reject(e));
                } else {
                    res.text().then(text => {
                        const text2 = text;
                        console.error('An error occurred when getting record for day ' + day.toDateString() + ':\n' + text);
                        reject(res.body);
                    }).catch(e => reject(e));
                }
            }).catch(e => reject(e));
        });
    }
}

const fetchService = new FetchService();
export default fetchService;