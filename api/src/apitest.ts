import apiTest = require('express');

const app = apiTest();

app.get('/test', test);

function test(req: apiTest.Request, res: apiTest.Response) {
  res.status(200).send('This is a test');
}

module.exports = app;
