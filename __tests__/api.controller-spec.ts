// tslint:disable-next-line: no-implicit-dependencies
import supertest = require('supertest');
import api from '../src/api.controller';
import { BloomFilter } from 'bloomfilter';
import { BLOOM_FILTERS_PARAMS } from '../src/gir.service';
import { GlobalInfectionRecord } from '../src/global-infection-record';

describe('Test GET /gir', () => {
  test('Check return a JSON object', done => {
    const url = '/gir';
    const httpRequest = supertest(api)
      .get(url)
      .then(res => {
        expect(res.status).toEqual(200);
        expect(res.header['content-type']).toMatch(/application\/json/);
        const info = res.body;
        expect(info).toBeDefined();
        expect(info.minDay).toBeDefined();
        expect(info.maxDay).toBeDefined();
        expect(info.bloomFilter).toBeDefined();
        done();
      });
  });
});

describe('Test GET /gir/:day/:index', () => {
  test('Check error record not found', done => {
    const day = 12345;
    const index = 0;
    const url = `/gir/${day}/${index}`;
    const httpRequest = supertest(api)
      .get(url)
      .then(res => {
        expect(res.status).toEqual(404);
        expect(res.header['content-type']).toMatch(/text\/html/);
        expect(res.text).toMatch(/No record found for day 12345 with index 0/);
        done();
      });
  });
});

describe('Test GET /gir/:day/count', () => {
  test('Check return -1 if record not found', done => {
    const day = 12345;
    const url = `/gir/${day}/count`;
    const httpRequest = supertest(api)
      .get(url)
      .then(res => {
        expect(res.status).toEqual(200);
        expect(res.body.count).toBeDefined();
        expect(res.body.count).toEqual(-1);
        done();
      });
  });
});

describe('Test actions sequence 1', () => {
  test('Merge a record', done => {
    const day = 12345;
    const url = `/gir/${day}`;
    const bloomFilter = new BloomFilter(
      BLOOM_FILTERS_PARAMS.sizeInBits,
      BLOOM_FILTERS_PARAMS.nbHashes
    );
    const values = [45678, 56789, 67890, 78901];
    for (const value of values) {
      bloomFilter.add(value);
    }
    const buckets = [].slice.call(bloomFilter.buckets);
    // const data = JSON.stringify(bloomFilter.buckets);
    const httpRequest = supertest(api)
      .put(url)
      .send(buckets)
      .then(res => {
        expect(res.status).toEqual(200);
        const url2 = `/gir/${day}/count`;
        supertest(api)
          .get(url2)
          .then(res => {
            expect(res.status).toEqual(200);
            expect(res.body.count).toBeDefined();
            expect(res.body.count).toEqual(1);
            done();
          })
          .catch(e => console.error(e));
      });
  });
  test('Test a record', done => {
    const day1 = 12345;
    const day2 = 12346;
    const values = [45678, 56789, 67890, 78901];
    const bloomFilter = new BloomFilter(
      BLOOM_FILTERS_PARAMS.sizeInBits,
      BLOOM_FILTERS_PARAMS.nbHashes
    );
    for (const value of values) {
      bloomFilter.add(value);
    }
    const buckets = [].slice.call(bloomFilter.buckets);
    supertest(api)
      .put(`/gir/${day2}`)
      .send(buckets)
      .then(res => {
        expect(res.status).toEqual(200);
        supertest(api)
          .get(`/gir/${day1}/0`)
          .then(res => {
            expect(res.status).toEqual(200);
            const buckets2 = res.body;
            expect(buckets2.length).toEqual(buckets.length);
            for (let i = 0; i < buckets.length; i++) {
              expect(buckets2[i]).toEqual(buckets[i]);
            }
            const gir = GlobalInfectionRecord.FromBucket(
              res.body,
              BLOOM_FILTERS_PARAMS.nbHashes
            );
            expect(gir).toBeDefined();
            expect(gir.test(321)).toBe(false);
            for (const value of values) {
              const result = gir.test(value);
              expect(result).toBe(true);
            }
            done();
          })
          .catch(e => console.error(e));
      })
      .catch(e => console.error(e));
  });
});
