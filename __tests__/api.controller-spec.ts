// tslint:disable-next-line: no-implicit-dependencies
import supertest = require('supertest');
import api = require('../src/api.controller');

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
        expect(info.dayMin).toBeDefined();
        expect(info.dayMax).toBeDefined();
        done();
      });
  });
});

describe('Test GET /gir/:day/:index', () => {
  test('Check error record not found', done => {
    const day = 12345;
    const index= 0;
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
  test('Check return 0 if record not found', done => {
    const day = 12345;
    const url = `/gir/${day}/count`;
    const httpRequest = supertest(api)
      .get(url)
      .then(res => {
        expect(res.status).toEqual(200);
        expect(res.body.count).toBeDefined();
        expect(res.body.count).toEqual(0);
        done();
      });
  });
})
