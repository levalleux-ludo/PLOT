import express = require('express');

const app = express();

app.get('/gir', (req: express.Request, res: express.Response) => {
  // return infos about the Global Infection Records
  res.status(200).json({
    dayMin: 0,
    // tslint:disable-next-line: object-literal-sort-keys
    dayMax: 0,
  });
});

app.get('/gir/:day(\\d+)/:index(\\d+)', (req: express.Request, res: express.Response) => {
  const day = req.params.day;
  const index = req.params.index;
  // Extract index from request params, if any
  // return URL of the 'index'th record for given day
  res.status(404).send(`No record found for day ${day} with index ${index}`);
});

app.get('/gir/:day(\\d+)/count', (req: express.Request, res: express.Response) => {
  const day = req.params.day;
  // return the number of records for the given day
  res.status(200).send({count: 0});
});

app.put('/gir/:day', (req: express.Request, res: express.Response) => {
  // get data from body
  // merge data into the global infection record of the given day
  res.sendStatus(200);
});

module.exports = app;
