// tslint:disable-next-line: no-implicit-dependencies
import supertest = require('supertest');
import apiTest = require('../src/apitest');

test('Testing testapi', done => {
  const url = '/test';
  const httpRequest = supertest(apiTest)
    .get(url)
    .then(res => {
      expect(res.status).toEqual(200);
      expect(res.text).toEqual('This is a test');
      done();
    });
});
